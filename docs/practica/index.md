---
hide:
  - toc
---

# 🎮 Práctica · Primer bloque

<div class="usm-session-meta">
<span>🧩 Primer bloque del curso</span>
<span class="usm-tag-gold">Clases 1 a 5 · Ayudantías 1 y 4</span>
</div>

Practica por tema lo visto en las Clases 1 a 5: comentes de Verdadero, Falso o Incierto y ejercicios para resolver
a mano, con calculadora. Cada respuesta trae la explicación y un enlace a la clase donde repasar. Cuando te sientas
listo, rinde un **precertamen** con tiempo. Otros bloques: [Segundo bloque](bloque2.md) y [Tercer bloque](bloque3.md).

<div class="pr-app" data-bloque="1"></div>

??? tip "Cómo funciona el puntaje"
    - **Comentes:** 10 puntos por acierto, más un **bono de racha** si encadenas aciertos 🔥.
    - **Ejercicios:** cada parte correcta suma puntos, y un ejercicio perfecto suma 5 más.
    - Solo cuenta el **primer intento** de cada pregunta: los reintentos (y abrir la solución) ya no suman, pero sirven para practicar.
    - **Precertamen:** cada pregunta que respondes por primera vez suma igual que en la práctica; terminarlo suma 10 puntos y cada respuesta correcta 2 más.
    - Cada bloque tiene su propio puntaje y sus niveles, de 🐣 *Recién llegado* a 🏆 *Leyenda de la econometría*.
    - Tu avance queda guardado en tu cuenta: lo retomas desde cualquier dispositivo.

??? example "Consejos para estudiar"
    - En un comente, **toma posición** (Verdadero, Falso o Incierto) y luego **justifica** con 2 o 3 argumentos:
      la definición, la fórmula o el supuesto que corresponde. Es el formato de las explicaciones de esta página.
    - En los ejercicios, **escribe el procedimiento** en papel: fórmula, reemplazo y resultado. Después compara
      con la solución paso a paso.
    - **Varía los talleres:** cada uno mira el mismo contenido desde otro ángulo.
    - Ingresa los números con **coma o punto** decimal; se acepta un pequeño margen de redondeo.
    - Criterio de los comentes: **Falso** si alguna parte es falsa o si dice "siempre" y hay contraejemplos;
      **Incierto** si la respuesta depende de condiciones que la afirmación no especifica.

## 📐 Fórmulas útiles

??? note "Ver fórmulas"
    - **MCO simple:** $\hat{\beta}_1 = \dfrac{\sum_i (x_i - \bar{x})(y_i - \bar{y})}{\sum_i (x_i - \bar{x})^2}$, $\quad \hat{\beta}_0 = \bar{y} - \hat{\beta}_1 \bar{x}$
    - **MCO múltiple:** $\hat{\beta} = (X^\top X)^{-1} X^\top y$
    - **Descomposición:** $SST = \sum_i (y_i - \bar{y})^2$, $\ SSE = \sum_i (\hat{y}_i - \bar{y})^2$, $\ SSR = \sum_i \hat{u}_i^2$, $\ SST = SSE + SSR$
    - **Bondad de ajuste:** $R^2 = 1 - \dfrac{SSR}{SST}$, $\quad \bar{R}^2 = 1 - \dfrac{n-1}{n-k-1}\dfrac{SSR}{SST}$
    - **Varianza:** $\hat{\sigma}^2 = \dfrac{SSR}{n-k-1}$, $\quad \widehat{\text{Var}}(\hat{\beta}) = \hat{\sigma}^2 (X^\top X)^{-1}$, $\quad se(\hat{\beta}_j) = \sqrt{\text{elemento } (j+1, j+1)}$
    - **Causalidad:** $ATE = E[Y^T - Y^{NT}]$, $\ ATT = E[Y^T - Y^{NT} \mid T = 1]$, $\ $ diferencia observada $= ATT + \big(E[Y^{NT} \mid T=1] - E[Y^{NT} \mid T=0]\big)$
    - **Variable omitida:** $\tilde{\beta}_1 = \beta_1 + \beta_2 \delta_1$
    - **Intervalos:** $\bar{x} \pm z_{\alpha/2} \dfrac{\sigma}{\sqrt{n}}$, $\quad (\bar{X} - \bar{Y}) \pm z_{\alpha/2} \sqrt{\dfrac{\sigma_x^2}{n_x} + \dfrac{\sigma_y^2}{n_y}}$, con $z = 1.645,\ 1.96,\ 2.576$ para 90%, 95% y 99%
