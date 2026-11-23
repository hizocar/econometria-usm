## 🧠 Desafíos teóricos

Problemas de desarrollo, más exigentes que las preguntas de cada tema. Intenta resolverlos en papel,
justificando cada paso, antes de abrir la solución.

!!! question "Desafío 1 · ¿Por qué una $t$ y no una normal?"
    Bajo los supuestos 1 a 6 del modelo lineal clásico:

    (a) Explica por qué $\dfrac{\hat{\beta}_j - \beta_j}{sd(\hat{\beta}_j)} \sim N(0, 1)$.

    (b) Explica por qué, al reemplazar $sd(\hat{\beta}_j)$ por $se(\hat{\beta}_j)$, el estadístico pasa a distribuirse $t_{n-k-1}$.

    (c) ¿Qué ocurre con esa diferencia cuando $n - k - 1 \to \infty$? ¿Qué implica para los valores críticos?

    ??? success "Ver solución"
        (a) Condicional en las $x$, $\hat{\beta}_j$ es una **combinación lineal** de los errores $u_i$. Si los $u_i$ son normales (supuesto 6), cualquier combinación lineal de ellos también lo es; como $\hat{\beta}_j$ es insesgado y tiene varianza $sd(\hat{\beta}_j)^2$, al estandarizarlo queda una $N(0,1)$.

        (b) $sd(\hat{\beta}_j)$ depende de $\sigma^2$, que no se conoce; se estima con $\hat{\sigma}^2 = SSR/(n-k-1)$, que es aleatorio. Se cumple que $(n-k-1)\hat{\sigma}^2/\sigma^2 \sim \chi^2_{n-k-1}$, independiente de $\hat{\beta}_j$. El cociente entre una normal estándar y la raíz de una $\chi^2$ dividida por sus grados de libertad es, por definición, una $t_{n-k-1}$.

        (c) Con muchos grados de libertad $\hat{\sigma}^2$ se acerca a $\sigma^2$ y la $t$ se acerca a la normal estándar: el valor crítico al 5% (dos colas) pasa de 2,021 con 40 gl a 1,96 en el límite. La $t$ tiene colas más pesadas porque incorpora la incertidumbre de estimar $\sigma^2$.

!!! question "Desafío 2 · Test e intervalo: dos caras de la misma moneda"
    Demuestra que, para un mismo $\alpha$, se rechaza $H_0: \beta_j = a$ contra $H_1: \beta_j \neq a$ **si y solo si** $a$ no pertenece al intervalo de confianza de $(1-\alpha)$ para $\beta_j$.

    ??? success "Ver solución"
        Sea $c$ el valor crítico de dos colas. Se rechaza $H_0$ cuando
        $$\left|\frac{\hat{\beta}_j - a}{se(\hat{\beta}_j)}\right| > c \iff |\hat{\beta}_j - a| > c\, se(\hat{\beta}_j) \iff a < \hat{\beta}_j - c\, se(\hat{\beta}_j) \ \text{ o } \ a > \hat{\beta}_j + c\, se(\hat{\beta}_j).$$
        Es decir, cuando $a$ cae fuera de $\hat{\beta}_j \pm c\, se(\hat{\beta}_j)$, que es justamente el intervalo de confianza de $(1-\alpha)$. Cada implicancia se puede leer en ambos sentidos, así que la equivalencia es exacta.

!!! question "Desafío 3 · Lo que un intervalo de confianza esconde"
    Un artículo con una muestra grande reporta, para $\beta_1$, el intervalo de confianza de 95%: $(0{,}12;\ 0{,}48)$.

    (a) Recupera $\hat{\beta}_1$ y $se(\hat{\beta}_1)$.

    (b) ¿Se rechaza $H_0: \beta_1 = 0{,}5$ al 5%? ¿Y al 10%? ¿Y al 1%? Justifica sin calcular de nuevo cuando puedas.

    (c) Calcula el estadístico $t$ y el valor-p aproximado para $H_0: \beta_1 = 0$.

    ??? success "Ver solución"
        (a) El intervalo es simétrico: $\hat{\beta}_1 = (0{,}12 + 0{,}48)/2 = 0{,}30$ y su semiancho es $0{,}18 = 1{,}96 \cdot se$, así que $se = 0{,}18/1{,}96 \approx 0{,}0918$.

        (b) **Al 5%:** sí, porque $0{,}5$ está fuera del IC de 95% (Desafío 2). **Al 10%:** también; el IC de 90% es **más angosto** y está contenido en el de 95%, así que $0{,}5$ sigue afuera (es $(0{,}149;\ 0{,}451)$). **Al 1%:** el IC de 99% es más ancho y no se puede concluir sin calcularlo: $0{,}30 \pm 2{,}576 \cdot 0{,}0918 = (0{,}063;\ 0{,}537)$, que **contiene** a $0{,}5$, así que no se rechaza.

        (c) $t = 0{,}30/0{,}0918 \approx 3{,}27$. Con muestra grande, valor-p $= 2\,P(Z > 3{,}27) \approx 0{,}001$: se rechaza a cualquier nivel usual.

!!! question "Desafío 4 · El poder de un test"
    Con una muestra grande, $\hat{\beta} \approx N(\beta,\ se^2)$ con $se = 0{,}05$. Se testea $H_0: \beta = 0$ contra $H_1: \beta > 0$ al 5% (valor crítico 1,645).

    (a) ¿Para qué valores de $\hat{\beta}$ se rechaza $H_0$?

    (b) Si en realidad $\beta = 0{,}10$, ¿cuál es la probabilidad de rechazar $H_0$ (el poder)? ¿Cuál es la probabilidad de error tipo II?

    (c) ¿Qué error estándar haría falta para tener un poder de 90% con ese mismo $\beta = 0{,}10$? ¿Por cuánto habría que multiplicar el tamaño muestral?

    ??? success "Ver solución"
        (a) Se rechaza si $\hat{\beta}/0{,}05 > 1{,}645$, es decir, si $\hat{\beta} > 0{,}0822$.

        (b) Poder $= P(\hat{\beta} > 0{,}0822 \mid \beta = 0{,}10) = P\!\left(Z > \frac{0{,}0822 - 0{,}10}{0{,}05}\right) = P(Z > -0{,}355) \approx 0{,}639$. El error tipo II es $1 - 0{,}639 \approx 0{,}361$: en más de un tercio de las muestras no se detectaría un efecto que sí existe.

        (c) Se necesita $\dfrac{0{,}10}{se} - 1{,}645 = z_{0,90} = 1{,}282$, o sea $se = 0{,}10/2{,}927 \approx 0{,}0342$. Como $se$ es proporcional a $1/\sqrt{n}$, hay que multiplicar $n$ por $(0{,}05/0{,}0342)^2 \approx 2{,}14$.

!!! question "Desafío 5 · Muchos tests a la vez"
    Un investigador testea 20 variables que en realidad no tienen ningún efecto (todas las $H_0$ son verdaderas), con tests independientes al 5%.

    (a) ¿Cuántos rechazos espera?

    (b) ¿Cuál es la probabilidad de que rechace **al menos una** hipótesis nula?

    (c) ¿Qué nivel de significancia debería usar en cada test para que esa probabilidad sea 5%?

    ??? success "Ver solución"
        (a) Cada test rechaza con probabilidad $\alpha = 0{,}05$ (error tipo I): espera $20 \cdot 0{,}05 = 1$ rechazo, que sería un "hallazgo" falso.

        (b) $P(\text{al menos uno}) = 1 - 0{,}95^{20} \approx 0{,}64$. Es más probable encontrar algún resultado "significativo" que no encontrar ninguno, aunque nada importe.

        (c) Se necesita $1 - (1-\alpha^*)^{20} = 0{,}05$, o sea $\alpha^* = 1 - 0{,}95^{1/20} \approx 0{,}00256$. La regla aproximada de Bonferroni da casi lo mismo: $0{,}05/20 = 0{,}0025$. Moraleja: buscar entre muchos coeficientes hasta encontrar uno significativo infla el error tipo I.

!!! question "Desafío 6 · Una misma muestra, tres conclusiones"
    Se obtuvo $t = -1{,}80$ con 40 grados de libertad. Calcula el valor-p y decide al 5% para:

    (a) $H_1: \beta_j \neq 0$; (b) $H_1: \beta_j < 0$; (c) $H_1: \beta_j > 0$.

    (d) ¿Por qué la hipótesis alternativa debe fijarse **antes** de mirar los datos?

    ??? success "Ver solución"
        (a) Valor-p $= 2\,P(t_{40} > 1{,}80) \approx 0{,}079$: no se rechaza al 5% (sí al 10%).

        (b) Valor-p $= P(t_{40} < -1{,}80) \approx 0{,}040$: se rechaza al 5%. Es la mitad del de dos colas porque el $t$ apunta en la dirección de $H_1$.

        (c) Valor-p $= P(t_{40} > -1{,}80) \approx 0{,}960$: no hay ninguna evidencia a favor de $\beta_j > 0$; el $t$ va en la dirección contraria.

        (d) Si se elige la cola después de ver el signo de $t$, en la práctica se está haciendo un test de dos colas con la mitad del valor-p: la probabilidad real de error tipo I es el doble de la declarada.

!!! question "Desafío 7 · Comentes de desarrollo"
    Responde Verdadero, Falso o Incierto y justifica con una fórmula:

    (a) "Si se duplica el tamaño de la muestra, el estadístico $t$ de un coeficiente se duplica."

    (b) "Si $\hat{\beta}_j$ es significativo al 1% en un test de dos colas, el intervalo de confianza de 95% para $\beta_j$ no contiene el cero."

    (c) "Un valor-p de 0,20 indica que hay un 80% de probabilidad de que $H_0$ sea falsa."

    ??? success "Ver solución"
        (a) **Falso.** $se(\hat{\beta}_j) = \hat{\sigma}/\sqrt{SST_j(1-R_j^2)}$ y $SST_j$ crece aproximadamente en proporción a $n$, así que $se$ cae como $1/\sqrt{n}$. Si $\hat{\beta}_j$ no cambiara, $t$ se multiplicaría por $\sqrt{2} \approx 1{,}41$, no por 2.

        (b) **Verdadero.** Rechazar al 1% implica rechazar al 5% (el valor crítico al 5% es menor), y por el Desafío 2 eso equivale a que el 0 quede fuera del IC de 95%.

        (c) **Falso.** El valor-p se calcula **suponiendo que $H_0$ es verdadera**: es la probabilidad de obtener un $t$ tan o más extremo que el observado. No es la probabilidad de que $H_0$ sea verdadera ni falsa.

