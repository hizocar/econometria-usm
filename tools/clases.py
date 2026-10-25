"""Genera docs/clases/claseN.md a partir de las diapositivas oficiales de cada semana.

    python3 tools/clases.py            # todas las clases
    python3 tools/clases.py 2          # solo la clase 2

La teoría viene íntegra y en orden desde los .tex de ../semN/ (ver tex2md.py). Este archivo solo
define, por clase:
  - CABECERA / CIERRE: objetivos, agenda, autoevaluación y lecturas (complementos);
  - INSERTAR[(tex, n)]: material interactivo que va DESPUÉS de la lámina n de ese .tex;
  - PLEGAR[(tex, n)]: láminas de solución que se muestran desplegables (mismo texto);
  - TIKZ[(tex, k)]: figura equivalente a la k-ésima figura TikZ del .tex.

Los números de lámina son los del inventario (python3 tools/clases.py --inventario).
No edites a mano los .md generados: cambia este archivo o los .tex y vuelve a generar.
"""
import html
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from tex2md import convert, frames, title_md  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
SLIDES = REPO.parent  # carpeta con sem1/, sem2/, ...


def widget(name):
    return f'<div class="econ-widget" data-widget="{name}"></div>'


def quiz(pregunta, opciones, correcta, feedback):
    """Pregunta de selección múltiple. Cada opción es un texto o (texto, por qué es incorrecta)."""
    ops = []
    for i, o in enumerate(opciones):
        txt, why = o if isinstance(o, tuple) else (o, "")
        attrs = (" data-correct" if i == correcta else "") + (f' data-why="{html.escape(why)}"' if why else "")
        ops.append(f'<button class="econ-quiz-opt"{attrs}>{txt}</button>')
    ops = "\n".join(ops)
    return (f'<div class="econ-quiz">\n<p class="econ-quiz-q">{pregunta}</p>\n'
            f'<div class="econ-quiz-opts">\n{ops}\n</div>\n<p class="econ-quiz-fb">✅ {feedback}</p>\n</div>')


def complemento(titulo, cuerpo):
    """Bloque añadido (no está en las diapositivas), marcado como tal."""
    lines = "\n".join("    " + l if l else "" for l in cuerpo.strip().split("\n"))
    return f'!!! tip "Complemento · {titulo}"\n{lines}'


def ar(tex):
    """Fórmula inline dentro de HTML crudo (MathJax procesa la clase arithmatex)."""
    return f'<span class="arithmatex">\\({tex}\\)</span>'


# --------------------------------------------------------------------------------------------
# Temas: la clase se recorre en temas (grupos de láminas consecutivas). Cada tema abre con un
# encabezado y una pregunta guía, y cierra con preguntas de práctica y un ejercicio de R.
# --------------------------------------------------------------------------------------------
def tema_encabezado(t):
    ayud = " .is-ayudantia" if t.get("ayudantia") else ""
    attrs = (f'{{ #tema-{t["n"]} .econ-tema{ayud} data-num="{t["n"]}" data-laminas="{t["laminas"]}" '
             f'data-toc-label="Tema {t["n"]} · {t["corto"]}" }}')
    return f'### {t["titulo"]} {attrs}\n\n<p class="econ-tema-q">{t["pregunta"]}</p>'


def practica(t):
    qs = "\n".join(quiz(*q) for q in t["quiz"])
    return (f'<div class="econ-practica" id="practica-{t["n"]}">\n'
            f'<p class="econ-practica-t"><span>✍️ Practica · Tema {t["n"]}</span></p>\n{qs}\n</div>')


def r_ejercicio(t):
    titulo, enunciado, codigo, reto = t["r"]
    return (f'<div class="econ-r" markdown>\n\n<p class="econ-r-t">🧪 Practica en R · {titulo}</p>\n\n{enunciado}\n\n'
            f'```r\n{codigo.strip()}\n```\n\n**🎯 Reto:** {reto}\n{{: .econ-r-reto }}\n\n</div>')


def ruta(temas, receso_tras, cierre, previo=None):
    """Agenda visual de la cátedra: un paso por tema, con enlace, láminas y lo que trae para practicar.
    Los temas de ayudantía van en una lista aparte, sin horario (se ven otro día)."""
    def fila(t, hora):
        extra = f'✍️ {len(t["quiz"])} preguntas' + (" · 🧪 R" if t.get("r") else "")
        return (f'<li><span class="econ-ruta-h">{hora}</span><a class="econ-ruta-a" href="#tema-{t["n"]}">'
                f'<span class="econ-ruta-n">{t["n"]}</span><span class="econ-ruta-t">{t["titulo"]}</span>'
                f'<span class="econ-ruta-l">{t["laminas"]} · {extra}</span></a></li>')
    pausa = lambda h, txt: f'<li class="is-break"><span class="econ-ruta-h">{h}</span><span class="econ-ruta-t">{txt}</span></li>'
    filas = [pausa(*previo)] if previo else []
    for t in (t for t in temas if not t.get("ayudantia")):
        filas.append(fila(t, t["hora"]))
        if t["n"] == receso_tras[0]:
            filas.append(pausa(receso_tras[1], "☕ Receso"))
    filas.append(pausa(*cierre))
    out = '<ol class="econ-ruta">\n' + "\n".join(filas) + "\n</ol>"
    ayud = [t for t in temas if t.get("ayudantia")]
    if ayud:
        out += ('\n\n<p class="econ-ruta-sub">📘 <strong>Ayudantía</strong> · se trabaja otro día de la semana, no en la cátedra del viernes</p>\n'
                '<ol class="econ-ruta is-ayudantia">\n' + "\n".join(fila(t, "") for t in ayud) + "\n</ol>")
    return out


def como_estudiar(n, temas):
    """Recuadro inicial que explica la estructura por temas de la clase."""
    nr = sum(1 for t in temas if t.get("r"))
    return ('!!! example "Cómo estudiar esta clase"\n'
            f'    La clase está ordenada en **{len(temas)} temas**. Cada tema parte con una **pregunta guía**, sigue con las láminas\n'
            '    y los simuladores, y termina con **✍️ preguntas de selección múltiple** (cada alternativa incorrecta explica\n'
            f'    por qué no lo es){(" y un" if nr == len(temas) else " y, en casi todos, un") + " **🧪 ejercicio de R** que puedes editar y ejecutar aquí mismo, sin instalar nada" if nr else ""}.\n'
            + (f'    Los {nr} ejercicios de R en un solo archivo: [📥 clase{n}.R](../r/clase{n}.R).\n' if nr else ""))


def script_r(temas, titulo):
    partes = [f"# {titulo}\n# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).\n"
              "# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/\n"]
    for t in temas:
        if t.get("r"):
            nombre, _, codigo, reto = t["r"]
            reto_txt = reto.replace("`", "")
            partes.append(f"# {'=' * 76}\n# Tema {t['n']} · {nombre}\n# {'=' * 76}\n{codigo.strip()}\n\n# Reto: {reto_txt}\n")
    return "\n".join(partes)


# --------------------------------------------------------------------------------------------
# Figuras TikZ re-dibujadas (mismo contenido que en las diapositivas)
# --------------------------------------------------------------------------------------------
RED, BLUE, GREEN, BROWN = "#d62828", "#1d4ed8", "#2a9d55", "#8b5a2b"


def svg_estratos():
    rows = ""
    for i, col in enumerate([GREEN, BLUE, RED]):  # tikz dibuja de abajo hacia arriba: red abajo
        y = 18 + i * 34
        rows += f'<rect x="6" y="{y - 14}" width="118" height="28" fill="none" stroke="currentColor"/>'
        rows += "".join(f'<circle cx="{24 + j * 40}" cy="{y}" r="9" fill="{col}" stroke="currentColor"/>' for j in range(3))
    return f'<svg class="econ-tikz-svg" viewBox="0 0 130 112" role="img" aria-label="Tres estratos homogéneos, uno por color">{rows}</svg>'


def svg_conglomerados():
    g = ""
    for k in range(3):
        x = 10 + k * 76
        g += f'<rect x="{x}" y="6" width="58" height="58" fill="none" stroke="currentColor" stroke-width="2"/>'
        g += f'<circle cx="{x + 12}" cy="35" r="9" fill="{RED}"/><circle cx="{x + 29}" cy="18" r="9" fill="{BLUE}"/>'
        g += f'<circle cx="{x + 46}" cy="35" r="9" fill="{GREEN}"/><circle cx="{x + 29}" cy="52" r="9" fill="{BLUE}"/>'
    return f'<svg class="econ-tikz-svg" viewBox="0 0 240 70" role="img" aria-label="Tres conglomerados heterogéneos con varios colores cada uno">{g}</svg>'


def svg_dag(x2y=False, x2x1=False):
    """Diagramas de la lámina 'Sesgo por omisión de variable' (Clase 4)."""
    mid = f"{int(x2y)}{int(x2x1)}"
    mk = ('<marker id="ah{c}{id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
          '<path d="M0,0 L10,5 L0,10 z" fill="{col}"/></marker>')
    d = "<defs>" + mk.format(c="b", id=mid, col=BROWN) + mk.format(c="r", id=mid, col=RED) + "</defs>"
    d += '<text x="14" y="24" font-weight="700" fill="currentColor">X1</text><text x="150" y="24" font-weight="700" fill="currentColor">Y</text><text x="84" y="84" font-weight="700" fill="currentColor">X2</text>'
    d += f'<line x1="38" y1="20" x2="142" y2="20" stroke="{BROWN}" stroke-width="2.5" marker-end="url(#ahb{mid})"/>'
    if x2y:
        d += f'<line x1="102" y1="70" x2="148" y2="30" stroke="{RED}" stroke-width="2.5" marker-end="url(#ahr{mid})"/>'
        d += f'<text x="132" y="62" fill="{RED}" font-style="italic">β₂</text>'
    if x2x1:
        d += f'<line x1="82" y1="70" x2="34" y2="30" stroke="{RED}" stroke-width="2.5" marker-end="url(#ahr{mid})"/>'
        d += f'<text x="36" y="62" fill="{RED}" font-style="italic">δ</text>'
    return f'<svg class="econ-tikz-svg econ-dag" viewBox="0 0 170 92" role="img" aria-label="Diagrama causal entre X1, X2 e Y">{d}</svg>'


ARBOL_CAUSAL = f"""<div class="econ-tikz-tree">
<div class="t-root">Individuo {ar('i')}</div>
<div class="t-row"><span>↙</span><span>↘</span></div>
<div class="t-row"><div>{ar('T_i=1')}: observamos {ar('Y_i^{T}')}</div><div>{ar('T_i=0')}: observamos {ar('Y_i^{NT}')}</div></div>
<div class="t-row t-cf"><span>⇣</span><span>⇣</span></div>
<div class="t-row t-cf"><div>{ar('Y_i^{NT}')} contrafactual</div><div>{ar('Y_i^{T}')} contrafactual</div></div>
</div>"""

# Láminas SIN título en el .tex que inician un tema nuevo: título para su tarjeta (el contenido no cambia).
# Las láminas sin título que continúan el tema anterior se dejan en la misma tarjeta.
TITULOS = {
    ("sem1/clase1.tex", 20): "Estadística descriptiva e inferencial",
}

TIKZ = {
    ("sem1/clase1.tex", 1): svg_estratos(),
    ("sem1/clase1.tex", 2): svg_conglomerados(),
    ("sem3/Clase3.tex", 1): ARBOL_CAUSAL,
    ("sem3/Clase4.tex", 1): svg_dag(x2y=True),
    ("sem3/Clase4.tex", 2): svg_dag(x2x1=True),
    ("sem3/Clase4.tex", 3): svg_dag(x2y=True, x2x1=True),
}

# --------------------------------------------------------------------------------------------
# Clase 1 · Semana 1
# --------------------------------------------------------------------------------------------
C1_CABECERA = """# Clase 1 · Introducción y repaso de estadística

<div class="usm-session-meta">
<span>📅 Viernes 16 de octubre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Semana 1 · Contenidos 1, 2 y 3 del programa</span>
</div>

!!! info "Contenido oficial de la semana"
    Esta página reproduce **íntegras y en orden** las diapositivas de la semana 1 (`sem1/`).
    **Cátedra del viernes:** Parte 1 (`clase1.tex`). **Ayudantía:** Partes 2 y 3
    (`repaso_ayudantia.tex` y `repaso_estadistica.tex`), que se ven otro día. Los bloques
    **Interactivo**, los casos y las preguntas de autoevaluación son material adicional para
    estudiar; las soluciones de los ejemplos aparecen plegadas para que intentes resolverlos antes.

<!--COMO-ESTUDIAR-->

## 🎯 Objetivos de la sesión

**Cátedra (viernes)**

- Entender qué es la econometría y qué tipo de preguntas permite responder.
- Distinguir **correlación** de **causalidad** y el rol del supuesto *ceteris paribus*.
- Reconocer los tipos de datos y los métodos de muestreo.

**Ayudantía**

- Repasar estadística descriptiva (localización, dispersión, histograma y boxplot) e inferencial
  (TCL e intervalos de confianza para medias, proporciones y diferencias de medias).

## 🗓️ Agenda de la cátedra (viernes 18:40 – 21:25)

Haz clic en un tema para ir directo a él.
"""

C1_CIERRE = """!!! abstract "🧠 Ideas clave"
    - La econometría combina **teoría económica y estadística** para describir relaciones, estimar efectos causales y predecir.
    - **Correlación no es causalidad**: un efecto causal compara situaciones *ceteris paribus* (helados, tiburones y temperatura).
    - Los datos pueden ser **experimentales u observacionales**, y de **corte transversal, series de tiempo o panel**.
    - Lo que hace representativa a una muestra es **cómo se elige** (aleatoriamente), no su tamaño: la sopa revuelta y el Literary Digest.
    - *Ayudantía:* por el **TCL**, $\\bar{X}$ es aproximadamente $N(\\mu, \\sigma^2/n)$; un **IC de 95%** atrapa a μ en el 95% de las muestras.

## ✅ Autoevaluación

""" + "\n\n".join([
    quiz("Construiste un IC de 95% para μ y obtuviste (180.4 ; 219.6). ¿Cuál interpretación es correcta?",
         ["Hay 95% de probabilidad de que μ esté entre 180.4 y 219.6.",
          "Si repitiéramos el muestreo muchas veces, el 95% de los intervalos construidos así contendría a μ.",
          "El 95% de los meses tiene ventas entre 180.4 y 219.6."], 1,
         "μ es fijo: un intervalo ya calculado lo contiene o no. El 95% es una propiedad del <strong>procedimiento</strong> (revisa el simulador de cobertura). La tercera opción confunde la distribución de x̄ con la de las ventas individuales."),
    quiz("Si cuadruplicas el tamaño muestral n (manteniendo σ y la confianza), el error absoluto E…",
         ["…se reduce a la cuarta parte.", "…se reduce a la mitad.", "…no cambia."], 1,
         "E = z·σ/√n, y √(4n) = 2√n. Para reducir el error a la mitad necesitas cuatro veces más datos."),
    quiz("En una muestra de 15 sueldos aparece uno de 10 millones. ¿Qué estadístico cambia más?",
         ["La mediana", "La media", "Ambos cambian lo mismo"], 1,
         "La media usa el valor de cada dato, así que un atípico la arrastra; la mediana solo depende de la posición central. Pruébalo agregando un atípico en el simulador de estadística descriptiva."),
]) + """

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 1 (*La naturaleza de la econometría y los datos económicos*) y apéndice C
  (repaso de estadística).
- Próxima clase: **Regresión lineal simple**.
"""

C1_INSERTAR = {
    ("sem1/clase1.tex", 4): widget("espuria"),
    ("sem1/clase1.tex", 6): widget("confusores"),
    ("sem1/clase1.tex", 7): widget("casos-reales"),
    ("sem1/clase1.tex", 13): widget("sopa"),
    ("sem1/clase1.tex", 17): widget("muestreo-casos"),
    ("sem1/clase1.tex", 19): widget("no-prob") + "\n\n" + widget("digest"),
    ("sem1/repaso_ayudantia.tex", 4): widget("bar-gates"),
    ("sem1/repaso_estadistica.tex", 2): widget("aro"),
    ("sem1/repaso_estadistica.tex", 3): widget("galton"),
    ("sem1/clase1.tex", 11): widget("tipos-datos"),
    ("sem1/clase1.tex", 18): widget("muestreo"),
    ("sem1/repaso_ayudantia.tex", 10): widget("descriptiva"),
    ("sem1/repaso_estadistica.tex", 4): widget("tcl"),
    ("sem1/repaso_estadistica.tex", 13): widget("ic-cobertura"),
    ("sem1/repaso_estadistica.tex", 34): widget("ic-calc"),
}

C1_PLEGAR = {
    ("sem1/clase1.tex", 6): "Respuesta",
    ("sem1/repaso_estadistica.tex", 6): "Solución",
    ("sem1/repaso_estadistica.tex", 7): "Solución (continuación)",
    ("sem1/repaso_estadistica.tex", 21): "Solución",
    ("sem1/repaso_estadistica.tex", 24): "Solución",
    ("sem1/repaso_estadistica.tex", 33): "Solución",
    ("sem1/repaso_estadistica.tex", 34): "Conclusión",
}

# --------------------------------------------------------------------------------------------
# Clase 2 · Semana 2
# --------------------------------------------------------------------------------------------
C2_CABECERA = """# Clase 2 · Regresión lineal simple

<div class="usm-session-meta">
<span>📅 Viernes 23 de octubre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Semana 2 · Contenido 4 · El modelo de regresión simple</span>
<span class="usm-tag-red">📝 Semana del Control 1</span>
</div>

!!! info "Contenido oficial de la semana"
    Esta página reproduce **íntegras y en orden** las diapositivas de la semana 2
    (`sem2/clase2.tex`, 34 láminas), todas de la **cátedra del viernes**. Los bloques
    **Interactivo**, los casos y las preguntas de autoevaluación son material adicional para estudiar.

<!--COMO-ESTUDIAR-->

## 🎯 Objetivos de la sesión

- Plantear el modelo de regresión lineal simple (RLS) e interpretar sus parámetros.
- Entender el supuesto clave $E[u \\mid x] = 0$ y la función de regresión poblacional.
- Derivar e interpretar los estimadores de **Mínimos Cuadrados Ordinarios (MCO)**.
- Descomponer la variabilidad de $y$ ($SST = SSE + SSR$) y medir la bondad de ajuste con el $R^2$.
- Conocer los supuestos RLS 1–5 y las propiedades de insesgamiento y varianza de MCO.

## 🗓️ Agenda de la cátedra (viernes 18:40 – 21:25)

Haz clic en un tema para ir directo a él.
"""

C2_CIERRE = """!!! abstract "🧠 Ideas clave"
    - En $y = \\beta_0 + \\beta_1 x + u$, $\\beta_1$ es el cambio en $E[y \\mid x]$ por unidad de $x$; es **causal solo si** $E[u \\mid x] = 0$.
    - **MCO** elige la recta que minimiza $\\sum_i \\hat{u}_i^2$; por eso $\\sum_i \\hat{u}_i = 0$ y $\\sum_i x_i \\hat{u}_i = 0$.
    - $SST = SSE + SSR$ y $R^2 = SSE/SST$ mide **ajuste**, no causalidad: un $R^2$ bajo no invalida la regresión.
    - Con **RLS 1–4** MCO es **insesgado**; con **RLS 5** (homocedasticidad) vale $\\text{Var}(\\hat{\\beta}_1 \\mid x) = \\sigma^2 / \\sum_i (x_i - \\bar{x})^2$.

## ✅ Autoevaluación

""" + "\n\n".join([
    quiz("Con los datos de EE. UU. se estimó: salario estimado = 0.095 + 0.54·educación. ¿Cuál es la interpretación correcta de 0.54?",
         ["Un año más de educación causa un aumento de 0.54 dólares por hora en el salario de cada persona.",
          "Un año más de educación se asocia, en promedio, con 0.54 dólares más por hora.",
          "El 54% de la variación del salario se explica por la educación."], 1,
         "β̂₁ describe cómo cambia el salario <strong>esperado</strong>. Solo es causal si E[u|x] = 0 (supuesto 4), lo que es dudoso: ¿qué hay en u? La tercera opción describe un R², no una pendiente."),
    quiz("En una regresión, SST = 400 y SSR = 300. ¿Cuánto vale el R²?",
         ["0.75", "0.25", "No se puede calcular sin SSE"], 1,
         "R² = 1 − SSR/SST = 1 − 300/400 = 0.25 (y SSE = SST − SSR = 100)."),
    quiz("Según Var(β̂₁|x) = σ² / Σ(xᵢ − x̄)², ¿cuál de estos cambios <strong>no</strong> reduce la varianza de β̂₁?",
         ["Aumentar el tamaño muestral", "Tener más variabilidad en x", "Que el error u tenga mayor varianza σ²"], 2,
         "Un σ² mayor <em>aumenta</em> la varianza. Más observaciones y más dispersión en x aumentan Σ(xᵢ − x̄)² y la reducen (pruébalo en el simulador de insesgamiento)."),
]) + """

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 2 (*El modelo de regresión simple*).
- Próxima clase: **Causalidad y variable omitida** — ¿cuándo podemos interpretar $\\hat{\\beta}_1$
  como un efecto causal?
"""

C2_INSERTAR = {
    ("sem2/clase2.tex", 7): widget("mochila-u"),
    ("sem2/clase2.tex", 9): widget("esperanza-cond"),
    ("sem2/clase2.tex", 13): widget("cuadrados"),
    ("sem2/clase2.tex", 19): widget("prediccion"),
    ("sem2/clase2.tex", 33): widget("homocedasticidad"),
    ("sem2/clase2.tex", 14): widget("mco"),
    ("sem2/clase2.tex", 15): complemento("Pista para la tarea",
        "Desarrolla el producto y usa que $\\sum_{i=1}^n (x_i - \\bar{x}) = 0$ y $\\sum_{i=1}^n (y_i - \\bar{y}) = 0$."),
    ("sem2/clase2.tex", 20): complemento("Compruébalo",
        "En el simulador *encuentra la recta de mínimos cuadrados* (más arriba, junto a la lámina 14) activa **Mostrar recta MCO**: "
        "verás que $\\sum_i \\hat{u}_i = 0$, $\\sum_i x_i\\hat{u}_i = 0$ y que la recta pasa por $(\\bar{x}, \\bar{y})$, "
        "incluso si arrastras los puntos."),
    ("sem2/clase2.tex", 25): widget("varianza") + "\n\n" + widget("r2-galeria"),
    ("sem2/clase2.tex", 26): widget("unidades"),
    ("sem2/clase2.tex", 34): widget("insesgado") + "\n\n" + widget("supuestos"),
}

# --------------------------------------------------------------------------------------------
# Clase 3 · Semana 3
# --------------------------------------------------------------------------------------------
C3_CABECERA = """# Clase 3 · Causalidad y variable omitida

<div class="usm-session-meta">
<span>📅 Viernes 30 de octubre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Semana 3 · Contenido 4 (cont.) · Causalidad y variable omitida</span>
</div>

!!! info "Contenido oficial de la semana"
    Esta página reproduce **íntegras y en orden** las diapositivas de la semana 3 (`sem3/`):
    `Clase3.tex` (Parte 1) y `Clase4.tex` (Parte 2), ambas de la **cátedra del viernes**. Los bloques
    **Interactivo**, los casos y las preguntas son material adicional para estudiar.

<!--COMO-ESTUDIAR-->

## 🎯 Objetivos de la sesión

- Distinguir entre **esperanza condicional** (lo que describe una regresión) y **efecto causal**.
- Usar el modelo de **outcomes potenciales** de Rubin para definir el ATE y el ATT.
- Descomponer una diferencia de promedios en **efecto causal + sesgo de selección**.
- Entender por qué la **aleatorización** elimina el sesgo de selección.
- Derivar el **sesgo por variable omitida** y predecir su signo.
- Evaluar cuándo agregar controles corrige el sesgo y por qué las variables irrelevantes aumentan la varianza.

## 🗓️ Agenda de la cátedra (viernes 18:40 – 21:25)

Haz clic en un tema para ir directo a él.
"""

C3_CIERRE = """!!! abstract "🧠 Ideas clave"
    - Para cada persona solo vemos **un** outcome potencial: el contrafactual nunca se observa.
    - **Diferencia observada = ATT + sesgo de selección**; el sesgo existe si los grupos ya eran distintos sin tratamiento.
    - La **aleatorización** elimina el sesgo de selección: $\\beta = ATE = ATT$.
    - Omitir una variable relevante sesga: $\\tilde{\\beta}_1 = \\beta_1 + \\beta_2 \\delta_1$, y su signo depende de los signos de $\\beta_2$ y $\\delta_1$.
    - Controlar por la omitida corrige el sesgo **si la observamos**; agregar variables irrelevantes no sesga, pero **aumenta la varianza**.

## ✅ Autoevaluación

""" + "\n\n".join([
    quiz("Comparas el salario de quienes hicieron un MBA con el de quienes no. ¿Qué representa el sesgo de selección?",
         ["La diferencia entre el salario con y sin MBA de quienes lo hicieron.",
          "La diferencia de salario que habría existido entre ambos grupos aun si nadie hubiera hecho el MBA.",
          "El error de muestreo de la diferencia de promedios."], 1,
         "Sesgo de selección = E[Yᴺᵀ | T=1] − E[Yᴺᵀ | T=0]. La primera opción es el ATT; la tercera es variabilidad muestral."),
    quiz("Estimas el efecto de las clases particulares sobre la nota final omitiendo la nota previa. Quienes tienen peor nota previa toman más clases, y la nota previa sube la nota final. ¿Qué signo tiene el sesgo?",
         ["Positivo: la regresión corta sobreestima el efecto de las clases.",
          "Negativo: la regresión corta subestima el efecto (incluso podría parecer que las clases bajan la nota).",
          "No hay sesgo, porque la variable omitida no es la de interés."], 1,
         "δ₁ &lt; 0 (peor nota previa, más clases) y β₂ &gt; 0 (la nota previa sube la final) ⇒ β₂·δ₁ &lt; 0: caso 3 de la tabla de signos."),
    quiz("Un programa de capacitación se asignó por sorteo. ¿Es necesario agregar controles para obtener un estimador insesgado del efecto?",
         ["Sí, siempre hay que controlar por todas las características observables.",
          "No: con aleatorización la correlación entre el tratamiento y cualquier variable omitida es 0.",
          "Solo si el R² de la regresión es bajo."], 1,
         "Es la lámina <em>Sin sesgo de selección</em>: con aleatorización δ₁ = 0 <em>en la población</em> para cualquier omitida, así que β₂·δ₁ = 0. Agregar controles que sí predicen y puede, de todos modos, mejorar la precisión."),
]) + """

## 📚 Para la próxima clase

- **Repaso:** Wooldridge, sección 3.3 (sesgo por variable omitida). **Para la próxima clase:** secciones 3.1–3.2 (*Análisis de regresión múltiple: estimación*).
- 📖 Comienza la lectura del **Certamen 1** (lunes 16 de noviembre): Miguel, E. y Kremer, M. (2004).
  *Worms: Identifying Impacts on Education and Health in the Presence of Treatment
  Externalities.* Econometrica, 72(1).
- Próxima clase: **Regresión lineal múltiple: estimación**.
"""

C3_INSERTAR = {
    ("sem3/Clase3.tex", 4): widget("universo"),
    ("sem3/Clase3.tex", 6): widget("po"),
    ("sem3/Clase3.tex", 8): widget("gemelos"),
    ("sem3/Clase3.tex", 12): widget("hospital"),
    ("sem3/Clase3.tex", 14): widget("alarmas"),
    ("sem3/Clase3.tex", 16): widget("seleccion") + "\n\n" + widget("ab-test"),
    ("sem3/Clase4.tex", 2): complemento("Ya lo vimos en la Clase 1",
        "Este es exactamente el problema que resolvió el estudio de **Bloom y coautores** sobre consultoría en India: como las empresas que contratan "
        "consultoras son distintas (más grandes, más ricas), los investigadores **sortearon** quién recibía la consultoría. Así el tamaño de la empresa "
        "deja de relacionarse con $x$ y desaparece el sesgo."),
    ("sem3/Clase4.tex", 6): widget("ovb") + "\n\n" + widget("signo-sesgo"),
    ("sem3/Clase4.tex", 10): widget("mas-controles"),
    ("sem3/Clase4.tex", 9): complemento("Compruébalo con los números",
        "Con la salida de Stata: $-1.819 = 0.943 + 0.980\\,\\delta_2$ (la lámina redondea a $-1.81$) $\\Rightarrow \\delta_2 \\approx -2.8 < 0$. "
        "Prueba el botón **Fumar y edad** en el simulador de variable omitida: reproduce estas dos regresiones.") + "\n\n" + widget("simpson"),
}

# --------------------------------------------------------------------------------------------
# Clase 3 · temas (agenda, preguntas de práctica y ejercicios de R)
# --------------------------------------------------------------------------------------------
P1, P2 = "sem3/Clase3.tex", "sem3/Clase4.tex"

R_T2 = r'''
# Tabla de la lámina 6 con los contrafactuales "revelados" (los ?? son inventados)
datos <- data.frame(
  nombre = c("Sofía", "Paula", "Ezequiel", "Juan", "Caro"),
  T      = c(1, 0, 1, 0, 1),         # 1 = fue a la universidad
  Y_NT   = c(75, 40, 60, 20, 45),    # salario SIN universidad
  Y_T    = c(100, 55, 80, 30, 60)    # salario CON universidad
)
# Efecto individual: en la vida real nunca se observa
datos$efecto <- datos$Y_T - datos$Y_NT
datos

ATE <- mean(datos$efecto)                 # las 5 personas
ATT <- mean(datos$efecto[datos$T == 1])   # solo quienes fueron
c(ATE = ATE, ATT = ATT)
'''

R_T3 = r'''
datos <- data.frame(
  T    = c(1, 0, 1, 0, 1),
  Y_NT = c(75, 40, 60, 20, 45),
  Y_T  = c(100, 55, 80, 30, 60)
)
# Lo único que vemos: el outcome del mundo en que vivió cada uno
datos$Y <- ifelse(datos$T == 1, datos$Y_T, datos$Y_NT)

dif_obs <- mean(datos$Y[datos$T == 1]) - mean(datos$Y[datos$T == 0])
ATT     <- mean(datos$Y_T[datos$T == 1] - datos$Y_NT[datos$T == 1])
sesgo   <- mean(datos$Y_NT[datos$T == 1]) - mean(datos$Y_NT[datos$T == 0])
c(diferencia = dif_obs, ATT = ATT, sesgo = sesgo,
  ATT_mas_sesgo = ATT + sesgo)

# MCO de Y sobre T da justo la diferencia observada (lámina 9)
coef(lm(Y ~ T, data = datos))
'''

R_T4 = r'''
set.seed(2026)
n <- 10000
habilidad <- rnorm(n)                          # no la observamos
Y_NT <- 100 + 15 * habilidad + rnorm(n, sd = 8)
Y_T  <- Y_NT + 10                      # efecto causal: +10

# 1) Autoselección: los más hábiles van más a la universidad
T_auto <- rbinom(n, 1, plogis(2 * habilidad))
Y_auto <- ifelse(T_auto == 1, Y_T, Y_NT)
coef(lm(Y_auto ~ T_auto))["T_auto"]

# 2) Aleatorización: una moneda decide quién va
T_azar <- rbinom(n, 1, 0.5)
Y_azar <- ifelse(T_azar == 1, Y_T, Y_NT)
coef(lm(Y_azar ~ T_azar))["T_azar"]

# ¿Por qué? Habilidad promedio de no tratados (0) y tratados (1)
tapply(habilidad, T_auto, mean)
tapply(habilidad, T_azar, mean)
'''

R_T5 = r'''
set.seed(3)
n  <- 5000
x1 <- rnorm(n)
x2 <- 0.5 * x1 + rnorm(n)              # (B): delta1 = 0.5
y  <- 1 + 2 * x1 + 3 * x2 + rnorm(n)   # (A): beta1 = 2, beta2 = 3

corta <- lm(y ~ x1)            # (C): omite x2
larga <- lm(y ~ x1 + x2)       # (A): el modelo verdadero
aux   <- lm(x2 ~ x1)           # (B): la regresión auxiliar

coef(corta)["x1"]          # beta1 tilde (≈ 3.5)
# beta1 + beta2 * delta1 con los coeficientes estimados: ¡idéntico!
coef(larga)["x1"] + coef(larga)["x2"] * coef(aux)["x1"]
'''

R_T6 = r'''
# Sesgo de la regresión corta (beta1 tilde − beta1), lámina 6
sesgo_corta <- function(delta1, beta2, n = 5000) {
  x1 <- rnorm(n)
  x2 <- delta1 * x1 + rnorm(n)
  y  <- 1 + 2 * x1 + beta2 * x2 + rnorm(n)      # beta1 = 2
  unname(round(coef(lm(y ~ x1))["x1"] - 2, 2))
}
set.seed(6)
casos <- expand.grid(delta1 = c(0.8, -0.8), beta2 = c(2, -2))
casos$sesgo <- mapply(sesgo_corta, casos$delta1, casos$beta2)
casos$signo_predicho <- sign(casos$delta1 * casos$beta2)
casos
'''

R_T7 = r'''
# Datos simulados que imitan las láminas 8 y 9 (n = 100)
set.seed(2026)
n     <- 100
edad  <- runif(n, 20, 80)
fumar <- 30 - 0.3 * edad + rnorm(n, sd = 2.3)  # mayores fuman menos
y     <- 13 + 0.94 * fumar + 0.98 * edad + rnorm(n)

corta <- lm(y ~ fumar)            # como "reg y smoke"
larga <- lm(y ~ fumar + edad)     # como "reg y smoke age"
round(coef(corta), 3)
round(coef(larga), 3)

delta2 <- coef(lm(edad ~ fumar))["fumar"]          # ¿qué signo tiene?
delta2
# beta1 + beta2 * delta2 = coeficiente de la regresión corta
coef(larga)["fumar"] + coef(larga)["edad"] * delta2

# Dentro de cada grupo de edad, la pendiente es positiva; juntos, negativa
plot(fumar, y, pch = 19, col = ifelse(edad > 50, "firebrick", "steelblue"),
     main = "Rojo: mayores de 50 · Azul: 50 o menos")
abline(corta, lwd = 2)
'''

R_T8 = r'''
set.seed(10)
sim <- replicate(2000, {
  n  <- 50
  x1 <- rnorm(n)
  x3 <- 0.9 * x1 + rnorm(n, sd = 0.45)   # correlacionada con x1…
  y  <- 1 + 2 * x1 + rnorm(n)            # …pero irrelevante para y
  c(sin_x3 = unname(coef(lm(y ~ x1))["x1"]),
    con_x3 = unname(coef(lm(y ~ x1 + x3))["x1"]))
})
rowMeans(sim)        # ambos ≈ 2: incluir x3 no sesga
apply(sim, 1, sd)    # pero con x3 la dispersión es mucho mayor
boxplot(t(sim), col = c("steelblue", "goldenrod"), ylab = "beta1 estimado",
        main = "2 000 muestras: sin y con la variable irrelevante")
abline(h = 2, lty = 2)
'''

C3_TEMAS = [
    dict(n=1, hora="18:40", inicio=(P1, 1), fin=(P1, 2), laminas="Parte 1 · láminas 1–2",
         titulo="¿Correlación o causalidad?", corto="Correlación o causalidad",
         pregunta="¿Ganan más quienes estudian más <em>porque</em> estudian, o por otros motivos?",
         quiz=[
             ("Una regresión muestra que quienes estudiaron Economía ganan, en promedio, 20% más que el resto. ¿Qué podemos concluir?",
              [("Que estudiar Economía causa un sueldo 20% mayor.", "Eso exigiría comparar a las mismas personas con y sin Economía: su contrafactual."),
               "Que estudiar Economía está asociado con un sueldo 20% mayor; todavía no sabemos si es causal.",
               ("Que no hay relación causal entre carrera y sueldo.", "Una asociación no prueba causalidad, pero tampoco la descarta.")], 1,
              "La regresión entrega la esperanza condicional E[y|x]: describe una realidad, pero no dice por qué ocurre (lámina 1)."),
             ("Ana fue a la universidad y hoy gana $1 200 000. ¿Cuál es su contrafactual?",
              [("El sueldo promedio de quienes no fueron a la universidad.", "Ese es un grupo de comparación, y puede ser muy distinto de Ana."),
               "El sueldo que Ana tendría hoy si no hubiera ido a la universidad.",
               ("El sueldo de Ana antes de entrar a la universidad.", "Entre antes y después cambian muchas cosas además de la universidad: edad, experiencia, la economía.")], 1,
              "Es la definición de la lámina 2: el resultado que los mismos participantes habrían obtenido sin participar. Nunca lo observamos."),
         ]),
    dict(n=2, hora="19:00", inicio=(P1, 3), fin=(P1, 8), laminas="Parte 1 · láminas 3–8",
         titulo="Outcomes potenciales: ATE y ATT", corto="Outcomes potenciales: ATE y ATT",
         pregunta="¿Cómo se define un efecto causal si nunca vemos a la misma persona en los dos mundos?",
         quiz=[
             ("En la tabla de la lámina 6, Paula no fue tratada e Yᵢ = 40. ¿Qué dato suyo falta?",
              ["Yᵢᵀ: su salario si hubiera ido a la universidad.",
               ("Yᵢᴺᵀ: su salario sin universidad.", "Ese sí lo vemos: como no fue tratada, Yᵢ = Yᵢᴺᵀ = 40."),
               ("Ninguno: de Paula conocemos sus dos outcomes.", "Nunca vemos los dos outcomes de una misma persona (lámina 4).")], 0,
              "Para los no tratados falta Yᵀ; para los tratados, Yᴺᵀ. Siempre falta la mitad de la tabla."),
             ("¿Qué diferencia al ATT del ATE?",
              ["El ATT promedia el efecto solo entre los tratados; el ATE, en toda la población.",
               ("El ATT se puede observar y el ATE no.", "Ninguno es observable: el ATT necesita E[Yᴺᵀ | T = 1], que no vemos (lámina 5)."),
               ("Son siempre iguales.", "Solo coinciden si el efecto promedio es igual entre tratados y no tratados.")], 0,
              "ATE = E[Yᵀ − Yᴺᵀ]; ATT = E[Yᵀ − Yᴺᵀ | T = 1]."),
             ("En el paso 2 del simulador, los efectos de Sofía, Ezequiel y Caro (los tratados) son 25, 20 y 15. ¿Cuánto vale el ATT?",
              [("17", "17 es el ATE: también incluye a Paula y Juan, que no fueron tratados."),
               "20",
               ("50", "50 es la diferencia observada de promedios, que mezcla el efecto con el sesgo de selección.")], 1,
              "ATT = (25 + 20 + 15) / 3 = 20."),
         ],
         r=("La tabla de la lámina 6",
            "Reproduce el **modo Dios** del simulador: arma la tabla con los dos outcomes potenciales de cada persona y calcula el ATE y el ATT.",
            R_T2, "cambia el `Y_T` de Juan de 30 a 60. ¿Cambia el ATT? ¿Y el ATE? ¿Por qué?")),
    dict(n=3, hora="19:30", inicio=(P1, 9), fin=(P1, 14), laminas="Parte 1 · láminas 9–14",
         titulo="La trampa de comparar: sesgo de selección", corto="Sesgo de selección",
         pregunta="¿Por qué comparar a quienes recibieron un tratamiento con quienes no puede engañarnos?",
         quiz=[
             ("En el simulador, la diferencia observada es 50 y el ATT es 20. ¿Cuánto vale el sesgo de selección?",
              [("70", "Revisa la descomposición: diferencia = ATT + sesgo, no ATT − sesgo."),
               "30",
               ("No se puede calcular.", "Con la descomposición de la lámina 11 basta restar: sesgo = diferencia − ATT.")], 1,
              "β₁ = ATT + sesgo ⇒ 50 = 20 + 30. Los tratados habrían ganado 30 más aun sin universidad."),
             ("Comparas las notas de quienes asisten a un preuniversitario pagado con las de quienes no asisten. ¿Qué signo esperas en el sesgo de selección?",
              ["Positivo: quienes pagan un preuniversitario suelen tener más recursos y apoyo, y les habría ido mejor igual.",
               ("Negativo, porque el preuniversitario es caro.", "El precio no define el signo; importa cómo les habría ido a los asistentes SIN preuniversitario."),
               ("Cero, porque todos rinden la misma prueba.", "Rendir la misma prueba no hace comparables a los grupos.")], 0,
              "Sesgo = E[Yᴺᵀ | T = 1] − E[Yᴺᵀ | T = 0] &gt; 0: la comparación simple sobreestima el efecto del preuniversitario."),
             ("Las casas con alarma registran más robos que las casas sin alarma. ¿Qué lectura es consistente con la lámina 14?",
              ["Quienes instalan alarmas suelen vivir donde hay más delitos: el sesgo de selección puede ocultar que la alarma sí protege.",
               ("Las alarmas atraen a los ladrones.", "Podría ser, pero la comparación simple no permite distinguirlo del sesgo de selección."),
               ("No hay sesgo, porque cada dueño decide libremente.", "Justamente porque cada uno decide, los grupos pueden ser distintos desde antes.")], 0,
              "Sin alarma, las casas que la instalaron igual habrían tenido más robos: la diferencia observada mezcla ese sesgo con el efecto."),
         ],
         r=("Diferencia observada = ATT + sesgo",
            "Con la misma tabla, calcula lo que **sí** vemos en los datos y comprueba la descomposición de la lámina 11. Fíjate en que `lm()` entrega exactamente la diferencia de promedios.",
            R_T3, "¿qué valores de `Y_NT` tendrían que tener Sofía, Ezequiel y Caro para que el sesgo fuera cero? Pruébalo: ¿qué pasa con la diferencia observada?")),
    dict(n=4, hora="20:05", inicio=(P1, 15), fin=(P1, 16), laminas="Parte 1 · láminas 15–16",
         titulo="Aleatorizar: dejar que decida una moneda", corto="Aleatorización",
         pregunta="¿Qué cambia cuando es una moneda, y no la persona, la que decide quién recibe el tratamiento?",
         quiz=[
             ("¿Qué garantiza la aleatorización?",
              ["Que E[Yᴺᵀ | T = 1] = E[Yᴺᵀ | T = 0]: sin tratamiento, ambos grupos serían iguales en promedio.",
               ("Que el tratamiento tenga el mismo efecto en todas las personas.", "Los efectos pueden variar entre personas; el sorteo solo hace comparables a los grupos."),
               ("Que la diferencia observada sea exactamente el ATE en cada muestra.", "Lo es en promedio. En un sorteo particular hay error por azar: míralo en el paso 4 del simulador.")], 0,
              "Es la condición de la lámina 15. Con ella el sesgo de selección es cero y β = ATE = ATT (lámina 16)."),
             ("Una app sortea a qué usuarios les muestra un botón nuevo (test A/B). Quienes vieron el botón compran 3% más. ¿Qué mide esa diferencia?",
              ["El efecto causal promedio del botón, salvo error muestral.",
               ("Solo una correlación, porque no se controló por nada.", "Con sorteo no hace falta controlar: β = ATE = ATT."),
               ("El efecto solo en los usuarios más activos.", "El sorteo reparte a usuarios activos y pasivos por igual en ambos grupos.")], 0,
              "La aleatorización hace que los grupos sean comparables: la diferencia de promedios estima el efecto causal."),
         ],
         r=("Autoselección versus sorteo",
            "Simula 10 000 personas en que la universidad sube el salario en **exactamente 10**. Compara lo que estima MCO cuando cada persona elige y cuando decide una moneda.",
            R_T4, "cambia el `2` de `plogis(2 * habilidad)` por `0`. ¿Qué pasa con el sesgo? ¿Y si pones `-2`?")),
    dict(n=5, hora="20:20", inicio=(P2, 1), fin=(P2, 4), laminas="Parte 2 · láminas 1–4",
         titulo="Del sesgo de selección a la variable omitida", corto="De la selección a la variable omitida",
         pregunta="¿Qué le pasa a MCO cuando una variable importante queda escondida en el error?",
         quiz=[
             ("En productividad = α + β·consultoría + ε, el tamaño de la empresa queda en ε. ¿Por qué β̂ estaría sesgado?",
              ["Porque el tamaño se relaciona con recibir consultoría, así que E[ε | x] ≠ 0.",
               ("Porque el tamaño no afecta la productividad.", "Si no la afectara (β₂ = 0), omitirlo no generaría sesgo."),
               ("Porque la muestra es pequeña.", "El sesgo no desaparece con más datos: depende de qué hay en el error.")], 0,
              "Es el ejemplo de la lámina 2: solo las empresas grandes pueden pagar consultoría, y el tamaño también afecta la productividad."),
             ("La población sigue y = 1 + 2x₁ + 3x₂ + u, con x₂ = 0.5x₁ + v. Si omites x₂, ¿cuánto vale β̃₁?",
              [("2", "2 es el efecto causal β₁; la regresión corta además captura β₂δ₁."),
               "3.5",
               ("5", "No se suman β₁ y β₂: el sesgo es β₂·δ₁ = 3 · 0.5.")], 1,
              "β̃₁ = β₁ + β₂δ₁ = 2 + 3 · 0.5 = 3.5. Compruébalo en el ejercicio de R de abajo."),
         ],
         r=("La fórmula del sesgo, número a número",
            "Simula los datos de la pregunta anterior y verifica que el coeficiente de la regresión corta es **exactamente** β̂₁ + β̂₂·δ̂₁ (lámina 4).",
            R_T5, "cambia `0.5` por `0` en la línea de `x2`. ¿Cuánto vale ahora el sesgo? ¿Qué caso de la lámina 5 es?")),
    dict(n=6, hora="20:40", inicio=(P2, 5), fin=(P2, 6), laminas="Parte 2 · láminas 5–6",
         titulo="El signo del sesgo", corto="El signo del sesgo",
         pregunta="¿Cómo predecir si la regresión corta sobreestima o subestima el efecto?",
         quiz=[
             ("¿En cuál de los diagramas de la lámina 5 omitir X2 sesga el coeficiente de X1?",
              [("(1): X2 solo afecta a Y.", "Si X2 no se relaciona con X1, δ₁ = 0 y β₂δ₁ = 0."),
               ("(2): X2 solo se relaciona con X1.", "Si X2 no afecta a Y, β₂ = 0 y β₂δ₁ = 0."),
               "(3): X2 se relaciona con X1 y afecta a Y."], 2,
              "Solo hay sesgo cuando la omitida afecta a Y (β₂ ≠ 0) y se relaciona con X1 (δ₁ ≠ 0)."),
             ("Estimas el efecto de un subsidio de salud sobre un índice de salud omitiendo la pobreza. Los hogares más pobres reciben más subsidio (δ₁ &gt; 0) y la pobreza empeora la salud (β₂ &lt; 0). La regresión corta…",
              ["…subestima el efecto del subsidio: hasta podría parecer que empeora la salud.",
               ("…sobreestima el efecto del subsidio.", "β₂δ₁ es negativo por positivo: el sesgo empuja el coeficiente hacia abajo."),
               ("…no tiene sesgo, porque el subsidio se entrega con reglas.", "Las reglas usan la pobreza, que también afecta la salud: eso es justamente δ₁ ≠ 0.")], 0,
              "Caso 4 de la lámina 6: δ₁ &gt; 0 y β₂ &lt; 0 ⇒ sesgo negativo."),
         ],
         r=("Los cuatro casos de signos",
            "Simula los cuatro casos de la lámina 6 y compara el sesgo obtenido con el signo que predice β₂·δ₁.",
            R_T6, "agrega el caso δ₁ = 0 cambiando `c(0.8, -0.8)` por `c(0.8, 0, -0.8)`. ¿Qué sesgo obtienes?")),
    dict(n=7, hora="20:55", inicio=(P2, 7), fin=(P2, 9), laminas="Parte 2 · láminas 7–9",
         titulo="Controles: el ejemplo de fumar y la edad", corto="Controles: fumar y edad",
         pregunta="¿Basta con agregar la variable omitida como control?",
         quiz=[
             ("En el ejemplo, el coeficiente de fumar es −1.81 sin edad y 0.94 con edad. ¿Qué ocurrió?",
              ["Omitir la edad generaba un sesgo negativo tan grande que invertía el signo del efecto de fumar.",
               ("Agregar la edad generó un sesgo.", "Si el modelo con edad es el verdadero, el sesgo estaba en la regresión corta."),
               ("El efecto de fumar cambió en la población.", "La población es la misma; cambió la comparación que hace la regresión.")], 0,
              "−1.81 = 0.94 + 0.98 · δ₂ con δ₂ ≈ −2.8: los mayores fuman menos, y la edad aumenta y."),
             ("¿Cuándo basta con agregar un control para eliminar el sesgo?",
              ["Cuando es la única variable omitida relevante: conocemos el modelo verdadero.",
               ("Siempre que el R² aumente.", "El R² mide ajuste, no ausencia de sesgo."),
               ("Cuando el control tiene muchas observaciones.", "El tamaño muestral no resuelve el sesgo por omisión.")], 0,
              "Es la advertencia de la lámina 7: muchas veces no alcanza, porque hay otras variables omitidas."),
         ],
         r=("Fumar, edad y un cambio de signo",
            "Datos simulados que imitan las dos salidas de Stata de las láminas 8 y 9. Estima ambas regresiones, obtén δ₂ con la regresión auxiliar y mira el gráfico.",
            R_T7, "cambia `- 0.3 * edad` por `+ 0.3 * edad` (los mayores fuman más). Antes de ejecutar, predice el signo del sesgo.")),
    dict(n=8, hora="21:10", inicio=(P2, 10), fin=(P2, 12), laminas="Parte 2 · láminas 10–12",
         titulo="¿Más es mejor? Controles irrelevantes y conclusiones", corto="¿Más es mejor? Conclusiones",
         pregunta="Si omitir variables sesga, ¿conviene agregar todas las que tengamos?",
         quiz=[
             ("Agregas al modelo una variable irrelevante (su β poblacional es 0) que está muy correlacionada con x₁. ¿Qué le pasa a β̂₁?",
              ["Sigue siendo insesgado, pero su varianza aumenta.",
               ("Queda sesgado.", "Incluir variables irrelevantes no afecta el insesgamiento (lámina 10)."),
               ("Se vuelve más preciso.", "Al revés: la variable irrelevante compite con x₁ y aumenta la varianza.")], 0,
              "Es la lámina 10. El ejercicio de R de abajo lo muestra con 2 000 muestras."),
             ("¿Por qué es poco probable que agregar controles permita una interpretación causal con datos observacionales?",
              ["Porque rara vez observamos TODAS las variables que determinan quién recibe el tratamiento.",
               ("Porque los controles siempre aumentan el sesgo.", "Un control relevante reduce el sesgo; el problema es que faltan otros."),
               ("Porque MCO no admite más de dos variables.", "MCO admite muchas variables: lo veremos en la regresión múltiple.")], 0,
              "Es la última conclusión de la lámina 12."),
         ],
         r=("¿Agregar una variable irrelevante?",
            "Repite 2 000 veces el experimento: estima β₁ sin y con una variable irrelevante correlacionada con x₁, y compara el promedio y la dispersión.",
            R_T8, "cambia `0.9 * x1` por `0 * x1` (irrelevante y no correlacionada). ¿Sigue aumentando la dispersión?")),
]


C3_AGENDA = "\n" + ruta(C3_TEMAS, (3, "19:55"), ("21:25", "✅ Ideas clave, autoevaluación y cierre"))


# --------------------------------------------------------------------------------------------
# Clase 4 · Semana 4
# --------------------------------------------------------------------------------------------
C4_CABECERA = """# Clase 4 · Regresión lineal múltiple

<div class="usm-session-meta">
<span>📅 Viernes 6 de noviembre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Semana 4 · Contenido 5 · Análisis de regresión múltiple</span>
<span class="usm-tag-red">🛠️ Semana del Taller 1</span>
</div>

!!! info "Contenido oficial de la semana"
    Esta página reproduce **íntegros y en orden** los materiales de la semana 4 (`sem4/`).
    **Cátedra del viernes:** Parte 1 (`Clase5.tex`, 25 láminas). **Ayudantía/taller:** Parte 2
    (`calculo_matrices.tex`, ejercicio de la inversa de $X^\\top X$). Los bloques **Interactivo**, los casos
    y las preguntas de autoevaluación son material adicional para estudiar.

<!--COMO-ESTUDIAR-->

## 🎯 Objetivos de la sesión

**Cátedra (viernes)**

- Pasar del modelo simple al **modelo de regresión lineal múltiple** e interpretar cada $\\beta_j$ *ceteris paribus*.
- Plantear la estimación por MCO con $k$ variables y escribir el modelo en **notación matricial**, $y = X\\beta + u$.
- Derivar $\\hat{\\beta} = (X^\\top X)^{-1} X^\\top y$ y reconocer sus propiedades algebraicas.
- Distinguir entre $R^2$ y $R^2$ ajustado, y leer la salida de una regresión en R.

**Ayudantía**

- Calcular a mano $(X^\\top X)^{-1}$ por cofactores y obtener $\\hat{\\beta}$ con los datos del ejemplo.

## 🗓️ Agenda de la cátedra (viernes 18:40 – 21:25)

Haz clic en un tema para ir directo a él.
"""

C4_CIERRE = """!!! abstract "🧠 Ideas clave"
    - En la regresión múltiple cada $\\beta_j$ es un efecto **ceteris paribus**: la pendiente del plano en la dirección de $x_j$.
    - Controlar por una variable cambia el coeficiente de interés (0.54 → 0.37 al agregar IQ), como predice la fórmula de variable omitida.
    - En notación matricial $y = X\\beta + u$, con $X$ de dimensión $n \\times (k+1)$, y $\\hat{\\beta} = (X^\\top X)^{-1} X^\\top y$ exige **rango completo**.
    - El $R^2$ **nunca baja** al agregar variables; el $R^2$ **ajustado** penaliza cada variable adicional.

## ✅ Autoevaluación

""" + "\n\n".join([
    quiz("En salario = 0.065 + 0.37·educación + 0.20·IQ, ¿qué significa 0.37?",
         ["Un año más de educación se asocia con 0.37 más de salario, sin importar el IQ de la persona.",
          "Un año más de educación se asocia con 0.37 más de salario esperado, manteniendo constante el IQ.",
          "El 37% del salario se explica por la educación."], 1,
         "En la regresión múltiple cada coeficiente es un efecto <em>ceteris paribus</em>: la pendiente del plano en la dirección de esa variable, con las demás incluidas fijas."),
    quiz("Con n = 100 observaciones y k = 4 variables explicativas, ¿qué dimensión tiene la matriz X?",
         ["100 × 4", "100 × 5", "5 × 100"], 1,
         "X tiene una fila por observación y una columna por parámetro: la columna de unos más las 4 variables, es decir n × (k + 1) = 100 × 5."),
    quiz("¿Por qué se exige que X tenga rango completo (k + 1)?",
         ["Para que XᵀX sea invertible y exista β̂ = (XᵀX)⁻¹Xᵀy.", "Para que el R² sea mayor que 0.5.", "Para que los residuos sumen cero."], 0,
         "Si una columna es combinación lineal de otras (por ejemplo, dos variables idénticas), XᵀX no se puede invertir y MCO no tiene solución única. Pruébalo en la calculadora."),
    quiz("Agregas al modelo una variable que no tiene ninguna relación con y. ¿Qué pasa?",
         ["El R² baja y el R² ajustado sube.", "El R² sube o se mantiene; el R² ajustado puede bajar.", "Ambos quedan exactamente iguales."], 1,
         "El R² nunca baja al agregar variables; el R² ajustado penaliza con (n − 1)/(n − k − 1). Es la trampa del R² que viste en el juego."),
]) + """

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 3, secciones 3.1–3.2 (*Análisis de regresión múltiple: estimación*).
- 🛠️ Esta semana es el **Taller 1**: repasa el ejercicio de la Parte 2 y verifica tus cálculos con la calculadora matricial.
- Próxima clase: **Interpretación de la regresión múltiple**.
"""

C4_INSERTAR = {
    ("sem4/Clase5.tex", 2): widget("plano"),
    ("sem4/Clase5.tex", 3): widget("iq-control"),
    ("sem4/Clase5.tex", 8): widget("matriz-x"),
    ("sem4/Clase5.tex", 14): widget("r2-trampa"),
    ("sem4/Clase5.tex", 22): widget("calc-matricial"),
    ("sem4/Clase5.tex", 25): widget("salida-r"),
    ("sem4/calculo_matrices.tex", 2): widget("cofactores"),
}

# --------------------------------------------------------------------------------------------
# Clase 1 · temas
# --------------------------------------------------------------------------------------------
S1, S1A, S1E = "sem1/clase1.tex", "sem1/repaso_ayudantia.tex", "sem1/repaso_estadistica.tex"

R_C1_T2 = r'''
# Un día caluroso hace que se vendan más helados Y que más gente se bañe en el mar
set.seed(1)
dias        <- 200
temperatura <- runif(dias, 10, 35)
helados     <- 20 + 3 * temperatura + rnorm(dias, sd = 8)
ataques     <- 0.1 * temperatura + rnorm(dias, sd = 0.5)  # sin helados

cor(helados, ataques)                        # correlación alta…
coef(lm(ataques ~ helados))["helados"]       # …y pendiente positiva
coef(lm(ataques ~ helados + temperatura))    # con temperatura fija: ≈ 0

plot(helados, ataques, pch = 19, col = "steelblue",
     main = "¿Los helados provocan ataques de tiburón?")
'''

R_C1_T4 = r'''
set.seed(4)
# Corte transversal: muchas unidades en un mismo momento
corte <- data.frame(persona = c("Ana", "Beto", "Carla"),
                    salario = c(850, 620, 1100), anio = 2024)
# Serie de tiempo: una unidad a lo largo del tiempo
serie <- data.frame(anio = 2020:2024,
                    dolar = c(792, 759, 873, 840, 944))  # promedio anual aprox.
# Panel: las MISMAS unidades en varios momentos
panel <- expand.grid(persona = c("Ana", "Beto", "Carla"), anio = 2022:2024)
panel$salario <- round(700 + 60 * (panel$anio - 2022) + rnorm(9, sd = 40))

corte
serie
panel
table(panel$persona)   # cada persona aparece una vez por año
'''

R_C1_T5 = r'''
set.seed(1936)
N <- 100000
# Población: quienes tienen teléfono (más ricos) prefieren más al candidato A
telefono <- rbinom(N, 1, 0.35)
vota_A   <- rbinom(N, 1, ifelse(telefono == 1, 0.60, 0.30))
mean(vota_A)                 # parámetro (en la práctica, desconocido)

grande_sesgada <- sample(which(telefono == 1), 20000)  # solo con teléfono
pequena_azar   <- sample(N, 1000)                      # aleatoria simple
c(sesgada_n20000 = mean(vota_A[grande_sesgada]),
  azar_n1000     = mean(vota_A[pequena_azar]))
'''

R_C1_T6 = r'''
set.seed(18)
# Ingresos en 3 comunas muy distintas entre sí, pero parecidas por dentro
comuna  <- rep(c("A", "B", "C"), each = 2000)
ingreso <- c(rnorm(2000, 500, 50), rnorm(2000, 900, 60),
             rnorm(2000, 1600, 80))
mean(ingreso)                                  # parámetro

simple <- replicate(2000, mean(sample(ingreso, 60)))
estratificado <- replicate(2000, mean(c(
  sample(ingreso[comuna == "A"], 20),
  sample(ingreso[comuna == "B"], 20),
  sample(ingreso[comuna == "C"], 20))))
c(simple = sd(simple), estratificado = sd(estratificado))  # error típico

boxplot(list(Simple = simple, Estratificado = estratificado),
        ylab = "Promedio estimado (n = 60)")
abline(h = mean(ingreso), lty = 2)
'''

R_C1_T7 = r'''
set.seed(7)
ventas <- round(rnorm(36, mean = 200, sd = 60))   # 36 meses de ventas

# Descriptiva: resume ESTA muestra
summary(ventas)
sd(ventas)

# Inferencial: dice algo de la POBLACIÓN (la media μ, que no conocemos)
mean(ventas) + c(-1, 1) * 1.96 * 60 / sqrt(36)    # IC 95%, σ = 60 conocido
'''

R_C1_A1 = r'''
# 15 sueldos en miles de pesos; el último es un atípico (10 millones)
sueldos <- c(520, 610, 580, 700, 650, 590, 720, 680, 560, 630,
             600, 750, 640, 610, 10000)
c(media = mean(sueldos), mediana = median(sueldos))
c(desv_estandar = sd(sueldos), rango_intercuartil = IQR(sueldos))
quantile(sueldos)              # cuartiles: q1, mediana y q3

par(mfrow = c(1, 2))
hist(sueldos[-15], main = "Histograma (sin el atípico)", xlab = "miles de $")
boxplot(sueldos, main = "Boxplot: el atípico aparte")
par(mfrow = c(1, 1))
'''

R_C1_A2 = r'''
# TCL: la población es muy asimétrica, pero el promedio de 36 datos no
set.seed(36)
promedios <- replicate(5000, mean(rexp(36, rate = 1 / 200)))  # μ = σ = 200
hist(promedios, breaks = 40, main = "5 000 promedios de n = 36",
     xlab = "x barra")
c(media = mean(promedios), sd = sd(promedios), sd_teorica = 200 / 6)

# IC de 95% de la lámina 5: x barra = 200, σ = 60, n = 36
200 + c(-1, 1) * qnorm(0.975) * 60 / sqrt(36)

# ¿Qué significa el 95%? El intervalo atrapa a μ en ~95% de las muestras
cubre <- replicate(5000, {
  x <- rnorm(36, mean = 200, sd = 60)
  abs(mean(x) - 200) <= 1.96 * 60 / sqrt(36)
})
mean(cubre)
'''

R_C1_A3 = r'''
# Lámina 20: 19 defectuosos en 200 unidades
x <- 19
n <- 200
p <- x / n
p + c(-1, 1) * qnorm(0.975) * sqrt(p * (1 - p) / n)  # (0.0543; 0.1356)

# Tamaño muestral para un error E = 0.03 con p* = 0.5 (peor escenario)
E <- 0.03
ceiling(qnorm(0.975)^2 * 0.5 * (1 - 0.5) / E^2)
'''

R_C1_A4 = r'''
# Lámina 32: salarios de egresados de ingeniería (X) y arquitectura (Y)
xbar <- 800000; ybar <- 680000
nx   <- 144;    ny   <- 121
sx   <- 60000;  sy   <- 50000

ee <- sqrt(sx^2 / nx + sy^2 / ny)               # error estándar
(xbar - ybar) + c(-1, 1) * qnorm(0.975) * ee    # (106 756; 133 244)
'''

C1_TEMAS = [
    dict(n=1, hora="19:00", inicio=(S1, 1), fin=(S1, 3), laminas="Parte 1 · láminas 1–3",
         titulo="¿Qué es la econometría?", corto="¿Qué es la econometría?",
         pregunta="¿Qué tipo de preguntas podemos responder combinando teoría económica, estadística y datos?",
         quiz=[
             ("¿Cuál de estas preguntas es de <strong>predicción</strong>, uno de los tres tipos de la lámina 2?",
              [("¿Cuánto aumenta el salario por terminar la universidad?", "Esa es una pregunta de impacto causal."),
               "¿Cuál será la inflación en Chile el próximo año?",
               ("¿Cómo cambia el salario promedio según los años de educación?", "Esa describe una esperanza condicional.")], 1,
              "Lámina 2: la econometría moderna estima esperanzas condicionales, impactos causales y predicciones."),
             ("En y = f(x₁, …, xₖ) + u, ¿por qué aparece el término u?",
              ["Porque las variables económicas son aleatorias: hay factores que el modelo no captura.",
               ("Porque los datos siempre tienen errores de digitación.", "u puede incluir errores de medición, pero sobre todo reúne los factores que no están en f."),
               ("Para que el modelo sea lineal.", "u aparece aunque f no sea lineal; por ejemplo, en la función de producción.")], 0,
              "Lámina 3: el modelo econométrico agrega un término de error al modelo económico."),
         ]),
    dict(n=2, hora="19:25", inicio=(S1, 4), fin=(S1, 6), laminas="Parte 1 · láminas 4–6",
         titulo="Correlación no es causalidad", corto="Correlación y causalidad",
         pregunta="Si dos variables se mueven juntas, ¿una causa la otra?",
         quiz=[
             ("En los días con más venta de helados hay más ataques de tiburón. ¿Qué lo explica mejor?",
              [("Los helados atraen a los tiburones.", "No hay un mecanismo lógico: es una correlación espuria."),
               "Un tercer factor, la temperatura, aumenta ambas cosas.",
               ("Es causal, porque la correlación es muy alta.", "Una correlación alta no implica causalidad.")], 1,
              "El calor lleva a comprar helados y a bañarse en el mar. Manteniendo la temperatura constante (ceteris paribus), la relación desaparece."),
             ("Las personas de 35 años que terminaron la universidad ganan 30% más. ¿Qué haría falta para afirmar que la universidad <em>causa</em> ese 30%?",
              ["Comparar ceteris paribus: personas iguales en habilidad, ingreso de los padres, etc., que solo difieren en la universidad.",
               ("Una muestra más grande.", "Más datos no eliminan las diferencias entre quienes terminan la universidad y quienes no."),
               ("Que la diferencia fuera mayor a 30%.", "El tamaño de la diferencia no dice nada sobre su causa.")], 0,
              "Es la respuesta de la lámina 6: ir a la universidad está asociado con otras características que también afectan el ingreso."),
         ],
         r=("Helados, tiburones y temperatura",
            "Simula 200 días en que la temperatura aumenta las ventas de helados y los ataques de tiburón, pero los helados **no** afectan los ataques. Compara la regresión con y sin la temperatura.",
            R_C1_T2, "cambia `0.1 * temperatura` por `0 * temperatura`. ¿Qué pasa con la correlación entre helados y ataques?")),
    dict(n=3, hora="20:05", inicio=(S1, 7), fin=(S1, 7), laminas="Parte 1 · lámina 7",
         titulo="La econometría en acción", corto="Econometría aplicada",
         pregunta="¿Cómo ayuda la econometría a decidir qué políticas funcionan?",
         quiz=[
             ("Según Miguel y Kremer (2004), ¿qué pasó al repartir pastillas antiparasitarias en colegios?",
              ["Mejoró la salud y bajó el ausentismo escolar, no solo de los tratados sino también de sus vecinos.",
               ("Solo mejoró la salud de quienes tomaron la pastilla.", "El estudio encontró efectos también en los vecinos de los tratados: externalidades."),
               ("No tuvo efectos medibles.", "La lámina 7 resume efectos en salud y asistencia que impulsaron la iniciativa Deworm the World.")], 0,
              "Por eso el título habla de <em>Treatment Externalities</em>: el tratamiento también beneficia a quienes no lo recibieron."),
             ("¿Qué tienen en común el estudio de Worms y el de consultorías en India (Bloom et al.)?",
              ["En ambos, el tratamiento se asignó por sorteo para medir su efecto causal.",
               ("Ambos usan solo series de tiempo.", "Ambos comparan grupos de colegios o empresas, no una sola serie en el tiempo."),
               ("Ambos miden solo correlaciones.", "Justamente, al sortear el tratamiento pueden interpretar la diferencia como causal.")], 0,
              "Son experimentos aleatorizados: la herramienta que veremos en la Clase 3 para eliminar el sesgo de selección."),
         ]),
    dict(n=4, hora="20:25", inicio=(S1, 8), fin=(S1, 11), laminas="Parte 1 · láminas 8–11",
         titulo="Tipos de datos", corto="Tipos de datos",
         pregunta="¿De dónde vienen los datos y qué forma tienen?",
         quiz=[
             ("Tienes el PIB trimestral de Chile, Perú y Colombia entre 2000 y 2024. ¿Qué tipo de datos son?",
              [("Corte transversal", "Sería corte transversal si fuera un solo período para muchos países."),
               ("Series de tiempo", "Sería una serie de tiempo si fuera un solo país."),
               "Datos de panel"], 2,
              "Es un <strong>panel</strong>: las mismas unidades (3 países) observadas en muchos períodos."),
             ("Una empresa sortea qué sucursales reciben un nuevo sistema de incentivos y compara las ventas. ¿Qué tipo de datos genera?",
              ["Experimentales",
               ("Pseudo-experimentales", "Serían pseudo-experimentales si el gerente eligiera las sucursales sin sorteo."),
               ("Observacionales", "Serían observacionales si cada sucursal decidiera si adoptarlo.")], 0,
              "La exposición la asigna el investigador <strong>en forma aleatoria</strong>: es un experimento (lámina 8)."),
         ],
         r=("Tres formas de datos",
            "Arma un ejemplo pequeño de cada tipo de datos de las láminas 9 a 11 y fíjate en qué cambia: las unidades, los períodos o ambos.",
            R_C1_T4, "agrega el año 2025 al panel (cambia `2022:2024` por `2022:2025` y `9` por `12`). ¿Cuántas filas tiene ahora?")),
    dict(n=5, hora="20:50", inicio=(S1, 12), fin=(S1, 15), laminas="Parte 1 · láminas 12–15",
         titulo="Población, muestra y parámetros", corto="Población y muestra",
         pregunta="¿Cómo podemos conocer a toda una población mirando solo una parte?",
         quiz=[
             ("El ingreso promedio de <em>todos</em> los hogares de Chile es un…",
              ["Parámetro",
               ("Estadístico", "Un estadístico se calcula sobre una muestra."),
               ("Variable", "La variable es el ingreso; su promedio en toda la población es el parámetro.")], 0,
              "Lámina 15: los parámetros describen a la población y normalmente se estiman con estadísticos muestrales."),
             ("Una fábrica de ampolletas quiere saber cuántas horas duran. ¿Por qué no las prueba todas?",
              ["Porque probarlas implica gastarlas: revisar toda la población es imposible en la práctica.",
               ("Porque una muestra siempre es más exacta que la población.", "Un censo perfecto sería exacto; se muestrea por costo o imposibilidad."),
               ("Porque la estadística lo prohíbe.", "No hay tal regla: se muestrea por razones prácticas.")], 0,
              "Lámina 14: imposibilidad física, costo y resultados que normalmente son adecuados."),
         ],
         r=("Muestra grande pero sesgada",
            "Una población de 100 000 votantes. Compara una muestra enorme tomada solo entre quienes tienen teléfono con una pequeña muestra aleatoria.",
            R_C1_T5, "aumenta la muestra sesgada de `20000` a `30000`. ¿Se acerca al parámetro?")),
    dict(n=6, hora="21:00", inicio=(S1, 16), fin=(S1, 19), laminas="Parte 1 · láminas 16–19",
         titulo="Métodos de muestreo", corto="Métodos de muestreo",
         pregunta="¿Cuál es la mejor manera de elegir la muestra?",
         quiz=[
             ("Sorteas uno de los primeros 10 clientes de una lista y luego eliges a cada décimo cliente. ¿Qué método es?",
              [("Aleatorio simple", "En el simple todas las muestras posibles tienen la misma probabilidad; aquí solo se sortea el punto de inicio."),
               "Aleatorio sistemático",
               ("Por conglomerados", "No se eligen grupos completos.")], 1,
              "Lámina 16: se ordena la población, se elige un inicio al azar y luego cada k-ésimo elemento."),
             ("Quieres estimar el ingreso promedio en Santiago. Las comunas son muy distintas entre sí, pero bastante homogéneas por dentro. ¿Qué método es más preciso para un mismo n?",
              ["Estratificado por comuna",
               ("Por conglomerados (sortear algunas comunas)", "Los conglomerados funcionan bien cuando cada grupo es heterogéneo, como un mini reflejo de la población."),
               ("No probabilístico, en lugares concurridos", "Sin selección aleatoria, la muestra no es representativa.")], 0,
              "Grupos homogéneos por dentro y distintos entre sí funcionan como <strong>estratos</strong>: muestrear en todos reduce la varianza (lámina 18)."),
             ("El Literary Digest encuestó a más de 2 millones de personas y se equivocó. ¿Por qué?",
              ["La muestra no era representativa: muchas personas no podían aparecer en ella.",
               ("La muestra era demasiado pequeña.", "Era gigantesca; el tamaño no corrige un mal método de selección."),
               ("Los encuestados mintieron.", "El problema principal fue quién podía ser encuestado.")], 0,
              "Lámina 13: una muestra es representativa si toda unidad puede aparecer con una probabilidad conocida."),
         ],
         r=("Estratificado contra aleatorio simple",
            "Simula tres comunas con ingresos muy distintos y compara 2 000 muestras de cada método: ¿cuál se equivoca menos?",
            R_C1_T6, "haz que las comunas se parezcan (cambia `500` y `1600` por `900`). ¿Sigue ganando el estratificado?")),
    dict(n=7, hora="21:15", inicio=(S1, 20), fin=(S1, 20), laminas="Parte 1 · lámina 20",
         titulo="Estadística descriptiva e inferencial", corto="Descriptiva e inferencial",
         pregunta="¿Cuándo una conclusión vale solo para los datos y cuándo para toda la población?",
         quiz=[
             ("Un profesor calcula el promedio de notas de <em>su</em> curso para informárselo al curso. ¿Qué estadística usa?",
              ["Descriptiva: la conclusión vale solo para ese curso.",
               ("Inferencial", "Sería inferencial si usara su curso para concluir algo sobre todos los estudiantes del país.")], 0,
              "Lámina 20: la estadística descriptiva saca conclusiones válidas solo para la muestra analizada."),
             ("Con una encuesta a 1 000 personas estimas la tasa de desempleo del país y su intervalo de confianza. ¿Qué estadística usas?",
              ["Inferencial",
               ("Descriptiva", "Estás generalizando de la muestra a toda la población.")], 0,
              "Generalizar a la población con un margen de error es inferencia: es lo que repasa la ayudantía."),
         ],
         r=("Describir e inferir",
            "Con 36 meses de ventas, primero describe la muestra y luego infiere la media poblacional, como en el ejemplo de la ayudantía.",
            R_C1_T7, "cambia los dos `36` por `144`. ¿Qué pasa con el ancho del intervalo?")),
    dict(n=8, ayudantia=True, inicio=(S1A, 1), fin=(S1A, 10), laminas="Parte 2 · Ayudantía · láminas 1–10",
         titulo="Estadística descriptiva", corto="Estadística descriptiva",
         pregunta="¿Cómo resumir muchos datos en pocos números y gráficos?",
         quiz=[
             ("En un boxplot, ¿qué representa la caja?",
              ["El 50% central de los datos, entre el primer y el tercer cuartil.",
               ("El rango completo de los datos.", "El rango completo lo marcan los bigotes y los atípicos, no la caja."),
               ("La media ± una desviación estándar.", "El boxplot se construye con cuartiles, no con la media ni la desviación estándar.")], 0,
              "Láminas 9–10: la caja va de q₁ a q₃ y la línea interior es la mediana."),
             ("Dos cursos tienen promedio 5.0. En el A las notas van de 4.8 a 5.2; en el B, de 2.0 a 7.0. ¿Qué estadístico los distingue?",
              ["La desviación estándar.",
               ("La media.", "Ambas medias son 5.0."),
               ("La mediana.", "Mide la posición central, que puede ser igual en ambos; aquí lo que cambia es la dispersión.")], 0,
              "Láminas 6–7: los estadísticos de dispersión miden cuán alejados están los datos de su centro."),
         ],
         r=("Media, mediana y un atípico",
            "Calcula los estadísticos de localización y dispersión de 15 sueldos con un valor atípico, y dibuja su histograma y su boxplot.",
            R_C1_A1, "elimina el `10000` del vector. ¿Cuánto cambia la media? ¿Y la mediana?")),
    dict(n=9, ayudantia=True, inicio=(S1E, 1), fin=(S1E, 14), laminas="Parte 3 · Ayudantía · láminas 1–14",
         titulo="TCL e intervalos de confianza para la media", corto="TCL e IC para la media",
         pregunta="¿Cuánto podemos confiar en un promedio calculado con una muestra?",
         quiz=[
             ("¿Qué dice el Teorema Central del Límite?",
              ["Con n grande, X̄ es aproximadamente normal, aunque la población no lo sea.",
               ("Con n grande, los datos de la población se vuelven normales.", "La población no cambia: lo que se vuelve normal es la distribución de X̄."),
               ("X̄ siempre es igual a μ.", "X̄ varía de muestra en muestra alrededor de μ, con varianza σ²/n.")], 0,
              "Láminas 3–4: X̄ ≈ N(μ, σ²/n) si n ≥ 30, o para cualquier n si la población es normal."),
             ("Con x̄ = 200, σ = 60 y n = 36, ¿cuál es el IC de 99% para μ?",
              [("(180.4; 219.6)", "Ese es el IC de 95% (z = 1.96)."),
               "(174.2; 225.8)",
               ("(183.6; 216.4)", "Ese es el de 90% (z = 1.645): más confianza exige un intervalo más ancho.")], 1,
              "200 ± 2.576 · 60/√36 = 200 ± 25.8. Pruébalo en la calculadora de intervalos."),
         ],
         r=("El TCL y el 95%",
            "Comprueba el TCL con una población muy asimétrica, reproduce el IC de la lámina 5 y verifica qué significa el 95%.",
            R_C1_A2, "cambia `0.975` por `0.995` en el IC. ¿El intervalo de 99% es más ancho o más angosto?")),
    dict(n=10, ayudantia=True, inicio=(S1E, 15), fin=(S1E, 24), laminas="Parte 3 · Ayudantía · láminas 15–24",
         titulo="Intervalos de confianza para proporciones", corto="IC para proporciones",
         pregunta="¿Cómo estimar un porcentaje, como la tasa de productos defectuosos?",
         quiz=[
             ("Con 19 defectuosos en 200 unidades, el IC de 95% es (0.054; 0.136). El proveedor dice que p = 0.05. ¿Qué concluyes?",
              ["Los datos no son coherentes con lo que afirma el proveedor: 0.05 queda fuera del intervalo.",
               ("El proveedor tiene razón, porque 0.05 está cerca de 0.054.", "Lo que importa es si el valor queda dentro o fuera del intervalo."),
               ("Con 200 unidades no se puede concluir nada.", "El intervalo ya incorpora la incertidumbre de usar 200 unidades.")], 0,
              "Es la conclusión de la lámina 21."),
             ("Sin información previa sobre p, ¿qué p* conviene usar para calcular el tamaño muestral?",
              ["0.5, porque maximiza p*(1 − p*) y da el n más conservador.",
               ("0.05", "Daría un n demasiado chico si en realidad p estuviera cerca de 0.5."),
               ("1", "Con p* = 1, p*(1 − p*) = 0 y el n calculado sería 0.")], 0,
              "Lámina 22: p* = 0.5 es el peor escenario."),
         ],
         r=("Productos defectuosos",
            "Reproduce el intervalo de la lámina 21 y calcula cuántas unidades harían falta para un error de ±3 puntos porcentuales.",
            R_C1_A3, "usa `p* = 0.095` en vez de `0.5` en el tamaño muestral. ¿Cuántas unidades necesitas ahora?")),
    dict(n=11, ayudantia=True, inicio=(S1E, 25), fin=(S1E, 34), laminas="Parte 3 · Ayudantía · láminas 25–34",
         titulo="Intervalos para la diferencia de medias", corto="IC para diferencia de medias",
         pregunta="¿Ganan distinto, en promedio, los egresados de dos carreras?",
         quiz=[
             ("El IC de 95% para μₓ − μᵧ es (106 756; 133 244). ¿Qué significa que no contenga al cero?",
              ["Que hay evidencia de que los salarios promedio de ambas carreras son distintos.",
               ("Que todos los ingenieros ganan más que todos los arquitectos.", "El intervalo se refiere a las medias, no a cada persona."),
               ("Que la diferencia es exactamente 120 000.", "120 000 es la estimación puntual; el intervalo da un rango de valores plausibles.")], 0,
              "Es la conclusión de la lámina 34."),
             ("Si aumentas nₓ y nᵧ (y lo demás no cambia), el intervalo para μₓ − μᵧ…",
              ["…se angosta.",
               ("…se ensancha.", "El error estándar √(σₓ²/nₓ + σᵧ²/nᵧ) baja al crecer las muestras."),
               ("…no cambia.", "El error estándar depende de los tamaños muestrales.")], 0,
              "Más datos, menos incertidumbre: el error estándar disminuye."),
         ],
         r=("Ingeniería contra arquitectura",
            "Reproduce el intervalo de la lámina 33 para la diferencia de salarios promedio.",
            R_C1_A4, "¿cuánto tendría que valer `ybar` para que el intervalo contuviera al cero? Pruébalo.")),
]

# --------------------------------------------------------------------------------------------
# Clase 2 · temas
# --------------------------------------------------------------------------------------------
S2 = "sem2/clase2.tex"

R_C2_T1 = r'''
set.seed(1)
n <- 100
educacion <- sample(8:20, n, replace = TRUE)
u <- rnorm(n, sd = 3)                    # todo lo demás que afecta el salario
salario <- 0.1 + 0.55 * educacion + u    # beta0 = 0.1, beta1 = 0.55

plot(educacion, salario, pch = 19, col = "steelblue",
     main = "Cada punto se aleja de la recta en su u")
abline(a = 0.1, b = 0.55, lwd = 2)       # la FRP: E[salario | educacion]
'''

R_C2_T2 = r'''
set.seed(2)
n <- 5000
habilidad <- rnorm(n)                     # está en u: no la observamos

# Caso 1: la educación no depende de la habilidad -> E[u | x] = 0
educ1 <- rnorm(n, 12, 2)
sal1  <- 1 + 0.5 * educ1 + 2 * habilidad + rnorm(n)

# Caso 2: los más hábiles estudian más -> E[u | x] cambia con x
educ2 <- 12 + 1.5 * habilidad + rnorm(n)
sal2  <- 1 + 0.5 * educ2 + 2 * habilidad + rnorm(n)

c(caso1 = unname(coef(lm(sal1 ~ educ1))[2]),
  caso2 = unname(coef(lm(sal2 ~ educ2))[2]))   # verdadero: 0.5

# Promedio de u por tramos de educación en el caso 2: ¡no es cero!
tapply(2 * habilidad, cut(educ2, 4), mean)
'''

R_C2_T3 = r'''
set.seed(3)
x <- runif(50, 8, 20)
y <- 0.1 + 0.55 * x + rnorm(50, sd = 3)

b1 <- sum((x - mean(x)) * (y - mean(y))) / sum((x - mean(x))^2)
b0 <- mean(y) - b1 * mean(x)
c(b0 = b0, b1 = b1)
coef(lm(y ~ x))                        # lo mismo

# MCO = la recta con la menor suma de residuos al cuadrado
ssr <- function(b) sum((y - b[1] - b[2] * x)^2)
optim(c(0, 0), ssr)$par                # búsqueda numérica del mínimo
c(MCO = ssr(c(b0, b1)), otra_recta = ssr(c(b0, b1 + 0.1)))
'''

R_C2_T4 = r'''
set.seed(4)
educacion <- sample(8:20, 200, replace = TRUE)
salario   <- 0.1 + 0.55 * educacion + rnorm(200, sd = 3)
m     <- lm(salario ~ educacion)
u_hat <- resid(m)
y_hat <- fitted(m)

# Propiedades aritméticas (lámina 20)
round(c(suma_residuos = sum(u_hat),
        suma_x_por_residuo = sum(educacion * u_hat),
        media_y = mean(salario), media_y_hat = mean(y_hat)), 6)
round(unname(coef(m)[1] + coef(m)[2] * mean(educacion) - mean(salario)), 10)  # = 0

# Predicción para 12 años con la recta de la lámina 19 y con la nuestra
0.095 + 0.54 * 12
predict(m, newdata = data.frame(educacion = 12))
'''

R_C2_T5 = r'''
set.seed(5)
x <- runif(80, 8, 20)
y <- 0.1 + 0.55 * x + rnorm(80, sd = 3)

# Análogos muestrales: (1/n) Σ u = 0 y (1/n) Σ x u = 0, con u = y − b0 − b1 x
# Es un sistema lineal en (b0, b1):  A b = c
A <- rbind(c(1,       mean(x)),
           c(mean(x), mean(x^2)))
c_vec <- c(mean(y), mean(x * y))
solve(A, c_vec)          # estimadores de momentos
coef(lm(y ~ x))          # = MCO
'''

R_C2_T6 = r'''
set.seed(6)
ingreso <- runif(150, 300000, 2000000)          # en pesos
gasto   <- 50000 + 0.6 * ingreso + rnorm(150, sd = 150000)
m <- lm(gasto ~ ingreso)

SST <- sum((gasto - mean(gasto))^2)
SSE <- sum((fitted(m) - mean(gasto))^2)
SSR <- sum(resid(m)^2)
c(SST = SST, SSE_mas_SSR = SSE + SSR)           # iguales
c(R2_a_mano = SSE / SST, R2_lm = summary(m)$r.squared)

# Cambio de unidades: ingreso en miles de pesos
ingreso_miles <- ingreso / 1000
m2 <- lm(gasto ~ ingreso_miles)
rbind(pesos = coef(m), miles = coef(m2))  # pendiente × 1 000
summary(m2)$r.squared                     # el R² no cambia
'''

R_C2_T7 = r'''
set.seed(7)
n <- 50
sigma <- 3
x <- runif(n, 8, 20)                    # x fija entre muestras
b1 <- replicate(5000, {
  y <- 0.1 + 0.55 * x + rnorm(n, sd = sigma)
  coef(lm(y ~ x))[2]
})
mean(b1)                                # ≈ 0.55: insesgado
c(var_simulada = var(b1),
  var_formula = sigma^2 / sum((x - mean(x))^2))

hist(b1, breaks = 40, main = "5 000 estimaciones de beta1",
     xlab = "beta1 gorro")
abline(v = 0.55, lwd = 2)
'''

C2_TEMAS = [
    dict(n=1, hora="18:40", inicio=(S2, 1), fin=(S2, 4), laminas="láminas 1–4",
         titulo="El modelo de regresión lineal simple", corto="El modelo RLS",
         pregunta="¿Cómo escribir que el salario depende de la educación… y de todo lo demás?",
         quiz=[
             ("En salario = β₀ + β₁·educación + u, ¿qué es u?",
              ["Todos los factores que afectan el salario y no están en el modelo: habilidad, experiencia, suerte…",
               ("El error de la estimación por MCO.", "Ese es el residuo û, que se calcula con la muestra; u es poblacional y no se observa."),
               ("Un número fijo que se suma al salario.", "Ese papel lo cumple β₀.")], 0,
              "Láminas 3–4: el término de error reúne todo lo que afecta a y además de x."),
             ("En y = β₀ + β₁x + u, ¿cómo se llama y?",
              ["Variable dependiente (o explicada)",
               ("Variable independiente", "Esa es x, la variable explicativa."),
               ("Término de error", "Ese es u.")], 0,
              "Lámina 2: terminología del modelo de regresión simple."),
         ],
         r=("La función de regresión poblacional",
            "Simula 100 personas con un modelo conocido y dibuja la FRP. Cada punto se aleja de la recta en su propio u.",
            R_C2_T1, "cambia `sd = 3` por `sd = 0.5`. ¿Qué pasa con la nube de puntos?")),
    dict(n=2, hora="19:05", inicio=(S2, 5), fin=(S2, 11), laminas="láminas 5–11",
         titulo="El supuesto clave y la regresión poblacional", corto="E[u|x] = 0 y la FRP",
         pregunta="¿Qué tiene que cumplir u para que β₁ mida el efecto de x?",
         quiz=[
             ("Si u incluye la habilidad, y las personas más hábiles estudian más, ¿qué supuesto falla?",
              ["E[u | x] = 0: el promedio de u cambia con la educación.",
               ("E[u] = 0", "Ese se cumple siempre que el modelo tenga intercepto; el problema es que u dependa de x."),
               ("Ninguno: la habilidad no está en el modelo.", "Justamente por no estar en el modelo, la habilidad queda en u.")], 0,
              "Láminas 6–7: si la habilidad está en u y se relaciona con la educación, E[u | x] ≠ 0."),
             ("La función de regresión poblacional E[y | x] = β₀ + β₁x describe…",
              ["…cómo cambia el valor promedio de y según x.",
               ("…el valor exacto de y de cada persona.", "Cada persona se aleja del promedio en su u."),
               ("…la recta estimada con la muestra.", "Esa es la regresión muestral (FRM), con β̂.")], 0,
              "Láminas 8–10: la FRP es una esperanza condicional."),
         ],
         r=("Cuando E[u | x] no es cero",
            "Compara dos mundos: uno en que la habilidad no se relaciona con la educación y otro en que los más hábiles estudian más. El verdadero β₁ es 0.5 en ambos.",
            R_C2_T2, "cambia `1.5 * habilidad` por `-1.5 * habilidad`. ¿Hacia dónde se mueve la estimación del caso 2?")),
    dict(n=3, hora="19:30", inicio=(S2, 12), fin=(S2, 15), laminas="láminas 12–15",
         titulo="Estimar por mínimos cuadrados ordinarios", corto="MCO",
         pregunta="De todas las rectas posibles, ¿cuál elegimos?",
         quiz=[
             ("¿Qué minimiza MCO?",
              ["La suma de los residuos al cuadrado, Σûᵢ².",
               ("La suma de los residuos, Σûᵢ.", "Muchas rectas tienen Σûᵢ = 0 (los errores se cancelan); por eso se elevan al cuadrado."),
               ("La distancia horizontal entre los puntos y la recta.", "MCO mide distancias verticales, en y.")], 0,
              "Lámina 13. Juégalo en el simulador de cuadrados."),
             ("β̂₁ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)². ¿Qué pasa si todas las x son iguales?",
              ["No se puede calcular: el denominador es cero.",
               ("β̂₁ = 0", "No es cero: es una división por cero. Sin variación en x no se puede estimar la pendiente."),
               ("β̂₁ = ȳ", "ȳ sería el intercepto de un modelo sin x.")], 0,
              "Por eso se necesita variación en x (supuesto RLS 3)."),
         ],
         r=("MCO a mano",
            "Calcula β̂₀ y β̂₁ con las fórmulas de la lámina 14, compáralos con `lm()` y comprueba que ninguna otra recta tiene menor suma de residuos al cuadrado.",
            R_C2_T3, "prueba otra recta en la última línea, por ejemplo `c(b0 + 1, b1)`. ¿Su SSR es mayor o menor?")),
    dict(n=4, hora="20:05", inicio=(S2, 16), fin=(S2, 20), laminas="láminas 16–20",
         titulo="La regresión muestral y sus propiedades", corto="Regresión muestral",
         pregunta="Una vez estimada la recta, ¿qué propiedades cumple siempre?",
         quiz=[
             ("Con salario estimado = 0.095 + 0.54·educación, ¿cuál es el salario predicho para 12 años de educación?",
              ["6.58 dólares por hora",
               ("6.48 dólares por hora", "Falta sumar el intercepto 0.095."),
               ("0.54 dólares por hora", "0.54 es la pendiente: el cambio por cada año adicional.")], 0,
              "0.095 + 0.54 · 12 = 6.575. Pruébalo en el simulador de predicción."),
             ("¿Cuál de estas afirmaciones NO se cumple siempre en MCO con intercepto?",
              [("Σûᵢ = 0", "Se cumple siempre: es la primera condición de primer orden."),
               ("La recta pasa por (x̄, ȳ).", "Se cumple siempre: es la propiedad 4 de la lámina 20."),
               "Todos los residuos ûᵢ son pequeños."], 2,
              "Las propiedades de la lámina 20 son algebraicas; cada residuo puede ser grande."),
         ],
         r=("Las propiedades, número a número",
            "Estima una regresión y verifica las cuatro propiedades aritméticas de la lámina 20. Después predice el salario para 12 años de educación.",
            R_C2_T4, "predice el salario para 16 años de educación con `predict()`.")),
    dict(n=5, hora="20:30", inicio=(S2, 21), fin=(S2, 23), laminas="láminas 21–23",
         titulo="Método de momentos", corto="Método de momentos",
         pregunta="¿Hay otra forma de llegar a los mismos estimadores?",
         quiz=[
             ("El método de momentos reemplaza E[u] = 0 y E[xu] = 0 por…",
              ["…sus análogos muestrales: (1/n)Σûᵢ = 0 y (1/n)Σxᵢûᵢ = 0.",
               ("…la condición de que el R² sea máximo.", "El método usa las condiciones de momentos, no el R²."),
               ("…un supuesto de normalidad.", "No se necesita normalidad.")], 0,
              "Láminas 21–22."),
             ("En la regresión simple, ¿qué relación hay entre los estimadores de momentos y los de MCO?",
              ["Son idénticos.",
               ("Los de momentos son siempre más precisos.", "Son exactamente los mismos números."),
               ("Solo coinciden si n > 30.", "Coinciden para cualquier n: las ecuaciones son las mismas que las condiciones de primer orden de MCO.")], 0,
              "Lámina 23: las condiciones de primer orden de MCO son las mismas ecuaciones."),
         ],
         r=("Resolver los momentos",
            "Escribe las dos condiciones de momentos como un sistema lineal, resuélvelo con `solve()` y compara con MCO.",
            R_C2_T5, "cambia el tamaño de la muestra de `80` a `8` (en las dos líneas). ¿Siguen coincidiendo?")),
    dict(n=6, hora="20:45", inicio=(S2, 24), fin=(S2, 26), laminas="láminas 24–26",
         titulo="Bondad de ajuste y unidades de medida", corto="R² y unidades",
         pregunta="¿Qué tan bien explica x la variación de y?",
         quiz=[
             ("Si R² = 0.30, ¿qué significa?",
              ["Que el 30% de la variación muestral de y se explica por x.",
               ("Que x causa el 30% de y.", "El R² mide ajuste, no causalidad."),
               ("Que el modelo está mal especificado.", "Un R² bajo es común con datos individuales y no invalida la regresión.")], 0,
              "Lámina 25: R² = SSE/SST."),
             ("Si la variable x pasa de pesos a miles de pesos (se divide por 1 000), ¿qué pasa?",
              ["β̂₁ se multiplica por 1 000 y el R² no cambia.",
               ("β̂₁ se divide por 1 000 y el R² no cambia.", "Si x se divide por c, la pendiente se multiplica por c (lámina 26)."),
               ("Cambian β̂₁ y el R².", "El R² no depende de las unidades de medida.")], 0,
              "Lámina 26. Pruébalo en el simulador de unidades."),
         ],
         r=("SST = SSE + SSR",
            "Verifica la descomposición de la varianza, calcula el R² a mano y cambia las unidades de x.",
            R_C2_T6, "en vez de dividir el ingreso, divide el gasto por 1 000. ¿Qué coeficientes cambian?")),
    dict(n=7, hora="21:05", inicio=(S2, 27), fin=(S2, 34), laminas="láminas 27–34",
         titulo="Supuestos, insesgamiento y varianza", corto="Supuestos y propiedades",
         pregunta="¿Cuándo podemos confiar en que MCO acierta en promedio, y con cuánta precisión?",
         quiz=[
             ("¿Qué supuesto exige que no todos los valores muestrales de x sean iguales?",
              ["RLS 3",
               ("RLS 2", "RLS 2 es el muestreo aleatorio."),
               ("RLS 5", "RLS 5 es la homocedasticidad: Var(u | x) = σ².")], 0,
              "Lámina 29: sin variación en x no se puede calcular β̂₁."),
             ("Que β̂₁ sea insesgado significa que…",
              ["…en promedio sobre muchas muestras, β̂₁ es igual a β₁.",
               ("…en cada muestra, β̂₁ = β₁.", "Cada muestra da un β̂₁ distinto; el insesgamiento habla del promedio."),
               ("…β̂₁ tiene varianza cero.", "La varianza la mide la fórmula de la lámina 34, y no es cero.")], 0,
              "Láminas 31–32: con RLS 1–4, E[β̂₁] = β₁."),
         ],
         r=("Insesgamiento y varianza por simulación",
            "Repite 5 000 veces la muestra: el promedio de β̂₁ debería ser el β₁ verdadero, y su varianza, la de la fórmula de la lámina 34.",
            R_C2_T7, "cambia `sd = sigma` por `sd = 0.3 * x` (el error crece con x). ¿Sigue siendo insesgado? ¿Coincide la fórmula?")),
]

# --------------------------------------------------------------------------------------------
# Clase 4 · temas
# --------------------------------------------------------------------------------------------
S4, S4A = "sem4/Clase5.tex", "sem4/calculo_matrices.tex"

R_C4_DATOS = '''experiencia <- c(12, 18, 14, 12, 11)
educacion   <- c(93, 119, 108, 96, 74)
salario     <- c(769, 808, 825, 650, 562)'''

R_C4_T1 = r'''
set.seed(1)
n         <- 1000
IQ        <- rnorm(n, 100, 15)
educacion <- 12 + 0.1 * (IQ - 100) + rnorm(n, sd = 2)   # más IQ, más educación
salario   <- 1 + 0.37 * educacion + 0.05 * IQ + rnorm(n, sd = 2)

coef(lm(salario ~ educacion))        # simple: mezcla educación e IQ
coef(lm(salario ~ educacion + IQ))   # múltiple: educación con IQ fijo
'''

R_C4_T2 = r'''
set.seed(2)
n  <- 200
x1 <- rnorm(n)
x2 <- rnorm(n)
x3 <- rnorm(n)
y  <- 1 + 2 * x1 - 1 * x2 + 0.5 * x3 + rnorm(n)

m <- lm(y ~ x1 + x2 + x3)
coef(m)
u <- resid(m)
# Las k + 1 = 4 condiciones de primer orden: Σû = 0 y Σ xj û = 0
round(c(sum(u), sum(x1 * u), sum(x2 * u), sum(x3 * u)), 10)
'''

R_C4_T3 = r'''
# Datos de la lámina 8 (y del ejercicio de la ayudantía)
''' + R_C4_DATOS + r'''

X <- cbind(unos = 1, experiencia, educacion)   # n × (k + 1)
y <- salario
X
dim(X)
t(X) %*% X        # XᵀX: (k + 1) × (k + 1)
t(X) %*% y        # Xᵀy
'''

R_C4_T4 = R_C4_DATOS + r'''
X <- cbind(1, experiencia, educacion)
y <- salario

beta <- solve(t(X) %*% X) %*% t(X) %*% y     # (XᵀX)⁻¹ Xᵀy
beta
coef(lm(salario ~ experiencia + educacion))  # lo mismo

u_hat <- y - X %*% beta
round(t(X) %*% u_hat, 8)                     # Xᵀû = 0
'''

R_C4_T5 = r'''
set.seed(5)
n <- 30
x <- rnorm(n)
y <- 1 + 2 * x + rnorm(n, sd = 2)
r2 <- function(m) c(R2 = summary(m)$r.squared,
                    R2_ajustado = summary(m)$adj.r.squared)

basura <- matrix(rnorm(n * 10), n, 10)  # 10 variables sin relación con y
rbind(solo_x     = r2(lm(y ~ x)),
      x_y_basura = r2(lm(y ~ x + basura)))
'''

R_C4_T6 = r'''
datos <- data.frame(
  experiencia = c(12, 18, 14, 12, 11),
  educacion   = c(93, 119, 108, 96, 74),
  y_sal       = c(769, 808, 825, 650, 562)
)
m <- lm(y_sal ~ experiencia + educacion, data = datos)
summary(m)                 # compárala con la lámina 25

# R² ajustado a mano, con n = 5 y k = 2
R2 <- summary(m)$r.squared
1 - (5 - 1) / (5 - 2 - 1) * (1 - R2)
fitted(m)                  # ŷ = X beta gorro
'''

R_C4_A = r'''
experiencia <- c(12, 18, 14, 12, 11)
educacion   <- c(93, 119, 108, 96, 74)
X <- cbind(1, experiencia, educacion)
A <- t(X) %*% X
det(A)

# Cofactor (i, j) = (−1)^(i + j) · determinante del menor sin fila i ni columna j
cof <- matrix(0, 3, 3)
for (i in 1:3) for (j in 1:3) cof[i, j] <- (-1)^(i + j) * det(A[-i, -j])
adjunta <- t(cof)
inversa <- adjunta / det(A)

round(inversa, 4)
round(solve(A), 4)          # la inversa que calcula R: igual
round(A %*% inversa, 10)    # la identidad
'''

C4_TEMAS = [
    dict(n=1, hora="18:40", inicio=(S4, 1), fin=(S4, 3), laminas="Parte 1 · láminas 1–3",
         titulo="Del modelo simple al múltiple", corto="Del simple al múltiple",
         pregunta="¿Cómo medir el efecto de la educación dejando fija la inteligencia?",
         quiz=[
             ("Con salario = 0.065 + 0.37·educación + 0.20·IQ, dos personas tienen el mismo IQ y una tiene un año más de educación. ¿Cuánto difiere su salario esperado?",
              ["0.37",
               ("0.54", "Ese es el coeficiente de la regresión simple, que no deja fijo el IQ."),
               ("0.57", "No se suman los coeficientes: el IQ está fijo.")], 0,
              "Lámina 2: cada β es una derivada parcial, con las demás variables incluidas constantes."),
             ("¿Por qué el coeficiente de educación baja de 0.54 a 0.37 al agregar el IQ?",
              ["Porque en la regresión simple la educación captaba también parte del efecto del IQ.",
               ("Porque agregar variables siempre achica los coeficientes.", "Pueden subir, bajar o quedar igual: depende de β₂ y δ₁."),
               ("Porque el IQ importa más que la educación.", "Comparar 0.37 con 0.20 no dice eso: las variables están en unidades distintas.")], 0,
              "Es el sesgo por variable omitida de la Clase 3: β̃₁ = β₁ + β₂δ₁ con β₂ &gt; 0 y δ₁ &gt; 0."),
         ],
         r=("Simple contra múltiple",
            "Simula educación, IQ y salario. Compara el coeficiente de educación sin y con el IQ en la regresión.",
            R_C4_T1, "cambia `0.1 * (IQ - 100)` por `0 * (IQ - 100)`. ¿Siguen siendo distintos los dos coeficientes?")),
    dict(n=2, hora="19:05", inicio=(S4, 4), fin=(S4, 5), laminas="Parte 1 · láminas 4–5",
         titulo="MCO con k variables", corto="MCO con k variables",
         pregunta="¿Qué cambia en MCO cuando hay más de una variable explicativa?",
         quiz=[
             ("Con k variables explicativas, ¿cuántas condiciones de primer orden tiene MCO?",
              [("k", "Falta la condición del intercepto."),
               "k + 1",
               ("n", "Hay una por parámetro, no una por observación.")], 1,
              "Lámina 5: una ecuación por cada β̂, incluido β̂₀."),
             ("Las condiciones de primer orden implican que los residuos…",
              ["…suman cero y no están correlacionados con ninguna x incluida.",
               ("…son todos iguales a cero.", "Los residuos individuales no son cero; lo son sus sumas ponderadas."),
               ("…tienen distribución normal.", "Las condiciones de primer orden no dicen nada sobre la distribución.")], 0,
              "Son las mismas propiedades de la regresión simple, ahora para cada xⱼ."),
         ],
         r=("Las k + 1 condiciones",
            "Estima un modelo con tres variables y comprueba que se cumplen las cuatro condiciones de primer orden.",
            R_C4_T2, "agrega una cuarta variable `x4 <- rnorm(n)` al modelo. ¿Cuántas condiciones hay que verificar ahora?")),
    dict(n=3, hora="19:25", inicio=(S4, 6), fin=(S4, 9), laminas="Parte 1 · láminas 6–9",
         titulo="Notación matricial", corto="Notación matricial",
         pregunta="¿Cómo escribir n ecuaciones en una sola línea?",
         quiz=[
             ("En y = Xβ + u, con n = 5 y dos variables explicativas, ¿qué dimensión tiene β?",
              ["3 × 1",
               ("2 × 1", "Falta β₀: la columna de unos también tiene su parámetro."),
               ("5 × 1", "Esa es la dimensión de y y de u.")], 0,
              "β tiene un elemento por parámetro: k + 1 = 3."),
             ("¿Para qué sirve la columna de unos en X?",
              ["Para que el modelo tenga intercepto, β₀.",
               ("Para normalizar las variables.", "Los unos no cambian las variables: acompañan a β₀."),
               ("Para que XᵀX sea simétrica.", "XᵀX es simétrica siempre, tenga o no la columna de unos.")], 0,
              "Láminas 7–8: la primera columna de X es de unos."),
         ],
         r=("Arma X con los datos de la lámina",
            "Construye la matriz X del ejemplo de la lámina 8 y calcula XᵀX y Xᵀy. Compara Xᵀy con la lámina 22.",
            R_C4_T3, "agrega una tercera variable, por ejemplo `edad <- c(30, 41, 35, 29, 26)`, a X. ¿Qué dimensión tiene ahora XᵀX?")),
    dict(n=4, hora="20:05", inicio=(S4, 10), fin=(S4, 12), laminas="Parte 1 · láminas 10–12",
         titulo="La fórmula de MCO y sus propiedades", corto="β̂ = (XᵀX)⁻¹Xᵀy",
         pregunta="¿De dónde sale β̂ = (XᵀX)⁻¹Xᵀy?",
         quiz=[
             ("Si X es n × (k + 1), ¿qué dimensión tiene XᵀX?",
              ["(k + 1) × (k + 1)",
               ("n × n", "Ese sería XXᵀ."),
               ("n × (k + 1)", "Esa es la dimensión de X.")], 0,
              "XᵀX es cuadrada, del tamaño del número de parámetros."),
             ("La condición Xᵀû = 0 significa que…",
              ["…los residuos son ortogonales a cada columna de X, incluida la de unos.",
               ("…todos los residuos son cero.", "Cada residuo puede ser distinto de cero."),
               ("…X no tiene inversa.", "Xᵀû = 0 vale siempre en MCO; es XᵀX la que debe ser invertible.")], 0,
              "Lámina 12: propiedades algebraicas de MCO en forma matricial."),
         ],
         r=("La fórmula en R",
            "Calcula β̂ = (XᵀX)⁻¹Xᵀy con matrices, compáralo con `lm()` y verifica que Xᵀû = 0.",
            R_C4_T4, "duplica una columna: usa `X <- cbind(1, experiencia, experiencia)`. ¿Qué error da `solve()` y por qué?")),
    dict(n=5, hora="20:35", inicio=(S4, 13), fin=(S4, 14), laminas="Parte 1 · láminas 13–14",
         titulo="R² y R² ajustado", corto="R² y R² ajustado",
         pregunta="¿Mejora el modelo cada vez que agregamos una variable?",
         quiz=[
             ("Con n = 5, k = 2 y R² = 0.7751, ¿cuánto vale el R² ajustado?",
              ["0.5501",
               ("0.7751", "Ese es el R² sin ajustar."),
               ("0.8876", "El R² ajustado nunca supera al R².")], 0,
              "1 − (4/2)·(1 − 0.7751) = 0.5501, como en la salida de R de la lámina 25."),
             ("¿Puede el R² ajustado ser negativo?",
              ["Sí, cuando el modelo explica muy poco y tiene muchas variables respecto de n.",
               ("No, siempre está entre 0 y 1.", "Eso vale para el R²; el ajustado puede quedar bajo cero.")], 0,
              "La penalización (n − 1)/(n − k − 1) puede superar lo que explica el modelo."),
         ],
         r=("La trampa del R²",
            "Agrega 10 variables sin ninguna relación con y y compara el R² con el R² ajustado.",
            R_C4_T5, "agrega 20 variables basura (cambia los dos `10` por `20`). ¿Qué pasa con el R² ajustado?")),
    dict(n=6, hora="20:55", inicio=(S4, 15), fin=(S4, 25), laminas="Parte 1 · láminas 15–25",
         titulo="El ejemplo numérico y la salida en R", corto="Ejemplo y salida en R",
         pregunta="¿Cómo se ven todos estos cálculos en una salida de R?",
         quiz=[
             ("En la lámina 25, el coeficiente de experiencia es −16.79 con p-valor 0.642. ¿Qué indica?",
              ["Que con 5 datos la estimación es muy imprecisa: no hay evidencia de un efecto de la experiencia.",
               ("Que un año más de experiencia baja el salario en 16.79, con certeza.", "El p-valor alto indica justamente que la estimación es muy incierta."),
               ("Que hay un error de cálculo.", "Con tan pocos datos un signo inesperado es posible: el cálculo es correcto.")], 0,
              "Con n = 5 y 3 parámetros quedan 2 grados de libertad: los errores estándar son enormes."),
             ("Una vez calculado β̂, ¿cómo se obtienen las predicciones ŷ?",
              ["ŷ = Xβ̂",
               ("ŷ = (XᵀX)⁻¹Xᵀ", "Esa matriz, multiplicada por y, da β̂, no ŷ."),
               ("ŷ = Xᵀy", "Xᵀy es un vector de k + 1 sumas, no de n predicciones.")], 0,
              "Lámina 22."),
         ],
         r=("La salida de la lámina 25",
            "Reproduce la regresión de la lámina 25 con los 5 datos y calcula el R² ajustado a mano.",
            R_C4_T6, "agrega un sexto individuo a los datos (por ejemplo, 15, 100 y 700). ¿Cómo cambian los errores estándar?")),
    dict(n=7, ayudantia=True, inicio=(S4A, 1), fin=(S4A, 7), laminas="Parte 2 · Ayudantía · secciones 1–7",
         titulo="La inversa de XᵀX por cofactores", corto="Inversa por cofactores",
         pregunta="¿Cómo se invierte a mano una matriz de 3 × 3?",
         quiz=[
             ("¿Cuándo existe la inversa de A = XᵀX?",
              ["Cuando det(A) ≠ 0.",
               ("Siempre que A sea cuadrada.", "Una matriz cuadrada con determinante cero no tiene inversa."),
               ("Cuando todos sus elementos son positivos.", "El signo de los elementos no importa: importa el determinante.")], 0,
              "A⁻¹ = adj(A)/det(A): con det(A) = 0 habría que dividir por cero."),
             ("La matriz adjunta es…",
              ["…la transpuesta de la matriz de cofactores.",
               ("…la matriz de menores.", "Los menores son el paso 1; luego se les aplica el signo (cofactores) y se transpone."),
               ("…la inversa de A.", "A⁻¹ = adj(A)/det(A).")], 0,
              "Paso 3 del documento."),
         ],
         r=("Cofactores en R",
            "Repite los 5 pasos del documento: determinante, cofactores, adjunta e inversa, y compara con `solve()`.",
            R_C4_A, "calcula β̂ con tu inversa: `inversa %*% t(X) %*% c(769, 808, 825, 650, 562)`.")),
]


C1_AGENDA = "\n" + ruta(C1_TEMAS, (2, "19:55"), ("21:25", "✅ Ideas clave, autoevaluación y cierre"),
                      previo=("18:40", "🎓 Presentación del curso: programa, evaluaciones, cátedra + ayudantía y trabajo práctico"))
C2_AGENDA = "\n" + ruta(C2_TEMAS, (3, "19:55"), ("21:25", "✅ Ideas clave, autoevaluación y cierre"))
C4_AGENDA = "\n" + ruta(C4_TEMAS, (3, "19:55"), ("21:20", "✅ Ideas clave, autoevaluación y cierre"))


CLASES = {
    1: dict(out="docs/clases/clase1.md", cabecera=C1_CABECERA + C1_AGENDA, cierre=C1_CIERRE, temas=C1_TEMAS,
            fuentes=[("sem1/clase1.tex", "Parte 1 · Introducción a la econometría"),
                     ("sem1/repaso_ayudantia.tex", "Parte 2 · Ayudantía · Repaso de estadística descriptiva",
                      '!!! note "Material de ayudantía"\n'
                      '    Las Partes 2 y 3 no se ven en la cátedra del viernes: se trabajan en la **ayudantía** de la semana.'),
                     ("sem1/repaso_estadistica.tex", "Parte 3 · Ayudantía · Repaso de estadística inferencial")],
            insertar=C1_INSERTAR, plegar=C1_PLEGAR),
    2: dict(out="docs/clases/clase2.md", cabecera=C2_CABECERA + C2_AGENDA, cierre=C2_CIERRE, temas=C2_TEMAS,
            fuentes=[("sem2/clase2.tex", "Parte 1 · Regresión lineal simple")],
            insertar=C2_INSERTAR, plegar={}),
    3: dict(out="docs/clases/clase3.md", cabecera=C3_CABECERA + C3_AGENDA, cierre=C3_CIERRE,
            fuentes=[("sem3/Clase3.tex", "Parte 1 · Causalidad y sesgo de selección"),
                     ("sem3/Clase4.tex", "Parte 2 · Sesgo por variable omitida")],
            insertar=C3_INSERTAR, plegar={}, temas=C3_TEMAS),
    4: dict(out="docs/clases/clase4.md", cabecera=C4_CABECERA + C4_AGENDA, cierre=C4_CIERRE, temas=C4_TEMAS,
            fuentes=[("sem4/Clase5.tex", "Parte 1 · Regresión lineal múltiple: estimación"),
                     ("sem4/calculo_matrices.tex", "Parte 2 · Ayudantía · Ejercicio: la inversa de XᵀX por cofactores",
                      '!!! note "Material de ayudantía/taller"\n'
                      '    Este ejercicio no se ve en la cátedra del viernes: se trabaja en la **ayudantía/taller** de la semana. '
                      'Mantiene el formato numérico del documento original (punto para los miles, coma decimal).')],
            insertar=C4_INSERTAR, plegar={}, pasos={("sem4/Clase5.tex", 15): 22}),
}


def plegar(titulo, cuerpo):
    lines = "\n".join("    " + l if l.strip() else "" for l in cuerpo.split("\n"))
    return f'??? success "{titulo}"\n{lines}'


def norm(t):
    return re.sub(r"[^a-z0-9]", "", t.lower())


def toc_plano(t):
    """Etiqueta del índice lateral sin LaTeX: "Bondad de Ajuste: $R^2$" -> "Bondad de Ajuste: R²"."""
    griegas = {"alpha": "α", "beta": "β", "sigma": "σ", "mu": "μ", "delta": "δ", "epsilon": "ε"}
    t = re.sub(r"\\(alpha|beta|sigma|mu|delta|epsilon)", lambda m: griegas[m.group(1)], t)
    t = t.replace("^2", "²").replace("$", "")
    return re.sub(r"[\\{}_]", "", t).strip()


def atributos(**kw):
    """Atributos para attr_list: { .clase clave="valor" }."""
    partes = []
    for k, v in kw.items():
        if k == "cls":
            partes.extend("." + c for c in v.split())
        elif v:
            partes.append(f'{k.replace("_", "-")}="{v}"')
    return "{ " + " ".join(partes) + " }"


def rango(a, b):
    return f"Lámina {a}" if a == b else f"Láminas {a}–{b}"


def generar(n):
    cfg = CLASES[n]
    temas = cfg.get("temas", [])
    partes = [cfg["cabecera"].strip().replace("<!--COMO-ESTUDIAR-->\n", como_estudiar(n, temas) if temas else "")]
    # Con temas, las láminas bajan un nivel (h4) para que el índice muestre Parte > Tema > Lámina
    hx = "####" if temas else "###"
    insertar = dict(cfg["insertar"])
    antes = {}
    for t in temas:
        antes[t["inicio"]] = tema_encabezado(t)
        fin = [insertar[t["fin"]]] if t["fin"] in insertar else []
        insertar[t["fin"]] = "\n\n".join(fin + [practica(t)] + ([r_ejercicio(t)] if t.get("r") else []))
    for tex, titulo, *extra in cfg["fuentes"]:
        fr = convert(SLIDES / tex, REPO, SLIDES)
        ayud = "Ayudantía" in titulo
        tipo = "Ayudantía" if ayud else "Cátedra"
        segs = [x.strip() for x in titulo.split("·")]
        nombre = segs[-1]
        parte = next((x for x in segs if x.startswith("Parte")), "")
        eyebrow = f"{parte} · {tipo}" if parte else tipo
        partes.append(f"## {nombre} " + atributos(cls="econ-parte" + (" is-ayudantia" if ayud else ""),
                                                  data_eyebrow=eyebrow, data_toc_label=titulo))
        es_doc = r"\begin{frame}" not in (SLIDES / tex).read_text(encoding="utf-8")
        partes.append(f'<p class="econ-source">📄 {"Documento" if es_doc else "Diapositivas"}: <code>{tex}</code> · '
                      f'{len(fr)} {"secciones" if es_doc else "láminas"}</p>')
        if extra:
            partes.append(extra[0])

        # Agrupa láminas consecutivas del mismo tema (mismo título o sin título)
        grupos = []
        for i, (t, cuerpo) in enumerate(fr, 1):
            t = t or TITULOS.get((tex, i), "")
            if grupos and (not t or norm(t) == norm(grupos[-1]["t"])):
                grupos[-1]["laminas"].append((i, cuerpo))
            else:
                grupos.append({"t": t or "(continuación)", "laminas": [(i, cuerpo)]})

        clase_card = "econ-lamina" + (" is-ayudantia" if ayud else "")
        pasos = cfg.get("pasos", {})
        inicios = {(tex, g["laminas"][0][0]) for g in grupos}
        for clave in antes:
            if clave[0] == tex and clave not in inicios:
                raise SystemExit(f"{clave}: un tema debe empezar en la primera lámina de una tarjeta")
        for g in grupos:
            primera, ultima = g["laminas"][0][0], g["laminas"][-1][0]
            if (tex, primera) in antes:
                partes.append(antes[(tex, primera)])
            attrs = atributos(data_lamina=rango(primera, ultima),
                              data_toc_label=toc_plano(g["t"]) if "$" in g["t"] else "")
            bloques = [f'<div class="{clase_card}" markdown>', f"{hx} {g['t']} {attrs}"]
            if pasos.get((tex, primera)) == ultima:
                # Lámina que en beamer se construye en varios pasos: una pestaña por paso (contenido íntegro)
                bloques.append('<p class="econ-lamina-cont">Lámina progresiva · recórrela paso a paso, como en la presentación</p>')
                for k, (i, cuerpo) in enumerate(g["laminas"], 1):
                    txt = f"<!-- {tex} · lámina {i} -->\n\n{cuerpo}"
                    bloques.append(f'=== "Paso {k}"\n\n' + "\n".join("    " + l if l.strip() else "" for l in txt.split("\n")))
                bloques.append("</div>")
                partes.append("\n\n".join(bloques))
                if (tex, ultima) in insertar:
                    partes.append(insertar[(tex, ultima)])
                continue
            for i, cuerpo in g["laminas"]:
                for (src, k), html in TIKZ.items():
                    if src == tex:
                        cuerpo = re.sub(rf"(?m)^(\s*(?:\d+\.\s+)?)TIKZFIGURA{k}\s*$", lambda m: m.group(1) + html, cuerpo)
                if "TIKZFIGURA" in cuerpo:
                    raise SystemExit(f"{tex}, lámina {i}: falta la figura TikZ en TIKZ")
                if (tex, i) in cfg["plegar"]:
                    cuerpo = plegar(cfg["plegar"][(tex, i)], cuerpo)
                bloques.append(f"<!-- {tex} · lámina {i} -->\n\n{cuerpo}")
                if (tex, i) in insertar:
                    # El material interactivo va fuera de la tarjeta de la lámina
                    bloques.append("</div>")
                    partes.append("\n\n".join(bloques))
                    partes.append(insertar[(tex, i)])
                    bloques = []
                    if i != ultima:
                        bloques = [f'<div class="{clase_card}" markdown>',
                                   f'<p class="econ-lamina-cont">continúa · {g["t"]}</p>']
            if bloques:
                bloques.append("</div>")
                partes.append("\n\n".join(bloques))
    partes.append("---\n\n" + cfg["cierre"].strip())
    aviso = ("<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. "
             "No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->\n\n")
    (REPO / cfg["out"]).write_text(aviso + "\n\n".join(partes) + "\n", encoding="utf-8")
    print(f"✓ {cfg['out']}")
    if any(t.get("r") for t in temas):
        out_r = REPO / "docs" / "r" / f"clase{n}.R"
        out_r.parent.mkdir(exist_ok=True)
        out_r.write_text(script_r(temas, cfg["cabecera"].strip().split("\n")[0].lstrip("# ")), encoding="utf-8")
        print(f"✓ {out_r.relative_to(REPO)}")


def inventario():
    for n, cfg in CLASES.items():
        print(f"== Clase {n}")
        for tex, *_ in cfg["fuentes"]:
            print(f"  {tex}")
            for i, (t, _) in enumerate(frames(SLIDES / tex), 1):
                print(f"    {i:2d}. {title_md(t)}")


if __name__ == "__main__":
    if "--inventario" in sys.argv:
        inventario()
    else:
        for n in [int(a) for a in sys.argv[1:]] or CLASES:
            generar(n)
