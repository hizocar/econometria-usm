# Clase 1 · Introducción y repaso de estadística

<div class="usm-session-meta">
<span>📅 Viernes 16 de octubre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Contenidos 1, 2 y 3 del programa</span>
</div>

## 🎯 Objetivos de la sesión

- Entender qué es la econometría y qué tipo de preguntas permite responder.
- Distinguir **correlación** de **causalidad** y el rol del supuesto *ceteris paribus*.
- Reconocer los tipos de datos (experimentales vs. observacionales; corte transversal, series de
  tiempo y panel).
- Repasar muestreo, el **Teorema Central del Límite** e **intervalos de confianza** para medias,
  proporciones y diferencias de medias.

---

## 🗓️ Agenda

| Hora | Bloque |
|---|---|
| 18:40 – 19:00 | Presentación del curso: programa, evaluaciones, cátedra + taller, trabajo práctico |
| 19:00 – 19:30 | ¿Qué es la econometría? Método econométrico, correlación vs. causalidad |
| 19:30 – 19:55 | Tipos de datos |
| 19:55 – 20:05 | *Receso* |
| 20:05 – 20:30 | Muestreo: población, parámetro, estadístico y métodos de muestreo |
| 20:30 – 21:10 | Repaso de inferencia: TCL e intervalos de confianza |
| 21:10 – 21:25 | Ejercicios rápidos y cierre |

---

## 1. ¿Qué es la econometría?

La econometría es una disciplina que emplea la **teoría económica** y **métodos estadísticos** para
contrastar teorías, pronosticar variables y evaluar políticas públicas utilizando bases de datos.
Es una aplicación del método científico en economía: nos permite **refutar hipótesis económicas**.

Nos permite contestar preguntas como:

1. ¿Cuál es la brecha salarial por género?
2. ¿Cuál es el efecto de haber completado la universidad en el salario?

La econometría moderna se enfoca en tres tipos de preguntas:

- **Describir:** estimar cómo la esperanza condicional de una variable depende de otra.
- **Identificar causas:** estimar el impacto causal de una variable sobre otra.
- **Predecir:** pronosticar el comportamiento de una variable hacia el futuro.

### El método econométrico

1. **Definir el objetivo:** ¿qué quiero estudiar?
2. **Modelo económico:** explica el comportamiento de una variable en función de otras,
   $Y = f(x_1, x_2, \dots, x_k)$.
    - *Ejemplo 1 — función de producción:* $Y = A K^{\alpha} L^{\beta}$
    - *Ejemplo 2 — retornos a la educación:* $\text{salario} = f(\text{educ}, \text{experiencia}, \text{ingfamiliar}, \text{habilidad})$
3. **Modelo econométrico:** permite cuantificar, contrastar y evaluar el modelo económico.
    - Especificar la forma de $f(\cdot)$.
    - Las variables económicas son aleatorias, así que incorporamos un **término de error**:
      $y = f(x_1, x_2, \dots, x_k) + u$
    - Conseguir los **datos**.

### Correlación no es causalidad

Muchas veces nos interesa el **efecto causal** de una variable sobre otra. El concepto clave es
***ceteris paribus***: el efecto de $X$ sobre $Y$ **manteniendo todos los demás factores relevantes
constantes**. En ciencias sociales esto es muy difícil en la práctica; durante el curso veremos los
supuestos y técnicas necesarios para lograrlo.

Una **correlación espuria** es una relación matemática entre variables que no tienen una relación
lógica entre sí.

!!! question "Para discutir"
    En una base de personas de 35 años en Chile, quienes terminaron la universidad ganan **30% más**
    que quienes no la terminaron. ¿Podemos concluir que ir a la universidad **causa** un aumento del
    ingreso?

??? success "Respuesta"
    **No.** Ir a la universidad está asociado con muchas otras características que también afectan
    el ingreso: la habilidad, el ingreso de los padres, las redes, etc. El 30% mezcla el efecto de
    la universidad con el de todas esas diferencias. En la [Clase 3](clase3.md) le pondremos nombre
    a ese problema: **sesgo de selección**.

### La econometría como herramienta aplicada

- **¿Cómo solucionamos los parásitos intestinales en África?** Miguel y Kremer (2004), *Worms*:
  repartir píldoras antiparasitarias en colegios mejora la salud y reduce el ausentismo escolar, no
  solo de los tratados sino también de sus vecinos. Gracias a estos estudios, la iniciativa
  *Deworm the World* ha movilizado enormes recursos para esta política. 📖 **Es la lectura del
  Certamen 1.**
- **¿Pueden las consultoras de gestión mejorar la productividad de las firmas?** Bloom et al.
  (2013), *Does Management Matter? Evidence from India*: muestra que sí, y lo cuantifica
  ([J-PAL](https://www.povertyactionlab.org/evaluation/increasing-firm-productivity-through-management-consulting-services-india)).

---

## 2. Tipos de datos

**Según cómo se asigna la "exposición" (el tratamiento):**

| Tipo | ¿Quién decide la exposición? |
|---|---|
| **Experimental** | El investigador asigna la exposición **en forma aleatoria**. |
| **Pseudo-experimental** | El investigador controla la exposición, pero **no** la asigna aleatoriamente. |
| **Observacional** (no experimental) | El investigador **no controla** la exposición: depende de variables que no maneja. |

En economía rara vez se usan datos experimentales: son caros y pueden presentar problemas éticos.

**Según su estructura:**

=== "Corte transversal"

    Muestra de individuos, hogares, empresas, regiones o países **en un momento dado**. Se asume
    que los datos se obtuvieron por **muestreo aleatorio** desde la población. Diferencias
    temporales menores en la recolección se ignoran.

    *Ej.: encuesta CASEN 2022 — ingreso, educación y edad de cada persona encuestada.*

=== "Series de tiempo"

    Observaciones de una o más variables **a lo largo del tiempo** (diaria, mensual, trimestral,
    anual…). Los eventos pasados influyen en los futuros y los rezagos son frecuentes: a diferencia
    del corte transversal, **las observaciones no pueden asumirse independientes**.

    *Ej.: IPC mensual, precio del dólar, ventas de automóviles.*

=== "Panel (longitudinales)"

    Una serie de tiempo **para cada miembro** del conjunto de datos: los **mismos** individuos,
    firmas o países se siguen por varios períodos.

    *Ej.: 10 años de salario, educación y empleo de un grupo de personas.*

    **Ventajas:** permite controlar características no observadas que no cambian en el tiempo,
    facilita la inferencia causal y permite estudiar efectos rezagados.

<div class="econ-quiz">
<p class="econ-quiz-q">Tienes el PIB trimestral de Chile, Perú y Colombia entre 2000 y 2024. ¿Qué tipo de datos son?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">Corte transversal</button>
<button class="econ-quiz-opt">Serie de tiempo</button>
<button class="econ-quiz-opt" data-correct>Panel</button>
</div>
<p class="econ-quiz-fb">✅ Es un <strong>panel</strong>: las mismas unidades (3 países) observadas en muchos períodos. Si tuvieras solo Chile, sería una serie de tiempo; si fuera solo el año 2024 para muchos países, un corte transversal.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Una empresa sortea qué sucursales reciben un nuevo sistema de incentivos y compara las ventas. ¿Qué tipo de datos genera?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Experimentales</button>
<button class="econ-quiz-opt">Pseudo-experimentales</button>
<button class="econ-quiz-opt">Observacionales</button>
</div>
<p class="econ-quiz-fb">✅ La exposición la decide quien investiga <strong>y al azar</strong>: es un experimento. Si el gerente eligiera las sucursales "más motivadas", sería pseudo-experimental; si cada sucursal decidiera adoptarlo, observacional.</p>
</div>

---

## 3. Muestreo

Los datos se obtienen sobre conjuntos de individuos u objetos de los que queremos conocer alguna
característica. Cada individuo es una **unidad de observación** y la totalidad de ellas es la
**población**. El **muestreo** es el conjunto de métodos para obtener una **muestra** de la
población con el fin de hacer inferencias sobre ella.

Una muestra es **representativa** si toda unidad de la población puede aparecer en ella con una
probabilidad conocida.

**¿Por qué muestrear?** Porque es físicamente imposible revisar todos los elementos, porque
estudiar a toda la población es muy costoso, y porque los resultados del muestreo suelen ser
adecuados.

**Objetivo del muestreo: estimar los parámetros de la población.**

| Concepto | Definición | Ejemplo |
|---|---|---|
| **Variable** | Lo que se mide en cada unidad | Ingreso, años de educación |
| **Parámetro** | Valor numérico que describe a **toda la población** (normalmente desconocido) | $\mu$, $\sigma$, $\beta$ |
| **Estadístico** | Valor calculado **con la muestra**, que usamos para estimar el parámetro | $\bar{x}$, $s$, $\hat{\beta}$ |

### Métodos de muestreo aleatorio

- **Aleatorio simple:** cada elemento tiene la misma probabilidad de ser incluido.
- **Sistemático:** se ordena la población, se elige un inicio al azar y luego cada $k$-ésimo
  elemento. Técnicamente no es del todo aleatorio: solo la selección del primero lo es.
- **Estratificado:** se divide la población en **estratos** (internamente **homogéneos**) y se
  sortea una muestra **dentro de cada uno**.
- **Por conglomerados:** se divide la población en grupos (p. ej., geográficos) internamente
  **heterogéneos**, se sortean **grupos** y se muestrea dentro de los grupos elegidos.

En el **muestreo no probabilístico**, la inclusión depende del juicio de quien selecciona (p. ej.,
encuestar a quienes pasan por un mall): no permite conocer la probabilidad de selección.

<div class="econ-widget" data-widget="muestreo"></div>

!!! note "Estadística descriptiva vs. inferencial"
    - **Descriptiva:** resume la muestra con tablas, gráficos y estadísticos; sus conclusiones valen
      solo para la muestra.
    - **Inferencial:** a partir de la muestra obtiene conclusiones **estadísticamente válidas para
      toda la población**. Requiere supuestos sobre la población y usa la teoría de probabilidades.

---

## 4. Repaso de inferencia

### 4.1 Teorema Central del Límite (TCL)

La **distribución muestral del promedio** es la distribución de todos los posibles promedios de
muestras de tamaño $n$ extraídas de una población. Si la población tiene media $\mu$ y varianza
$\sigma^2$, entonces, para $n$ suficientemente grande:

$$
\bar{X} \overset{\text{aprox.}}{\sim} N\!\left(\mu, \frac{\sigma^2}{n}\right)
\qquad\Longleftrightarrow\qquad
\frac{\bar{X}-\mu}{\sigma/\sqrt{n}} \overset{\text{aprox.}}{\sim} N(0,1)
$$

**Supuestos:** observaciones i.i.d. (muestreo aleatorio), media y varianza finitas, y un tamaño
muestral adecuado (regla de dedo): $n \geq 30$ si la población es simétrica, $n \geq 50$ si es
asimétrica y $n \geq 100$ si es muy asimétrica.

<div class="econ-widget" data-widget="tcl"></div>

### 4.2 Intervalo de confianza para la media ($\sigma$ conocida)

En lugar de un único valor, entregamos un **rango** donde es plausible que se encuentre el
parámetro. Su ventaja: comunica la **precisión** de la estimación. El nivel de confianza
$(1-\alpha)$ se decide antes de construirlo.

$$
IC_{(1-\alpha)100\%}(\mu) = \bar{x} \pm z_{\alpha/2}\,\frac{\sigma}{\sqrt{n}}
$$

Válido si $n \geq 30$, o si $n < 30$ pero la población es normal. Valores usuales:
$z_{0.05}=1.645$ (90%), $z_{0.025}=1.96$ (95%) y $z_{0.005}=2.576$ (99%).

!!! example "Ejemplo 1 — Ventas mensuales"
    Una tienda quiere estimar las ventas mensuales promedio de un producto (ventas estables durante
    el año). Con una muestra de $n = 36$ meses se obtuvo $\bar{x} = 200$. Suponga $\sigma = 60$
    conocida. Construya un IC de 95% para $\mu$.

??? success "Solución"
    Como $n = 36 > 30$ aplica el TCL: $\dfrac{\sigma}{\sqrt{n}} = \dfrac{60}{6} = 10$.

    $$IC_{95\%} = 200 \pm 1.96 \cdot 10 = (180.4\,;\,219.6)$$

    Con 99%: $200 \pm 2.576 \cdot 10 = (174.3\,;\,225.7)$. **Más confianza ⇒ intervalo más ancho.**

<div class="econ-widget" data-widget="ic-cobertura"></div>

**Confianza vs. precisión.** El **error absoluto** $E = z_{\alpha/2}\,\sigma/\sqrt{n}$ es la máxima
distancia (con la confianza elegida) entre $\bar{x}$ y $\mu$. Para una misma muestra, si aumenta la
confiabilidad $(1-\alpha)$, disminuye la precisión (aumenta $E$).

**Tamaño muestral.** Fijando $E$ y $\alpha$ antes de muestrear:

$$
n = \left(\frac{z_{\alpha/2}\,\sigma}{E}\right)^2 \quad \text{(redondeando hacia arriba)}
$$

### 4.3 Intervalo de confianza para una proporción

Sea $p$ la proporción de "éxitos" en la población (fallas, enfermos, aprobados…). El estimador
$\hat{p} = X/n$ cumple, si $n \geq 30$, $np > 5$ y $n(1-p) > 5$:

$$
\hat{p} \overset{\text{aprox.}}{\sim} N\!\left(p, \frac{p(1-p)}{n}\right)
\qquad\Rightarrow\qquad
IC_{(1-\alpha)100\%}(p) = \hat{p} \pm z_{\alpha/2}\sqrt{\frac{\hat{p}(1-\hat{p})}{n}}
$$

!!! example "Ejemplo 2 — Productos defectuosos"
    Un proveedor asegura que el 5% de sus productos son defectuosos. La empresa compradora revisa
    200 unidades y encuentra 19 defectuosas. ¿Es coherente con lo que afirma el proveedor? (95%)

??? success "Solución"
    $\hat{p} = 19/200 = 0.095$

    $$IC_{95\%} = 0.095 \pm 1.96\sqrt{\frac{0.095 \cdot 0.905}{200}} = (0.0543\,;\,0.1356)$$

    El 5% que afirma el proveedor **no está** dentro del intervalo: la evidencia no es coherente con
    su afirmación.

**Tamaño muestral para proporciones**, con una estimación previa $p^*$ (de una muestra piloto, o
$p^* = 0.5$ en el peor escenario):

$$
n = \frac{z_{\alpha/2}^2\, p^*(1-p^*)}{E^2}
$$

!!! example "Ejemplo 3 — Chips"
    Se quiere un IC de 95% para la proporción de chips aceptables cuya **longitud** no exceda 0.05
    (es decir, $E = 0.025$). En una muestra piloto, 26 de 30 chips fueron aceptables. ¿Qué tamaño
    muestral se necesita?

??? success "Solución"
    $p^* = 26/30 = 0.8667$

    $$n = \frac{1.96^2 \cdot 0.8667 \cdot 0.1333}{0.025^2} = 710.12 \;\Rightarrow\; n = 711 \text{ chips}$$

### 4.4 Intervalo de confianza para una diferencia de medias

Con dos muestras **independientes** y varianzas conocidas (o muestras grandes):

$$
IC_{(1-\alpha)100\%}(\mu_x - \mu_y) = (\bar{x} - \bar{y}) \pm z_{\alpha/2}\sqrt{\frac{\sigma_x^2}{n_x} + \frac{\sigma_y^2}{n_y}}
$$

Si el **cero cae fuera** del intervalo, los datos dan evidencia de que las medias son distintas.

!!! example "Ejemplo 4 — Salarios de egresados"
    Ingeniería industrial: $\bar{x} = 800\,000$, $\sigma_x = 60\,000$, $n_x = 144$.
    Arquitectura: $\bar{y} = 680\,000$, $\sigma_y = 50\,000$, $n_y = 121$. IC de 95% para
    $\mu_x - \mu_y$.

??? success "Solución"
    $$IC_{95\%} = 120\,000 \pm 1.96\sqrt{\frac{60\,000^2}{144} + \frac{50\,000^2}{121}} = (106\,756\,;\,133\,244)$$

    El intervalo **no contiene al cero**: hay evidencia de que el salario promedio de los egresados
    de ingeniería industrial es mayor que el de arquitectura.

<div class="econ-widget" data-widget="ic-calc"></div>

---

## ✅ Autoevaluación

<div class="econ-quiz">
<p class="econ-quiz-q">Construiste un IC de 95% para μ y obtuviste (180.4 ; 219.6). ¿Cuál interpretación es correcta?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">Hay 95% de probabilidad de que μ esté entre 180.4 y 219.6.</button>
<button class="econ-quiz-opt" data-correct>Si repitiéramos el muestreo muchas veces, el 95% de los intervalos construidos así contendría a μ.</button>
<button class="econ-quiz-opt">El 95% de los meses tiene ventas entre 180.4 y 219.6.</button>
</div>
<p class="econ-quiz-fb">✅ μ es fijo: un intervalo ya calculado lo contiene o no. El 95% es una propiedad del <strong>procedimiento</strong> (revisa el simulador de cobertura). La tercera opción confunde la distribución de x̄ con la de las ventas individuales.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Si cuadruplicas el tamaño muestral n (manteniendo σ y la confianza), el margen de error E…</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">…se reduce a la cuarta parte.</button>
<button class="econ-quiz-opt" data-correct>…se reduce a la mitad.</button>
<button class="econ-quiz-opt">…no cambia.</button>
</div>
<p class="econ-quiz-fb">✅ E = z·σ/√n, y √(4n) = 2√n. Para reducir el error a la mitad necesitas cuatro veces más datos.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Quieres estimar el ingreso promedio en Santiago y la población se divide en comunas muy distintas entre sí, pero cada una bastante homogénea por dentro. ¿Qué método da estimaciones más precisas para un mismo n?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Estratificado por comuna</button>
<button class="econ-quiz-opt">Por conglomerados (sortear algunas comunas completas)</button>
<button class="econ-quiz-opt">No probabilístico, en lugares concurridos</button>
</div>
<p class="econ-quiz-fb">✅ Si los grupos son homogéneos por dentro y distintos entre sí, actúan como <strong>estratos</strong>: muestrear en todos reduce la varianza del estimador. Sortear solo algunas comunas (conglomerados) aumentaría la varianza.</p>
</div>

---

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 1 (*La naturaleza de la econometría y los datos económicos*) y apéndice C
  (repaso de estadística).
- Próxima clase: **Regresión lineal simple** — ¿cómo estimamos la relación entre educación y
  salario con una recta?

??? info "Material complementario"
    - [Notebook en Colab con los ejemplos de intervalos de confianza](https://colab.research.google.com/drive/14izMe-eFdclOhTeS3hiLE_0h_4E3Jkps?usp=sharing)
    - [Planilla Excel con los cálculos](https://docs.google.com/spreadsheets/d/1xAh-TitIncHH8uwblbpvgjYma7B6gUTWlk8C2z1BquQ/edit?usp=sharing)
