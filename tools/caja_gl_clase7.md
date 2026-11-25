<div id="de-donde-sale-n-k-1" class="econ-ancla" markdown>

!!! tip "¿De dónde sale $n - k - 1$?"
    **$k$ es el número de variables explicativas del modelo, sin contar el intercepto.** Los grados de libertad son
    las observaciones menos la cantidad de coeficientes $\beta$ que se estiman:

    $$
    gl = n - \underbrace{(k + 1)}_{\text{pendientes } + \text{ intercepto}} = n - k - 1
    $$

    **Intuición.** Si te digo que tres números suman 30, puedes elegir libremente dos de ellos, pero el tercero
    queda obligado: hay $3 - 1 = 2$ grados de libertad. En MCO pasa lo mismo con los residuos: deben cumplir
    $k + 1$ condiciones (sumar cero, $\sum_i \hat{u}_i = 0$, y no estar correlacionados con ninguna variable
    explicativa, $\sum_i x_{ij}\hat{u}_i = 0$). Por cada coeficiente que se estima se "gasta" una condición, y
    solo $n - k - 1$ residuos quedan libres. Por eso $\hat{\sigma}^2 = \dfrac{SSR}{n - k - 1}$, y esos mismos
    grados de libertad tiene la distribución $t$ del test.

    **Ejemplos con $n = 100$ observaciones:**

    | Variables explicativas | $k$ | $gl$ |
    |---|:---:|:---:|
    | Ninguna (solo la media) | 0 | 99 |
    | educ | 1 | 98 |
    | educ, IQ | 2 | 97 |
    | educ, exper, tenure | 3 | 96 |

    En cada fila se estiman $k + 1$ coeficientes (las pendientes y el intercepto), así que $gl = 100 - k - 1$.

    La primera fila es el caso de estadística: estimar solo una media deja $n - 1$ grados de libertad.

    **En los ejemplos de esta clase:** en la lámina 14 el modelo tiene educ e IQ ($k = 2$) y $n = 935$, así que
    $gl = 935 - 2 - 1 = 932$. En la lámina 20 tiene educ, exper y tenure ($k = 3$) con $n = 526$:
    $gl = 526 - 3 - 1 = 522$.

    **Ojo con un error frecuente:** $k$ **no** cuenta la varianza del error. Estimar $\sigma^2$ no resta un grado
    de libertad adicional; solo se descuentan los coeficientes $\beta_0, \beta_1, \dots, \beta_k$.

    **¿Por qué importa?** Con pocos grados de libertad la $t$ tiene colas más gruesas y el valor crítico al 5%
    (dos colas) es más exigente: con $n = 10$ y $k = 3$ hay 6 grados de libertad y el crítico es 2,447; con 20
    es 2,086; con 96 es 1,985, y con muchos grados de libertad se acerca a 1,96, el valor de la normal.

    ??? question "Ponte a prueba: con $n = 25$ y 4 variables explicativas, ¿cuántos grados de libertad hay?"
        $gl = 25 - 4 - 1 = 20$: se estiman 5 coeficientes (4 pendientes y el intercepto). El valor crítico al 5%
        (dos colas) es $t_{20} = 2{,}086$.

</div>
