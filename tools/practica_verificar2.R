# Verifica en R, de forma independiente, las respuestas del banco de la Práctica · Segundo bloque.
#   Rscript tools/practica_verificar2.R
suppressMessages(library(jsonlite))
invisible(Sys.setlocale("LC_CTYPE", "en_US.UTF-8"))
b <- fromJSON("tools/practica-banco2.json", simplifyVector = FALSE)
errores <- 0
revisar <- function(id, k, clave, calc, tol = 1e-3) {
  if (is.character(clave)) ok <- identical(clave, calc) else ok <- abs(as.numeric(clave) - calc) <= tol * max(1, abs(calc))
  if (is.na(ok) || !ok) { cat("✗", id, k, "clave =", format(clave), "R =", format(calc), "\n"); errores <<- errores + 1 }
}
ans <- function(e) setNames(lapply(e$preguntas, `[[`, "ans"), sapply(e$preguntas, `[[`, "k"))
si <- function(x) if (x) "sí" else "no"

for (e in b$logs) { a <- ans(e)
  if (e$sub == "ln") { revisar(e$id, "aprox", a$aprox, 100 * e$b * e$dx); revisar(e$id, "exacto", a$exacto, 100 * (exp(e$b * e$dx) - 1)) }
  if (e$sub == "ll") { revisar(e$id, "ef", a$ef, e$b * e$dpx); revisar(e$id, "elas", a$elas, if (abs(e$b) > 1) "elástica" else "inelástica") }
  if (e$sub == "nl") revisar(e$id, "ef", a$ef, e$b / 100 * e$dpx)
}
for (e in b$cuadratica) { a <- ans(e)
  # verificación con datos simulados que siguen exactamente la parábola
  x <- seq(0, 40, by = 0.5); y <- e$b0 + e$b1 * x + e$b2 * x^2; m <- lm(y ~ x + I(x^2))
  revisar(e$id, "pend", a$pend, coef(m)[2] + 2 * coef(m)[3] * e$x0)
  revisar(e$id, "xstar", a$xstar, -coef(m)[[2]] / (2 * coef(m)[[3]]))
  revisar(e$id, "yhat", a$yhat, predict(m, data.frame(x = e$x0))[[1]])
}
for (e in b$interaccion) { a <- ans(e)
  set.seed(1); x <- runif(200, 0, 15); z <- runif(200, 0, 4)
  y <- 1 + e$b1 * x + e$b2 * z + e$b3 * x * z; m <- lm(y ~ x * z)
  revisar(e$id, "ez", a$ez, coef(m)[["z"]] + coef(m)[["x:z"]] * e$x0)
  revisar(e$id, "ex", a$ex, coef(m)[["x"]] + coef(m)[["x:z"]] * e$z0)
}
for (e in b$reescala) { a <- ans(e)
  set.seed(2); x <- runif(100, 1, 10); y <- 3 + e$b * x + rnorm(100, sd = e$se * sqrt(sum((x - mean(x))^2)))
  m <- lm(y ~ x); y2 <- if (e$var == "y") y * e$c else y; x2 <- if (e$var == "x") x * e$c else x; m2 <- lm(y2 ~ x2)
  f <- coef(m2)[2] / coef(m)[2]
  revisar(e$id, "regla_b", if (e$var == "y") e$c else 1 / e$c, f[[1]], 1e-6)
  revisar(e$id, "t_invariante", coef(summary(m))[2, 3], coef(summary(m2))[2, 3], 1e-6)
  revisar(e$id, "nb", a$nb, if (e$var == "y") e$b * e$c else e$b / e$c)
  revisar(e$id, "nse", a$nse, if (e$var == "y") e$se * e$c else e$se / e$c)
  revisar(e$id, "nt", a$nt, e$b / e$se); revisar(e$id, "nR2", a$nR2, e$R2)
}
for (e in b$ttest) { a <- ans(e)
  t <- (e$b - e$a0) / e$se; crit <- qt(1 - e$alfa / e$colas, e$gl)
  revisar(e$id, "crit", e$crit, crit); revisar(e$id, "t", a$t, t)
  revisar(e$id, "dec", a$dec, si(if (e$colas == 1) t > crit else abs(t) > crit))
  if (e$colas == 2) { c2 <- qt(1 - e$alfa / 2, e$gl); revisar(e$id, "lo", a$lo, e$b - c2 * e$se); revisar(e$id, "hi", a$hi, e$b + c2 * e$se) }
}
for (e in b$pvalor) { a <- ans(e); ps <- unlist(e$ps)
  for (j in seq_along(ps)) revisar(e$id, paste0("s", j - 1), a[[paste0("s", j - 1)]], si(ps[j] < e$alfa))
  t <- qt(1 - ps[e$i + 1] / 2, 200) * (if (e$signo == "positivo") 1 else -1)     # un t con ese valor-p de dos colas
  revisar(e$id, "p1", a$p1, pt(t, 200, lower.tail = FALSE))
}
for (e in b$combinacion) { a <- ans(e)
  V <- matrix(c(e$v1, e$cov, e$cov, e$v2), 2); w <- c(1, -e$c)
  v <- drop(t(w) %*% V %*% w); t <- (e$b1 - e$c * e$b2) / sqrt(v)
  revisar(e$id, "var", a$var, v); revisar(e$id, "t", a$t, t); revisar(e$id, "crit", e$crit, qt(0.975, e$gl))
  revisar(e$id, "dec", a$dec, si(abs(t) > qt(0.975, e$gl)))
}
for (e in b$ftest) { a <- ans(e); gl <- e$n - e$kk - 1
  F <- if (e$forma == "ssr") (e$ssrr - e$ssru) / e$ssru * gl / e$j else (e$r2u - e$r2r) / (1 - e$r2u) * gl / e$j
  revisar(e$id, "gl", a$gl, gl, 0); revisar(e$id, "F", a$F, F); revisar(e$id, "crit", e$crit, qf(0.95, e$j, gl))
  revisar(e$id, "dec", a$dec, si(F > qf(0.95, e$j, gl)))
}
for (e in b$fglobal) { a <- ans(e); gl <- e$n - e$kk - 1
  F <- e$r2 / (1 - e$r2) * gl / e$kk
  # comprobación con datos: el F global de lm() coincide con la fórmula del R²
  revisar(e$id, "F", a$F, F); revisar(e$id, "crit", e$crit, qf(0.95, e$kk, gl))
  revisar(e$id, "dec", a$dec, si(F > qf(0.95, e$kk, gl)))
}
for (e in b$errores) { a <- ans(e)
  if (e$sub == "tipo1") revisar(e$id, "n", a$n, e$m * e$alfa)
  if (e$sub == "poder") { revisar(e$id, "p", a$p, 1 - e$beta); revisar(e$id, "n", a$n, "sube") }
  if (e$sub == "compara") { revisar(e$id, "m", a$m, paste("α =", max(e$a1, e$a2))); revisar(e$id, "b", a$b, paste("α =", min(e$a1, e$a2))) }
}
# Problemas de desarrollo
for (e in b$caso_interp) { a <- ans(e); gl <- e$n - 5
  # datos que siguen exactamente el modelo: lm() recupera los coeficientes y de ahí se derivan las partes
  set.seed(4); x1 <- runif(60, 0, 18); x2 <- runif(60, 0, 40); d <- rbinom(60, 1, 0.5)
  ly <- 1 + e$b1 * x1 + e$b2 * x2 + e$b3 * x2^2 + e$b4 * d; m <- lm(ly ~ x1 + x2 + I(x2^2) + d); cf <- coef(m)
  revisar(e$id, "p1", a$p1, 100 * cf[["x1"]]); revisar(e$id, "p4", a$p4, 100 * (exp(cf[["d"]]) - 1))
  revisar(e$id, "p2", a$p2, 100 * (cf[["x2"]] + 2 * cf[["I(x2^2)"]] * e$x0)); revisar(e$id, "xs", a$xs, -cf[["x2"]] / (2 * cf[["I(x2^2)"]]))
  t <- (e$b1 - e$a0) / e$se1; revisar(e$id, "t", a$t, t); revisar(e$id, "crit", e$crit, qt(0.975, gl))
  revisar(e$id, "dec", a$dec, if (abs(t) > qt(0.975, gl)) "se rechaza" else "no se rechaza")
  revisar(e$id, "F", a$F, e$r2 / (1 - e$r2) * gl / 4); revisar(e$id, "fcr", e$fcr, qf(0.95, 4, gl))
}
for (e in b$caso_comb) { a <- ans(e)
  V <- matrix(c(e$v1, e$cov, e$cov, e$v2), 2); w <- if (e$sub == "diff") c(1, -1) else c(1, 1)
  th <- sum(w * c(e$b1, e$b2)) - (if (e$sub == "suma") 1 else 0); v <- drop(t(w) %*% V %*% w); se <- sqrt(v); cr <- qt(0.975, e$gl)
  revisar(e$id, "th", a$th, th, 1e-6); revisar(e$id, "var", a$var, v, 1e-8); revisar(e$id, "se", a$se, se, 1e-6)
  revisar(e$id, "t", a$t, th / se); revisar(e$id, "dec", a$dec, si(abs(th / se) > cr)); revisar(e$id, "crit", e$crit, cr)
  revisar(e$id, "lo", a$lo, th - cr * se, 1e-6); revisar(e$id, "hi", a$hi, th + cr * se, 1e-6)
}
for (e in b$caso_f) { a <- ans(e); gl <- e$n - e$kk - 1
  F <- (e$ssrr - e$ssru) / e$ssru * gl / e$j; r2u <- 1 - e$ssru / e$sst; r2r <- 1 - e$ssrr / e$sst
  revisar(e$id, "r2u", a$r2u, r2u, 1e-6); revisar(e$id, "r2r", a$r2r, r2r, 1e-6); revisar(e$id, "gl", a$gl, gl, 0)
  revisar(e$id, "F", a$F, F); revisar(e$id, "F_R2", F, (r2u - r2r) / (1 - r2u) * gl / e$j, 1e-8)
  revisar(e$id, "d5", a$d5, si(F > qf(0.95, e$j, gl))); revisar(e$id, "d1", a$d1, si(F > qf(0.99, e$j, gl)))
  revisar(e$id, "c5", e$c5, qf(0.95, e$j, gl)); revisar(e$id, "c1", e$c1, qf(0.99, e$j, gl))
}
# El F global de lm() coincide con R²/(1 − R²)·(n − k − 1)/k
set.seed(3); X <- matrix(rnorm(400), 100); y <- X %*% c(0.3, 0, 0.2, 0) + rnorm(100); m <- lm(y ~ X); R2 <- summary(m)$r.squared
revisar("global", "formula", summary(m)$fstatistic[[1]], R2 / (1 - R2) * (100 - 4 - 1) / 4, 1e-8)
cat(if (errores == 0) "✓ Banco 2 verificado: todas las respuestas coinciden con R.\n" else paste("✗", errores, "diferencias\n"))
