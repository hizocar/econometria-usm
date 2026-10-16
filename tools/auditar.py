"""Audita que las páginas publicadas contengan todo el texto de las diapositivas oficiales.

    mkdocs build --site-dir site && python3 tools/auditar.py [site]

Para cada lámina de cada .tex (definidos en tools/clases.py) toma sus palabras de contenido
(sin comandos LaTeX) y mide qué fracción aparece en el HTML de la clase. Una lámina bajo 100%
indica texto omitido o modificado; se listan las palabras que faltan.
"""
import html
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from clases import CLASES, SLIDES  # noqa: E402
from tex2md import frames  # noqa: E402

STOP = set("""a al algo como con cual cuando de del el en es esta este esto la las lo los mas me
mi muy no o para pero por que se si sin sobre su sus te un una uno y ya hay son ser fue era
entre tambien solo otra otro otras otros cada todo todos toda todas puede pueden""".split())


def norm(s):
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower()


def palabras_tex(block):
    b = re.sub(r"\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}", " ", block, flags=re.S)
    b = re.sub(r"\\(begin|end|color|textcolor|label|tag)\{[^}]*\}", " ", b)
    b = re.sub(r"\\'([aeiou])", r"\1", b)
    b = re.sub(r"\\(href|includegraphics)(\[[^\]]*\])?\{[^}]*\}", " ", b)
    b = re.sub(r"\\[a-zA-Z]+\*?", " ", b)
    return [w for w in (norm(x) for x in re.findall(r"[a-zA-ZáéíóúñÁÉÍÓÚÑü]{4,}", b)) if w not in STOP]


def palabras_html(path):
    t = Path(path).read_text(encoding="utf-8")
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", t, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return set(norm(w) for w in re.findall(r"[a-zA-ZáéíóúñÁÉÍÓÚÑü]{4,}", t))


def main():
    site = Path(sys.argv[1] if len(sys.argv) > 1 else "site")
    total = completas = 0
    for n, cfg in CLASES.items():
        pagina = palabras_html(site / "clases" / f"clase{n}" / "index.html")
        for tex, _ in cfg["fuentes"]:
            print(f"== Clase {n} · {tex}")
            for i, (titulo, cuerpo) in enumerate(frames(SLIDES / tex), 1):
                w = palabras_tex(cuerpo)
                if not w:
                    continue
                total += 1
                faltan = sorted(set(x for x in w if x not in pagina))
                if faltan:
                    cov = 1 - sum(x not in pagina for x in w) / len(w)
                    print(f"   lámina {i:2d} ({cov:4.0%}) {titulo[:40]!r}: faltan {' '.join(faltan[:12])}")
                else:
                    completas += 1
    print(f"\n{completas} de {total} láminas con el 100% de su texto en el sitio.")


if __name__ == "__main__":
    main()
