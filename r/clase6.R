# Clase 6 · Interpretación: logaritmos, cuadráticas e interacciones
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · Log-nivel y log-log
# ============================================================================
set.seed(3)
n       <- 500
educ    <- sample(6:20, n, replace = TRUE)
salario <- exp(0.584 + 0.083 * educ + rnorm(n, sd = 0.4))   # como la lámina 3
m <- lm(log(salario) ~ educ)
coef(m)
100 * coef(m)["educ"]                 # % por año, aproximado
100 * (exp(coef(m)["educ"]) - 1)      # % por año, exacto

# Log-log: elasticidad de la demanda de vino (lámina 4)
precio   <- runif(n, 3000, 15000)
cantidad <- exp(6 - 0.2 * log(precio) + rnorm(n, sd = 0.1))
coef(lm(log(cantidad) ~ log(precio)))

# Reto: cambia 0.083 por 0.3. ¿Qué tanto se alejan ahora la aproximación 100·β y el porcentaje exacto?

# ============================================================================
# Tema 2 · La curva de la experiencia
# ============================================================================
set.seed(6)
n       <- 500
exper   <- runif(n, 0, 45)
salario <- 3.73 + 0.298 * exper - 0.0061 * exper^2 + rnorm(n, sd = 1.5)
m <- lm(salario ~ exper + I(exper^2))
b <- coef(m)
b
unname(-b["exper"] / (2 * b["I(exper^2)"]))       # punto de quiebre (≈ 24.4)
b["exper"] + 2 * b["I(exper^2)"] * c(5, 20, 35)   # efecto de un año más

plot(exper, salario, pch = 19, col = "grey70")
curve(b[1] + b[2] * x + b[3] * x^2, add = TRUE, lwd = 3, col = "steelblue")

# Reto: cambia - 0.0061 por + 0.0061. ¿Existe todavía un máximo?

# ============================================================================
# Tema 3 · Interacción en R
# ============================================================================
set.seed(9)
n      <- 400
msq    <- runif(n, 40, 200)
dorm   <- sample(1:5, n, replace = TRUE)
precio <- 10 + 0.9 * msq - 2 * dorm + 0.05 * msq * dorm + rnorm(n, sd = 8)

m <- lm(precio ~ msq * dorm)            # = msq + dorm + msq:dorm
b <- coef(m)
b
b["dorm"] + b["msq:dorm"] * mean(msq)   # efecto de un dormitorio, casa promedio
b["dorm"] + b["msq:dorm"] * c(60, 160)  # casa chica y casa grande

# Reto: cambia 0.05 * msq * dorm por 0 * msq * dorm. ¿Qué pasa con el efecto del dormitorio en casas chicas y grandes?

# ============================================================================
# Tema 4 · Mismo modelo, otras unidades
# ============================================================================
set.seed(10)
n           <- 200
educ        <- sample(8:20, n, replace = TRUE)
salario_usd <- 150 + 20 * educ + rnorm(n, sd = 90)
salario_clp <- 1000 * salario_usd          # TC = 1000 (lámina 11)

coefs <- function(m) round(coef(summary(m))[2, 1:3], 3)  # β̂, s.e., t
rbind(dolares    = coefs(lm(salario_usd ~ educ)),
      pesos      = coefs(lm(salario_clp ~ educ)),
      x_en_meses = coefs(lm(salario_usd ~ I(12 * educ))))   # lámina 12

c(R2_dolares = summary(lm(salario_usd ~ educ))$r.squared,
  R2_pesos   = summary(lm(salario_clp ~ educ))$r.squared)

# Reto: agrega una fila con el salario en miles de dólares (salario_usd / 1000). ¿Qué esperas antes de ejecutar?
