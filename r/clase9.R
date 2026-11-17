# Clase 9 · Inferencia sobre un conjunto de parámetros: el test F
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · La SSR baja al agregar una variable
# ============================================================================
set.seed(1)
n  <- 100
x1 <- rnorm(n)
x2 <- rnorm(n)
y  <- 1 + 0.8 * x1 + 0.6 * x2 + rnorm(n)

m1 <- lm(y ~ x1)            # sin x2
m2 <- lm(y ~ x1 + x2)       # agregando x2, que es relevante
c(SSR_sin_x2 = sum(resid(m1)^2), SSR_con_x2 = sum(resid(m2)^2))
c(R2_sin_x2 = summary(m1)$r.squared, R2_con_x2 = summary(m2)$r.squared)

# Reto: cambia 0.6 * x2 por 0 * x2 (x₂ irrelevante). ¿Baja igual la SSR? ¿Cuánto?

# ============================================================================
# Tema 2 · El F a mano y con anova()
# ============================================================================
set.seed(9)
n  <- 120
x1 <- rnorm(n); x2 <- rnorm(n); x3 <- rnorm(n)
y  <- 1 + 0.5 * x1 + 0.4 * x2 + 0.3 * x3 + rnorm(n)

ur <- lm(y ~ x1 + x2 + x3)     # no restringido
r  <- lm(y ~ x1)               # restringido: H0: beta2 = beta3 = 0
SSR_ur <- sum(resid(ur)^2)
SSR_r  <- sum(resid(r)^2)
j <- 2; k <- 3

F <- (SSR_r - SSR_ur) / SSR_ur * (n - k - 1) / j
c(F = F, critico = qf(0.95, j, n - k - 1),
  valor_p = pf(F, j, n - k - 1, lower.tail = FALSE))
anova(r, ur)                   # R hace el mismo test

# Reto: cambia 0.4 * x2 + 0.3 * x3 por 0 * x2 + 0 * x3 (H₀ verdadera). ¿Se rechaza?

# ============================================================================
# Tema 3 · Valores críticos de la F
# ============================================================================
# Valores críticos de la F al 5% para distintos grados de libertad
gl <- c(10, 30, 100, 348, 1000)
round(sapply(gl, function(d) qf(0.95, df1 = 2, df2 = d)), 3)

curve(df(x, 2, 348), from = 0, to = 6, lwd = 3, col = "goldenrod",
      main = "Distribución F(2, 348)", ylab = "densidad")
abline(v = qf(0.95, 2, 348), col = "firebrick", lty = 2)   # zona de rechazo a la derecha

# Reto: calcula el valor crítico al 1% con qf(0.99, 2, 348). ¿Es mayor o menor que al 5%?

# ============================================================================
# Tema 4 · El ejemplo del baseball
# ============================================================================
# Láminas 16 y 17: salarios en el baseball (n = 353, k = 4, j = 2)
n <- 353; k <- 4; j <- 2
F_ssr <- (198.31 - 183.60) / 183.60 * (n - k - 1) / j
F_r2  <- (0.6270 - 0.5971) / (1 - 0.6270) * (n - k - 1) / j
c(F_con_SSR = F_ssr, F_con_R2 = F_r2)
qf(0.95, j, n - k - 1)                         # valor crítico ≈ 3.02
pf(F_ssr, j, n - k - 1, lower.tail = FALSE)    # valor-p

# Reto: ¿qué valor de SSR restringido haría que F quedara justo en el valor crítico? Pruébalo.

# ============================================================================
# Tema 5 · Multicolinealidad y F global
# ============================================================================
set.seed(19)
n  <- 60
x1 <- rnorm(n)
x2 <- 0.95 * x1 + sqrt(1 - 0.95^2) * rnorm(n)   # muy correlacionadas
y  <- 1 + 0.3 * x1 + 0.3 * x2 + rnorm(n)
m  <- lm(y ~ x1 + x2)

round(coef(summary(m)), 3)      # las t individuales
summary(m)$fstatistic           # el F de significancia global (lámina 20)
R2 <- summary(m)$r.squared
R2 / (1 - R2) * (n - 2 - 1) / 2  # el mismo F con la fórmula del R²

# Reto: cambia 0.95 por 0 (regresores independientes). ¿Qué pasa con las t individuales?
