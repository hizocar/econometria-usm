# Clase 12 · Heterocedasticidad y variables instrumentales
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · El abanico de los residuos
# ============================================================================
set.seed(31)
n    <- 300
educ <- runif(n, 6, 20)
salario <- 2 + 0.8 * educ + rnorm(n, sd = 0.3 * educ)    # Var(u | educ) crece
m <- lm(salario ~ educ)
plot(educ, resid(m), pch = 19, col = "steelblue", ylab = "residuo",
     main = "Heterocedasticidad: el abanico se abre")
abline(h = 0, lty = 2)

# Reto: cambia sd = 0.3 * educ por sd = 3. ¿Cómo cambia el gráfico?

# ============================================================================
# Tema 2 · Breusch-Pagan y White a mano
# ============================================================================
set.seed(32)
n  <- 300
x1 <- runif(n, 0, 10); x2 <- rnorm(n)
y  <- 1 + 0.5 * x1 + 0.3 * x2 + rnorm(n, sd = 0.2 + 0.3 * x1)
m  <- lm(y ~ x1 + x2)
u2 <- resid(m)^2

# Breusch-Pagan: u² sobre las x
aux <- lm(u2 ~ x1 + x2)
R2a <- summary(aux)$r.squared; k <- 2
c(F  = R2a / k / ((1 - R2a) / (n - k - 1)), p_F  = pf(R2a / k / ((1 - R2a) / (n - k - 1)), k, n - k - 1, lower.tail = FALSE),
  LM = n * R2a,                            p_LM = pchisq(n * R2a, k, lower.tail = FALSE))

# White: agrega cuadrados y productos cruzados (q = k + k(k + 1)/2 = 5)
auxW <- lm(u2 ~ x1 + x2 + I(x1^2) + I(x2^2) + I(x1 * x2))
c(LM_White = n * summary(auxW)$r.squared, critico = qchisq(0.95, 5))

# Reto: cambia sd = 0.2 + 0.3 * x1 por sd = 1. ¿Se rechaza la homocedasticidad?

# ============================================================================
# Tema 3 · Errores robustos con matrices
# ============================================================================
set.seed(33)
n <- 200
x <- runif(n, 0, 3)
y <- 1 + 2 * x + rnorm(n, sd = 0.2 + 1.2 * x^2)
m <- lm(y ~ x)
X <- model.matrix(m); u <- resid(m)
XtXi <- solve(t(X) %*% X)

V_usual   <- sum(u^2) / (n - 2) * XtXi                      # σ̂²(X'X)⁻¹
V_robusta <- XtXi %*% t(X) %*% diag(u^2) %*% X %*% XtXi     # lámina 18
cbind(se_usual = sqrt(diag(V_usual)), se_robusto = sqrt(diag(V_robusta)))

# Reto: cambia el error por rnorm(n, sd = 1) (homocedástico). ¿Se parecen ahora ambos errores estándar?

# ============================================================================
# Tema 4 · MCO con endogeneidad
# ============================================================================
# Endogeneidad por variable omitida: MCO sesgado aunque n sea grande
set.seed(34)
n <- 5000
habilidad <- rnorm(n)
educ <- 12 + 2 * habilidad + rnorm(n)
lsalario <- 1 + 0.08 * educ + 0.10 * habilidad + rnorm(n, sd = 0.3)
coef(lm(lsalario ~ educ))["educ"]      # verdadero: 0.08
cor(educ, 0.10 * habilidad)            # educ se correlaciona con el error

# Reto: cambia 2 * habilidad por 0 * habilidad en la educación. ¿Desaparece el sesgo?

# ============================================================================
# Tema 5 · VI y MC2E paso a paso
# ============================================================================
set.seed(35)
n <- 5000
habilidad <- rnorm(n)
z    <- rbinom(n, 1, 0.5)                          # instrumento: p. ej., vivir cerca de una universidad
educ <- 12 + 2 * z + 2 * habilidad + rnorm(n)      # relevancia: z afecta educ
lsalario <- 1 + 0.08 * educ + 0.10 * habilidad + rnorm(n, sd = 0.3)

b_mco <- coef(lm(lsalario ~ educ))["educ"]
b_vi  <- cov(lsalario, z) / cov(educ, z)            # lámina 10
# MC2E: primera etapa y segunda etapa (láminas 17 y 18)
educ_hat <- fitted(lm(educ ~ z))
b_mc2e <- coef(lm(lsalario ~ educ_hat))["educ_hat"]
c(MCO = unname(b_mco), VI = b_vi, MC2E = unname(b_mc2e))   # verdadero: 0.08
summary(lm(educ ~ z))$r.squared                     # R² de la primera etapa

# Reto: cambia 2 * z por 0.05 * z (instrumento débil). ¿Qué pasa con el R² de la primera etapa y con la estimación?
