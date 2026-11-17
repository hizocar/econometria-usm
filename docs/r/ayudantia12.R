# Ayudantía 12 · Heterocedasticidad: test de White y errores robustos
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · Tabla de q
# ============================================================================
# Número de restricciones del test de White: q = k + k(k + 1)/2
k <- 1:6
data.frame(k = k, cuadrados = k, cruzados = choose(k, 2), q = k + k * (k + 1) / 2)

# Reto: ¿con qué k la regresión auxiliar supera las 20 restricciones?

# ============================================================================
# Tema 2 · Las t de la guía
# ============================================================================
# Guía: t con errores usuales y robustos (cumgpa, tothrs y season)
coef  <- c(cumgpa = 0.193, tothrs = 0.0014, season = -0.157)
usual <- c(0.064, 0.0012, 0.098)
robus <- c(0.074, 0.0012, 0.07)
t <- cbind(t_usual = coef / usual, t_robusto = coef / robus)
round(t, 2)
round(2 * pt(-abs(t), df = 269 - 6 - 1), 4)      # valores-p

# Reto: ¿con qué s.e. robusto season dejaría de ser significativo al 5%?
