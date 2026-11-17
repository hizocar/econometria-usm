<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->

# Ayudantía 12 · Heterocedasticidad: test de White y errores robustos

<div class="usm-session-meta">
<span>📘 Ayudantía · Semana 12</span>
<span class="usm-tag-red">🛠️ Taller 3</span>
<span class="usm-tag-gold">Complementa la Clase 12</span>
</div>

!!! info "Contenido oficial de la ayudantía"
    Esta página reproduce **íntegros y en orden** los documentos de la semana 12 (`sem12/gl_test_white.tex` y
    `sem12/guia_heterocedasticidad.tex`). Se trabajan en la **ayudantía**, no en la cátedra
    ([Clase 12](../clases/clase12.md)).

!!! example "Cómo estudiar esta página"
    La ayudantía está ordenada en **2 temas**. Cada tema parte con una **pregunta guía**, sigue con las láminas
    y los simuladores, y termina con **✍️ preguntas de selección múltiple** (cada alternativa incorrecta explica
    por qué no lo es) y un **🧪 ejercicio de R** que puedes editar y ejecutar aquí mismo, sin instalar nada.
    Los 2 ejercicios de R en un solo archivo: [📥 ayudantia12.R](../r/ayudantia12.R).

## 🎯 Objetivos

- Contar los grados de libertad de la regresión auxiliar del test de White.
- Comparar conclusiones con errores estándar usuales y robustos.

## 🗺️ Temas de la ayudantía

Haz clic en un tema para ir directo a él.

<ol class="econ-ruta is-ayudantia">
<li><span class="econ-ruta-h"></span><a class="econ-ruta-a" href="#tema-1"><span class="econ-ruta-n">1</span><span class="econ-ruta-t">Grados de libertad del test de White</span><span class="econ-ruta-l">Parte 1 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h"></span><a class="econ-ruta-a" href="#tema-2"><span class="econ-ruta-n">2</span><span class="econ-ruta-t">Errores usuales y robustos en la práctica</span><span class="econ-ruta-l">Parte 2 · ✍️ 2 preguntas · 🧪 R</span></a></li>
</ol>

## Grados de libertad del test de White { .econ-parte .is-ayudantia data-eyebrow="Parte 1 · Ayudantía" data-toc-label="Parte 1 · Ayudantía · Grados de libertad del test de White" }

<p class="econ-source">📄 Documento: <code>sem12/gl_test_white.tex</code> · 1 secciones</p>

### Grados de libertad del test de White { #tema-1 .econ-tema .is-ayudantia data-num="1" data-laminas="Parte 1" data-toc-label="Tema 1 · Grados de libertad de White" }

<p class="econ-tema-q">¿Cuántos términos lleva la regresión auxiliar de White?</p>

<div class="econ-lamina is-ayudantia" markdown>

#### Grados de libertad del test F de White { data-lamina="Lámina 1" }

<!-- sem12/gl_test_white.tex · lámina 1 -->

El test de White para heterocedasticidad se basa en una regresión auxiliar de los residuos al cuadrado $\hat{u}_i^2$ sobre todas las variables explicativas del modelo original, sus cuadrados y sus productos cruzados. Esta regresión auxiliar tiene como propósito detectar cualquier relación no lineal entre los regresores y la varianza de los errores, sin imponer una forma funcional específica.

$$
\hat{u}_i^2 = \delta_0 + \delta_1 x_{1i} + \dots + \delta_k x_{ki} + \delta_{k+1} x_{1i}^2 + \dots + \delta_{2k} x_{ki}^2 + \text{(productos cruzados)} + v_i
$$

El estadístico *F* se construye para probar la hipótesis nula:

$$
H_0: \delta_1 = \delta_2 = \dots = \delta_q = 0 \quad \text{(homocedasticidad)}
$$

El estadístico *F* tiene la forma:

$$
F = \frac{(R_{aux}^2 / q)}{(1 - R_{aux}^2) / (n - q - 1)} \quad \sim \quad F_{q,\;n - q - 1}
$$

donde:

-   $n$ es el número de observaciones,

-   $q$ es el número de regresores en la regresión auxiliar (excluyendo el intercepto),

-   $R_{aux}^2$ es el coeficiente de determinación de la regresión auxiliar.

El número total de variables en la regresión auxiliar (es decir, los grados de libertad del numerador del estadístico *F*) es:

$$
q = k + \frac{k(k+1)}{2}
$$

donde $k$ es el número de regresores en el modelo original (sin incluir la constante). Esta fórmula incluye:

-   $k$ regresores originales,

-   $k$ términos cuadráticos,

-   $\frac{k(k-1)}{2}$ productos cruzados entre regresores distintos.

    Para determinar cuántos productos cruzados distintos se incluyen en la regresión auxiliar, consideramos todas las combinaciones posibles de pares de regresores distintos del modelo original. Esto se calcula usando combinatoria:

    $$
    \text{Número de productos cruzados distintos} = \binom{k}{2} = \frac{k(k - 1)}{2}
    $$

    Esta expresión representa el número de formas de seleccionar dos regresores diferentes de un total de $k$, sin importar el orden (es decir, $x_1x_2$ y $x_2x_1$ se consideran el mismo término).

</div>

<div class="econ-practica" id="practica-1">
<p class="econ-practica-t"><span>✍️ Practica · Tema 1</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Con k = 4 regresores, ¿cuántos productos cruzados distintos hay?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>6</button>
<button class="econ-quiz-opt" data-why="Se cuentan pares distintos sin orden: C(4, 2).">16</button>
<button class="econ-quiz-opt" data-why="Esos son los cuadrados.">4</button>
</div>
<p class="econ-quiz-fb">✅ C(4, 2) = 4·3/2 = 6.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Con k = 4, ¿cuánto vale q?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>14</button>
<button class="econ-quiz-opt" data-why="Faltan los 4 regresores originales: q = 4 + 4·5/2.">10</button>
<button class="econ-quiz-opt" data-why="Faltan los productos cruzados.">8</button>
</div>
<p class="econ-quiz-fb">✅ q = k + k(k + 1)/2 = 4 + 10 = 14.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Tabla de q</p>

Calcula q para k entre 1 y 6.

```r
# Número de restricciones del test de White: q = k + k(k + 1)/2
k <- 1:6
data.frame(k = k, cuadrados = k, cruzados = choose(k, 2), q = k + k * (k + 1) / 2)
```

**🎯 Reto:** ¿con qué k la regresión auxiliar supera las 20 restricciones?
{: .econ-r-reto }

</div>

## Guía de heterocedasticidad { .econ-parte .is-ayudantia data-eyebrow="Parte 2 · Ayudantía" data-toc-label="Parte 2 · Ayudantía · Guía de heterocedasticidad" }

<p class="econ-source">📄 Documento: <code>sem12/guia_heterocedasticidad.tex</code> · 1 secciones</p>

### Errores usuales y robustos en la práctica { #tema-2 .econ-tema .is-ayudantia data-num="2" data-laminas="Parte 2" data-toc-label="Tema 2 · Usuales y robustos" }

<p class="econ-tema-q">¿Cambia la conclusión según el error estándar que se use?</p>

<div class="econ-lamina is-ayudantia" markdown>

#### Guía de ejercicios de heterocedasticidad { data-lamina="Lámina 1" }

<!-- sem12/guia_heterocedasticidad.tex · lámina 1 -->

**Ejercicio heterocedasticidad<br>
**

**Econometría ICS-294**

Usando los datos del archivo GPA3 se estimó la siguiente ecuación para los estudiantes que en otoño están en el segundo semestre:

$$
\begin{array}{ll}
\widehat{trmgpa} = & -2,12  + 0,193 cumgpa + 0,0014 tothrs + 0,0018 sat - 0,0039 hsperrc + 0,351 female - 0,157 season
\\
& \quad (0,55)  \quad \quad (0,064)  \quad \quad \quad (0,0012) \quad \quad \quad (0,0002) \quad \quad \quad (0,0018) \quad \quad \quad \quad (0,085) \quad \quad \quad (0,098) \\
& \quad [0,55]  \quad \quad [0,074] \quad \quad \quad \quad [0,0012] \quad \quad \quad [0,0002] \quad \quad \quad [0,0019] \quad \quad \quad \quad \quad[0,079] \quad \quad \quad [0,07] \\
& n = \text{269} \quad R^2 = \text{0,465}
\end{array}
$$

Aquí $trmgpa$ es el promedio general de calificaciones (GPA) del semestre actual, $crsgpa$ es un promedio ponderado de calificaciones de los cursos que se están tomando, $cumgpa$ es el promedio general de calificaciones antes del semestre presente, $tothrs$ es el total de horas crédito antes de este semestre, $sat$ es la puntuación en la prueba SAT de admisión a la universidad, $hsperc$ es el percentil que ocupó el alumno entre los graduados del bachillerato, $female$ es una variable binaria para el género femenino, y $season$ es una variable binaria que es igual a uno si el estudiante practica deporte en otoño. Entre paréntesis y entre corchetes se dan, respectivamente, los errores estándar usuales y los errores estándar robustos a la heterocedasticidad.

1.  ¿Tienen las variables $cumgpa$ y $tothrs$ los efectos estimados esperados? ¿Cuáles de estas variables son estadísticamente significativas al nivel de 5%? ¿Importa qué error estándar se use?

    -   $cumgpa$: El coeficiente es $0.193$, positivo, lo cual sugiere que un mejor promedio acumulado previo está asociado con un mayor $trmgpa$. Esto es coherente con las expectativas, ya que los estudiantes con buenos historiales académicos suelen mantener un buen desempeño.

    -   $tothrs$: El coeficiente es $0.0014$, positivo pero de magnitud pequeña. Esto indica que más horas crédito acumuladas están levemente asociadas con un mayor $trmgpa$, lo cual es razonable, ya que la experiencia acumulada puede influir positivamente en el desempeño académico.

    Para evaluar la significancia estadística de estas variables, calculamos los valores $t$ como:

    $$
    t = \frac{\text{Coeficiente}}{\text{Error estándar}}
    $$

    Usando errores estándar usuales:

    -   $cumgpa$:

        $$
        t = \frac{0.193}{0.064} = 3.02 \quad (\text{Mayor que } 1.96 \rightarrow \text{Significativo})
        $$

    -   $tothrs$:

        $$
        t = \frac{0.0014}{0.0012} = 1.17 \quad (\text{Menor que } 1.96 \rightarrow \text{No significativo})
        $$

    Usando errores estándar robustos:

    -   $cumgpa$:

        $$
        t = \frac{0.193}{0.074} = 2.61 \quad (\text{Mayor que } 1.96 \rightarrow \text{Significativo})
        $$

    -   $tothrs$:

        $$
        t = \frac{0.0014}{0.0012} = 1.17 \quad (\text{Menor que } 1.96 \rightarrow \text{No significativo})
        $$

    Al nivel de significancia del 5%, $cumgpa$ es estadísticamente significativo, mientras que $tothrs$ no lo es. Esta conclusión es consistente tanto con los errores estándar usuales como con los robustos. El uso de errores estándar robustos no afecta las conclusiones en este caso, pero son útiles para garantizar resultados confiables ante heterocedasticidad.

2.  Pruebe si el hecho de que el deporte del estudiante se practique en otoño tiene efecto sobre el GPA del semestre, usando ambos errores estándar. ¿El nivel de significancia al que se puede rechazar la prueba depende de cuál error estándar se emplee?

    $$
    H_0: \beta_{\text{season}} = 0 \quad \text{vs.} \quad H_1: \beta_{\text{season}} \neq 0
    $$

    El estadístico $t$ se calcula como:

    $$
    t = \frac{\widehat{\beta}_{\text{season}}}{\text{Error estándar}}
    $$

    La estimación de $\hat{\beta}_{season}$ es $-0.157$. Los errores estándar son:

    -   Usual: $0.098$

    -   Robusto: $0.07$

    El cálculo del estadístico $t$ es el siguiente:

    -   **Con errores estándar usuales:**

        $$
        t = \frac{-0.157}{0.098} = -1.60
        $$

    -   **Con errores estándar robustos:**

        $$
        t = \frac{-0.157}{0.07} = -2.24
        $$

    El valor crítico $t_c$ para una prueba de dos colas al nivel del 5% es $1.96$:

    -   Con errores estándar usuales, $|t| = 1.60 < 1.96$. Por lo tanto, no rechazamos $H_0$.

    -   Con errores estándar robustos, $|t|=2.24 >1.96$. Se rechaza $H_0$.

    -   Usando errores estándar usuales, no hay suficiente evidencia para afirmar que practicar deportes en otoño afecta significativamente el $trmgpa$.

    -   Usando errores estándar robustos, el efecto es significativo al nivel del 5%.

    -   La elección del tipo de error estándar afecta la interpretación. Si se sospecha de heterocedasticidad, se recomienda confiar en los errores robustos.

    -   El nivel de significancia al que se puede rechazar la prueba depende de cuál error estándar se emplee.

</div>

<div class="econ-practica" id="practica-2">
<p class="econ-practica-t"><span>✍️ Practica · Tema 2</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En la guía, para cumgpa, t = 3.02 con el s.e. usual y 2.61 con el robusto. ¿Qué concluyes al 5%?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Es significativo con ambos.</button>
<button class="econ-quiz-opt" data-why="2.61 &gt; 1.96: también lo es con el robusto.">Solo es significativo con el usual.</button>
<button class="econ-quiz-opt" data-why="Ambos t superan 1.96.">No es significativo.</button>
</div>
<p class="econ-quiz-fb">✅ La conclusión no cambia en este caso.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Si el s.e. robusto es menor que el usual, ¿qué pasa con el t?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Aumenta en valor absoluto.</button>
<button class="econ-quiz-opt" data-why="Un denominador menor da un t mayor.">Disminuye.</button>
<button class="econ-quiz-opt" data-why="El t depende directamente del error estándar.">No cambia.</button>
</div>
<p class="econ-quiz-fb">✅ Es el caso de season en la guía.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Las t de la guía</p>

Calcula los estadísticos t y valores-p con ambos errores estándar.

```r
# Guía: t con errores usuales y robustos (cumgpa, tothrs y season)
coef  <- c(cumgpa = 0.193, tothrs = 0.0014, season = -0.157)
usual <- c(0.064, 0.0012, 0.098)
robus <- c(0.074, 0.0012, 0.07)
t <- cbind(t_usual = coef / usual, t_robusto = coef / robus)
round(t, 2)
round(2 * pt(-abs(t), df = 269 - 6 - 1), 4)      # valores-p
```

**🎯 Reto:** ¿con qué s.e. robusto season dejaría de ser significativo al 5%?
{: .econ-r-reto }

</div>

---

!!! abstract "🧠 Ideas clave"
    - En el test de White, $q = k + \dfrac{k(k+1)}{2}$: los regresores, sus cuadrados y los productos cruzados.
    - Los errores robustos pueden ser mayores o menores que los usuales; con heterocedasticidad, son los que hay que usar.

## 🔗 Volver a la cátedra

- [Clase 12 · Heterocedasticidad y variables instrumentales](../clases/clase12.md)
