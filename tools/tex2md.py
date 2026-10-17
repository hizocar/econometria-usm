"""Convierte presentaciones beamer (.tex) del curso a Markdown para MkDocs, frame por frame.

El contenido de cada frame se traduce con pandoc (incluido en Quarto) sin reescribirlo: el texto,
las fórmulas y el orden quedan tal como en las diapositivas. Solo se adapta la forma:

- cada frame se convierte en una sección con su título original;
- las figuras se copian a docs/images/ y se enlazan;
- las fórmulas display que pandoc deja al final de una línea se mueven a su propio bloque
  (requisito de pymdownx.arithmatex);
- los dibujos TikZ se reemplazan por la figura equivalente que define clases.py (TIKZ);
- los resaltados {\\color{blue} ...} fuera de fórmulas se muestran en negrita.

Los frames comentados con % en el .tex no se publican (tampoco aparecen en el PDF).
"""
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

MATH_RE = re.compile(
    r"\$\$.*?\$\$|(?<!\\)\$.*?(?<!\\)\$|\\\[.*?\\\]|\\begin\{(equation|eqnarray|align|gather)\*?\}.*?\\end\{\1\*?\}",
    re.S,
)


def strip_comments(src):
    out = []
    for line in src.splitlines():
        m = re.search(r"(?<!\\)%", line)
        out.append(line[: m.start()] if m else line)
    return "\n".join(out)


def match_brace(s, i):
    """Índice de la llave que cierra la que abre en s[i]."""
    depth = 0
    for j in range(i, len(s)):
        if s[j] == "{" and (j == 0 or s[j - 1] != "\\"):
            depth += 1
        elif s[j] == "}" and s[j - 1] != "\\":
            depth -= 1
            if depth == 0:
                return j
    return len(s) - 1


def in_math(spans, i):
    return any(a <= i < b for a, b in spans)


def colors_to_bold(s):
    """{\\color{x} texto} y \\color{x}{texto} fuera de fórmulas -> \\textbf{texto}."""
    while True:
        spans = [m.span() for m in MATH_RE.finditer(s)]
        done = True
        for m in re.finditer(r"\{\\color\{[a-z]+\}|\\(?:text)?color\{[a-z]+\}\s*\{", s):
            if in_math(spans, m.start()):
                continue
            if m.group(0).startswith("{"):
                end = match_brace(s, m.start())
                inner = s[m.end():end]
                s = s[: m.start()] + r"\textbf{" + inner + "}" + s[end + 1:]
            else:
                open_i = m.end() - 1
                end = match_brace(s, open_i)
                s = s[: m.start()] + r"\textbf{" + s[open_i + 1:end] + "}" + s[end + 1:]
            done = False
            break
        if done:
            # \color{x} suelto (sin llaves de agrupación) fuera de fórmulas: se descarta
            spans = [m.span() for m in MATH_RE.finditer(s)]
            out, last = [], 0
            for m in re.finditer(r"\\color\{[a-z]+\}", s):
                if not in_math(spans, m.start()):
                    out.append(s[last:m.start()])
                    last = m.end()
            out.append(s[last:])
            return "".join(out)


def sections(body):
    """Documentos tipo artículo (guías, ejercicios): cada \\section es una "lámina"."""
    body = body.split(r"\end{document}", 1)[0]
    body = re.sub(r"\\maketitle|\\vspace\*?\{[^}]*\}", "", body)
    partes = re.split(r"\\section\*?\{", body)
    res = []
    intro = partes[0].strip()
    if re.search(r"[A-Za-zÁÉÍÓÚáéíóú]{3,}", re.sub(r"\\[a-zA-Z]+", "", intro)):
        res.append(("", intro))
    for parte in partes[1:]:
        end = match_brace("{" + parte, 0) - 1
        res.append((parte[:end].strip(), parte[end + 1:]))
    return res


def frames(tex_path):
    """Lista de (título, cuerpo LaTeX) de los frames no comentados, sin la portada.
    Si el archivo no es beamer (no tiene frames), devuelve sus secciones."""
    src = strip_comments(Path(tex_path).read_text(encoding="utf-8"))
    body = src.split(r"\begin{document}", 1)[-1]
    if r"\begin{frame}" not in body:
        return sections(body)
    res = []
    for m in re.finditer(r"\\begin\{frame\}(.*?)\\end\{frame\}", body, re.S):
        block = m.group(1)
        if r"\titlepage" in block:
            continue
        opt = re.match(r"\s*\[[^\]]*\]", block)  # opciones del frame, p. ej. [shrink=10]
        if opt:
            block = block[opt.end():]
        title = ""
        t = re.match(r"\s*(?:\[[^\]]*\])?\s*\{", block)
        if t:
            end = match_brace(block, t.end() - 1)
            title = block[t.end():end]
            block = block[end + 1:]
        ft = re.search(r"\\frametitle\{", block)
        if ft:
            end = match_brace(block, ft.end() - 1)
            title = block[ft.end():end]
            block = block[: ft.start()] + block[end + 1:]
        res.append((title.strip(), block))
    return res


def unwrap(block, cmd, nargs):
    """\\cmd{a}{b}{contenido} -> contenido (p. ej. \\resizebox, que pandoc descarta entero)."""
    while True:
        m = re.search(r"\\" + cmd + r"\s*\{", block)
        if not m:
            return block
        i = m.end() - 1
        for _ in range(nargs):
            i = match_brace(block, i) + 1
            while i < len(block) and block[i] in " \t\n%":
                i += 1
        end = match_brace(block, i)
        block = block[:m.start()] + block[i + 1:end] + block[end + 1:]


def preprocess(block, tikz_counter):
    def tikz(_m):
        tikz_counter[0] += 1
        return f"\n\nTIKZFIGURA{tikz_counter[0]}\n\n"

    block = re.sub(r"\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}", tikz, block, flags=re.S)
    block = unwrap(block, "resizebox", 2)
    # figure/columns solo dan formato en beamer; sin ellos pandoc genera Markdown simple
    block = re.sub(r"\\begin\{figure\}(\[[^\]]*\])?|\\end\{figure\}|\\caption\{[^}]*\}|\\label\{[^}]*\}", "", block)
    block = re.sub(r"\\begin\{columns\}|\\end\{columns\}|\\column\{[^}]*\}", "\n\n", block)
    # "[\hat\beta_0] : ..." al inicio de equation* no es un argumento opcional
    block = re.sub(r"(\\begin\{equation\*?\}\s*)\[", r"\1{}[", block)
    block = re.sub(r"\\beamergotobutton\{([^}]*)\}", r"\1", block)
    block = re.sub(r"\\begin\{block\}\{([^}]*)\}", r"\\textbf{\1}\n\n", block)
    block = re.sub(r"\\end\{block\}", "", block)
    block = re.sub(r"\\logo\{[^}]*\}", "", block)
    block = re.sub(r"\\(Fontvi|small|footnotesize|scriptsize|centering)\b", "", block)
    return colors_to_bold(block)


def title_md(title):
    """Título de frame (LaTeX) -> texto plano con fórmulas inline."""
    t = title.replace("\\\\", " ").replace("\n", " ")
    t = re.sub(r"\\'\{?([aeiouAEIOU])\}?", lambda m: m.group(1).translate(str.maketrans("aeiouAEIOU", "áéíóúÁÉÍÓÚ")), t)
    t = t.replace("\\%", "%")
    t = re.sub(r"\s+", " ", t).strip()
    # Títulos en mayúsculas de las diapositivas -> formato oración (mismo texto)
    letters = [c for c in re.sub(r"\$.*?\$", "", t) if c.isalpha()]
    if letters and sum(c.isupper() for c in letters) / len(letters) > 0.8:
        parts = re.split(r"(\$.*?\$)", t)
        t = "".join(p if p.startswith("$") else p.lower() for p in parts)
        t = t[0].upper() + t[1:]
    for sig in ("IC", "TCL", "RLS", "MCO", "ATE", "ATT", "FRP", "FRM"):
        t = re.sub(rf"\b{sig.lower()}\b", sig, t, flags=re.I)
    return t


def fix_display_math(md):
    """Mueve $$...$$ que quedan dentro de una línea de texto a su propio bloque, con la sangría
    del ítem de lista al que pertenecen."""
    out = []
    lines = md.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        if "$$" not in line:
            out.append(line)
            i += 1
            continue
        # junta líneas hasta cerrar todos los $$
        buf = line
        while buf.count("$$") % 2 == 1 and i + 1 < len(lines):
            i += 1
            buf += "\n" + lines[i]
        i += 1
        lead = re.match(r"\s*", buf).group(0)
        bullet = re.match(r"\s*(?:[-*+]|\d+[.)])\s+", buf)
        indent = " " * len(bullet.group(0)) if bullet else lead
        pieces = re.split(r"(\$\$.*?\$\$)", buf, flags=re.S)
        first = True
        for p in pieces:
            if not p.strip():
                continue
            if p.startswith("$$"):
                inner = p[2:-2].strip()
                inner = "\n".join(l.strip() for l in inner.split("\n"))
                if not first and out and re.fullmatch(r"\s*(?:[-*+]|\d+[.)])\s*", out[-1]):
                    # la viñeta quedó vacía: la fórmula es su contenido
                    out[-1] = out[-1].rstrip() + "   $$"
                    out.extend(indent + l for l in inner.split("\n"))
                    out.append(indent + "$$")
                    out.append("")
                    first = False
                    continue
                if first:
                    if out and out[-1].strip():
                        out.append("")  # un bloque $$ debe ir separado del párrafo anterior
                    out.append(lead + "$$")
                else:
                    out.append("")
                    out.append(indent + "$$")
                out.extend(indent + l for l in inner.split("\n"))
                out.append(indent + "$$")
                out.append("")
            else:
                txt = p.strip("\n")
                if first:
                    out.append(txt.rstrip())
                else:
                    out.append("")
                    out.append(indent + txt.strip())
            first = False
    return re.sub(r"\n{3,}", "\n\n", "\n".join(out))


RENDER_FIXES = {
    "estadśticamente": "estadísticamente",  # "estad\\'sticamente" en el .tex
}


def promote_header(md):
    """Tablas cuya fila de encabezado quedó vacía: la primera fila de datos pasa a encabezado."""
    lines = md.split("\n")
    i = 0
    while i < len(lines) - 2:
        head, sep, first = lines[i], lines[i + 1], lines[i + 2]
        empty_head = re.fullmatch(r"\|+", head.replace(" ", "")) is not None
        if empty_head and re.fullmatch(r"\|(:?-+:?\|)+", sep.replace(" ", "")) and first.startswith("|"):
            lines[i:i + 3] = [first, sep]
        i += 1
    return "\n".join(lines)


def separate_lists(md):
    """Python-Markdown fusiona una lista numerada con una de viñetas que la sigue (y viceversa).
    Se intercala un comentario HTML cuando cambia el tipo de lista en el nivel superior."""
    out, last = [], None
    for line in md.split("\n"):
        kind = "ol" if re.match(r"\d+[.)]\s", line) else "ul" if re.match(r"[-*+]\s", line) else None
        if kind:
            if last and last != kind:
                out.extend(["<!-- -->", ""])
            last = kind
        elif line.strip() and not line.startswith((" ", "\t")):
            last = None  # un párrafo de nivel superior ya separa las listas
        out.append(line)
    return "\n".join(out)


def cleanup(md):
    md = md.replace("****", "**").replace('\\"', '"')
    # Pandoc separa dos listas seguidas con un comentario; se conserva para que no se fusionen
    md = re.sub(r"```\{=html\}\s*<!-- -->\s*```", "<!-- -->", md)
    md = separate_lists(md)
    md = re.sub(r"(?m)^\s*</?div[^>]*>\s*$", "", md)
    md = re.sub(r"(?m)^\s*\\\s*$", "", md)          # líneas que solo tienen "\"
    md = re.sub(r"(?m)(?<!\\)\\[ ]*$", "<br>", md)   # "\" al final de línea = salto de línea
    for a, b in RENDER_FIXES.items():
        md = md.replace(a, b)
    return promote_header(md)


def run_pandoc(tex):
    with tempfile.TemporaryDirectory() as d:
        src = Path(d) / "in.tex"
        src.write_text("\\documentclass{article}\\begin{document}\n" + tex + "\n\\end{document}", encoding="utf-8")
        fmt = "markdown+tex_math_dollars-header_attributes-link_attributes-bracketed_spans-native_spans-fenced_divs-native_divs-simple_tables-multiline_tables-grid_tables+pipe_tables-raw_tex"
        out = Path(d) / "out.md"
        # Se escribe a archivo: "quarto pandoc" redirige la salida estándar de pandoc a stderr.
        subprocess.run(
            ["quarto", "pandoc", str(src), "-f", "latex", "-t", fmt, "--wrap=none", "-o", str(out)],
            capture_output=True, text=True, check=True,
        )
        return out.read_text(encoding="utf-8")


def convert(tex_path, repo_root, tex_root, img_prefix="../images/"):
    """Devuelve [(título_md, cuerpo_md)] para cada frame, copiando las imágenes usadas."""
    fr = frames(tex_path)
    joined = []
    counter = [0]
    for k, (_, body) in enumerate(fr):
        joined.append(f"\\section*{{FRAMESEP{k}}}\n" + preprocess(body, counter))
    md = run_pandoc("\n".join(joined))
    chunks = re.split(r"^# FRAMESEP(\d+)\s*$", md, flags=re.M)
    bodies = {int(chunks[i]): chunks[i + 1] for i in range(1, len(chunks), 2)}
    out = []
    for k, (title, _) in enumerate(fr):
        body = bodies.get(k, "")

        def img(m):
            rel = m.group(2).replace("//", "/")
            src = (Path(tex_root) / rel)
            if not src.exists():
                for ext in (".png", ".jpg", ".jpeg"):
                    if (Path(tex_root) / (rel + ext)).exists():
                        src = Path(tex_root) / (rel + ext)
            name = re.sub(r"[^a-zA-Z0-9_.-]", "_", str(src.relative_to(tex_root)).replace("/", "_")).lower()
            dest = Path(repo_root) / "docs" / "images" / "slides" / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dest)
            return f'![{title_md(title)}]({img_prefix}slides/{name}){{ .econ-slide-img }}'

        body = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", img, body)
        body = re.sub(r'<img src="()([^"]+)"[^>]*/>', img, body)
        body = re.sub(r"\[(Colab|Excel)\]\((https?://[^)]+)\)", r"[\1](\2){ .usm-btn target=_blank }", body)
        body = cleanup(body)
        body = fix_display_math(body).strip()
        out.append((title_md(title), body))
    return out
