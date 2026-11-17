# Clase 10 · Propiedades asintóticas
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · El sesgo que no se va
# ============================================================================
# Con una variable omitida correlacionada con x, el sesgo NO desaparece al crecer n
set.seed(10)
sesgo <- function(n) {
  x <- rnorm(n)
  z <- 0.7 * x + rnorm(n)              # omitida, correlacionada con x
  y <- 1 + 2 * x + 1 * z + rnorm(n)
  unname(coef(lm(y ~ x))[2])           # verdadero: 2
}
sapply(c(50, 500, 5000, 50000), sesgo)  # se acerca a 2.7, no a 2

# Reto: cambia 0.7 * x por 0 * x (la omitida ya no se correlaciona con x). ¿Hacia dónde converge ahora?

# ============================================================================
# Tema 2 · Consistencia por simulación
# ============================================================================
# Como la aplicación en R de la lámina 17: β̂1 para muestras cada vez más grandes
set.seed(11)
ns <- c(10, 50, 200, 1000, 5000)
beta_hat <- sapply(ns, function(n) {
  replicate(300, {
    x <- rnorm(n)
    u <- rexp(n) - 1                    # error muy asimétrico, media 0
    y <- 1 + 2 * x + u
    coef(lm(y ~ x))[2]
  })
})
colnames(beta_hat) <- ns
round(apply(beta_hat, 2, sd), 4)                      # la dispersión cae
round(colMeans(abs(beta_hat - 2) > 0.1), 3)            # P(|β̂1 − 2| > 0.1) → 0
boxplot(beta_hat, xlab = "n", ylab = "beta1 estimado"); abline(h = 2, lty = 2)

# Reto: cambia el error por rnorm(n) * 3. ¿Converge igual?

# ============================================================================
# Tema 3 · La t con errores asimétricos
# ============================================================================
set.seed(12)
t_stats <- function(n) replicate(4000, {
  x <- abs(rnorm(n))
  y <- 1 + 2 * x + (rexp(n) - 1) * 2      # errores asimétricos
  s <- coef(summary(lm(y ~ x)))
  (s[2, 1] - 2) / s[2, 2]
})
t10  <- t_stats(10)
t500 <- t_stats(500)
c(rechazo_n10 = mean(abs(t10) > 1.96), rechazo_n500 = mean(abs(t500) > 1.96))  # meta: 0.05
hist(t500, breaks = 50, freq = FALSE, main = "t con n = 500")
curve(dnorm(x), add = TRUE, lwd = 3, col = "goldenrod")

# Reto: prueba n = 30. ¿Se acerca al 5%?

# ============================================================================
# Tema 4 · MCO contra otro estimador consistente
# ============================================================================
# MCO tiene menor varianza que otro estimador consistente (eficiencia asintótica)
set.seed(13)
n <- 400
sim <- replicate(2000, {
  x <- rnorm(n); y <- 1 + 2 * x + rnorm(n)
  mco <- coef(lm(y ~ x))[2]
  alto <- x > median(x)                   # estimador alternativo: compara dos grupos
  grupos <- (mean(y[alto]) - mean(y[!alto])) / (mean(x[alto]) - mean(x[!alto]))
  c(MCO = unname(mco), grupos = grupos)
})
rowMeans(sim)          # ambos ≈ 2: los dos son consistentes
apply(sim, 1, var)     # pero MCO tiene menor varianza

# Reto: aumenta n a 4000. ¿Siguen ambos cerca de 2? ¿Se mantiene la diferencia de varianzas?
