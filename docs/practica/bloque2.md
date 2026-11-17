# 🎮 Práctica · Segundo bloque

<div class="usm-session-meta">
<span>🧩 Segundo bloque del curso</span>
<span class="usm-tag-gold">Clases 6 a 9 · Interpretación, test t, combinaciones y test F</span>
</div>

Una zona para **entrenar lo visto en el segundo bloque**: comentes de Verdadero, Falso o Incierto, y
**10 talleres** de ejercicios para resolver **a mano, con calculadora**. Cada respuesta trae una
explicación paso a paso y un enlace a la clase donde repasar. ¿Buscas el primer bloque?
[Práctica · Primer bloque](index.md).

!!! tip "Cómo funciona el puntaje"
    - **Comentes:** 10 puntos por acierto, más un **bono de racha** si encadenas aciertos 🔥.
    - **Ejercicios:** cada campo correcto suma puntos, y un ejercicio perfecto suma 5 más.
    - Solo cuenta el **primer intento** de cada pregunta: los reintentos (y abrir la solución) ya no suman.
    - Este bloque tiene **su propio puntaje**, separado del primer bloque.

!!! example "Consejos para estudiar"
    - Los enunciados entregan los **valores críticos** de t y F: practica la regla de decisión, no el cálculo de cuantiles.
    - Antes de decidir, escribe **H₀ y H₁**: muchas preguntas dependen de si el test es de una o de dos colas.
    - **Varía los talleres** con 🎲 *Sorpresa*.

<div class="pr-marcador" data-bloque="2" aria-live="polite"></div>

## 1 · Comentes: ¿Verdadero, Falso o Incierto?

Afirmaciones sobre las Clases 6 a 9. Criterio usado: **Falso** si alguna parte de la afirmación es falsa
o si dice "siempre" y hay contraejemplos; **Incierto** si la respuesta depende de condiciones que la
afirmación no especifica.

<div class="pr-zona" data-zona="comentes"></div>

## 2 · Talleres de ejercicios

| Contenido | Talleres | Repaso |
|---|---|---|
| Interpretación | 📐 logaritmos · 📈 cuadráticas · 🔀 interacciones · 📏 reescalar | [Clase 6](../clases/clase6.md) |
| Inferencia sobre un parámetro | 🎯 test t e intervalos · 🔎 valores-p · ⚖️ errores tipo I y II | [Clase 7](../clases/clase7.md) |
| Combinaciones de parámetros | 🧪 combinaciones | [Clase 8](../clases/clase8.md) |
| Varios parámetros | 🧮 test F · 🌐 significancia global | [Clase 9](../clases/clase9.md) |

<div class="pr-zona" data-zona="talleres"></div>

## 📐 Fórmulas útiles

??? note "Ver fórmulas"
    - **Logaritmos:** log-nivel $\Delta\%y \approx 100\beta\,\Delta x$ (exacto: $100(e^{\beta\Delta x} - 1)$); log-log $\Delta\%y \approx \beta\,\Delta\%x$; nivel-log $\Delta y \approx (\beta/100)\,\Delta\%x$
    - **Cuadrática:** $\Delta\hat{y}/\Delta x \approx \hat{\beta}_1 + 2\hat{\beta}_2 x$, punto de quiebre $x^* = |\hat{\beta}_1 / (2\hat{\beta}_2)|$
    - **Interacción:** en $y = \beta_0 + \beta_1 x + \beta_2 z + \beta_3 xz$, $\Delta y/\Delta z = \beta_2 + \beta_3 x$
    - **Test t:** $t = (\hat{\beta}_j - a_j)/se(\hat{\beta}_j)$; IC: $\hat{\beta}_j \pm t_{\alpha/2}\, se(\hat{\beta}_j)$
    - **Combinación:** $\text{Var}(\hat{\beta}_1 - c\hat{\beta}_2) = \text{Var}(\hat{\beta}_1) + c^2\,\text{Var}(\hat{\beta}_2) - 2c\,\text{Cov}(\hat{\beta}_1, \hat{\beta}_2)$
    - **Test F:** $F = \dfrac{SSR_r - SSR_{ur}}{SSR_{ur}} \cdot \dfrac{n-k-1}{j} = \dfrac{R^2_{ur} - R^2_r}{1 - R^2_{ur}} \cdot \dfrac{n-k-1}{j}$
    - **Significancia global:** $F = \dfrac{R^2}{1 - R^2} \cdot \dfrac{n-k-1}{k}$
