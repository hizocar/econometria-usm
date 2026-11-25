# 📝 Certamen 1 · Econometría ICS-294

<div class="usm-session-meta">
<span>📅 III Trimestre 2026</span>
<span>⏱️ 100 minutos · 100 puntos</span>
<span class="usm-tag-gold">Profesores: Pedro Comte, Nicolás Escobar, Sebastián Azócar, Iván Canales</span>
</div>

!!! info "Instrucciones originales"
    - Usted dispone de 100 minutos para intentar los 100 puntos del certamen.
    - Cuide la presentación y redacción de sus preguntas.
    - No puede utilizar celular, computador o tablet, pero sí una calculadora TI.

    Al final de la página está el [formulario](#formulario) que acompañaba al certamen. Cada pauta está plegada:
    ábrela después de intentar la pregunta.

## 1 · Comentes y preguntas cortas (40 puntos)

Responda solo 4 de las siguientes preguntas; si responde todas, se evaluarán las primeras 4.

### Comente 1 (10 puntos)

Al agregar una variable explicativa a un modelo de regresión, el $R^2$ nunca disminuye. Por lo tanto, el modelo con
más variables siempre es preferible.

??? success "Pauta"
    **Incierto:** la primera parte es verdadera, la conclusión es falsa.

    - **(4 puntos)** MCO minimiza $SSR$. Con una variable adicional, MCO siempre podría asignarle coeficiente cero y
      obtener el mismo $SSR$ que antes, así que el nuevo $SSR$ es menor o igual. Como $R^2 = 1 - SSR/SST$ y $SST$ no
      cambia, $R^2$ no baja.
    - **(4 puntos)** Esto pasa incluso si la variable es irrelevante en el modelo poblacional, por lo que $R^2$ no
      sirve para comparar modelos con distinto número de regresores. Se usa el $R^2$ ajustado, que penaliza por grados
      de libertad:

        $$
        \bar{R}^2 = 1 - \frac{n-1}{n-k-1}\,\frac{SSR}{SST}
        $$

    - **(2 puntos)** El $R^2$ ajustado puede bajar si la variable aporta poco. Además, incluir variables irrelevantes
      no sesga, pero puede aumentar la varianza de los demás estimadores.

### Comente 2 (10 puntos)

El teorema de Gauss-Markov garantiza que MCO es el mejor estimador lineal insesgado (MELI) posible de $\beta$,
siempre que se cumpla $E[u \mid X] = 0$.

??? success "Pauta"
    **Falso.**

    - **(5 puntos)** "Mejor" tiene un sentido acotado: MCO es el estimador de menor varianza dentro de la clase de
      estimadores lineales en $y$ e insesgados (MELI). Puede haber estimadores sesgados o no lineales con menor varianza.
    - **(5 puntos)** El teorema requiere los supuestos 1 a 5. Con $E[u \mid X] = 0$ (supuestos 1 a 4) solo se garantiza
      insesgamiento; para la eficiencia hace falta homocedasticidad y no autocorrelación, $Var(u \mid X) = \sigma^2 I$.

### Comente 3 (10 puntos)

En un experimento donde la consultoría se asignó al azar entre empresas, el coeficiente de la regresión
$productividad = \alpha + \beta\, consultoria + \epsilon$ está sesgado si no se controla por el tamaño de la empresa.

??? success "Pauta"
    **Falso.**

    - **(5 puntos)** Con asignación aleatoria, la consultoría no está correlacionada con ninguna característica de la
      empresa (observada o no), así que $E[\epsilon \mid consultoria] = 0$.
    - **(5 puntos)** El problema aparece en datos observacionales: si solo las empresas grandes contratan consultoría,
      el tamaño se correlaciona positivamente con el tratamiento y, si aumenta la productividad, $\hat{\beta}$ tendría
      sesgo hacia arriba. Con aleatorización, controlar por tamaño puede mejorar la precisión, pero no es necesario
      para el insesgamiento.

### Comente 4 (10 puntos)

Para estimar la pendiente de una regresión simple da lo mismo cuánto varíen los valores de $x$ en la muestra; lo
importante es tener muchas observaciones.

??? success "Pauta"
    **Falso.**

    - **(4 puntos)** Si todos los valores de $x$ son iguales, es decir, no hay variabilidad, entonces
      $\sum (x_i - \bar{x})^2 = 0$, y $\hat{\beta}_1 = \sum (y_i - \bar{y})(x_i - \bar{x}) / \sum (x_i - \bar{x})^2$
      se indefine.
    - **(4 puntos)** Además, $Var(\hat{\beta}_1 \mid x) = \sigma^2 / \sum (x_i - \bar{x})^2$; por tanto, a mayor
      variabilidad de $x$, más preciso es el estimador (menor varianza).
    - **(2 puntos)** Aumentar $n$ ayuda porque suele aumentar $\sum (x_i - \bar{x})^2$, pero 1.000 observaciones con
      casi el mismo $x$ informan muy poco sobre la pendiente.

### Pregunta 5 (10 puntos)

¿Cuál es el rol del intercepto $\beta_0$ en el modelo $y = \beta_0 + \beta_1 x + u$? Explique su interpretación y
por qué es importante incluirlo aunque no tenga sentido económico.

??? success "Pauta"
    - **(5 puntos) Interpretación.** $\beta_0 = E[y \mid x = 0]$ es el valor esperado de $y$ cuando $x$ vale cero. Si en
      la muestra no hay observaciones con $x$ cerca de 0, el valor de $\hat{\beta}_0$ es una extrapolación y puede no
      tener sentido económico (por ejemplo, un salario negativo con cero años de educación).
    - **(5 puntos)** Absorbe la media del error, es decir, $\beta_0$ toma el valor tal que $E(u) = 0$.

## 2 · Ejercicios (60 puntos)

Conteste los 3 ejercicios.

### Ejercicio 1 (20 puntos)

Una cadena de tiendas quiere explicar sus ventas semanales ($y$, millones de \$) con el gasto en publicidad ($x_1$,
millones de \$) y el número de vendedores ($x_2$). Se estima el modelo

$$
ventas_i = \beta_0 + \beta_1\, publicidad_i + \beta_2\, vendedores_i + u_i
$$

con la siguiente muestra de 5 tiendas:

| Tienda | $x_1$ (publicidad) | $x_2$ (vendedores) | $y$ (ventas) |
|:---:|:---:|:---:|:---:|
| A | 5 | 3 | 31 |
| B | 5 | 3 | 27 |
| C | 4 | 2 | 24 |
| D | 2 | 1 | 17 |
| E | 4 | 1 | 21 |

Se sabe que:

$$
(X^\top X)^{-1} = \begin{bmatrix} 3{,}2 & -1 & 0{,}5 \\ -1 & 0{,}5 & -0{,}5 \\ 0{,}5 & -0{,}5 & 0{,}75 \end{bmatrix}
$$

**(a) (5 puntos)** Obtenga $\hat{\beta}$ e interprete $\hat{\beta}_1$ y $\hat{\beta}_2$.

**(b) (5 puntos)** Calcule $R^2$ y $\bar{R}^2$ e interprete. ¿Por qué es tan diferente el $R^2$ del $\bar{R}^2$?

**(c) (5 puntos)** Estime $\sigma^2$, la matriz de varianzas y covarianzas de $\hat{\beta}$ y el error estándar de cada coeficiente.

**(d) (5 puntos)** La cadena desea abrir una tienda que tenga las ventas más altas, con un valor de 32 millones.
¿Cuántos millones se deberían gastar en publicidad si la tienda tendrá 4 vendedores?

??? success "Pauta del ejercicio 1"
    **(a) (5 puntos)** Con $\sum y_i = 120$, $\sum x_{i1} y_i = 504$ y $\sum x_{i2} y_i = 260$:

    $$
    \hat{\beta} = (X^\top X)^{-1} X^\top y = \frac{1}{40}\begin{bmatrix} 128(120) - 40(504) + 20(260) \\ -40(120) + 20(504) - 20(260) \\ 20(120) - 20(504) + 30(260) \end{bmatrix}
    = \frac{1}{40}\begin{bmatrix} 400 \\ 80 \\ 120 \end{bmatrix} = \begin{bmatrix} 10 \\ 2 \\ 3 \end{bmatrix}
    $$

    - $\hat{\beta}_1 = 2$: un millón adicional en publicidad se asocia, en promedio, a 2 millones más de ventas
      semanales, manteniendo constante el número de vendedores.
    - $\hat{\beta}_2 = 3$: un vendedor adicional se asocia, en promedio, a 3 millones más de ventas, manteniendo
      constante la publicidad.

    **(b) (5 puntos)** Sabiendo que $\bar{y} = 24$:

    | Tienda | $y_i - \bar{y}$ | $(y_i - \bar{y})^2$ | $\hat{y}_i = 10 + 2x_{i1} + 3x_{i2}$ | $\hat{u}_i$ | $\hat{u}_i^2$ |
    |:---:|:---:|:---:|:---:|:---:|:---:|
    | A | 7 | 49 | 29 | 2 | 4 |
    | B | 3 | 9 | 29 | $-2$ | 4 |
    | C | 0 | 0 | 24 | 0 | 0 |
    | D | $-7$ | 49 | 17 | 0 | 0 |
    | E | $-3$ | 9 | 21 | 0 | 0 |
    | **Total** | | **116** | | **0** | **8** |

    Se tiene que $SST = 116$ y $SSR = 8$, por tanto:

    $$
    R^2 = 1 - \frac{SSR}{SST} = 1 - \frac{8}{116} = 0{,}931
    $$

    $$
    \bar{R}^2 = 1 - \frac{n-1}{n-k-1}\,\frac{SSR}{SST} = 1 - \frac{5-1}{5-2-1}\cdot\frac{8}{116} = 0{,}862
    $$

    El modelo explica el 93,1% de la variabilidad de las ventas. El $\bar{R}^2$ es bastante menor porque con $n = 5$ y
    $k = 2$ quedan solo 2 grados de libertad.

    **(c) (5 puntos)**

    $$
    \hat{\sigma}^2 = \frac{SSR}{n-k-1} = \frac{8}{2} = 4, \qquad
    \widehat{Var}(\hat{\beta} \mid X) = \hat{\sigma}^2 (X^\top X)^{-1} = \begin{bmatrix} 12{,}8 & -4 & 2 \\ -4 & 2 & -2 \\ 2 & -2 & 3 \end{bmatrix}
    $$

    Los errores estándar son la raíz de la diagonal:

    $$
    se(\hat{\beta}_0) = \sqrt{12{,}8} = 3{,}58, \qquad se(\hat{\beta}_1) = \sqrt{2} = 1{,}41, \qquad se(\hat{\beta}_2) = \sqrt{3} = 1{,}73
    $$

    **(d) (5 puntos)** Para que el valor predicho sea 32 millones, con 4 vendedores:

    $$
    32 = 10 + 2x_1 + 3 \cdot 4 \;\Rightarrow\; 10 = 2x_1 \;\Rightarrow\; x_1 = 5
    $$

    La empresa debería gastar 5 millones en publicidad para tener, en promedio, 32 millones de ventas con 4 vendedores.

### Ejercicio 2 · Causalidad y variable omitida (20 puntos)

Una empresa de retail ofrece a sus vendedores un curso *voluntario* de técnicas de venta. Sea $T_i = 1$ si el
vendedor $i$ tomó el curso y $T_i = 0$ si no, y sea $Y_i$ sus ventas mensuales (en millones de pesos). Suponga que un
"oráculo" nos revela ambos outcomes potenciales de seis vendedores:

| Vendedor | A | B | C | D | E | F |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| $T_i$ | 1 | 1 | 1 | 0 | 0 | 0 |
| $Y_i^{NT}$ | 50 | 60 | 40 | 30 | 20 | 40 |
| $Y_i^{T}$ | 60 | 66 | 54 | 36 | 30 | 48 |

**(a) (6 puntos)** Calcule el ATE, el ATT y la diferencia de medias observada $E[Y \mid T=1] - E[Y \mid T=0]$.
Verifique numéricamente que la diferencia observada se descompone en ATT más sesgo de selección.

**(b) (3 puntos)** Interprete el signo del sesgo de selección encontrado. ¿Qué tipo de vendedores cree usted que se
inscriben en un curso voluntario?

**(c) (5 puntos)** Con datos de 2.000 vendedores, un analista estima por MCO:

$$
\begin{aligned}
\text{(corta)}\quad \widehat{ventas} &= 25 + 18\, curso \\
\text{(larga)}\quad \widehat{ventas} &= 10 + 9\, curso + 3\, experiencia
\end{aligned}
$$

donde $experiencia$ se mide en años. Usando la fórmula del sesgo por variable omitida, obtenga $\delta_1$ de la
regresión auxiliar $experiencia = \delta_0 + \delta_1\, curso + v$ e interprételo.

**(d) (3 puntos)** Suponga ahora que el curso no es voluntario, sino que la gerencia lo asigna preferentemente a los
vendedores *con menos* experiencia. Sin hacer cálculos, ¿qué signo tendría el sesgo de la regresión corta?
¿Sobreestimaría o subestimaría el efecto del curso? Justifique con la tabla de signos.

**(e) (3 puntos) Comente:** "Como al controlar por experiencia el coeficiente bajó de 18 a 9, podemos concluir que el
efecto causal del curso es 9 millones". ¿Cómo diseñaría el estudio para obtener el efecto causal sin depender de qué
variables se controlan?

??? success "Pauta del ejercicio 2"
    - **(a) (6 puntos)** Efectos individuales: 10, 6, 14, 6, 10, 8. $ATE = \frac{54}{6} = 9$ y
      $ATT = \frac{10 + 6 + 14}{3} = 10$. Diferencia observada:
      $E[Y^T \mid T=1] - E[Y^{NT} \mid T=0] = 60 - 30 = 30$. Sesgo de selección:
      $E[Y^{NT} \mid T=1] - E[Y^{NT} \mid T=0] = 50 - 30 = 20$. Se verifica que $30 = 10 + 20$.
    - **(b) (3 puntos)** El sesgo es positivo: aun sin el curso, quienes lo toman venderían más (50 frente a 30). Se
      autoseleccionan los más motivados o con más experiencia, por lo que la diferencia observada sobreestima el
      efecto del curso.
    - **(c) (5 puntos)** $\tilde{\beta}_1 = \beta_1 + \beta_2 \delta_1 \Rightarrow 18 = 9 + 3\delta_1 \Rightarrow \delta_1 = 3$.
      Quienes toman el curso tienen, en promedio, 3 años más de experiencia. Como $\beta_2 > 0$ y $\delta_1 > 0$, el
      sesgo es positivo ($\beta_2 \delta_1 = 9$).
    - **(d) (3 puntos)** $\delta_1 < 0$ y $\beta_2 > 0 \Rightarrow \beta_2 \delta_1 < 0$: sesgo negativo. La regresión
      corta subestimaría el efecto, e incluso podría hacer que el curso parezca inútil o dañino.
    - **(e) (3 puntos)** Falso o incierto. 9 es causal solo si la experiencia es la única variable omitida relacionada
      con el curso y con las ventas; la motivación, por ejemplo, sigue en el error. Lo ideal es asignar el curso al
      azar (test A/B): así $E[Y^{NT} \mid T=1] = E[Y^{NT} \mid T=0]$, el sesgo de selección es cero y la diferencia de
      medias estima el ATE.

### Ejercicio 3 (20 puntos)

Una empresa desea estudiar la relación entre las horas de capacitación recibidas por sus trabajadores y su
productividad semanal. Para ello, selecciona una muestra de cinco trabajadores y estima mediante Mínimos Cuadrados
Ordinarios (MCO) el siguiente modelo de regresión lineal simple con intercepto:

$$
productividad_i = \beta_0 + \beta_1\, capacitacion_i + u_i
$$

donde $productividad_i$ representa las unidades producidas semanalmente (en decenas) y $capacitacion_i$ las horas de
capacitación recibidas. La ecuación de regresión estimada es:

$$
\widehat{productividad}_i = 2 + 2\, capacitacion_i
$$

Se dispone de la siguiente información:

| Trabajador | Capacitación ($x_i$) | Productividad ($y_i$) |
|:---:|:---:|:---:|
| A | 1 | 5 |
| B | 2 | 5 |
| C | 3 | 8 |
| D | 4 | 9 |
| E | 5 | 13 |

Responda las siguientes preguntas, mostrando sus procedimientos:

**(a) (4 puntos)** Calcule los valores ajustados $\hat{y}_i$ y los residuos $\hat{u}_i$ para cada trabajador.
Verifique que la suma de los residuos sea igual a cero.

**(b) (5 puntos)** Calcule la suma total de cuadrados ($SST$), la suma de cuadrados explicada ($SSE$) y la suma de
cuadrados residual ($SSR$). Compruebe numéricamente que se cumple $SST = SSE + SSR$.

**(c) (4 puntos)** Demuestre algebraicamente que, en una regresión estimada mediante MCO con intercepto, el término
cruzado de la descomposición de la varianza es igual a cero. Explique qué propiedades de MCO permiten obtener este resultado.

**(d) (4 puntos)** Calcule el coeficiente de determinación $R^2$ e interprete su resultado en términos de la
proporción de la variabilidad de la productividad explicada por el modelo.

**(e) (3 puntos)** Un analista afirma: "Si todos los trabajadores presentan residuos iguales a cero, entonces
necesariamente la productividad observada es idéntica para todos ellos". ¿Es correcta esta afirmación? Justifique
utilizando las propiedades de MCO.

??? success "Pauta del ejercicio 3"
    **(a) (4 puntos)** A partir de $\hat{y}_i = 2 + 2x_i$:

    | Trabajador | A | B | C | D | E |
    |---|:---:|:---:|:---:|:---:|:---:|
    | $\hat{y}_i$ | 4 | 6 | 8 | 10 | 12 |
    | $\hat{u}_i$ | 1 | $-1$ | 0 | $-1$ | 1 |

    Se verifica que $\sum_{i=1}^{5} \hat{u}_i = 0$.

    *Puntaje:* 2 por valores ajustados, 1 por residuos y 1 por verificación.

    **(b) (5 puntos)** Dado que $\bar{y} = 8$:

    $$
    SST = \sum (y_i - \bar{y})^2 = 44, \qquad SSE = \sum (\hat{y}_i - \bar{y})^2 = 40, \qquad SSR = \sum \hat{u}_i^2 = 4
    $$

    Se verifica: $SST = SSE + SSR = 40 + 4 = 44$.

    *Puntaje:* 1 por cada suma de cuadrados y 2 por verificar la identidad.

    **(c) (4 puntos)** De $y_i = \hat{y}_i + \hat{u}_i$ se obtiene:

    $$
    SST = SSE + SSR + 2\sum (\hat{y}_i - \bar{y})\,\hat{u}_i
    $$

    El término cruzado es cero porque

    $$
    \sum (\hat{y}_i - \bar{y})\,\hat{u}_i = \sum \hat{y}_i \hat{u}_i - \bar{y}\sum \hat{u}_i = 0.
    $$

    En efecto, como $\hat{y}_i = \hat{\beta}_0 + \hat{\beta}_1 x_i$, MCO con intercepto garantiza
    $\sum \hat{u}_i = 0$ y $\sum x_i \hat{u}_i = 0$. Por tanto, $SST = SSE + SSR$.

    *Puntaje:* 1 por la identidad, 1 por el término cruzado, 1 por la ortogonalidad y 1 por la conclusión.

    **(d) (4 puntos)**

    $$
    R^2 = \frac{SSE}{SST} = \frac{40}{44} = 0{,}9091
    $$

    El modelo explica el 90,91% de la variabilidad muestral de la productividad respecto de su media.

    *Puntaje:* 2 por el cálculo y 2 por la interpretación.

    **(e) (3 puntos) Falso.** Si $\hat{u}_i = 0$ para todo $i$, entonces $y_i = \hat{y}_i$, pero los valores observados
    no necesariamente son iguales, pues dependen de $x_i$. Si $SST > 0$, se tiene $SSR = 0$ y $R^2 = 1$, lo que
    representa un ajuste perfecto.

    *Puntaje:* 1 por identificar que es falso, 1 por justificar y 1 por explicar el ajuste perfecto.

## Formulario

- Intervalo de confianza de $100(1-\alpha)\%$ para la media poblacional $\mu$ cuando $\sigma$ es **conocido**:
  $\bar{x} \pm z_{\frac{\alpha}{2}} \dfrac{\sigma}{\sqrt{n}}$
- Intervalo de confianza de $100(1-\alpha)\%$ para la diferencia de medias $\mu_x - \mu_y$:
  $(\bar{X} - \bar{Y}) \pm z_{\frac{\alpha}{2}} \sqrt{\dfrac{\sigma_x^2}{n_x} + \dfrac{\sigma_y^2}{n_y}}$
- Estimadores MCO simple: $\hat{\beta}_0 = \bar{y} - \hat{\beta}_1 \bar{x}$,
  $\quad \hat{\beta}_1 = \dfrac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^{n} (x_i - \bar{x})^2}$
- Estimadores MCO múltiple: $\hat{\beta} = (X^\top X)^{-1} X^\top y$
- Descomposición de la varianza: $SST = \sum_{i=1}^{n} (y_i - \bar{y})^2$, $\ SSE = \sum_{i=1}^{n} (\hat{y}_i - \bar{y})^2$,
  $\ SSR = \sum_{i=1}^{n} \hat{u}_i^2$
- Varianza residual estimada: $\hat{\sigma}^2 = \dfrac{SSR}{n-k-1}$
- Varianza de los estimadores: $\widehat{Var}(\hat{\beta}) = \hat{\sigma}^2 (X^\top X)^{-1}$
