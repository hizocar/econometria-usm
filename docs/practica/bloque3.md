---
hide:
  - toc
---

# 🎮 Práctica · Tercer bloque

<div class="usm-session-meta">
<span>🧩 Tercer bloque del curso</span>
<span class="usm-tag-gold">Clases 10 a 12 · Asintótica, variables binarias, heterocedasticidad y VI</span>
</div>

Practica por tema lo visto en las Clases 10 a 12: comentes de Verdadero, Falso o Incierto, ejercicios y problemas de
desarrollo para resolver a mano, con calculadora. Cada respuesta trae la explicación y un enlace a la clase donde
repasar. Cuando te sientas listo, rinde un **precertamen** con tiempo. Otros bloques: [Primer bloque](index.md) y [Segundo bloque](bloque2.md).

<div class="pr-app" data-bloque="3"></div>

??? tip "Cómo funciona el puntaje"
    - **Comentes:** 10 puntos por acierto, más un **bono de racha** si encadenas aciertos 🔥.
    - **Ejercicios:** cada parte correcta suma puntos, y un ejercicio perfecto suma 5 más.
    - Solo cuenta el **primer intento** de cada pregunta: los reintentos (y abrir la solución) ya no suman, pero sirven para practicar.
    - **Precertamen:** cada pregunta que respondes por primera vez suma igual que en la práctica; terminarlo suma 10 puntos y cada respuesta correcta 2 más.
    - Cada bloque tiene su propio puntaje y sus niveles, de 🐣 *Recién llegado* a 🏆 *Leyenda de la econometría*.
    - Tu avance queda guardado en tu cuenta: lo retomas desde cualquier dispositivo.

??? example "Consejos para estudiar"
    - Distingue **sesgo** de **inconsistencia**: con una variable omitida correlacionada, más datos no arreglan nada.
    - En heterocedasticidad pregúntate siempre **qué falla**: los β̂ siguen insesgados, lo que se rompe son los errores estándar.
    - En VI revisa los **dos requisitos** del instrumento: relevancia (se puede ver en los datos) y exogeneidad (hay que argumentarla).
    - Los **problemas de desarrollo** 🧩 tienen partes encadenadas (a, b, c…): cada parte usa lo que calculaste antes.
    - Criterio de los comentes: **Falso** si alguna parte es falsa o si dice "siempre" y hay contraejemplos;
      **Incierto** si la respuesta depende de condiciones que la afirmación no especifica.

## 📐 Fórmulas útiles

??? note "Ver fórmulas"
    - **Variable omitida:** $\text{plim}\,\tilde{\beta}_1 = \beta_1 + \beta_2\,\delta_1$, con $\delta_1 = \text{Cov}(x_1, x_2)/\text{Var}(x_1)$
    - **Muestras grandes:** $se(\hat{\beta}_j) \approx c_j/\sqrt{n}$; con n grande, $t \approx N(0, 1)$
    - **Dummy con y en logaritmo:** diferencia exacta $= 100\,(e^{\delta} - 1)\%$
    - **Test de Chow:** $F = \dfrac{(SSR_r - SSR_{ur})/((G-1)(k+1))}{SSR_{ur}/(n - G(k+1))}$, con $SSR_{ur} = \sum_g SSR_g$
    - **Breusch-Pagan:** $LM = n\,R^2_{aux} \sim \chi^2_k$; $F = \dfrac{R^2_{aux}/k}{(1 - R^2_{aux})/(n-k-1)}$; White completo: $q = k + k(k+1)/2$
    - **VI:** $\hat{\beta}_{VI} = S_{zy}/S_{zx}$; $\text{Var}(\hat{\beta}_{VI}) = \hat{\sigma}^2/(SST_x\,R^2_{x,z})$
