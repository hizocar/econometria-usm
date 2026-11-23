<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->

# Clase 11 · Variables binarias, test de Chow y modelo de probabilidad lineal

<div class="usm-session-meta">
<span>📅 Fecha por confirmar (el viernes 25 de diciembre es feriado)</span>
<span class="usm-tag-gold">Semana 11 · Contenido 6 · Variables binarias</span>
</div>

!!! info "Contenido oficial de la semana"
    Esta página reproduce **íntegras y en orden** las diapositivas de la cátedra de la semana 11:
    `sem11/clase 12.tex` (Parte 1) y `sem11/clase13.tex` (Parte 2). Los ejercicios resueltos de la semana
    están en la [📘 Ayudantía 11](../ayudantias/ayudantia11.md). Los bloques **Interactivo** y las preguntas
    son material adicional para estudiar.

!!! example "Cómo estudiar esta página"
    La clase está ordenada en **5 temas**. Cada tema parte con una **pregunta guía**, sigue con las láminas
    y los simuladores, y termina con **✍️ preguntas de selección múltiple** (cada alternativa incorrecta explica
    por qué no lo es) y un **🧪 ejercicio de R** que puedes editar y ejecutar aquí mismo, sin instalar nada.
    Los 5 ejercicios de R en un solo archivo: [📥 clase11.R](../r/clase11.R).

## 🎯 Objetivos de la sesión

- Incorporar información cualitativa con **variables dummy** e interpretar diferencias de **intercepto** y de **pendiente**.
- Usar variables con **más de dos categorías** respecto de una categoría base.
- Testear si un modelo es igual entre grupos con el **test de Chow**.
- Estimar e interpretar el **modelo de probabilidad lineal** y conocer sus problemas.

## 🗓️ Agenda de la cátedra (3 horas)

La fecha se confirmará porque el viernes de la semana es feriado. Haz clic en un tema para ir directo a él.

<ol class="econ-ruta">
<li><span class="econ-ruta-h">18:40</span><a class="econ-ruta-a" href="#tema-1"><span class="econ-ruta-n">1</span><span class="econ-ruta-t">Variables dummy: diferencias de intercepto</span><span class="econ-ruta-l">Parte 1 · láminas 1–6 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">19:10</span><a class="econ-ruta-a" href="#tema-2"><span class="econ-ruta-n">2</span><span class="econ-ruta-t">Más de dos categorías</span><span class="econ-ruta-l">Parte 1 · láminas 7–9 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">19:30</span><a class="econ-ruta-a" href="#tema-3"><span class="econ-ruta-n">3</span><span class="econ-ruta-t">Interacciones con dummies</span><span class="econ-ruta-l">Parte 1 · láminas 10–14 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li class="is-break"><span class="econ-ruta-h">19:55</span><span class="econ-ruta-t">☕ Receso</span></li>
<li><span class="econ-ruta-h">20:05</span><a class="econ-ruta-a" href="#tema-4"><span class="econ-ruta-n">4</span><span class="econ-ruta-t">El test de Chow</span><span class="econ-ruta-l">Parte 2 · láminas 1–4 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li><span class="econ-ruta-h">20:40</span><a class="econ-ruta-a" href="#tema-5"><span class="econ-ruta-n">5</span><span class="econ-ruta-t">Variable dependiente binaria: el MPL</span><span class="econ-ruta-l">Parte 2 · láminas 5–8 · ✍️ 2 preguntas · 🧪 R</span></a></li>
<li class="is-break"><span class="econ-ruta-h">21:15</span><span class="econ-ruta-t">✅ Ideas clave, autoevaluación y cierre</span></li>
</ol>

📘 **Ayudantía de la semana** · se trabaja otro día, en su propia página: [Ir a la Ayudantía 11 →](../ayudantias/ayudantia11.md)
{: .econ-ruta-sub }

## Variables independientes binarias { .econ-parte data-eyebrow="Parte 1 · Cátedra" data-toc-label="Parte 1 · Variables independientes binarias" }

<p class="econ-source">📄 Diapositivas: <code>sem11/clase 12.tex</code> · 14 láminas</p>

### Variables dummy: diferencias de intercepto { #tema-1 .econ-tema data-num="1" data-laminas="Parte 1 · láminas 1–6" data-toc-label="Tema 1 · Dummies e intercepto" }

<p class="econ-tema-q">¿Cómo meter información cualitativa, como el género, en una regresión?</p>

<div class="econ-lamina" markdown>

#### Introducción { data-lamina="Lámina 1" }

<!-- sem11/clase 12.tex · lámina 1 -->

-   Usando variables binarias podemos incorporar información cualitativa como:

    -   región

    -   género

    -   raza

    -   religión

    -   situación marital

    -   rama de actividad económica

    -   participación en sindicatos

    -   carrera universitaria

</div>

<div class="econ-lamina" markdown>

#### Variables Dummy (binarias o dicotómicas) { data-lamina="Lámina 2" }

<!-- sem11/clase 12.tex · lámina 2 -->

-   En todos estos casos se puede definir una o más variables que toman dos valores, 0 ó 1, en que 1 representa la posesión de una cualidad y 0 la ausencia.

-   Estas variables son llamadas variables dummy.

-   Podemos distinguir dos tipos de efectos:

    -   Efecto aditivo (diferencias de intercepto)

    -   Efecto interacción (diferencias de pendiente)

</div>

<div class="econ-lamina" markdown>

#### Efecto aditivo { data-lamina="Lámina 3" }

<!-- sem11/clase 12.tex · lámina 3 -->

-   Suponga el caso de una variable regresora dummy para la variable género (asumiendo que solo hay hombres o mujeres en la base de datos),

    $$
    \text{salario} = \beta_0 + \delta_0 \text{mujer} + \beta_1 \text{educ} + u
    $$

-   Podemos generar una variable "mujer" que toma valor 1 si es mujer y cero si es hombre.

-   Noten que dado supuesto de $E[u | mujer, educ] = 0$:

    $$
    E[\text{salario} | \text{mujer} = 0, \text{educ}] = \beta_0 + \beta_1 \text{educ} \quad \textcolor{gray}{\text{reemplazando mujer=0}}
    $$

    $$
    E[\text{salario} | \text{mujer} = 1, \text{educ}] = \beta_0 + \delta_0 + \beta_1 \text{educ} \quad \textcolor{gray}{\text{reemplazando mujer=1}}
    $$

</div>

<div class="econ-lamina" markdown>

#### Gráfico: $\delta_0 < 0$ (Discriminacion salarial a mujeres) { data-lamina="Lámina 4" data-toc-label="Gráfico: δ0 < 0 (Discriminacion salarial a mujeres)" }

<!-- sem11/clase 12.tex · lámina 4 -->

<svg class="econ-tikz-svg econ-tikz-plot" viewBox="0 0 360 277" role="img" aria-label="Dos rectas paralelas: mujer=1 tiene un intercepto menor, β₀ + δ₀" style="max-width:360px;width:100%"><defs><marker id="ahk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="60" y1="237.0" x2="290" y2="237.0" stroke="currentColor" marker-end="url(#ahk)"/><line x1="60" y1="237.0" x2="60" y2="30.0" stroke="currentColor" marker-end="url(#ahk)"/><text x="294" y="251.0" font-style="italic" fill="currentColor">educ</text><text x="54" y="34.0" text-anchor="end" font-style="italic" fill="currentColor">salario</text><line x1="60" y1="168.0" x2="267.0" y2="57.599999999999994" stroke="#1d4ed8" stroke-width="2.6"/><text x="271.0" y="51.599999999999994" fill="currentColor">mujer=0</text><line x1="60" y1="204.8" x2="267.0" y2="94.4" stroke="currentColor" stroke-width="2.6"/><text x="271.0" y="108.4" fill="currentColor">mujer=1</text><line x1="50.8" y1="168.0" x2="60" y2="168.0" stroke="currentColor" stroke-dasharray="3 2"/><text x="46.2" y="172.0" text-anchor="end" fill="currentColor">β₀</text><line x1="50.8" y1="204.8" x2="60" y2="204.8" stroke="currentColor" stroke-dasharray="3 2"/><text x="46.2" y="208.8" text-anchor="end" fill="currentColor">β₀ + δ₀</text></svg>
$E(salario| mujer, educ) = \beta_0 + \delta_0 \, mujer + \beta_1 \, educ$ en la que $\delta_0 < 0$.

</div>

<div class="econ-lamina" markdown>

#### Efecto aditivo { data-lamina="Lámina 5" }

<!-- sem11/clase 12.tex · lámina 5 -->

-   ¿Cómo se testea la hipótesis nula de no discriminación salarial contra las mujeres?

    $$
    H_0: \delta_0 = 0
    $$

    $$
    H_1: \delta_0 < 0
    $$

</div>

<div class="econ-lamina" markdown>

#### Regla de oro de las variables de categoría { data-lamina="Lámina 6" }

<!-- sem11/clase 12.tex · lámina 6 -->

-   Si hay $q$ categorías, se pueden incluir hasta $q - 1$ categorías. En nuestro ejemplo, $q = 2$.

-   La constante toma el promedio de la categoría que no incluyeron. Esta se llama categoría base.

</div>

<div class="econ-practica" id="practica-1">
<p class="econ-practica-t"><span>✍️ Practica · Tema 1</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En salario = β₀ + δ₀·mujer + β₁·educ + u, ¿qué mide δ₀?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>La diferencia de salario esperado entre mujeres y hombres con la misma educación.</button>
<button class="econ-quiz-opt" data-why="Ese es β₀ + δ₀ + β₁·educ.">El salario promedio de las mujeres.</button>
<button class="econ-quiz-opt" data-why="Eso requeriría una interacción mujer·educ.">La diferencia en el retorno a la educación.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 3: efecto aditivo, una diferencia de intercepto.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">Con 4 categorías (economía, medicina, ingeniería, sin universidad), ¿cuántas dummies se incluyen junto con el intercepto?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-why="Con 4 dummies e intercepto hay colinealidad perfecta: la trampa de las dummies.">4</button>
<button class="econ-quiz-opt" data-correct>3</button>
<button class="econ-quiz-opt" data-why="Se pueden incluir hasta q − 1 = 3.">2</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 6: con q categorías, hasta q − 1 dummies. La omitida es la categoría base.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Dos rectas paralelas</p>

Simula salarios con una dummy de género y verifica que el intercepto de las mujeres es β₀ + δ₀.

```r
set.seed(21)
n     <- 400
mujer <- rbinom(n, 1, 0.5)
educ  <- sample(8:18, n, replace = TRUE)
salario <- 1.5 - 1 * mujer + 0.55 * educ + rnorm(n)    # delta0 = −1

m <- lm(salario ~ mujer + educ)
coef(m)
# Dos rectas paralelas: mismo efecto de educ, interceptos distintos
c(intercepto_hombres = unname(coef(m)[1]),
  intercepto_mujeres = unname(coef(m)[1] + coef(m)[2]))
```

**🎯 Reto:** agrega la dummy `hombre <- 1 - mujer` al modelo junto con `mujer`. ¿Qué entrega R? ¿Por qué?
{: .econ-r-reto }

</div>

### Más de dos categorías { #tema-2 .econ-tema data-num="2" data-laminas="Parte 1 · láminas 7–9" data-toc-label="Tema 2 · Varias categorías" }

<p class="econ-tema-q">¿Cómo se comparan cuatro carreras en una sola regresión?</p>

<div class="econ-lamina" markdown>

#### Variables Dummy con más de 2 categorías { data-lamina="Lámina 7" }

<!-- sem11/clase 12.tex · lámina 7 -->

-   ¿Qué hacer cuando se usa una variable cualitativa como Carrera Universitaria, que tiene $q > 2$ categorías? Supongamos que existen SOLO 4 opciones: Economía, Medicina, Ingeniería, No hizo universidad.

-   Se crean $q - 1$ variables binarias. Cada una correspondiente a una dummy que vale 1 para una cierta categoría y 0 en otro caso. Variables: Economía, Medicina, Ingeniería.

-   La categoría cuya variable dummy no fue incluida se considera la categoría base y la interpretación de los coeficientes de las categorías restantes se hace en relación a esta categoría base.

</div>

<div class="econ-lamina" markdown>

#### Ejemplo: salario por carrera universitaria { data-lamina="Láminas 8–9" }

<!-- sem11/clase 12.tex · lámina 8 -->

-   Considere una variable con cuatro categorías: economía, medicina, ingeniería, no terminó universidad.

-   *salario* = $\beta_0$ + $\beta_1$economía + $\beta_2$medicina + $\beta_3$Ingeniería + $u$

-   $\hat{salario} = 100 + 500$economía + 300medicina + 600Ingeniería

<!-- sem11/clase 12.tex · lámina 9 -->

-   Considere una variable con cuatro categorías: economía, medicina, ingeniería, no terminó universidad.

-   *salario* = $\beta_0$ + $\beta_1$economía + $\beta_2$medicina + $\beta_3$Ingeniería + $u$

-   $\hat{salario} = 100 + 500$economía + 300medicina + 600Ingeniería

-   ¿Cómo se interpreta $\hat{\beta_0} = 100$?

    -   $\beta_0$: $E[salario|econ = 0, med = 0, ing = 0]$. Es decir, el promedio de salario para los individuos en la categoría base (en este caso, no universidad).

    -   Entonces, los individuos que no fueron a la universidad ganan en promedio 100 dólares mensuales.

-   Noten que el promedio para los que estudiaron economía es:

    -   $E[salario|econ = 1, med = 0, ing = 0] = \beta_0 + \beta_1$.

    -   Entonces, $\beta_1$ es la diferencia promedio de salario entre estudiar economía y los que no fueron a la universidad.

    -   En promedio se estima, los que estudian economía ganan 500 dólares más que los que no estudian.

-   $\beta_2$: la diferencia promedio entre estudiar medicina y no estudiar.

-   $\beta_3$: la diferencia promedio entre estudiar ingeniería y no estudiar.

-   ¿Cómo comparo economía versus medicina?

</div>

<div class="econ-practica" id="practica-2">
<p class="econ-practica-t"><span>✍️ Practica · Tema 2</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">Con salario = 100 + 500·economía + 300·medicina + 600·ingeniería, ¿cuánto ganan en promedio los de medicina?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>400</button>
<button class="econ-quiz-opt" data-why="300 es la diferencia respecto de la categoría base; hay que sumar el intercepto.">300</button>
<button class="econ-quiz-opt" data-why="100 es el promedio de la categoría base (sin universidad).">100</button>
</div>
<p class="econ-quiz-fb">✅ β₀ + β₂ = 100 + 300 = 400.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Cuál es la diferencia promedio entre economía y medicina?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>200 a favor de economía.</button>
<button class="econ-quiz-opt" data-why="500 es la diferencia de economía con la categoría base.">500</button>
<button class="econ-quiz-opt" data-why="Sí se puede: β₁ − β₂ = 500 − 300.">No se puede calcular con esta regresión.</button>
</div>
<p class="econ-quiz-fb">✅ Responde la pregunta de la lámina 9.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Categorías y categoría base</p>

Simula los salarios de la lámina 8, estima con `factor()` y cambia la categoría base con `relevel()`.

```r
# Lámina 8: salario = 100 + 500 economía + 300 medicina + 600 ingeniería
set.seed(22)
carrera <- factor(sample(c("ninguna", "economia", "medicina", "ingenieria"), 800, replace = TRUE),
                  levels = c("ninguna", "economia", "medicina", "ingenieria"))
media   <- c(ninguna = 100, economia = 600, medicina = 400, ingenieria = 700)
salario <- media[as.character(carrera)] + rnorm(800, sd = 50)

coef(lm(salario ~ carrera))           # base: ninguna (la primera categoría)
tapply(salario, carrera, mean)        # los promedios por grupo
coef(lm(salario ~ relevel(carrera, ref = "medicina")))   # economía vs. medicina directo
```

**🎯 Reto:** usa `ref = "ingenieria"`. ¿Qué signo tienen ahora los coeficientes?
{: .econ-r-reto }

</div>

### Interacciones con dummies { #tema-3 .econ-tema data-num="3" data-laminas="Parte 1 · láminas 10–14" data-toc-label="Tema 3 · Interacciones" }

<p class="econ-tema-q">¿Y si la brecha depende de otra característica?</p>

<div class="econ-lamina" markdown>

#### Interacción entre variables dummy { data-lamina="Láminas 10–11" }

<!-- sem11/clase 12.tex · lámina 10 -->

-   Considere el siguiente modelo:

    $$
    \text{wage} = \beta_0 + \beta_1 \text{mujer} + \beta_2 \text{casad} + \beta_3 \text{mujer} \times \text{casad} + u
    $$

-   Esto nos permite testear, por ejemplo, si la discriminación salarial depende del estado civil de las mujeres o si el premio por matrimonio afecta diferente a hombres o mujeres.

-   Noten que los coeficientes nos ayudan a entender los promedios para los 4 subgrupos de la población.

    1.  $E[wage|mujer = 0, casad = 0] = \beta_0$: promedio para hombres solteros.

    2.  $E[wage|mujer = 1, casad = 0] = \beta_0 + \beta_1$: promedio para mujeres solteras.

    3.  $E[wage|mujer = 0, casad = 1] = \beta_0 + \beta_2$: promedio para hombres casados.

    4.  $E[wage|mujer = 1, casad = 1] = \beta_0 + \beta_1 + \beta_2 + \beta_3$: promedio para mujeres casadas.

-   $(2) - (1) = \beta_1$: La diferencia salarial entre las mujeres y los hombres cuando ambos son solteros.

-   $(3) - (1) = \beta_2$: La diferencia salarial entre casados y solteros, para el grupo de hombres.

-   $(4) - (3) = \beta_1 + \beta_3$: La diferencia salarial entre mujeres y hombres, cuando ambos están casados.

-   $\beta_3$: La diferencia extra que hay en la discriminacion salarial a las mujeres por estar casadas.

<!-- sem11/clase 12.tex · lámina 11 -->

-   Considere el siguiente modelo:

    $$
    \text{wage} = \beta_0 + \beta_1 \text{mujer} + \beta_2 \text{casad} + \beta_3 \text{mujer} \times \text{casad} + u
    $$

-   Otra forma de verlo es pensar en cómo cambia *wage* cuando cambia el estado civil:

    $$
    \beta_2 + \beta_3 \times \text{mujer}
    $$

    -   $\beta_2$: el efecto de estar casado para los hombres.

    -   $\beta_2 + \beta_3$: el efecto de estar casado para las mujeres.

    -   **$\beta_3$: la diferencia del premio por matrimonio para hombres y para mujeres.**

-   **Entonces, testear la hipótesis nula de que el premio por matrimonio no depende del género corresponde a testear que el coeficiente $\beta_3$ no es significativo.**

</div>

<div class="econ-lamina" markdown>

#### Interacción con variables cuantitativas { data-lamina="Lámina 12" }

<!-- sem11/clase 12.tex · lámina 12 -->

-   Considere el siguiente modelo:

    $$
    salario = \beta_0 + \delta_0 \cdot mujer + \beta_1 \cdot educ + \delta_1 \cdot mujer \cdot educ + u
    $$

**Diferencia de interceptos**

-   Para los hombres, el intercepto es $\beta_0$ ($educ = 0$; $mujer = 0$)

-   Para las mujeres, el intercepto es $\beta_0 + \delta_0$ ($educ = 0$; $mujer = 1$)

-   $\delta_0$: mide la diferencia en los interceptos entre mujeres y hombres. Es decir, la diferencia salarial entre hombres y mujeres con cero años de educación.

**Diferencia de pendiente**

-   Noten que la interacción nos permite tener también pendientes diferentes del efecto de educación para cada grupo:

    $$
    \frac{\triangle salario}{\triangle educ} = \beta_1 + \delta_1 \cdot mujer
    $$

-   $\beta_1$: el efecto de un año más de educación en salarios para los hombres.

-   $\beta_1 + \delta_1$: el efecto de un año más de educación para las mujeres.

-   $\delta_1$: la diferencia en los retornos a la educación de las mujeres con respecto a los hombres.

</div>

<div class="econ-lamina" markdown>

#### Ejemplo: diferentes pendientes e interceptos para mujer y hombres { data-lamina="Lámina 13" }

<!-- sem11/clase 12.tex · lámina 13 -->

<svg class="econ-tikz-svg econ-tikz-plot" viewBox="0 0 498 208" role="img" aria-label="Panel a: la recta de mujeres tiene menor intercepto y menor pendiente. Panel b: menor intercepto pero mayor pendiente" style="max-width:498px;width:100%"><defs><marker id="ahk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="60" y1="168" x2="198" y2="168" stroke="currentColor" marker-end="url(#ahk)"/><line x1="60" y1="168" x2="60" y2="30" stroke="currentColor" marker-end="url(#ahk)"/><text x="202" y="182" font-style="italic" fill="currentColor">educ</text><text x="54" y="34" text-anchor="end" font-style="italic" fill="currentColor">salario</text><line x1="60" y1="135.8" x2="175.0" y2="43.8" stroke="currentColor" stroke-width="2.6"/><text x="179.0" y="37.8" fill="currentColor">hombre</text><line x1="60" y1="158.8" x2="175.0" y2="99.0" stroke="#1d4ed8" stroke-width="2.6"/><text x="179.0" y="113.0" fill="currentColor">mujer</text><text x="129.0" y="195.0" text-anchor="middle" fill="currentColor">(a)</text><line x1="290" y1="168" x2="428" y2="168" stroke="currentColor" marker-end="url(#ahk)"/><line x1="290" y1="168" x2="290" y2="30" stroke="currentColor" marker-end="url(#ahk)"/><text x="432" y="182" font-style="italic" fill="currentColor">educ</text><text x="284" y="34" text-anchor="end" font-style="italic" fill="currentColor">salario</text><line x1="290" y1="140.4" x2="405.0" y2="76.0" stroke="currentColor" stroke-width="2.6"/><text x="409.0" y="90.0" fill="currentColor">hombre</text><line x1="290" y1="158.8" x2="405.0" y2="53.0" stroke="#1d4ed8" stroke-width="2.6"/><text x="409.0" y="47.0" fill="currentColor">mujer</text><text x="359.0" y="195.0" text-anchor="middle" fill="currentColor">(b)</text></svg>
(a) $\delta_0 < 0$, $\delta_1 < 0$ (b) $\delta_0 < 0$, $\delta_1 > 0$.

</div>

<div class="econ-widget" data-widget="dummies"></div>

<div class="econ-lamina" markdown>

#### Test de hipótesis { data-lamina="Lámina 14" }

<!-- sem11/clase 12.tex · lámina 14 -->

$$
salario = \beta_0 + \delta_0 \cdot mujer + \beta_1 \cdot educ + \delta_1 \cdot mujer \cdot educ + u
$$

-   ¿Cómo testearía que los retornos a un año más de educación son diferentes para hombres y mujeres? $H_0: \delta_1 = 0$<br>
    $H_1: \delta_1 \neq 0$ Si rechazo la hipótesis nula, entonces los retornos son diferentes.

<!-- -->
-   ¿Cómo testearía que las mujeres ganan diferente a los hombres dada sus características? Noten que esto puede ser por diferencias en el intercepto o por diferencias en la pendiente. → $H_0: \delta_0 = \delta_1 = 0$ Si rechazo la hipótesis nula, entonces hay diferencias en las remuneraciones de las mujeres con respecto a los hombres.

<!-- -->
-   Pueden hacer un test F como los que vimos en clases pasadas.

</div>

<div class="econ-practica" id="practica-3">
<p class="econ-practica-t"><span>✍️ Practica · Tema 3</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En wage = β₀ + β₁·mujer + β₂·casad + β₃·mujer·casad, ¿cuál es el promedio de las mujeres casadas?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>β₀ + β₁ + β₂ + β₃</button>
<button class="econ-quiz-opt" data-why="Ese es el de las mujeres solteras.">β₀ + β₁</button>
<button class="econ-quiz-opt" data-why="β₃ es solo la diferencia adicional por la interacción.">β₃</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 10, grupo 4.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">En salario = β₀ + δ₀·mujer + β₁·educ + δ₁·mujer·educ, ¿cómo testeas que las mujeres ganan igual que los hombres dadas sus características?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>H₀: δ₀ = δ₁ = 0, con un test F.</button>
<button class="econ-quiz-opt" data-why="Así se ignora una posible diferencia en la pendiente.">H₀: δ₀ = 0, con un test t.</button>
<button class="econ-quiz-opt" data-why="β₁ es el retorno a la educación de los hombres.">H₀: β₁ = 0.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 14.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Interacción y test F</p>

Simula salarios con diferencias de intercepto y de pendiente, y testea H₀: δ₀ = δ₁ = 0.

```r
set.seed(23)
n     <- 500
mujer <- rbinom(n, 1, 0.5)
educ  <- sample(8:18, n, replace = TRUE)
salario <- 1.5 - 0.5 * mujer + 0.55 * educ + 0.2 * mujer * educ + rnorm(n)

ur <- lm(salario ~ mujer * educ)       # = mujer + educ + mujer:educ
coef(ur)
r  <- lm(salario ~ educ)               # H0: delta0 = delta1 = 0
anova(r, ur)                           # test F de la lámina 14
```

**🎯 Reto:** cambia `0.2 * mujer * educ` por `0 * mujer * educ`. ¿Sigue rechazándose H₀?
{: .econ-r-reto }

</div>

## Test de Chow y variables dependientes binarias { .econ-parte data-eyebrow="Parte 2 · Cátedra" data-toc-label="Parte 2 · Test de Chow y variables dependientes binarias" }

<p class="econ-source">📄 Diapositivas: <code>sem11/clase13.tex</code> · 8 láminas</p>

### El test de Chow { #tema-4 .econ-tema data-num="4" data-laminas="Parte 2 · láminas 1–4" data-toc-label="Tema 4 · Test de Chow" }

<p class="econ-tema-q">¿Es el mismo modelo para hombres y mujeres?</p>

<div class="econ-lamina" markdown>

#### Diferencias entre grupos { data-lamina="Lámina 1" }

<!-- sem11/clase13.tex · lámina 1 -->

-   Suponga el siguiente modelo:

    $$
    y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \beta_3 x_3 + u
    $$

    y que se puede clasificar las $n$ observaciones en $G$ grupos distintos.

<!-- -->
-   Se quiere testear que el modelo es el mismo para todos los grupos, es decir, los coeficientes son los mismos.

-   En series de tiempo esto equivale a testear un cambio de régimen o cambio "estructural".

<!-- -->
-   Suponga $G = 2$. Para realizar el test planteamos el modelo sin restringir:

    $$
    y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \beta_3 x_3 + \gamma_0 D + \gamma_1 x_1 D + \gamma_2 x_2 D + \gamma_3 x_3 D + u
    $$

    donde $D$ es una variable dummy para observaciones de un mismo grupo (e.g: mujer).

<!-- -->
-   La hipótesis nula correspondiente es:

    $$
    H_0 : \gamma_0 = \gamma_1 = \gamma_2 = \gamma_3 = 0
    $$

-   Y se puede hacer un test F.

</div>

<div class="econ-lamina" markdown>

#### Test de Chow: diferencias entre grupos { data-lamina="Lámina 2" }

<!-- sem11/clase13.tex · lámina 2 -->

-   Otra forma de verificar esta hipótesis es usando el Test de Chow que plantea hacer una regresión para cada grupo.

-   Estimar la ecuación:

    $$
    y = \beta_{0}^g + \beta_{1}^g x_1 + \beta_{2}^g x_2 + \beta_{3}^g x_3 + u
    $$

    para cada subpoblación $g = 1, \ldots, G$.

<!-- -->
-   Obtener la $SSR_g$ correspondiente a la regresión para dicho subgrupo, y construir $SSR_{ur} = \sum_{g=1}^G SSR_g$.

-   Estimar la ecuación restringida:

    $$
    y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \beta_3 x_3 + u
    $$

    usando todas las observaciones y obtener su $SSR_r$.

<!-- -->
-   Construir el estadístico del Test de Chow:

    $$
    F = \frac{(SSR_r - SSR_{ur}) / ((G - 1)(k + 1))}{SSR_{ur} / (n - G(k + 1))} \sim F((G - 1)(k + 1), n - G(k + 1))
    $$

</div>

<div class="econ-lamina" markdown>

#### Ejemplo test de Chow { data-lamina="Lámina 3" }

<!-- sem11/clase13.tex · lámina 3 -->

$$
\log(wage) = \beta_0 + \beta_1 educ + \beta_2 experiencia + \beta_3 ingreso\_familiar + u
$$

-   Queremos saber si el modelo es igual para dos grupos ($G=2$): mujeres (g=1) y hombres (g=2). La hipótesis nula del test de Chow es que los modelos son iguales.

-   Hacemos la regresión para cada subgrupo:

    -   Solo considerando las 90 mujeres de la muestra, obtenemos $SSR_1 = 19$

    -   Solo considerando los 276 hombres de la muestra, obtenemos $SSR_2 = 59$

-   Sumamos estos dos números para obtener: $SSR_{ur} = 78$

-   Regresión restringida: hacemos la regresión para toda la muestra de 366 personas (asumiendo que no hay diferencias entre hombres y mujeres). Obtenemos $SSR_r = 85$

-   Construimos el F-estadístico de Chow:

    $$
    F = \frac{85 - 78}{78} \cdot \frac{366 - 2(3 + 1)}{(2 - 1)(3 + 1)} = 8,03
    $$

-   Comparamos al 5% con $F(4, 358) = 2.39$. Se rechaza la hipótesis nula, es decir, hay diferencias entre los grupos.

</div>

<div class="econ-widget" data-widget="f-test" data-preset="3"></div>

<div class="econ-lamina" markdown>

#### Ejercicio { data-lamina="Lámina 4" }

<!-- sem11/clase13.tex · lámina 4 -->

Una ecuación que explica el sueldo de los presidentes de consejos de administración es:

$$
\begin{aligned}
\log(\widehat{salary}) &= 4.59 + 0.257 \log(sales) + 0.011 \, roe + 0.158 \, finance
+ 0.181 \, consprod - 0.283 \, service \\
&\quad (0.30) \quad \quad \quad (0.032) \quad  \quad \quad  \quad \quad  (0.004) \quad \quad \quad \quad \quad (0.089) \quad\quad \quad \quad \quad  (0.085) \quad \quad \quad \quad  (0.099) \\
n &= 209, \quad R^2 = 0.357
\end{aligned}
$$

donde finance, consprod y service son variables binarias que corresponden a las industrias financiera, de productos de consumo y de servicios. La industria que se ha omitido es la del transporte.

-    Calcule la diferencia porcentual aproximada entre los sueldos estimados de las industrias de servicios y de transporte, manteniendo sales y roe constantes. Es esta diferencia estadísticamente significativa?

-    Cuál es la diferencia porcentual aproximada entre los sueldos estimados de la industria de productos de consumo y en el sector financiero? Cómo podría probar si esta diferencia es estadísticamente significativa?

</div>

<div class="econ-practica" id="practica-4">
<p class="econ-practica-t"><span>✍️ Practica · Tema 4</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En el test de Chow, ¿cómo se obtiene SSR_ur?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Sumando las SSR de las regresiones estimadas por separado para cada grupo.</button>
<button class="econ-quiz-opt" data-why="Esa es SSR_r, la del modelo restringido.">Con la regresión de toda la muestra.</button>
<button class="econ-quiz-opt" data-why="Se suman, no se promedian.">Promediando las SSR de los grupos.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 2.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">En el ejemplo, F = 8.03 y el valor crítico F(4, 358) es 2.39. ¿Qué concluyes?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>El modelo es distinto para hombres y mujeres.</button>
<button class="econ-quiz-opt" data-why="8.03 &gt; 2.39: se rechaza la igualdad.">El modelo es el mismo para ambos grupos.</button>
<button class="econ-quiz-opt" data-why="El test de Chow no dice qué coeficientes difieren.">Solo difieren los interceptos.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 3.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Chow paso a paso</p>

Reproduce el F de la lámina 3 y repite el test con datos simulados estimando una regresión por grupo.

```r
# Lámina 3: test de Chow para hombres y mujeres
SSR_r <- 85; SSR_ur <- 19 + 59
n <- 366; G <- 2; k <- 3
F <- (SSR_r - SSR_ur) / SSR_ur * (n - G * (k + 1)) / ((G - 1) * (k + 1))
c(F = F, critico = qf(0.95, (G - 1) * (k + 1), n - G * (k + 1)))

# Con datos simulados: regresión por grupo contra regresión conjunta
set.seed(24)
g <- rbinom(300, 1, 0.4); x <- rnorm(300)
y <- 1 + 2 * x + g * (0.5 + 0.8 * x) + rnorm(300)
SSRur <- sum(resid(lm(y ~ x, subset = g == 1))^2) + sum(resid(lm(y ~ x, subset = g == 0))^2)
SSRr  <- sum(resid(lm(y ~ x))^2)
(SSRr - SSRur) / SSRur * (300 - 2 * 2) / (1 * 2)
```

**🎯 Reto:** en la simulación, cambia `g * (0.5 + 0.8 * x)` por `0 * g`. ¿Se rechaza?
{: .econ-r-reto }

</div>

### Variable dependiente binaria: el MPL { #tema-5 .econ-tema data-num="5" data-laminas="Parte 2 · láminas 5–8" data-toc-label="Tema 5 · Modelo de probabilidad lineal" }

<p class="econ-tema-q">¿Qué estimamos cuando y solo puede valer 0 o 1?</p>

<div class="econ-lamina" markdown>

#### Variables dependientes binarias { data-lamina="Lámina 5" }

<!-- sem11/clase13.tex · lámina 5 -->

Muchos problemas de la vida real consisten en explicar una variable dummy.

-   ¿Qué explica si un alumno va a un colegio público o privado.

-   ¿Quiénes son las personas que se jubilan anticipamente?

-   ¿Qué tipos de personas tienen mas probabilidad de chocar el auto?

</div>

<div class="econ-lamina" markdown>

#### Modelo de probabilidad lineal (MPL) { data-lamina="Lámina 6" }

<!-- sem11/clase13.tex · lámina 6 -->

-   Considere el caso simple cuando $y$ tiene sólo dos categorías, definidas como 0 (fracaso) y 1 (éxito).

    $$
    \begin{aligned}
    y &= \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_k x_k + u \\
    \mathbb{E}[y \mid x] &= \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_k x_k
    \end{aligned}
    $$

-   En este caso se cumple además que:

    $$
    \mathbb{E}[y \mid x] = 1 \cdot \mathbb{P}[y = 1 \mid x] + 0 \cdot \mathbb{P}[y = 0 \mid x] = \mathbb{P}[y = 1 \mid x]
    $$

-   Luego, la regresión es igual a:

    $$
    \mathbb{P}[y = 1 \mid x] = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_k x_k
    $$

-   Los modelos con variable dependiente binaria son llamados <u>modelos de probabilidad lineal</u>.

-   $\beta_j \quad (j\neq 0)$ mide el cambio en la probabilidad de éxito debido a un cambio en una unidad de $x_j$. $\beta_0$ mide la probabilidad de éxito cuando $x_1 = x_2 = \dots = x_k = 0$.

</div>

<div class="econ-lamina" markdown>

#### El MPL presenta dos problemas { data-lamina="Lámina 7" }

<!-- sem11/clase13.tex · lámina 7 -->

1.  Se pueden predecir individuos que tengan probabilidades de éxito negativas o mayores que uno. Si nos interesa el efecto en el promedio, este problema no es muy grave. Si nos interesa la predicción o efecto para individuos extremos, los modelos no-lineales Logit y Probit son mejores para este tipo de casos (no los vamos a ver en el curso).

2.  No se cumple el supuesto de homocedasticidad.

</div>

<div class="econ-lamina" markdown>

#### Ejemplo { data-lamina="Lámina 8" }

<!-- sem11/clase13.tex · lámina 8 -->

Considere la siguiente regresión, donde la variable dependiente **Accidente** toma valor 1 si la persona tuvo al menos un accidente de tránsito y 0 si no.

$$
\widehat{Accidente}_i = 0.30 -0.05educ_i -0.0001ingreso_i
$$

-   Cómo interpretar el $\hat{\beta}_0$=0,30?

    La probabilidad de accidente es 30% para individuos con 0 años de educación y 0 ingreso.

-   Cómo interpretar el coeficiente de educ?

    Un aumento de la educación de la persona en un año reduce la probabilidad de accidente en 0,05.

-   Cuál es la probabilidad de accidente de una persona cuyo ingreso es 2000 dólares y tiene 20 años de educación?

-   Notar que si ponen valores altos de educ e ingreso se obtiene una probabilidad negativa!

</div>

<div class="econ-widget" data-widget="mpl"></div>

<div class="econ-practica" id="practica-5">
<p class="econ-practica-t"><span>✍️ Practica · Tema 5</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">En el MPL, ¿qué mide βⱼ?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>El cambio en la probabilidad de que y = 1 por una unidad más de xⱼ.</button>
<button class="econ-quiz-opt" data-why="y es 0 o 1: lo que cambia es la probabilidad.">El cambio porcentual en y.</button>
<button class="econ-quiz-opt" data-why="Esa es la predicción completa, β₀ + β₁x₁ + …">La probabilidad de que y = 1.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 6.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Cuáles son los dos problemas del MPL según la lámina 7?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Puede predecir probabilidades fuera de [0, 1], y no cumple homocedasticidad.</button>
<button class="econ-quiz-opt" data-why="Los coeficientes se interpretan bien como cambios en probabilidad.">Es sesgado y no tiene interpretación.</button>
<button class="econ-quiz-opt" data-why="Sí se estima por MCO.">No se puede estimar por MCO.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 7.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Probabilidades imposibles</p>

Evalúa la ecuación de la lámina 8 y estima un MPL simulado para ver cuántas predicciones salen de [0, 1].

```r
# Lámina 8: P(accidente) = 0.30 − 0.05 educ − 0.0001 ingreso
prob <- function(educ, ingreso) 0.30 - 0.05 * educ - 0.0001 * ingreso
prob(4, 500)
prob(20, 2000)          # ¡negativa!

# MPL simulado: las predicciones pueden salir de [0, 1]
set.seed(25)
x <- runif(500, 0, 10)
y <- rbinom(500, 1, plogis(-3 + 0.8 * x))
m <- lm(y ~ x)
range(fitted(m))
mean(fitted(m) < 0 | fitted(m) > 1)    # % de predicciones imposibles
```

**🎯 Reto:** ¿con qué educación la probabilidad de accidente se vuelve negativa si el ingreso es 0?
{: .econ-r-reto }

</div>

---

!!! abstract "🧠 Ideas clave"
    - Una **dummy** desplaza el intercepto; su **interacción** con una variable continua cambia la pendiente.
    - Con $q$ categorías se incluyen $q - 1$ dummies; los coeficientes se leen respecto de la **categoría base**.
    - El **test de Chow** compara la SSR de regresiones por grupo con la de la regresión conjunta.
    - En el **MPL**, $\beta_j$ es un cambio en la probabilidad de éxito; puede predecir valores fuera de $[0, 1]$ y es heterocedástico.

## ✅ Autoevaluación

<div class="econ-quiz">
<p class="econ-quiz-q">log(salario) = 1.2 + 0.08·educ − 0.15·mujer. ¿Cuánto menos ganan, aproximadamente, las mujeres con la misma educación?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Cerca de 15%.</button>
<button class="econ-quiz-opt" data-why="Con log(salario), el coeficiente se lee como un porcentaje aproximado (Clase 6).">0.15 pesos.</button>
<button class="econ-quiz-opt" data-why="0.08 es el retorno a un año de educación.">8%.</button>
</div>
<p class="econ-quiz-fb">✅ 100·(−0.15) ≈ −15%; el cálculo exacto es 100·(e^−0.15 − 1) ≈ −13.9%.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Para comparar salarios en 3 regiones (norte, centro y sur) con la región centro como base, ¿qué incluyes?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Dummies de norte y sur.</button>
<button class="econ-quiz-opt" data-why="Con las tres y el intercepto hay colinealidad perfecta.">Dummies de norte, centro y sur.</button>
<button class="econ-quiz-opt" data-why="Eso impondría un orden y distancias iguales entre regiones.">Una variable que vale 1, 2 y 3 según la región.</button>
</div>
<p class="econ-quiz-fb">✅ q − 1 dummies; la categoría omitida es la base.</p>
</div>

<div class="econ-quiz">
<p class="econ-quiz-q">Un MPL predice 1.12 para una persona. ¿Qué indica?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Una limitación del modelo: la probabilidad no puede superar 1.</button>
<button class="econ-quiz-opt" data-why="Las probabilidades no superan 1.">Que la persona tiene 112% de probabilidad.</button>
<button class="econ-quiz-opt" data-why="Es una consecuencia de usar una recta (lámina 7).">Que hay un error de cálculo.</button>
</div>
<p class="econ-quiz-fb">✅ Lámina 7.</p>
</div>

## 📚 Para la próxima clase

- **Wooldridge**, capítulo 7 (información cualitativa: variables binarias).
- 📘 Ejercicios resueltos en la **[Ayudantía 11](../ayudantias/ayudantia11.md)**.
- Próxima clase: **Heterocedasticidad y variables instrumentales**.
