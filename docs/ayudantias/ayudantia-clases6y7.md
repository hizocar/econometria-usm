# Ayudantía · Clases 6 y 7: interpretación e inferencia

<div class="usm-session-meta">
<span>📘 Ayudantía de refuerzo</span>
<span class="usm-tag-gold">Complementa las Clases 6 y 7</span>
</div>

!!! info "Material de refuerzo"
    Ejercicios de desarrollo con el nivel de exigencia de las evaluaciones del curso, para trabajar **en conjunto
    durante la ayudantía**. No reemplaza las láminas: repasa lo visto en la
    [Clase 6 · Interpretación](../clases/clase6.md) y la [Clase 7 · Inferencia sobre un parámetro](../clases/clase7.md).
    Se permite calculadora; usa $\log(\cdot) = \ln(\cdot)$.

## 🎯 Objetivos

- Obtener y evaluar **efectos parciales** en modelos con logaritmos, términos cuadráticos e interacciones.
- Distinguir la **aproximación** $100\,\hat{\beta}\,\Delta x$ del **cambio porcentual exacto** y saber cuándo usar cada uno.
- Predecir cómo cambian coeficientes, estadísticos $t$ y $R^2$ al **reescalar** variables.
- Plantear **tests $t$ con hipótesis nula distinta de cero**, de una y de dos colas, y **acotar el valor-p** con una tabla.
- Conectar tests e **intervalos de confianza**, incluidos los de una cola.
- Justificar **comentes** con el supuesto o la fórmula que corresponde.

!!! tip "Sugerencia para conducir la ayudantía (90 minutos)"
    | Bloque | Tiempo | Dinámica |
    |---|:---:|---|
    | 1 · Ronda rápida | 10 min | Responden en parejas; se corrige en voz alta. |
    | 2 · Problema de interpretación | 30 min | 6–8 min por parte: primero intentan, luego se desarrolla en la pizarra. |
    | 3 · Problema de inferencia | 30 min | Insistir en escribir $H_0$ y $H_1$ **antes** de calcular. |
    | 4 · Comentes | 15 min | Cada pareja defiende una respuesta; el resto evalúa la justificación. |
    | Cierre | 5 min | Repasar los errores frecuentes del final. |

    Las pautas están plegadas: ábrelas **después** de que el curso haya intentado cada parte. En una evaluación,
    una respuesta sin desarrollo no tiene puntaje, así que vale la pena exigir el desarrollo completo también aquí.

## 1 · Ronda rápida (10 minutos)

Seis preguntas cortas para activar las herramientas que se usan después.

1. En $\log(y) = \beta_0 + \beta_1 x + u$ se estimó $\hat{\beta}_1 = 0{,}12$. ¿Cuánto cambia $y$, en %, si $x$ sube 3 unidades? Da la aproximación y el valor exacto.
2. En $y = 50 + 8\log(x)$, ¿cuánto cambia $\hat{y}$ si $x$ aumenta 5%?
3. En $\log(q) = \beta_0 - 0{,}7\log(p) + u$, ¿qué ocurre con $q$ si $p$ sube 2%?
4. Con $n = 60$ observaciones y 4 variables explicativas, ¿cuántos grados de libertad tiene el test $t$?
5. Se estimó $\hat{\beta}_j = 1{,}90$ con $se(\hat{\beta}_j) = 0{,}25$. Calcula el estadístico para $H_0: \beta_j = 1{,}5$.
6. En $\log(y) = \beta_0 + \beta_1\, dist + u$, la distancia pasa de kilómetros a metros. ¿Qué pasa con $\hat{\beta}_1$ y con su $t$?

??? success "Respuestas de la ronda rápida"
    1. Aproximación: $100 \cdot 0{,}12 \cdot 3 = 36\%$. Exacto: $100\,(e^{0{,}36} - 1) \approx 43{,}3\%$. La aproximación se aleja porque $\hat{\beta}\,\Delta x = 0{,}36$ no es pequeño.
    2. Nivel-log: $\Delta \hat{y} \approx (8/100) \cdot 5 = 0{,}40$ unidades.
    3. Log-log: $\%\Delta q \approx -0{,}7 \cdot 2 = -1{,}4\%$.
    4. $gl = n - k - 1 = 60 - 4 - 1 = 55$ (ver [¿De dónde sale $n - k - 1$?](../clases/clase7.md#de-donde-sale-n-k-1)).
    5. $t = (1{,}90 - 1{,}5)/0{,}25 = 1{,}6$. Siempre se resta el valor de la hipótesis nula.
    6. $dist_{m} = 1000\, dist_{km}$: el coeficiente se divide por 1000, su error estándar también, y el $t$ no cambia.

## 2 · Problema de interpretación (40 puntos)

Un estudio agrícola estimó, con datos de 210 parcelas, el rendimiento del trigo en función del número de riegos
por temporada ($riego$) y del fertilizante aplicado ($fert$, en decenas de kilos por hectárea):

$$
\hat{y} = 2{,}10 + 0{,}150\, riego + 0{,}060\, fert - 0{,}0015\, fert^2 + 0{,}010\, (riego \cdot fert)
$$

donde $y = \log(rend)$ y $rend$ es el rendimiento en quintales por hectárea.

**a) (10 pts)** Obtén una expresión para el efecto parcial de una decena de kilos más de fertilizante sobre el
rendimiento y calcúlalo, en porcentaje, para una parcela con 3 riegos y 10 decenas de kilos de fertilizante.

??? success "Pauta de a)"
    Derivando respecto de $fert$:

    $$
    \frac{\partial \log(rend)}{\partial fert} = 0{,}060 - 2(0{,}0015)\, fert + 0{,}010\, riego = 0{,}060 - 0{,}003\, fert + 0{,}010\, riego
    $$

    Con $riego = 3$ y $fert = 10$: $0{,}060 - 0{,}030 + 0{,}030 = 0{,}060$. Una decena de kilos más de fertilizante se
    asocia con un rendimiento **cerca de 6% mayor**, manteniendo constante el número de riegos.

    **Criterio:** 5 pts por la expresión (debe incluir los términos del cuadrado y de la interacción); 5 pts por el
    cálculo y la interpretación en %, con *ceteris paribus*.

    **Errores frecuentes:** olvidar el factor 2 del término cuadrático, u omitir la interacción en la derivada.

**b) (10 pts)** Para una parcela con 3 riegos, ¿a partir de qué cantidad de fertilizante una decena adicional
se asocia con un **menor** rendimiento? ¿Cómo cambia ese umbral si la parcela tiene más riegos? Explica la intuición.

??? success "Pauta de b)"
    El efecto se anula cuando $0{,}060 + 0{,}010\, riego = 0{,}003\, fert$. Con $riego = 3$:

    $$
    fert^* = \frac{0{,}060 + 0{,}030}{0{,}003} = 30 \text{ decenas de kilos (300 kg por hectárea)}.
    $$

    En general $fert^* = (0{,}060 + 0{,}010\, riego)/0{,}003$, **creciente** en el número de riegos: como el
    coeficiente de la interacción es positivo, el fertilizante rinde más cuando hay más agua, y el punto en que
    empieza a perjudicar se aleja.

    **Criterio:** 5 pts por el umbral; 5 pts por la dependencia de $riego$ y su intuición.

**c) (10 pts)** Calcula el efecto de un riego adicional para una parcela con 10 y con 25 decenas de kilos de
fertilizante. En ambos casos compara la aproximación con el cambio porcentual exacto ($e^{0{,}25} \approx 1{,}284$;
$e^{0{,}40} \approx 1{,}492$) y comenta cuándo es aceptable la aproximación.

??? success "Pauta de c)"
    $\dfrac{\partial \log(rend)}{\partial riego} = 0{,}150 + 0{,}010\, fert$.

    El cambio exacto es $100\,(e^{c} - 1)$, donde $c$ es el coeficiente:

    | $fert$ | $c$ | Aprox. | Exacto |
    |:---:|:---:|:---:|:---:|
    | 10 | $0{,}25$ | 25% | 28,4% |
    | 25 | $0{,}40$ | 40% | 49,2% |

    La aproximación viene de $\log(1 + z) \approx z$, que solo es buena para $z$ cercano a 0. Con un efecto de
    0,25 ya se equivoca en 3,4 puntos, y con 0,40 en más de 9: para efectos grandes hay que usar el cambio exacto.

    **Criterio:** 3 pts por cada caso; 4 pts por la comparación con el exacto y el comentario.

**d) (10 pts)** Se vuelve a estimar el modelo midiendo el fertilizante en **kilos** ($fert_{kg} = 10\, fert$) y el
rendimiento en **kilos por hectárea** ($rend_{kg} = 100\, rend$). Indica cómo cambia cada uno de los cinco
coeficientes, los estadísticos $t$ y el $R^2$. Justifica.

??? success "Pauta de d)"
    **Rendimiento:** $\log(100\, rend) = \log(100) + \log(rend)$. Solo cambia el intercepto:
    $2{,}10 + \log(100) \approx 2{,}10 + 4{,}605 = 6{,}705$. Las pendientes no cambian, porque con $y$ en logaritmo
    miden cambios porcentuales, que no dependen de las unidades.

    **Fertilizante:** si $fert = fert_{kg}/10$, cada término se reescribe en kilos:

    - $0{,}060\, fert = 0{,}006\, fert_{kg}$: el coeficiente se divide por 10.
    - $-0{,}0015\, fert^2 = -0{,}000015\, fert_{kg}^2$: se divide por $10^2 = 100$.
    - $0{,}010\, riego \cdot fert = 0{,}001\, riego \cdot fert_{kg}$: se divide por 10.
    - El coeficiente de $riego$ no cambia.

    Los errores estándar se reescalan en la misma proporción que cada coeficiente, así que los $t$ de las
    pendientes y el $R^2$ **no cambian**: el modelo explica lo mismo, solo en otras unidades.

    **Criterio:** 2 pts por el intercepto; 5 pts por los coeficientes de $fert$, $fert^2$ y la interacción;
    3 pts por los $t$ y el $R^2$.

    **Error frecuente:** dividir el coeficiente de $fert^2$ por 10 en vez de por 100.

## 3 · Problema de inferencia (40 puntos)

Con datos de $n = 40$ colegios se estimó la relación entre el puntaje promedio en una prueba estandarizada, el
gasto por alumno (en miles de pesos) y el tamaño promedio de los cursos (número de alumnos):

$$
\log(puntaje) = \beta_0 + \beta_1 \log(gasto) + \beta_2\, tamano + u
$$

| | Coeficiente | Error estándar |
|---|:---:|:---:|
| Constante | 2,850 | 0,610 |
| $\log(gasto)$ | 0,220 | 0,085 |
| $tamano$ | $-0{,}006$ | 0,004 |

Valores críticos de una $t$ con 37 grados de libertad, $P(T > c)$:

| $P(T > c)$ | 0,10 | 0,05 | 0,025 | 0,01 | 0,005 |
|---|:---:|:---:|:---:|:---:|:---:|
| $c$ | 1,305 | 1,687 | 2,026 | 2,431 | 2,715 |

!!! tip "Sugerencia"
    Antes de calcular, pide que alguien verifique en la pizarra que los grados de libertad son
    $40 - 2 - 1 = 37$, y que el resto diga qué tipo de interpretación tiene cada coeficiente (elasticidad o
    semielasticidad).

**a) (8 pts)** Interpreta $\hat{\beta}_1$ y $\hat{\beta}_2$ en términos de la pregunta.

??? success "Pauta de a)"
    $\hat{\beta}_1 = 0{,}220$ es una **elasticidad**: un aumento de 1% en el gasto por alumno se asocia con un
    puntaje 0,22% mayor (10% de gasto, 2,2% de puntaje), manteniendo constante el tamaño de los cursos.

    $\hat{\beta}_2 = -0{,}006$ es una **semielasticidad**: un alumno más por curso se asocia con un puntaje
    aproximadamente $100 \cdot 0{,}006 = 0{,}6\%$ menor, manteniendo constante el gasto.

    **Criterio:** 4 pts por cada una; descontar si no mencionan *ceteris paribus* o confunden elasticidad con
    semielasticidad.

**b) (10 pts)** ¿Es el gasto estadísticamente significativo al 5% y al 1% (dos colas)? Con esa información,
acota el valor-p. Explica cómo es posible que el tamaño de los cursos no sea significativo aunque su signo sea el esperado.

??? success "Pauta de b)"
    $t = 0{,}220/0{,}085 \approx 2{,}59$, con 37 grados de libertad.

    - **Al 5%** (dos colas, crítico 2,026): $2{,}59 > 2{,}026$, se rechaza $H_0: \beta_1 = 0$.
    - **Al 1%** (crítico 2,715): $2{,}59 < 2{,}715$, no se rechaza.
    - Por lo tanto, $0{,}01 < \text{valor-p} < 0{,}05$ (el valor exacto es cerca de 0,014).

    **Tamaño:** $t = -0{,}006/0{,}004 = -1{,}5$ y $|t| < 2{,}026$: no es significativo al 5%. El signo es el
    esperado, pero la estimación es **imprecisa** (error estándar grande respecto del coeficiente, con solo 40
    colegios). No significativo no quiere decir que el efecto sea cero, sino que la evidencia no alcanza.

    **Criterio:** 3 pts por los grados de libertad y el $t$; 4 pts por las decisiones y la cota del valor-p;
    3 pts por la explicación sobre el tamaño.

**c) (12 pts)** Un informe ministerial afirma que "aumentar 10% el gasto por alumno sube el puntaje en **al menos 4%**".
Plantea las hipótesis que permitirían **refutar** esa afirmación, calcula el estadístico y concluye al 5% y al 1%.

??? success "Pauta de c)"
    La afirmación es $\beta_1 \geq 0{,}40$ (10% de gasto por 0,40 da 4% de puntaje). Para refutarla, la afirmación
    va en la hipótesis nula y la alternativa apunta hacia abajo:

    $$
    H_0: \beta_1 = 0{,}40 \qquad H_1: \beta_1 < 0{,}40 \quad \text{(una cola)}
    $$

    $$
    t = \frac{0{,}220 - 0{,}40}{0{,}085} \approx -2{,}12
    $$

    - **Al 5%** (crítico $-1{,}687$): $-2{,}12 < -1{,}687$, **se rechaza** $H_0$; hay evidencia de que la elasticidad
      es menor que 0,40 y el informe exagera.
    - **Al 1%** (crítico $-2{,}431$): $-2{,}12 > -2{,}431$, **no se rechaza**. La evidencia en contra del informe es
      moderada (valor-p de una cola cerca de 0,02).

    **Criterio:** 3 pts por hipótesis bien orientadas; 3 pts por el estadístico; 3 pts por cada decisión. Un test
    de dos colas tiene como máximo 7 pts.

    **Errores frecuentes:** calcular $t = 0{,}220/0{,}085$ (eso testea $\beta_1 = 0$), o poner la afirmación en
    $H_1$, con lo que el test no puede refutarla.

**d) (10 pts)** Construye el intervalo de confianza de 95% para $\beta_1$. ¿Contiene el valor 0,40? Luego construye
la **cota superior de una cola** al 95% y al 99%, y explica por qué esas cotas, y no el intervalo de dos colas, son
las coherentes con el test de (c).

??? success "Pauta de d)"
    **IC de 95% (dos colas):** $0{,}220 \pm 2{,}026 \cdot 0{,}085 = 0{,}220 \pm 0{,}172 \Rightarrow (0{,}048;\ 0{,}392)$.
    No contiene 0,40 ni 0.

    El IC de dos colas al 95% equivale al test **bilateral** al 5% (2,5% en cada cola). El test de (c) es
    **unilateral**: deja todo el 5% en una cola, así que el intervalo coherente es una cota superior:

    - **95%:** $0{,}220 + 1{,}687 \cdot 0{,}085 \approx 0{,}363 < 0{,}40$, coherente con rechazar al 5% en (c).
    - **99%:** $0{,}220 + 2{,}431 \cdot 0{,}085 \approx 0{,}427 > 0{,}40$, coherente con no rechazar al 1%.

    Regla: se rechaza $H_0: \beta_1 = a$ contra $H_1: \beta_1 < a$ si y solo si $a$ queda por encima de la cota
    superior de una cola.

    **Criterio:** 5 pts por el IC de dos colas; 5 pts por las cotas y la explicación.

## 4 · Comentes (20 puntos)

Responde **Verdadero, Falso o Incierto**. El puntaje depende solo de la justificación.

**a) (5 pts)** "Si los errores del modelo no son normales, el test $t$ es inválido aunque la muestra tenga 2.000 observaciones."

??? success "Pauta de a)"
    **Falso.** Sin normalidad, el estadístico no sigue exactamente una $t_{n-k-1}$ en muestras finitas, pero con
    $n$ grande se distribuye **aproximadamente** normal estándar (teorema del límite central). Con 2.000
    observaciones el test $t$ es aproximadamente válido. La normalidad importa sobre todo con muestras pequeñas.

**b) (5 pts)** "Si se rechaza $H_0: \beta_j = 0$ al 5% con un test de dos colas, entonces también se rechaza al 5% con un test de una cola contra $H_1: \beta_j > 0$."

??? success "Pauta de b)"
    **Incierto.** Depende del signo de $\hat{\beta}_j$. Si $t > 0$, el valor-p de una cola es la mitad del de dos
    colas y se rechaza también. Si $t < 0$, por ejemplo $t = -2{,}5$, se rechaza en dos colas pero **no** contra
    $H_1: \beta_j > 0$: el estimador apunta en la dirección contraria a la alternativa.

**c) (5 pts)** "En $\log(y) = \beta_0 + \beta_1 x + u$, $\beta_1$ mide el cambio porcentual de $y$ cuando $x$ aumenta en 1%."

??? success "Pauta de c)"
    **Falso.** Es un modelo log-nivel: $100\,\beta_1$ es el cambio porcentual (aproximado) de $y$ cuando $x$ aumenta
    en **una unidad**. El cambio de $y$ ante un 1% de $x$ es la elasticidad, que corresponde a un modelo log-log,
    $\log(y) = \beta_0 + \beta_1 \log(x) + u$.

**d) (5 pts)** "Un intervalo de confianza de 90% es mejor que uno de 95%, porque es más angosto y por lo tanto más preciso."

??? success "Pauta de d)"
    **Falso (o Incierto, si se argumenta el trade-off).** Con los mismos datos, el intervalo de 90% es más angosto
    solo porque **acepta más riesgo**: en el 10% de las muestras no contiene al verdadero $\beta_j$, frente al 5%
    del de 95%. No hay más información; hay menos confianza. Para un intervalo más angosto **con la misma
    confianza** se necesita reducir el error estándar, por ejemplo con más datos.

## ✅ Errores frecuentes para el cierre

!!! warning "Lo que más se equivoca en este tipo de ejercicios"
    - Derivar mal los términos cuadráticos ($\partial(\beta x^2)/\partial x = 2\beta x$) u olvidar la interacción en el efecto parcial.
    - Usar $100\,\hat{\beta}\,\Delta x$ cuando el efecto es grande, en lugar de $100\,(e^{\hat{\beta}\Delta x} - 1)$.
    - Al reescalar $x^2$, dividir por la constante en vez de por su cuadrado.
    - Calcular $t = \hat{\beta}/se$ cuando la hipótesis nula no es cero: siempre $t = (\hat{\beta} - a)/se$.
    - Poner en $H_1$ la afirmación que se quiere refutar, o usar valores críticos de dos colas en un test de una cola.
    - Concluir "no tiene efecto" cuando un coeficiente no es significativo.

## 📐 Formulario mínimo

??? note "Ver fórmulas"
    - **Logaritmos:** log-nivel $\%\Delta y \approx 100\,\beta\,\Delta x$ (exacto: $100\,(e^{\beta\Delta x} - 1)$); log-log $\%\Delta y \approx \beta\,\%\Delta x$; nivel-log $\Delta y \approx (\beta/100)\,\%\Delta x$
    - **Cuadrática:** $\partial \hat{y}/\partial x = \hat{\beta}_1 + 2\hat{\beta}_2 x$; punto de quiebre $x^* = -\hat{\beta}_1/(2\hat{\beta}_2)$
    - **Interacción:** en $y = \beta_0 + \beta_1 x + \beta_2 z + \beta_3 xz$, $\partial y/\partial x = \beta_1 + \beta_3 z$
    - **Reescalar:** $x \to c\,x$ divide el coeficiente de $x$ por $c$ y el de $x^2$ por $c^2$; con $y$ en logaritmo, $y \to c\,y$ solo suma $\log(c)$ al intercepto
    - **Test $t$:** $t = (\hat{\beta}_j - a_j)/se(\hat{\beta}_j) \sim t_{n-k-1}$
    - **IC de dos colas:** $\hat{\beta}_j \pm c_{\alpha/2}\, se(\hat{\beta}_j)$; **cota superior de una cola:** $\hat{\beta}_j + c_{\alpha}\, se(\hat{\beta}_j)$

Para seguir practicando: [Práctica · Segundo bloque](../practica/bloque2.md), con talleres de logaritmos,
cuadráticas, interacciones, test $t$ y valores-p, y los [desafíos teóricos de la Clase 7](../clases/clase7.md#desafios-teoricos).
