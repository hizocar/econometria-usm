<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->

# Clase 4 · Regresión lineal múltiple

<div class="usm-session-meta">
<span>📅 Viernes 6 de noviembre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Semana 4 · Contenido 5 · Análisis de regresión múltiple</span>
<span class="usm-tag-red">🛠️ Semana del Taller 1</span>
</div>

!!! info "Contenido oficial de la semana"
    Esta página reproduce **íntegros y en orden** los materiales de la semana 4 (`sem4/`).
    **Cátedra del viernes:** Parte 1 (`Clase5.tex`, 25 láminas). **Ayudantía/taller:** Parte 2
    (`calculo_matrices.tex`, ejercicio de la inversa de $X^\top X$). Los bloques **Interactivo**, los casos
    y las preguntas de autoevaluación son material adicional para estudiar.

## 🎯 Objetivos de la sesión

**Cátedra (viernes)**

- Pasar del modelo simple al **modelo de regresión lineal múltiple** e interpretar cada $\beta_j$ *ceteris paribus*.
- Plantear la estimación por MCO con $k$ variables y escribir el modelo en **notación matricial**, $y = X\beta + u$.
- Derivar $\hat{\beta} = (X^\top X)^{-1} X^\top y$ y reconocer sus propiedades algebraicas.
- Distinguir entre $R^2$ y $R^2$ ajustado, y leer la salida de una regresión en R.

**Ayudantía**

- Calcular a mano $(X^\top X)^{-1}$ por cofactores y obtener $\hat{\beta}$ con los datos del ejemplo.

## 🗓️ Agenda de la cátedra (viernes 18:40 – 21:25)

| Hora | Bloque | Láminas |
|---|---|---|
| 18:40 – 19:05 | Del modelo simple al múltiple: motivación e interpretación *ceteris paribus* | 1 – 3 |
| 19:05 – 19:25 | Estimación por MCO con $k$ variables: residuos y condiciones de primer orden | 4 – 5 |
| 19:25 – 19:55 | Notación matricial: $y = X\beta + u$ | 6 – 9 |
| 19:55 – 20:05 | *Receso* | |
| 20:05 – 20:35 | Derivación de $\hat{\beta} = (X^\top X)^{-1}X^\top y$ y propiedades algebraicas | 10 – 12 |
| 20:35 – 20:55 | $R^2$ y $R^2$ ajustado | 13 – 14 |
| 20:55 – 21:20 | Ejemplo numérico paso a paso y salida en R | 15 – 25 |
| 21:20 – 21:25 | Autoevaluación y cierre | |

La **Parte 2** (ejercicio de cálculo matricial) se trabaja en la **ayudantía/taller** de la semana.

## Regresión lineal múltiple: estimación { .econ-parte data-eyebrow="Parte 1 · Cátedra" data-toc-label="Parte 1 · Regresión lineal múltiple: estimación" }

<p class="econ-source">📄 Diapositivas: <code>sem4/Clase5.tex</code> · 25 láminas</p>

<div class="econ-lamina" markdown>

### Modelo de Regresión Múltiple: Introducción { data-lamina="Lámina 1" }

<!-- sem4/Clase5.tex · lámina 1 -->

-   En las clases anteriores, vimos el modelo de regresión lineal simple:

    $$
    y = \beta_0 + \beta_1x + u
    $$

-   Sin embargo, el supuesto de que $E[u|x] = 0$ en dicho modelo es muy fuerte, ya que todas las variables no incluidas van al error.

-   Además, si nos interesa la predicción, es muy difícil predecir la variable $y$ en base a una sola variable.

-   El modelo de regresión lineal múltiple (RLM) permite esto.

</div>

<div class="econ-lamina" markdown>

### Modelo de Regresión Lineal Múltiple { data-lamina="Lámina 2" }

<!-- sem4/Clase5.tex · lámina 2 -->

-   A nivel poblacional, el modelo RLM se define como:

    $$
    y = \beta_0 + \beta_1x_1 + \beta_2x_2 + \ldots + \beta_kx_k + u
    $$

-   Asumamos que $E[u|x_1, x_2, \ldots, x_k] = 0$.

-   Interpretación de los parámetros $\beta$:

-   Por ejemplo, si todas las variables excepto $x_1$ permanecen constantes:

    $$
    \Delta E[y|x_1, x_2, \ldots, x_k] = \beta_1 \Delta x_1
    $$

    $\Rightarrow$ $\beta_1 = \frac{\Delta E[y|x_1, x_2, \ldots, x_k]}{\Delta x_1}$

-   Interpretación: Cuando $x_1$ cambia en una unidad, el valor esperado de $y$ cambia en $\beta_1$ unidades, **manteniendo todas las demás variables incluidas constantes**.<br>
    Es como una derivada parcial!

</div>

<div class="econ-widget" data-widget="plano"></div>

<div class="econ-lamina" markdown>

### Modelo de Regresión Múltiple: Estimación MCO { data-lamina="Lámina 3" }

<!-- sem4/Clase5.tex · lámina 3 -->

-   Al agregar más variables al modelo para poder estudiar el efecto de $x$, ceteris paribus estas otras variables.

-   Por ejemplo, al estudiar el efecto de educación en salario, queremos dejar la inteligencia constante (IQ).

-   Al incluir esta variable en la regresión, podemos ver cuánto afecta un año más de educación en salario, dejando constante IQ.

-   De hecho, si agregamos la variable IQ, el coeficiente de educación que obtenemos se hace más pequeño.

*MCO Simple:* $\hat{salario} = 0.09 + 0.54 \cdot educacion$<br>

*MCO Múltiple:* $\hat{salario} = 0.065 + 0.37 \cdot educacion + 0.20 \cdot IQ$

-   Ahora vamos a ver cómo estimar los $\hat{\beta}$ del modelo de regresión múltiple.

</div>

<div class="econ-widget" data-widget="iq-control"></div>

<div class="econ-lamina" markdown>

### Modelo de Regresión Lineal Múltiple: Estimación { data-lamina="Lámina 4" }

<!-- sem4/Clase5.tex · lámina 4 -->

Dada una muestra de $n$ individuos, tenemos la siguiente ecuación:

$$
y_i = \hat{\beta_0} + \hat{\beta_1}x_{i1} + \hat{\beta_2}x_{i2} + \ldots + \hat{\beta_k}x_{ik} + \hat{u_i}, \quad \forall i = 1, \ldots, n
$$

Igual que en el modelo RLS, los **residuos** vienen dados por:

$$
\hat{u}_i = y_i - \hat{y}_i
$$

$$
\hat{u_i}= y_i - (\hat{\beta}_0 + \hat{\beta}_1x_{i1} + \hat{\beta}_2x_{i2} + \ldots + \hat{\beta}_kx_{ik})
$$

</div>

<div class="econ-lamina" markdown>

### MCO para el Modelo Lineal Múltiple { data-lamina="Lámina 5" }

<!-- sem4/Clase5.tex · lámina 5 -->

$$
\min_{\hat{\beta}_0, \hat{\beta}_1, \ldots, \hat{\beta}_k} \sum_i \hat{u}_i^2
$$

Es decir,

$$
\min_{\hat{\beta}_0, \hat{\beta}_1, \ldots, \hat{\beta}_k} \sum_i \left( y_i - \hat{\beta}_0 - \hat{\beta}_1x_{i1} - \hat{\beta}_2x_{i2} - \ldots - \hat{\beta}_kx_{ik} \right)^2
$$

**CPO:**

$$
\hat{\beta}_0: \sum_i \left( y_i - \hat{\beta}_0 - \hat{\beta}_1x_{i1} - \hat{\beta}_2x_{i2} - \ldots - \hat{\beta}_kx_{ik} \right) = 0
$$

$$
\hat{\beta}_1: \sum_i x_{i1} \left( y_i - \hat{\beta}_0 - \hat{\beta}_1x_{i1} - \hat{\beta}_2x_{i2} - \ldots - \hat{\beta}_kx_{ik} \right) = 0
$$

...

$$
\hat{\beta}_k:
\sum_i x_{ik} \left( y_i - \hat{\beta}_0 - \hat{\beta}_1x_{i1} - \hat{\beta}_2x_{i2} - \ldots - \hat{\beta}_kx_{ik} \right) = 0
$$

Existen $k + 1$ condiciones de primer orden para $k + 1$ incógnitas.

</div>

<div class="econ-lamina" markdown>

### Notación matricial modelo poblacional { data-lamina="Lámina 6" }

<!-- sem4/Clase5.tex · lámina 6 -->

-   El modelo de regresión lineal múltiple cada individuo $i$ es:

    $$
    y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + \dots + \beta_k x_{ik} + u_i \quad \forall i = 1, \dots, n
    $$

-   Matricialmente, lo podemos expresar:

    $$
    y_i = \mathbf{x}_i^\top \mathbf{\beta} + u_i \quad \forall i = 1, \dots, n
    $$

    con

    $$
    \mathbf{x}_i = \begin{pmatrix}
    1 \\
    x_{i1} \\
    \vdots \\
    x_{ik}
    \end{pmatrix}, \quad
    \mathbf{\beta} = \begin{pmatrix}
    \beta_0 \\
    \beta_1 \\
    \vdots \\
    \beta_k
    \end{pmatrix}
    $$

-   Noten que son $n$ ecuaciones (una para cada individuo).

</div>

<div class="econ-lamina" markdown>

### Notación { data-lamina="Lámina 7" }

<!-- sem4/Clase5.tex · lámina 7 -->

-   $$
    y = X\beta + u
    $$

    con

    $$
    y = \begin{pmatrix}
    y_1 \\
    \vdots \\
    y_n
    \end{pmatrix}, \quad
    X = \begin{pmatrix}
    \mathbf{x}_1^\top \\
    \vdots \\
    \mathbf{x}_n^\top
    \end{pmatrix} = \begin{pmatrix}
    1 & x_{11} & \dots & x_{1k} \\
    \vdots & \vdots & \ddots & \vdots \\
    1 & x_{n1} & \dots & x_{nk}
    \end{pmatrix}, \quad
    u = \begin{pmatrix}
    u_1 \\
    \vdots \\
    u_n
    \end{pmatrix}
    $$

    donde $u$ y $y$ son vectores de $n \times 1$ y $X$ es una matriz de $n \times (k + 1)$.

</div>

<div class="econ-lamina" markdown>

### Ejemplo: $n=5$, dos variables: $x_1$, $x_2$ { data-lamina="Lámina 8" data-toc-label="Ejemplo: n=5, dos variables: x1, x2" }

<!-- sem4/Clase5.tex · lámina 8 -->

$$
\begin{bmatrix}
y_1 \\
y_2 \\
\hdots \\
y_5
\end{bmatrix}
=
\beta_0
\begin{bmatrix}
1 \\
1 \\
\hdots \\
1
\end{bmatrix}
+
\beta_1
\begin{bmatrix}
x_{11} \\
x_{12}\\
\hdots\\
x_{15}\\
\end{bmatrix}
+
\beta_2
\begin{bmatrix}
x_{21} \\
x_{22} \\
\hdots \\
x_{25}
\end{bmatrix}
+
\begin{bmatrix}
u_1 \\
u_2 \\
\hdots \\
u_5
\end{bmatrix}
$$

Re-escribiendo:

$$
\begin{bmatrix}
y_1 \\
y_2 \\
\hdots \\
y_5
\end{bmatrix}
=
\begin{bmatrix}
1 & x_{11} & x_{12} \\
1 & x_{12} & x_{22} \\
\hdots & \hdots & \hdots \\
1 & x_{15} & x_{25}
\end{bmatrix}
\begin{bmatrix}
\beta_0 \\
\beta_1 \\
\beta_2
\end{bmatrix}
+
\begin{bmatrix}
u_1 \\
u_2 \\
\hdots \\
u_5
\end{bmatrix}
$$

$$
y = X\beta + u
$$

</div>

<div class="econ-widget" data-widget="matriz-x"></div>

<div class="econ-lamina" markdown>

### Mínimos Cuadrados Ordinarios (MRL Múltiple) { data-lamina="Lámina 9" }

<!-- sem4/Clase5.tex · lámina 9 -->

-   Como antes, podemos definir:

    -   $\hat{\beta}$: estimadores de los $\beta$ dimensión, $(k+1) \times 1$

    -   $\hat{y} = X \hat{\beta}$: Valores predichos de $y$, dimensión $n \times 1$

    -   Por lo tanto, los residuos en forma matricial:

        $$
        \hat{u} = y - \hat{y} = y - X \hat{\beta}
        $$

</div>

<div class="econ-lamina" markdown>

### Recordar { data-lamina="Lámina 10" }

<!-- sem4/Clase5.tex · lámina 10 -->

-   **Derivadas**

    Si $a$ y $\beta$ son vectores y $A$ una matriz simétrica, entonces:

    1.  $\frac{da^\top \beta}{d\beta} = a$

    2.  $\frac{d\beta^\top A\beta}{d\beta} = 2A\beta$

-   **Propiedades de la traspuesta**

    Sean $D$ y $E$ matrices: $(DE)^\top = E^\top D^\top$

-   **Potencias**

    $\sum_{i} (s_i)^2 = s^\top s$

</div>

<div class="econ-lamina" markdown>

### Mínimos Cuadrados Ordinarios (MRL Múltiple) { data-lamina="Lámina 11" }

<!-- sem4/Clase5.tex · lámina 11 -->

$$
\min \sum_{i=1}^{n} \hat{u}_i^2 \quad \Rightarrow \quad \min_{\hat{\beta}} \hat{u}^\top \hat{u}
$$

-   La suma de los residuos al cuadrado es:

    $$
    \hat{u}^\top \hat{u} = (y - X \hat{\beta})^\top (y - X \hat{\beta})
    $$

    $$
    = y^\top y - \hat{\beta}^\top X^\top y - y^\top X \hat{\beta} + \hat{\beta}^\top X^\top X \hat{\beta}
    $$

    $$
    = y^\top y - 2 y^\top X \hat{\beta} + \hat{\beta}^\top X^\top X \hat{\beta}
    $$

-   Entonces, condiciones de primer orden:

    $$
    \frac{\partial \hat{u}^\top \hat{u}}{\partial \hat{\beta}} = 0 \quad \Rightarrow \quad -2X^\top y + 2X^\top X \hat{\beta} = 0 \quad \Rightarrow \quad \hat{\beta} = (X^\top X)^{-1} X^\top y
    $$

-   Note que precisamos suponer que $X$ tiene rango $(k+1)$ completo $\Rightarrow X^\top X$ es invertible.

-   Las $k + 1$ ecuaciones $X^\top y = X^\top X \hat{\beta}$ son llamadas ecuaciones normales para MCO.

-   Condición de segundo grado: $\frac{d^2 \hat{u}^\top \hat{u}}{d \hat{\beta} d \hat{\beta}} = 2X^\top X$ positiva definida.

</div>

<div class="econ-lamina" markdown>

### Propiedades algebraicas { data-lamina="Lámina 12" }

<!-- sem4/Clase5.tex · lámina 12 -->

-   Al igual que el caso de regresión simple, las propiedades algebraicas se derivan de las CPO.

-   Propiedades 1 y 2: $X^\top \hat{u} = 0$:

    $$
    \sum_{i} \hat{u}_i = 0 \quad (\text{propiedad 1})
    $$

    $$
    \sum_{i} x_{i1} \hat{u}_i = 0 \quad (\text{propiedad 2})
    $$

    $$
    \sum_{i} x_{i2} \hat{u}_i = 0 \quad (\text{propiedad 2})
    $$

    $$
    \dots
    $$

    $$
    \sum_{i} x_{ik} \hat{u}_i = 0 \quad (\text{propiedad 2})
    $$

-   Propiedad 3: La media de la variable observada $y$ es igual a la media de la variable predicha $\hat{y}$:

    $$
    \bar{y} = \bar{\hat{y}}
    $$

-   Propiedad 4: El punto $(\bar{x}_1, \bar{x}_2, \dots, \bar{x}_k, \bar{y})$ pasa por la curva de regresión.

</div>

<div class="econ-lamina" markdown>

### Bondad de Ajuste: $R^2$ { data-lamina="Lámina 13" data-toc-label="Bondad de Ajuste: R²" }

<!-- sem4/Clase5.tex · lámina 13 -->

El $R^2$ nos dice que la proporción de la varianza muestral de $y$ es explicada por nuestra regresión MCO. Recordando las definiciones:

-   Suma de cuadrados explicada: $SSE = \sum_{i=1}^{n} (\hat{y}_i - \bar{y})^2$

-   Suma de cuadrados residual: $SSR = \sum_{i=1}^{n} \hat{u}_i^2$

-   Suma de cuadrados total: $SST = \sum_{i=1}^{n} (y_i - \bar{y})^2$

La fórmula para el $R^2$ es igual que en el caso de la regresión simple:

$$
R^2 = \frac{SSE}{SST} = 1 - \frac{SSR}{SST}
$$

</div>

<div class="econ-lamina" markdown>

### Bondad de Ajuste: $R^2$ ajustado { data-lamina="Lámina 14" data-toc-label="Bondad de Ajuste: R² ajustado" }

<!-- sem4/Clase5.tex · lámina 14 -->

-   $R^2$ crece (o queda igual) a medida que se agregan más variables al modelo. Esto ocurre incluso si la variable agregada no es relevante en el modelo poblacional.

-   Necesitamos una medida que penalice agregar variables irrelevantes.

-   Se define el $R^2$ ajustado como:

    $$
    \overline{R^2} = 1 - \frac{n - 1}{n - k - 1} \frac{SSR}{SST}
    $$

</div>

<div class="econ-widget" data-widget="r2-trampa"></div>

<div class="econ-lamina" markdown>

### Ejemplo: obtener $\hat{\beta} = (X^\top X)^{-1}X^\top y$ { data-lamina="Láminas 15–22" data-toc-label="Ejemplo: obtener hatβ = (X^top X)^-1X^top y" }

<p class="econ-lamina-cont">Lámina progresiva · recórrela paso a paso, como en la presentación</p>

=== "Paso 1"

    <!-- sem4/Clase5.tex · lámina 15 -->

    Modelo: $y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + u_i$, $n=5$.

    Base de datos:

    | Individuos | unos | $x_1$ (experiencia) | $x_2$ (educación) | $y$ (salario) |
    |:----------:|:----:|:-------------------:|:-----------------:|:-------------:|
    |    Juan    |  1   |         12          |        93         |      769      |
    |   Pedro    |  1   |         18          |        119        |      808      |
    |   Sofia    |  1   |         14          |        108        |      825      |
    |    Caro    |  1   |         12          |        96         |      650      |
    |    Alex    |  1   |         11          |        74         |      562      |

=== "Paso 2"

    <!-- sem4/Clase5.tex · lámina 16 -->

    Modelo: $y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + u_i$, $n=5$.

    Base de datos:

    | Individuos | unos | $x_1$ (experiencia) | $x_2$ (educación) | $y$ (salario) |
    |:----------:|:----:|:-------------------:|:-----------------:|:-------------:|
    |    Juan    |  1   |         12          |        93         |      769      |
    |   Pedro    |  1   |         18          |        119        |      808      |
    |   Sofia    |  1   |         14          |        108        |      825      |
    |    Caro    |  1   |         12          |        96         |      650      |
    |    Alex    |  1   |         11          |        74         |      562      |

    $$
    X = \begin{bmatrix}
    1 & 12 & 93 \\
    1 & 18 & 119 \\
    1 & 14 & 108 \\
    1 & 12 & 96 \\
    1 & 11 & 74 \\
    \end{bmatrix} \quad
    X^\top = \begin{bmatrix}
    1 & 1 & 1 & 1 & 1 \\
    12 & 18 & 14 & 12 & 11 \\
    93 & 119 & 108 & 96 & 74 \\
    \end{bmatrix}
    $$

    $$
    X^\top X = \begin{bmatrix}
    5 & 67 & 490 \\
    67 & 929 & 6736 \\
    490 & 6736 & 49166 \\
    \end{bmatrix}
    $$

=== "Paso 3"

    <!-- sem4/Clase5.tex · lámina 17 -->

    Modelo: $y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + u_i$, $n=5$.

    Base de datos:

    | Individuos | unos | $x_1$ (experiencia) | $x_2$ (educación) | $y$ (salario) |
    |:----------:|:----:|:-------------------:|:-----------------:|:-------------:|
    |    Juan    |  1   |         12          |        93         |      769      |
    |   Pedro    |  1   |         18          |        119        |      808      |
    |   Sofia    |  1   |         14          |        108        |      825      |
    |    Caro    |  1   |         12          |        96         |      650      |
    |    Alex    |  1   |         11          |        74         |      562      |

    $$
    X = \begin{bmatrix}
    1 & 12 & 93 \\
    1 & 18 & 119 \\
    1 & 14 & 108 \\
    1 & 12 & 96 \\
    1 & 11 & 74 \\
    \end{bmatrix} \quad
    X^\top = \begin{bmatrix}
    1 & 1 & 1 & 1 & 1 \\
    12 & 18 & 14 & 12 & 11 \\
    93 & 119 & 108 & 96 & 74 \\
    \end{bmatrix}
    $$

    $$
    X^\top X = \begin{bmatrix}
    5 & 67 & 490 \\
    67 & 929 & 6736 \\
    490 & 6736 & 49166 \\
    \end{bmatrix}
    \quad  (X^\top X)^{-1} =
    \begin{bmatrix}
    8.80 & 0.19 & -0.11 \\
    0.19 & 0.17 & -0.02 \\
    -0.11 & -0.02 & 0.00 \\
    \end{bmatrix}
    $$

=== "Paso 4"

    <!-- sem4/Clase5.tex · lámina 18 -->

    $$
    X^\top y =
    \begin{bmatrix}
    1 & 1 & 1 & 1 & 1 \\
    12 & 18 & 14 & 12 & 11 \\
    93 & 119 & 108 & 96 & 74 \\
    \end{bmatrix}
    \times
    \begin{bmatrix}
    769 \\
    808 \\
    825 \\
    650 \\
    562 \\
    \end{bmatrix}
    = \begin{bmatrix}
    3614 \\
    49304 \\
    360757 \\
    \end{bmatrix}
    $$

=== "Paso 5"

    <!-- sem4/Clase5.tex · lámina 19 -->

    $$
    X^\top y =
    \begin{bmatrix}
    1 & 1 & 1 & 1 & 1 \\
    12 & 18 & 14 & 12 & 11 \\
    93 & 119 & 108 & 96 & 74 \\
    \end{bmatrix}
    \times
    \begin{bmatrix}
    769 \\
    808 \\
    825 \\
    650 \\
    562 \\
    \end{bmatrix}
    = \begin{bmatrix}
    3614 \\
    49304 \\
    360757 \\
    \end{bmatrix} =
    $$

=== "Paso 6"

    <!-- sem4/Clase5.tex · lámina 20 -->

    Entonces tenemos: $(X^{\top}X)^{-1} = 
    \begin{bmatrix}
    8.80 & 0.19 & -0.11 \\
    0.19 & 0.17 & -0.02 \\
    -0.11 & -0.02 & 0.00 \\
    \end{bmatrix}$

    $X^{\top}y = 
    \begin{bmatrix}
    3614 \\
    49304 \\
    360757 \\
    \end{bmatrix}$

=== "Paso 7"

    <!-- sem4/Clase5.tex · lámina 21 -->

    Entonces tenemos: $(X^{\top}X)^{-1} = 
    \begin{bmatrix}
    8.80 & 0.19 & -0.11 \\
    0.19 & 0.17 & -0.02 \\
    -0.11 & -0.02 & 0.00 \\
    \end{bmatrix}$

    $X^{\top}y = 
    \begin{bmatrix}
    3614 \\
    49304 \\
    360757 \\
    \end{bmatrix}$

    Multiplicando obtenemos los estimadores: $\hat{\beta} = (X^{\top}X)^{-1}X^{\top}y=
    \begin{bmatrix}
    \hat{\beta}_0 \\
    \hat{\beta}_1 \\
    \hat{\beta}_2 \\
    \end{bmatrix}=
    \begin{bmatrix}
    140.59 \\
    -16.79 \\
    8.24 \\
    \end{bmatrix}$<br>

=== "Paso 8"

    <!-- sem4/Clase5.tex · lámina 22 -->

    Entonces tenemos: $(X^{\top}X)^{-1} = 
    \begin{bmatrix}
    8.80 & 0.19 & -0.11 \\
    0.19 & 0.17 & -0.02 \\
    -0.11 & -0.02 & 0.00 \\
    \end{bmatrix}$

    $X^{\top}y = 
    \begin{bmatrix}
    3614 \\
    49304 \\
    360757 \\
    \end{bmatrix}$

    Multiplicando obtenemos los estimadores: $\hat{\beta} = (X^{\top}X)^{-1}X^{\top}y=
    \begin{bmatrix}
    \hat{\beta}_0 \\
    \hat{\beta}_1 \\
    \hat{\beta}_2 \\
    \end{bmatrix}=
    \begin{bmatrix}
    140.59 \\
    -16.79 \\
    8.24 \\
    \end{bmatrix}$<br>
    Si quisieramos la matrix de prediccion de y, simplemente calculamos:

    $$
    \hat{y}=X\hat{\beta}
    $$

</div>

<div class="econ-widget" data-widget="calc-matricial"></div>

<div class="econ-lamina" markdown>

### En general { data-lamina="Lámina 23" }

<!-- sem4/Clase5.tex · lámina 23 -->

$$
X^T X =
\begin{pmatrix}
n & \sum_{i=1}^{n} x_{i1} & \sum_{i=1}^{n} x_{i2} & \cdots & \sum_{i=1}^{n} x_{ik} \\
\sum_{i=1}^{n} x_{i1} & \sum_{i=1}^{n} x_{i1}^2 & \sum_{i=1}^{n} x_{i1}x_{i2} & \cdots & \sum_{i=1}^{n} x_{i1}x_{ik} \\
\sum_{i=1}^{n} x_{i2} & \sum_{i=1}^{n} x_{i1}x_{i2} & \sum_{i=1}^{n} x_{i2}^2 & \cdots & \sum_{i=1}^{n} x_{i2}x_{ik} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
\sum_{i=1}^{n} x_{ik} & \sum_{i=1}^{n} x_{i1}x_{ik} & \sum_{i=1}^{n} x_{i2}x_{ik} & \cdots & \sum_{i=1}^{n} x_{ik}^2
\end{pmatrix}
$$

$$
X^Ty=\begin{pmatrix}
\sum_{i=1}^n y_i \\
\sum_{i=1}^n x_{i1}y_i \\
\vdots\\
\sum_{i=1}^n x_{ik}y_i \\
\end{pmatrix}
$$

</div>

<div class="econ-lamina" markdown>

### En R { data-lamina="Lámina 24" }

<!-- sem4/Clase5.tex · lámina 24 -->

![En R](../images/slides/sem5_images_datos_r.png){ .econ-slide-img }

</div>

<div class="econ-lamina" markdown>

### Regresión { data-lamina="Lámina 25" }

<!-- sem4/Clase5.tex · lámina 25 -->

![Regresión](../images/slides/sem5_images_tabla_reg.png){ .econ-slide-img }

</div>

<div class="econ-widget" data-widget="salida-r"></div>

## Ejercicio: la inversa de XᵀX por cofactores { .econ-parte .is-ayudantia data-eyebrow="Parte 2 · Ayudantía" data-toc-label="Parte 2 · Ayudantía · Ejercicio: la inversa de XᵀX por cofactores" }

<p class="econ-source">📄 Documento: <code>sem4/calculo_matrices.tex</code> · 7 secciones</p>

!!! note "Material de ayudantía/taller"
    Este ejercicio no se ve en la cátedra del viernes: se trabaja en la **ayudantía/taller** de la semana. Mantiene el formato numérico del documento original (punto para los miles, coma decimal).

<div class="econ-lamina is-ayudantia" markdown>

### Modelo y datos { data-lamina="Lámina 1" }

<!-- sem4/calculo_matrices.tex · lámina 1 -->

Modelo de regresión lineal múltiple con $n=5$ individuos:

$$
y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + u_i, \qquad i=1,\dots,5,
$$

donde $x_{1}=$ experiencia (años) y $x_{2}=$ educación (años).

| Individuo | *unos* | $x_1$ (experiencia) | $x_2$ (educación) | $y$ (salario) |
|:----------|:------:|:-------------------:|:-----------------:|:-------------:|
| Juan      |   1    |         12          |        93         |      769      |
| Pedro     |   1    |         18          |        119        |      808      |
| Sofía     |   1    |         14          |        108        |      825      |
| Caro      |   1    |         12          |        96         |      650      |
| Alex      |   1    |         11          |        74         |      562      |

Matrices del modelo:

$$
X=\begin{bmatrix}
1 & 12 & 93\\
1 & 18 & 119\\
1 & 14 & 108\\
1 & 12 & 96\\
1 & 11 & 74
\end{bmatrix},
\qquad
X^\top=\begin{bmatrix}
1 & 1 & 1 & 1 & 1\\
12 & 18 & 14 & 12 & 11\\
93 & 119 & 108 & 96 & 74
\end{bmatrix}.
$$

Multiplicando $X^\top X$ (cada entrada es la suma de productos correspondiente: $n$, $\sum x_1$, $\sum x_2$, $\sum x_1^2$, $\sum x_1 x_2$, $\sum x_2^2$):

$$
A \;=\; X^\top X \;=\;
\begin{bmatrix}
5 & 67 & 490\\
67 & 929 & 6.736\\
490 & 6.736 & 49.166
\end{bmatrix}.
$$

El objetivo de este documento es obtener $A^{-1}=(X^\top X)^{-1}$ **paso a paso, usando el método de cofactores**:

$$
A^{-1} = \frac{1}{\det(A)}\,\operatorname{adj}(A),
\qquad
\operatorname{adj}(A) = C^\top,
$$

donde $C$ es la matriz de cofactores de $A$.

</div>

<div class="econ-lamina is-ayudantia" markdown>

### Paso 1: Matriz de menores { data-lamina="Lámina 2" }

<!-- sem4/calculo_matrices.tex · lámina 2 -->

El menor $M_{ij}$ es el determinante de la submatriz $2\times 2$ que resulta de eliminar la fila $i$ y la columna $j$ de $A$.

$$
M_{11}=\begin{vmatrix}929 & 6.736\\ 6.736 & 49.166\end{vmatrix}
= 929\times 49.166 - 6.736\times 6.736
= 45.675.214-45.373.696=301.518
$$

$$
M_{12}=\begin{vmatrix}67 & 6.736\\ 490 & 49.166\end{vmatrix}
= 67\times 49.166 - 6.736\times 490
= 3.294.122-3.300.640=-6.518
$$

$$
M_{13}=\begin{vmatrix}67 & 929\\ 490 & 6.736\end{vmatrix}
= 67\times 6.736 - 929\times 490
= 451.312-455.210=-3.898
$$

$$
M_{21}=\begin{vmatrix}67 & 490\\ 6.736 & 49.166\end{vmatrix}
= 67\times 49.166 - 490\times 6.736
= 3.294.122-3.300.640=-6.518
$$

$$
M_{22}=\begin{vmatrix}5 & 490\\ 490 & 49.166\end{vmatrix}
= 5\times 49.166 - 490\times 490
= 245.830-240.100=5.730
$$

$$
M_{23}=\begin{vmatrix}5 & 67\\ 490 & 6.736\end{vmatrix}
= 5\times 6.736 - 67\times 490
= 33.680-32.830=850
$$

$$
M_{31}=\begin{vmatrix}67 & 490\\ 929 & 6.736\end{vmatrix}
= 67\times 6.736 - 490\times 929
= 451.312-455.210=-3.898
$$

$$
M_{32}=\begin{vmatrix}5 & 490\\ 67 & 6.736\end{vmatrix}
= 5\times 6.736 - 490\times 67
= 33.680-32.830=850
$$

$$
M_{33}=\begin{vmatrix}5 & 67\\ 67 & 929\end{vmatrix}
= 5\times 929 - 67\times 67
= 4.645-4.489=156
$$

Por lo tanto, la matriz de menores es:

$$
M=\begin{bmatrix}
301.518 & -6.518 & -3.898\\
-6.518 & 5.730 & 850\\
-3.898 & 850 & 156
\end{bmatrix}.
$$

*(Nota: como $A=X^\top X$ es simétrica, se cumple $M_{12}=M_{21}$ y $M_{13}=M_{31}$, $M_{23}=M_{32}$, lo cual sirve como chequeo intermedio.)*

</div>

<div class="econ-widget" data-widget="cofactores"></div>

<div class="econ-lamina is-ayudantia" markdown>

### Paso 2: Matriz de cofactores { data-lamina="Lámina 3" }

<!-- sem4/calculo_matrices.tex · lámina 3 -->

Cada cofactor se obtiene aplicando el patrón de signos (tablero de ajedrez) a los menores:

$$
\operatorname{sgn}(i,j)=(-1)^{i+j}
\;\Longrightarrow\;
\begin{bmatrix}
+ & - & +\\
- & + & -\\
+ & - & +
\end{bmatrix}.
$$

$$
C_{11}=+M_{11}=301.518, \quad
C_{12}=-M_{12}=6.518, \quad
C_{13}=+M_{13}=-3.898,
$$

$$
C_{21}=-M_{21}=6.518, \quad
C_{22}=+M_{22}=5.730, \quad
C_{23}=-M_{23}=-850,
$$

$$
C_{31}=+M_{31}=-3.898, \quad
C_{32}=-M_{32}=-850, \quad
C_{33}=+M_{33}=156.
$$

$$
C=\begin{bmatrix}
301.518 & 6.518 & -3.898\\
6.518 & 5.730 & -850\\
-3.898 & -850 & 156
\end{bmatrix}.
$$

</div>

<div class="econ-lamina is-ayudantia" markdown>

### Paso 3: Matriz adjunta (adjunta = transpuesta de cofactores) { data-lamina="Lámina 4" }

<!-- sem4/calculo_matrices.tex · lámina 4 -->

$$
\operatorname{adj}(A) = C^\top
=\begin{bmatrix}
301.518 & 6.518 & -3.898\\
6.518 & 5.730 & -850\\
-3.898 & -850 & 156
\end{bmatrix}.
$$

Como $A$ es simétrica, $C$ también resulta simétrica, así que $\operatorname{adj}(A)=C$ en este caso particular (esto **no** ocurre en general; solo porque $A=X^\top X$ es simétrica).

</div>

<div class="econ-lamina is-ayudantia" markdown>

### Paso 4: Determinante de $A$ { data-lamina="Lámina 5" data-toc-label="Paso 4: Determinante de A" }

<!-- sem4/calculo_matrices.tex · lámina 5 -->

El determinante se calcula expandiendo por cofactores a lo largo de la primera fila:

$$
\det(A) = a_{11}C_{11}+a_{12}C_{12}+a_{13}C_{13}
$$

$$
\det(A) = 5\times 301.518 \;+\; 67\times 6.518 \;+\; 490\times(-3.898)
$$

$$
\det(A) = 1.507.590 \;+\; 436.706 \;-\; 1.910.020
$$

$$
\boxed{\det(A) = 34.276}
$$

</div>

<div class="econ-lamina is-ayudantia" markdown>

### Paso 5: Matriz inversa { data-lamina="Lámina 6" }

<!-- sem4/calculo_matrices.tex · lámina 6 -->

$$
A^{-1} = \frac{1}{\det(A)}\operatorname{adj}(A)
= \frac{1}{34.276}
\begin{bmatrix}
301.518 & 6.518 & -3.898\\
6.518 & 5.730 & -850\\
-3.898 & -850 & 156
\end{bmatrix}.
$$

Dividiendo cada entrada por $34.276$ se obtiene, en decimales:

$$
A^{-1} = (X^\top X)^{-1} \approx
\begin{bmatrix}
8,796767 & 0,190162 & -0,113724\\
0,190162 & 0,167172 & -0,024799\\
-0,113724 & -0,024799 & 0,004551
\end{bmatrix}.
$$

</div>

<div class="econ-lamina is-ayudantia" markdown>

### Cálculo de $\hat\beta=(X^\top X)^{-1}X^\top y$ { data-lamina="Lámina 7" data-toc-label="Cálculo de hatβ=(X^top X)^-1X^top y" }

<!-- sem4/calculo_matrices.tex · lámina 7 -->

Como la base de datos ya incluye la variable $y$ (salario), es posible completar el ejercicio calculando el vector $X^\top y$ y luego el estimador OLS. Con $y=(769,\,808,\,825,\,650,\,562)^\top$:

$$
X^\top y =
\begin{bmatrix}
\sum y_i \\ \sum x_{1i} y_i \\ \sum x_{2i} y_i
\end{bmatrix}
=
\begin{bmatrix}
3.614\\
49.304\\
360.757
\end{bmatrix}.
$$

Luego:

$$
\hat\beta = A^{-1}X^\top y \approx
\begin{bmatrix}
140,586\\
-16,790\\
8,237
\end{bmatrix}.
$$

Es decir, $\hat\beta_0\approx 140,586$, $\hat\beta_1\approx -16,790$ y $\hat\beta_2\approx 8,237$.

</div>

---

!!! abstract "🧠 Ideas clave"
    - En la regresión múltiple cada $\beta_j$ es un efecto **ceteris paribus**: la pendiente del plano en la dirección de $x_j$.
    - Controlar por una variable cambia el coeficiente de interés (0.54 → 0.37 al agregar IQ), como predice la fórmula de variable omitida.
    - En notación matricial $y = X\beta + u$, con $X$ de dimensión $n \times (k+1)$, y $\hat{\beta} = (X^\top X)^{-1} X^\top y$ exige **rango completo**.
    - El $R^2$ **nunca baja** al agregar variables; el $R^2$ **ajustado** penaliza cada variable adicional.

## ✅ Autoevaluación

<div class="econ-quiz">
<p class="econ-quiz-q">En salario = 0.065 + 0.37·educación + 0.20·IQ, ¿qué significa 0.37?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">Un año más de educación se asocia con 0.37 más de salario, sin importar el IQ de la persona.</button>
<button class="econ-quiz-opt" data-correct>Un año más de educación se asocia con 0.37 más de salario esperado, manteniendo constante el IQ.</button>
<button class="econ-quiz-opt">El 37% del salario se explica por la educación.</button>
</div>
<p class="econ-quiz-fb">✅ En la regresión múltiple cada coeficiente es un efecto <em>ceteris paribus</em>: la pendiente del plano en la dirección de esa variable, con las demás incluidas fijas.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Con n = 100 observaciones y k = 4 variables explicativas, ¿qué dimensión tiene la matriz X?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">100 × 4</button>
<button class="econ-quiz-opt" data-correct>100 × 5</button>
<button class="econ-quiz-opt">5 × 100</button>
</div>
<p class="econ-quiz-fb">✅ X tiene una fila por observación y una columna por parámetro: la columna de unos más las 4 variables, es decir n × (k + 1) = 100 × 5.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">¿Por qué se exige que X tenga rango completo (k + 1)?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Para que XᵀX sea invertible y exista β̂ = (XᵀX)⁻¹Xᵀy.</button>
<button class="econ-quiz-opt">Para que el R² sea mayor que 0.5.</button>
<button class="econ-quiz-opt">Para que los residuos sumen cero.</button>
</div>
<p class="econ-quiz-fb">✅ Si una columna es combinación lineal de otras (por ejemplo, dos variables idénticas), XᵀX no se puede invertir y MCO no tiene solución única. Pruébalo en la calculadora.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Agregas al modelo una variable que no tiene ninguna relación con y. ¿Qué pasa?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">El R² baja y el R² ajustado sube.</button>
<button class="econ-quiz-opt" data-correct>El R² sube o se mantiene; el R² ajustado puede bajar.</button>
<button class="econ-quiz-opt">Ambos quedan exactamente iguales.</button>
</div>
<p class="econ-quiz-fb">✅ El R² nunca baja al agregar variables; el R² ajustado penaliza con (n − 1)/(n − k − 1). Es la trampa del R² que viste en el juego.</p>
</div>

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 3, secciones 3.1–3.2 (*Análisis de regresión múltiple: estimación*).
- 🛠️ Esta semana es el **Taller 1**: repasa el ejercicio de la Parte 2 y verifica tus cálculos con la calculadora matricial.
- Próxima clase: **Interpretación de la regresión múltiple**.
