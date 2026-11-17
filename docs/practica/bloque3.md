# 🎮 Práctica · Tercer bloque

<div class="usm-session-meta">
<span>🧩 Tercer bloque del curso</span>
<span class="usm-tag-gold">Clases 10 a 12 · Asintótica, variables binarias, heterocedasticidad y VI</span>
</div>

Una zona para **entrenar lo visto en el tercer bloque**: comentes de Verdadero, Falso o Incierto,
**9 talleres** de ejercicios y **3 tipos de problemas de desarrollo**, todos para resolver **a mano, con calculadora**.
Cada respuesta trae una explicación paso a paso y un enlace a la clase donde repasar. ¿Buscas otro bloque?
[Primer bloque](index.md) · [Segundo bloque](bloque2.md).

!!! tip "Cómo funciona el puntaje"
    - **Ingresa con tu cuenta** (correo USM, nombre y contraseña): tu progreso queda guardado y lo retomas desde cualquier dispositivo.
    - **Comentes:** 10 puntos por acierto, más un **bono de racha** si encadenas aciertos 🔥.
    - **Ejercicios:** cada campo correcto suma puntos, y un ejercicio perfecto suma 5 más.
    - Solo cuenta el **primer intento** de cada pregunta: los reintentos (y abrir la solución) ya no suman.
    - Este bloque tiene **su propio puntaje**, separado de los otros dos.

!!! example "Consejos para estudiar"
    - Distingue **sesgo** de **inconsistencia**: con una variable omitida correlacionada, más datos no arreglan nada.
    - En heterocedasticidad pregúntate siempre **qué falla**: los β̂ siguen insesgados, lo que se rompe son los errores estándar.
    - En VI revisa los **dos requisitos** del instrumento: relevancia (se puede ver en los datos) y exogeneidad (hay que argumentarla).

<div class="pr-marcador" data-bloque="3" aria-live="polite"></div>

## 1 · Comentes: ¿Verdadero, Falso o Incierto?

Afirmaciones sobre las Clases 10 a 12. Criterio usado: **Falso** si alguna parte de la afirmación es falsa
o si dice "siempre" y hay contraejemplos; **Incierto** si la respuesta depende de condiciones que la
afirmación no especifica.

<div class="pr-zona" data-zona="comentes"></div>

## 2 · Talleres de ejercicios

| Contenido | Talleres | Repaso |
|---|---|---|
| Propiedades asintóticas | 🧭 variable omitida e inconsistencia · 📉 muestras grandes | [Clase 10](../clases/clase10.md) |
| Variables binarias | 🏷️ dummies con varias categorías · 🔀 dummy × variable continua · ✂️ test de Chow · 🎲 probabilidad lineal | [Clase 11](../clases/clase11.md) |
| Heterocedasticidad y VI | 🌪️ Breusch-Pagan y White · 🛡️ errores robustos · 🎻 variables instrumentales | [Clase 12](../clases/clase12.md) |
| **Problemas de desarrollo** | 🧩 heterocedasticidad de punta a punta · precisión de VI · Chow e interacciones | Clases 11 y 12 |

!!! info "Problemas de desarrollo 🧩"
    Son problemas largos, de dificultad media-alta, con partes encadenadas (a, b, c…): cada parte usa lo que calculaste antes.
    Resuélvelos en papel y luego ingresa cada resultado. Suman más puntos que los ejercicios cortos.

<div class="pr-zona" data-zona="talleres"></div>

## 📐 Fórmulas útiles

??? note "Ver fórmulas"
    - **Variable omitida:** $\text{plim}\,\tilde{\beta}_1 = \beta_1 + \beta_2\,\delta_1$, con $\delta_1 = \text{Cov}(x_1, x_2)/\text{Var}(x_1)$
    - **Muestras grandes:** $se(\hat{\beta}_j) \approx c_j/\sqrt{n}$; con n grande, $t \approx N(0, 1)$
    - **Dummy con y en logaritmo:** diferencia exacta $= 100\,(e^{\delta} - 1)\%$
    - **Test de Chow:** $F = \dfrac{(SSR_r - SSR_{ur})/((G-1)(k+1))}{SSR_{ur}/(n - G(k+1))}$, con $SSR_{ur} = \sum_g SSR_g$
    - **Breusch-Pagan:** $LM = n\,R^2_{aux} \sim \chi^2_k$; $F = \dfrac{R^2_{aux}/k}{(1 - R^2_{aux})/(n-k-1)}$; White completo: $q = k + k(k+1)/2$
    - **VI:** $\hat{\beta}_{VI} = S_{zy}/S_{zx}$; $\text{Var}(\hat{\beta}_{VI}) = \hat{\sigma}^2/(SST_x\,R^2_{x,z})$
