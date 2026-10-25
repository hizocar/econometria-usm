# Clase 2 · Regresión lineal simple
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · La función de regresión poblacional
# ============================================================================
set.seed(1)
n <- 100
educacion <- sample(8:20, n, replace = TRUE)
u <- rnorm(n, sd = 3)                    # todo lo demás que afecta el salario
salario <- 0.1 + 0.55 * educacion + u    # beta0 = 0.1, beta1 = 0.55

plot(educacion, salario, pch = 19, col = "steelblue",
     main = "Cada punto se aleja de la recta en su u")
abline(a = 0.1, b = 0.55, lwd = 2)       # la FRP: E[salario | educacion]

# Reto: cambia sd = 3 por sd = 0.5. ¿Qué pasa con la nube de puntos?

# ============================================================================
# Tema 2 · Cuando E[u | x] no es cero
# ============================================================================
set.seed(2)
n <- 5000
habilidad <- rnorm(n)                     # está en u: no la observamos

# Caso 1: la educación no depende de la habilidad -> E[u | x] = 0
educ1 <- rnorm(n, 12, 2)
sal1  <- 1 + 0.5 * educ1 + 2 * habilidad + rnorm(n)

# Caso 2: los más hábiles estudian más -> E[u | x] cambia con x
educ2 <- 12 + 1.5 * habilidad + rnorm(n)
sal2  <- 1 + 0.5 * educ2 + 2 * habilidad + rnorm(n)

c(caso1 = unname(coef(lm(sal1 ~ educ1))[2]),
  caso2 = unname(coef(lm(sal2 ~ educ2))[2]))   # verdadero: 0.5

# Promedio de u por tramos de educación en el caso 2: ¡no es cero!
tapply(2 * habilidad, cut(educ2, 4), mean)

# Reto: cambia 1.5 * habilidad por -1.5 * habilidad. ¿Hacia dónde se mueve la estimación del caso 2?

# ============================================================================
# Tema 3 · MCO a mano
# ============================================================================
set.seed(3)
x <- runif(50, 8, 20)
y <- 0.1 + 0.55 * x + rnorm(50, sd = 3)

b1 <- sum((x - mean(x)) * (y - mean(y))) / sum((x - mean(x))^2)
b0 <- mean(y) - b1 * mean(x)
c(b0 = b0, b1 = b1)
coef(lm(y ~ x))                        # lo mismo

# MCO = la recta con la menor suma de residuos al cuadrado
ssr <- function(b) sum((y - b[1] - b[2] * x)^2)
optim(c(0, 0), ssr)$par                # búsqueda numérica del mínimo
c(MCO = ssr(c(b0, b1)), otra_recta = ssr(c(b0, b1 + 0.1)))

# Reto: prueba otra recta en la última línea, por ejemplo c(b0 + 1, b1). ¿Su SSR es mayor o menor?

# ============================================================================
# Tema 4 · Las propiedades, número a número
# ============================================================================
set.seed(4)
educacion <- sample(8:20, 200, replace = TRUE)
salario   <- 0.1 + 0.55 * educacion + rnorm(200, sd = 3)
m     <- lm(salario ~ educacion)
u_hat <- resid(m)
y_hat <- fitted(m)

# Propiedades aritméticas (lámina 20)
round(c(suma_residuos = sum(u_hat),
        suma_x_por_residuo = sum(educacion * u_hat),
        media_y = mean(salario), media_y_hat = mean(y_hat)), 6)
round(unname(coef(m)[1] + coef(m)[2] * mean(educacion) - mean(salario)), 10)  # = 0

# Predicción para 12 años con la recta de la lámina 19 y con la nuestra
0.095 + 0.54 * 12
predict(m, newdata = data.frame(educacion = 12))

# Reto: predice el salario para 16 años de educación con predict().

# ============================================================================
# Tema 5 · Resolver los momentos
# ============================================================================
set.seed(5)
x <- runif(80, 8, 20)
y <- 0.1 + 0.55 * x + rnorm(80, sd = 3)

# Análogos muestrales: (1/n) Σ u = 0 y (1/n) Σ x u = 0, con u = y − b0 − b1 x
# Es un sistema lineal en (b0, b1):  A b = c
A <- rbind(c(1,       mean(x)),
           c(mean(x), mean(x^2)))
c_vec <- c(mean(y), mean(x * y))
solve(A, c_vec)          # estimadores de momentos
coef(lm(y ~ x))          # = MCO

# Reto: cambia el tamaño de la muestra de 80 a 8 (en las dos líneas). ¿Siguen coincidiendo?

# ============================================================================
# Tema 6 · SST = SSE + SSR
# ============================================================================
set.seed(6)
ingreso <- runif(150, 300000, 2000000)          # en pesos
gasto   <- 50000 + 0.6 * ingreso + rnorm(150, sd = 150000)
m <- lm(gasto ~ ingreso)

SST <- sum((gasto - mean(gasto))^2)
SSE <- sum((fitted(m) - mean(gasto))^2)
SSR <- sum(resid(m)^2)
c(SST = SST, SSE_mas_SSR = SSE + SSR)           # iguales
c(R2_a_mano = SSE / SST, R2_lm = summary(m)$r.squared)

# Cambio de unidades: ingreso en miles de pesos
ingreso_miles <- ingreso / 1000
m2 <- lm(gasto ~ ingreso_miles)
rbind(pesos = coef(m), miles = coef(m2))  # pendiente × 1 000
summary(m2)$r.squared                     # el R² no cambia

# Reto: en vez de dividir el ingreso, divide el gasto por 1 000. ¿Qué coeficientes cambian?

# ============================================================================
# Tema 7 · Insesgamiento y varianza por simulación
# ============================================================================
set.seed(7)
n <- 50
sigma <- 3
x <- runif(n, 8, 20)                    # x fija entre muestras
b1 <- replicate(5000, {
  y <- 0.1 + 0.55 * x + rnorm(n, sd = sigma)
  coef(lm(y ~ x))[2]
})
mean(b1)                                # ≈ 0.55: insesgado
c(var_simulada = var(b1),
  var_formula = sigma^2 / sum((x - mean(x))^2))

hist(b1, breaks = 40, main = "5 000 estimaciones de beta1",
     xlab = "beta1 gorro")
abline(v = 0.55, lwd = 2)

# Reto: cambia sd = sigma por sd = 0.3 * x (el error crece con x). ¿Sigue siendo insesgado? ¿Coincide la fórmula?
