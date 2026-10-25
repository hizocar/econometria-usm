<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->

# Clase 2 · Regresión lineal simple

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

!!! example "Cómo estudiar esta clase"
    La clase está ordenada en **7 temas**. Cada tema parte con una **pregunta guía**, sigue con las láminas
    y los simuladores, y termina con **✍️ preguntas de selección múltiple** (cada alternativa incorrecta explica
    por qué no lo es) y un **🧪 ejercicio de R** que puedes editar y ejecutar aquí mismo, sin instalar nada.
    Los 7 ejercicios de R en un solo archivo: [📥 clase2.R](../r/clase2.R).

## 🎯 Objetivos de la sesión

- Plantear el modelo de regresión lineal simple (RLS) e interpretar sus parámetros.
- Entender el supuesto clave $E[u \mid x] = 0$ y la función de regresión poblacional.
- Derivar e interpretar los estimadores de **Mínimos Cuadrados Ordinarios (MCO)**.
- Descomponer la variabilidad de $y$ ($SST = SSE + SSR$) y medir la bondad de ajuste con el $R^2$.
- Conocer los supuestos RLS 1–5 y las propiedades de insesgamiento y varianza de MCO.

## 🗓️ Agenda de la cátedra (viernes 18:40 – 21:25)

Haz clic en un tema para ir directo a él.

<ol class="econ-ruta">
<li><span class="econ-ruta-h">18:40</span><a class="econ-ruta-a" href="#tema-1"><span class="econ-ruta-n">1</span><span class="econ-ruta-t">El modelo de regresión lineal simple</span><span class="econ-ruta-l">láminas 1–4 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">19:05</span><a class="econ-ruta-a" href="#tema-2"><span class="econ-ruta-n">2</span><span class="econ-ruta-t">El supuesto clave y la regresión poblacional</span><span class="econ-ruta-l">láminas 5–11 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">19:30</span><a class="econ-ruta-a" href="#tema-3"><span class="econ-ruta-n">3</span><span class="econ-ruta-t">Estimar por mínimos cuadrados ordinarios</span><span class="econ-ruta-l">láminas 12–15 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li class="is-break"><span class="econ-ruta-h">19:55</span><span class="econ-ruta-t">☕ Receso</span></li>
<li><span class="econ-ruta-h">20:05</span><a class="econ-ruta-a" href="#tema-4"><span class="econ-ruta-n">4</span><span class="econ-ruta-t">La regresión muestral y sus propiedades</span><span class="econ-ruta-l">láminas 16–20 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">20:30</span><a class="econ-ruta-a" href="#tema-5"><span class="econ-ruta-n">5</span><span class="econ-ruta-t">Método de momentos</span><span class="econ-ruta-l">láminas 21–23 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">20:45</span><a class="econ-ruta-a" href="#tema-6"><span class="econ-ruta-n">6</span><span class="econ-ruta-t">Bondad de ajuste y unidades de medida</span><span class="econ-ruta-l">láminas 24–26 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">21:05</span><a class="econ-ruta-a" href="#tema-7"><span class="econ-ruta-n">7</span><span class="econ-ruta-t">Supuestos, insesgamiento y varianza</span><span class="econ-ruta-l">láminas 27–34 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li class="is-break"><span class="econ-ruta-h">21:25</span><span class="econ-ruta-t">✅ Ideas clave, autoevaluación y cierre</span></li>
</ol>

## Regresión lineal simple { .econ-parte data-eyebrow="Parte 1 · Cátedra" data-toc-label="Parte 1 · Regresión lineal simple" }

<p class="econ-source">📄 Diapositivas: <code>sem2/clase2.tex</code> · 34 láminas</p>

### El modelo de regresión lineal simple { #tema-1 .econ-tema data-num="1" data-laminas="láminas 1–4" data-toc-label="Tema 1 · El modelo RLS" }

<p class="econ-tema-q">¿Cómo escribir que el salario depende de la educación… y de todo lo demás?</p>

<div class="econ-lamina" markdown>

#### Modelo de regresión lineal simple { data-lamina="Láminas 1–2" }

<!-- sem2/clase2.tex · lámina 1 -->

-   Queremos estudiar la relación entre dos variables x e y en la población.

-   Explicar y en terminos de x o como cambia y cuando cambia x.

-   Modelo de regresión lineal simple (RLS):

    $$
    y = \beta_0 + \beta_1 x + u
    $$

-   $\beta_0$, $\beta_1$ son parámetros poblacionales.

-   u: término de error o perturbación, factores no-observables que afectan a y.

-   El coeficiente $\beta_0$, permite suponer que E(u) = 0.

-   $\beta_1$ captura como cambia y cuando cambia x.

<!-- sem2/clase2.tex · lámina 2 -->

$$
y = \beta_0 + \beta_1 x + u
$$

Terminología:

-   y: variable dependiente, variable explicada, variable de respuesta, variable predicha o el regresando.

-   x: variable independiente, variable explicativa, variable de control, variable predictora o el regresor.

-   $\beta_1$: es el parámetro de la pendiente en la relación entre y y x, cuando todos los demás factores en u permanecen constantes, este parámetro es de interés primordial en la economía aplicada.

-   $\beta_0$: es el parámetro del intercepto, algunas veces llamado término constante.

</div>

<div class="econ-lamina" markdown>

#### Termino de error { data-lamina="Lámina 3" }

<!-- sem2/clase2.tex · lámina 3 -->

-   La variable u, llamada **término de error**, o **perturbación** en la relación, representa factores distintos a x que afectan a y.

-   Un análisis de regresión simple en realidad trata a todos los factores que afectan a y, y que son distintos a x como factores no observados.

-   Es útil considerar a u como abreviación de "unobserved".

</div>

<div class="econ-lamina" markdown>

#### Ejemplo { data-lamina="Lámina 4" }

<!-- sem2/clase2.tex · lámina 4 -->

-   Por ejemplo:

    $$
    \text{salario} = \beta_0 + \beta_1 \text{educación} + u
    $$

-   Noten que si todos los demás factores son constantes ($\Delta u = 0$), entonces:

    $$
    \Delta \text{salario} = \beta_1 \Delta \text{educación}
    $$

-   $\beta_1$ es el parámetro de la pendiente en la relación entre $y$ y $x$, cuando los factores **no observables** son constantes. **PERO, en general, ¿son constantes?**

</div>

<div class="econ-practica" id="practica-1">
<p class="econ-practica-t"><span>✍️ Practica · Tema 1</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En salario = β₀ + β₁·educación + u, ¿qué es u?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Todos los factores que afectan el salario y no están en el modelo: habilidad, experiencia, suerte…</button>
<button class="econ-quiz-opt" data-why="Ese es el residuo û, que se calcula con la muestra; u es poblacional y no se observa.">El error de la estimación por MCO.</button>
<button class="econ-quiz-opt" data-why="Ese papel lo cumple β₀.">Un número fijo que se suma al salario.</button>
</div>
<p class="econ-quiz-fb">✅ Láminas 3–4: el término de error reúne todo lo que afecta a y además de x.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">En y = β₀ + β₁x + u, ¿cómo se llama y?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Variable dependiente (o explicada)</button>
<button class="econ-quiz-opt" data-why="Esa es x, la variable explicativa.">Variable independiente</button>
<button class="econ-quiz-opt" data-why="Ese es u.">Término de error</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 2: terminología del modelo de regresión simple.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · La función de regresión poblacional</p>

Simula 100 personas con un modelo conocido y dibuja la FRP. Cada punto se aleja de la recta en su propio u.

```r
set.seed(1)
n <- 100
educacion <- sample(8:20, n, replace = TRUE)
u <- rnorm(n, sd = 3)                    # todo lo demás que afecta el salario
salario <- 0.1 + 0.55 * educacion + u    # beta0 = 0.1, beta1 = 0.55

plot(educacion, salario, pch = 19, col = "steelblue",
     main = "Cada punto se aleja de la recta en su u")
abline(a = 0.1, b = 0.55, lwd = 2)       # la FRP: E[salario | educacion]
```

**🎯 Reto:** cambia `sd = 3` por `sd = 0.5`. ¿Qué pasa con la nube de puntos?
{: .econ-r-reto }

</div>

### El supuesto clave y la regresión poblacional { #tema-2 .econ-tema data-num="2" data-laminas="láminas 5–11" data-toc-label="Tema 2 · E[u|x] = 0 y la FRP" }

<p class="econ-tema-q">¿Qué tiene que cumplir u para que β₁ mida el efecto de x?</p>

<div class="econ-lamina" markdown>

#### Modelo de regresión lineal simple { data-lamina="Lámina 5" }

<!-- sem2/clase2.tex · lámina 5 -->

-   Modelo de regresión lineal simple:

    $$
    y = \beta_0 + \beta_1 x + u \tag{2}
    $$

-   **PERO, en general, ¿son constantes?**

-   Difícil decir que $u$ es constante cuando no lo observamos.

-   El supuesto clave para estimar $\beta_1$ (cómo $x$ afecta a $y$) es que:

    $$
    E[u|x] = 0
    $$

    $\rightarrow$ el valor promedio de $u$ es igual para cualquier valor de $x$. Además, es igual a cero, implicando que $x$ no está correlacionada con los factores no observables.

-   Sin esa restricción, no es posible estimar el efecto *ceteris paribus* $\beta_1$.

</div>

<div class="econ-lamina" markdown>

#### Supuestos { data-lamina="Lámina 6" }

<!-- sem2/clase2.tex · lámina 6 -->

1.  Linealidad en los parámetros: la función que relaciona $y$ con $x$ es lineal.

2.  Media condicional cero:

    $$
    E[u|x] = E[u] = 0
    $$

    $\rightarrow$ El valor esperado de los factores inobservables no depende de los valores de $x$, y dicho promedio es igual a 0, **u es media independiente de x.**

</div>

<div class="econ-lamina" markdown>

#### Ejemplo { data-lamina="Lámina 7" }

<!-- sem2/clase2.tex · lámina 7 -->

$$
Salario = \beta_0 + \beta_1 educ + u
$$

¿Qué hay en u? ¿Como se relaciona con x?

</div>

<div class="econ-widget" data-widget="mochila-u"></div>

<div class="econ-lamina" markdown>

#### Regresión Poblacional { data-lamina="Lámina 8" }

<!-- sem2/clase2.tex · lámina 8 -->

-   Si se cumplen los supuestos anteriores (linealidad y $E[u|x] = 0$):

-   Entonces:

    $$
    y = \beta_0 + \beta_1x + u
    $$

    $$
    E[y|x] = \beta_0 + \beta_1E[x|x] + E[u|x]
    $$

    $$
    E[y|x] = \beta_0 + \beta_1x
    $$

-   Por lo tanto, el MRS aproxima la esperanza condicional de y.

-   A la línea $E[y|x]$ se le llama Función de Regresión Poblacional (FRP).

</div>

<div class="econ-lamina" markdown>

#### Esperanza condicional { data-lamina="Lámina 9" }

<!-- sem2/clase2.tex · lámina 9 -->

La función de esperanza condicional es la esperanza de una variable $Y_i$ (o su media poblacional) cuando $X_i$ está fijo.

| Individuo | Años educ. | Ingreso |
|----------:|:-----------|:--------|
|     María | 5          | 120     |
|      Juan | 5          | 100     |
|     Pedro | 4          | 80      |
|  Catalina | 2          | 50      |

FEC para cada nivel de educación:<br>
$E[Y_i|X_i = 5] = 110$<br>
$E[Y_i|X_i = 4] = 80$<br>
$E[Y_i|X_i = 2] = 50$<br>
$E[Y_i] = 87.5$

</div>

<div class="econ-widget" data-widget="esperanza-cond"></div>

<div class="econ-lamina" markdown>

#### Regresión Poblacional: FRP { data-lamina="Lámina 10" }

<!-- sem2/clase2.tex · lámina 10 -->

![Regresión Poblacional: FRP](../images/slides/frp.png){ .econ-slide-img }

</div>

<div class="econ-lamina" markdown>

#### Interpretación { data-lamina="Lámina 11" }

<!-- sem2/clase2.tex · lámina 11 -->

$$
y = \beta_0 + \beta_1x + u
$$

$$
E[y|x] = \beta_0 + \beta_1x
$$

Noten que:

$$
\beta_1 = \frac{\Delta E[y|x]}{\Delta x}
$$

$\rightarrow$ es la pendiente de la Función de la FRP, cuando $x$ aumenta en una unidad, el valor esperado de $y$ cambia en $\beta_1$ unidades.

$$
\beta_0 = E[y|x = 0]
$$

$\rightarrow$ es el intercepto de la FRP, el valor medio de $y$ cuando $x$ es igual a cero.

</div>

<div class="econ-practica" id="practica-2">
<p class="econ-practica-t"><span>✍️ Practica · Tema 2</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Si u incluye la habilidad, y las personas más hábiles estudian más, ¿qué supuesto falla?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>E[u | x] = 0: el promedio de u cambia con la educación.</button>
<button class="econ-quiz-opt" data-why="Ese se cumple siempre que el modelo tenga intercepto; el problema es que u dependa de x.">E[u] = 0</button>
<button class="econ-quiz-opt" data-why="Justamente por no estar en el modelo, la habilidad queda en u.">Ninguno: la habilidad no está en el modelo.</button>
</div>
<p class="econ-quiz-fb">✅ Láminas 6–7: si la habilidad está en u y se relaciona con la educación, E[u | x] ≠ 0.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">La función de regresión poblacional E[y | x] = β₀ + β₁x describe…</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>…cómo cambia el valor promedio de y según x.</button>
<button class="econ-quiz-opt" data-why="Cada persona se aleja del promedio en su u.">…el valor exacto de y de cada persona.</button>
<button class="econ-quiz-opt" data-why="Esa es la regresión muestral (FRM), con β̂.">…la recta estimada con la muestra.</button>
</div>
<p class="econ-quiz-fb">✅ Láminas 8–10: la FRP es una esperanza condicional.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Cuando E[u | x] no es cero</p>

Compara dos mundos: uno en que la habilidad no se relaciona con la educación y otro en que los más hábiles estudian más. El verdadero β₁ es 0.5 en ambos.

```r
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
```

**🎯 Reto:** cambia `1.5 * habilidad` por `-1.5 * habilidad`. ¿Hacia dónde se mueve la estimación del caso 2?
{: .econ-r-reto }

</div>

### Estimar por mínimos cuadrados ordinarios { #tema-3 .econ-tema data-num="3" data-laminas="láminas 12–15" data-toc-label="Tema 3 · MCO" }

<p class="econ-tema-q">De todas las rectas posibles, ¿cuál elegimos?</p>

<div class="econ-lamina" markdown>

#### Estimación { data-lamina="Lámina 12" }

<!-- sem2/clase2.tex · lámina 12 -->

-   Objetivo: estimar los parámetros poblacionales a partir de una muestra.

-   Sea el modelo poblacional: $y = \beta_0 + \beta_1x + u$

-   Entonces, para cada $i = 1, \ldots, n$ de una muestra podemos escribir:

    $$
    y_i = \beta_0 + \beta_1x_i + u_i
    $$

    donde $u_i$ es el término de error para la observación $i$.

</div>

<div class="econ-lamina" markdown>

#### Mínimos Cuadrados Ordinarios { data-lamina="Lámina 13" }

<!-- sem2/clase2.tex · lámina 13 -->

$$
{y}_i = \hat{\beta}_0 + \hat{\beta}_1 x_i + \hat{u}_i \quad \forall i = 1, \ldots, n
$$

Definiciones:

-   $\hat{\beta}_0$: estimador de $\beta_0$

-   $\hat{\beta}_1$: estimador de $\beta_1$

-   $\hat{y}_i = \hat{\beta}_0 + \hat{\beta}_1 x_i$: valor predicho/estimado de $y_i$

-   $\hat{u}_i = y_i - \hat{y}_i$ residuo. El residuo es el análogo muestral del error.

<!-- -->
-   Objetivo: encontrar los estimadores $\hat{\beta}$ más parecidos a los parámetros $\beta$, los $\hat{y}_i$ más parecidos a $y_i$, los $\hat{u}_i$ más cercanos a 0.<br>

-   MCO (Mínimos Cuadrados Ordinarios): encuentra los $\beta$'s que minimizan la suma de los residuos al cuadrado:

    $$
    \min_{\hat{\beta}_0, \hat{\beta}_1} \sum_{i=1}^{n} \hat{u}_i^2 = \min_{\hat{\beta}_0, \hat{\beta}_1} \sum_{i=1}^{n} (y_i - \hat{\beta}_0 - \hat{\beta}_1 x_i)^2
    $$

</div>

<div class="econ-widget" data-widget="cuadrados"></div>

<div class="econ-lamina" markdown>

#### Estimación de $\beta$ MCO { data-lamina="Lámina 14" data-toc-label="Estimación de β MCO" }

<!-- sem2/clase2.tex · lámina 14 -->

$$
\quad \min_{\hat{\beta}_0, \hat{\beta}_1} \sum_{i=1}^{n} \hat{u}_i^2 = \min_{\hat{\beta}_0, \hat{\beta}_1} \sum_{i=1}^{n} (y_i - \hat{\beta}_0 - \hat{\beta}_1 x_i)^2
$$

Condiciones de primer orden:

$$
{}[\hat{\beta}_0] : \quad \sum_{i=1}^{n} (y_i - \hat{\beta}_0 - \hat{\beta}_1 x_i) = 0 \quad \Rightarrow \quad \hat{\beta}_0 = \bar{y} - \hat{\beta}_1 \bar{x}
$$

$$
{}[\hat{\beta}_1] : \quad \sum_{i=1}^{n} x_i(y_i - \hat{\beta}_0 - \hat{\beta}_1 x_i) = 0 \Rightarrow \hat{\beta}_1 = \frac{\sum_{i=1}^{n}(x_i - \bar{x})y_i}{\sum_{i=1}^{n}(x_i - \bar{x})^2} = \frac{\widehat{\text{Cov}}(x, y)}{\widehat{\text{Var}}(x)}
$$

Noten que todas estas variables están en la data. Entonces podemos obtener estos estimadores.

</div>

<div class="econ-widget" data-widget="mco"></div>

<div class="econ-lamina" markdown>

#### Tarea { data-lamina="Lámina 15" }

<!-- sem2/clase2.tex · lámina 15 -->

-   Muestre que:

    $\sum_{i}^n(x_i - \bar{x})(y_i - \bar{y}) = \sum_{i}^n(x_i - \bar{x})y_i= \sum_{i}^n(y_i - \bar{y})x_i$.

</div>

!!! tip "Complemento · Pista para la tarea"
    Desarrolla el producto y usa que $\sum_{i=1}^n (x_i - \bar{x}) = 0$ y $\sum_{i=1}^n (y_i - \bar{y}) = 0$.

<div class="econ-practica" id="practica-3">
<p class="econ-practica-t"><span>✍️ Practica · Tema 3</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Qué minimiza MCO?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>La suma de los residuos al cuadrado, Σûᵢ².</button>
<button class="econ-quiz-opt" data-why="Muchas rectas tienen Σûᵢ = 0 (los errores se cancelan); por eso se elevan al cuadrado.">La suma de los residuos, Σûᵢ.</button>
<button class="econ-quiz-opt" data-why="MCO mide distancias verticales, en y.">La distancia horizontal entre los puntos y la recta.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 13. Juégalo en el simulador de cuadrados.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">β̂₁ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)². ¿Qué pasa si todas las x son iguales?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>No se puede calcular: el denominador es cero.</button>
<button class="econ-quiz-opt" data-why="No es cero: es una división por cero. Sin variación en x no se puede estimar la pendiente.">β̂₁ = 0</button>
<button class="econ-quiz-opt" data-why="ȳ sería el intercepto de un modelo sin x.">β̂₁ = ȳ</button>
</div>
<p class="econ-quiz-fb">✅ Por eso se necesita variación en x (supuesto RLS 3).</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · MCO a mano</p>

Calcula β̂₀ y β̂₁ con las fórmulas de la lámina 14, compáralos con `lm()` y comprueba que ninguna otra recta tiene menor suma de residuos al cuadrado.

```r
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
```

**🎯 Reto:** prueba otra recta en la última línea, por ejemplo `c(b0 + 1, b1)`. ¿Su SSR es mayor o menor?
{: .econ-r-reto }

</div>

### La regresión muestral y sus propiedades { #tema-4 .econ-tema data-num="4" data-laminas="láminas 16–20" data-toc-label="Tema 4 · Regresión muestral" }

<p class="econ-tema-q">Una vez estimada la recta, ¿qué propiedades cumple siempre?</p>

<div class="econ-lamina" markdown>

#### Regresión Muestral (FRM) { data-lamina="Lámina 16" }

<!-- sem2/clase2.tex · lámina 16 -->

1.  Una vez que estimamos $\hat{\beta}_0$ y $\hat{\beta}_1$, obtenemos la función de regresión muestral (FRM):

    $$
    \hat{y} = \hat{\beta}_0 + \hat{\beta}_1 x
    $$

2.  La FRM que se obtiene de una muestra es la versión estimada de la función de regresión poblacional (FRP).

3.  En general, la FRP es desconocida y uno se basa en una muestra para estimarla.

4.  **Valor ajustado o predicho: $\hat{y}$.**

</div>

<div class="econ-lamina" markdown>

#### Mínimos Cuadrados Ordinarios { data-lamina="Lámina 17" }

<!-- sem2/clase2.tex · lámina 17 -->

![Mínimos Cuadrados Ordinarios](../images/slides/sem2_images_mco.png){ .econ-slide-img }

</div>

<div class="econ-lamina" markdown>

#### Un ejemplo: relación entre educación y sueldos { data-lamina="Lámina 18" }

<!-- sem2/clase2.tex · lámina 18 -->

-   Tomamos la relación entre años de educación y sueldos por hora en EE. UU.

    $$
    salario_i = \beta_0 + \beta_1 \text{educación}_i + \epsilon_i
    $$

[Colab](https://colab.research.google.com/drive/1fGx_sLiasa-psVeudjO5IgJPPJX0lB6t?usp=sharing){ .usm-btn target=_blank }

![Un ejemplo: relación entre educación y sueldos](../images/slides/sem2_images_disper1.png){ .econ-slide-img }

</div>

<div class="econ-lamina" markdown>

#### Un ejemplo { data-lamina="Lámina 19" }

<!-- sem2/clase2.tex · lámina 19 -->

-   Años de educación y salarios por hora en Estados Unidos.

    $$
    \text {MCO: } \hat{\text{salario}} = 0.095 + 0.54 \text{educación}
    $$

-   La línea de regresión minimiza los residuos al cuadrado.

![Un ejemplo](../images/slides/sem2_images_reg.png){ .econ-slide-img }

</div>

<div class="econ-widget" data-widget="prediccion"></div>

<div class="econ-lamina" markdown>

#### Propiedades aritméticas de MCO { data-lamina="Lámina 20" }

<!-- sem2/clase2.tex · lámina 20 -->

1.  Los residuales suman cero:

    $$
    \sum_{i} \hat{u}_i = 0 \quad \Rightarrow \quad \bar{\hat{u}} = 0
    $$

2.  $x$ es ortogonal a los residuos:

    $$
    \sum_{i} x_{i} \hat{u}_i = 0
    $$

3.  El promedio muestral de la variable dependiente $y_i$ es igual al promedio muestral de la estimación $\hat{y}_i: \bar{y} = \bar{\hat{y}}$

4.  La línea de regresión pasa por el promedio de los datos:

    $$
    \bar{y} = \hat{\beta}_0 + \hat{\beta}_1 \bar{x}
    $$

</div>

!!! tip "Complemento · Compruébalo"
    En el simulador *encuentra la recta de mínimos cuadrados* (más arriba, junto a la lámina 14) activa **Mostrar recta MCO**: verás que $\sum_i \hat{u}_i = 0$, $\sum_i x_i\hat{u}_i = 0$ y que la recta pasa por $(\bar{x}, \bar{y})$, incluso si arrastras los puntos.

<div class="econ-practica" id="practica-4">
<p class="econ-practica-t"><span>✍️ Practica · Tema 4</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Con salario estimado = 0.095 + 0.54·educación, ¿cuál es el salario predicho para 12 años de educación?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>6.58 dólares por hora</button>
<button class="econ-quiz-opt" data-why="Falta sumar el intercepto 0.095.">6.48 dólares por hora</button>
<button class="econ-quiz-opt" data-why="0.54 es la pendiente: el cambio por cada año adicional.">0.54 dólares por hora</button>
</div>
<p class="econ-quiz-fb">✅ 0.095 + 0.54 · 12 = 6.575. Pruébalo en el simulador de predicción.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Cuál de estas afirmaciones NO se cumple siempre en MCO con intercepto?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-why="Se cumple siempre: es la primera condición de primer orden.">Σûᵢ = 0</button>
<button class="econ-quiz-opt" data-why="Se cumple siempre: es la propiedad 4 de la lámina 20.">La recta pasa por (x̄, ȳ).</button>
<button class="econ-quiz-opt" data-correct>Todos los residuos ûᵢ son pequeños.</button>
</div>
<p class="econ-quiz-fb">✅ Las propiedades de la lámina 20 son algebraicas; cada residuo puede ser grande.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Las propiedades, número a número</p>

Estima una regresión y verifica las cuatro propiedades aritméticas de la lámina 20. Después predice el salario para 12 años de educación.

```r
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
```

**🎯 Reto:** predice el salario para 16 años de educación con `predict()`.
{: .econ-r-reto }

</div>

### Método de momentos { #tema-5 .econ-tema data-num="5" data-laminas="láminas 21–23" data-toc-label="Tema 5 · Método de momentos" }

<p class="econ-tema-q">¿Hay otra forma de llegar a los mismos estimadores?</p>

<div class="econ-lamina" markdown>

#### Método de momentos { data-lamina="Láminas 21–22" }

<!-- sem2/clase2.tex · lámina 21 -->

$$
\begin{aligned}
y=\beta_0+\beta_1x+u\\
E(u)= 0= E(y-\beta_0-\beta_1x) \\
E(xu)=0=E[x(y-\beta_0-\beta_1x)]
\end{aligned}
$$

Se eligen estimaciones de los parámetros $\beta_0$ y $\beta_1$ que resuelvan las contrapartes muestrales.

<!-- sem2/clase2.tex · lámina 22 -->

$$
\begin{aligned}
\sum_{i=1}^{n} (y_i - \hat{\beta}_0 - \hat{\beta}_1 x_i) = 0  \\
\sum_{i=1}^{n} x_i(y_i - \hat{\beta}_0 - \hat{\beta}_1 x_i) = 0
\end{aligned}
$$

</div>

<div class="econ-lamina" markdown>

#### Estimación de $\beta$ MCO { data-lamina="Lámina 23" data-toc-label="Estimación de β MCO" }

<!-- sem2/clase2.tex · lámina 23 -->

$$
\quad \min_{\hat{\beta}_0, \hat{\beta}_1} \sum_{i=1}^{n} \hat{u}_i^2 = \min_{\hat{\beta}_0, \hat{\beta}_1} \sum_{i=1}^{n} (y_i - \hat{\beta}_0 - \hat{\beta}_1 x_i)^2
$$

Condiciones de primer orden:

$$
{}[\hat{\beta}_0] : \quad \sum_{i=1}^{n} (y_i - \hat{\beta}_0 - \hat{\beta}_1 x_i) = 0
$$

$$
{}[\hat{\beta}_1] : \quad \sum_{i=1}^{n} x_i(y_i - \hat{\beta}_0 - \hat{\beta}_1 x_i) = 0
$$

</div>

<div class="econ-practica" id="practica-5">
<p class="econ-practica-t"><span>✍️ Practica · Tema 5</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">El método de momentos reemplaza E[u] = 0 y E[xu] = 0 por…</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>…sus análogos muestrales: (1/n)Σûᵢ = 0 y (1/n)Σxᵢûᵢ = 0.</button>
<button class="econ-quiz-opt" data-why="El método usa las condiciones de momentos, no el R².">…la condición de que el R² sea máximo.</button>
<button class="econ-quiz-opt" data-why="No se necesita normalidad.">…un supuesto de normalidad.</button>
</div>
<p class="econ-quiz-fb">✅ Láminas 21–22.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">En la regresión simple, ¿qué relación hay entre los estimadores de momentos y los de MCO?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Son idénticos.</button>
<button class="econ-quiz-opt" data-why="Son exactamente los mismos números.">Los de momentos son siempre más precisos.</button>
<button class="econ-quiz-opt" data-why="Coinciden para cualquier n: las ecuaciones son las mismas que las condiciones de primer orden de MCO.">Solo coinciden si n > 30.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 23: las condiciones de primer orden de MCO son las mismas ecuaciones.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Resolver los momentos</p>

Escribe las dos condiciones de momentos como un sistema lineal, resuélvelo con `solve()` y compara con MCO.

```r
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
```

**🎯 Reto:** cambia el tamaño de la muestra de `80` a `8` (en las dos líneas). ¿Siguen coincidiendo?
{: .econ-r-reto }

</div>

### Bondad de ajuste y unidades de medida { #tema-6 .econ-tema data-num="6" data-laminas="láminas 24–26" data-toc-label="Tema 6 · R² y unidades" }

<p class="econ-tema-q">¿Qué tan bien explica x la variación de y?</p>

<div class="econ-lamina" markdown>

#### Descomposición de la varianza muestral { data-lamina="Lámina 24" }

<!-- sem2/clase2.tex · lámina 24 -->

-   Sea SST la suma de cuadrados totales (total sum of squares):

    $$
    SST = \sum_{i=1}^{n} (y_i - \bar{y})^2
    $$

-   Sea SSE la suma de cuadrados explicados (explained sum of squares):

    $$
    SSE = \sum_{i=1}^{n} (\hat{y}_i - \bar{y})^2
    $$

-   Sea SSR la suma de cuadrados no explicados (residual sum of squares):

    $$
    SSR = \sum_{i=1}^{n} \hat{u}_i^2
    $$

Se puede demostrar que:

$$
SST = SSE + SSR
$$

</div>

<div class="econ-lamina" markdown>

#### Bondad de Ajuste: $R^2$ { data-lamina="Lámina 25" data-toc-label="Bondad de Ajuste: R²" }

<!-- sem2/clase2.tex · lámina 25 -->

-   A partir de esta relación se define:

    $$
    R^2 = \frac{SSE}{SST} = 1 - \frac{SSR}{SST}
    $$

-   Bondad de ajuste: la proporción de la varianza muestral de $y$ que es explicada por $x$.

-   Como $0 \leq SSE \leq SST$, entonces $0 \leq R^2 \leq 1$.

-   Cuanto más cercano a $1$, más de la variabilidad de $y$ es explicada por el modelo.

</div>

<div class="econ-widget" data-widget="varianza"></div>

<div class="econ-widget" data-widget="r2-galeria"></div>

<div class="econ-lamina" markdown>

#### Cambio de unidades de medición { data-lamina="Lámina 26" }

<!-- sem2/clase2.tex · lámina 26 -->

-   Si la variable independiente se divide o se multiplica por una constante distinta de cero, c, entonces el coeficiente de la pendiente de MCO se multiplica por c o se divide entre c, respectivamente.

-   Cambiar sólo las unidades de medición de la variable independiente no afecta el intercepto.

-   La bondad de ajuste del modelo no depende de las unidades de medición de las variables.

</div>

<div class="econ-widget" data-widget="unidades"></div>

<div class="econ-practica" id="practica-6">
<p class="econ-practica-t"><span>✍️ Practica · Tema 6</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Si R² = 0.30, ¿qué significa?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Que el 30% de la variación muestral de y se explica por x.</button>
<button class="econ-quiz-opt" data-why="El R² mide ajuste, no causalidad.">Que x causa el 30% de y.</button>
<button class="econ-quiz-opt" data-why="Un R² bajo es común con datos individuales y no invalida la regresión.">Que el modelo está mal especificado.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 25: R² = SSE/SST.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Si la variable x pasa de pesos a miles de pesos (se divide por 1 000), ¿qué pasa?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>β̂₁ se multiplica por 1 000 y el R² no cambia.</button>
<button class="econ-quiz-opt" data-why="Si x se divide por c, la pendiente se multiplica por c (lámina 26).">β̂₁ se divide por 1 000 y el R² no cambia.</button>
<button class="econ-quiz-opt" data-why="El R² no depende de las unidades de medida.">Cambian β̂₁ y el R².</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 26. Pruébalo en el simulador de unidades.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · SST = SSE + SSR</p>

Verifica la descomposición de la varianza, calcula el R² a mano y cambia las unidades de x.

```r
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
```

**🎯 Reto:** en vez de dividir el ingreso, divide el gasto por 1 000. ¿Qué coeficientes cambian?
{: .econ-r-reto }

</div>

### Supuestos, insesgamiento y varianza { #tema-7 .econ-tema data-num="7" data-laminas="láminas 27–34" data-toc-label="Tema 7 · Supuestos y propiedades" }

<p class="econ-tema-q">¿Cuándo podemos confiar en que MCO acierta en promedio, y con cuánta precisión?</p>

<div class="econ-lamina" markdown>

#### Supuesto 1 RLS { data-lamina="Lámina 27" }

<!-- sem2/clase2.tex · lámina 27 -->

En el modelo poblacional, la variable dependiente, y, está relacionada con la variable independiente, x, y con el error (o perturbación), u, de la manera siguiente:<br>

$$
y=\beta_0 +\beta_1x+ u
$$

donde $\beta_0$ y $\beta_1$ representan los parámetros poblacionales, del intercepto y pendiente, respectivamente. $u$ contiene los efectos no observables que afectan a $y$, $u$ no debe confundirse con los residuales.

</div>

<div class="econ-lamina" markdown>

#### Supuesto 2 RLS { data-lamina="Lámina 28" }

<!-- sem2/clase2.tex · lámina 28 -->

Se cuenta con una muestra **aleatoria** de tamaño n, $\lbrace(x_i,y_i): i = 1, 2, ..., n\rbrace$.

</div>

<div class="econ-lamina" markdown>

#### Supuesto 3 RLS { data-lamina="Lámina 29" }

<!-- sem2/clase2.tex · lámina 29 -->

No todos los valores muestrales de x, a saber $\lbrace x_i, i = 1,.., n\rbrace$, son iguales, es decir, no todos tienen el mismo valor.

</div>

<div class="econ-lamina" markdown>

#### Supuesto 4 RLS { data-lamina="Lámina 30" }

<!-- sem2/clase2.tex · lámina 30 -->

Para todo valor de la variable explicativa, el valor esperado del error u es cero.

$E(u|x) = 0$.

</div>

<div class="econ-lamina" markdown>

#### Insesgamiento de los estimadores de MCO { data-lamina="Láminas 31–32" }

<!-- sem2/clase2.tex · lámina 31 -->

Si se cumplen los supuestos 1-4 RLS, los estimadores $\hat{\beta_0}$ y $\hat{\beta_1}$ son insesgados:

$$
E(\hat{\beta_0}|x)=\beta_0
$$

$$
E(\hat{\beta_1}|x)=\beta_1
$$

El insesgamiento es una propiedad de las distribuciones muestrales de $\hat{\beta_0}$ y $\hat{\beta_1}$. No dice nada acerca de las estimaciones que se obtienen a partir de una determinada muestra. Se espera que, si la muestra es de alguna manera "representativa", la estimación estará "cerca" del valor poblacional.

<!-- sem2/clase2.tex · lámina 32 -->

-   Si u contiene factores que afectan a y que están correlacionados con x, puede obtenerse una **correlación espuria**.

-   Es decir, se encuentra una relación entre x e y que en realidad se debe a factores no observados que afectan a y que resultan estar correlacionados con x.

</div>

<div class="econ-lamina" markdown>

#### Supuesto 5 RLS { data-lamina="Lámina 33" }

<!-- sem2/clase2.tex · lámina 33 -->

El error u tiene la misma varianza para cualquier valor de la variable explicativa.

$$
Var(u|x)=\sigma^2
$$

La varianza de los factores inobservables, u, condicionales en x, es constante. Esto se conoce como el supuesto de **homocedasticidad o de varianza constante.**

</div>

<div class="econ-widget" data-widget="homocedasticidad"></div>

<div class="econ-lamina" markdown>

#### Varianza de los estimadores de mínimos cuadrados ordinarios { data-lamina="Lámina 34" }

<!-- sem2/clase2.tex · lámina 34 -->

Considerando el supuesto 5 RLS, tenemos:

$$
Var(\hat{\beta_1}|x)={\sigma^2\over \sum_{i=1}^n(x_i-\bar{x})^2}
$$

$$
Var(\hat{\beta_0}|x)={\sigma^2 \sum_{i=1}^nx_i^2\over n\sum_{i=1}^n(x_i-\bar{x})^2 }
$$

</div>

<div class="econ-widget" data-widget="insesgado"></div>

<div class="econ-widget" data-widget="supuestos"></div>

<div class="econ-practica" id="practica-7">
<p class="econ-practica-t"><span>✍️ Practica · Tema 7</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Qué supuesto exige que no todos los valores muestrales de x sean iguales?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>RLS 3</button>
<button class="econ-quiz-opt" data-why="RLS 2 es el muestreo aleatorio.">RLS 2</button>
<button class="econ-quiz-opt" data-why="RLS 5 es la homocedasticidad: Var(u | x) = σ².">RLS 5</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 29: sin variación en x no se puede calcular β̂₁.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Que β̂₁ sea insesgado significa que…</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>…en promedio sobre muchas muestras, β̂₁ es igual a β₁.</button>
<button class="econ-quiz-opt" data-why="Cada muestra da un β̂₁ distinto; el insesgamiento habla del promedio.">…en cada muestra, β̂₁ = β₁.</button>
<button class="econ-quiz-opt" data-why="La varianza la mide la fórmula de la lámina 34, y no es cero.">…β̂₁ tiene varianza cero.</button>
</div>
<p class="econ-quiz-fb">✅ Láminas 31–32: con RLS 1–4, E[β̂₁] = β₁.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Insesgamiento y varianza por simulación</p>

Repite 5 000 veces la muestra: el promedio de β̂₁ debería ser el β₁ verdadero, y su varianza, la de la fórmula de la lámina 34.

```r
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
```

**🎯 Reto:** cambia `sd = sigma` por `sd = 0.3 * x` (el error crece con x). ¿Sigue siendo insesgado? ¿Coincide la fórmula?
{: .econ-r-reto }

</div>

---

!!! abstract "🧠 Ideas clave"
    - En $y = \beta_0 + \beta_1 x + u$, $\beta_1$ es el cambio en $E[y \mid x]$ por unidad de $x$; es **causal solo si** $E[u \mid x] = 0$.
    - **MCO** elige la recta que minimiza $\sum_i \hat{u}_i^2$; por eso $\sum_i \hat{u}_i = 0$ y $\sum_i x_i \hat{u}_i = 0$.
    - $SST = SSE + SSR$ y $R^2 = SSE/SST$ mide **ajuste**, no causalidad: un $R^2$ bajo no invalida la regresión.
    - Con **RLS 1–4** MCO es **insesgado**; con **RLS 5** (homocedasticidad) vale $\text{Var}(\hat{\beta}_1 \mid x) = \sigma^2 / \sum_i (x_i - \bar{x})^2$.

## ✅ Autoevaluación

<div class="econ-quiz">
<p class="econ-quiz-q">Con los datos de EE. UU. se estimó: salario estimado = 0.095 + 0.54·educación. ¿Cuál es la interpretación correcta de 0.54?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">Un año más de educación causa un aumento de 0.54 dólares por hora en el salario de cada persona.</button>
<button class="econ-quiz-opt" data-correct>Un año más de educación se asocia, en promedio, con 0.54 dólares más por hora.</button>
<button class="econ-quiz-opt">El 54% de la variación del salario se explica por la educación.</button>
</div>
<p class="econ-quiz-fb">✅ β̂₁ describe cómo cambia el salario <strong>esperado</strong>. Solo es causal si E[u|x] = 0 (supuesto 4), lo que es dudoso: ¿qué hay en u? La tercera opción describe un R², no una pendiente.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">En una regresión, SST = 400 y SSR = 300. ¿Cuánto vale el R²?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">0.75</button>
<button class="econ-quiz-opt" data-correct>0.25</button>
<button class="econ-quiz-opt">No se puede calcular sin SSE</button>
</div>
<p class="econ-quiz-fb">✅ R² = 1 − SSR/SST = 1 − 300/400 = 0.25 (y SSE = SST − SSR = 100).</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Según Var(β̂₁|x) = σ² / Σ(xᵢ − x̄)², ¿cuál de estos cambios <strong>no</strong> reduce la varianza de β̂₁?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">Aumentar el tamaño muestral</button>
<button class="econ-quiz-opt">Tener más variabilidad en x</button>
<button class="econ-quiz-opt" data-correct>Que el error u tenga mayor varianza σ²</button>
</div>
<p class="econ-quiz-fb">✅ Un σ² mayor <em>aumenta</em> la varianza. Más observaciones y más dispersión en x aumentan Σ(xᵢ − x̄)² y la reducen (pruébalo en el simulador de insesgamiento).</p>
</div>

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 2 (*El modelo de regresión simple*).
- Próxima clase: **Causalidad y variable omitida** — ¿cuándo podemos interpretar $\hat{\beta}_1$
  como un efecto causal?
