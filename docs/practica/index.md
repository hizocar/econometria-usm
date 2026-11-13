# 🎮 Práctica · Primer bloque

<div class="usm-session-meta">
<span>🧩 Primer bloque del curso</span>
<span class="usm-tag-gold">Clases 1 a 5 · Ayudantías 1 y 4</span>
</div>

Una zona para **entrenar lo visto en el primer bloque**: comentes de Verdadero, Falso o Incierto, y
**12 talleres** de ejercicios para resolver **a mano, con calculadora**. Cada respuesta trae una
explicación paso a paso y un enlace a la clase donde repasar.

!!! tip "Cómo funciona el puntaje"
    - **Comentes:** 10 puntos por acierto, más un **bono de racha** si encadenas aciertos 🔥.
    - **Ejercicios:** cada campo correcto suma puntos, y un ejercicio perfecto suma 5 más.
    - Solo cuenta el **primer intento** de cada pregunta: los reintentos (y abrir la solución) ya no suman,
      pero sirven para practicar. Así el puntaje refleja lo que realmente sabes.
    - Tu puntaje se guarda **en este navegador**. Sube de nivel: de 🐣 *Recién llegado* a 🏆 *Leyenda del primer bloque*.

!!! example "Consejos para estudiar"
    - En un comente, **toma posición** (Verdadero, Falso o Incierto) y luego **justifica** con 2 o 3 argumentos:
      la definición, la fórmula o el supuesto que corresponde. Es el formato de las explicaciones de esta página.
    - En los ejercicios, **escribe el procedimiento** en papel: fórmula, reemplazo y resultado. Después compara
      con la solución paso a paso.
    - **Varía los talleres:** cada uno mira el mismo contenido desde otro ángulo. Usa 🎲 *Sorpresa* para no
      acostumbrarte a un solo tipo de ejercicio.
    - Ingresa los números con **coma o punto** decimal; se acepta un pequeño margen de redondeo.

<div class="pr-marcador" aria-live="polite"></div>

## 1 · Comentes: ¿Verdadero, Falso o Incierto?

Afirmaciones sobre los contenidos del primer bloque. Filtra por tema o recórrelas todas. Criterio usado:
**Falso** si alguna parte de la afirmación es falsa o si dice "siempre" y hay contraejemplos;
**Incierto** si la respuesta depende de condiciones que la afirmación no especifica.

<div class="pr-zona" data-zona="comentes"></div>

## 2 · Talleres de ejercicios

Elige un taller. Cada uno tiene entre 16 y 24 ejercicios distintos; con 🎲 *Otro ejercicio* pasas al siguiente.

| Contenido | Talleres | Repaso |
|---|---|---|
| Regresión simple y MCO | 📈 con datos · 🧾 desde resúmenes · 🕵️ detective de residuos · 📏 cambio de unidades | [Clase 2](../clases/clase2.md) |
| Regresión múltiple y matrices | 🔢 MCO simple con matrices · 🧮 múltiple con matrices · ⚖️ ¿qué modelo prefieres? | [Clase 4](../clases/clase4.md), [Clase 5](../clases/clase5.md), [Ayudantía 4](../ayudantias/ayudantia4.md) |
| Causalidad | 🌗 outcomes potenciales · 🧩 variable omitida | [Clase 3](../clases/clase3.md) |
| Estadística | 📊 descriptiva · 🎯 intervalos para medias · 📐 tamaño muestral y proporciones | [Ayudantía 1](../ayudantias/ayudantia1.md) |

<div class="pr-zona" data-zona="talleres"></div>

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
