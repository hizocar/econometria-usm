# Verifica en R, de forma independiente, las respuestas del banco de la Práctica · Tercer bloque.
#   Rscript tools/practica_verificar3.R
suppressMessages(library(jsonlite))
invisible(Sys.setlocale("LC_CTYPE", "en_US.UTF-8"))
b <- fromJSON("tools/practica-banco3.json", simplifyVector = FALSE)
errores <- 0
revisar <- function(id, k, clave, calc, tol = 1e-3) {
  if (is.character(clave)) ok <- identical(clave, calc) else ok <- abs(as.numeric(clave) - calc) <= tol * max(1, abs(calc))
  if (is.na(ok) || !ok) { cat("✗", id, k, "clave =", format(clave), "R =", format(calc), "\n"); errores <<- errores + 1 }
}
ans <- function(e) setNames(lapply(e$preguntas, `[[`, "ans"), sapply(e$preguntas, `[[`, "k"))
si <- function(x) if (x) "sí" else "no"

for (e in b$ovb_asint) { a <- ans(e)
  # población simulada grande con esas varianzas y covarianza: la regresión corta converge a β1 + β2·δ1
  set.seed(5); n <- 2e5; x1 <- rnorm(n, sd = sqrt(e$v1)); x2 <- e$c12 / e$v1 * x1 + rnorm(n)
  y <- 1 + e$b1 * x1 + e$b2 * x2 + rnorm(n); corta <- coef(lm(y ~ x1))[["x1"]]
  d1 <- e$c12 / e$v1; revisar(e$id, "d1", a$d1, d1, 1e-6); revisar(e$id, "plim", a$plim, e$b1 + e$b2 * d1, 1e-6)
  revisar(e$id, "sim", corta, e$b1 + e$b2 * d1, 0.02); revisar(e$id, "sesgo", a$sesgo, e$b2 * d1, 1e-6)
  revisar(e$id, "dir", a$dir, if (e$b2 * d1 > 0) "sobreestima" else "subestima"); revisar(e$id, "n", a$n, "no")
}
for (e in b$asint) { a <- ans(e); se1 <- e$se0 * sqrt(e$n0 / e$n1); z <- qnorm(1 - e$alfa / 2)
  revisar(e$id, "z", e$z, z); revisar(e$id, "se1", a$se1, se1, 1e-6); revisar(e$id, "t1", a$t1, e$b / se1)
  revisar(e$id, "dec", a$dec, si(e$b / se1 > z)); revisar(e$id, "nreq", a$nreq, e$n0 * e$m^2, 0)
}
for (e in b$dummies) { a <- ans(e); d <- unlist(e$d)
  # datos con categoría base (primera) y tres dummies: lm() recupera δ; al cambiar la base se leen los nuevos coeficientes
  set.seed(6); cat4 <- factor(rep(e$cats, 30), levels = unlist(e$cats)); x <- runif(120, 1, 20)
  y <- e$b0 + e$bx * x + c(0, d)[as.integer(cat4)]
  m2 <- lm(y ~ x + relevel(cat4, ref = e$cats[[2]])); cf2 <- coef(m2)
  revisar(e$id, "nb", a$nb, cf2[[3]], 1e-6); revisar(e$id, "n3", a$n3, cf2[[5]], 1e-6)
  if (isTRUE(e$log)) { revisar(e$id, "p1", a$p1, 100 * (exp(d[1]) - 1)); revisar(e$id, "p23", a$p23, 100 * (exp(d[2] - d[3]) - 1)) }
  else { revisar(e$id, "d23", a$d23, d[2] - d[3]); revisar(e$id, "yb", a$yb, e$b0 + e$bx * e$x0) }
}
for (e in b$dumint) { a <- ans(e)
  set.seed(7); educ <- runif(80, 0, 20); mujer <- rbinom(80, 1, 0.5)
  ly <- e$b0 + e$d0 * mujer + e$b1 * educ + e$d1 * mujer * educ; cf <- coef(lm(ly ~ mujer * educ))
  revisar(e$id, "rh", a$rh, 100 * cf[["educ"]]); revisar(e$id, "rm", a$rm, 100 * (cf[["educ"]] + cf[["mujer:educ"]]))
  revisar(e$id, "br", a$br, 100 * (cf[["mujer"]] + cf[["mujer:educ"]] * e$e)); revisar(e$id, "xs", a$xs, -cf[["mujer"]] / cf[["mujer:educ"]])
}
for (e in b$chow) { a <- ans(e); n <- e$n1 + e$n2; q <- e$kk + 1; gl <- n - 2 * q; sur <- e$s1 + e$s2
  F <- ((e$sp - sur) / q) / (sur / gl)
  revisar(e$id, "sur", a$sur, sur); revisar(e$id, "q", a$q, q, 0); revisar(e$id, "gl", a$gl, gl, 0)
  revisar(e$id, "F", a$F, F); revisar(e$id, "crit", e$crit, qf(0.95, q, gl)); revisar(e$id, "dec", a$dec, si(F > qf(0.95, q, gl)))
}
for (e in b$mpl) { a <- ans(e); A <- unlist(e$a); B <- unlist(e$bb)
  pa <- e$b0 + e$b1 * A[1] + e$b2 * A[2]; pb <- e$b0 + e$b1 * B[1] + e$b2 * B[2]
  revisar(e$id, "pa", a$pa, pa, 1e-6); revisar(e$id, "pb", a$pb, pb, 1e-6); revisar(e$id, "dp", a$dp, e$b1 * e$dx, 1e-6)
  revisar(e$id, "fuera", a$fuera, si(min(pa, pb) < 0 || max(pa, pb) > 1))
}
for (e in b$bp) { a <- ans(e); gl <- e$n - e$kk - 1; LM <- e$n * e$r2; F <- (e$r2 / e$kk) / ((1 - e$r2) / gl)
  revisar(e$id, "LM", a$LM, LM); revisar(e$id, "cl", e$cl, qchisq(0.95, e$kk)); revisar(e$id, "dl", a$dl, si(LM > qchisq(0.95, e$kk)))
  revisar(e$id, "F", a$F, F); revisar(e$id, "cf", e$cf, qf(0.95, e$kk, gl)); revisar(e$id, "df", a$df, si(F > qf(0.95, e$kk, gl)))
  revisar(e$id, "q", a$q, e$kk + e$kk * (e$kk + 1) / 2, 0)
}
# Breusch-Pagan con datos: LM = n·R²_aux coincide con lmtest::bptest (studentizado) si está instalado
if (requireNamespace("lmtest", quietly = TRUE)) {
  set.seed(8); x <- runif(300, 1, 10); y <- 2 + x + rnorm(300, sd = x); m <- lm(y ~ x)
  aux <- summary(lm(resid(m)^2 ~ x))$r.squared; revisar("bp", "lmtest", 300 * aux, lmtest::bptest(m)$statistic[[1]], 1e-6)
}
for (e in b$robust) { a <- ans(e)
  revisar(e$id, "t", a$t, e$b / e$se); revisar(e$id, "tr", a$tr, e$b / e$ser)
  revisar(e$id, "du", a$du, si(abs(e$b / e$se) > 1.96)); revisar(e$id, "dr", a$dr, si(abs(e$b / e$ser) > 1.96)); revisar(e$id, "cual", a$cual, "la robusta")
}
for (e in b$iv) { a <- ans(e)
  if (e$sub == "cov") { revisar(e$id, "mco", a$mco, e$sxy / e$sxx, 1e-6); revisar(e$id, "vi", a$vi, e$szy / e$szx, 1e-6); revisar(e$id, "cons", a$cons, "VI") }
  else {
    # Wald = cov(z, y)/cov(z, x) con z binaria
    z <- rep(c(0, 1), each = 2); x <- c(e$x0, e$x0, e$x1, e$x1); y <- c(e$y0, e$y0, e$y1, e$y1)
    revisar(e$id, "vi", a$vi, cov(z, y) / cov(z, x), 1e-6); revisar(e$id, "dx", a$dx, e$x1 - e$x0, 1e-6); revisar(e$id, "dy", a$dy, e$y1 - e$y0, 1e-6)
  }
}
for (e in b$caso_hetero) { a <- ans(e); LM <- e$n * e$r2; tr <- e$b / e$ser
  revisar(e$id, "LM", a$LM, LM); revisar(e$id, "dl", a$dl, si(LM > qchisq(0.95, e$kk))); revisar(e$id, "cl", e$cl, qchisq(0.95, e$kk))
  revisar(e$id, "t", a$t, e$b / e$se); revisar(e$id, "tr", a$tr, tr); revisar(e$id, "dr", a$dr, if (tr > 1.96) "se rechaza" else "no se rechaza")
  revisar(e$id, "lo", a$lo, e$b - 1.96 * e$ser, 1e-6); revisar(e$id, "hi", a$hi, e$b + 1.96 * e$ser, 1e-6)
}
for (e in b$caso_iv) { a <- ans(e); sem <- sqrt(e$s2 / e$sst); sev <- sqrt(e$s2 / (e$sst * e$r2xz))
  revisar(e$id, "sem", a$sem, sem, 1e-7); revisar(e$id, "sev", a$sev, sev, 1e-7); revisar(e$id, "ratio", a$ratio, 1 / sqrt(e$r2xz))
  revisar(e$id, "tv", a$tv, e$bv / sev); revisar(e$id, "dv", a$dv, si(e$bv / sev > 1.96)); revisar(e$id, "debil", a$debil, "sube")
}
for (e in b$caso_chow) { a <- ans(e); n <- e$n1 + e$n2; sur <- e$s1 + e$s2; F <- ((e$sp - sur) / 3) / (sur / (n - 6))
  revisar(e$id, "sur", a$sur, sur); revisar(e$id, "gl", a$gl, n - 6, 0); revisar(e$id, "F", a$F, F)
  revisar(e$id, "dec", a$dec, si(F > qf(0.95, 3, n - 6))); revisar(e$id, "crit", e$crit, qf(0.95, 3, n - 6))
  # el modelo con D y D·x reproduce las regresiones separadas
  set.seed(9); x <- runif(40, 0, 20); D <- rep(0:1, each = 20); y <- ifelse(D == 1, e$a2 + e$p2 * x, e$a1 + e$p1 * x)
  cf <- coef(lm(y ~ D * x)); revisar(e$id, "dD", a$dD, cf[["D"]], 1e-6); revisar(e$id, "dDx", a$dDx, cf[["D:x"]], 1e-6)
}
cat(if (errores == 0) "✓ Banco 3 verificado: todas las respuestas coinciden con R.\n" else paste("✗", errores, "diferencias\n"))
