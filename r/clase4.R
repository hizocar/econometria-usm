# Clase 4 · Regresión lineal múltiple
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 1 · Simple contra múltiple
# ============================================================================
set.seed(1)
n         <- 1000
IQ        <- rnorm(n, 100, 15)
educacion <- 12 + 0.1 * (IQ - 100) + rnorm(n, sd = 2)   # más IQ, más educación
salario   <- 1 + 0.37 * educacion + 0.05 * IQ + rnorm(n, sd = 2)

coef(lm(salario ~ educacion))        # simple: mezcla educación e IQ
coef(lm(salario ~ educacion + IQ))   # múltiple: educación con IQ fijo

# Reto: cambia 0.1 * (IQ - 100) por 0 * (IQ - 100). ¿Siguen siendo distintos los dos coeficientes?

# ============================================================================
# Tema 2 · Las k + 1 condiciones
# ============================================================================
set.seed(2)
n  <- 200
x1 <- rnorm(n)
x2 <- rnorm(n)
x3 <- rnorm(n)
y  <- 1 + 2 * x1 - 1 * x2 + 0.5 * x3 + rnorm(n)

m <- lm(y ~ x1 + x2 + x3)
coef(m)
u <- resid(m)
# Las k + 1 = 4 condiciones de primer orden: Σû = 0 y Σ xj û = 0
round(c(sum(u), sum(x1 * u), sum(x2 * u), sum(x3 * u)), 10)

# Reto: agrega una cuarta variable x4 <- rnorm(n) al modelo. ¿Cuántas condiciones hay que verificar ahora?

# ============================================================================
# Tema 3 · Arma X con los datos de la lámina
# ============================================================================
# Datos de la lámina 8 (y del ejercicio de la ayudantía)
experiencia <- c(12, 18, 14, 12, 11)
educacion   <- c(93, 119, 108, 96, 74)
salario     <- c(769, 808, 825, 650, 562)

X <- cbind(unos = 1, experiencia, educacion)   # n × (k + 1)
y <- salario
X
dim(X)
t(X) %*% X        # XᵀX: (k + 1) × (k + 1)
t(X) %*% y        # Xᵀy

# Reto: agrega una tercera variable, por ejemplo edad <- c(30, 41, 35, 29, 26), a X. ¿Qué dimensión tiene ahora XᵀX?

# ============================================================================
# Tema 4 · La fórmula en R
# ============================================================================
experiencia <- c(12, 18, 14, 12, 11)
educacion   <- c(93, 119, 108, 96, 74)
salario     <- c(769, 808, 825, 650, 562)
X <- cbind(1, experiencia, educacion)
y <- salario

beta <- solve(t(X) %*% X) %*% t(X) %*% y     # (XᵀX)⁻¹ Xᵀy
beta
coef(lm(salario ~ experiencia + educacion))  # lo mismo

u_hat <- y - X %*% beta
round(t(X) %*% u_hat, 8)                     # Xᵀû = 0

# Reto: duplica una columna: usa X <- cbind(1, experiencia, experiencia). ¿Qué error da solve() y por qué?

# ============================================================================
# Tema 5 · La trampa del R²
# ============================================================================
set.seed(5)
n <- 30
x <- rnorm(n)
y <- 1 + 2 * x + rnorm(n, sd = 2)
r2 <- function(m) c(R2 = summary(m)$r.squared,
                    R2_ajustado = summary(m)$adj.r.squared)

basura <- matrix(rnorm(n * 10), n, 10)  # 10 variables sin relación con y
rbind(solo_x     = r2(lm(y ~ x)),
      x_y_basura = r2(lm(y ~ x + basura)))

# Reto: agrega 20 variables basura (cambia los dos 10 por 20). ¿Qué pasa con el R² ajustado?

# ============================================================================
# Tema 6 · La salida de la lámina 25
# ============================================================================
datos <- data.frame(
  experiencia = c(12, 18, 14, 12, 11),
  educacion   = c(93, 119, 108, 96, 74),
  y_sal       = c(769, 808, 825, 650, 562)
)
m <- lm(y_sal ~ experiencia + educacion, data = datos)
summary(m)                 # compárala con la lámina 25

# R² ajustado a mano, con n = 5 y k = 2
R2 <- summary(m)$r.squared
1 - (5 - 1) / (5 - 2 - 1) * (1 - R2)
fitted(m)                  # ŷ = X beta gorro

# Reto: agrega un sexto individuo a los datos (por ejemplo, 15, 100 y 700). ¿Cómo cambian los errores estándar?

# ============================================================================
# Tema 7 · Cofactores en R
# ============================================================================
experiencia <- c(12, 18, 14, 12, 11)
educacion   <- c(93, 119, 108, 96, 74)
X <- cbind(1, experiencia, educacion)
A <- t(X) %*% X
det(A)

# Cofactor (i, j) = (−1)^(i + j) · determinante del menor sin fila i ni columna j
cof <- matrix(0, 3, 3)
for (i in 1:3) for (j in 1:3) cof[i, j] <- (-1)^(i + j) * det(A[-i, -j])
adjunta <- t(cof)
inversa <- adjunta / det(A)

round(inversa, 4)
round(solve(A), 4)          # la inversa que calcula R: igual
round(A %*% inversa, 10)    # la identidad

# Reto: calcula β̂ con tu inversa: inversa %*% t(X) %*% c(769, 808, 825, 650, 562).
