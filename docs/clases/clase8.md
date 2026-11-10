<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->

# Clase 8 · Inferencia sobre un conjunto de parámetros

<div class="usm-session-meta">
<span>📅 Viernes 4 de diciembre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Semana 8 · Contenido 5 · Análisis de regresión múltiple</span>
<span class="usm-tag-red">🛠️ Semana del Taller 2</span>
</div>

!!! info "Contenido oficial de la semana"
    Esta página reproduce **íntegras y en orden** las diapositivas de la cátedra del viernes de la
    semana 8 (`sem8/Clase9.tex`, 7 láminas). Los bloques **Interactivo**, los casos y las preguntas
    son material adicional para estudiar.

!!! example "Cómo estudiar esta página"
    La clase está ordenada en **3 temas**. Cada tema parte con una **pregunta guía**, sigue con las láminas
    y los simuladores, y termina con **✍️ preguntas de selección múltiple** (cada alternativa incorrecta explica
    por qué no lo es) y un **🧪 ejercicio de R** que puedes editar y ejecutar aquí mismo, sin instalar nada.
    Los 3 ejercicios de R en un solo archivo: [📥 clase8.R](../r/clase8.R).

## 🎯 Objetivos de la sesión

- Plantear hipótesis sobre **combinaciones lineales** de parámetros, como $\beta_1 = \beta_2$ o $\beta_1 = 2\beta_2$.
- Calcular la varianza de una combinación usando la **covarianza** entre estimadores, tomada de $\hat{\sigma}^2 (X^\top X)^{-1}$.
- Construir el estadístico $t$ y decidir con la regla de rechazo.

## 🗓️ Agenda de la cátedra (viernes 18:40 – 21:25)

Haz clic en un tema para ir directo a él.

<ol class="econ-ruta">
<li><span class="econ-ruta-h">18:40</span><a class="econ-ruta-a" href="#tema-1"><span class="econ-ruta-n">1</span><span class="econ-ruta-t">Hipótesis sobre combinaciones de parámetros</span><span class="econ-ruta-l">láminas 1–3 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">19:20</span><a class="econ-ruta-a" href="#tema-2"><span class="econ-ruta-n">2</span><span class="econ-ruta-t">Ejemplo: β₁ = β₂</span><span class="econ-ruta-l">láminas 4–5 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li class="is-break"><span class="econ-ruta-h">19:55</span><span class="econ-ruta-t">☕ Receso</span></li>
<li><span class="econ-ruta-h">20:05</span><a class="econ-ruta-a" href="#tema-3"><span class="econ-ruta-n">3</span><span class="econ-ruta-t">Ejercicio: β₁ = 2β₂</span><span class="econ-ruta-l">láminas 6–7 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li class="is-break"><span class="econ-ruta-h">20:40</span><span class="econ-ruta-t">🧪 Práctica guiada con R, preparación del Taller 2 y cierre</span></li>
</ol>

## Inferencia sobre un conjunto de parámetros { .econ-parte data-eyebrow="Parte 1 · Cátedra" data-toc-label="Parte 1 · Inferencia sobre un conjunto de parámetros" }

<p class="econ-source">📄 Diapositivas: <code>sem8/Clase9.tex</code> · 7 láminas</p>

### Hipótesis sobre combinaciones de parámetros { #tema-1 .econ-tema data-num="1" data-laminas="láminas 1–3" data-toc-label="Tema 1 · Combinaciones de parámetros" }

<p class="econ-tema-q">¿Es el efecto de A igual al de B? ¿Cómo se testea algo que involucra dos coeficientes?</p>

<div class="econ-lamina" markdown>

#### Introducción { data-lamina="Lámina 1" }

<!-- sem8/Clase9.tex · lámina 1 -->

-   La clase pasada, vimos cómo hacer un test de hipótesis sobre un estimador específico del MCO.

-   Pero a veces, no es eso lo que buscamos sino respuestas a hipótesis más complejas.

    -   ¿Es el coeficiente sobre la variable A igual al coeficiente para la variable B?

    -   ¿Puedo rechazar la hipótesis de que tres factores económicos al mismo tiempo no influyen en mi variable de interés?

    -   ¿Puedo excluir la posibilidad de que los sueldos dependen de variables discriminatorias (género, edad, origen)?

</div>

<div class="econ-lamina" markdown>

#### Hipótesis de igualdad de parámetros { data-lamina="Lámina 2" }

<!-- sem8/Clase9.tex · lámina 2 -->

-   Imaginamos que queremos testear: $H_0: \beta_1 = \beta_2$.

-   Planteamos el test:

    $H_0: \beta_1 - \beta_2 = 0$.

    $H_1: \beta_1 - \beta_2 \neq 0$

-   Dado que los $\hat{\beta}$ son distribuidos como normales, la diferencia también es una normal.

-   Se puede, entonces, construir un test $t$ con el $t$-estadístico:

    $$
    t_{\text{estadístico}} = \frac{\hat{\beta}_1 - \hat{\beta}_2 - 0}{\sqrt{\hat{Var}(\hat{\beta}_1 - \hat{\beta}_2)}}
    $$

-   Necesitamos: $\hat{Var}(\hat{\beta}_1 - \hat{\beta}_2)$.

-   Recuerden propiedades de la varianza. Sea $k,c$ constantes. Sean $A, B$ variables aleatorias:

    1.  $\text{Var}(kA) = k^2A$

    2.  $\text{Var}(kA + cB) = k^2\text{Var}(A) + c^2\text{Var}(B) + 2kc\text{COV}(A, B)$

</div>

<div class="econ-lamina" markdown>

#### Continuación { data-lamina="Lámina 3" }

<!-- sem8/Clase9.tex · lámina 3 -->

-   Entonces, en este caso, usando propiedades de la varianza ($k = 1$, $c = -1$):

    $$
    \hat{Var}(\hat{\beta}_1 - \hat{\beta}_2) = \textcolor{red}{\hat{Var}(\hat{\beta}_1) + \hat{Var}(\hat{\beta}_2)} - \textcolor{blue}{2\hat{\text{COV}}(\hat{\beta}_1, \hat{\beta}_2)}
    $$

-   Recuerden la matriz: $\hat{Var}(\hat{\beta})= (X^{\top}X)^{-1}\hat{\sigma}^2$.

    1.  **$\hat{Var}(\hat{\beta}_j) = \hat{\sigma}^2_{j}$ es el elemento $(j + 1), (j + 1)$ de esa matriz (diagonal principal).**

    2.  **$\hat{\text{COV}}(\hat{\beta}_j, \hat{\beta}_l) = \hat{\sigma}_{jl}$ es el elemento $(j + 1), (l + 1)$ de esa matriz.**

-   Regla de rechazo: una vez construido el $t$-estadístico, se rechaza la hipótesis nula si $t_{\text{estadístico}} > t_{\alpha/2,n-k-1}$, donde $\alpha$ es el nivel de significatividad requerido.

</div>

<div class="econ-widget" data-widget="cov-importa"></div>

<div class="econ-practica" id="practica-1">
<p class="econ-practica-t"><span>✍️ Practica · Tema 1</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Para testear H₀: β₁ = β₂, ¿qué varianza necesitas?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Var(β̂₁ − β̂₂) = Var(β̂₁) + Var(β̂₂) − 2·Cov(β̂₁, β̂₂).</button>
<button class="econ-quiz-opt" data-why="Falta la covarianza: β̂₁ y β̂₂ en general están correlacionados.">Var(β̂₁) + Var(β̂₂).</button>
<button class="econ-quiz-opt" data-why="Las varianzas se suman: Var(kA) = k²Var(A), con k = −1.">Var(β̂₁) − Var(β̂₂).</button>
</div>
<p class="econ-quiz-fb">✅ Láminas 2 y 3.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">¿De dónde sale Cov(β̂₁, β̂₂)?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Del elemento (2, 3) de la matriz σ̂²(XᵀX)⁻¹.</button>
<button class="econ-quiz-opt" data-why="Es una covarianza entre estimadores, no entre variables.">De la correlación entre y y x₁.</button>
<button class="econ-quiz-opt" data-why="El R² no da covarianzas entre coeficientes.">Del R² de la regresión.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 3: el elemento (j + 1), (l + 1), fuera de la diagonal.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · β₁ = β₂ en R</p>

Simula una regresión en que H₀ es verdadera, calcula el test con `vcov()` y compáralo con el truco de reparametrizar el modelo.

```r
set.seed(8)
n  <- 140
x1 <- rnorm(n)
x2 <- 0.6 * x1 + rnorm(n)
y  <- 1 + 1 * x1 + 1 * x2 + rnorm(n)      # β1 = β2: H0 es verdadera
m  <- lm(y ~ x1 + x2)

V      <- vcov(m)                          # σ̂²(XᵀX)⁻¹
se_dif <- sqrt(V["x1", "x1"] + V["x2", "x2"] - 2 * V["x1", "x2"])
t      <- (coef(m)["x1"] - coef(m)["x2"]) / se_dif
c(t = unname(t), valor_critico = qt(0.975, n - 3))

# Truco: con s = x1 + x2, el coeficiente de x1 en y ~ x1 + s es β1 − β2
s <- x1 + x2
coef(summary(lm(y ~ x1 + s)))["x1", ]      # mismo t que arriba
```

**🎯 Reto:** cambia `1 * x2` por `0.5 * x2` en la línea de `y` (ahora H₀ es falsa). ¿Se rechaza?
{: .econ-r-reto }

</div>

### Ejemplo: β₁ = β₂ { #tema-2 .econ-tema data-num="2" data-laminas="láminas 4–5" data-toc-label="Tema 2 · Ejemplo: β₁ = β₂" }

<p class="econ-tema-q">Con la matriz de varianzas y covarianzas en la mano, ¿cuánto vale el test?</p>

<div class="econ-lamina" markdown>

#### Ejemplo: Test $\beta_1 = \beta_2$ con $\alpha = 0.05$ { data-lamina="Láminas 4–5" data-toc-label="Ejemplo: Test β1 = β2 con α = 0.05" }

<!-- sem8/Clase9.tex · lámina 4 -->

$\mathbf{(X^{\top}X)^{-1}} =
        \begin{bmatrix}
            0.05987 & -0.00177 & -0.00035 \\
            -0.00177 & 0.00030 & -0.00002 \\
            -0.00035 & -0.00002 & 0.00001 \\
        \end{bmatrix}$; $\hat{\sigma}^2 = \frac{SSR}{n-k-1} = 141925$;

$\hat{\beta} =
        \begin{bmatrix}
            140 \\
            42 \\
            5 \\
        \end{bmatrix}$; $n=140$

Entonces: $\mathbf{(X^{\top}X)^{-1}\hat{\sigma}^2} =
        \begin{bmatrix}
            8497.04975 & -251.20725 & -49.67375 \\
            -251.20725 & \textcolor{red}{42.5775} & \textcolor{blue}{-2.8385} \\
            -49.67375 & \textcolor{blue}{-2.8385} & \textcolor{red}{1.41925} \\
        \end{bmatrix}$; $\hat{\text{COV}}(\hat{\beta}_1, \hat{\beta}_2) = \textcolor{blue}{-2.8385}$<br>
$\hat{Var}(\hat{\beta}_1)=\textcolor{red}{42.5775} \quad \hat{Var}(\hat{\beta}_2)=\textcolor{red}{1,41925}$

<!-- sem8/Clase9.tex · lámina 5 -->

Procedimiento:

-   Paso 1: Hipótesis: $H_0: \beta_1 - \beta_2 = 0$<br>
    $H_1: \beta_1 - \beta_2 \neq 0$.

-   Paso 2: Construir: $\hat{Var}(\hat{\beta}_1 - \hat{\beta}_2)$:

    -   $\sqrt{\hat{Var}(\hat{\beta}_1 - \hat{\beta}_2)} = \sqrt{42,58 + 1.42 - 2(-2.84)} = 7,05$

-   Paso 3: $t_e = \frac{42 - 5}{7,05} = 5.3$

-   Paso 4: Rechazo $H_0$ porque $5.3 > 1.98$ valor crítico de la t con 137 grados de libertad con un 5% de significancia.

</div>

<div class="econ-widget" data-widget="test-combinacion"></div>

<div class="econ-practica" id="practica-2">
<p class="econ-practica-t"><span>✍️ Practica · Tema 2</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Con Var(β̂₁) = 42.5775, Var(β̂₂) = 1.41925 y Cov = −2.8385, ¿cuánto vale Var(β̂₁ − β̂₂)?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>49.67</button>
<button class="econ-quiz-opt" data-why="Faltó restar 2·Cov; como Cov es negativa, se suma 5.68.">43.99</button>
<button class="econ-quiz-opt" data-why="Es −2·Cov, y Cov = −2.8385: el término suma.">38.32</button>
</div>
<p class="econ-quiz-fb">✅ 42.5775 + 1.41925 − 2·(−2.8385) = 49.67, y √49.67 = 7.05 (lámina 5).</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Con t = 5.3 y un valor crítico de 1.98, ¿qué concluyes?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Se rechaza que el efecto de x₁ sea igual al de x₂.</button>
<button class="econ-quiz-opt" data-why="5.3 &gt; 1.98.">No se rechaza.</button>
<button class="econ-quiz-opt" data-why="Este test compara dos coeficientes; no testea si β₁ = 0.">x₁ no es significativa.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 5, paso 4.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · El ejemplo de la lámina 5</p>

Con la matriz de la lámina 4, calcula el error estándar de β̂₁ − β̂₂ como aᵀVa y el estadístico t.

```r
# Lámina 4: σ̂²(XᵀX)⁻¹ y los coeficientes estimados
V <- matrix(c(8497.04975, -251.20725, -49.67375,
              -251.20725,   42.5775,   -2.8385,
               -49.67375,   -2.8385,    1.41925), 3, 3, byrow = TRUE)
b <- c(140, 42, 5)

a  <- c(0, 1, -1)                          # combinación: β1 − β2
se <- sqrt(drop(t(a) %*% V %*% a))         # Var(aᵀβ̂) = aᵀ V a
t  <- drop(a %*% b) / se
c(se = se, t = t, critico = qt(0.975, 137))   # lámina 5: 7.05, 5.3 y 1.98
```

**🎯 Reto:** cambia `a` por `c(0, 1, 0)`. ¿Qué test estás haciendo ahora?
{: .econ-r-reto }

</div>

### Ejercicio: β₁ = 2β₂ { #tema-3 .econ-tema data-num="3" data-laminas="láminas 6–7" data-toc-label="Tema 3 · Ejercicio: β₁ = 2β₂" }

<p class="econ-tema-q">¿Y si la hipótesis es que un efecto es el doble del otro?</p>

<div class="econ-lamina" markdown>

#### Ejercicio { data-lamina="Láminas 6–7" }

<!-- sem8/Clase9.tex · lámina 6 -->

Testee la $H_0$ de que el efecto de $x_1$ sobre $y$ es el doble que el efecto de $x_2$ sobre $y:\beta_1=2\beta_2$ frente a la alternativa que es diferente. Suponga $\alpha=5\%$.

-   $H_0: \beta_1 - 2\beta_2 = 0$

-   $H_1: \beta_1 - 2\beta_2 \neq 0$.

<!-- sem8/Clase9.tex · lámina 7 -->

-   Para construir el t-estadístico empírico: $t_e = \frac{\hat{\beta}_1 - 2\hat{\beta}_2}{\sqrt{\hat{\text{Var}}(\hat{\beta}_1 - 2\hat{\beta}_2)}}$ necesitamos calcular:

    -   $\hat{\text{Var}}(\hat{\beta}_1 - 2\hat{\beta}_2) = \hat{\text{Var}}(\hat{\beta}_1) + 4\hat{\text{Var}}(\hat{\beta}_2) - 4\hat{\text{COV}}(\hat{\beta}_1, \hat{\beta}_2)$

    -   Usando la matriz de antes reemplazamos para obtener:

        $$
        \begin{aligned}
        \hat{ \text{Var}}(\hat{\beta}_1 - 2\hat{\beta}_2) &= 42.5 + 4 \times 1.42 - 4(-2.84) \\
        &= 59.5 \\
        \Rightarrow \text{s.e}(\hat{\beta}_1 - 2\hat{\beta}_2) &= \sqrt{\hat{\text{Var}}(\hat{\beta}_1 - 2\hat{\beta}_2)} = 7.68
        
        \end{aligned}
        $$

-   Construimos el t-empírico: $t_e = \frac{42 - 10}{7.68} = 4.16$

-   Regla: Rechazo si $|t_e| > 1.98$ valor crítico de la t con 137 grados de libertad . Entonces, se rechaza $H_0$ con un 5% de significancia, rechazo la hipótesis de que $\beta_1 = 2\beta_2$.

</div>

<div class="econ-practica" id="practica-3">
<p class="econ-practica-t"><span>✍️ Practica · Tema 3</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Para H₀: β₁ = 2β₂, ¿qué varianza se necesita?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Var(β̂₁) + 4·Var(β̂₂) − 4·Cov(β̂₁, β̂₂)</button>
<button class="econ-quiz-opt" data-why="Var(kA) = k²Var(A): con k = −2, el factor es 4.">Var(β̂₁) + 2·Var(β̂₂) − 2·Cov(β̂₁, β̂₂)</button>
<button class="econ-quiz-opt" data-why="Las varianzas siempre se suman.">Var(β̂₁) − 4·Var(β̂₂)</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 7, con k = 1 y c = −2: 2kc = −4.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">En la lámina 7, t = (42 − 10)/7.68 = 4.16. ¿De dónde sale el 10?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>De 2·β̂₂ = 2·5.</button>
<button class="econ-quiz-opt" data-why="H₀ dice β₁ − 2β₂ = 0: el valor de H₀ es 0.">Es el valor de H₀.</button>
<button class="econ-quiz-opt" data-why="El error estándar es 7.68.">Es el error estándar.</button>
</div>
<p class="econ-quiz-fb">✅ El numerador es β̂₁ − 2β̂₂ − 0.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · β₁ = 2β₂ con matrices</p>

Repite el ejercicio de la lámina 7 con el vector a = (0, 1, −2). La lámina redondea Var(β̂₁) a 42.5; con 42.5775 los números cambian un poco.

```r
V <- matrix(c(8497.04975, -251.20725, -49.67375,
              -251.20725,   42.5775,   -2.8385,
               -49.67375,   -2.8385,    1.41925), 3, 3, byrow = TRUE)
b <- c(140, 42, 5)

a  <- c(0, 1, -2)                          # H0: β1 − 2β2 = 0 (lámina 6)
v  <- drop(t(a) %*% V %*% a)               # 42.58 + 4·1.42 − 4·(−2.84)
c(var = v, se = sqrt(v), t = drop(a %*% b) / sqrt(v))
abs(drop(a %*% b) / sqrt(v)) > qt(0.975, 137)  # ¿se rechaza?
```

**🎯 Reto:** testea H₀: β₁ = 8β₂. ¿Se rechaza?
{: .econ-r-reto }

</div>

---

!!! abstract "🧠 Ideas clave"
    - Hipótesis como $\beta_1 = \beta_2$ se reescriben como **combinaciones lineales**: $H_0: \beta_1 - \beta_2 = 0$.
    - $\text{Var}(k\hat{\beta}_1 + c\hat{\beta}_2) = k^2\text{Var}(\hat{\beta}_1) + c^2\text{Var}(\hat{\beta}_2) + 2kc\,\text{Cov}(\hat{\beta}_1, \hat{\beta}_2)$, con todo tomado de $\hat{\sigma}^2(X^\top X)^{-1}$.
    - **No hay que olvidar la covarianza**: si las $x$ están correlacionadas, los estimadores también lo están.
    - El estadístico es un $t$ con $n - k - 1$ grados de libertad, igual que en la Clase 7.

## ✅ Autoevaluación

<div class="econ-quiz">
<p class="econ-quiz-q">Var(β̂₁) = 4, Var(β̂₂) = 9 y Cov(β̂₁, β̂₂) = 3. ¿Cuál es el error estándar de β̂₁ − β̂₂?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>√7 ≈ 2.65</button>
<button class="econ-quiz-opt" data-why="Faltó restar 2·Cov = 6.">√13 ≈ 3.61</button>
<button class="econ-quiz-opt" data-why="La covarianza se resta en una diferencia: −2·Cov.">√19 ≈ 4.36</button>
</div>
<p class="econ-quiz-fb">✅ 4 + 9 − 2·3 = 7.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">¿Qué hipótesis corresponde a “el efecto de un año de educación es el triple que el de un año de experiencia”?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>H₀: β_educ − 3·β_exper = 0</button>
<button class="econ-quiz-opt" data-why="Eso diría que el efecto de la experiencia es el triple.">H₀: 3·β_educ − β_exper = 0</button>
<button class="econ-quiz-opt" data-why="Eso son dos restricciones distintas, no una combinación.">H₀: β_educ = β_exper = 0</button>
</div>
<p class="econ-quiz-fb">✅ β_educ = 3·β_exper.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">En el simulador, si x₁ y x₂ están muy correlacionadas positivamente y ignoras la covarianza, el error estándar de β̂₁ − β̂₂ queda…</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>…demasiado chico, porque Cov(β̂₁, β̂₂) es negativa y debería sumar.</button>
<button class="econ-quiz-opt" data-why="Con x positivamente correlacionadas, los estimadores se correlacionan negativamente.">…demasiado grande.</button>
<button class="econ-quiz-opt" data-why="Solo si la covarianza es cero.">…correcto.</button>
</div>
<p class="econ-quiz-fb">✅ Por eso la lámina 3 insiste en el término 2·Cov.</p>
</div>

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 4, sección 4.4 (tests sobre una combinación lineal de parámetros).
- 🛠️ Esta semana es el **Taller 2**: repasa los tests t sobre uno y varios parámetros con las calculadoras de las Clases 7 y 8.
- Próxima clase: **Propiedades asintóticas**.
