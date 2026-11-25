# 🛠️ Control 1 · Taller de Econometría

<div class="usm-session-meta">
<span>🛠️ Taller de Econometría</span>
<span>⏱️ 30 minutos</span>
<span class="usm-tag-gold">Programación, regresión y efectos de un tratamiento</span>
</div>

!!! info "Instrucciones originales"
    Duración total: 30 minutos. Responde por escrito. No necesitas ejecutar R, instalar paquetes ni descargar datos:
    toda la información necesaria está en este documento.

    Cada pauta está plegada: ábrela después de intentar la pregunta.

## Pregunta 1 · Lectura de código en R (10 minutos)

A continuación se presenta un código en R. Explica con tus palabras qué hace:

```r linenums="1"
n <- 6
v <- numeric(n)
for (i in 1:n) {
  if (i %% 2 == 0) {
    v[i] <- i * 2
  } else {
    v[i] <- -i
  }
}
print(v)
```

a) Explica para qué sirven las dos primeras líneas y qué valores toma `i` durante el ciclo.

b) Explica cómo funciona la condición `i %% 2 == 0` y qué se guarda en `v[i]` en cada caso.

c) Escribe el vector que aparece al ejecutar `print(v)`. Justifica al menos una posición par y una impar.

??? success "Pauta de la pregunta 1"
    **a)** `n <- 6` guarda el largo que tendrá el vector. `v <- numeric(n)` crea un vector numérico de largo 6 lleno de
    ceros, donde se irán guardando los resultados. En el ciclo `for (i in 1:n)`, `i` toma los valores 1, 2, 3, 4, 5 y 6,
    uno por vuelta.

    **b)** `%%` es el operador **resto** (módulo): `i %% 2` es el resto de dividir `i` por 2, que vale 0 si `i` es par y 1
    si es impar. Por eso `i %% 2 == 0` es verdadero solo para los `i` pares.

    - Si `i` es **par**, se guarda el doble: `v[i] <- i * 2`.
    - Si `i` es **impar**, se guarda su negativo: `v[i] <- -i`.

    **c)** El resultado es:

    ```
    [1] -1  4 -3  8 -5 12
    ```

    Por ejemplo, en la posición 2 (par) se guarda $2 \cdot 2 = 4$, y en la posición 3 (impar) se guarda $-3$.

## Pregunta 2 · Regresión simple, correlación y ANOVA (10 minutos)

Se dispone de información de 32 empresas de la industria química. Para cada empresa se registran sus ventas ($X$,
variable explicativa) y su gasto en investigación y desarrollo ($Y$, variable dependiente), ambos expresados en
millones de dólares. Cada punto representa una empresa; no hay datos faltantes. La recta corresponde a una regresión
lineal simple estimada por mínimos cuadrados ordinarios.

!!! note "Gráfico Gr-1"
    En el control impreso esta pregunta incluía un gráfico de dispersión (Gr-1) de $Y$ contra $X$ con la recta
    estimada: una nube de puntos con pendiente positiva, muy concentrada alrededor de la recta, aunque no todos los
    puntos caen sobre ella.

$$
\hat{Y} = \underbrace{-0{,}577217}_{\hat{\beta}_0\ (b_0)} + \underbrace{0{,}040626}_{\hat{\beta}_1\ (b_1)}\, X
$$

**Correlación de Pearson:** $r_{XY} = 0{,}9496$.

**Tabla ANOVA**

| Fuente | Suma de cuadrados | gl | Cuadrado medio | $F$ | p-valor |
|---|---:|---:|---:|---:|---:|
| Regresión | 2.945.977,47 | 1 | 2.945.977,47 | 275,27 | $< 2{,}2 \times 10^{-16}$ |
| Error | 321.063,09 | 30 | 10.702,10 | — | — |
| Total | 3.267.040,55 | 31 | — | — | — |

a) Interpreta la dirección, intensidad y dispersión de la relación en el **Gr-1**. Relaciona lo observado con el
coeficiente de Pearson. ¿Todas las empresas siguen exactamente una misma recta?

b) Interpreta $b_1$ (pendiente) y $b_0$ (intercepto), considerando las unidades de las variables. ¿Qué cambio
promedio en $Y$ se asocia con un aumento de una unidad en $X$? ¿Qué predice el modelo cuando $X = 0$?

c) Interpreta el p-valor de la prueba $F$ de la ANOVA con $\alpha = 0{,}05$. Para $H_0: \beta_1 = 0$ frente a
$H_1: \beta_1 \neq 0$, indica si rechazas $H_0$ y qué concluyes sobre la asociación lineal entre ventas y gasto en I+D.

<small>Fuente de los datos: Businessweek, R&D Scoreboard (1991).</small>

??? success "Pauta de la pregunta 2"
    **a)** La relación es **positiva** (empresas con más ventas gastan más en I+D), **lineal y muy intensa**: $r_{XY} =
    0{,}9496$ está muy cerca de 1. La dispersión alrededor de la recta es baja, pero no nula: los puntos no caen todos
    sobre la recta, así que **no** todas las empresas siguen exactamente la misma recta (si así fuera, $r_{XY}$ sería 1).
    En regresión simple $R^2 = r_{XY}^2 = 0{,}9496^2 \approx 0{,}902$, que coincide con la ANOVA:
    $SS_{reg}/SS_{total} = 2.945.977{,}47 / 3.267.040{,}55 \approx 0{,}902$: las ventas explican cerca del 90% de la
    variabilidad del gasto en I+D.

    **b)** $b_1 = 0{,}040626$: un millón de dólares más en ventas se asocia, en promedio, con **0,0406 millones de
    dólares** (unos 40.600 dólares) más de gasto en I+D; es decir, cerca de 4 centavos de I+D por cada dólar de venta.
    $b_0 = -0{,}577$: el modelo predice un gasto en I+D de $-0{,}577$ millones cuando las ventas son cero. Ese valor
    **no tiene sentido económico** (un gasto no puede ser negativo) y es una extrapolación: no hay empresas con ventas
    cercanas a cero en la muestra.

    **c)** El p-valor ($< 2{,}2 \times 10^{-16}$) es mucho menor que $\alpha = 0{,}05$, así que **se rechaza**
    $H_0: \beta_1 = 0$. Hay evidencia muy fuerte de una asociación lineal entre ventas y gasto en I+D. En regresión
    simple el test $F$ equivale al test $t$ de la pendiente: $t = \sqrt{F} = \sqrt{275{,}27} \approx 16{,}6$, con
    $n - 2 = 30$ grados de libertad.

## Pregunta 3 · Efectos de un tratamiento (10 minutos)

En un **ejemplo ficticio**, seis deportistas participan en un estudio de un tratamiento con hormonas de crecimiento.
El resultado $Y$ es un índice de rendimiento deportivo, medido en puntos; un valor mayor indica mayor rendimiento. Los
valores se han construido únicamente para este ejercicio.

$T = 1$ indica que el deportista recibió el tratamiento y $T = 0$, que no lo recibió. $Y^{T}$ representa su resultado
potencial con tratamiento y $Y^{NT}$, su resultado potencial sin tratamiento. En este ejemplo se entregan ambos
resultados para poder calcular los efectos; en un estudio real solo se observa uno de ellos para cada persona.

| Deportista | $T$ | $Y^{T}$ | $Y^{NT}$ | $Y^{T} - Y^{NT}$ | $Y$ observado |
|:---:|:---:|:---:|:---:|:---:|:---:|
| D1 | 1 | 69 | 60 | | |
| D2 | 0 | 59 | 55 | | |
| D3 | 1 | 78 | 70 | | |
| D4 | 0 | 55 | 50 | | |
| D5 | 1 | 72 | 65 | | |
| D6 | 0 | 61 | 58 | | |

a) Completa las dos últimas columnas: el efecto individual $Y^{T} - Y^{NT}$ y el resultado observado de cada
deportista según su tratamiento.

b) Calcula el **ATE**, efecto promedio del tratamiento entre los seis deportistas. Muestra la suma y el promedio que
utilizaste e interpreta el resultado en puntos.

c) Calcula el **ATT**, efecto promedio del tratamiento entre quienes lo recibieron. Identifica a los deportistas
incluidos, muestra tu cálculo e interpreta el resultado en puntos.

??? success "Pauta de la pregunta 3"
    **a)** El resultado observado es $Y^{T}$ si el deportista fue tratado ($T = 1$) y $Y^{NT}$ si no ($T = 0$):

    | Deportista | $T$ | $Y^{T} - Y^{NT}$ | $Y$ observado |
    |:---:|:---:|:---:|:---:|
    | D1 | 1 | 9 | 69 |
    | D2 | 0 | 4 | 55 |
    | D3 | 1 | 8 | 78 |
    | D4 | 0 | 5 | 50 |
    | D5 | 1 | 7 | 72 |
    | D6 | 0 | 3 | 58 |

    **b)** $ATE = \dfrac{9 + 4 + 8 + 5 + 7 + 3}{6} = \dfrac{36}{6} = 6$ puntos. En promedio, entre los seis deportistas,
    el tratamiento aumenta el índice de rendimiento en 6 puntos.

    **c)** El ATT considera solo a los tratados: D1, D3 y D5.
    $ATT = \dfrac{9 + 8 + 7}{3} = \dfrac{24}{3} = 8$ puntos. Entre quienes recibieron el tratamiento, el aumento
    promedio es de 8 puntos, mayor que el ATE: los tratados fueron justamente quienes más se beneficiaban.

!!! note "Sobre esta pauta"
    El control se entregó sin pauta escrita; esta pauta se elaboró para su publicación en el sitio.
