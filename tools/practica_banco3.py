"""Genera el banco de ejercicios de la Práctica · Tercer bloque (Clases 10 a 12).

    python3 tools/practica_banco3.py        # docs/javascripts/practica-banco3.js y tools/practica-banco3.json
    Rscript tools/practica_verificar3.R     # recalcula cada respuesta en R

Igual que en el segundo bloque: se resuelven a mano con calculadora, los enunciados entregan los
valores críticos y se descartan los casos en que el estadístico queda demasiado cerca del crítico.
Los tipos "caso_*" son problemas de desarrollo: varias partes encadenadas, dificultad media-alta.
"""
import json
import math
import random
from pathlib import Path

from scipy import stats

REPO = Path(__file__).resolve().parent.parent
rnd = random.Random(20261124)


def r4(v):
    return round(float(v), 4)


def fmt(v, d=3):
    s = f"{float(v):.{d}f}"
    return s.rstrip("0").rstrip(".") if "." in s else s


def pct(a):
    return f"{int(round(100 * a))}%"


def fcrit(alfa, j, gl):
    return float(stats.f.ppf(1 - alfa, j, gl))


def chicrit(alfa, gl):
    return float(stats.chi2.ppf(1 - alfa, gl))


def zcrit(alfa):
    return float(stats.norm.ppf(1 - alfa / 2))


def si(x):
    return "sí" if x else "no"


def num(k, lab, ans, dec=2, pts=3, **kw):
    return dict(k=k, lab=lab, ans=ans if kw.get("exacto") else round(float(ans), max(4, dec + 3)), dec=dec, pts=pts, **kw)


def sel(k, lab, ans, opciones, pts=3):
    return dict(k=k, lab=lab, ans=ans, opciones=opciones, pts=pts)


# --------------------------------------------------------------------------------------------
# 1) Variable omitida y consistencia (Clase 10)
# --------------------------------------------------------------------------------------------
OVB_CTX = [("salario por hora", "años de educación", "habilidad"), ("rendimiento por hectárea", "kilos de fertilizante", "calidad del suelo"),
           ("nota final", "horas de estudio", "motivación"), ("precio de la vivienda", "superficie (m²)", "calidad del barrio"),
           ("presión arterial", "consumo de sal (g/día)", "edad")]


def gen_ovb(k):
    while True:
        b1 = round(rnd.uniform(-1, 2), 2)
        b2 = round(rnd.choice([-1, 1]) * rnd.uniform(0.3, 2.5), 2)
        v1 = round(rnd.uniform(1, 9), 1)
        c12 = round(rnd.choice([-1, 1]) * rnd.uniform(0.4, 3.5), 2)
        d1 = c12 / v1
        sesgo = b2 * d1
        if abs(sesgo) >= 0.05 and abs(b1) >= 0.1:
            break
    y, x1, x2 = OVB_CTX[k % len(OVB_CTX)]
    dirr = "sobreestima" if sesgo > 0 else "subestima"
    return dict(id=f"O{k + 1}", tipo="ovb_asint", y=y, x1=x1, x2=x2, b1=b1, b2=b2, v1=v1, c12=c12,
                preguntas=[num("d1", "δ₁ = Cov(x₁, x₂)/Var(x₁)", d1, 3), num("plim", "plim β̃₁ (regresión sin x₂)", b1 + sesgo, 3),
                           num("sesgo", "Sesgo asintótico (inconsistencia)", sesgo, 3),
                           sel("dir", "Con n muy grande, β̃₁…", dirr, ["sobreestima", "subestima"], 2),
                           sel("n", "¿El sesgo desaparece si n → ∞?", "no", ["sí", "no"], 2)],
                solucion=[f"δ₁ = Cov(x₁, x₂)/Var(x₁) = {c12}/{v1} = <b>{fmt(d1, 4)}</b>.",
                          f"plim β̃₁ = β₁ + β₂·δ₁ = {b1} + ({b2})·({fmt(d1, 4)}) = <b>{fmt(b1 + sesgo, 4)}</b>.",
                          f"Inconsistencia = β₂·δ₁ = <b>{fmt(sesgo, 4)}</b>: β₂ y Cov(x₁, x₂) tienen {'el mismo signo' if sesgo > 0 else 'signos opuestos'}, así que β̃₁ <b>{dirr}</b> a β₁.",
                          "Es un sesgo <b>asintótico</b>: no desaparece con más datos, porque falla el supuesto de exogeneidad (Clase 10, lámina 4)."])


# --------------------------------------------------------------------------------------------
# 2) Muestras grandes: errores estándar y normalidad asintótica (Clase 10)
# --------------------------------------------------------------------------------------------
def gen_asint(k):
    while True:
        n0 = rnd.choice([100, 150, 200, 250, 400])
        c = rnd.choice([4, 9, 16, 2.25, 6.25])
        n1 = int(n0 * c)
        alfa = rnd.choice([0.05, 0.05, 0.10, 0.01])
        z = zcrit(alfa)
        b = round(rnd.uniform(0.05, 1.2), 3)
        se0 = round(b / rnd.uniform(0.8, 1.6), 3)
        se1 = se0 * math.sqrt(n0 / n1)
        t1 = b / se1
        m = rnd.choice([2, 3, 4])
        if abs(t1 - z) >= 0.3 and b / se0 < z:
            break
    return dict(id=f"A{k + 1}", tipo="asint", n0=n0, n1=n1, b=b, se0=se0, alfa=alfa, z=r4(z), m=m,
                preguntas=[num("se1", f"se(β̂) aproximado con n = {n1}", se1, 3), num("t1", "Nuevo estadístico t", t1, 2),
                           sel("dec", f"¿Se rechaza H₀: β = 0 al {pct(alfa)}?", si(t1 > z), ["sí", "no"], 3),
                           num("nreq", f"n necesario para que se(β̂) sea {m} veces menor que con n = {n0}", n0 * m * m, 0, 3, exacto=True)],
                solucion=[f"El error estándar decrece como 1/√n: se₁ ≈ se₀·√(n₀/n₁) = {se0}·√({n0}/{n1}) = <b>{fmt(se1, 4)}</b> (Clase 10, láminas 8 y 10).",
                          f"t = {b}/{fmt(se1, 4)} = <b>{fmt(t1, 3)}</b>. Con n grande el t es aproximadamente normal: se compara con z = {fmt(z, 3)}.",
                          f"{fmt(t1, 3)} {'>' if t1 > z else '≤'} {fmt(z, 3)}: <b>{'se rechaza' if t1 > z else 'no se rechaza'} H₀</b> (con n = {n0} el t era {fmt(b / se0, 3)}).",
                          f"Dividir el se por {m} exige multiplicar n por {m}² = {m * m}: n = {n0}·{m * m} = <b>{n0 * m * m}</b>."])


# --------------------------------------------------------------------------------------------
# 3) Variables binarias con varias categorías (Clase 11)
# --------------------------------------------------------------------------------------------
DUM_CTX = [dict(y="salario (miles de $)", ly="log(salario)", x="educ", cats=["Norte", "Centro", "Sur", "Austral"], cat="zona"),
           dict(y="precio del arriendo (miles de $)", ly="log(arriendo)", x="m²", cats=["Casa", "Depto", "Pieza", "Loft"], cat="tipo de vivienda"),
           dict(y="gasto mensual en salud (miles de $)", ly="log(gasto en salud)", x="edad", cats=["Fonasa A", "Fonasa B", "Fonasa C", "Isapre"], cat="previsión")]


def gen_dummies(k):
    c = DUM_CTX[k % len(DUM_CTX)]
    base, c1, c2, c3 = c["cats"]
    log = k % 2 == 1
    if log:
        d = [round(rnd.uniform(-0.45, 0.6), 3) for _ in range(3)]
        bx = round(rnd.uniform(0.01, 0.09), 3)
        b0 = round(rnd.uniform(5, 7), 2)
        pc1 = 100 * (math.exp(d[0]) - 1)
        p23 = 100 * (math.exp(d[1] - d[2]) - 1)
        preg = [num("p1", f"Diferencia % exacta entre {c1} y {base} (mismo {c['x']})", pc1, 2),
                num("p23", f"Diferencia % exacta entre {c2} y {c3}", p23, 2),
                num("nb", f"Si la base pasa a ser {c1}: coeficiente de la dummy {base}", -d[0], 3),
                num("n3", f"…y coeficiente de la dummy {c3}", d[2] - d[0], 3)]
        sol = [f"Con y en logaritmo, la diferencia exacta es 100·(e^δ − 1): 100·(e^{d[0]} − 1) = <b>{fmt(pc1, 3)}%</b>.",
               f"Entre {c2} y {c3}: δ₂ − δ₃ = {fmt(d[1] - d[2], 3)}, y 100·(e^{fmt(d[1] - d[2], 3)} − 1) = <b>{fmt(p23, 3)}%</b>.",
               f"Cambiar la base no cambia el modelo, solo la lectura: la dummy {base} medida contra {c1} vale −δ₁ = <b>{fmt(-d[0], 3)}</b>.",
               f"Y la de {c3} contra {c1}: δ₃ − δ₁ = {d[2]} − ({d[0]}) = <b>{fmt(d[2] - d[0], 3)}</b> (Clase 11, láminas 7 a 9)."]
        x0 = None
    else:
        d = [round(rnd.uniform(-120, 200)) for _ in range(3)]
        bx = round(rnd.uniform(5, 60), 1)
        b0 = round(rnd.uniform(150, 600))
        x0 = rnd.choice([8, 10, 12, 14, 16]) if c["x"] != "m²" else rnd.choice([35, 50, 70])
        if c["x"] == "edad":
            x0 = rnd.choice([30, 45, 60])
        preg = [num("d23", f"Diferencia predicha entre {c2} y {c3} (mismo {c['x']})", d[1] - d[2], 1),
                num("yb", f"Valor predicho para {base} con {c['x']} = {x0}", b0 + bx * x0, 1),
                num("nb", f"Si la base pasa a ser {c1}: coeficiente de la dummy {base}", -d[0], 1),
                num("n3", f"…y coeficiente de la dummy {c3}", d[2] - d[0], 1)]
        sol = [f"Con el mismo {c['x']}, la diferencia entre {c2} y {c3} es δ₂ − δ₃ = {d[1]} − ({d[2]}) = <b>{d[1] - d[2]}</b>.",
               f"Para la categoría base todas las dummies valen 0: ŷ = {b0} + {bx}·{x0} = <b>{fmt(b0 + bx * x0, 2)}</b>.",
               f"Cambiar la base solo cambia la lectura: la dummy {base} medida contra {c1} vale −δ₁ = <b>{-d[0]}</b>.",
               f"Y la de {c3} contra {c1}: δ₃ − δ₁ = <b>{d[2] - d[0]}</b> (Clase 11, láminas 6 a 9)."]
    return dict(id=f"B{k + 1}", tipo="dummies", log=log, y=c["ly"] if log else c["y"], x=c["x"], cat=c["cat"], cats=c["cats"],
                b0=b0, bx=bx, d=d, x0=x0, preguntas=preg, solucion=sol)


# --------------------------------------------------------------------------------------------
# 4) Interacción dummy × variable continua (Clase 11)
# --------------------------------------------------------------------------------------------
def gen_dumint(k):
    while True:
        b1 = round(rnd.uniform(0.04, 0.11), 3)
        d1 = round(rnd.uniform(-0.03, 0.03), 3)
        d0 = round(rnd.uniform(-0.45, 0.25), 3)
        if abs(d1) < 0.004 or d0 * d1 >= 0:
            continue
        xs = -d0 / d1
        if 4 <= xs <= 30:
            break
    e = rnd.choice([8, 12, 16])
    return dict(id=f"I{k + 1}", tipo="dumint", b0=round(rnd.uniform(0.3, 1.2), 3), d0=d0, b1=b1, d1=d1, e=e,
                preguntas=[num("rh", "Retorno de un año de educ para hombres (%)", 100 * b1, 2),
                           num("rm", "Retorno de un año de educ para mujeres (%)", 100 * (b1 + d1), 2),
                           num("br", f"Brecha aproximada mujer − hombre con educ = {e} (%)", 100 * (d0 + d1 * e), 2),
                           num("xs", "Años de educ en que la brecha se anula", xs, 1)],
                solucion=[f"Hombres (mujer = 0): ∂log(salario)/∂educ = β₁ = {b1} → <b>{fmt(100 * b1, 2)}%</b> por año.",
                          f"Mujeres: β₁ + δ₁ = {b1} + ({d1}) = {fmt(b1 + d1, 3)} → <b>{fmt(100 * (b1 + d1), 2)}%</b> por año (Clase 11, láminas 12 y 13).",
                          f"La brecha depende de educ: δ₀ + δ₁·educ = {d0} + ({d1})·{e} = {fmt(d0 + d1 * e, 4)} → <b>{fmt(100 * (d0 + d1 * e), 2)}%</b>.",
                          f"Se anula cuando δ₀ + δ₁·educ = 0: educ = −δ₀/δ₁ = <b>{fmt(xs, 2)}</b> años."])


# --------------------------------------------------------------------------------------------
# 5) Test de Chow (Clase 11)
# --------------------------------------------------------------------------------------------
GRUPOS = [("mujeres", "hombres"), ("colegios públicos", "colegios particulares"), ("zona urbana", "zona rural"), ("antes de la reforma", "después de la reforma")]


def gen_chow(k):
    while True:
        n1, n2 = rnd.randint(40, 300), rnd.randint(40, 300)
        kk = rnd.choice([1, 2, 3, 4])
        n = n1 + n2
        s1, s2 = round(rnd.uniform(10, 120), 1), round(rnd.uniform(10, 120), 1)
        sur = round(s1 + s2, 1)
        sp = round(sur * (1 + rnd.uniform(0.002, 0.07)), 1)
        q, gl = kk + 1, n - 2 * (kk + 1)
        F = (sp - sur) / q / (sur / gl)
        crit = fcrit(0.05, q, gl)
        if abs(F - crit) >= 0.35:
            break
    g1, g2 = GRUPOS[k % len(GRUPOS)]
    return dict(id=f"C{k + 1}", tipo="chow", g1=g1, g2=g2, n1=n1, n2=n2, kk=kk, s1=s1, s2=s2, sp=sp, crit=r4(crit),
                preguntas=[num("sur", "SSR del modelo no restringido", sur, 1), num("q", "Grados de libertad del numerador", q, 0, 2, exacto=True),
                           num("gl", "Grados de libertad del denominador", gl, 0, 2, exacto=True), num("F", "Estadístico F de Chow", F, 2, 4),
                           sel("dec", "¿Se rechaza que los grupos tengan el mismo modelo (5%)?", si(F > crit), ["sí", "no"], 3)],
                solucion=[f"SSR_ur = SSR₁ + SSR₂ = {s1} + {s2} = <b>{fmt(sur, 1)}</b>.",
                          f"Con G = 2 grupos y k = {kk}: numerador (G − 1)(k + 1) = <b>{q}</b>; denominador n − G(k + 1) = {n} − 2·{kk + 1} = <b>{gl}</b>.",
                          f"F = [({sp} − {fmt(sur, 1)})/{q}] / [{fmt(sur, 1)}/{gl}] = <b>{fmt(F, 3)}</b> (Clase 11, Parte 2, lámina 2).",
                          f"F {'>' if F > crit else '≤'} {fmt(crit, 3)} = F({q}, {gl}) al 5%: <b>{'se rechaza' if F > crit else 'no se rechaza'}</b> H₀"
                          + (": el modelo difiere entre grupos." if F > crit else ": no hay evidencia de que el modelo difiera.")])


# --------------------------------------------------------------------------------------------
# 6) Modelo de probabilidad lineal (Clase 11)
# --------------------------------------------------------------------------------------------
MPL_CTX = [("aprobar el ramo", "horas de estudio semanales", "inasistencias"), ("trabajar remunerado", "años de educación", "hijos menores de 6"),
           ("usar transporte público", "distancia al trabajo (km)", "autos en el hogar"), ("vacunarse", "edad (decenas de años)", "distancia al consultorio (km)")]


def gen_mpl(k):
    y, x1, x2 = MPL_CTX[k % len(MPL_CTX)]
    while True:
        b0 = round(rnd.uniform(-0.2, 0.5), 2)
        b1 = round(rnd.uniform(0.02, 0.09), 3)
        b2 = round(-rnd.uniform(0.03, 0.15), 3)
        a = (rnd.randint(2, 12), rnd.randint(0, 3))
        bb = (rnd.randint(8, 20), rnd.randint(0, 4))
        pa, pb = b0 + b1 * a[0] + b2 * a[1], b0 + b1 * bb[0] + b2 * bb[1]
        dx = rnd.choice([2, 3, 5])
        fuera = not (0 <= pa <= 1 and 0 <= pb <= 1)
        if min(abs(pa), abs(pa - 1), abs(pb), abs(pb - 1)) > 0.02 and (fuera or k % 3 != 0):
            break
    return dict(id=f"P{k + 1}", tipo="mpl", y=y, x1=x1, x2=x2, b0=b0, b1=b1, b2=b2, a=a, bb=bb, dx=dx,
                preguntas=[num("pa", "Probabilidad predicha, persona A", pa, 3), num("pb", "Probabilidad predicha, persona B", pb, 3),
                           num("dp", f"Cambio en la probabilidad si {x1} sube en {dx}", b1 * dx, 3),
                           sel("fuera", "¿Alguna predicción cae fuera de [0, 1]?", si(fuera), ["sí", "no"], 3)],
                solucion=[f"A: {b0} + {b1}·{a[0]} + ({b2})·{a[1]} = <b>{fmt(pa, 4)}</b>.",
                          f"B: {b0} + {b1}·{bb[0]} + ({b2})·{bb[1]} = <b>{fmt(pb, 4)}</b>.",
                          f"En el MPL el efecto es constante: Δp = β₁·Δx = {b1}·{dx} = <b>{fmt(b1 * dx, 4)}</b> ({fmt(100 * b1 * dx, 2)} puntos porcentuales).",
                          ("Sí: una probabilidad predicha queda fuera de [0, 1], uno de los dos problemas del MPL (Clase 11, Parte 2, lámina 7)." if fuera
                           else "No: ambas están en [0, 1], pero el MPL no lo garantiza (Clase 11, Parte 2, lámina 7).")])


# --------------------------------------------------------------------------------------------
# 7) Breusch-Pagan y White (Clase 12)
# --------------------------------------------------------------------------------------------
def gen_bp(k):
    while True:
        n = rnd.choice([80, 120, 200, 300, 500, 800])
        kk = rnd.choice([2, 3, 4, 5])
        r2 = round(rnd.uniform(0.003, 0.08), 4)
        LM = n * r2
        F = (r2 / kk) / ((1 - r2) / (n - kk - 1))
        cl, cf = chicrit(0.05, kk), fcrit(0.05, kk, n - kk - 1)
        if abs(LM - cl) >= 0.8 and abs(F - cf) >= 0.2 and (LM > cl) == (F > cf):
            break
    q = kk + kk * (kk + 1) // 2
    return dict(id=f"H{k + 1}", tipo="bp", n=n, kk=kk, r2=r2, cl=r4(cl), cf=r4(cf),
                preguntas=[num("LM", "Estadístico LM", LM, 2, 4), sel("dl", "¿Se rechaza homocedasticidad con LM (5%)?", si(LM > cl), ["sí", "no"], 2),
                           num("F", "Estadístico F", F, 2, 4), sel("df", "¿Se rechaza con F (5%)?", si(F > cf), ["sí", "no"], 2),
                           num("q", f"Restricciones del test de White completo con k = {kk}", q, 0, 3, exacto=True)],
                solucion=[f"LM = n·R²_aux = {n}·{r2} = <b>{fmt(LM, 3)}</b>, que se compara con χ²({kk}) = {fmt(cl, 3)} (Clase 12, lámina 9).",
                          f"{'Se rechaza' if LM > cl else 'No se rechaza'} H₀ de homocedasticidad.",
                          f"F = (R²/k)/[(1 − R²)/(n − k − 1)] = ({r2}/{kk})/[{fmt(1 - r2, 4)}/{n - kk - 1}] = <b>{fmt(F, 3)}</b>, contra F({kk}, {n - kk - 1}) = {fmt(cf, 3)}: misma conclusión.",
                          f"White agrega cuadrados y productos cruzados: q = k + k(k + 1)/2 = {kk} + {kk * (kk + 1) // 2} = <b>{q}</b>. La versión simplificada (ŷ, ŷ²) usa solo 2 (láminas 12 y 13)."])


# --------------------------------------------------------------------------------------------
# 8) Errores estándar robustos (Clase 12)
# --------------------------------------------------------------------------------------------
def gen_robust(k):
    while True:
        b = round(rnd.choice([-1, 1]) * rnd.uniform(0.1, 2), 3)
        se = round(abs(b) / rnd.uniform(1.4, 3.5), 3)
        ser = round(se * rnd.uniform(0.7, 1.9), 3)
        t, tr = b / se, b / ser
        z = 1.96
        if min(abs(abs(t) - z), abs(abs(tr) - z)) >= 0.15 and (k % 2 == 1 or (abs(t) > z) != (abs(tr) > z)):
            break
    return dict(id=f"R{k + 1}", tipo="robust", b=b, se=se, ser=ser,
                preguntas=[num("t", "t con el error estándar usual", t, 2), num("tr", "t con el error estándar robusto", tr, 2),
                           sel("du", "¿Es significativo al 5% con el se usual?", si(abs(t) > z), ["sí", "no"], 2),
                           sel("dr", "¿Y con el robusto?", si(abs(tr) > z), ["sí", "no"], 2),
                           sel("cual", "Si hay heterocedasticidad, ¿qué inferencia es válida?", "la robusta", ["la usual", "la robusta", "ambas"], 3)],
                solucion=[f"t usual = {b}/{se} = <b>{fmt(t, 3)}</b>; t robusto = {b}/{ser} = <b>{fmt(tr, 3)}</b>. El coeficiente es el mismo: solo cambia el error estándar.",
                          f"Con n grande se compara con 1.96: usual {'significativo' if abs(t) > z else 'no significativo'}, robusto {'significativo' if abs(tr) > z else 'no significativo'}.",
                          "Con heterocedasticidad el se usual es inválido (sesgado) y los tests t y F dejan de ser válidos; los errores robustos de White sí lo son (Clase 12, láminas 2, 18 y 19)."])


# --------------------------------------------------------------------------------------------
# 9) Variables instrumentales (Clase 12)
# --------------------------------------------------------------------------------------------
IV_CTX = [("log(salario)", "educ", "distancia a la universidad más cercana"), ("peso al nacer", "cigarrillos al día", "impuesto al tabaco"),
          ("nota", "horas de clase", "fecha de nacimiento (trimestre)"), ("demanda de agua", "precio del agua", "lluvia en la cuenca")]


def gen_iv(k):
    y, x, z = IV_CTX[k % len(IV_CTX)]
    if k % 2 == 0:
        while True:
            sxx = round(rnd.uniform(20, 200), 1)
            sxy = round(rnd.uniform(-60, 120), 1)
            szx = round(rnd.choice([-1, 1]) * rnd.uniform(3, 40), 1)
            szy = round(rnd.uniform(-30, 60), 1)
            bm, bv = sxy / sxx, szy / szx
            if abs(bm - bv) > 0.05 and abs(bv) < 20:
                break
        return dict(id=f"V{k + 1}", tipo="iv", sub="cov", y=y, x=x, z=z, sxx=sxx, sxy=sxy, szx=szx, szy=szy,
                    preguntas=[num("mco", "β̂₁ por MCO", bm, 3), num("vi", "β̂₁ por VI", bv, 3),
                               sel("cons", f"Si {x} es endógena y el instrumento es válido, ¿cuál es consistente?", "VI", ["MCO", "VI", "ambos"], 3)],
                    solucion=[f"MCO: β̂₁ = S_xy/S_xx = {sxy}/{sxx} = <b>{fmt(bm, 4)}</b>.",
                              f"VI: β̂₁ = S_zy/S_zx = {szy}/{szx} = <b>{fmt(bv, 4)}</b> (Clase 12, Parte 3, lámina 10).",
                              "Con x endógena MCO es inconsistente; VI es consistente si z es relevante (Cov(z, x) ≠ 0) y exógena (Cov(z, u) = 0)."])
    while True:
        x1, x0 = round(rnd.uniform(8, 16), 2), round(rnd.uniform(6, 14), 2)
        y1, y0 = round(rnd.uniform(5, 9), 3), round(rnd.uniform(5, 9), 3)
        if abs(x1 - x0) >= 0.4 and abs(y1 - y0) >= 0.03:
            break
    w = (y1 - y0) / (x1 - x0)
    return dict(id=f"V{k + 1}", tipo="iv", sub="wald", y=y, x=x, z=z, x1=x1, x0=x0, y1=y1, y0=y0,
                preguntas=[num("dx", "Diferencia de x entre grupos (primera etapa)", x1 - x0, 2),
                           num("dy", "Diferencia de y entre grupos (forma reducida)", y1 - y0, 3), num("vi", "β̂₁ por VI", w, 3)],
                solucion=[f"Con un instrumento binario, β̂_VI = (ȳ₁ − ȳ₀)/(x̄₁ − x̄₀): es S_zy/S_zx con z ∈ {{0, 1}}.",
                          f"x̄₁ − x̄₀ = {x1} − {x0} = <b>{fmt(x1 - x0, 2)}</b>; ȳ₁ − ȳ₀ = {y1} − {y0} = <b>{fmt(y1 - y0, 3)}</b>.",
                          f"β̂_VI = {fmt(y1 - y0, 3)}/{fmt(x1 - x0, 2)} = <b>{fmt(w, 4)}</b>. Si x̄₁ ≈ x̄₀ el instrumento sería débil y el cociente muy inestable."])


# --------------------------------------------------------------------------------------------
# 10) Problemas de desarrollo
# --------------------------------------------------------------------------------------------
def gen_caso_hetero(k):
    while True:
        n = rnd.choice([150, 250, 400, 600, 1000])
        kk = rnd.choice([3, 4, 5])
        r2 = round(rnd.uniform(0.02, 0.09), 4)
        LM, cl = n * r2, chicrit(0.05, kk)
        b = round(rnd.uniform(0.05, 0.9), 3)
        se = round(b / rnd.uniform(2.1, 3.2), 3)
        ser = round(se * rnd.uniform(1.15, 1.8), 3)
        tr = b / ser
        if abs(LM - cl) >= 0.8 and abs(tr - 1.96) >= 0.15:
            break
    lo, hi = b - 1.96 * ser, b + 1.96 * ser
    return dict(id=f"DH{k + 1}", tipo="caso_hetero", n=n, kk=kk, r2=r2, cl=r4(cl), b=b, se=se, ser=ser,
                preguntas=[num("LM", "a) LM de Breusch-Pagan", LM, 2, 3), sel("dl", "b) ¿Hay evidencia de heterocedasticidad al 5%?", si(LM > cl), ["sí", "no"], 2),
                           num("t", "c) t con se usual", b / se, 2, 2), num("tr", "d) t con se robusto", tr, 2, 3),
                           sel("dr", "e) Decisión robusta al 5% para H₀: β = 0", "se rechaza" if tr > 1.96 else "no se rechaza", ["se rechaza", "no se rechaza"], 3),
                           num("lo", "f) Límite inferior del IC robusto de 95%", lo, 3, 2), num("hi", "g) Límite superior del IC robusto de 95%", hi, 3, 2)],
                solucion=[f"a) LM = n·R²_aux = {n}·{r2} = <b>{fmt(LM, 3)}</b>.",
                          f"b) χ²({kk}) al 5% = {fmt(cl, 3)}: <b>{'sí' if LM > cl else 'no'}</b> hay evidencia de heterocedasticidad.",
                          f"c) t usual = {b}/{se} = <b>{fmt(b / se, 3)}</b>. d) t robusto = {b}/{ser} = <b>{fmt(tr, 3)}</b>.",
                          f"e) {fmt(tr, 3)} {'>' if tr > 1.96 else '≤'} 1.96: <b>{'se rechaza' if tr > 1.96 else 'no se rechaza'}</b>."
                          + (" El se usual subestimaba la incertidumbre." if b / se > 1.96 >= tr else ""),
                          f"f–g) IC robusto: {b} ± 1.96·{ser} = <b>({fmt(lo, 4)}; {fmt(hi, 4)})</b>.",
                          "Los β̂ siguen siendo insesgados con heterocedasticidad: lo que falla es la varianza usual (Clase 12, láminas 2 y 19)."])


def gen_caso_iv(k):
    while True:
        sst = round(rnd.uniform(300, 2500), 0)
        s2 = round(rnd.uniform(0.15, 0.6), 3)
        r2xz = round(rnd.uniform(0.02, 0.35), 3)
        bv = round(rnd.uniform(0.04, 0.16), 3)
        bm = round(bv * rnd.uniform(0.6, 1.4), 3)
        sem = math.sqrt(s2 / sst)
        sev = math.sqrt(s2 / (sst * r2xz))
        tv = bv / sev
        if abs(tv - 1.96) >= 0.2:
            break
    y, x, z = IV_CTX[0]
    return dict(id=f"DV{k + 1}", tipo="caso_iv", sst=sst, s2=s2, r2xz=r2xz, bv=bv, bm=bm, y=y, x=x, z=z,
                preguntas=[num("sem", "a) se(β̂) por MCO", sem, 4, 3), num("sev", "b) se(β̂) por VI", sev, 4, 4),
                           num("ratio", "c) se_VI / se_MCO", sev / sem, 2, 3), num("tv", "d) t de VI para H₀: β = 0", tv, 2, 3),
                           sel("dv", "e) ¿Es significativo al 5%?", si(tv > 1.96), ["sí", "no"], 2),
                           sel("debil", "f) Si R²(x, z) fuera más bajo, el se de VI…", "sube", ["sube", "baja", "no cambia"], 2)],
                solucion=[f"a) Var(β̂_MCO) = σ̂²/SST_x: se = √({s2}/{fmt(sst, 0)}) = <b>{fmt(sem, 5)}</b> (Clase 12, Parte 3, lámina 15).",
                          f"b) Var(β̂_VI) = σ̂²/(SST_x·R²_x,z): se = √({s2}/({fmt(sst, 0)}·{r2xz})) = <b>{fmt(sev, 5)}</b>.",
                          f"c) El cociente es 1/√R²_x,z = 1/√{r2xz} = <b>{fmt(sev / sem, 3)}</b>: VI es menos preciso que MCO.",
                          f"d) t = {bv}/{fmt(sev, 5)} = <b>{fmt(tv, 3)}</b>; e) {'>' if tv > 1.96 else '≤'} 1.96: <b>{si(tv > 1.96)}</b>.",
                          "f) Con un instrumento más débil (R²_x,z menor) el se de VI <b>sube</b>: es el costo de la relevancia baja."])


def gen_caso_chow(k):
    while True:
        n1, n2 = rnd.randint(50, 250), rnd.randint(50, 250)
        n = n1 + n2
        s1, s2 = round(rnd.uniform(15, 90), 1), round(rnd.uniform(15, 90), 1)
        sur = round(s1 + s2, 1)
        sp = round(sur * (1 + rnd.uniform(0.01, 0.09)), 1)
        F = (sp - sur) / 3 / (sur / (n - 6))
        crit = fcrit(0.05, 3, n - 6)
        if abs(F - crit) >= 0.35:
            break
    a1, a2 = round(rnd.uniform(0.5, 2), 3), round(rnd.uniform(0.5, 2), 3)
    p1, p2 = round(rnd.uniform(0.03, 0.12), 3), round(rnd.uniform(0.03, 0.12), 3)
    return dict(id=f"DW{k + 1}", tipo="caso_chow", n1=n1, n2=n2, s1=s1, s2=s2, sp=sp, crit=r4(crit), a1=a1, a2=a2, p1=p1, p2=p2,
                preguntas=[num("sur", "a) SSR no restringida", sur, 1, 2), num("gl", "b) Grados de libertad del denominador", n - 6, 0, 2, exacto=True),
                           num("F", "c) F de Chow", F, 2, 4), sel("dec", "d) ¿Difieren los modelos al 5%?", si(F > crit), ["sí", "no"], 2),
                           num("dD", "e) Coeficiente de D en el modelo con interacciones", a2 - a1, 3, 3),
                           num("dDx", "f) Coeficiente de D·educ", p2 - p1, 3, 3)],
                solucion=[f"a) SSR_ur = {s1} + {s2} = <b>{fmt(sur, 1)}</b>.",
                          f"b) Con k = 2 y G = 2: n − 2(k + 1) = {n} − 6 = <b>{n - 6}</b>; el numerador tiene k + 1 = 3 grados de libertad.",
                          f"c) F = [({sp} − {fmt(sur, 1)})/3] / [{fmt(sur, 1)}/{n - 6}] = <b>{fmt(F, 3)}</b>; d) contra F(3, {n - 6}) = {fmt(crit, 3)}: <b>{si(F > crit)}</b>.",
                          f"e–f) El modelo con D y D·x reproduce las dos regresiones: intercepto del grupo 2 = β₀ + δ₀ y pendiente = β₁ + δ₁. "
                          f"Así δ₀ = {a2} − {a1} = <b>{fmt(a2 - a1, 3)}</b> y δ₁ = {p2} − {p1} = <b>{fmt(p2 - p1, 3)}</b> (Clase 11, Parte 1, lámina 13 y Parte 2, lámina 2)."])


def main():
    banco = dict(
        ovb_asint=[gen_ovb(k) for k in range(15)],
        asint=[gen_asint(k) for k in range(15)],
        dummies=[gen_dummies(k) for k in range(18)],
        dumint=[gen_dumint(k) for k in range(15)],
        chow=[gen_chow(k) for k in range(16)],
        mpl=[gen_mpl(k) for k in range(15)],
        bp=[gen_bp(k) for k in range(16)],
        robust=[gen_robust(k) for k in range(16)],
        iv=[gen_iv(k) for k in range(16)],
        caso_hetero=[gen_caso_hetero(k) for k in range(12)],
        caso_iv=[gen_caso_iv(k) for k in range(12)],
        caso_chow=[gen_caso_chow(k) for k in range(12)],
    )
    js = ("/* ARCHIVO GENERADO por tools/practica_banco3.py (verificado con tools/practica_verificar3.R). No editar a mano. */\n"
          "window.PRACTICA_BANCO3 = " + json.dumps(banco, ensure_ascii=False) + ";\n")
    (REPO / "docs" / "javascripts" / "practica-banco3.js").write_text(js, encoding="utf-8")
    (REPO / "tools" / "practica-banco3.json").write_text(json.dumps(banco, ensure_ascii=False, indent=1), encoding="utf-8")
    print({k: len(v) for k, v in banco.items()})


if __name__ == "__main__":
    main()
