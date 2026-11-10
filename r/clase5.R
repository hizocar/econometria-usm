# Clase 5 · Propiedades estadísticas del estimador MCO
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 2 · Multicolinealidad perfecta
# ============================================================================
set.seed(5)
n  <- 50
x1 <- rnorm(n)
x2 <- 2 * x1                       # relación lineal exacta: viola el supuesto 3
y  <- 1 + 2 * x1 + rnorm(n)

coef(lm(y ~ x1 + x2))              # R no puede estimar x2: entrega NA

X <- cbind(1, x1, x2)
qr(X)$rank                         # rango 2, no k + 1 = 3
try(solve(t(X) %*% X))             # XᵀX no tiene inversa

# Reto: cambia 2 * x1 por 2 * x1 + rnorm(n, sd = 0.01). ¿Se puede estimar ahora? ¿Qué pasa con los errores estándar?

# ============================================================================
# Tema 3 · Lo que pasa cuando falla el supuesto 4
# ============================================================================
set.seed(4)
n <- 2000
habilidad <- rnorm(n)                       # no la observamos
educ      <- 12 + 2 * habilidad + rnorm(n)  # se relaciona con la educación
salario   <- 1 + 0.5 * educ + 1 * habilidad + rnorm(n)

coef(lm(salario ~ educ))               # habilidad en u: E[u | X] ≠ 0
coef(lm(salario ~ educ + habilidad))   # si pudiéramos incluirla: ≈ 0.5
cor(educ, habilidad)

# Reto: cambia 2 * habilidad por 0 * habilidad en la educación. ¿Sigue habiendo sesgo?

# ============================================================================
# Tema 4 · El abanico de la heterocedasticidad
# ============================================================================
set.seed(8)
n       <- 300
educ    <- runif(n, 6, 20)
u       <- rnorm(n, sd = 0.4 * educ)   # la varianza crece con la educación
salario <- 2 + 0.8 * educ + u
m <- lm(salario ~ educ)

plot(educ, resid(m), pch = 19, col = "steelblue",
     main = "Residuos: el abanico se abre", ylab = "residuo")
abline(h = 0, lty = 2)
tapply(resid(m), cut(educ, 3), sd)     # dispersión por tramo de educación

# Reto: cambia sd = 0.4 * educ por sd = 4. ¿Cómo se ve ahora el gráfico de residuos?

# ============================================================================
# Tema 5 · Insesgamiento y σ²(XᵀX)⁻¹ por simulación
# ============================================================================
set.seed(12)
n     <- 50
sigma <- 2
X     <- cbind(1, x1 = rnorm(n), x2 = rnorm(n))   # X fija entre muestras
beta  <- c(1, 2, 1.5)

b_hat <- replicate(5000, {
  y <- X %*% beta + rnorm(n, sd = sigma)
  drop(solve(t(X) %*% X) %*% t(X) %*% y)          # (XᵀX)⁻¹Xᵀy
})
rowMeans(b_hat)                  # ≈ (1, 2, 1.5): insesgado (lámina 12)
round(var(t(b_hat)), 4)          # varianza simulada
round(sigma^2 * solve(t(X) %*% X), 4)   # σ²(XᵀX)⁻¹ (lámina 13)

# Reto: cambia sigma <- 2 por sigma <- 4. ¿Cuánto crece la varianza? ¿Cambia el promedio?

# ============================================================================
# Tema 6 · Errores estándar a mano
# ============================================================================
# 1) Con los números de las láminas 17 y 18
XtX_inv <- matrix(c( 0.05987, -0.00177, -0.00035,
                    -0.00177,  0.00030, -0.00002,
                    -0.00035, -0.00002,  0.00001), 3, 3, byrow = TRUE)
V <- 141925 * XtX_inv
round(V, 2)
sqrt(diag(V))                       # errores estándar

# 2) Con datos simulados: σ̂² = SSR / (n − k − 1)
set.seed(16)
n  <- 100
x1 <- rnorm(n)
x2 <- rnorm(n)
y  <- 1 + 2 * x1 + 1.5 * x2 + rnorm(n, sd = 3)
m  <- lm(y ~ x1 + x2)
X  <- model.matrix(m)
sigma2_hat <- sum(resid(m)^2) / (n - 2 - 1)
c(a_mano = sigma2_hat, lm = summary(m)$sigma^2)
cbind(a_mano = sqrt(diag(sigma2_hat * solve(t(X) %*% X))),
      lm     = coef(summary(m))[, "Std. Error"])

# Reto: cambia sd = 3 por sd = 6 en la línea de y. ¿Cuánto cambian los errores estándar?

# ============================================================================
# Tema 7 · Tres formas de ganar precisión
# ============================================================================
set.seed(19)
se_beta1 <- function(n, sd_x, sigma) {
  x <- rnorm(n, sd = sd_x)
  y <- 1 + 2 * x + rnorm(n, sd = sigma)
  coef(summary(lm(y ~ x)))["x", "Std. Error"]
}
round(c(base            = se_beta1(100, 1, 2),
        mas_variacion_x = se_beta1(100, 3, 2),
        mas_ruido       = se_beta1(100, 1, 6),
        mas_datos       = se_beta1(400, 1, 2)), 3)

# Reto: ¿cuántas observaciones necesitas para que el error estándar sea la mitad que en base? Pruébalo.
