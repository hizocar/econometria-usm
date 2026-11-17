# Ayudantía 11 · Variables binarias y modelo de probabilidad lineal
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · Las cuentas del ejercicio
# ============================================================================
# Ejercicio de diferencias salariales entre industrias
b_service  <- -0.283; se_service <- 0.099
100 * b_service                     # aproximación: −28.3%
100 * (exp(b_service) - 1)          # exacto: −24.7%
b_service / se_service              # t ≈ −2.86

# Consumo vs. financiero: la covarianza no se reporta
dif <- 0.181 - 0.158
se_sin_cov <- sqrt(0.085^2 + 0.089^2)
c(dif = dif, se = se_sin_cov, t = dif / se_sin_cov)

# Reto: ¿qué covarianza haría que t = 1.96 en la comparación de consprod y finance?

# ============================================================================
# Tema 2 · La varianza del error en el MPL
# ============================================================================
# En el MPL, Var(u | x) = p(x)·(1 − p(x)): depende de x, así que hay heterocedasticidad
p <- seq(0, 1, by = 0.1)
data.frame(p = p, varianza = p * (1 - p))
curve(x * (1 - x), from = 0, to = 1, lwd = 3, col = "steelblue",
      xlab = "p(x) = P(y = 1 | x)", ylab = "Var(u | x)")

# Reto: ¿qué valores de p dan una varianza menor a 0.1?
