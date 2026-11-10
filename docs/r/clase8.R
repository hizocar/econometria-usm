# Clase 8 · Inferencia sobre un conjunto de parámetros
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · β₁ = β₂ en R
# ============================================================================
set.seed(8)
n  <- 140
x1 <- rnorm(n)
x2 <- 0.6 * x1 + rnorm(n)
y  <- 1 + 1 * x1 + 1 * x2 + rnorm(n)      # β1 = β2: H0 es verdadera
m  <- lm(y ~ x1 + x2)

V      <- vcov(m)                          # σ̂²(XᵀX)⁻¹
se_dif <- sqrt(V["x1", "x1"] + V["x2", "x2"] - 2 * V["x1", "x2"])
t      <- (coef(m)["x1"] - coef(m)["x2"]) / se_dif
c(t = unname(t), valor_critico = qt(0.975, n - 3))

# Truco: con s = x1 + x2, el coeficiente de x1 en y ~ x1 + s es β1 − β2
s <- x1 + x2
coef(summary(lm(y ~ x1 + s)))["x1", ]      # mismo t que arriba

# Reto: cambia 1 * x2 por 0.5 * x2 en la línea de y (ahora H₀ es falsa). ¿Se rechaza?

# ============================================================================
# Tema 2 · El ejemplo de la lámina 5
# ============================================================================
# Lámina 4: σ̂²(XᵀX)⁻¹ y los coeficientes estimados
V <- matrix(c(8497.04975, -251.20725, -49.67375,
              -251.20725,   42.5775,   -2.8385,
               -49.67375,   -2.8385,    1.41925), 3, 3, byrow = TRUE)
b <- c(140, 42, 5)

a  <- c(0, 1, -1)                          # combinación: β1 − β2
se <- sqrt(drop(t(a) %*% V %*% a))         # Var(aᵀβ̂) = aᵀ V a
t  <- drop(a %*% b) / se
c(se = se, t = t, critico = qt(0.975, 137))   # lámina 5: 7.05, 5.3 y 1.98

# Reto: cambia a por c(0, 1, 0). ¿Qué test estás haciendo ahora?

# ============================================================================
# Tema 3 · β₁ = 2β₂ con matrices
# ============================================================================
V <- matrix(c(8497.04975, -251.20725, -49.67375,
              -251.20725,   42.5775,   -2.8385,
               -49.67375,   -2.8385,    1.41925), 3, 3, byrow = TRUE)
b <- c(140, 42, 5)

a  <- c(0, 1, -2)                          # H0: β1 − 2β2 = 0 (lámina 6)
v  <- drop(t(a) %*% V %*% a)               # 42.58 + 4·1.42 − 4·(−2.84)
c(var = v, se = sqrt(v), t = drop(a %*% b) / sqrt(v))
abs(drop(a %*% b) / sqrt(v)) > qt(0.975, 137)  # ¿se rechaza?

# Reto: testea H₀: β₁ = 8β₂. ¿Se rechaza?
