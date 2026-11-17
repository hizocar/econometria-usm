"""Genera el banco de ejercicios de la Práctica · Segundo bloque (Clases 6 a 9).

    python3 tools/practica_banco2.py        # docs/javascripts/practica-banco2.js y tools/practica-banco2.json
    Rscript tools/practica_verificar2.R     # recalcula cada respuesta en R

Ejercicios para resolver a mano con calculadora: los enunciados entregan los valores críticos
de t y F, y se descartan los casos en que el estadístico queda demasiado cerca del valor crítico.
"""
import json
import math
import random
from pathlib import Path

from scipy import stats

REPO = Path(__file__).resolve().parent.parent
rnd = random.Random(20261117)
ALFAS = [0.01, 0.05, 0.10]


def r4(v):
    return round(float(v), 4)


def fmt(v, d=3):
    s = f"{float(v):.{d}f}"
    return s.rstrip("0").rstrip(".") if "." in s else s


def pct(a):
    return f"{int(round(100 * a))}%"


def tcrit(alfa, gl, colas=2):
    return float(stats.t.ppf(1 - alfa / colas, gl))


def fcrit(alfa, j, gl):
    return float(stats.f.ppf(1 - alfa, j, gl))


# --------------------------------------------------------------------------------------------
# 1) Interpretar logaritmos
# --------------------------------------------------------------------------------------------
LOG_CTX = {
    "ln": [("log(salario)", "años de experiencia", "año"), ("log(rendimiento del trigo)", "riegos por temporada", "riego"),
           ("log(precio de la vivienda)", "dormitorios", "dormitorio"), ("log(arriendo)", "km al centro", "km")],
    "ll": [("log(cantidad demandada de pan)", "log(precio del pan)", ""), ("log(consumo de bencina)", "log(ingreso del hogar)", ""),
           ("log(producción)", "log(trabajadores)", "")],
    "nl": [("puntaje en una prueba", "log(horas de estudio)", ""), ("gasto en salud (miles de $)", "log(ingreso)", "")],
}


def gen_logs(k):
    tipo = ["ln", "ll", "nl"][k % 3]
    y, x, unidad = rnd.choice(LOG_CTX[tipo])
    if tipo == "ln":
        b = rnd.choice([-0.12, -0.08, -0.05, 0.03, 0.04, 0.06, 0.09, 0.15, 0.2])
        dx = rnd.choice([1, 2, 3])
        aprox, exacto = 100 * b * dx, 100 * (math.exp(b * dx) - 1)
        return dict(id=f"L{k + 1}", tipo="logs", sub="ln", y=y, x=x, b=b, dx=dx,
                    preguntas=[dict(k="aprox", lab=f"Cambio aproximado en y (%) si x sube {dx}", ans=r4(aprox), dec=2, pts=3),
                               dict(k="exacto", lab="Cambio exacto en y (%)", ans=r4(exacto), dec=2, pts=4)],
                    solucion=[f"Modelo log-nivel: 100·β̂ es el cambio porcentual aproximado de y por una unidad de x.",
                              f"Aproximado: 100·{b}·{dx} = <b>{fmt(aprox, 2)}%</b>.",
                              f"Exacto: 100·(e^({b}·{dx}) − 1) = <b>{fmt(exacto, 2)}%</b>. La aproximación empeora cuando |β̂·Δx| es grande (Clase 6, lámina 2)."])
    if tipo == "ll":
        b = rnd.choice([-1.4, -0.8, -0.35, -0.2, 0.3, 0.6, 0.85, 1.2])
        dpx = rnd.choice([1, 5, 10, 20])
        efecto = b * dpx
        elastica = "elástica" if abs(b) > 1 else "inelástica"
        return dict(id=f"L{k + 1}", tipo="logs", sub="ll", y=y, x=x, b=b, dpx=dpx,
                    preguntas=[dict(k="ef", lab=f"Cambio aproximado en y (%) si x sube {dpx}%", ans=r4(efecto), dec=2, pts=4),
                               dict(k="elas", lab="¿La relación es elástica o inelástica?", ans=elastica, opciones=["elástica", "inelástica"], pts=3)],
                    solucion=[f"Modelo log-log: β̂ = {b} es una <b>elasticidad</b>.",
                              f"Δ%y ≈ β̂·Δ%x = {b}·{dpx} = <b>{fmt(efecto, 2)}%</b>.",
                              f"|β̂| = {abs(b)} {'>' if abs(b) > 1 else '<'} 1: la relación es <b>{elastica}</b>."])
    b = rnd.choice([2.5, 4, 8, 12, 20, 35])
    dpx = rnd.choice([1, 10, 20, 50])
    efecto = b / 100 * dpx
    return dict(id=f"L{k + 1}", tipo="logs", sub="nl", y=y, x=x, b=b, dpx=dpx,
                preguntas=[dict(k="ef", lab=f"Cambio en y (unidades) si x sube {dpx}%", ans=r4(efecto), dec=3, pts=4)],
                solucion=["Modelo nivel-log: Δy ≈ (β̂/100)·Δ%x (Clase 6, lámina 13).",
                          f"Δy ≈ ({b}/100)·{dpx} = <b>{fmt(efecto, 3)}</b> unidades de y."])


# --------------------------------------------------------------------------------------------
# 2) Formas cuadráticas
# --------------------------------------------------------------------------------------------
CUAD_CTX = [("salario por hora (US$)", "años de experiencia"), ("rendimiento (quintales/ha)", "kilos de fertilizante"),
            ("consumo eléctrico del hogar (kWh)", "temperatura media (°C)"), ("satisfacción (0 a 100)", "horas de trabajo semanales")]


def gen_cuadratica(k):
    y, x = rnd.choice(CUAD_CTX)
    b1 = rnd.choice([0.4, 0.6, 0.8, 1.2, 1.5, 2.4])
    b2 = -rnd.choice([0.01, 0.02, 0.025, 0.03, 0.04, 0.05])
    b0 = rnd.choice([2, 5, 10, 20])
    x0 = rnd.choice([2, 5, 8, 10, 15])
    pend = b1 + 2 * b2 * x0
    xstar = -b1 / (2 * b2)
    yhat = b0 + b1 * x0 + b2 * x0 ** 2
    return dict(id=f"Q{k + 1}", tipo="cuadratica", y=y, x=x, b0=b0, b1=b1, b2=b2, x0=x0,
                preguntas=[dict(k="pend", lab=f"Efecto de una unidad más de x cuando x = {x0}", ans=r4(pend), dec=3, pts=4),
                           dict(k="xstar", lab="Valor de x donde el efecto cambia de signo", ans=r4(xstar), dec=2, pts=4),
                           dict(k="yhat", lab=f"ŷ cuando x = {x0}", ans=r4(yhat), dec=2, pts=2)],
                solucion=[f"Efecto parcial: Δŷ/Δx ≈ β̂₁ + 2β̂₂x = {b1} + 2·({b2})·{x0} = <b>{fmt(pend, 4)}</b>.",
                          f"Se anula en x* = |β̂₁/(2β̂₂)| = {b1}/(2·{abs(b2)}) = <b>{fmt(xstar, 2)}</b> (Clase 6, lámina 6).",
                          f"ŷ = {b0} + {b1}·{x0} + ({b2})·{x0}² = <b>{fmt(yhat, 3)}</b>."])


# --------------------------------------------------------------------------------------------
# 3) Interacciones
# --------------------------------------------------------------------------------------------
INT_CTX = [("precio de la vivienda (millones)", "m² (decenas)", "baños"), ("nota final", "horas de estudio", "asistencia a ayudantía (0/1)"),
           ("arriendo (miles)", "m² (decenas)", "amoblado (0/1)"), ("salario (miles)", "años de educación", "experiencia (años)")]


def gen_interaccion(k):
    y, x, z = rnd.choice(INT_CTX)
    b1 = rnd.choice([1.2, 2, 3.5, 5])
    b2 = rnd.choice([-6, -4, -2, 1.5, 3])
    b3 = rnd.choice([-0.4, -0.2, 0.3, 0.5, 0.8])
    x0 = rnd.choice([2, 4, 6, 10, 12])
    z0 = rnd.choice([0, 1, 2, 3])
    ez = b2 + b3 * x0
    ex = b1 + b3 * z0
    return dict(id=f"N{k + 1}", tipo="interaccion", y=y, x=x, z=z, b1=b1, b2=b2, b3=b3, x0=x0, z0=z0,
                preguntas=[dict(k="ez", lab=f"Efecto de una unidad más de z cuando x = {x0}", ans=r4(ez), dec=2, pts=4),
                           dict(k="ex", lab=f"Efecto de una unidad más de x cuando z = {z0}", ans=r4(ex), dec=2, pts=4)],
                solucion=[f"Con interacción, Δy/Δz = β₂ + β₃·x y Δy/Δx = β₁ + β₃·z (Clase 6, láminas 8 y 9).",
                          f"Efecto de z con x = {x0}: {b2} + ({b3})·{x0} = <b>{fmt(ez, 3)}</b>.",
                          f"Efecto de x con z = {z0}: {b1} + ({b3})·{z0} = <b>{fmt(ex, 3)}</b>."])


# --------------------------------------------------------------------------------------------
# 4) Reescalar variables
# --------------------------------------------------------------------------------------------
def gen_reescala(k):
    for _ in range(200):
        d = _reescala(k)
        if all(0.001 <= abs(q["ans"]) <= 1e6 for q in d["preguntas"][:2]):
            return d
    raise SystemExit("reescala")


def _reescala(k):
    b = rnd.choice([0.0045, 0.012, 0.35, 2.4, 18.5, 120.0])
    se = round(b / rnd.choice([1.6, 2.5, 3.2, 4.1, 5.5]), 5)
    R2 = rnd.choice([0.18, 0.27, 0.41, 0.56])
    var = rnd.choice(["y", "x"])
    c = rnd.choice([1000, 100, 0.001, 12])
    if var == "y":
        nb, nse, txt = b * c, se * c, f"la variable dependiente se multiplica por {fmt(c, 3)}"
    else:
        nb, nse, txt = b / c, se / c, f"la variable explicativa se multiplica por {fmt(c, 3)}"
    t = b / se
    return dict(id=f"E{k + 1}", tipo="reescala", b=b, se=se, R2=R2, var=var, c=c, txt=txt,
                preguntas=[dict(k="nb", lab="Nuevo β̂", ans=nb, dec=4 if abs(nb) < 1 else 2, pts=3),
                           dict(k="nse", lab="Nuevo error estándar", ans=nse, dec=4 if abs(nse) < 1 else 2, pts=3),
                           dict(k="nt", lab="Nuevo estadístico t", ans=r4(t), dec=2, pts=3),
                           dict(k="nR2", lab="Nuevo R²", ans=R2, dec=2, pts=2)],
                solucion=[("Si y se multiplica por c, β̂ y su error estándar se multiplican por c." if var == "y" else
                           "Si x se multiplica por c, β̂ y su error estándar se dividen por c."),
                          f"Nuevo β̂ = <b>{fmt(nb, 6)}</b>; nuevo se = <b>{fmt(nse, 6)}</b>.",
                          f"El t no cambia: {fmt(b, 6)}/{fmt(se, 6)} = <b>{fmt(t, 3)}</b>; tampoco el R² = <b>{R2}</b> (Clase 6, láminas 10 a 12)."])


# --------------------------------------------------------------------------------------------
# 5) Test t e intervalo
# --------------------------------------------------------------------------------------------
TT_CTX = ["retorno a la educación", "efecto del tamaño del curso", "efecto de la experiencia", "elasticidad precio",
          "efecto de una hora de estudio", "efecto de la distancia al centro"]


def gen_ttest(k):
    for _ in range(500):
        gl = rnd.choice([20, 30, 45, 60, 120, 500])
        alfa = rnd.choice(ALFAS)
        colas = rnd.choice([2, 2, 1])
        a0 = rnd.choice([0, 0, 0, 1, 0.5])
        b = round(rnd.uniform(-1.5, 2.5), 3)
        se = round(rnd.uniform(0.08, 0.6), 3)
        t = (b - a0) / se
        crit = tcrit(alfa, gl, colas)
        if colas == 1:
            rech = t > crit
        else:
            rech = abs(t) > crit
        margen = (t - crit) if colas == 1 else (abs(t) - crit)
        if abs(margen) < 0.3 or abs(t) > 12:
            continue
        lo, hi = b - tcrit(alfa, gl, 2) * se, b + tcrit(alfa, gl, 2) * se
        preg = [dict(k="t", lab="Estadístico t", ans=r4(t), dec=2, pts=3),
                dict(k="dec", lab=f"¿Se rechaza H₀ al {pct(alfa)}?", ans="sí" if rech else "no", opciones=["sí", "no"], pts=3)]
        if colas == 2:
            preg += [dict(k="lo", lab=f"Límite inferior del IC de {pct(1 - alfa)}", ans=r4(lo), dec=2, pts=2),
                     dict(k="hi", lab=f"Límite superior del IC de {pct(1 - alfa)}", ans=r4(hi), dec=2, pts=2)]
        h1 = "≠" if colas == 2 else ">"
        return dict(id=f"T{k + 1}", tipo="ttest", ctx=rnd.choice(TT_CTX), b=b, se=se, gl=gl, alfa=alfa, colas=colas, a0=a0,
                    crit=r4(crit), crit2=r4(tcrit(alfa, gl, 2)), preguntas=preg,
                    solucion=[f"H₀: β = {a0} contra H₁: β {h1} {a0}.",
                              f"t = (β̂ − {a0})/se = ({b} − {a0})/{se} = <b>{fmt(t, 3)}</b>.",
                              f"Valor crítico ({'dos colas' if colas == 2 else 'una cola'}, {pct(alfa)}, {gl} gl) = {fmt(crit, 3)}.",
                              (f"{'|t|' if colas == 2 else 't'} = {fmt(abs(t) if colas == 2 else t, 3)} {'>' if rech else '≤'} {fmt(crit, 3)}: "
                               f"<b>{'se rechaza' if rech else 'no se rechaza'} H₀</b>.")]
                    + ([f"IC de {pct(1 - alfa)}: {b} ± {fmt(tcrit(alfa, gl, 2), 3)}·{se} = <b>({fmt(lo, 3)}; {fmt(hi, 3)})</b>. "
                        f"{'No contiene' if not (lo <= a0 <= hi) else 'Contiene'} a {a0}, coherente con la decisión."] if colas == 2 else []))
    raise SystemExit("ttest")


# --------------------------------------------------------------------------------------------
# 6) Decidir con valores-p
# --------------------------------------------------------------------------------------------
VARS = ["educ", "exper", "tenure", "mujer", "casado", "edad", "ingreso", "urbano"]


def gen_pvalor(k):
    vs = rnd.sample(VARS, 3)
    ps = [rnd.choice([0.0004, 0.003, 0.008, 0.021, 0.034, 0.047, 0.062, 0.088, 0.13, 0.41]) for _ in vs]
    alfa = rnd.choice(ALFAS)
    i = rnd.randrange(3)
    coef_pos = rnd.random() < 0.5
    p1 = ps[i] / 2 if coef_pos else 1 - ps[i] / 2
    preg = [dict(k=f"s{j}", lab=f"¿{v} es significativa al {pct(alfa)}? (valor-p = {p})", ans="sí" if p < alfa else "no",
                 opciones=["sí", "no"], pts=2) for j, (v, p) in enumerate(zip(vs, ps))]
    preg.append(dict(k="p1", lab=f"Valor-p de una cola para H₁: β_{vs[i]} > 0", ans=r4(p1), dec=4, pts=4))
    return dict(id=f"P{k + 1}", tipo="pvalor", vs=vs, ps=ps, alfa=alfa, i=i, signo="positivo" if coef_pos else "negativo",
                preguntas=preg,
                solucion=[f"Se rechaza H₀: βⱼ = 0 al {pct(alfa)} si el valor-p es menor que {alfa}."]
                + [f"{v}: {p} {'<' if p < alfa else '≥'} {alfa} ⇒ <b>{'significativa' if p < alfa else 'no significativa'}</b>." for v, p in zip(vs, ps)]
                + [(f"Una cola: como el coeficiente de {vs[i]} es {'positivo' if coef_pos else 'negativo'}, el valor-p de H₁: β > 0 es "
                    + (f"la mitad del de dos colas: {ps[i]}/2 = <b>{fmt(p1, 4)}</b>." if coef_pos else
                       f"1 − {ps[i]}/2 = <b>{fmt(p1, 4)}</b>: un coeficiente negativo no es evidencia de β > 0 (Clase 7, lámina 18)."))])


# --------------------------------------------------------------------------------------------
# 7) Combinaciones lineales de parámetros
# --------------------------------------------------------------------------------------------
def gen_combinacion(k):
    for _ in range(500):
        b1, b2 = round(rnd.uniform(0.5, 6), 2), round(rnd.uniform(0.2, 4), 2)
        v1, v2 = round(rnd.uniform(0.1, 1.5), 3), round(rnd.uniform(0.05, 1), 3)
        cov = round(rnd.uniform(-0.6, 0.6) * math.sqrt(v1 * v2), 3)
        c = rnd.choice([1, 2, 3])
        gl = rnd.choice([40, 80, 137, 300])
        alfa = 0.05
        var = v1 + c * c * v2 - 2 * c * cov
        if var <= 0:
            continue
        se = math.sqrt(var)
        t = (b1 - c * b2) / se
        crit = tcrit(alfa, gl)
        if abs(abs(t) - crit) < 0.3 or abs(t) > 10:
            continue
        rech = abs(t) > crit
        hip = "β₁ = β₂" if c == 1 else f"β₁ = {c}β₂"
        return dict(id=f"K{k + 1}", tipo="combinacion", b1=b1, b2=b2, v1=v1, v2=v2, cov=cov, c=c, gl=gl, crit=r4(crit), hip=hip,
                    preguntas=[dict(k="var", lab=f"Var(β̂₁ − {c if c > 1 else ''}β̂₂)".replace("−  ", "− "), ans=r4(var), dec=3, pts=4),
                               dict(k="t", lab="Estadístico t", ans=r4(t), dec=2, pts=3),
                               dict(k="dec", lab="¿Se rechaza H₀ al 5%?", ans="sí" if rech else "no", opciones=["sí", "no"], pts=3)],
                    solucion=[f"H₀: {hip} ⇔ β₁ − {c}β₂ = 0.",
                              f"Var(β̂₁ − {c}β̂₂) = Var(β̂₁) + {c * c}·Var(β̂₂) − {2 * c}·Cov = {v1} + {c * c}·{v2} − {2 * c}·({cov}) = <b>{fmt(var, 4)}</b>.",
                              f"t = ({b1} − {c}·{b2})/√{fmt(var, 4)} = {fmt(b1 - c * b2, 3)}/{fmt(se, 4)} = <b>{fmt(t, 3)}</b>.",
                              f"|t| {'>' if rech else '≤'} {fmt(crit, 3)} (t con {gl} gl al 5%): <b>{'se rechaza' if rech else 'no se rechaza'} H₀</b> (Clase 8)."])
    raise SystemExit("combinacion")


# --------------------------------------------------------------------------------------------
# 8) Test F con SSR o con R²
# --------------------------------------------------------------------------------------------
def gen_ftest(k):
    for _ in range(800):
        n = rnd.choice([60, 90, 120, 200, 353, 500])
        kk = rnd.choice([3, 4, 5, 6])
        j = rnd.randint(2, kk - 1)
        gl = n - kk - 1
        forma = "ssr" if k % 2 == 0 else "r2"
        if forma == "ssr":
            ssru = round(rnd.uniform(80, 400), 1)
            ssrr = round(ssru * (1 + rnd.uniform(0.005, 0.12)), 1)
            F = (ssrr - ssru) / ssru * gl / j
        else:
            r2u = round(rnd.uniform(0.2, 0.7), 3)
            r2r = round(r2u - rnd.uniform(0.003, 0.06), 3)
            F = (r2u - r2r) / (1 - r2u) * gl / j
        crit = fcrit(0.05, j, gl)
        if abs(F - crit) < 0.4 or F > 60:
            continue
        rech = F > crit
        d = dict(id=f"F{k + 1}", tipo="ftest", forma=forma, n=n, kk=kk, j=j, crit=r4(crit),
                 preguntas=[dict(k="gl", lab="Grados de libertad del denominador (n − k − 1)", ans=gl, dec=0, pts=2, exacto=True),
                            dict(k="F", lab="Estadístico F", ans=r4(F), dec=2, pts=4),
                            dict(k="dec", lab="¿Se rechaza H₀ al 5%?", ans="sí" if rech else "no", opciones=["sí", "no"], pts=3)])
        if forma == "ssr":
            d.update(ssrr=ssrr, ssru=ssru)
            paso = f"F = [({ssrr} − {ssru})/{ssru}]·({gl}/{j}) = <b>{fmt(F, 3)}</b>."
        else:
            d.update(r2r=r2r, r2u=r2u)
            paso = f"F = [({r2u} − {r2r})/(1 − {r2u})]·({gl}/{j}) = <b>{fmt(F, 3)}</b>."
        d["solucion"] = [f"n − k − 1 = {n} − {kk} − 1 = <b>{gl}</b>; se testean j = {j} restricciones.", paso,
                         f"F {'>' if rech else '≤'} {fmt(crit, 3)} = F({j}, {gl}) al 5%: <b>{'se rechaza' if rech else 'no se rechaza'} H₀</b> (Clase 9)."]
        return d
    raise SystemExit("ftest")


# --------------------------------------------------------------------------------------------
# 9) Significancia global
# --------------------------------------------------------------------------------------------
def gen_fglobal(k):
    for _ in range(800):
        n = rnd.choice([25, 40, 60, 100, 250])
        kk = rnd.choice([2, 3, 4, 5, 8])
        gl = n - kk - 1
        r2 = round(rnd.uniform(0.04, 0.45), 3)
        F = r2 / (1 - r2) * gl / kk
        crit = fcrit(0.05, kk, gl)
        if abs(F - crit) < 0.4:
            continue
        rech = F > crit
        return dict(id=f"G{k + 1}", tipo="fglobal", n=n, kk=kk, r2=r2, crit=r4(crit),
                    preguntas=[dict(k="F", lab="F de significancia global", ans=r4(F), dec=2, pts=4),
                               dict(k="dec", lab="¿El modelo es globalmente significativo al 5%?", ans="sí" if rech else "no", opciones=["sí", "no"], pts=3)],
                    solucion=[f"F = [R²/(1 − R²)]·[(n − k − 1)/k] = [{r2}/{fmt(1 - r2, 3)}]·({gl}/{kk}) = <b>{fmt(F, 3)}</b> (Clase 9, lámina 20).",
                              f"F {'>' if rech else '≤'} {fmt(crit, 3)} = F({kk}, {gl}) al 5%: <b>{'sí' if rech else 'no'}</b>."
                              + ("" if rech else " Un R² bajo con pocos datos puede no bastar para rechazar.")])
    raise SystemExit("fglobal")


# --------------------------------------------------------------------------------------------
# 10) Errores tipo I y II
# --------------------------------------------------------------------------------------------
def gen_errores(k):
    tipo = k % 3
    if tipo == 0:
        m = rnd.choice([200, 500, 1000, 2000])
        alfa = rnd.choice(ALFAS)
        return dict(id=f"R{k + 1}", tipo="errores", sub="tipo1", m=m, alfa=alfa,
                    preguntas=[dict(k="n", lab="Rechazos esperados", ans=m * alfa, dec=0, pts=4)],
                    solucion=[f"Si H₀ es verdadera, cada test rechaza con probabilidad α = {alfa}: es la probabilidad de error tipo I.",
                              f"Rechazos esperados = {m}·{alfa} = <b>{fmt(m * alfa, 1)}</b> (todos son errores tipo I)."])
    if tipo == 1:
        beta = rnd.choice([0.1, 0.2, 0.35, 0.5])
        return dict(id=f"R{k + 1}", tipo="errores", sub="poder", beta=beta,
                    preguntas=[dict(k="p", lab="Poder del test", ans=r4(1 - beta), dec=2, pts=3),
                               dict(k="n", lab="Más datos: ¿el poder sube o baja?", ans="sube", opciones=["sube", "baja"], pts=2)],
                    solucion=[f"Poder = 1 − P(error tipo II) = 1 − {beta} = <b>{fmt(1 - beta, 2)}</b>.",
                              "Con más observaciones el error tipo II baja y el poder <b>sube</b> (Clase 7, lámina 9)."])
    a1, a2 = rnd.sample(ALFAS, 2)
    mayor = "α = " + str(max(a1, a2))
    return dict(id=f"R{k + 1}", tipo="errores", sub="compara", a1=a1, a2=a2,
                preguntas=[dict(k="m", lab="¿Con qué α es mayor la probabilidad de error tipo I?", ans=mayor,
                                opciones=[f"α = {min(a1, a2)}", f"α = {max(a1, a2)}"], pts=3),
                           dict(k="b", lab="Con n fijo, ¿con qué α es mayor la probabilidad de error tipo II?", ans=f"α = {min(a1, a2)}",
                                opciones=[f"α = {min(a1, a2)}", f"α = {max(a1, a2)}"], pts=3)],
                solucion=["α es justamente la probabilidad de error tipo I: más α, más errores tipo I.",
                          "Con n fijo hay un trade-off: un α más chico hace más difícil rechazar, así que aumenta el error tipo II."])


def main():
    banco = dict(
        logs=[gen_logs(k) for k in range(18)],
        cuadratica=[gen_cuadratica(k) for k in range(16)],
        interaccion=[gen_interaccion(k) for k in range(16)],
        reescala=[gen_reescala(k) for k in range(16)],
        ttest=[gen_ttest(k) for k in range(20)],
        pvalor=[gen_pvalor(k) for k in range(16)],
        combinacion=[gen_combinacion(k) for k in range(16)],
        ftest=[gen_ftest(k) for k in range(20)],
        fglobal=[gen_fglobal(k) for k in range(16)],
        errores=[gen_errores(k) for k in range(15)],
    )
    js = ("/* ARCHIVO GENERADO por tools/practica_banco2.py (verificado con tools/practica_verificar2.R). No editar a mano. */\n"
          "window.PRACTICA_BANCO2 = " + json.dumps(banco, ensure_ascii=False) + ";\n")
    (REPO / "docs" / "javascripts" / "practica-banco2.js").write_text(js, encoding="utf-8")
    (REPO / "tools" / "practica-banco2.json").write_text(json.dumps(banco, ensure_ascii=False, indent=1), encoding="utf-8")
    print({k: len(v) for k, v in banco.items()})


if __name__ == "__main__":
    main()
