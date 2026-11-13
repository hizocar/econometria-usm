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
cat(if (errores == 0) "✓ Banco verificado: todas las respuestas coinciden con R.\n" else paste("✗", errores, "diferencias\n"))
