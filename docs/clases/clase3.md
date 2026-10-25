<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->

# Clase 3 · Causalidad y variable omitida

<div class="usm-session-meta">
<span>📅 Viernes 30 de octubre de 2026</span>
<span>⏱️ 18:40 – 21:25</span>
<span class="usm-tag-gold">Semana 3 · Contenido 4 (cont.) · Causalidad y variable omitida</span>
</div>

!!! info "Contenido oficial de la semana"
    Esta página reproduce **íntegras y en orden** las diapositivas de la semana 3 (`sem3/`):
    `Clase3.tex` (Parte 1) y `Clase4.tex` (Parte 2), ambas de la **cátedra del viernes**. Los bloques
    **Interactivo**, los casos y las preguntas son material adicional para estudiar.

!!! example "Cómo estudiar esta clase"
    La clase está ordenada en **8 temas**. Cada tema parte con una **pregunta guía**, sigue con las láminas
    y los simuladores, y termina con **✍️ preguntas de selección múltiple** (cada alternativa incorrecta explica
    por qué no lo es) y un **🧪 ejercicio de R** que puedes editar y ejecutar aquí mismo, sin instalar nada.
    Todos los ejercicios de R en un solo archivo: [📥 clase3.R](../r/clase3.R).

## 🎯 Objetivos de la sesión

- Distinguir entre **esperanza condicional** (lo que describe una regresión) y **efecto causal**.
- Usar el modelo de **outcomes potenciales** de Rubin para definir el ATE y el ATT.
- Descomponer una diferencia de promedios en **efecto causal + sesgo de selección**.
- Entender por qué la **aleatorización** elimina el sesgo de selección.
- Derivar el **sesgo por variable omitida** y predecir su signo.
- Evaluar cuándo agregar controles corrige el sesgo y por qué las variables irrelevantes aumentan la varianza.

## 🗓️ Agenda de la cátedra (viernes 18:40 – 21:25)

Haz clic en un tema para ir directo a él.

<ol class="econ-ruta">
<li><span class="econ-ruta-h">18:40</span><a class="econ-ruta-a" href="#tema-1"><span class="econ-ruta-n">1</span><span class="econ-ruta-t">¿Correlación o causalidad?</span><span class="econ-ruta-l">Parte 1 · láminas 1–2 · ✍️ 2 preguntas</span></a></li>
<li><span class="econ-ruta-h">19:00</span><a class="econ-ruta-a" href="#tema-2"><span class="econ-ruta-n">2</span><span class="econ-ruta-t">Outcomes potenciales: ATE y ATT</span><span class="econ-ruta-l">Parte 1 · láminas 3–8 · ✍️ 3 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">19:30</span><a class="econ-ruta-a" href="#tema-3"><span class="econ-ruta-n">3</span><span class="econ-ruta-t">La trampa de comparar: sesgo de selección</span><span class="econ-ruta-l">Parte 1 · láminas 9–14 · ✍️ 3 preguntas · 🧪 R</span></a></li>
<li class="is-break"><span class="econ-ruta-h">19:55</span><span class="econ-ruta-t">☕ Receso</span></li>
<li><span class="econ-ruta-h">20:05</span><a class="econ-ruta-a" href="#tema-4"><span class="econ-ruta-n">4</span><span class="econ-ruta-t">Aleatorizar: dejar que decida una moneda</span><span class="econ-ruta-l">Parte 1 · láminas 15–16 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">20:20</span><a class="econ-ruta-a" href="#tema-5"><span class="econ-ruta-n">5</span><span class="econ-ruta-t">Del sesgo de selección a la variable omitida</span><span class="econ-ruta-l">Parte 2 · láminas 1–4 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">20:40</span><a class="econ-ruta-a" href="#tema-6"><span class="econ-ruta-n">6</span><span class="econ-ruta-t">El signo del sesgo</span><span class="econ-ruta-l">Parte 2 · láminas 5–6 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">20:55</span><a class="econ-ruta-a" href="#tema-7"><span class="econ-ruta-n">7</span><span class="econ-ruta-t">Controles: el ejemplo de fumar y la edad</span><span class="econ-ruta-l">Parte 2 · láminas 7–9 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">21:10</span><a class="econ-ruta-a" href="#tema-8"><span class="econ-ruta-n">8</span><span class="econ-ruta-t">¿Más es mejor? Controles irrelevantes y conclusiones</span><span class="econ-ruta-l">Parte 2 · láminas 10–12 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li class="is-break"><span class="econ-ruta-h">21:25</span><span class="econ-ruta-t">✅ Ideas clave, autoevaluación y cierre</span></li>
</ol>

## Causalidad y sesgo de selección { .econ-parte data-eyebrow="Parte 1 · Cátedra" data-toc-label="Parte 1 · Causalidad y sesgo de selección" }

<p class="econ-source">📄 Diapositivas: <code>sem3/Clase3.tex</code> · 16 láminas</p>

### ¿Correlación o causalidad? { #tema-1 .econ-tema data-num="1" data-laminas="Parte 1 · láminas 1–2" data-toc-label="Tema 1 · Correlación o causalidad" }

<p class="econ-tema-q">¿Ganan más quienes estudian más <em>porque</em> estudian, o por otros motivos?</p>

<div class="econ-lamina" markdown>

#### Esperanza condicional versus causalidad { data-lamina="Lámina 1" }

<!-- sem3/Clase3.tex · lámina 1 -->

-   Hasta ahora, hemos visto como funciona el modelo de regresión lineal que nos entrega la esperanza condicional de una variable condicional a la otra.

-   Nos permite describir muchas realidades empíricas. Ejemplos:

    -   ¿Las personas con más educación reciben sueldos mayores?

    -   ¿Estudiar Economía está asociado con un mayor sueldo?

-   Pero, ¿son las relaciones estimadas causales?

-   ¿Es la educación lo que aumenta el salario, o simplemente observamos que las personas que se educan más tienen más salario por otros motivos?

-   Construiremos un marco analítico para pensar el problema de causalidad.

</div>

<div class="econ-lamina" markdown>

#### Contrafactual { data-lamina="Lámina 2" }

<!-- sem3/Clase3.tex · lámina 2 -->

-   Para pensar en causalidad, tenemos que imaginar un mundo contrafactual.

-   ¿Qué pasaría si pudieramos observar a las personas que fueron a la universidad en un mundo alternativo en que no hubieran ido?

    -   **Problema fundamental: No podemos calcular directamente el impacto causal de un tratamiento para un individuo $i$ porque no podemos observar al mismo individuo en los dos estados (con y sin tratamiento)**

-   **Definición de Contrafactual:** El resultado que los mismos participantes de un programa hubieran obtenido en el caso hipotético de no haber participado.

</div>

<div class="econ-practica" id="practica-1">
<p class="econ-practica-t"><span>✍️ Practica · Tema 1</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Una regresión muestra que quienes estudiaron Economía ganan, en promedio, 20% más que el resto. ¿Qué podemos concluir?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-why="Eso exigiría comparar a las mismas personas con y sin Economía: su contrafactual.">Que estudiar Economía causa un sueldo 20% mayor.</button>
<button class="econ-quiz-opt" data-correct>Que estudiar Economía está asociado con un sueldo 20% mayor; todavía no sabemos si es causal.</button>
<button class="econ-quiz-opt" data-why="Una asociación no prueba causalidad, pero tampoco la descarta.">Que no hay relación causal entre carrera y sueldo.</button>
</div>
<p class="econ-quiz-fb">✅ La regresión entrega la esperanza condicional E[y|x]: describe una realidad, pero no dice por qué ocurre (lámina 1).</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Ana fue a la universidad y hoy gana $1 200 000. ¿Cuál es su contrafactual?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-why="Ese es un grupo de comparación, y puede ser muy distinto de Ana.">El sueldo promedio de quienes no fueron a la universidad.</button>
<button class="econ-quiz-opt" data-correct>El sueldo que Ana tendría hoy si no hubiera ido a la universidad.</button>
<button class="econ-quiz-opt" data-why="Entre antes y después cambian muchas cosas además de la universidad: edad, experiencia, la economía.">El sueldo de Ana antes de entrar a la universidad.</button>
</div>
<p class="econ-quiz-fb">✅ Es la definición de la lámina 2: el resultado que los mismos participantes habrían obtenido sin participar. Nunca lo observamos.</p>
</div>
</div>

### Outcomes potenciales: ATE y ATT { #tema-2 .econ-tema data-num="2" data-laminas="Parte 1 · láminas 3–8" data-toc-label="Tema 2 · Outcomes potenciales: ATE y ATT" }

<p class="econ-tema-q">¿Cómo se define un efecto causal si nunca vemos a la misma persona en los dos mundos?</p>

<div class="econ-lamina" markdown>

#### El marco teórico de Rubin { data-lamina="Lámina 3" }

<!-- sem3/Clase3.tex · lámina 3 -->

-   Estamos interesados en medir el impacto de un "Tratamiento" que es una variable binaria (recibirlo o no) en $y$.

    -   El tratamiento podria ser un subsidio del gobierno, participar en un programa determinado, becas para la universidad, recibir vacunas, etc.

    -   Vamos a definir dos grupos: los tratados (T) y el grupo no tratado o control (NT).

</div>

<div class="econ-lamina" markdown>

#### Modelo de outcomes potenciales (Rubin) { data-lamina="Lámina 4" }

<!-- sem3/Clase3.tex · lámina 4 -->

-   Buscamos saber el impacto causal del tratamiento (T) en una variable $Y$.

    -   $Y_i$: outcome observado para la persona $i$.

    -   $T_i$: variable aleatoria binaria que toma valor $1$ si fue tratado y $0$ si no lo fue.

    -   $Y_i^T$: es el outcome potencial del individuo si fue tratado.

    -   $Y_i^{NT}$: es el outcome potencial del individuo si NO fue tratado.

-   El impacto de recibir $T$ para cada individuo sería $Y_i^T - Y_i^{NT}$. ¿Puedo observar esto?

-   **Nunca observaremos ambos outcomes (o estados) a la vez**.

</div>

<div class="econ-widget" data-widget="universo"></div>

<div class="econ-lamina" markdown>

#### ATE y ATT { data-lamina="Lámina 5" }

<!-- sem3/Clase3.tex · lámina 5 -->

-   El impacto promedio causal (Average Treatment Effect, ATE) es:

    $$
    ATE = E[Y_i^T - Y_i^{NT}]
    $$

-   **No observable** porque a cada $i$ lo observamos en un solo estado (tratado o no).

-   El impacto promedio causal para los tratados (Average Treatment Effect on the Treated, ATT) es: $E[Y_i^T - Y_i^{NT} | T_i=1]$.

-   **Tampoco lo observamos porque $E[Y_i^{NT}|T_i=1]$ no es observable.**

</div>

<div class="econ-lamina" markdown>

#### Observado y no observado { data-lamina="Lámina 6" }

<!-- sem3/Clase3.tex · lámina 6 -->

Ejemplo de que vemos y que no vemos:

|          |      Datos       |                  | Outcomes Potenciales  |                      |
|:---------|:----------------:|:----------------:|:---------------------:|:--------------------:|
|          | $\mathrm{T}_{i}$ | $\mathrm{Y}_{i}$ | $\mathrm{Y}_{i}^{NT}$ | $\mathrm{Y}_{i}^{T}$ |
| Sofia    |        1         |       100        |         $? ?$         |         100          |
| Paula    |        0         |        40        |          40           |        $? ?$         |
| Ezequiel |        1         |        80        |         $? ?$         |          80          |
| Juan     |        0         |        20        |          20           |        $? ?$         |
| Caro     |        1         |        60        |         $? ?$         |          60          |

El efecto causal promedio, Average Treatment Effect, sería

$$
ATE = E[Y_i^T - Y_i^{NT}]
$$

NO observable. Ej: no puedo saber $Y_i^{NT}$ para Caro porque no sé como hubiese sido su vida si no hubiera recibido el tratamiento.<br>

Al menos nos gustaría identificar el efecto del tratamiento para el grupo de tratados $ATT = E[Y_i^T - Y_i^{NT}|T_i=1]$. Tampoco se puede observar porque $E[Y_i^{NT}|T_i=1]$ es no observable.

</div>

<div class="econ-widget" data-widget="po"></div>

<div class="econ-lamina" markdown>

#### Problema estimación del impacto causal { data-lamina="Lámina 7" }

<!-- sem3/Clase3.tex · lámina 7 -->

<div class="econ-tikz-tree">
<div class="t-root">Individuo <span class="arithmatex">\(i\)</span></div>
<div class="t-row"><span>↙</span><span>↘</span></div>
<div class="t-row"><div><span class="arithmatex">\(T_i=1\)</span>: observamos <span class="arithmatex">\(Y_i^{T}\)</span></div><div><span class="arithmatex">\(T_i=0\)</span>: observamos <span class="arithmatex">\(Y_i^{NT}\)</span></div></div>
<div class="t-row t-cf"><span>⇣</span><span>⇣</span></div>
<div class="t-row t-cf"><div><span class="arithmatex">\(Y_i^{NT}\)</span> contrafactual</div><div><span class="arithmatex">\(Y_i^{T}\)</span> contrafactual</div></div>
</div>
-   Cada individuo recorre una sola rama (línea sólida); la rama contrafactual (roja, punteada) nunca se observa.

-   Este es el problema fundamental de la inferencia causal: para cada $i$ solo vemos $Y_i^{T}$ o $Y_i^{NT}$, nunca ambos.

</div>

<div class="econ-lamina" markdown>

#### Usar datos observacionales para inferir el ATE { data-lamina="Lámina 8" }

<!-- sem3/Clase3.tex · lámina 8 -->

-   No podemos estimar el ATE o el ATT directamente.

-   Usamos datos que si observamos para estimar el efecto del tratamiento y pensar qué supuestos necesitamos para que eso nos de el ATE.

-   Como no puedo comparar las mismas personas en el mundo alternativo, la magia del supuesto esta en encontrar un grupo de comparación (contrafactual) que hubiera sido similar al grupo tratado en ausencia del tratamiento.

</div>

<div class="econ-widget" data-widget="gemelos"></div>

<div class="econ-practica" id="practica-2">
<p class="econ-practica-t"><span>✍️ Practica · Tema 2</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En la tabla de la lámina 6, Paula no fue tratada e Yᵢ = 40. ¿Qué dato suyo falta?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Yᵢᵀ: su salario si hubiera ido a la universidad.</button>
<button class="econ-quiz-opt" data-why="Ese sí lo vemos: como no fue tratada, Yᵢ = Yᵢᴺᵀ = 40.">Yᵢᴺᵀ: su salario sin universidad.</button>
<button class="econ-quiz-opt" data-why="Nunca vemos los dos outcomes de una misma persona (lámina 4).">Ninguno: de Paula conocemos sus dos outcomes.</button>
</div>
<p class="econ-quiz-fb">✅ Para los no tratados falta Yᵀ; para los tratados, Yᴺᵀ. Siempre falta la mitad de la tabla.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Qué diferencia al ATT del ATE?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>El ATT promedia el efecto solo entre los tratados; el ATE, en toda la población.</button>
<button class="econ-quiz-opt" data-why="Ninguno es observable: el ATT necesita E[Yᴺᵀ | T = 1], que no vemos (lámina 5).">El ATT se puede observar y el ATE no.</button>
<button class="econ-quiz-opt" data-why="Solo coinciden si el efecto promedio es igual entre tratados y no tratados.">Son siempre iguales.</button>
</div>
<p class="econ-quiz-fb">✅ ATE = E[Yᵀ − Yᴺᵀ]; ATT = E[Yᵀ − Yᴺᵀ | T = 1].</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">En el paso 2 del simulador, los efectos de Sofía, Ezequiel y Caro (los tratados) son 25, 20 y 15. ¿Cuánto vale el ATT?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-why="17 es el ATE: también incluye a Paula y Juan, que no fueron tratados.">17</button>
<button class="econ-quiz-opt" data-correct>20</button>
<button class="econ-quiz-opt" data-why="50 es la diferencia observada de promedios, que mezcla el efecto con el sesgo de selección.">50</button>
</div>
<p class="econ-quiz-fb">✅ ATT = (25 + 20 + 15) / 3 = 20.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · La tabla de la lámina 6</p>

Reproduce el **modo Dios** del simulador: arma la tabla con los dos outcomes potenciales de cada persona y calcula el ATE y el ATT.

```r
# Tabla de la lámina 6 con los contrafactuales "revelados" (los ?? son inventados)
datos <- data.frame(
  nombre = c("Sofía", "Paula", "Ezequiel", "Juan", "Caro"),
  T      = c(1, 0, 1, 0, 1),         # 1 = fue a la universidad
  Y_NT   = c(75, 40, 60, 20, 45),    # salario SIN universidad
  Y_T    = c(100, 55, 80, 30, 60)    # salario CON universidad
)
# Efecto individual: en la vida real nunca se observa
datos$efecto <- datos$Y_T - datos$Y_NT
datos

ATE <- mean(datos$efecto)                 # las 5 personas
ATT <- mean(datos$efecto[datos$T == 1])   # solo quienes fueron
c(ATE = ATE, ATT = ATT)
```

**🎯 Reto:** cambia el `Y_T` de Juan de 30 a 60. ¿Cambia el ATT? ¿Y el ATE? ¿Por qué?
{: .econ-r-reto }

</div>

### La trampa de comparar: sesgo de selección { #tema-3 .econ-tema data-num="3" data-laminas="Parte 1 · láminas 9–14" data-toc-label="Tema 3 · Sesgo de selección" }

<p class="econ-tema-q">¿Por qué comparar a quienes recibieron un tratamiento con quienes no puede engañarnos?</p>

<div class="econ-lamina" markdown>

#### ATT y sesgo de selección { data-lamina="Láminas 9–12" }

<!-- sem3/Clase3.tex · lámina 9 -->

-   Supongamos que queremos calcular el efecto del tratamiento $T$ en la variable $y$. Ejemplo: el efecto de ir a la universidad (T) en el salario.

-   No podemos ver directamente el ATE o ATT.

-   Podemos comparar el promedio de Y para el grupo de personas que fue a la universidad contra el promedio de y para los que no fueron (los vamos a llamar control). Esto es lo que hacemos en MCO.

    $$
    \beta_1=E\left[Y_{i} \mid T_{i}=1\right]-E\left[Y_{i} \mid T_{i}=0\right]
    $$

-   Es esto el ATE? En general, No! Porque en contextos no experimentales, los tratados eligen participar del programa y entonces difieren en muchas características con los del grupo no tratado.

<!-- sem3/Clase3.tex · lámina 10 -->

-   **Ejemplo:** La decisión de asistir a la universidad es voluntaria y puede estar influenciada por diversos factores, como intereses personales, recursos económicos y oportunidades previas. Debido a esto, las personas que no cursaron estudios universitarios pueden diferir en varias características de aquellas que sí lo hicieron. Compararlas directamente podría no ser adecuado, ya que no constituyen un buen contrafactual para evaluar el impacto de la educación universitaria.

<!-- sem3/Clase3.tex · lámina 11 -->

Vamos a descomponer $\beta_1$ en el efecto causal del tratamiento y un sesgo:

$$
\beta_1=E\left(Y_{i}^{T} \mid T_{i}=1\right)-E\left(Y_{i}^{\mathrm{NT}} \mid T_{i}=0\right)
$$

sumamos y restamos el término: $E\left[Y_{i}^{\mathrm{NT}} \mid T_{i}=1\right]$

$$
\begin{gathered}
E\left(Y_{i}^{T} \mid T_{i}=1\right)-E\left(Y_{i}^{\mathrm{NT}} \mid T_{i}=0\right)+E\left(Y_{i}^{\mathrm{NT}} \mid T_{i}=1\right)-E\left(Y_{i}^{\mathrm{NT}} \mid T_{i}=1\right) \\
\beta_1=E\left(Y_{i}^{T}-Y_{i}^{\mathrm{NT}} \mid T_{i}=1\right)+E\left(Y_{i}^{\mathrm{NT}} \mid T_{i}=1\right)-E\left(Y_{i}^{\mathrm{NT}} \mid T_{i}=0\right)
\end{gathered}
$$

-   El primer término corresponde a ATT: El efecto causal del tratamiento para los tratados.

<!-- sem3/Clase3.tex · lámina 12 -->

-   Al segundo término se lo llama sesgo de selección. Surge porque el grupo que recibió tratamiento ya era diferente al control.

-   Intuición del sesgo: En el mundo contrafactual en el que nadie tuvo tratamiento, el grupo que obtuvo tratamiendo igual hubiera tenido un diferente outcome porque ya era diferente al grupo que no obtuvo el tratamiento.

</div>

<div class="econ-widget" data-widget="hospital"></div>

<div class="econ-lamina" markdown>

#### Sesgo de selección { data-lamina="Lámina 13" }

<!-- sem3/Clase3.tex · lámina 13 -->

-   Las personas que toman una acción tienen características distintas a las personas que no lo hacen.

-   Por ejemplo, la gente que va a la universidad tiene alguna característica que hace que incluso en ausencia de ir a la universidad, hubieran tenido mayores salarios.

-   Hay sesgo de selección cuando, incluso en ausencia de una intervención, los resultados promedio de las unidades tratadas y no tratadas son distintos después del programa.

-   ¿Qué signo toma el sesgo de selección?

</div>

<div class="econ-lamina" markdown>

#### Ejemplo: una alarma para las casas { data-lamina="Lámina 14" }

<!-- sem3/Clase3.tex · lámina 14 -->

-   Queremos saber si las alarmas para las casas bajan el delito.

-   El problema es que cada individuo decide si poner una alarma o no en su casa.

-   ¿En qué podrían diferir los que ponen alarmas o no?

-   ¿Cómo sería el sesgo de selección?

-   ¿Qué pasaría entonces si comparamos la cantidad de robos en casas con y sin alarmas?

-   ¿Sería el efecto causal?

</div>

<div class="econ-widget" data-widget="alarmas"></div>

<div class="econ-practica" id="practica-3">
<p class="econ-practica-t"><span>✍️ Practica · Tema 3</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En el simulador, la diferencia observada es 50 y el ATT es 20. ¿Cuánto vale el sesgo de selección?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-why="Revisa la descomposición: diferencia = ATT + sesgo, no ATT − sesgo.">70</button>
<button class="econ-quiz-opt" data-correct>30</button>
<button class="econ-quiz-opt" data-why="Con la descomposición de la lámina 11 basta restar: sesgo = diferencia − ATT.">No se puede calcular.</button>
</div>
<p class="econ-quiz-fb">✅ β₁ = ATT + sesgo ⇒ 50 = 20 + 30. Los tratados habrían ganado 30 más aun sin universidad.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Comparas las notas de quienes asisten a un preuniversitario pagado con las de quienes no asisten. ¿Qué signo esperas en el sesgo de selección?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Positivo: quienes pagan un preuniversitario suelen tener más recursos y apoyo, y les habría ido mejor igual.</button>
<button class="econ-quiz-opt" data-why="El precio no define el signo; importa cómo les habría ido a los asistentes SIN preuniversitario.">Negativo, porque el preuniversitario es caro.</button>
<button class="econ-quiz-opt" data-why="Rendir la misma prueba no hace comparables a los grupos.">Cero, porque todos rinden la misma prueba.</button>
</div>
<p class="econ-quiz-fb">✅ Sesgo = E[Yᴺᵀ | T = 1] − E[Yᴺᵀ | T = 0] &gt; 0: la comparación simple sobreestima el efecto del preuniversitario.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Las casas con alarma registran más robos que las casas sin alarma. ¿Qué lectura es consistente con la lámina 14?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Quienes instalan alarmas suelen vivir donde hay más delitos: el sesgo de selección puede ocultar que la alarma sí protege.</button>
<button class="econ-quiz-opt" data-why="Podría ser, pero la comparación simple no permite distinguirlo del sesgo de selección.">Las alarmas atraen a los ladrones.</button>
<button class="econ-quiz-opt" data-why="Justamente porque cada uno decide, los grupos pueden ser distintos desde antes.">No hay sesgo, porque cada dueño decide libremente.</button>
</div>
<p class="econ-quiz-fb">✅ Sin alarma, las casas que la instalaron igual habrían tenido más robos: la diferencia observada mezcla ese sesgo con el efecto.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Diferencia observada = ATT + sesgo</p>

Con la misma tabla, calcula lo que **sí** vemos en los datos y comprueba la descomposición de la lámina 11. Fíjate en que `lm()` entrega exactamente la diferencia de promedios.

```r
datos <- data.frame(
  T    = c(1, 0, 1, 0, 1),
  Y_NT = c(75, 40, 60, 20, 45),
  Y_T  = c(100, 55, 80, 30, 60)
)
# Lo único que vemos: el outcome del mundo en que vivió cada uno
datos$Y <- ifelse(datos$T == 1, datos$Y_T, datos$Y_NT)

dif_obs <- mean(datos$Y[datos$T == 1]) - mean(datos$Y[datos$T == 0])
ATT     <- mean(datos$Y_T[datos$T == 1] - datos$Y_NT[datos$T == 1])
sesgo   <- mean(datos$Y_NT[datos$T == 1]) - mean(datos$Y_NT[datos$T == 0])
c(diferencia = dif_obs, ATT = ATT, sesgo = sesgo,
  ATT_mas_sesgo = ATT + sesgo)

# MCO de Y sobre T da justo la diferencia observada (lámina 9)
coef(lm(Y ~ T, data = datos))
```

**🎯 Reto:** ¿qué valores de `Y_NT` tendrían que tener Sofía, Ezequiel y Caro para que el sesgo fuera cero? Pruébalo: ¿qué pasa con la diferencia observada?
{: .econ-r-reto }

</div>

### Aleatorizar: dejar que decida una moneda { #tema-4 .econ-tema data-num="4" data-laminas="Parte 1 · láminas 15–16" data-toc-label="Tema 4 · Aleatorización" }

<p class="econ-tema-q">¿Qué cambia cuando es una moneda, y no la persona, la que decide quién recibe el tratamiento?</p>

<div class="econ-lamina" markdown>

#### Aleatorización { data-lamina="Láminas 15–16" }

<!-- sem3/Clase3.tex · lámina 15 -->

-   ¿Qué supuesto necesito para que no haya sesgo de selección?

-   El supuesto clave es que los outcomes potenciales sean independientes del tratamiento.

-   Aleatorizar: determinar aleatoriamente quien recibe el tratamiento y quien no, resuelve el problema.

-   Esto implica que quien recibe el tratamiento, en promedio, hubiera sido igual a quien no lo recibe si no hubiera recibido el tratamiento.

-   Es decir: $E\left(Y_{i}^{\mathrm{NT}} \mid T_{i}=1\right)=E\left(Y_{i}^{\mathrm{NT}} \mid T_{i}=0\right)$

<!-- sem3/Clase3.tex · lámina 16 -->

-   En este caso:

    $$
    \beta=A T E=A T T
    $$

-   Y obtenemos el efecto causal.

-   Muy usado en medicina para evaluar drogas y vacunas.

-   En ciencias sociales, cada vez es más usado tanto en evaluación de políticas públicas, como en el mundo empresarial.

</div>

<div class="econ-widget" data-widget="seleccion"></div>

<div class="econ-widget" data-widget="ab-test"></div>

<div class="econ-practica" id="practica-4">
<p class="econ-practica-t"><span>✍️ Practica · Tema 4</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Qué garantiza la aleatorización?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Que E[Yᴺᵀ | T = 1] = E[Yᴺᵀ | T = 0]: sin tratamiento, ambos grupos serían iguales en promedio.</button>
<button class="econ-quiz-opt" data-why="Los efectos pueden variar entre personas; el sorteo solo hace comparables a los grupos.">Que el tratamiento tenga el mismo efecto en todas las personas.</button>
<button class="econ-quiz-opt" data-why="Lo es en promedio. En un sorteo particular hay error por azar: míralo en el paso 4 del simulador.">Que la diferencia observada sea exactamente el ATE en cada muestra.</button>
</div>
<p class="econ-quiz-fb">✅ Es la condición de la lámina 15. Con ella el sesgo de selección es cero y β = ATE = ATT (lámina 16).</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Una app sortea a qué usuarios les muestra un botón nuevo (test A/B). Quienes vieron el botón compran 3% más. ¿Qué mide esa diferencia?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>El efecto causal promedio del botón, salvo error muestral.</button>
<button class="econ-quiz-opt" data-why="Con sorteo no hace falta controlar: β = ATE = ATT.">Solo una correlación, porque no se controló por nada.</button>
<button class="econ-quiz-opt" data-why="El sorteo reparte a usuarios activos y pasivos por igual en ambos grupos.">El efecto solo en los usuarios más activos.</button>
</div>
<p class="econ-quiz-fb">✅ La aleatorización hace que los grupos sean comparables: la diferencia de promedios estima el efecto causal.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Autoselección versus sorteo</p>

Simula 10 000 personas en que la universidad sube el salario en **exactamente 10**. Compara lo que estima MCO cuando cada persona elige y cuando decide una moneda.

```r
set.seed(2026)
n <- 10000
habilidad <- rnorm(n)                          # no la observamos
Y_NT <- 100 + 15 * habilidad + rnorm(n, sd = 8)
Y_T  <- Y_NT + 10                      # efecto causal: +10

# 1) Autoselección: los más hábiles van más a la universidad
T_auto <- rbinom(n, 1, plogis(2 * habilidad))
Y_auto <- ifelse(T_auto == 1, Y_T, Y_NT)
coef(lm(Y_auto ~ T_auto))["T_auto"]

# 2) Aleatorización: una moneda decide quién va
T_azar <- rbinom(n, 1, 0.5)
Y_azar <- ifelse(T_azar == 1, Y_T, Y_NT)
coef(lm(Y_azar ~ T_azar))["T_azar"]

# ¿Por qué? Habilidad promedio de no tratados (0) y tratados (1)
tapply(habilidad, T_auto, mean)
tapply(habilidad, T_azar, mean)
```

**🎯 Reto:** cambia el `2` de `plogis(2 * habilidad)` por `0`. ¿Qué pasa con el sesgo? ¿Y si pones `-2`?
{: .econ-r-reto }

</div>

## Sesgo por variable omitida { .econ-parte data-eyebrow="Parte 2 · Cátedra" data-toc-label="Parte 2 · Sesgo por variable omitida" }

<p class="econ-source">📄 Diapositivas: <code>sem3/Clase4.tex</code> · 12 láminas</p>

### Del sesgo de selección a la variable omitida { #tema-5 .econ-tema data-num="5" data-laminas="Parte 2 · láminas 1–4" data-toc-label="Tema 5 · De la selección a la variable omitida" }

<p class="econ-tema-q">¿Qué le pasa a MCO cuando una variable importante queda escondida en el error?</p>

<div class="econ-lamina" markdown>

#### Sesgo de selección y MCO { data-lamina="Lámina 1" }

<!-- sem3/Clase4.tex · lámina 1 -->

-   Supongamos que tenemos el siguiente modelo lineal donde nos interesa el efecto de $x_{i}$ en $y_{i}$.

    $$
    y_{i}=\alpha+\beta x_{i}+\varepsilon_{i}
    $$

-   El supuesto clásico crucial de MCO para que $\beta$ sea el efecto causal es que:

    $$
    E\left[\epsilon \mid x\right]=0
    $$

-   Es decir, que todo lo que esta en el error no correlaciona con x.

-   Si esto no se cumple, nuestro coeficiente estará sesgado.

</div>

<div class="econ-lamina" markdown>

#### Sesgo por Variables omitidas { data-lamina="Lámina 2" }

<!-- sem3/Clase4.tex · lámina 2 -->

-   ¿Qué pasa si omitimos una variable que afecta a $x$?

-   ¿En términos de grupo tratamiento y control, que pasa si omitimos una variable que determina si el individuo es tratado o no?

-   En este caso, no se cumple que $E\left[\epsilon \mid x\right]=0$ y vamos a tener sesgo de selección.

-   Ejemplo: quiero estudiar el efecto de la consultoría en la productividad de la empresa. Sea $x_{i}$ una variable binaria que toma valor 1 si la empresa recibió asesoramiento por la consultora.

    $$
    \text{productividad}_{i}=\alpha+\beta \cdot x_{i}+\epsilon_{i}
    $$

-   es el $\hat{\beta}$ estimado por OLS el efecto causal? Qué variables estoy omitiendo?

-   Podemos pensar que en el error está el tamaño de la empresa. Solo empresas más grandes pueden pagar por consultoría. Es decir, el tamaño correlaciona positivamente con la x. Al estar en el error, nuestro $\hat{\beta}$ MCO estará sesgado.

</div>

!!! tip "Complemento · Ya lo vimos en la Clase 1"
    Este es exactamente el problema que resolvió el estudio de **Bloom y coautores** sobre consultoría en India: como las empresas que contratan consultoras son distintas (más grandes, más ricas), los investigadores **sortearon** quién recibía la consultoría. Así el tamaño de la empresa deja de relacionarse con $x$ y desaparece el sesgo.

<div class="econ-lamina" markdown>

#### Omitiendo variables { data-lamina="Láminas 3–4" }

<!-- sem3/Clase4.tex · lámina 3 -->

-   Suponga que la población sigue la siguiente ecuación (verdadera),

    $$
    y=\alpha+ \beta_{1}x_{1}+\beta_{2} x_{2}+u \tag{A}
    $$

    donde $E[u \mid x]=0$.

-   (auxiliar) Suponga también que se sabe que $x_{2}$ esta relacionada con $x_{1}$ de la siguiente manera:

    $$
    x_{2}=\delta_{0}+\delta_{1} x_{1}+v \tag{B}
    $$

-   Si no observamos $x_{2}$, estimamos el modelo MCO omitiendola (mandandola al error):

    $$
    y=\tilde{\alpha}+x_{1} \tilde{\beta}_{1}+\epsilon \tag{C}
    $$

-   ¿Qué supuesto no se cumpliría en este caso?

-   Noten que comparando con (A), sabemos que $\epsilon=\beta_{2} x_{2}+u$. Por (B), sabemos que $x_{1}$ correlaciona con $x_{2}$, entonces no se cumple $E\left[\epsilon \mid x_{1}\right]=0$.

-   Entonces, ¿qué esta capturando $\tilde{\beta}_{1}$?

<!-- sem3/Clase4.tex · lámina 4 -->

-   Reemplazando (B) en (A):

    $$
    y=\alpha+x_{1} \beta_{1}+\beta_{2}\left(\delta_{0}+\delta_{1} x_{1}+v\right)+u
    $$

-   Reordenando:

    $$
    y=\left(\alpha+\beta_2\delta_{0}\right)+x_{1}\left(\beta_{1}+\beta_{2} \delta_{1}\right)+\left(u+\beta_{2} v\right)
    $$

-   Es decir, que cuando omitimos una variable y estimamos un modelo como (C). El coeficiente que estimamos es:

    $$
    \tilde{\beta}_{1}=\beta_{1}+\beta_{2} \delta_{1}
    $$

-   Entonces, capturamos el efecto causal $\left(\beta_{1}\right)$ y un sesgo dado por $\beta_{2} \delta_{1}$.

-   ¿De qué depende el sesgo? ¿Cuándo es 0?

</div>

<div class="econ-practica" id="practica-5">
<p class="econ-practica-t"><span>✍️ Practica · Tema 5</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En productividad = α + β·consultoría + ε, el tamaño de la empresa queda en ε. ¿Por qué β̂ estaría sesgado?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Porque el tamaño se relaciona con recibir consultoría, así que E[ε | x] ≠ 0.</button>
<button class="econ-quiz-opt" data-why="Si no la afectara (β₂ = 0), omitirlo no generaría sesgo.">Porque el tamaño no afecta la productividad.</button>
<button class="econ-quiz-opt" data-why="El sesgo no desaparece con más datos: depende de qué hay en el error.">Porque la muestra es pequeña.</button>
</div>
<p class="econ-quiz-fb">✅ Es el ejemplo de la lámina 2: solo las empresas grandes pueden pagar consultoría, y el tamaño también afecta la productividad.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">La población sigue y = 1 + 2x₁ + 3x₂ + u, con x₂ = 0.5x₁ + v. Si omites x₂, ¿cuánto vale β̃₁?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-why="2 es el efecto causal β₁; la regresión corta además captura β₂δ₁.">2</button>
<button class="econ-quiz-opt" data-correct>3.5</button>
<button class="econ-quiz-opt" data-why="No se suman β₁ y β₂: el sesgo es β₂·δ₁ = 3 · 0.5.">5</button>
</div>
<p class="econ-quiz-fb">✅ β̃₁ = β₁ + β₂δ₁ = 2 + 3 · 0.5 = 3.5. Compruébalo en el ejercicio de R de abajo.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · La fórmula del sesgo, número a número</p>

Simula los datos de la pregunta anterior y verifica que el coeficiente de la regresión corta es **exactamente** β̂₁ + β̂₂·δ̂₁ (lámina 4).

```r
set.seed(3)
n  <- 5000
x1 <- rnorm(n)
x2 <- 0.5 * x1 + rnorm(n)              # (B): delta1 = 0.5
y  <- 1 + 2 * x1 + 3 * x2 + rnorm(n)   # (A): beta1 = 2, beta2 = 3

corta <- lm(y ~ x1)            # (C): omite x2
larga <- lm(y ~ x1 + x2)       # (A): el modelo verdadero
aux   <- lm(x2 ~ x1)           # (B): la regresión auxiliar

coef(corta)["x1"]          # beta1 tilde (≈ 3.5)
# beta1 + beta2 * delta1 con los coeficientes estimados: ¡idéntico!
coef(larga)["x1"] + coef(larga)["x2"] * coef(aux)["x1"]
```

**🎯 Reto:** cambia `0.5` por `0` en la línea de `x2`. ¿Cuánto vale ahora el sesgo? ¿Qué caso de la lámina 5 es?
{: .econ-r-reto }

</div>

### El signo del sesgo { #tema-6 .econ-tema data-num="6" data-laminas="Parte 2 · láminas 5–6" data-toc-label="Tema 6 · El signo del sesgo" }

<p class="econ-tema-q">¿Cómo predecir si la regresión corta sobreestima o subestima el efecto?</p>

<div class="econ-lamina" markdown>

#### Sesgo por omisión de variable { data-lamina="Láminas 5–6" }

<!-- sem3/Clase4.tex · lámina 5 -->

1.  <svg class="econ-tikz-svg econ-dag" viewBox="0 0 170 92" role="img" aria-label="Diagrama causal entre X1, X2 e Y"><defs><marker id="ahb10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#8b5a2b"/></marker><marker id="ahr10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d62828"/></marker></defs><text x="14" y="24" font-weight="700" fill="currentColor">X1</text><text x="150" y="24" font-weight="700" fill="currentColor">Y</text><text x="84" y="84" font-weight="700" fill="currentColor">X2</text><line x1="38" y1="20" x2="142" y2="20" stroke="#8b5a2b" stroke-width="2.5" marker-end="url(#ahb10)"/><line x1="102" y1="70" x2="148" y2="30" stroke="#d62828" stroke-width="2.5" marker-end="url(#ahr10)"/><text x="132" y="62" fill="#d62828" font-style="italic">β₂</text></svg>
2.  <svg class="econ-tikz-svg econ-dag" viewBox="0 0 170 92" role="img" aria-label="Diagrama causal entre X1, X2 e Y"><defs><marker id="ahb01" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#8b5a2b"/></marker><marker id="ahr01" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d62828"/></marker></defs><text x="14" y="24" font-weight="700" fill="currentColor">X1</text><text x="150" y="24" font-weight="700" fill="currentColor">Y</text><text x="84" y="84" font-weight="700" fill="currentColor">X2</text><line x1="38" y1="20" x2="142" y2="20" stroke="#8b5a2b" stroke-width="2.5" marker-end="url(#ahb01)"/><line x1="82" y1="70" x2="34" y2="30" stroke="#d62828" stroke-width="2.5" marker-end="url(#ahr01)"/><text x="36" y="62" fill="#d62828" font-style="italic">δ</text></svg>
3.  <svg class="econ-tikz-svg econ-dag" viewBox="0 0 170 92" role="img" aria-label="Diagrama causal entre X1, X2 e Y"><defs><marker id="ahb11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#8b5a2b"/></marker><marker id="ahr11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d62828"/></marker></defs><text x="14" y="24" font-weight="700" fill="currentColor">X1</text><text x="150" y="24" font-weight="700" fill="currentColor">Y</text><text x="84" y="84" font-weight="700" fill="currentColor">X2</text><line x1="38" y1="20" x2="142" y2="20" stroke="#8b5a2b" stroke-width="2.5" marker-end="url(#ahb11)"/><line x1="102" y1="70" x2="148" y2="30" stroke="#d62828" stroke-width="2.5" marker-end="url(#ahr11)"/><text x="132" y="62" fill="#d62828" font-style="italic">β₂</text><line x1="82" y1="70" x2="34" y2="30" stroke="#d62828" stroke-width="2.5" marker-end="url(#ahr11)"/><text x="36" y="62" fill="#d62828" font-style="italic">δ</text></svg>
<!-- -->

-   Cuando una variable omitida provocará un sesgo entonces?

    $$
    \tilde{\beta}_{1}=\beta_{1}+\beta_{2} \delta_{1}
    $$

-   Solo en el caso (3) tenemos sesgo. Cuando omitimos una variable que afecta a X y a Y al mismo tiempo (en general lo segundo siempre pasa).

-   Ejemplo:<br>
    $x_{1}$ : educación, $Y=$ salario, $x_{2}$ : Habilidad.<br>
    En ese caso, $\beta_{2}>0$, $\delta_{1}>0$. Por lo que $\tilde{\beta}_{1}$ sobre-estimará el verdadero valor del parámetro.

<!-- sem3/Clase4.tex · lámina 6 -->

$$
\tilde{\beta}_{1}=\beta_{1}+\beta_{2} \delta_{1}
$$

-   Pensando en los signos de $\beta_{2}$ (como afecta la omitida a y) y $\delta_{1}$ (como afecta la omitida a $x_{1}$ ), podemos comprender la direccion del sesgo. (los ejemplos con regresión de educación y salario)

    1.  Si $\delta_{1}>0, \beta_{2}>0$ : Sesgo positivo. Ejemplo omitida: Inteligencia.

    2.  Si $\delta_{1}<0, \beta_{2}<0$ : Sesgo positivo.

    3.  $\delta_{1}<0, \beta_{2}>0$ : Sesgo negativo.

    4.  $\delta_{1}>0, \beta_{2}<0$ : Sesgo negativo.

-   La intuición es fácil. Piensen el caso (1). La gente mas inteligente va más a la universidad $\left(\delta_{1}>0\right) y$, además, la inteligencia mejora tu salario ( $\beta_{2}>0$ ). Entonces, al omitir inteligencia, el coeficiente de educación se captura no solo el efecto causal sino también el hecho de que gente mas inteligente va más a la universidad y esa gente gana más (sin importar el efecto de la educación en si misma).

</div>

<div class="econ-widget" data-widget="ovb"></div>

<div class="econ-widget" data-widget="signo-sesgo"></div>

<div class="econ-practica" id="practica-6">
<p class="econ-practica-t"><span>✍️ Practica · Tema 6</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">¿En cuál de los diagramas de la lámina 5 omitir X2 sesga el coeficiente de X1?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-why="Si X2 no se relaciona con X1, δ₁ = 0 y β₂δ₁ = 0.">(1): X2 solo afecta a Y.</button>
<button class="econ-quiz-opt" data-why="Si X2 no afecta a Y, β₂ = 0 y β₂δ₁ = 0.">(2): X2 solo se relaciona con X1.</button>
<button class="econ-quiz-opt" data-correct>(3): X2 se relaciona con X1 y afecta a Y.</button>
</div>
<p class="econ-quiz-fb">✅ Solo hay sesgo cuando la omitida afecta a Y (β₂ ≠ 0) y se relaciona con X1 (δ₁ ≠ 0).</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Estimas el efecto de un subsidio de salud sobre un índice de salud omitiendo la pobreza. Los hogares más pobres reciben más subsidio (δ₁ &gt; 0) y la pobreza empeora la salud (β₂ &lt; 0). La regresión corta…</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>…subestima el efecto del subsidio: hasta podría parecer que empeora la salud.</button>
<button class="econ-quiz-opt" data-why="β₂δ₁ es negativo por positivo: el sesgo empuja el coeficiente hacia abajo.">…sobreestima el efecto del subsidio.</button>
<button class="econ-quiz-opt" data-why="Las reglas usan la pobreza, que también afecta la salud: eso es justamente δ₁ ≠ 0.">…no tiene sesgo, porque el subsidio se entrega con reglas.</button>
</div>
<p class="econ-quiz-fb">✅ Caso 4 de la lámina 6: δ₁ &gt; 0 y β₂ &lt; 0 ⇒ sesgo negativo.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Los cuatro casos de signos</p>

Simula los cuatro casos de la lámina 6 y compara el sesgo obtenido con el signo que predice β₂·δ₁.

```r
# Sesgo de la regresión corta (beta1 tilde − beta1), lámina 6
sesgo_corta <- function(delta1, beta2, n = 5000) {
  x1 <- rnorm(n)
  x2 <- delta1 * x1 + rnorm(n)
  y  <- 1 + 2 * x1 + beta2 * x2 + rnorm(n)      # beta1 = 2
  unname(round(coef(lm(y ~ x1))["x1"] - 2, 2))
}
set.seed(6)
casos <- expand.grid(delta1 = c(0.8, -0.8), beta2 = c(2, -2))
casos$sesgo <- mapply(sesgo_corta, casos$delta1, casos$beta2)
casos$signo_predicho <- sign(casos$delta1 * casos$beta2)
casos
```

**🎯 Reto:** agrega el caso δ₁ = 0 cambiando `c(0.8, -0.8)` por `c(0.8, 0, -0.8)`. ¿Qué sesgo obtienes?
{: .econ-r-reto }

</div>

### Controles: el ejemplo de fumar y la edad { #tema-7 .econ-tema data-num="7" data-laminas="Parte 2 · láminas 7–9" data-toc-label="Tema 7 · Controles: fumar y edad" }

<p class="econ-tema-q">¿Basta con agregar la variable omitida como control?</p>

<div class="econ-lamina" markdown>

#### Soluciones a variables omitidas: Controles { data-lamina="Lámina 7" }

<!-- sem3/Clase4.tex · lámina 7 -->

-   Cuál es la manera más obvia de solucionar el problema anterior?

-   Si tengo la variable $x_{2}$, la puedo incluir como control en la regresión y soluciono el problema.

-   Vuelvo al caso en que $E[u \mid {\bf x}]=0$ porque ahora estoy dejando ceteris paribus $x_{2}$.

-   En este caso, resuelve el problema porque conozco exacto el modelo verdadero y se que solo omitía $x_{2}$. Sin embargo, muchas veces no alcanza porque hay otras variables omitidas.

</div>

<div class="econ-lamina" markdown>

#### Ejemplo 1 { data-lamina="Lámina 8" }

<!-- sem3/Clase4.tex · lámina 8 -->

-   Appleton, French and Vanderpump (1996): relación entre consumo de cigarillos y muerte.

![Ejemplo 1](../images/slides/complemetario_imagenes_regysmoke.jpeg){ .econ-slide-img }

-   $\hat{\tilde{\beta}}_{1}=-1.81$

-   ¿Qué variables estamos omitiendo aca?

</div>

<div class="econ-lamina" markdown>

#### Ejemplo 2 { data-lamina="Lámina 9" }

<!-- sem3/Clase4.tex · lámina 9 -->

-   ¿Y si agregamos edad?

    ![Ejemplo 2](../images/slides/complemetario_imagenes_regysmokeage.jpeg){ .econ-slide-img }

<!-- -->
-   Si este fuera el modelo verdadero, $\hat{\beta}_{1}=0.94>\hat{\tilde{\beta}}_{1}=-1.81$. Si $\hat{\beta}_{2}>0$, ¿qué me dice esto sobre el signo de relación entre edad y fumar cigarrillos $\delta_{2}$?

-   Recuerden: $\tilde{\beta}_{1}=\beta_{1}+\beta_{2} \delta_{2}$

-   Es negativa: cuanto mayor es la persona, menos fuma.

</div>

!!! tip "Complemento · Compruébalo con los números"
    Con la salida de Stata: $-1.819 = 0.943 + 0.980\,\delta_2$ (la lámina redondea a $-1.81$) $\Rightarrow \delta_2 \approx -2.8 < 0$. Prueba el botón **Fumar y edad** en el simulador de variable omitida: reproduce estas dos regresiones.

<div class="econ-widget" data-widget="simpson"></div>

<div class="econ-practica" id="practica-7">
<p class="econ-practica-t"><span>✍️ Practica · Tema 7</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En el ejemplo, el coeficiente de fumar es −1.81 sin edad y 0.94 con edad. ¿Qué ocurrió?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Omitir la edad generaba un sesgo negativo tan grande que invertía el signo del efecto de fumar.</button>
<button class="econ-quiz-opt" data-why="Si el modelo con edad es el verdadero, el sesgo estaba en la regresión corta.">Agregar la edad generó un sesgo.</button>
<button class="econ-quiz-opt" data-why="La población es la misma; cambió la comparación que hace la regresión.">El efecto de fumar cambió en la población.</button>
</div>
<p class="econ-quiz-fb">✅ −1.81 = 0.94 + 0.98 · δ₂ con δ₂ ≈ −2.8: los mayores fuman menos, y la edad aumenta y.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Cuándo basta con agregar un control para eliminar el sesgo?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Cuando es la única variable omitida relevante: conocemos el modelo verdadero.</button>
<button class="econ-quiz-opt" data-why="El R² mide ajuste, no ausencia de sesgo.">Siempre que el R² aumente.</button>
<button class="econ-quiz-opt" data-why="El tamaño muestral no resuelve el sesgo por omisión.">Cuando el control tiene muchas observaciones.</button>
</div>
<p class="econ-quiz-fb">✅ Es la advertencia de la lámina 7: muchas veces no alcanza, porque hay otras variables omitidas.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Fumar, edad y un cambio de signo</p>

Datos simulados que imitan las dos salidas de Stata de las láminas 8 y 9. Estima ambas regresiones, obtén δ₂ con la regresión auxiliar y mira el gráfico.

```r
# Datos simulados que imitan las láminas 8 y 9 (n = 100)
set.seed(2026)
n     <- 100
edad  <- runif(n, 20, 80)
fumar <- 30 - 0.3 * edad + rnorm(n, sd = 2.3)  # mayores fuman menos
y     <- 13 + 0.94 * fumar + 0.98 * edad + rnorm(n)

corta <- lm(y ~ fumar)            # como "reg y smoke"
larga <- lm(y ~ fumar + edad)     # como "reg y smoke age"
round(coef(corta), 3)
round(coef(larga), 3)

delta2 <- coef(lm(edad ~ fumar))["fumar"]          # ¿qué signo tiene?
delta2
# beta1 + beta2 * delta2 = coeficiente de la regresión corta
coef(larga)["fumar"] + coef(larga)["edad"] * delta2

# Dentro de cada grupo de edad, la pendiente es positiva; juntos, negativa
plot(fumar, y, pch = 19, col = ifelse(edad > 50, "firebrick", "steelblue"),
     main = "Rojo: mayores de 50 · Azul: 50 o menos")
abline(corta, lwd = 2)
```

**🎯 Reto:** cambia `- 0.3 * edad` por `+ 0.3 * edad` (los mayores fuman más). Antes de ejecutar, predice el signo del sesgo.
{: .econ-r-reto }

</div>

### ¿Más es mejor? Controles irrelevantes y conclusiones { #tema-8 .econ-tema data-num="8" data-laminas="Parte 2 · láminas 10–12" data-toc-label="Tema 8 · ¿Más es mejor? Conclusiones" }

<p class="econ-tema-q">Si omitir variables sesga, ¿conviene agregar todas las que tengamos?</p>

<div class="econ-lamina" markdown>

#### ¿Más es mejor? { data-lamina="Lámina 10" }

<!-- sem3/Clase4.tex · lámina 10 -->

-   Uno podría pensar que tiene que agregar todas las variables posibles al modelo, para evitar omitir variables.

-   Sin embargo, esto trae problemas.

-   Se dice que un modelo está sobreespecificado cuando se incluye en la regresión variables que no forman parte del modelo poblacional.

-   Incluir variables irrelevantes en el modelo no influye en el insesgamiento de los estimadores, pero incrementa la varianza de los estimadores.

</div>

<div class="econ-widget" data-widget="mas-controles"></div>

<div class="econ-lamina" markdown>

#### Sin sesgo de selección { data-lamina="Lámina 11" }

<!-- sem3/Clase4.tex · lámina 11 -->

-   Si tenemos la suerte de tener una aleatorización que nos garantiza que no haya sesgo de selección, ¿importa agregar variables adicionales?

-   Si $X_{1}$ (o $T_{i}$ en términos de tratamiento) se determina de forma aleatoria, nos garantiza que $E\left[\epsilon_{i} \mid X_{i}\right]=0$

-   ¡La correlación entre cualquier variable no incluida en el modelo y el tratamiento será 0!

-   Entonces, no necesitamos incluir otras variables en el modelo para evitar sesgos.

</div>

<div class="econ-lamina" markdown>

#### Conclusiones { data-lamina="Lámina 12" }

<!-- sem3/Clase4.tex · lámina 12 -->

-   Incluir variables a un modelo cambia la interpretación de nuestra variable de interés.

-   El impacto de la exclusión de una variable relevante depende de la correlación entre la variable de interés y la variable omitida y la relación entre la variable omitida y el outcome.

-   El supuesto clave de MCO para que no haya sesgo es que $E[\epsilon \mid X]=0$.

-   Es poco frequente que tengamos TODAS las variables que determinan la asignación y entonces, es poco probable que la inclusión de variables nos permita dar una interpretación causal a una regresión lineal.

</div>

<div class="econ-practica" id="practica-8">
<p class="econ-practica-t"><span>✍️ Practica · Tema 8</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Agregas al modelo una variable irrelevante (su β poblacional es 0) que está muy correlacionada con x₁. ¿Qué le pasa a β̂₁?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Sigue siendo insesgado, pero su varianza aumenta.</button>
<button class="econ-quiz-opt" data-why="Incluir variables irrelevantes no afecta el insesgamiento (lámina 10).">Queda sesgado.</button>
<button class="econ-quiz-opt" data-why="Al revés: la variable irrelevante compite con x₁ y aumenta la varianza.">Se vuelve más preciso.</button>
</div>
<p class="econ-quiz-fb">✅ Es la lámina 10. El ejercicio de R de abajo lo muestra con 2 000 muestras.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Por qué es poco probable que agregar controles permita una interpretación causal con datos observacionales?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Porque rara vez observamos TODAS las variables que determinan quién recibe el tratamiento.</button>
<button class="econ-quiz-opt" data-why="Un control relevante reduce el sesgo; el problema es que faltan otros.">Porque los controles siempre aumentan el sesgo.</button>
<button class="econ-quiz-opt" data-why="MCO admite muchas variables: lo veremos en la regresión múltiple.">Porque MCO no admite más de dos variables.</button>
</div>
<p class="econ-quiz-fb">✅ Es la última conclusión de la lámina 12.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · ¿Agregar una variable irrelevante?</p>

Repite 2 000 veces el experimento: estima β₁ sin y con una variable irrelevante correlacionada con x₁, y compara el promedio y la dispersión.

```r
set.seed(10)
sim <- replicate(2000, {
  n  <- 50
  x1 <- rnorm(n)
  x3 <- 0.9 * x1 + rnorm(n, sd = 0.45)   # correlacionada con x1…
  y  <- 1 + 2 * x1 + rnorm(n)            # …pero irrelevante para y
  c(sin_x3 = unname(coef(lm(y ~ x1))["x1"]),
    con_x3 = unname(coef(lm(y ~ x1 + x3))["x1"]))
})
rowMeans(sim)        # ambos ≈ 2: incluir x3 no sesga
apply(sim, 1, sd)    # pero con x3 la dispersión es mucho mayor
boxplot(t(sim), col = c("steelblue", "goldenrod"), ylab = "beta1 estimado",
        main = "2 000 muestras: sin y con la variable irrelevante")
abline(h = 2, lty = 2)
```

**🎯 Reto:** cambia `0.9 * x1` por `0 * x1` (irrelevante y no correlacionada). ¿Sigue aumentando la dispersión?
{: .econ-r-reto }

</div>

---

!!! abstract "🧠 Ideas clave"
    - Para cada persona solo vemos **un** outcome potencial: el contrafactual nunca se observa.
    - **Diferencia observada = ATT + sesgo de selección**; el sesgo existe si los grupos ya eran distintos sin tratamiento.
    - La **aleatorización** elimina el sesgo de selección: $\beta = ATE = ATT$.
    - Omitir una variable relevante sesga: $\tilde{\beta}_1 = \beta_1 + \beta_2 \delta_1$, y su signo depende de los signos de $\beta_2$ y $\delta_1$.
    - Controlar por la omitida corrige el sesgo **si la observamos**; agregar variables irrelevantes no sesga, pero **aumenta la varianza**.

## ✅ Autoevaluación

<div class="econ-quiz">
<p class="econ-quiz-q">Comparas el salario de quienes hicieron un MBA con el de quienes no. ¿Qué representa el sesgo de selección?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">La diferencia entre el salario con y sin MBA de quienes lo hicieron.</button>
<button class="econ-quiz-opt" data-correct>La diferencia de salario que habría existido entre ambos grupos aun si nadie hubiera hecho el MBA.</button>
<button class="econ-quiz-opt">El error de muestreo de la diferencia de promedios.</button>
</div>
<p class="econ-quiz-fb">✅ Sesgo de selección = E[Yᴺᵀ | T=1] − E[Yᴺᵀ | T=0]. La primera opción es el ATT; la tercera es variabilidad muestral.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Estimas el efecto de las clases particulares sobre la nota final omitiendo la nota previa. Quienes tienen peor nota previa toman más clases, y la nota previa sube la nota final. ¿Qué signo tiene el sesgo?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">Positivo: la regresión corta sobreestima el efecto de las clases.</button>
<button class="econ-quiz-opt" data-correct>Negativo: la regresión corta subestima el efecto (incluso podría parecer que las clases bajan la nota).</button>
<button class="econ-quiz-opt">No hay sesgo, porque la variable omitida no es la de interés.</button>
</div>
<p class="econ-quiz-fb">✅ δ₁ &lt; 0 (peor nota previa, más clases) y β₂ &gt; 0 (la nota previa sube la final) ⇒ β₂·δ₁ &lt; 0: caso 3 de la tabla de signos.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Un programa de capacitación se asignó por sorteo. ¿Es necesario agregar controles para obtener un estimador insesgado del efecto?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt">Sí, siempre hay que controlar por todas las características observables.</button>
<button class="econ-quiz-opt" data-correct>No: con aleatorización la correlación entre el tratamiento y cualquier variable omitida es 0.</button>
<button class="econ-quiz-opt">Solo si el R² de la regresión es bajo.</button>
</div>
<p class="econ-quiz-fb">✅ Es la lámina <em>Sin sesgo de selección</em>: con aleatorización δ₁ = 0 <em>en la población</em> para cualquier omitida, así que β₂·δ₁ = 0. Agregar controles que sí predicen y puede, de todos modos, mejorar la precisión.</p>
</div>

## 📚 Para la próxima clase

- **Repaso:** Wooldridge, sección 3.3 (sesgo por variable omitida). **Para la próxima clase:** secciones 3.1–3.2 (*Análisis de regresión múltiple: estimación*).
- 📖 Comienza la lectura del **Certamen 1** (lunes 16 de noviembre): Miguel, E. y Kremer, M. (2004).
  *Worms: Identifying Impacts on Education and Health in the Presence of Treatment
  Externalities.* Econometrica, 72(1).
- Próxima clase: **Regresión lineal múltiple: estimación**.
