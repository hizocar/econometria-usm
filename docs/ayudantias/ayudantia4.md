<!-- ARCHIVO GENERADO por tools/clases.py a partir de las diapositivas oficiales. No editar a mano: modifica tools/clases.py o el .tex y vuelve a generar. -->

# Ayudantía 4 · La inversa de XᵀX por cofactores

<div class="usm-session-meta">
<span>📘 Ayudantía · Semana 4</span>
<span class="usm-tag-red">🛠️ Taller 1</span>
<span class="usm-tag-gold">Complementa la Clase 4</span>
</div>

!!! info "Contenido oficial de la ayudantía"
    Esta página reproduce **íntegro y en orden** el ejercicio de la semana 4 (`sem4/calculo_matrices.tex`).
    Se trabaja en la **ayudantía/taller**, no en la cátedra del viernes ([Clase 4](../clases/clase4.md)).

!!! example "Cómo estudiar esta página"
    La ayudantía está ordenada en **1 temas**. Cada tema parte con una **pregunta guía**, sigue con las láminas
    y los simuladores, y termina con **✍️ preguntas de selección múltiple** (cada alternativa incorrecta explica
    por qué no lo es) y un **🧪 ejercicio de R** que puedes editar y ejecutar aquí mismo, sin instalar nada.
    Los 1 ejercicios de R en un solo archivo: [📥 ayudantia4.R](../r/ayudantia4.R).

## 🎯 Objetivos

- Calcular a mano $(X^\top X)^{-1}$ por cofactores: menores, cofactores, adjunta y determinante.
- Obtener $\hat{\beta} = (X^\top X)^{-1}X^\top y$ con los datos del ejemplo de la cátedra.

## 🗺️ Temas de la ayudantía

Haz clic en un tema para ir directo a él.

<ol class="econ-ruta is-ayudantia">
<li><span class="econ-ruta-h"></span><a class="econ-ruta-a" href="#tema-1"><span class="econ-ruta-n">1</span><span class="econ-ruta-t">La inversa de XᵀX por cofactores</span><span class="econ-ruta-l">Parte 1 · secciones 1–7 · ✍️ 2 preguntas · 🧪 R</span></a></li>
</ol>

## Ejercicio: la inversa de XᵀX por cofactores { .econ-parte .is-ayudantia data-eyebrow="Parte 1 · Ayudantía" data-toc-label="Parte 1 · Ayudantía · Ejercicio: la inversa de XᵀX por cofactores" }

<p class="econ-source">📄 Documento: <code>sem4/calculo_matrices.tex</code> · 7 secciones</p>

!!! note "Formato numérico"
    Este documento mantiene el formato numérico del original: punto para los miles y coma decimal.

### La inversa de XᵀX por cofactores { #tema-1 .econ-tema .is-ayudantia data-num="1" data-laminas="Parte 1 · secciones 1–7" data-toc-label="Tema 1 · Inversa por cofactores" }

<p class="econ-tema-q">¿Cómo se invierte a mano una matriz de 3 × 3?</p>

<div class="econ-lamina is-ayudantia" markdown>

#### Modelo y datos { data-lamina="Lámina 1" }

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

#### Paso 1: Matriz de menores { data-lamina="Lámina 2" }

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

#### Paso 2: Matriz de cofactores { data-lamina="Lámina 3" }

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

#### Paso 3: Matriz adjunta (adjunta = transpuesta de cofactores) { data-lamina="Lámina 4" }

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

#### Paso 4: Determinante de $A$ { data-lamina="Lámina 5" data-toc-label="Paso 4: Determinante de A" }

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

#### Paso 5: Matriz inversa { data-lamina="Lámina 6" }

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

#### Cálculo de $\hat\beta=(X^\top X)^{-1}X^\top y$ { data-lamina="Lámina 7" data-toc-label="Cálculo de hatβ=(X^top X)^-1X^top y" }

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

<div class="econ-practica" id="practica-1">
<p class="econ-practica-t"><span>✍️ Practica · Tema 1</span></p>
<div class="econ-quiz">
<p class="econ-quiz-q">¿Cuándo existe la inversa de A = XᵀX?</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>Cuando det(A) ≠ 0.</button>
<button class="econ-quiz-opt" data-why="Una matriz cuadrada con determinante cero no tiene inversa.">Siempre que A sea cuadrada.</button>
<button class="econ-quiz-opt" data-why="El signo de los elementos no importa: importa el determinante.">Cuando todos sus elementos son positivos.</button>
</div>
<p class="econ-quiz-fb">✅ A⁻¹ = adj(A)/det(A): con det(A) = 0 habría que dividir por cero.</p>
</div>
<div class="econ-quiz">
<p class="econ-quiz-q">La matriz adjunta es…</p>
<div class="econ-quiz-opts">
<button class="econ-quiz-opt" data-correct>…la transpuesta de la matriz de cofactores.</button>
<button class="econ-quiz-opt" data-why="Los menores son el paso 1; luego se les aplica el signo (cofactores) y se transpone.">…la matriz de menores.</button>
<button class="econ-quiz-opt" data-why="A⁻¹ = adj(A)/det(A).">…la inversa de A.</button>
</div>
<p class="econ-quiz-fb">✅ Paso 3 del documento.</p>
</div>
</div>

<div class="econ-r" markdown>

<p class="econ-r-t">🧪 Practica en R · Cofactores en R</p>

Repite los 5 pasos del documento: determinante, cofactores, adjunta e inversa, y compara con `solve()`.

```r
experiencia <- c(12, 18, 14, 12, 11)
educacion   <- c(93, 119, 108, 96, 74)
X <- cbind(1, experiencia, educacion)
A <- t(X) %*% X
det(A)

# Cofactor (i, j) = (−1)^(i + j) · determinante del menor sin fila i ni columna j
cof <- matrix(0, 3, 3)
for (i in 1:3) for (j in 1:3) cof[i, j] <- (-1)^(i + j) * det(A[-i, -j])
adjunta <- t(cof)
inversa <- adjunta / det(A)

round(inversa, 4)
round(solve(A), 4)          # la inversa que calcula R: igual
round(A %*% inversa, 10)    # la identidad
```

**🎯 Reto:** calcula β̂ con tu inversa: `inversa %*% t(X) %*% c(769, 808, 825, 650, 562)`.
{: .econ-r-reto }

</div>

---

!!! abstract "🧠 Ideas clave"
    - $A^{-1} = \operatorname{adj}(A)/\det(A)$: existe solo si $\det(A) \neq 0$.
    - La adjunta es la **transpuesta** de la matriz de cofactores, y cada cofactor es $(-1)^{i+j}$ por un menor.
    - Con la inversa, $\hat{\beta} = (X^\top X)^{-1}X^\top y$ reproduce la estimación de la lámina 22 de la Clase 4.

## 🔗 Volver a la cátedra

- [Clase 4 · Regresión lineal múltiple](../clases/clase4.md)
