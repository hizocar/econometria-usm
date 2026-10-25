# Clase 1 · Introducción y repaso de estadística
# Ejercicios de R de la página de la clase (Econometría ICS-294, USM).
# Solo usan R base: funcionan en RStudio y en https://webr.r-wasm.org/latest/

# ============================================================================
# Tema 2 · Helados, tiburones y temperatura
# ============================================================================
# Un día caluroso hace que se vendan más helados Y que más gente se bañe en el mar
set.seed(1)
dias        <- 200
temperatura <- runif(dias, 10, 35)
helados     <- 20 + 3 * temperatura + rnorm(dias, sd = 8)
ataques     <- 0.1 * temperatura + rnorm(dias, sd = 0.5)  # sin helados

cor(helados, ataques)                        # correlación alta…
coef(lm(ataques ~ helados))["helados"]       # …y pendiente positiva
coef(lm(ataques ~ helados + temperatura))    # con temperatura fija: ≈ 0

plot(helados, ataques, pch = 19, col = "steelblue",
     main = "¿Los helados provocan ataques de tiburón?")

# Reto: cambia 0.1 * temperatura por 0 * temperatura. ¿Qué pasa con la correlación entre helados y ataques?

# ============================================================================
# Tema 4 · Tres formas de datos
# ============================================================================
set.seed(4)
# Corte transversal: muchas unidades en un mismo momento
corte <- data.frame(persona = c("Ana", "Beto", "Carla"),
                    salario = c(850, 620, 1100), anio = 2024)
# Serie de tiempo: una unidad a lo largo del tiempo
serie <- data.frame(anio = 2020:2024,
                    dolar = c(792, 759, 873, 840, 944))  # promedio anual aprox.
# Panel: las MISMAS unidades en varios momentos
panel <- expand.grid(persona = c("Ana", "Beto", "Carla"), anio = 2022:2024)
panel$salario <- round(700 + 60 * (panel$anio - 2022) + rnorm(9, sd = 40))

corte
serie
panel
table(panel$persona)   # cada persona aparece una vez por año

# Reto: agrega el año 2025 al panel (cambia 2022:2024 por 2022:2025 y 9 por 12). ¿Cuántas filas tiene ahora?

# ============================================================================
# Tema 5 · Muestra grande pero sesgada
# ============================================================================
set.seed(1936)
N <- 100000
# Población: quienes tienen teléfono (más ricos) prefieren más al candidato A
telefono <- rbinom(N, 1, 0.35)
vota_A   <- rbinom(N, 1, ifelse(telefono == 1, 0.60, 0.30))
mean(vota_A)                 # parámetro (en la práctica, desconocido)

grande_sesgada <- sample(which(telefono == 1), 20000)  # solo con teléfono
pequena_azar   <- sample(N, 1000)                      # aleatoria simple
c(sesgada_n20000 = mean(vota_A[grande_sesgada]),
  azar_n1000     = mean(vota_A[pequena_azar]))

# Reto: aumenta la muestra sesgada de 20000 a 30000. ¿Se acerca al parámetro?

# ============================================================================
# Tema 6 · Estratificado contra aleatorio simple
# ============================================================================
set.seed(18)
# Ingresos en 3 comunas muy distintas entre sí, pero parecidas por dentro
comuna  <- rep(c("A", "B", "C"), each = 2000)
ingreso <- c(rnorm(2000, 500, 50), rnorm(2000, 900, 60),
             rnorm(2000, 1600, 80))
mean(ingreso)                                  # parámetro

simple <- replicate(2000, mean(sample(ingreso, 60)))
estratificado <- replicate(2000, mean(c(
  sample(ingreso[comuna == "A"], 20),
  sample(ingreso[comuna == "B"], 20),
  sample(ingreso[comuna == "C"], 20))))
c(simple = sd(simple), estratificado = sd(estratificado))  # error típico

boxplot(list(Simple = simple, Estratificado = estratificado),
        ylab = "Promedio estimado (n = 60)")
abline(h = mean(ingreso), lty = 2)

# Reto: haz que las comunas se parezcan (cambia 500 y 1600 por 900). ¿Sigue ganando el estratificado?

# ============================================================================
# Tema 7 · Describir e inferir
# ============================================================================
set.seed(7)
ventas <- round(rnorm(36, mean = 200, sd = 60))   # 36 meses de ventas

# Descriptiva: resume ESTA muestra
summary(ventas)
sd(ventas)

# Inferencial: dice algo de la POBLACIÓN (la media μ, que no conocemos)
mean(ventas) + c(-1, 1) * 1.96 * 60 / sqrt(36)    # IC 95%, σ = 60 conocido

# Reto: cambia los dos 36 por 144. ¿Qué pasa con el ancho del intervalo?

# ============================================================================
# Tema 8 · Media, mediana y un atípico
# ============================================================================
# 15 sueldos en miles de pesos; el último es un atípico (10 millones)
sueldos <- c(520, 610, 580, 700, 650, 590, 720, 680, 560, 630,
             600, 750, 640, 610, 10000)
c(media = mean(sueldos), mediana = median(sueldos))
c(desv_estandar = sd(sueldos), rango_intercuartil = IQR(sueldos))
quantile(sueldos)              # cuartiles: q1, mediana y q3

par(mfrow = c(1, 2))
hist(sueldos[-15], main = "Histograma (sin el atípico)", xlab = "miles de $")
boxplot(sueldos, main = "Boxplot: el atípico aparte")
par(mfrow = c(1, 1))

# Reto: elimina el 10000 del vector. ¿Cuánto cambia la media? ¿Y la mediana?

# ============================================================================
# Tema 9 · El TCL y el 95%
# ============================================================================
# TCL: la población es muy asimétrica, pero el promedio de 36 datos no
set.seed(36)
promedios <- replicate(5000, mean(rexp(36, rate = 1 / 200)))  # μ = σ = 200
hist(promedios, breaks = 40, main = "5 000 promedios de n = 36",
     xlab = "x barra")
c(media = mean(promedios), sd = sd(promedios), sd_teorica = 200 / 6)

# IC de 95% de la lámina 5: x barra = 200, σ = 60, n = 36
200 + c(-1, 1) * qnorm(0.975) * 60 / sqrt(36)

# ¿Qué significa el 95%? El intervalo atrapa a μ en ~95% de las muestras
cubre <- replicate(5000, {
  x <- rnorm(36, mean = 200, sd = 60)
  abs(mean(x) - 200) <= 1.96 * 60 / sqrt(36)
})
mean(cubre)

# Reto: cambia 0.975 por 0.995 en el IC. ¿El intervalo de 99% es más ancho o más angosto?

# ============================================================================
# Tema 10 · Productos defectuosos
# ============================================================================
# Lámina 20: 19 defectuosos en 200 unidades
x <- 19
n <- 200
p <- x / n
p + c(-1, 1) * qnorm(0.975) * sqrt(p * (1 - p) / n)  # (0.0543; 0.1356)

# Tamaño muestral para un error E = 0.03 con p* = 0.5 (peor escenario)
E <- 0.03
ceiling(qnorm(0.975)^2 * 0.5 * (1 - 0.5) / E^2)

# Reto: usa p* = 0.095 en vez de 0.5 en el tamaño muestral. ¿Cuántas unidades necesitas ahora?

# ============================================================================
# Tema 11 · Ingeniería contra arquitectura
# ============================================================================
# Lámina 32: salarios de egresados de ingeniería (X) y arquitectura (Y)
xbar <- 800000; ybar <- 680000
nx   <- 144;    ny   <- 121
sx   <- 60000;  sy   <- 50000

ee <- sqrt(sx^2 / nx + sy^2 / ny)               # error estándar
(xbar - ybar) + c(-1, 1) * qnorm(0.975) * ee    # (106 756; 133 244)

# Reto: ¿cuánto tendría que valer ybar para que el intervalo contuviera al cero? Pruébalo.
