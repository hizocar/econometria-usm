# Clase 11 · Variables binarias, test de Chow y modelo de probabilidad lineal
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · Dos rectas paralelas
# ============================================================================
set.seed(21)
n     <- 400
mujer <- rbinom(n, 1, 0.5)
educ  <- sample(8:18, n, replace = TRUE)
salario <- 1.5 - 1 * mujer + 0.55 * educ + rnorm(n)    # delta0 = −1

m <- lm(salario ~ mujer + educ)
coef(m)
# Dos rectas paralelas: mismo efecto de educ, interceptos distintos
c(intercepto_hombres = unname(coef(m)[1]),
  intercepto_mujeres = unname(coef(m)[1] + coef(m)[2]))

# Reto: agrega la dummy hombre <- 1 - mujer al modelo junto con mujer. ¿Qué entrega R? ¿Por qué?

# ============================================================================
# Tema 2 · Categorías y categoría base
# ============================================================================
# Lámina 8: salario = 100 + 500 economía + 300 medicina + 600 ingeniería
set.seed(22)
carrera <- factor(sample(c("ninguna", "economia", "medicina", "ingenieria"), 800, replace = TRUE),
                  levels = c("ninguna", "economia", "medicina", "ingenieria"))
media   <- c(ninguna = 100, economia = 600, medicina = 400, ingenieria = 700)
salario <- media[as.character(carrera)] + rnorm(800, sd = 50)

coef(lm(salario ~ carrera))           # base: ninguna (la primera categoría)
tapply(salario, carrera, mean)        # los promedios por grupo
coef(lm(salario ~ relevel(carrera, ref = "medicina")))   # economía vs. medicina directo

# Reto: usa ref = "ingenieria". ¿Qué signo tienen ahora los coeficientes?

# ============================================================================
# Tema 3 · Interacción y test F
# ============================================================================
set.seed(23)
n     <- 500
mujer <- rbinom(n, 1, 0.5)
educ  <- sample(8:18, n, replace = TRUE)
salario <- 1.5 - 0.5 * mujer + 0.55 * educ + 0.2 * mujer * educ + rnorm(n)

ur <- lm(salario ~ mujer * educ)       # = mujer + educ + mujer:educ
coef(ur)
r  <- lm(salario ~ educ)               # H0: delta0 = delta1 = 0
anova(r, ur)                           # test F de la lámina 14

# Reto: cambia 0.2 * mujer * educ por 0 * mujer * educ. ¿Sigue rechazándose H₀?

# ============================================================================
# Tema 4 · Chow paso a paso
# ============================================================================
# Lámina 3: test de Chow para hombres y mujeres
SSR_r <- 85; SSR_ur <- 19 + 59
n <- 366; G <- 2; k <- 3
F <- (SSR_r - SSR_ur) / SSR_ur * (n - G * (k + 1)) / ((G - 1) * (k + 1))
c(F = F, critico = qf(0.95, (G - 1) * (k + 1), n - G * (k + 1)))

# Con datos simulados: regresión por grupo contra regresión conjunta
set.seed(24)
g <- rbinom(300, 1, 0.4); x <- rnorm(300)
y <- 1 + 2 * x + g * (0.5 + 0.8 * x) + rnorm(300)
SSRur <- sum(resid(lm(y ~ x, subset = g == 1))^2) + sum(resid(lm(y ~ x, subset = g == 0))^2)
SSRr  <- sum(resid(lm(y ~ x))^2)
(SSRr - SSRur) / SSRur * (300 - 2 * 2) / (1 * 2)

# Reto: en la simulación, cambia g * (0.5 + 0.8 * x) por 0 * g. ¿Se rechaza?

# ============================================================================
# Tema 5 · Probabilidades imposibles
# ============================================================================
# Lámina 8: P(accidente) = 0.30 − 0.05 educ − 0.0001 ingreso
prob <- function(educ, ingreso) 0.30 - 0.05 * educ - 0.0001 * ingreso
prob(4, 500)
prob(20, 2000)          # ¡negativa!

# MPL simulado: las predicciones pueden salir de [0, 1]
set.seed(25)
x <- runif(500, 0, 10)
y <- rbinom(500, 1, plogis(-3 + 0.8 * x))
m <- lm(y ~ x)
range(fitted(m))
mean(fitted(m) < 0 | fitted(m) > 1)    # % de predicciones imposibles

# Reto: ¿con qué educación la probabilidad de accidente se vuelve negativa si el ingreso es 0?
