---
hide:
  - toc
---

# 🎮 Práctica · Segundo bloque

<div class="usm-session-meta">
<span>🧩 Segundo bloque del curso</span>
<span class="usm-tag-gold">Clases 6 a 9 · Interpretación, test t, combinaciones y test F</span>
</div>

Practica por tema lo visto en las Clases 6 a 9: comentes de Verdadero, Falso o Incierto, ejercicios y problemas de
desarrollo para resolver a mano, con calculadora. Cada respuesta trae la explicación y un enlace a la clase donde
repasar. Cuando te sientas listo, rinde un **precertamen** con tiempo. Otros bloques: [Primer bloque](index.md) y [Tercer bloque](bloque3.md).

<div class="pr-app" data-bloque="2"></div>

??? tip "Cómo funciona el puntaje"
    - **Comentes:** 10 puntos por acierto, más un **bono de racha** si encadenas aciertos 🔥.
    - **Ejercicios:** cada parte correcta suma puntos, y un ejercicio perfecto suma 5 más.
    - Solo cuenta el **primer intento** de cada pregunta: los reintentos (y abrir la solución) ya no suman, pero sirven para practicar.
    - **Precertamen:** cada pregunta que respondes por primera vez suma igual que en la práctica; terminarlo suma 10 puntos y cada respuesta correcta 2 más.
    - Cada bloque tiene su propio puntaje y sus niveles, de 🐣 *Recién llegado* a 🏆 *Leyenda de la econometría*.
    - Tu avance queda guardado en tu cuenta: lo retomas desde cualquier dispositivo.

??? example "Consejos para estudiar"
    - Los enunciados entregan los **valores críticos** de t y F: practica la regla de decisión, no el cálculo de cuantiles.
    - Antes de decidir, escribe **H₀ y H₁**: muchas preguntas dependen de si el test es de una o de dos colas.
    - Los **problemas de desarrollo** 🧩 tienen partes encadenadas (a, b, c…): cada parte usa lo que calculaste antes.
    - Criterio de los comentes: **Falso** si alguna parte es falsa o si dice "siempre" y hay contraejemplos;
      **Incierto** si la respuesta depende de condiciones que la afirmación no especifica.

## 📐 Fórmulas útiles

??? note "Ver fórmulas"
    - **Logaritmos:** log-nivel $\Delta\%y \approx 100\beta\,\Delta x$ (exacto: $100(e^{\beta\Delta x} - 1)$); log-log $\Delta\%y \approx \beta\,\Delta\%x$; nivel-log $\Delta y \approx (\beta/100)\,\Delta\%x$
    - **Cuadrática:** $\Delta\hat{y}/\Delta x \approx \hat{\beta}_1 + 2\hat{\beta}_2 x$, punto de quiebre $x^* = |\hat{\beta}_1 / (2\hat{\beta}_2)|$
    - **Interacción:** en $y = \beta_0 + \beta_1 x + \beta_2 z + \beta_3 xz$, $\Delta y/\Delta z = \beta_2 + \beta_3 x$
    - **Test t:** $t = (\hat{\beta}_j - a_j)/se(\hat{\beta}_j)$; IC: $\hat{\beta}_j \pm t_{\alpha/2}\, se(\hat{\beta}_j)$
    - **Combinación:** $\text{Var}(\hat{\beta}_1 - c\hat{\beta}_2) = \text{Var}(\hat{\beta}_1) + c^2\,\text{Var}(\hat{\beta}_2) - 2c\,\text{Cov}(\hat{\beta}_1, \hat{\beta}_2)$
    - **Test F:** $F = \dfrac{SSR_r - SSR_{ur}}{SSR_{ur}} \cdot \dfrac{n-k-1}{j} = \dfrac{R^2_{ur} - R^2_r}{1 - R^2_{ur}} \cdot \dfrac{n-k-1}{j}$
    - **Significancia global:** $F = \dfrac{R^2}{1 - R^2} \cdot \dfrac{n-k-1}{k}$
