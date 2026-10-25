# Clase 3 · Causalidad y variable omitida
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 2 · La tabla de la lámina 6
# ============================================================================
# Tabla de la lámina 6 con los contrafactuales "revelados" (los ?? son inventados)
datos <- data.frame(
  nombre = c("Sofía", "Paula", "Ezequiel", "Juan", "Caro"),
  T      = c(1, 0, 1, 0, 1),         # 1 = fue a la universidad
  Y_NT   = c(75, 40, 60, 20, 45),    # salario SIN universidad
  Y_T    = c(100, 55, 80, 30, 60)    # salario CON universidad
)
# Efecto individual: en la vida real nunca se observa
datos$efecto <- datos$Y_T - datos$Y_NT
datos

ATE <- mean(datos$efecto)                 # las 5 personas
ATT <- mean(datos$efecto[datos$T == 1])   # solo quienes fueron
c(ATE = ATE, ATT = ATT)

# Reto: cambia el Y_T de Juan de 30 a 60. ¿Cambia el ATT? ¿Y el ATE? ¿Por qué?

# ============================================================================
# Tema 3 · Diferencia observada = ATT + sesgo
# ============================================================================
datos <- data.frame(
  T    = c(1, 0, 1, 0, 1),
  Y_NT = c(75, 40, 60, 20, 45),
  Y_T  = c(100, 55, 80, 30, 60)
)
# Lo único que vemos: el outcome del mundo en que vivió cada uno
datos$Y <- ifelse(datos$T == 1, datos$Y_T, datos$Y_NT)

dif_obs <- mean(datos$Y[datos$T == 1]) - mean(datos$Y[datos$T == 0])
ATT     <- mean(datos$Y_T[datos$T == 1] - datos$Y_NT[datos$T == 1])
sesgo   <- mean(datos$Y_NT[datos$T == 1]) - mean(datos$Y_NT[datos$T == 0])
c(diferencia = dif_obs, ATT = ATT, sesgo = sesgo,
  ATT_mas_sesgo = ATT + sesgo)

# MCO de Y sobre T da justo la diferencia observada (lámina 9)
coef(lm(Y ~ T, data = datos))

# Reto: ¿qué valores de Y_NT tendrían que tener Sofía, Ezequiel y Caro para que el sesgo fuera cero? Pruébalo: ¿qué pasa con la diferencia observada?

# ============================================================================
# Tema 4 · Autoselección versus sorteo
# ============================================================================
set.seed(2026)
n <- 10000
habilidad <- rnorm(n)                          # no la observamos
Y_NT <- 100 + 15 * habilidad + rnorm(n, sd = 8)
Y_T  <- Y_NT + 10                      # efecto causal: +10

# 1) Autoselección: los más hábiles van más a la universidad
T_auto <- rbinom(n, 1, plogis(2 * habilidad))
Y_auto <- ifelse(T_auto == 1, Y_T, Y_NT)
coef(lm(Y_auto ~ T_auto))["T_auto"]

# 2) Aleatorización: una moneda decide quién va
T_azar <- rbinom(n, 1, 0.5)
Y_azar <- ifelse(T_azar == 1, Y_T, Y_NT)
coef(lm(Y_azar ~ T_azar))["T_azar"]

# ¿Por qué? Habilidad promedio de no tratados (0) y tratados (1)
tapply(habilidad, T_auto, mean)
tapply(habilidad, T_azar, mean)

# Reto: cambia el 2 de plogis(2 * habilidad) por 0. ¿Qué pasa con el sesgo? ¿Y si pones -2?

# ============================================================================
# Tema 5 · La fórmula del sesgo, número a número
# ============================================================================
set.seed(3)
n  <- 5000
x1 <- rnorm(n)
x2 <- 0.5 * x1 + rnorm(n)              # (B): delta1 = 0.5
y  <- 1 + 2 * x1 + 3 * x2 + rnorm(n)   # (A): beta1 = 2, beta2 = 3

corta <- lm(y ~ x1)            # (C): omite x2
larga <- lm(y ~ x1 + x2)       # (A): el modelo verdadero
aux   <- lm(x2 ~ x1)           # (B): la regresión auxiliar

coef(corta)["x1"]          # beta1 tilde (≈ 3.5)
# beta1 + beta2 * delta1 con los coeficientes estimados: ¡idéntico!
coef(larga)["x1"] + coef(larga)["x2"] * coef(aux)["x1"]

# Reto: cambia 0.5 por 0 en la línea de x2. ¿Cuánto vale ahora el sesgo? ¿Qué caso de la lámina 5 es?

# ============================================================================
# Tema 6 · Los cuatro casos de signos
# ============================================================================
# Sesgo de la regresión corta (beta1 tilde − beta1), lámina 6
sesgo_corta <- function(delta1, beta2, n = 5000) {
  x1 <- rnorm(n)
  x2 <- delta1 * x1 + rnorm(n)
  y  <- 1 + 2 * x1 + beta2 * x2 + rnorm(n)      # beta1 = 2
  unname(round(coef(lm(y ~ x1))["x1"] - 2, 2))
}
set.seed(6)
casos <- expand.grid(delta1 = c(0.8, -0.8), beta2 = c(2, -2))
casos$sesgo <- mapply(sesgo_corta, casos$delta1, casos$beta2)
casos$signo_predicho <- sign(casos$delta1 * casos$beta2)
casos

# Reto: agrega el caso δ₁ = 0 cambiando c(0.8, -0.8) por c(0.8, 0, -0.8). ¿Qué sesgo obtienes?

# ============================================================================
# Tema 7 · Fumar, edad y un cambio de signo
# ============================================================================
# Datos simulados que imitan las láminas 8 y 9 (n = 100)
set.seed(2026)
n     <- 100
edad  <- runif(n, 20, 80)
fumar <- 30 - 0.3 * edad + rnorm(n, sd = 2.3)  # mayores fuman menos
y     <- 13 + 0.94 * fumar + 0.98 * edad + rnorm(n)

corta <- lm(y ~ fumar)            # como "reg y smoke"
larga <- lm(y ~ fumar + edad)     # como "reg y smoke age"
round(coef(corta), 3)
round(coef(larga), 3)

delta2 <- coef(lm(edad ~ fumar))["fumar"]          # ¿qué signo tiene?
delta2
# beta1 + beta2 * delta2 = coeficiente de la regresión corta
coef(larga)["fumar"] + coef(larga)["edad"] * delta2

# Dentro de cada grupo de edad, la pendiente es positiva; juntos, negativa
plot(fumar, y, pch = 19, col = ifelse(edad > 50, "firebrick", "steelblue"),
     main = "Rojo: mayores de 50 · Azul: 50 o menos")
abline(corta, lwd = 2)

# Reto: cambia - 0.3 * edad por + 0.3 * edad (los mayores fuman más). Antes de ejecutar, predice el signo del sesgo.

# ============================================================================
# Tema 8 · ¿Agregar una variable irrelevante?
# ============================================================================
set.seed(10)
sim <- replicate(2000, {
  n  <- 50
  x1 <- rnorm(n)
  x3 <- 0.9 * x1 + rnorm(n, sd = 0.45)   # correlacionada con x1…
  y  <- 1 + 2 * x1 + rnorm(n)            # …pero irrelevante para y
  c(sin_x3 = unname(coef(lm(y ~ x1))["x1"]),
    con_x3 = unname(coef(lm(y ~ x1 + x3))["x1"]))
})
rowMeans(sim)        # ambos ≈ 2: incluir x3 no sesga
apply(sim, 1, sd)    # pero con x3 la dispersión es mucho mayor
boxplot(t(sim), col = c("steelblue", "goldenrod"), ylab = "beta1 estimado",
        main = "2 000 muestras: sin y con la variable irrelevante")
abline(h = 2, lty = 2)

# Reto: cambia 0.9 * x1 por 0 * x1 (irrelevante y no correlacionada). ¿Sigue aumentando la dispersión?
