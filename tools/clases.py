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
    ops = "\n".join(
        f'<button class="econ-quiz-opt"{" data-correct" if i == correcta else ""}>{o}</button>'
        for i, o in enumerate(opciones)
    )
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

## 🎯 Objetivos de la sesión

**Cátedra (viernes)**

- Entender qué es la econometría y qué tipo de preguntas permite responder.
- Distinguir **correlación** de **causalidad** y el rol del supuesto *ceteris paribus*.
- Reconocer los tipos de datos y los métodos de muestreo.

**Ayudantía**

- Repasar estadística descriptiva (localización, dispersión, histograma y boxplot) e inferencial
  (TCL e intervalos de confianza para medias, proporciones y diferencias de medias).

## 🗓️ Agenda de la cátedra (viernes 18:40 – 21:25)

| Hora | Bloque | Láminas |
|---|---|---|
| 18:40 – 19:00 | Presentación del curso: programa, evaluaciones, cátedra + ayudantía, trabajo práctico | — |
| 19:00 – 19:25 | ¿Qué es la econometría?, econometría moderna y método econométrico | 1 – 3 |
| 19:25 – 19:55 | Causalidad y correlación: caso de los helados y los tiburones; ejemplo de la universidad | 4 – 6 |
| 19:55 – 20:05 | *Receso* | |
| 20:05 – 20:25 | Econometría como herramienta aplicada: Worms y consultorías | 7 |
| 20:25 – 20:50 | Tipos de datos | 8 – 11 |
| 20:50 – 21:15 | Muestreo: población y muestra, métodos aleatorios y no probabilísticos | 12 – 19 |
| 21:15 – 21:25 | Estadística descriptiva vs. inferencial y cierre | 20 |

Las **Partes 2 y 3** (repaso de estadística) se trabajan en la **ayudantía**.
"""

C1_CIERRE = """## ✅ Autoevaluación

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
    ("sem1/clase1.tex", 19): widget("digest"),
    ("sem1/repaso_ayudantia.tex", 4): widget("bar-gates"),
    ("sem1/repaso_estadistica.tex", 2): widget("aro"),
    ("sem1/repaso_estadistica.tex", 3): widget("galton"),
    ("sem1/clase1.tex", 11): "\n\n".join([widget("tipos-datos"),
        quiz("Tienes el PIB trimestral de Chile, Perú y Colombia entre 2000 y 2024. ¿Qué tipo de datos son?",
             ["Corte transversal", "Series de tiempo", "Datos de panel"], 2,
             "Es un <strong>panel</strong>: las mismas unidades (3 países) observadas en muchos períodos. Solo Chile sería una serie de tiempo; solo el año 2024 para muchos países, un corte transversal."),
        quiz("Una empresa sortea qué sucursales reciben un nuevo sistema de incentivos y compara las ventas. ¿Qué tipo de datos genera?",
             ["Experimentales", "Pseudo-experimentales", "Observacionales"], 0,
             "La exposición la asigna el investigador <strong>en forma aleatoria</strong>: es un experimento. Si el gerente eligiera las sucursales, sería pseudo-experimental; si cada sucursal decidiera adoptarlo, observacional."),
    ]),
    ("sem1/clase1.tex", 18): widget("muestreo") + "\n\n" + quiz(
        "Quieres estimar el ingreso promedio en Santiago y la población se divide en comunas muy distintas entre sí, pero cada una bastante homogénea por dentro. ¿Qué método da estimaciones más precisas para un mismo n?",
        ["Estratificado por comuna", "Por conglomerados (sortear algunas comunas)", "No probabilístico, en lugares concurridos"], 0,
        "Grupos homogéneos por dentro y distintos entre sí funcionan como <strong>estratos</strong>: muestrear en todos reduce la varianza del estimador."),
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
    (`sem2/clase2.tex`). Los bloques **Interactivo**, **Complemento** y las preguntas de
    autoevaluación son material adicional para estudiar.

## 🎯 Objetivos de la sesión

- Plantear el modelo de regresión lineal simple (RLS) e interpretar sus parámetros.
- Entender el supuesto clave $E[u \\mid x] = 0$ y la función de regresión poblacional.
- Derivar e interpretar los estimadores de **Mínimos Cuadrados Ordinarios (MCO)**.
- Descomponer la variabilidad de $y$ ($SST = SSE + SSR$) y medir la bondad de ajuste con el $R^2$.
- Conocer los supuestos RLS 1–5 y las propiedades de insesgamiento y varianza de MCO.

## 🗓️ Agenda

| Hora | Bloque |
|---|---|
| 18:40 – 19:15 | Modelo RLS, término de error, supuestos, regresión poblacional y esperanza condicional |
| 19:15 – 19:55 | Estimación por MCO, regresión muestral y ejemplo educación–sueldos |
| 19:55 – 20:05 | *Receso* |
| 20:05 – 20:30 | Propiedades aritméticas de MCO y método de momentos |
| 20:30 – 20:50 | Descomposición de la varianza, $R^2$ y cambio de unidades |
| 20:50 – 21:15 | Supuestos RLS, insesgamiento y varianza de los estimadores |
| 21:15 – 21:25 | Autoevaluación, tarea y cierre |
"""

C2_CIERRE = """## ✅ Autoevaluación

""" + "\n\n".join([
    quiz("Con los datos de EE. UU. se estimó salario = 0.095 + 0.54·educación. ¿Cuál es la interpretación correcta de 0.54?",
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
    ("sem2/clase2.tex", 14): widget("mco"),
    ("sem2/clase2.tex", 15): complemento("Pista para la tarea",
        "Desarrolla el producto y usa que $\\sum_{i=1}^n (x_i - \\bar{x}) = 0$ y $\\sum_{i=1}^n (y_i - \\bar{y}) = 0$."),
    ("sem2/clase2.tex", 20): complemento("Compruébalo",
        "En el simulador *encuentra la recta de mínimos cuadrados* activa **Mostrar recta MCO**: "
        "verás que $\\sum_i \\hat{u}_i = 0$, $\\sum_i x_i\\hat{u}_i = 0$ y que la recta pasa por $(\\bar{x}, \\bar{y})$, "
        "incluso si arrastras los puntos."),
    ("sem2/clase2.tex", 25): widget("varianza"),
    ("sem2/clase2.tex", 26): widget("unidades"),
    ("sem2/clase2.tex", 34): widget("insesgado"),
}

# --------------------------------------------------------------------------------------------
# Clase 3 · Semana 3
# --------------------------------------------------------------------------------------------
C3_CABECERA = """# Clase 3 · Causalidad y variable omitida

<div class="usm-session-meta">
<span>📅 Viernes 30 de octubre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Semana 3 · Causalidad, variable omitida</span>
</div>

!!! info "Contenido oficial de la semana"
    Esta página reproduce **íntegras y en orden** las diapositivas de la semana 3 (`sem3/`):
    `Clase3.tex` y `Clase4.tex`. Los bloques **Interactivo**, **Complemento** y las preguntas de
    autoevaluación son material adicional para estudiar.

## 🎯 Objetivos de la sesión

- Distinguir entre **esperanza condicional** (lo que describe una regresión) y **efecto causal**.
- Usar el modelo de **outcomes potenciales** de Rubin para definir el ATE y el ATT.
- Descomponer una diferencia de promedios en **efecto causal + sesgo de selección**.
- Entender por qué la **aleatorización** elimina el sesgo de selección.
- Derivar el **sesgo por variable omitida** y predecir su signo.

## 🗓️ Agenda

| Hora | Bloque |
|---|---|
| 18:40 – 19:20 | **Parte 1** · Esperanza condicional vs. causalidad, contrafactual, modelo de Rubin, ATE y ATT |
| 19:20 – 19:55 | **Parte 1** · ATT y sesgo de selección; ejemplo de las alarmas |
| 19:55 – 20:05 | *Receso* |
| 20:05 – 20:20 | **Parte 1** · Aleatorización |
| 20:20 – 21:00 | **Parte 2** · Sesgo de selección y MCO; sesgo por omisión de variable y su signo |
| 21:00 – 21:20 | **Parte 2** · Controles, ejemplos (fumar y edad), ¿más es mejor?, conclusiones |
| 21:20 – 21:25 | Autoevaluación y cierre |
"""

C3_CIERRE = """## ✅ Autoevaluación

""" + "\n\n".join([
    quiz("Comparas el salario de quienes hicieron un MBA con el de quienes no. ¿Qué representa el sesgo de selección?",
         ["La diferencia entre el salario con y sin MBA de quienes lo hicieron.",
          "La diferencia de salario que habría existido entre ambos grupos aun si nadie hubiera hecho el MBA.",
          "El error de muestreo de la diferencia de promedios."], 1,
         "Sesgo de selección = E[Yᴺᵀ | T=1] − E[Yᴺᵀ | T=0]. La primera opción es el ATT; la tercera es variabilidad muestral."),
    quiz("Estimas el efecto de las horas de estudio sobre la nota omitiendo las horas de trabajo remunerado. Quienes trabajan más estudian menos, y trabajar más reduce la nota. ¿Qué signo tiene el sesgo?",
         ["Positivo: la regresión corta sobreestima el efecto del estudio.",
          "Negativo: la regresión corta subestima el efecto del estudio.",
          "No hay sesgo, porque la variable omitida no es la de interés."], 0,
         "δ₁ &lt; 0 (más estudio, menos trabajo) y β₂ &lt; 0 (trabajar baja la nota) ⇒ β₂·δ₁ &gt; 0: caso 2 de la tabla de signos."),
    quiz("Un programa de capacitación se asignó por sorteo. ¿Es necesario agregar controles para obtener un estimador insesgado del efecto?",
         ["Sí, siempre hay que controlar por todas las características observables.",
          "No: con aleatorización la correlación entre el tratamiento y cualquier variable omitida es 0.",
          "Solo si el R² de la regresión es bajo."], 1,
         "Es la lámina <em>Sin sesgo de selección</em>: con aleatorización δ₁ = 0 para cualquier omitida, así que β₂·δ₁ = 0."),
]) + """

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 3, secciones 3.1–3.3 (*Análisis de regresión múltiple: estimación*).
- 📖 Comienza la lectura del **Certamen 1** (lunes 16 de noviembre): Miguel, E. y Kremer, M. (2004).
  *Worms: Identifying Impacts on Education and Health in the Presence of Treatment
  Externalities.* Econometrica, 72(1).
- Próxima clase: **Regresión lineal múltiple y Teorema de Gauss-Markov**.
"""

C3_INSERTAR = {
    ("sem3/Clase3.tex", 6): widget("po"),
    ("sem3/Clase3.tex", 16): widget("seleccion"),
    ("sem3/Clase4.tex", 6): widget("ovb"),
    ("sem3/Clase4.tex", 9): complemento("Compruébalo con los números",
        "De $\\tilde{\\beta}_1 = \\beta_1 + \\beta_2\\delta_2$: $-1.82 = 0.94 + 0.98\\,\\delta_2 \\Rightarrow \\delta_2 \\approx -2.8 < 0$. "
        "Prueba el botón **Fumar y edad** en el simulador de variable omitida: reproduce estas dos regresiones."),
}

CLASES = {
    1: dict(out="docs/clases/clase1.md", cabecera=C1_CABECERA, cierre=C1_CIERRE,
            fuentes=[("sem1/clase1.tex", "Parte 1 · Introducción a la econometría"),
                     ("sem1/repaso_ayudantia.tex", "Parte 2 · Ayudantía · Repaso de estadística descriptiva",
                      '!!! note "Material de ayudantía"\n'
                      '    Las Partes 2 y 3 no se ven en la cátedra del viernes: se trabajan en la **ayudantía** de la semana.'),
                     ("sem1/repaso_estadistica.tex", "Parte 3 · Ayudantía · Repaso de estadística inferencial")],
            insertar=C1_INSERTAR, plegar=C1_PLEGAR),
    2: dict(out="docs/clases/clase2.md", cabecera=C2_CABECERA, cierre=C2_CIERRE,
            fuentes=[("sem2/clase2.tex", "Regresión lineal simple")],
            insertar=C2_INSERTAR, plegar={}),
    3: dict(out="docs/clases/clase3.md", cabecera=C3_CABECERA, cierre=C3_CIERRE,
            fuentes=[("sem3/Clase3.tex", "Parte 1 · Causalidad y sesgo de selección"),
                     ("sem3/Clase4.tex", "Parte 2 · Sesgo por variable omitida")],
            insertar=C3_INSERTAR, plegar={}),
}


def plegar(titulo, cuerpo):
    lines = "\n".join("    " + l if l.strip() else "" for l in cuerpo.split("\n"))
    return f'??? success "{titulo}"\n{lines}'


def norm(t):
    return re.sub(r"[^a-z0-9]", "", t.lower())


def generar(n):
    cfg = CLASES[n]
    partes = [cfg["cabecera"].strip()]
    for tex, titulo, *extra in cfg["fuentes"]:
        fr = convert(SLIDES / tex, REPO, SLIDES)
        partes.append(f"---\n\n## {titulo}\n\n"
                      f'<p class="econ-source">📄 Diapositivas: <code>{tex}</code> · {len(fr)} láminas</p>')
        if extra:
            partes.append(extra[0])
        previo = None
        for i, (t, cuerpo) in enumerate(fr, 1):
            for (src, k), html in TIKZ.items():
                if src == tex:
                    cuerpo = re.sub(rf"(?m)^(\s*(?:\d+\.\s+)?)TIKZFIGURA{k}\s*$", lambda m: m.group(1) + html, cuerpo)
            if "TIKZFIGURA" in cuerpo:
                raise SystemExit(f"{tex}, lámina {i}: falta la figura TikZ en TIKZ")
            bloque = cuerpo
            if (tex, i) in cfg["plegar"]:
                bloque = plegar(cfg["plegar"][(tex, i)], cuerpo)
            if t and norm(t) != norm(previo or ""):
                partes.append(f"### {t}")
            if t:
                previo = t
            partes.append(f"<!-- {tex} · lámina {i} -->\n\n{bloque}")
            if (tex, i) in cfg["insertar"]:
                partes.append(cfg["insertar"][(tex, i)])
    partes.append("---\n\n" + cfg["cierre"].strip())
    aviso = ("<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. "
             "No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->\n\n")
    (REPO / cfg["out"]).write_text(aviso + "\n\n".join(partes) + "\n", encoding="utf-8")
    print(f"✓ {cfg['out']}")


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
