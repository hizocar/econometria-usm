# Clase 7 · Inferencia sobre un parámetro
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · ¿De dónde sale la t?
# ============================================================================
set.seed(1)
n <- 15
t_stats <- replicate(10000, {
  x <- rnorm(n)
  y <- 1 + 0.5 * x + rnorm(n)
  s <- coef(summary(lm(y ~ x)))
  (s["x", "Estimate"] - 0.5) / s["x", "Std. Error"]   # (β̂ − β) / s.e.
})
hist(t_stats, breaks = 60, freq = FALSE, xlim = c(-5, 5),
     main = "t simulados (barras) y t con 13 gl (rojo)")
curve(dt(x, df = n - 2), add = TRUE, lwd = 3, col = "firebrick")
curve(dnorm(x), add = TRUE, lwd = 2, lty = 2)
c(t_13gl = qt(0.975, 13), normal = qnorm(0.975), t_932gl = qt(0.975, 932))

# Reto: cambia n <- 15 por n <- 200. ¿Cuánto se parecen ahora la t y la normal?

# ============================================================================
# Tema 2 · Error tipo I y poder por simulación
# ============================================================================
set.seed(2)
rechaza <- function(beta1, n = 30, alpha = 0.05) {
  x <- rnorm(n)
  y <- 1 + beta1 * x + rnorm(n)
  coef(summary(lm(y ~ x)))["x", "Pr(>|t|)"] < alpha
}
c(error_tipo_I    = mean(replicate(2000, rechaza(0))),         # ≈ α
  poder_beta_0.3  = mean(replicate(2000, rechaza(0.3))),
  poder_con_n_120 = mean(replicate(2000, rechaza(0.3, n = 120))))

# Reto: cambia alpha = 0.05 por alpha = 0.01. ¿Qué pasa con el error tipo I? ¿Y con el poder?

# ============================================================================
# Tema 3 · El intervalo y el test dicen lo mismo
# ============================================================================
set.seed(7)
n <- 60
x <- rnorm(n)
y <- 2 + 0.4 * x + rnorm(n)
m <- lm(y ~ x)
b  <- coef(summary(m))["x", "Estimate"]
se <- coef(summary(m))["x", "Std. Error"]
t_crit <- qt(0.975, df = n - 2)

c(b - t_crit * se, b + t_crit * se)    # IC 95% a mano (lámina 12)
confint(m)["x", ]                       # lo mismo con R
abs(b / se) > t_crit                    # ¿se rechaza H0: β1 = 0? (lámina 10)

# Reto: cambia 0.4 * x por 0.1 * x. ¿Contiene ahora el intervalo al cero? ¿Qué dice el test?

# ============================================================================
# Tema 4 · El ejemplo de las láminas 13 a 15
# ============================================================================
# Lámina 13: salario en educación e IQ (n = 935, gl = 932)
b  <- 42.0576
se <- 6.5498
gl <- 932

t <- (b - 0) / se
t                                        # 6.42 (lámina 14)
qt(0.975, gl)                            # valor crítico ≈ 1.96
b + c(-1, 1) * qt(0.975, gl) * se        # IC 95% (lámina 15)

# Reto: testea H₀: β₁ = 50 en vez de 0. ¿Se rechaza al 5%?

# ============================================================================
# Tema 5 · Calcular valores-p
# ============================================================================
gl <- 932
2 * pt(-abs(6.4212), gl)                 # valor-p del ejemplo: casi 0

# Valor-p de dos colas para distintos estadísticos t
t <- c(1, 1.96, 2.2, 3)
round(2 * pt(-abs(t), gl), 4)

# Reto: ¿qué valor de t da un valor-p de exactamente 0.05 con 932 gl? Usa qt().

# ============================================================================
# Tema 6 · Una cola contra dos colas
# ============================================================================
# Lámina 20: retornos a la experiencia (n − k − 1 = 522)
t <- 0.0041 / 0.0017
t                                        # ≈ 2.41
qt(0.95, 522)                            # valor crítico de una cola ≈ 1.645
pt(t, 522, lower.tail = FALSE)           # valor-p de una cola
2 * pt(-abs(t), 522)                     # el de dos colas, para comparar

# Reto: si el estadístico fuera 1.8, ¿se rechazaría con una cola? ¿Y con dos?
