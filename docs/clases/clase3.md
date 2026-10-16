# Clase 3 · Causalidad y variable omitida

<div class="usm-session-meta">
<span>📅 Viernes 30 de octubre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Contenidos 4 y 5 · De la correlación a la causalidad</span>
</div>

## 🎯 Objetivos de la sesión

- Distinguir entre **esperanza condicional** (lo que describe una regresión) y **efecto causal**.
- Usar el modelo de **outcomes potenciales** de Rubin para definir el ATE y el ATT.
- Descomponer una diferencia de promedios en **efecto causal + sesgo de selección**.
- Entender por qué la **aleatorización** elimina el sesgo de selección.
- Derivar el **sesgo por variable omitida** y predecir su signo.

---

## 🗓️ Agenda

| Hora | Bloque |
|---|---|
| 18:40 – 19:00 | Esperanza condicional vs. causalidad: el contrafactual |
| 19:00 – 19:35 | Modelo de outcomes potenciales: ATE y ATT — *simulador* |
| 19:35 – 19:55 | Sesgo de selección |
| 19:55 – 20:05 | *Receso* |
| 20:05 – 20:25 | Aleatorización — *simulador* |
| 20:25 – 21:00 | Sesgo por variable omitida: derivación y signo — *simulador* |
| 21:00 – 21:15 | Ejemplo: fumar, edad y la paradoja de los controles |
| 21:15 – 21:25 | Conclusiones y lectura del Certamen 1 |

---

## 1. Esperanza condicional vs. causalidad

Hasta ahora, la regresión nos entrega la **esperanza condicional** de una variable dada otra. Eso
permite describir muchas realidades: ¿las personas con más educación ganan más? ¿Estudiar economía
está asociado a un mayor sueldo?

Pero, **¿son causales esas relaciones?** ¿Es la educación lo que aumenta el salario, o quienes se
educan más ganan más por otros motivos?

### El contrafactual

Para pensar en causalidad hay que imaginar un **mundo contrafactual**: ¿qué habría pasado con las
personas que fueron a la universidad si **no** hubieran ido?

!!! abstract "Problema fundamental de la inferencia causal"
    No podemos calcular directamente el impacto causal de un tratamiento sobre un individuo $i$,
    porque **nunca lo observamos en los dos estados** (con y sin tratamiento) a la vez.

    **Contrafactual:** el resultado que los mismos participantes de un programa habrían obtenido en
    el caso hipotético de no haber participado.

---

## 2. El modelo de outcomes potenciales (Rubin)

Queremos medir el impacto de un **tratamiento** binario (recibirlo o no) sobre $Y$: un subsidio,
una beca, una vacuna, ir a la universidad… Definimos:

- $Y_i$: outcome **observado** de la persona $i$.
- $T_i \in \{0, 1\}$: vale 1 si fue tratada y 0 si no.
- $Y_i^{T}$: outcome **potencial** si es tratada.
- $Y_i^{NT}$: outcome **potencial** si **no** es tratada.

El efecto del tratamiento para $i$ es $Y_i^{T} - Y_i^{NT}$, pero **solo observamos uno de los dos**:

$$
Y_i = T_i\,Y_i^{T} + (1 - T_i)\,Y_i^{NT}
$$

| Parámetro | Definición | ¿Observable? |
|---|---|---|
| **ATE** (*Average Treatment Effect*) | $E\left[Y_i^{T} - Y_i^{NT}\right]$ | No: a cada $i$ lo vemos en un solo estado |
| **ATT** (*Average Treatment effect on the Treated*) | $E\left[Y_i^{T} - Y_i^{NT} \mid T_i = 1\right]$ | No: $E[Y_i^{NT} \mid T_i=1]$ no se observa |

<div class="econ-widget" data-widget="po"></div>

Como no podemos comparar a las mismas personas en el mundo alternativo, **el truco está en
encontrar un grupo de comparación** que habría sido similar al grupo tratado en ausencia del
tratamiento.

---

## 3. Sesgo de selección

Lo que **sí** podemos calcular es la diferencia de promedios entre tratados y no tratados — que es
exactamente lo que estima MCO con una variable binaria:

$$
\beta_1 = E\left[Y_i \mid T_i = 1\right] - E\left[Y_i \mid T_i = 0\right]
$$

¿Es esto el efecto causal? Sumando y restando $E\left[Y_i^{NT} \mid T_i=1\right]$:

$$
\beta_1 = \underbrace{E\left[Y_i^{T} - Y_i^{NT} \mid T_i=1\right]}_{\text{ATT}}
+ \underbrace{E\left[Y_i^{NT} \mid T_i=1\right] - E\left[Y_i^{NT} \mid T_i=0\right]}_{\text{sesgo de selección}}
$$

El **sesgo de selección** surge porque el grupo tratado **ya era distinto** del grupo de control: aun
en un mundo en que nadie recibiera el tratamiento, sus resultados promedio habrían diferido.

!!! example "Ejemplo: universidad y salario"
    La decisión de ir a la universidad es voluntaria y depende de intereses, recursos económicos y
    oportunidades previas. Quienes van probablemente tienen características que, **incluso sin ir a
    la universidad**, les darían mayores salarios. Por eso no son un buen contrafactual entre sí.

!!! question "Ejemplo: alarmas en las casas"
    Queremos saber si las alarmas reducen los robos, pero cada hogar decide si instalar una.

    1. ¿En qué podrían diferir los hogares que instalan alarmas de los que no?
    2. ¿Qué signo tendría el sesgo de selección?
    3. Si comparamos los robos en casas con y sin alarma, ¿obtenemos el efecto causal?

??? success "Una posible respuesta"
    Los hogares que instalan alarmas suelen ser **más ricos** y vivir en **zonas con más delitos**
    (por eso la compran). Si en esas zonas hay más robos aun sin alarma, entonces
    $E[Y^{NT} \mid T=1] > E[Y^{NT} \mid T=0]$ (con $Y$ = robos): el sesgo es **positivo** y la
    comparación ingenua **subestima** el efecto protector de la alarma; incluso podría mostrar que
    las casas con alarma tienen *más* robos.

---

## 4. Aleatorización

¿Qué supuesto necesitamos para que no haya sesgo de selección? Que los **outcomes potenciales sean
independientes del tratamiento**. **Aleatorizar** quién recibe el tratamiento resuelve el problema:
en promedio, quienes lo reciben habrían sido iguales a quienes no lo reciben.

$$
E\left[Y_i^{NT} \mid T_i=1\right] = E\left[Y_i^{NT} \mid T_i=0\right]
\quad\Rightarrow\quad \text{sesgo de selección} = 0
\quad\Rightarrow\quad \beta_1 = \text{ATT} = \text{ATE}
$$

Es el estándar en medicina para evaluar drogas y vacunas, y cada vez más usado en políticas
públicas y en empresas (los *tests A/B*).

<div class="econ-widget" data-widget="seleccion"></div>

---

## 5. Sesgo por variable omitida

Volvamos a la regresión $y_i = \alpha + \beta x_i + \varepsilon_i$. El supuesto clave para que
$\beta$ sea el efecto causal es

$$
E[\varepsilon \mid x] = 0
$$

es decir, que **nada de lo que está en el error se correlacione con $x$**. Si omitimos una variable
que afecta a $y$ **y** se relaciona con $x$, ese supuesto falla y aparece sesgo.

!!! example "Consultoría y productividad"
    $\text{productividad}_i = \alpha + \beta\,\text{consultoría}_i + \varepsilon_i$. Solo las
    empresas grandes pueden pagar una consultoría, y el **tamaño** también afecta la productividad.
    Al quedar el tamaño en el error, $\hat{\beta}$ está sesgado.

### Derivación

Suponga que el modelo **verdadero** es

$$
y = \alpha + \beta_1 x_1 + \beta_2 x_2 + u, \qquad E[u \mid x_1, x_2] = 0 \tag{A}
$$

y que $x_2$ se relaciona con $x_1$ según

$$
x_2 = \delta_0 + \delta_1 x_1 + v \tag{B}
$$

Si no observamos $x_2$ y estimamos la regresión **corta** $y = \tilde{\alpha} + \tilde{\beta}_1 x_1 + \epsilon$,
el error es $\epsilon = \beta_2 x_2 + u$, que está correlacionado con $x_1$. Reemplazando (B) en (A):

$$
y = (\alpha + \beta_2 \delta_0) + (\beta_1 + \beta_2 \delta_1)\,x_1 + (u + \beta_2 v)
$$

$$
\boxed{\;\tilde{\beta}_1 = \beta_1 + \underbrace{\beta_2\,\delta_1}_{\text{sesgo}}\;}
$$

Capturamos el efecto causal $\beta_1$ **más un sesgo** $\beta_2 \delta_1$. El sesgo es cero solo si
$\beta_2 = 0$ (la omitida no afecta a $y$) **o** $\delta_1 = 0$ (la omitida no se relaciona con
$x_1$).

### Dirección del sesgo

| | $\beta_2 > 0$ | $\beta_2 < 0$ |
|---|:-:|:-:|
| $\delta_1 > 0$ | **Sesgo positivo** (sobreestima) | Sesgo negativo (subestima) |
| $\delta_1 < 0$ | Sesgo negativo (subestima) | **Sesgo positivo** (sobreestima) |

**Intuición** (educación y salario, omitiendo la habilidad): las personas más hábiles estudian más
($\delta_1 > 0$) y la habilidad aumenta el salario ($\beta_2 > 0$). Al omitirla, el coeficiente de
educación captura el efecto causal **y además** el hecho de que quienes estudian más son más hábiles
y ganan más por eso: $\tilde{\beta}_1$ **sobreestima** el retorno a la educación.

<div class="econ-widget" data-widget="ovb"></div>

---

## 6. Solución: controlar por la variable omitida

Si observamos $x_2$, podemos **incluirla como control**: volvemos a $E[u \mid x_1, x_2] = 0$ porque
ahora mantenemos $x_2$ constante (*ceteris paribus*). Esto resuelve el problema **si conocemos el
modelo verdadero** y $x_2$ era lo único omitido; en la práctica, muchas veces hay otras variables
omitidas que no observamos.

### Ejemplo: fumar y mortalidad (Appleton, French y Vanderpump, 1996)

=== "Regresión corta: y ~ smoke"

    ![Regresión de y sobre smoke](../images/reg_smoke.jpeg)

    $\hat{\tilde{\beta}}_1 = -1.82$: ¡fumar aparece asociado con un **mejor** resultado! ¿Qué
    variable estamos omitiendo?

=== "Regresión larga: y ~ smoke + age"

    ![Regresión de y sobre smoke y age](../images/reg_smoke_age.jpeg)

    Al controlar por **edad**: $\hat{\beta}_1 = 0.94$ y $\hat{\beta}_2 = 0.98$.

??? success "¿Qué nos dice esto sobre la relación entre edad y fumar?"
    De $\tilde{\beta}_1 = \beta_1 + \beta_2 \delta_1$:

    $$-1.82 = 0.94 + 0.98\,\delta_1 \;\Rightarrow\; \delta_1 \approx -2.8 < 0$$

    La relación es **negativa**: las personas mayores fuman menos y, por su edad, tienen peor
    resultado. Al omitir la edad, fumar "hereda" parte del efecto de ser joven. *Prueba el preset
    "Fumar y edad" en el simulador de arriba.*

### ¿Más variables siempre es mejor?

Un modelo está **sobreespecificado** cuando incluye variables que no forman parte del modelo
poblacional. Incluir variables irrelevantes **no sesga** los estimadores, pero **aumenta su
varianza**. Y agregar controles cambia la interpretación del coeficiente de interés.

### ¿Y si hay aleatorización?

Si $x_1$ (o $T_i$) se asigna **al azar**, se garantiza $E[\varepsilon_i \mid x_i] = 0$: la correlación
entre el tratamiento y **cualquier** variable omitida es cero ($\delta_1 = 0$). No necesitamos
incluir otras variables para evitar sesgo (aunque pueden mejorar la precisión).

---

## 🧠 Conclusiones

- Incluir variables en un modelo **cambia la interpretación** del coeficiente de interés.
- El efecto de excluir una variable relevante depende de **su correlación con la variable de
  interés** ($\delta_1$) y de **su efecto sobre el outcome** ($\beta_2$).
- El supuesto clave de MCO para que no haya sesgo es $E[\epsilon \mid X] = 0$.
- Rara vez tenemos **todas** las variables que determinan quién recibe el tratamiento, así que es
  poco probable que agregar controles, por sí solo, permita una interpretación causal.

---

## ✅ Autoevaluación

<div class="econ-quiz">
<p class="econ-quiz-q">Comparas el salario de quienes hicieron un MBA con el de quienes no. ¿Qué representa el sesgo de selección?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">La diferencia entre el salario con y sin MBA de quienes lo hicieron.</button>
<button class="econ-quiz-opt" data-correct>La diferencia de salario que habría existido entre ambos grupos aun si nadie hubiera hecho el MBA.</button>
<button class="econ-quiz-opt">El error de muestreo de la diferencia de promedios.</button>
</div>
<p class="econ-quiz-fb">✅ Sesgo de selección = E[Yᴺᵀ | T=1] − E[Yᴺᵀ | T=0]. La primera opción es el ATT; la tercera es variabilidad muestral, que no desaparece con supuestos sino con más datos.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Estimas el efecto de las horas de estudio sobre la nota omitiendo "horas de trabajo remunerado". Quienes trabajan más estudian menos, y trabajar más reduce la nota. ¿Qué signo tiene el sesgo?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Positivo: la regresión corta sobreestima el efecto del estudio.</button>
<button class="econ-quiz-opt">Negativo: la regresión corta subestima el efecto del estudio.</button>
<button class="econ-quiz-opt">No hay sesgo, porque la variable omitida no es la de interés.</button>
</div>
<p class="econ-quiz-fb">✅ δ₁ &lt; 0 (más estudio, menos trabajo) y β₂ &lt; 0 (trabajar baja la nota) ⇒ β₂·δ₁ &gt; 0. Parte de lo que parece "efecto del estudio" es en realidad "efecto de no tener que trabajar".</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Un programa de capacitación se asignó por sorteo. ¿Es necesario agregar controles para obtener un estimador insesgado del efecto?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">Sí, siempre hay que controlar por todas las características observables.</button>
<button class="econ-quiz-opt" data-correct>No: el sorteo garantiza que el tratamiento no se correlaciona con las variables omitidas.</button>
<button class="econ-quiz-opt">Solo si el R² de la regresión es bajo.</button>
</div>
<p class="econ-quiz-fb">✅ Con aleatorización, δ₁ = 0 para cualquier variable omitida, así que β₂·δ₁ = 0. Agregar controles puede mejorar la precisión, pero no es necesario para el insesgamiento.</p>
</div>

---

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 3, secciones 3.1–3.3 (*Análisis de regresión múltiple: estimación*).
- 📖 Comienza la lectura del **Certamen 1** (lunes 16 de noviembre): Miguel, E. y Kremer, M. (2004).
  *Worms: Identifying Impacts on Education and Health in the Presence of Treatment
  Externalities.* Econometrica, 72(1). Fíjate en cómo **aleatorizan** el tratamiento entre escuelas
  y en qué pasa cuando el tratamiento de unos afecta a otros (externalidades).
- Próxima clase: **Regresión lineal múltiple y Teorema de Gauss-Markov**.
