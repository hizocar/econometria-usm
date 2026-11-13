# Verifica en R, de forma independiente, las respuestas del banco de la Práctica.
#   Rscript tools/practica_verificar.R
# Recalcula cada respuesta desde los datos (lm, solve, promedios) y la compara con la clave del banco.
suppressMessages(library(jsonlite))
invisible(Sys.setlocale("LC_CTYPE", "en_US.UTF-8"))
b <- fromJSON("tools/practica-banco.json", simplifyVector = FALSE)
errores <- 0
revisar <- function(id, k, clave, calc, tol = 1e-3) {
  if (is.character(clave)) ok <- identical(clave, calc) else ok <- abs(as.numeric(clave) - calc) <= tol * max(1, abs(calc))
  if (is.na(ok) || !ok) { cat("✗", id, k, "clave =", format(clave), "R =", format(calc), "\n"); errores <<- errores + 1 }
}
ans <- function(e) setNames(lapply(e$preguntas, `[[`, "ans"), sapply(e$preguntas, `[[`, "k"))

for (e in b$simple) {
  x <- unlist(e$x); y <- unlist(e$y); m <- lm(y ~ x); a <- ans(e); i <- e$i + 1
  revisar(e$id, "b1", a$b1, coef(m)[[2]]); revisar(e$id, "b0", a$b0, coef(m)[[1]])
  revisar(e$id, "yhat", a$yhat, fitted(m)[[i]]); revisar(e$id, "u", a$u, resid(m)[[i]])
  revisar(e$id, "SST", a$SST, sum((y - mean(y))^2)); revisar(e$id, "SSR", a$SSR, sum(resid(m)^2))
  revisar(e$id, "R2", a$R2, summary(m)$r.squared)
}
for (e in b$multi) {
  x1 <- unlist(e$x1); x2 <- unlist(e$x2); y <- unlist(e$y); m <- lm(y ~ x1 + x2); a <- ans(e)
  X <- cbind(1, x1, x2)
  inv <- matrix(unlist(e$adj), 3, 3, byrow = TRUE) / e$d
  if (max(abs(inv - solve(t(X) %*% X))) > 1e-9) { cat("✗", e$id, "(XᵀX)⁻¹\n"); errores <- errores + 1 }
  revisar(e$id, "b0", a$b0, coef(m)[[1]]); revisar(e$id, "b1", a$b1, coef(m)[[2]]); revisar(e$id, "b2", a$b2, coef(m)[[3]])
  revisar(e$id, "s2", a$s2, summary(m)$sigma^2); revisar(e$id, "se1", a$se1, coef(summary(m))[2, 2])
  revisar(e$id, "R2", a$R2, summary(m)$r.squared); revisar(e$id, "R2a", a$R2a, summary(m)$adj.r.squared)
  q <- e$preguntas[[8]]
  if (q$k == "pred") revisar(e$id, "pred", q$ans, sum(coef(m) * c(1, q$v1, q$v2)))
  if (q$k == "dy") revisar(e$id, "dy", q$ans, sum(coef(m)[2:3] * c(q$v1, q$v2)))
}
for (e in b$causal) {
  T <- unlist(e$T); y0 <- unlist(e$ynt); y1 <- unlist(e$yt); a <- ans(e)
  revisar(e$id, "ATE", a$ATE, mean(y1 - y0)); revisar(e$id, "ATT", a$ATT, mean((y1 - y0)[T == 1]))
  revisar(e$id, "dif", a$dif, mean(y1[T == 1]) - mean(y0[T == 0]))
  revisar(e$id, "SB", a$SB, mean(y0[T == 1]) - mean(y0[T == 0]))
}
for (e in b$ovb) {
  # Simula datos que cumplen exactamente las ecuaciones y comprueba la identidad β̃1 = β1 + β2·δ1
  a <- ans(e); D <- e$datos; b1 <- D$b1; b2 <- D$b2; d1 <- D$d1
  if (D$incognita == "b2") revisar(e$id, "b2", a$b2, (D$bt - b1) / d1)
  if (D$incognita == "d1") revisar(e$id, "d1", a$d1, (D$bt - b1) / b2)
  if (D$incognita == "bt") revisar(e$id, "bt", a$bt, b1 + b2 * d1)
  revisar(e$id, "bt_dato", D$bt, b1 + b2 * d1, 1e-9)
  set.seed(1); n <- 400; x1 <- rnorm(n); x2 <- d1 * x1 + rnorm(n); x2 <- x2 - fitted(lm(x2 ~ x1)) + d1 * x1
  y <- 3 + b1 * x1 + b2 * x2 + resid(lm(rnorm(n) ~ x1 + x2))
  revisar(e$id, "identidad", b1 + b2 * d1, coef(lm(y ~ x1))[[2]], 1e-6)
  revisar(e$id, "signo", a$signo, if (b2 * d1 > 0) "positivo" else "negativo")
}
z <- c("90" = qnorm(0.95), "95" = qnorm(0.975), "99" = qnorm(0.995))
for (e in b$ic) {
  a <- ans(e); zz <- z[[e$conf]]
  if (e$tipo == "ic1") { m <- e$xbar; ee <- e$sigma / sqrt(e$n) } else { m <- e$xb - e$yb; ee <- sqrt(e$sx^2 / e$nx + e$sy^2 / e$ny) }
  revisar(e$id, "lo", a$lo, m - zz * ee, 2e-3); revisar(e$id, "hi", a$hi, m + zz * ee, 2e-3)
  if (e$tipo == "ic2") revisar(e$id, "dif", a$dif, if (m - zz * ee <= 0 && 0 <= m + zz * ee) "no" else "sí")
}
for (e in b$resumen) {
  a <- ans(e); n <- e$n
  # Construye datos con exactamente esos resúmenes y verifica con lm()
  set.seed(1); x0 <- rnorm(n); x <- e$xbar + (x0 - mean(x0)) * sqrt(e$Sxx / sum((x0 - mean(x0))^2))
  b1 <- e$Sxy / e$Sxx; b0 <- e$ybar - b1 * e$xbar
  r0 <- resid(lm(rnorm(n) ~ x)); r <- r0 * sqrt(e$SSR / sum(r0^2))
  y <- b0 + b1 * x + r; m <- lm(y ~ x)
  revisar(e$id, "b1", a$b1, coef(m)[[2]]); revisar(e$id, "b0", a$b0, coef(m)[[1]])
  revisar(e$id, "SSE", a$SSE, sum((fitted(m) - mean(y))^2)); revisar(e$id, "R2", a$R2, summary(m)$r.squared)
  revisar(e$id, "s2", a$s2, summary(m)$sigma^2); revisar(e$id, "se1", a$se1, coef(summary(m))[2, 2])
}
for (e in b$residuos) {
  x <- unlist(e$x); y <- unlist(e$y); m <- lm(y ~ x); a <- ans(e); ij <- unlist(e$ij) + 1
  revisar(e$id, "ui", a$ui, resid(m)[[ij[1]]]); revisar(e$id, "uj", a$uj, resid(m)[[ij[2]]])
  revisar(e$id, "SSR", a$SSR, sum(resid(m)^2)); revisar(e$id, "yhat", a$yhat, fitted(m)[[ij[1]]])
  conocidos <- unlist(lapply(e$u, function(v) if (is.null(v)) NA else v))
  revisar(e$id, "conocidos", 0, max(abs(conocidos - resid(m)), na.rm = TRUE), 1e-9)
}
for (e in b$unidades) {
  a <- ans(e); set.seed(2); x <- runif(80, 1, 20); y <- e$b0 + e$b1 * x + rnorm(80, sd = 5)
  m0 <- lm(y ~ x); y2 <- if (e$var == "y") y * e$c else y; x2 <- if (e$var == "x") x * e$c else x; m1 <- lm(y2 ~ x2)
  esp <- if (e$var == "y") coef(m0) * e$c else c(coef(m0)[1], coef(m0)[2] / e$c)
  revisar(e$id, "regla", 0, max(abs(coef(m1) - esp)), 1e-6)
  revisar(e$id, "R2inv", summary(m0)$r.squared, summary(m1)$r.squared, 1e-9)
  revisar(e$id, "nb0", a$nb0, if (e$var == "y") e$b0 * e$c else e$b0)
  revisar(e$id, "nb1", a$nb1, if (e$var == "y") e$b1 * e$c else e$b1 / e$c)
  revisar(e$id, "nR2", a$nR2, e$R2)
}
for (e in b$matriz2) {
  x <- unlist(e$x); y <- unlist(e$y); m <- lm(y ~ x); a <- ans(e); X <- cbind(1, x); A <- t(X) %*% X
  revisar(e$id, "sx", a$sx, A[1, 2]); revisar(e$id, "sxx", a$sxx, A[2, 2]); revisar(e$id, "det", a$det, det(A))
  revisar(e$id, "b0", a$b0, coef(m)[[1]]); revisar(e$id, "b1", a$b1, coef(m)[[2]])
}
for (e in b$descriptiva) {
  d <- unlist(e$datos); a <- ans(e); sin <- d[-which(d == e$atip)[1]]
  revisar(e$id, "media", a$media, mean(d)); revisar(e$id, "mediana", a$mediana, median(d))
  revisar(e$id, "var", a$var, var(d)); revisar(e$id, "sd", a$sd, sd(d)); revisar(e$id, "media_sin", a$media_sin, mean(sin))
}
zt <- c("90" = 1.645, "95" = 1.96, "99" = 2.576)
for (e in b$tamano) {
  a <- ans(e); z <- zt[[e$conf]]
  if (e$sub == "media") revisar(e$id, "n", a$n, ceiling((z * e$sigma / e$E)^2), 0)
  if (e$sub == "prop_n") revisar(e$id, "n", a$n, ceiling(z^2 * e$p * (1 - e$p) / e$E^2), 0)
  if (e$sub == "prop_ic") { p <- e$x / e$n; ee <- sqrt(p * (1 - p) / e$n)
    revisar(e$id, "p", a$p, p); revisar(e$id, "lo", a$lo, p - z * ee); revisar(e$id, "hi", a$hi, p + z * ee) }
}
for (e in b$comparar) {
  a <- ans(e); n <- e$n
  ra <- function(ssr, k) 1 - (n - 1) / (n - k - 1) * ssr / e$SST
  revisar(e$id, "R2A", a$R2A, 1 - e$SSRA / e$SST); revisar(e$id, "R2B", a$R2B, 1 - e$SSRB / e$SST)
  revisar(e$id, "RaA", a$RaA, ra(e$SSRA, e$kA)); revisar(e$id, "RaB", a$RaB, ra(e$SSRB, e$kB))
  revisar(e$id, "mejor", a$mejor, if (ra(e$SSRA, e$kA) > ra(e$SSRB, e$kB)) "A" else "B")
}
cat(if (errores == 0) "✓ Banco verificado: todas las respuestas coinciden con R.\n" else paste("✗", errores, "diferencias\n"))
