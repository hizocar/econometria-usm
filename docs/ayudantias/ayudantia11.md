<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->

# Ayudantía 11 · Variables binarias y modelo de probabilidad lineal

<div class="usm-session-meta">
<span>📘 Ayudantía · Semana 11</span>
<span class="usm-tag-gold">Complementa la Clase 11</span>
</div>

!!! info "Contenido oficial de la ayudantía"
    Esta página reproduce **íntegros y en orden** los ejercicios de la semana 11 (`sem11/ejer_dummy.tex` y
    `sem11/ejercicio_dummy_hete.tex`). Se trabajan en la **ayudantía**, no en la cátedra
    ([Clase 11](../clases/clase11.md)).

!!! example "Cómo estudiar esta página"
    La ayudantía está ordenada en **2 temas**. Cada tema parte con una **pregunta guía**, sigue con las láminas
    y los simuladores, y termina con **✍️ preguntas de selección múltiple** (cada alternativa incorrecta explica
    por qué no lo es) y un **🧪 ejercicio de R** que puedes editar y ejecutar aquí mismo, sin instalar nada.
    Los 2 ejercicios de R en un solo archivo: [📥 ayudantia11.R](../r/ayudantia11.R).

## 🎯 Objetivos

- Calcular diferencias porcentuales entre categorías con dummies, de forma aproximada y exacta.
- Testear la diferencia entre dos categorías y entender el papel de la covarianza.
- Derivar la varianza del error en el modelo de probabilidad lineal.

## 🗺️ Temas de la ayudantía

Haz clic en un tema para ir directo a él.

<ol class="econ-ruta is-ayudantia">
<li><span class="econ-ruta-h"></span><a class="econ-ruta-a" href="#tema-1"><span class="econ-ruta-n">1</span><span class="econ-ruta-t">Diferencias salariales entre industrias</span><span class="econ-ruta-l">Parte 1 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h"></span><a class="econ-ruta-a" href="#tema-2"><span class="econ-ruta-n">2</span><span class="econ-ruta-t">El MPL es heterocedástico</span><span class="econ-ruta-l">Parte 2 · ✍️ 2 preguntas · 🧪 R</span></a></li>
</ol>

## Ejercicio: diferencias salariales { .econ-parte .is-ayudantia data-eyebrow="Parte 1 · Ayudantía" data-toc-label="Parte 1 · Ayudantía · Ejercicio: diferencias salariales" }

<p class="econ-source">📄 Documento: <code>sem11/ejer_dummy.tex</code> · 1 secciones</p>

### Diferencias salariales entre industrias { #tema-1 .econ-tema .is-ayudantia data-num="1" data-laminas="Parte 1" data-toc-label="Tema 1 · Dummies de industria" }

<p class="econ-tema-q">¿Cuánto más ganan los presidentes de consejo en una industria que en otra?</p>

<div class="econ-lamina is-ayudantia" markdown>

#### Ejercicio: Diferencias salariales entre industrias { data-lamina="Lámina 1" }

<!-- sem11/ejer_dummy.tex · lámina 1 -->

Se estima la siguiente ecuación de regresión para los sueldos de los presidentes de consejos de administración:

$$
\begin{aligned}
\log(\widehat{salary}) &= 4.59 + 0.257 \log(sales) + 0.011 \, roe + 0.158 \, finance
+ 0.181 \, consprod - 0.283 \, service \\
&\quad (0.30) \quad \quad \, (0.032) \quad \quad \qquad \, (0.004) \qquad \qquad (0.089) \qquad \quad (0.085) \qquad \qquad \qquad (0.099) \\
n &= 209, \quad R^2 = 0.357
\end{aligned}
$$

donde las variables *finance*, *consprod* y *service* son **dummies** que indican si la empresa pertenece a los sectores financiero, de productos de consumo o de servicios, respectivamente. La categoría de referencia (omitida) corresponde a la **industria del transporte**.

---

##### (a) Diferencia porcentual entre servicios y transporte

El coeficiente de la variable *service* es $\hat{\beta}_{service} = -0.283$.

-   **Interpretación aproximada:** El salario en el sector servicios es aproximadamente un $28.3\%$ menor que en el transporte.

-   **Cálculo exacto:**

    $$
    \Delta \% salary = 100 \cdot \left( e^{\hat{\beta}_{service}} - 1 \right)
    = 100 \cdot (e^{-0.283} - 1)
    = 100 \cdot (0.753 - 1) = -24.7\%.
    $$

    Por lo tanto, los sueldos en la industria de servicios son un **24.7% menores** que en la industria del transporte, manteniendo constantes *sales* y *roe*.[^1]

El error estándar del coeficiente es $se(\hat{\beta}_{service}) = 0.099$, por lo que el estadístico $t$ es:

$$
t = \frac{-0.283}{0.099} \approx -2.86.
$$

Dado que $|t| > 1.96$, se **rechaza $H_0: \beta_{service} = 0$** al 5%. La diferencia salarial con respecto al transporte es estadísticamente significativa.

---

##### (b) Diferencia porcentual entre productos de consumo y sector financiero

Se comparan los coeficientes de *consprod* y *finance*:

$$
\Delta \log(salary) = \hat{\beta}_{consprod} - \hat{\beta}_{finance}
= 0.181 - 0.158 = 0.023.
$$

**Interpretación:** Aproximadamente, los sueldos en el sector de productos de consumo son un $2.3\%$ más altos que en el sector financiero.

$$
\Delta \% salary = 100 \cdot \left( e^{0.023} - 1 \right)
= 100 \cdot (1.0233 - 1) = 2.33\%.
$$

---

##### (c) Prueba de significancia para la diferencia

El error estándar de la diferencia se calcula como:

$$
se(\hat{\beta}_{consprod} - \hat{\beta}_{finance})
= \sqrt{Var(\hat{\beta}_{consprod}) + Var(\hat{\beta}_{finance}) - 2 \, Cov(\hat{\beta}_{consprod}, \hat{\beta}_{finance})}.
$$

Como la covarianza no fue reportada, consideramos distintos escenarios:

-   **Caso 1:** $\text{Cov} = 0$

    $$
    se = \sqrt{(0.085)^2 + (0.089)^2}
    = \sqrt{0.015146} \approx 0.123,
    \quad
    t = \frac{0.023}{0.123} \approx 0.19.
    $$

    Dado que $|t| < 1.96$, no se puede rechazar $H_0$ de igualdad de salarios.

-   **Caso 2:** $\text{Cov} < 0$

    $$
    se = \sqrt{(0.085)^2 + (0.089)^2 - 2\,\text{Cov}} > 0.123.
    $$

    El valor de $t$ sería aún más cercano a 0, por lo tanto, no se rechazaría $H_0$ de igualdad de salarios.

-   **Caso 3:** $\text{Cov} > 0$ El error estándar sería menor que 0.123, en este caso el resultado del test es ambiguo depende de que tanto disminuya se.

---

[^1]: *Nota:* La diferencia entre el cálculo aproximado ($-28.3\%$) y el exacto ($-24.7\%$) se debe a que la aproximación lineal $100\beta$ es válida solo para valores pequeños de $|\beta|$.

</div>

<div class="econ-practica" id="practica-1">
<p class="econ-practica-t"><span>✍️ Practica · Tema 1</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Con log(salary) y un coeficiente de −0.283 para service, ¿cuál es la diferencia exacta respecto de transporte?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>−24.7%</button>
<button class="econ-quiz-opt" data-why="Esa es la aproximación 100·β, buena solo para β pequeños.">−28.3%</button>
<button class="econ-quiz-opt" data-why="Hay que multiplicar por 100.">−0.283%</button>
</div>
<p class="econ-quiz-fb">✅ 100·(e^−0.283 − 1) = −24.7%.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Para testear si consprod y finance difieren, ¿qué falta en la salida para calcular el error estándar exacto?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>La covarianza entre los dos coeficientes.</button>
<button class="econ-quiz-opt" data-why="El R² no entra en el error estándar de una diferencia.">El R² de la regresión.</button>
<button class="econ-quiz-opt" data-why="n = 209 sí se reporta.">El número de observaciones.</button>
</div>
<p class="econ-quiz-fb">✅ se = √(Var₁ + Var₂ − 2·Cov), como en la Clase 8.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Las cuentas del ejercicio</p>

Reproduce las diferencias porcentuales y los estadísticos t del ejercicio.

```r
# Ejercicio de diferencias salariales entre industrias
b_service  <- -0.283; se_service <- 0.099
100 * b_service                     # aproximación: −28.3%
100 * (exp(b_service) - 1)          # exacto: −24.7%
b_service / se_service              # t ≈ −2.86

# Consumo vs. financiero: la covarianza no se reporta
dif <- 0.181 - 0.158
se_sin_cov <- sqrt(0.085^2 + 0.089^2)
c(dif = dif, se = se_sin_cov, t = dif / se_sin_cov)
```

**🎯 Reto:** ¿qué covarianza haría que t = 1.96 en la comparación de consprod y finance?
{: .econ-r-reto }

</div>

## Ejercicios: modelo de probabilidad lineal { .econ-parte .is-ayudantia data-eyebrow="Parte 2 · Ayudantía" data-toc-label="Parte 2 · Ayudantía · Ejercicios: modelo de probabilidad lineal" }

<p class="econ-source">📄 Documento: <code>sem11/ejercicio_dummy_hete.tex</code> · 1 secciones</p>

### El MPL es heterocedástico { #tema-2 .econ-tema .is-ayudantia data-num="2" data-laminas="Parte 2" data-toc-label="Tema 2 · MPL y heterocedasticidad" }

<p class="econ-tema-q">¿Por qué la varianza del error en el MPL depende de x?</p>

<div class="econ-lamina is-ayudantia" markdown>

#### Ejercicios: modelo de probabilidad lineal { data-lamina="Lámina 1" }

<!-- sem11/ejercicio_dummy_hete.tex · lámina 1 -->

**Ejercicio 1:**

En un Modelo de Probabilidad Lineal (MPL) con variable dependiente binaria $Y_i \in \{0,1\}$:

$$
Y_i = X_i\beta + u_i
$$

donde $E[Y_i|X_i] = P(Y_i=1|X_i) = X_i\beta$.

El error es:

$$
u_i = Y_i - X_i\beta
$$

La varianza condicional del error:

$$
\operatorname{Var}(u_i|X_i) = E[u_i^2|X_i] - (E[u_i|X_i])^2
$$

Pero $E[u_i|X_i]=0$ por construcción, luego:

$$
\operatorname{Var}(u_i|X_i) = E[u_i^2|X_i]
$$

Desarrollando $E[u_i^2|X_i]$:

$$
\begin{aligned}
E[u_i^2|X_i] &= P(Y_i=1|X_i)\cdot(1 - X_i\beta)^2 + P(Y_i=0|X_i)\cdot(0 - X_i\beta)^2 \\
&= (X_i\beta)(1 - X_i\beta)^2 + (1 - X_i\beta)(X_i\beta)^2
\end{aligned}
$$

Factorizando $(X_i\beta)(1 - X_i\beta)$:

$$
\begin{aligned}
E[u_i^2|X_i] &= (X_i\beta)(1 - X_i\beta)\big[(1 - X_i\beta) + X_i\beta\big] \\
&= (X_i\beta)(1 - X_i\beta) \cdot 1 \\
&= (X_i\beta)(1 - X_i\beta)
\end{aligned}
$$

Por tanto:

$$
\operatorname{Var}(u_i|X_i) = (X_i\beta)(1 - X_i\beta)
$$

La varianza depende de $X_i\beta$ (la probabilidad predicha). Como $X_i\beta$ varía con $i$, la varianza no es constante. No se cumple homocedasticidad a menos que $X_i\beta$ sea el mismo para todo $i$ (caso trivial).

**Ejercicio 2:**

Suponga que usted cuenta con información sobre la *felicidad* de las personas ($B_i$), la cual es una variable dummy que puede tomar sólo dos valores: $0$ si el individuo se clasifica como "no feliz" y $1$ si el individuo dice "ser feliz". Por otro lado, asuma que tiene información, para estos mismos individuos, sobre un conjunto de variables que afectan la felicidad. En concreto, se conoce la edad ($E_i$), género ($M_i$: mujer=1), años de escolaridad ($S_i$), ingreso familiar ($I_i$, en miles de pesos al año) y estado de salud ($H_i$: buena salud=1). Con base en esto se plantea el siguiente modelo econométrico:

$$
B_i \;=\; \beta_1 + \beta_2 E_i + \beta_3 M_i + \beta_4 S_i + \beta_5 I_i + \beta_6 H_i + u_i
\tag{1}
$$

donde $u_i$ es un shock estocástico que captura factores no observables que afectan la felicidad, cumpliendo $\mathbb{E}[u_i|X_i]=0$.

1.  ¿Es posible estimar el modelo (1) por Mínimos Cuadrados Ordinarios (MCO)? Justifique.

2.  Suponiendo que se ha estimado (1) por MCO y se ha obtenido el vector de coeficientes estimados $\hat{\beta} = (\hat{\beta}_1, \ldots, \hat{\beta}_6)'$, escriba la expresión del estimador de la probabilidad de que un individuo con características $X_i$ sea feliz. ¿Qué propiedades estadísticas tiene este estimador bajo los supuestos clásicos?

3.  Con base en $\hat{\beta}_5$ (coeficiente estimado para el ingreso), ¿cuál es el efecto marginal estimado del ingreso familiar sobre la probabilidad de ser feliz? ¿Es este efecto marginal constante o variable? Interprete $\hat{\beta}_5 = 0.012$ suponiendo que $I_i$ se mide en miles de pesos anuales.

4.  Mencione y explique dos críticas a la estimación por MCO del modelo (1).

##### 1)

Sí, es *posible* estimar (1) por MCO; esto se conoce como **Modelo de Probabilidad Lineal (MPL)**. El estimador MCO es consistente e insesgado bajo los supuestos de exogeneidad estricta ($\mathbb{E}[u_i|X_i]=0$) y rango completo de la matriz de regresores. Sin embargo, el supuesto de homocedasticidad se viola inherentemente debido a la naturaleza binaria de $B_i$. Demostración:

Dado que $B_i\in\{0,1\}$, la esperanza condicional es:

$$
\mathbb{E}[B_i|X_i] = \Pr(B_i=1|X_i) \equiv p_i = X_i'\beta.
$$

El error es $u_i = B_i - p_i$. Calculando su varianza condicional:

$$
\begin{aligned}
\operatorname{Var}(u_i|X_i) &= \mathbb{E}[u_i^2|X_i] - (\mathbb{E}[u_i|X_i])^2 = \mathbb{E}[u_i^2|X_i] \\
&= \Pr(B_i=1|X_i)\cdot(1-p_i)^2 + \Pr(B_i=0|X_i)\cdot(0-p_i)^2 \\
&= p_i(1-p_i)^2 + (1-p_i)p_i^2 \\
&= p_i(1-p_i)\big[(1-p_i)+p_i\big] = p_i(1-p_i).
\end{aligned}
$$

Por tanto,

$$
\operatorname{Var}(u_i|X_i) = (X_i'\beta)(1 - X_i'\beta).
$$

Dado que esta expresión depende de $X_i$ (a través de $p_i$), la varianza no es constante: hay heterocedasticidad pura. En consecuencia, los errores estándar habituales de MCO son inconsistentes, aunque los coeficientes siguen siendo insesgados y consistentes.

##### 2)

Una vez estimado (1) por MCO, el estimador de la probabilidad condicional de felicidad para un individuo con características $X_i$ viene dado por el valor predicho:

$$
\widehat{\Pr}(B_i=1 \mid X_i) = \mathbb{E}[B_i \mid X_i] = X_i'\hat{\beta} = \hat{\beta}_1 + \hat{\beta}_2 E_i + \hat{\beta}_3 M_i + \hat{\beta}_4 S_i + \hat{\beta}_5 I_i + \hat{\beta}_6 H_i.
$$

**Propiedades estadísticas:** Bajo los supuestos de MCO (exogeneidad, rango completo y homocedasticidad ---esta última no se cumple en la práctica---), $\widehat{\Pr}(B_i=1|X_i)$ es un estimador insesgado de $\Pr(B_i=1|X_i)$ en el sentido de que $\mathbb{E}[X_i'\hat{\beta}|X_i] = X_i'\beta$. Además, es consistente: plim$_{n\to\infty} X_i'\hat{\beta} = X_i'\beta$. No obstante, debido a la heterocedasticidad, su varianza estimada por el método clásico es incorrecta, afectando la construcción de intervalos de confianza. Una limitación adicional es que $X_i'\hat{\beta}$ puede tomar valores fuera del intervalo $[0,1]$, en cuyo caso la estimación carece de sentido probabilístico.

##### 3)

En el MPL, el efecto marginal estimado del ingreso sobre la probabilidad de ser feliz es constante e igual al coeficiente estimado:

$$
\widehat{\frac{\partial \Pr(B_i=1 \mid X_i)}{\partial I_i}} = \hat{\beta}_5.
$$

**Constancia:** Este efecto marginal **no varía** con el nivel de ingreso ni con las demás covariables, debido a la linealidad del modelo. Es una propiedad restrictiva del MPL.

**Interpretación de $\hat{\beta}_5 = 0.012$:** Dado que $I_i$ se mide en miles de pesos anuales, un aumento de mil pesos en el ingreso familiar anual está asociado con un incremento esperado de $0.012$ en la probabilidad de ser feliz, es decir, **1.2 puntos porcentuales**, manteniendo constantes las demás variables ($E_i, M_i, S_i, H_i$). Este efecto es marginal y constante: el cambio en probabilidad es el mismo si el ingreso pasa de 10 a 11 mil pesos que de 100 a 101 mil pesos.

##### 4) Dos críticas a la estimación por MCO del modelo (1).

1.  **Heterocedasticidad y validez de la inferencia.** Como se demostró en (1), $\operatorname{Var}(u_i|X_i)=p_i(1-p_i)$ no es constante. Los errores estándar convencionales de MCO serán incorrectos, invalidando los contrastes de hipótesis ($t$, $F$) si no se aplica una corrección. La solución más simple es emplear errores estándar robustos a heterocedasticidad (Huber-White), aunque la solución óptima es usar modelos de elección discreta como Logit o Probit, que modelan explícitamente esta heterocedasticidad inherente.

2.  **Restricción funcional lineal y predicciones fuera de rango.** El MPL impone una relación lineal entre las covariables y la probabilidad, lo que produce dos problemas relacionados: (i) es frecuente obtener $\hat p_i = X_i'\hat\beta < 0$ o $\hat p_i > 1$, valores sin sentido probabilístico; (ii) los efectos marginales constantes son poco realistas ---como se vio en (3), $\hat\beta_5$ no captura posibles rendimientos marginales decrecientes del ingreso sobre la felicidad. Los modelos Logit/Probit garantizan $\hat p_i \in (0,1)$ y generan efectos marginales que varían con las covariables, capturando la curvatura natural de las funciones de distribución acumulada.

</div>

<div class="econ-practica" id="practica-2">
<p class="econ-practica-t"><span>✍️ Practica · Tema 2</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En el MPL, Var(u | x) es igual a…</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>p(x)·(1 − p(x)), donde p(x) = P(y = 1 | x).</button>
<button class="econ-quiz-opt" data-why="Depende de x a través de p(x): no es constante.">σ², constante.</button>
<button class="econ-quiz-opt" data-why="Esa es la esperanza de y, no la varianza del error.">p(x).</button>
</div>
<p class="econ-quiz-fb">✅ Por eso el MPL viola la homocedasticidad.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Para qué valor de p(x) es máxima la varianza del error?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>0.5</button>
<button class="econ-quiz-opt" data-why="Con p = 1, p(1 − p) = 0.">1</button>
<button class="econ-quiz-opt" data-why="Con p = 0, la varianza también es 0.">0</button>
</div>
<p class="econ-quiz-fb">✅ p(1 − p) se maximiza en p = 0.5, con valor 0.25.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · La varianza del error en el MPL</p>

Tabula y grafica p(1 − p), la varianza del error en el MPL.

```r
# En el MPL, Var(u | x) = p(x)·(1 − p(x)): depende de x, así que hay heterocedasticidad
p <- seq(0, 1, by = 0.1)
data.frame(p = p, varianza = p * (1 - p))
curve(x * (1 - x), from = 0, to = 1, lwd = 3, col = "steelblue",
      xlab = "p(x) = P(y = 1 | x)", ylab = "Var(u | x)")
```

**🎯 Reto:** ¿qué valores de p dan una varianza menor a 0.1?
{: .econ-r-reto }

</div>

---

!!! abstract "🧠 Ideas clave"
    - Con $\log(y)$, el coeficiente de una dummy se lee como un porcentaje aproximado; el cálculo exacto es $100(e^{\beta} - 1)$.
    - Para comparar dos categorías no base se necesita la **covarianza** entre sus coeficientes.
    - En el MPL, $\text{Var}(u \mid x) = p(x)(1 - p(x))$: el modelo es heterocedástico por construcción.

## 🔗 Volver a la cátedra

- [Clase 11 · Variables binarias, test de Chow y modelo de probabilidad lineal](../clases/clase11.md)
