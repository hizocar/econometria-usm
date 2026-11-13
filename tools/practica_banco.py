"""Genera el banco de ejercicios numéricos de la Práctica (docs/javascripts/practica-banco.js).

    python3 tools/practica_banco.py          # genera el banco y docs/../practica-banco.json para verificar
    Rscript tools/practica_verificar.R       # recalcula cada respuesta en R, por separado

Cada ejercicio se construye para que se pueda resolver a mano con calculadora: coeficientes enteros,
residuos enteros ortogonales a X y (XᵀX)⁻¹ expresada como (1/d)·matriz entera. Las respuestas se
calculan con fracciones exactas; el script de R las vuelve a calcular desde los datos.
"""
import itertools
import json
import random
from fractions import Fraction as Fr
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
rnd = random.Random(20261141)


def r4(v):
    return round(float(v), 4)


def fmt(v, d=2):
    v = float(v)
    s = f"{v:.{d}f}"
    return s.rstrip("0").rstrip(".") if "." in s else s


# --------------------------------------------------------------------------------------------
# Álgebra exacta
# --------------------------------------------------------------------------------------------
def det(M):
    n = len(M)
    if n == 1:
        return M[0][0]
    return sum((-1) ** j * M[0][j] * det([r[:j] + r[j + 1:] for r in M[1:]]) for j in range(n))


def adj(M):
    n = len(M)
    cof = [[(-1) ** (i + j) * det([r[:j] + r[j + 1:] for k, r in enumerate(M) if k != i]) for j in range(n)] for i in range(n)]
    return [list(r) for r in zip(*cof)]


def xtx(X):
    return [[sum(r[i] * r[j] for r in X) for j in range(len(X[0]))] for i in range(len(X[0]))]


_CACHE = {}


def residuos_ortogonales(X, lim, minimo_no_cero=3):
    clave = (tuple(map(tuple, X)), lim, minimo_no_cero)
    if clave not in _CACHE:
        _CACHE[clave] = _residuos(X, lim, minimo_no_cero)
    return _CACHE[clave]


def _residuos(X, lim, minimo_no_cero):
    """Residuos enteros pequeños u con Xᵀu = 0 (así MCO devuelve exactamente los β elegidos)."""
    n, k = len(X), len(X[0])
    opciones = []
    for u in itertools.product(range(-lim, lim + 1), repeat=n):
        if sum(1 for v in u if v) < minimo_no_cero:
            continue
        if all(sum(X[i][j] * u[i] for i in range(n)) == 0 for j in range(k)):
            opciones.append(u)
    return opciones


# --------------------------------------------------------------------------------------------
# 1) Regresión simple
# --------------------------------------------------------------------------------------------
SIMPLE_CTX = [
    ("horas de estudio semanales", "nota del control (escala 1–100)", "horas", "puntos", (2, 6), (40, 60)),
    ("temperatura máxima del día (°C)", "botellas de agua vendidas (decenas)", "°C", "decenas", (1, 3), (0, 10)),
    ("años de experiencia", "sueldo mensual (cientos de miles de $)", "años", "cientos de miles", (1, 2), (5, 10)),
    ("distancia al metro (cuadras)", "arriendo mensual (decenas de miles de $)", "cuadras", "decenas de miles", (-3, -1), (40, 60)),
    ("número de clientes atendidos por hora", "propinas de la hora (miles de $)", "clientes", "miles de $", (1, 3), (1, 6)),
    ("kilos de fertilizante por hectárea", "rendimiento (quintales por hectárea)", "kilos", "quintales", (1, 4), (20, 35)),
    ("cursos de idioma aprobados", "puntaje en una prueba de inglés", "cursos", "puntos", (3, 6), (30, 50)),
    ("edad del auto (años)", "precio de reventa (millones de $)", "años", "millones", (-2, -1), (12, 20)),
]
XS_SIMPLE = [[2, 4, 6, 8, 10], [0, 2, 3, 5, 10], [1, 2, 4, 7, 6], [3, 5, 6, 8, 8], [0, 1, 3, 4, 7],
             [2, 3, 3, 6, 6, 4], [1, 1, 3, 5, 6, 8], [4, 6, 7, 9, 10, 12], [0, 2, 2, 4, 6, 4]]


def gen_simple(k):
    for _ in range(500):
        xs = rnd.choice(XS_SIMPLE)
        ctx = rnd.choice(SIMPLE_CTX)
        b1 = rnd.randint(*ctx[4])
        b0 = rnd.randint(*ctx[5])
        X = [[1, x] for x in xs]
        us = residuos_ortogonales(X, 3)
        if not us:
            continue
        u = rnd.choice(us)
        ys = [b0 + b1 * x + e for x, e in zip(xs, u)]
        if min(ys) <= 0:
            continue
        n = len(xs)
        ybar = Fr(sum(ys), n)
        SST = sum((Fr(y) - ybar) ** 2 for y in ys)
        SSR = sum(e * e for e in u)
        SSE = SST - SSR
        if SST == 0 or SSR == 0:
            continue
        i = rnd.randrange(n)
        nombres = "ABCDEFGH"[:n]
        xbar = Fr(sum(xs), n)
        Sxy = sum((Fr(x) - xbar) * (Fr(y) - ybar) for x, y in zip(xs, ys))
        Sxx = sum((Fr(x) - xbar) ** 2 for x in xs)
        R2 = SSE / SST
        sol = [
            f"x̄ = {fmt(xbar, 3)} y ȳ = {fmt(ybar, 3)}.",
            f"Σ(xᵢ − x̄)(yᵢ − ȳ) = {fmt(Sxy, 3)} y Σ(xᵢ − x̄)² = {fmt(Sxx, 3)} ⇒ β̂₁ = {fmt(Sxy, 3)} / {fmt(Sxx, 3)} = <b>{b1}</b>.",
            f"β̂₀ = ȳ − β̂₁x̄ = {fmt(ybar, 3)} − ({b1})·{fmt(xbar, 3)} = <b>{b0}</b>.",
            f"Valores ajustados ŷ = {b0} + {b1}·x: " + ", ".join(f"{nm}: {b0 + b1 * x}" for nm, x in zip(nombres, xs)) + ".",
            "Residuos û = y − ŷ: " + ", ".join(f"{nm}: {e}" for nm, e in zip(nombres, u)) + f" (suman {sum(u)}, como exige MCO con intercepto).",
            f"SST = Σ(yᵢ − ȳ)² = <b>{fmt(SST, 3)}</b>; SSR = Σûᵢ² = <b>{SSR}</b>; SSE = SST − SSR = <b>{fmt(SSE, 3)}</b>.",
            f"R² = SSE/SST = {fmt(SSE, 3)}/{fmt(SST, 3)} = <b>{fmt(R2, 4)}</b>: el modelo explica el {fmt(100 * R2, 1)}% de la variación de y en la muestra.",
        ]
        return dict(
            id=f"S{k + 1}", tipo="simple", x_lab=ctx[0], y_lab=ctx[1], nombres=list(nombres), x=xs, y=ys, i=i,
            preguntas=[
                dict(k="b1", lab="β̂₁ (pendiente)", ans=b1, dec=2, pts=4),
                dict(k="b0", lab="β̂₀ (intercepto)", ans=b0, dec=2, pts=3),
                dict(k="yhat", lab=f"ŷ de {nombres[i]}", ans=b0 + b1 * xs[i], dec=2, pts=2),
                dict(k="u", lab=f"û de {nombres[i]}", ans=u[i], dec=2, pts=2),
                dict(k="SST", lab="SST", ans=r4(SST), dec=2, pts=3),
                dict(k="SSR", lab="SSR", ans=SSR, dec=2, pts=3),
                dict(k="R2", lab="R² (4 decimales)", ans=r4(R2), dec=4, pts=4),
            ],
            solucion=sol,
        )
    raise SystemExit("no se pudo generar regresión simple")


# --------------------------------------------------------------------------------------------
# 2) Regresión múltiple con matrices
# --------------------------------------------------------------------------------------------
MULTI_CTX = [
    ("Precio de departamentos", "y: precio (millones de $)", "x₁: superficie (decenas de m²)", "x₂: distancia al metro (km)", (8, 15), (3, 6), (-4, -1)),
    ("Nota final", "y: nota (escala 1–100)", "x₁: horas de estudio semanales", "x₂: horas de sueño sobre 6", (30, 45), (2, 5), (1, 4)),
    ("Consumo eléctrico", "y: consumo mensual (decenas de kWh)", "x₁: personas en el hogar", "x₂: electrodomésticos grandes", (3, 8), (2, 5), (1, 3)),
    ("Rendimiento agrícola", "y: quintales por hectárea", "x₁: riegos por semana", "x₂: sacos de fertilizante", (12, 20), (1, 4), (2, 5)),
    ("Tiempo de entrega", "y: minutos de entrega", "x₁: kilómetros recorridos", "x₂: pedidos en espera", (5, 12), (2, 4), (1, 3)),
    ("Ventas de una heladería", "y: ventas diarias (miles de $)", "x₁: temperatura sobre 20 °C", "x₂: días de feriado de la semana", (20, 35), (3, 6), (2, 6)),
]


def gen_multi(k):
    for _ in range(4000):
        n = rnd.choice([5, 6])
        x1 = [rnd.randint(0, 6) for _ in range(n)]
        x2 = [rnd.randint(0, 4) for _ in range(n)]
        X = [[1, a, b] for a, b in zip(x1, x2)]
        A = xtx(X)
        d = det(A)
        if d <= 0 or d > 80:
            continue
        ctx = rnd.choice(MULTI_CTX)
        B = [rnd.randint(*ctx[4]), rnd.randint(*ctx[5]), rnd.randint(*ctx[6])]
        if B[1] == 0 or B[2] == 0:
            continue
        us = residuos_ortogonales(X, 2, 3)
        if not us:
            continue
        u = rnd.choice(us)
        y = [B[0] + B[1] * a + B[2] * b + e for a, b, e in zip(x1, x2, u)]
        if min(y) <= 0:
            continue
        Adj = adj(A)
        Xty = [sum(r[j] * yy for r, yy in zip(X, y)) for j in range(3)]
        bchk = [Fr(sum(Adj[i][j] * Xty[j] for j in range(3)), d) for i in range(3)]
        assert bchk == B, (bchk, B)
        SSR = sum(e * e for e in u)
        ybar = Fr(sum(y), n)
        SST = sum((Fr(v) - ybar) ** 2 for v in y)
        if SST == 0:
            continue
        gl = n - 3
        s2 = Fr(SSR, gl)
        V = [[s2 * Fr(Adj[i][j], d) for j in range(3)] for i in range(3)]
        se1, se2 = float(V[1][1]) ** 0.5, float(V[2][2]) ** 0.5
        R2 = 1 - Fr(SSR) / SST
        R2a = 1 - Fr(n - 1, gl) * Fr(SSR) / SST
        a1, a2 = rnd.randint(1, 6), rnd.randint(0, 4)
        yp = B[0] + B[1] * a1 + B[2] * a2
        d1, d2 = rnd.choice([(1, 1), (2, -1), (-1, 2), (1, -2), (3, 0)])
        dy = B[1] * d1 + B[2] * d2
        pred = rnd.random() < 0.5
        q_last = (dict(k="pred", lab=f"ŷ con x₁ = {a1} y x₂ = {a2}", ans=yp, dec=2, pts=3, v1=a1, v2=a2) if pred else
                  dict(k="dy", lab=f"Cambio en ŷ si x₁ cambia en {d1:+d} y x₂ en {d2:+d}", ans=dy, dec=2, pts=3, v1=d1, v2=d2))
        sol = [
            f"Xᵀy = ({', '.join(str(v) for v in Xty)}): la suma de y, la suma de x₁·y y la suma de x₂·y.",
            f"β̂ = (XᵀX)⁻¹Xᵀy = (1/{d})·[adj]·Xᵀy = <b>({B[0]}, {B[1]}, {B[2]})</b>.",
            f"Interpretación: β̂₁ = {B[1]} es el cambio esperado en y por una unidad más de x₁, <em>manteniendo x₂ constante</em>; β̂₂ = {B[2]}, lo mismo para x₂ con x₁ constante.",
            "Residuos û = y − Xβ̂: " + ", ".join(str(e) for e in u) + f" ⇒ SSR = <b>{SSR}</b>.",
            f"σ̂² = SSR/(n − k − 1) = {SSR}/({n} − 2 − 1) = <b>{fmt(s2, 4)}</b>.",
            f"V̂(β̂₁) = σ̂²·(XᵀX)⁻¹₂₂ = {fmt(s2, 4)}·{Adj[1][1]}/{d} = {fmt(V[1][1], 4)} ⇒ se(β̂₁) = <b>{fmt(se1, 4)}</b>; "
            f"V̂(β̂₂) = {fmt(V[2][2], 4)} ⇒ se(β̂₂) = <b>{fmt(se2, 4)}</b>.",
            f"ȳ = {fmt(ybar, 3)}, SST = {fmt(SST, 3)} ⇒ R² = 1 − SSR/SST = <b>{fmt(R2, 4)}</b> y "
            f"R̄² = 1 − ({n - 1}/{gl})·SSR/SST = <b>{fmt(R2a, 4)}</b>. Con solo {gl} grado{'s' if gl > 1 else ''} de libertad, la penalización es grande.",
            (f"ŷ = {B[0]} + {B[1]}·{a1} + {B[2]}·{a2} = <b>{yp}</b>." if pred else
             f"Δŷ = β̂₁·Δx₁ + β̂₂·Δx₂ = {B[1]}·({d1}) + {B[2]}·({d2}) = <b>{dy}</b>: el intercepto no participa en un cambio."),
        ]
        return dict(
            id=f"M{k + 1}", tipo="multi", titulo=ctx[0], y_lab=ctx[1], x1_lab=ctx[2], x2_lab=ctx[3],
            x1=x1, x2=x2, y=y, d=d, adj=Adj, Xty=Xty,
            preguntas=[
                dict(k="b0", lab="β̂₀", ans=B[0], dec=2, pts=3),
                dict(k="b1", lab="β̂₁", ans=B[1], dec=2, pts=3),
                dict(k="b2", lab="β̂₂", ans=B[2], dec=2, pts=3),
                dict(k="s2", lab="σ̂²", ans=r4(s2), dec=2, pts=3),
                dict(k="se1", lab="se(β̂₁)", ans=r4(se1), dec=2, pts=3),
                dict(k="R2", lab="R² (3 decimales)", ans=r4(R2), dec=3, pts=3),
                dict(k="R2a", lab="R² ajustado (3 decimales)", ans=r4(R2a), dec=3, pts=3),
                q_last,
            ],
            solucion=sol,
        )
    raise SystemExit("no se pudo generar regresión múltiple")


# --------------------------------------------------------------------------------------------
# 3) Outcomes potenciales
# --------------------------------------------------------------------------------------------
CAUSAL_CTX = [
    ("Una empresa ofrece un programa voluntario de vida sana a sus trabajadores.", "programa", "horas de ausencia laboral al año (menos es mejor)", "bajo"),
    ("Un colegio ofrece clases de reforzamiento optativas antes de la prueba de matemáticas.", "reforzamiento", "puntaje en la prueba", "alto"),
    ("Una municipalidad entrega un subsidio a microempresas que lo postulan.", "subsidio", "ventas mensuales (millones de $)", "alto"),
    ("Una app de finanzas ofrece una asesoría gratuita a quienes la piden.", "asesoría", "ahorro mensual (miles de $)", "alto"),
    ("Una empresa de buses ofrece un curso de conducción defensiva voluntario.", "curso", "incidentes en ruta por año (por cada 100 conductores; menos es mejor)", "bajo"),
]


def gen_causal(k):
    for _ in range(2000):
        n = rnd.choice([5, 7, 8])
        nt = rnd.randint(2, n - 2)
        ctx = rnd.choice(CAUSAL_CTX)
        T = [1] * nt + [0] * (n - nt)
        rnd.shuffle(T)
        base = rnd.randint(20, 60)
        sel = rnd.choice([-1, 1]) * rnd.randint(4, 15)
        ynt = [base + (sel if t else 0) + rnd.randint(-6, 6) for t in T]
        # El efecto va en la dirección que busca el programa: sube lo deseable ("alto") o baja lo indeseable ("bajo")
        efecto_base = rnd.randint(3, 10) * (1 if ctx[3] == "alto" else -1)
        yt = [v + efecto_base + rnd.randint(-4, 4) for v in ynt]
        if min(ynt + yt) <= 0:
            continue
        ef = [b - a for a, b in zip(ynt, yt)]
        ATE = Fr(sum(ef), n)
        ATT = Fr(sum(e for e, t in zip(ef, T) if t), nt)
        E1 = Fr(sum(b for b, t in zip(yt, T) if t), nt)
        E0 = Fr(sum(a for a, t in zip(ynt, T) if not t), n - nt)
        dif = E1 - E0
        SB = Fr(sum(a for a, t in zip(ynt, T) if t), nt) - E0
        if SB == 0 or abs(float(ATE - ATT)) < 0.01 and rnd.random() < 0.7:
            continue
        nombres = "ABCDEFGH"[:n]
        sol = [
            "Efectos individuales Yᵀ − Yᴺᵀ: " + ", ".join(f"{nm}: {e}" for nm, e in zip(nombres, ef)) + ".",
            f"ATE = promedio de los {n} efectos = {sum(ef)}/{n} = <b>{fmt(ATE, 3)}</b>.",
            f"ATT = promedio de los efectos de los {nt} tratados = {sum(e for e, t in zip(ef, T) if t)}/{nt} = <b>{fmt(ATT, 3)}</b>.",
            f"Diferencia observada = E[Yᵀ | T = 1] − E[Yᴺᵀ | T = 0] = {fmt(E1, 3)} − {fmt(E0, 3)} = <b>{fmt(dif, 3)}</b>.",
            f"Sesgo de selección = E[Yᴺᵀ | T = 1] − E[Yᴺᵀ | T = 0] = {fmt(E0 + SB, 3)} − {fmt(E0, 3)} = <b>{fmt(SB, 3)}</b>.",
            f"Comprobación: ATT + sesgo = {fmt(ATT, 3)} + ({fmt(SB, 3)}) = {fmt(ATT + SB, 3)} = diferencia observada.",
            ("Sesgo positivo: aun sin el tratamiento, quienes lo tomaron tendrían un resultado más alto que quienes no." if SB > 0 else
             "Sesgo negativo: aun sin el tratamiento, quienes lo tomaron tendrían un resultado más bajo que quienes no (se inscriben los que están peor)."),
        ]
        return dict(
            id=f"C{k + 1}", tipo="causal", contexto=ctx[0], trat=ctx[1], y_lab=ctx[2], nombres=list(nombres), T=T, ynt=ynt, yt=yt,
            preguntas=[
                dict(k="ATE", lab="ATE", ans=r4(ATE), dec=2, pts=3),
                dict(k="ATT", lab="ATT", ans=r4(ATT), dec=2, pts=3),
                dict(k="dif", lab="Diferencia observada", ans=r4(dif), dec=2, pts=3),
                dict(k="SB", lab="Sesgo de selección", ans=r4(SB), dec=2, pts=3),
            ],
            solucion=sol,
        )
    raise SystemExit("no se pudo generar causalidad")


# --------------------------------------------------------------------------------------------
# 4) Sesgo por variable omitida
# --------------------------------------------------------------------------------------------
OVB_CTX = [
    ("salario (miles de $)", "años de educación", "habilidad (puntaje de un test)"),
    ("rendimiento académico", "horas de clases particulares", "nota del año anterior"),
    ("precio de la vivienda (millones)", "número de baños", "superficie (m²)"),
    ("ventas mensuales (millones)", "gasto en redes sociales", "tamaño de la tienda (m²)"),
    ("días de licencia médica", "horas de gimnasio al mes", "edad"),
]


def gen_ovb(k):
    for _ in range(500):
        ctx = rnd.choice(OVB_CTX)
        b1 = rnd.choice([v for v in range(-6, 13) if v != 0])
        b2 = rnd.choice([v for v in range(-5, 6) if v != 0])
        d1 = rnd.choice([Fr(v, 2) for v in range(-8, 9) if v != 0])
        bt = b1 + b2 * d1
        if bt == b1 or bt.denominator != 1 and bt.denominator != 2:
            continue
        b0c, b0l = rnd.randint(5, 40), rnd.randint(5, 40)
        incog = rnd.choice(["d1", "bt", "b2"])
        signo = "positivo" if b2 * d1 > 0 else "negativo"
        t = lambda c, v: f"{'+' if c > 0 else '−'} {fmt(abs(c), 2)}·{v}"
        corta = f"ŷ = {b0c} {t(bt, 'x₁')}" if incog != "bt" else "ŷ = α̃ + β̃₁·x₁ (β̃₁ desconocido)"
        larga = f"ŷ = {b0l} {t(b1, 'x₁')} {t(b2, 'x₂')}" if incog != "b2" else f"ŷ = {b0l} {t(b1, 'x₁')} + β₂·x₂ (β₂ desconocido)"
        aux = f"x₂ = δ₀ {t(d1, 'x₁')} + v" if incog != "d1" else "x₂ = δ₀ + δ₁·x₁ + v (δ₁ desconocido)"
        if incog == "d1":
            q = dict(k="d1", lab="δ₁", ans=r4(d1), dec=2, pts=4)
            paso = f"{fmt(bt, 2)} = {b1} + ({b2})·δ₁ ⇒ δ₁ = ({fmt(bt, 2)} − {b1})/{b2} = <b>{fmt(d1, 2)}</b>."
        elif incog == "bt":
            q = dict(k="bt", lab="β̃₁ (regresión corta)", ans=r4(bt), dec=2, pts=4)
            paso = f"β̃₁ = β₁ + β₂δ₁ = {b1} + ({b2})·({fmt(d1, 2)}) = <b>{fmt(bt, 2)}</b>."
        else:
            q = dict(k="b2", lab="β₂", ans=b2, dec=2, pts=4)
            paso = f"{fmt(bt, 2)} = {b1} + β₂·({fmt(d1, 2)}) ⇒ β₂ = ({fmt(bt, 2)} − {b1})/{fmt(d1, 2)} = <b>{b2}</b>."
        return dict(
            id=f"O{k + 1}", tipo="ovb", datos=dict(b1=b1, b2=b2, d1=float(d1), bt=float(bt), incognita=incog), y_lab=ctx[0], x1_lab=ctx[1], x2_lab=ctx[2], corta=corta, larga=larga, aux=aux,
            preguntas=[q, dict(k="signo", lab="Signo del sesgo de la regresión corta", ans=signo, opciones=["positivo", "negativo"], pts=3)],
            solucion=[
                "Fórmula del sesgo por variable omitida (Clase 3): β̃₁ = β₁ + β₂·δ₁.",
                paso,
                f"Sesgo = β₂·δ₁ = ({b2})·({fmt(d1, 2)}) = {fmt(b2 * d1, 2)}: <b>{signo}</b>. "
                f"La regresión corta {'sobreestima' if signo == 'positivo' else 'subestima'} el efecto de {ctx[1]} porque omite {ctx[2]}, "
                f"que {'aumenta' if b2 > 0 else 'reduce'} y y está {'positiva' if d1 > 0 else 'negativa'}mente relacionada con x₁.",
            ],
        )
    raise SystemExit("no se pudo generar OVB")


# --------------------------------------------------------------------------------------------
# 5) Intervalos de confianza (formulario: media con σ conocido y diferencia de medias)
# --------------------------------------------------------------------------------------------
Z = {"90": 1.645, "95": 1.96, "99": 2.576}
IC_CTX = [
    ("el gasto mensual en transporte de estudiantes (miles de $)", (25, 60), (8, 20)),
    ("el tiempo de espera en una sucursal bancaria (minutos)", (10, 30), (4, 10)),
    ("las ventas diarias de un food truck (miles de $)", (150, 400), (30, 90)),
    ("el puntaje en una prueba de comprensión lectora", (450, 600), (60, 110)),
]
IC2_CTX = [
    ("sueldo de egresados de dos universidades (miles de $)", (900, 1300), (700, 1100), (120, 250)),
    ("tiempo de reparación de dos talleres (horas)", (20, 40), (18, 38), (5, 12)),
    ("rendimiento de dos variedades de trigo (quintales/ha)", (55, 80), (50, 75), (8, 15)),
]


def gen_ic(k):
    if k % 2 == 0:
        ctx = rnd.choice(IC_CTX)
        n = rnd.choice([36, 49, 64, 81, 100, 144])
        xbar = rnd.randint(*ctx[1])
        s = rnd.randint(*ctx[2])
        c = rnd.choice(list(Z))
        e = Z[c] * s / n ** 0.5
        return dict(id=f"I{k + 1}", tipo="ic1", contexto=ctx[0], n=n, xbar=xbar, sigma=s, conf=c,
                    preguntas=[dict(k="lo", lab="Límite inferior", ans=r4(xbar - e), dec=2, pts=3),
                               dict(k="hi", lab="Límite superior", ans=r4(xbar + e), dec=2, pts=3)],
                    solucion=[f"Con σ conocido: x̄ ± z·σ/√n, con z = {Z[c]} para {c}%.",
                              f"Error = {Z[c]}·{s}/√{n} = {Z[c]}·{s}/{int(n ** 0.5)} = {fmt(e, 4)}.",
                              f"IC = ({xbar} − {fmt(e, 4)}; {xbar} + {fmt(e, 4)}) = <b>({fmt(xbar - e, 2)}; {fmt(xbar + e, 2)})</b>."])
    ctx = rnd.choice(IC2_CTX)
    nx, ny = rnd.choice([64, 81, 100, 121, 144]), rnd.choice([49, 64, 81, 100, 169])
    xb, yb = rnd.randint(*ctx[1]), rnd.randint(*ctx[2])
    sx, sy = rnd.randint(*ctx[3]), rnd.randint(*ctx[3])
    c = rnd.choice(list(Z))
    ee = (sx ** 2 / nx + sy ** 2 / ny) ** 0.5
    lo, hi = xb - yb - Z[c] * ee, xb - yb + Z[c] * ee
    cero = lo <= 0 <= hi
    return dict(id=f"I{k + 1}", tipo="ic2", contexto=ctx[0], nx=nx, ny=ny, xb=xb, yb=yb, sx=sx, sy=sy, conf=c,
                preguntas=[dict(k="lo", lab="Límite inferior", ans=r4(lo), dec=2, pts=3),
                           dict(k="hi", lab="Límite superior", ans=r4(hi), dec=2, pts=3),
                           dict(k="dif", lab="¿Hay evidencia de que las medias son distintas?", ans="no" if cero else "sí", opciones=["sí", "no"], pts=2)],
                solucion=[f"(X̄ − Ȳ) ± z·√(σₓ²/nₓ + σᵧ²/nᵧ), con z = {Z[c]} para {c}%.",
                          f"√({sx}²/{nx} + {sy}²/{ny}) = √({fmt(sx ** 2 / nx, 4)} + {fmt(sy ** 2 / ny, 4)}) = {fmt(ee, 4)}.",
                          f"IC = {xb - yb} ± {Z[c]}·{fmt(ee, 4)} = <b>({fmt(lo, 2)}; {fmt(hi, 2)})</b>.",
                          ("El intervalo <b>contiene</b> al cero: no hay evidencia de que las medias sean distintas." if cero else
                           "El intervalo <b>no contiene</b> al cero: hay evidencia de que las medias son distintas.")])


# --------------------------------------------------------------------------------------------
# 6) Regresión simple a partir de resúmenes (sin tabla de datos)
# --------------------------------------------------------------------------------------------
RESUMEN_CTX = [
    ("precio de un café (cientos de $)", "ventas diarias (decenas de tazas)", "cientos de $", "decenas de tazas"),
    ("edad del árbol (años)", "altura (metros)", "años", "metros"),
    ("horas de práctica con un software contable", "informes cerrados por mes", "horas", "informes"),
    ("superficie de la tienda (decenas de m²)", "ventas mensuales (millones de $)", "decenas de m²", "millones de $"),
    ("km recorridos al día", "litros de combustible", "km", "litros"),
]


def gen_resumen(k):
    for _ in range(500):
        ctx = rnd.choice(RESUMEN_CTX)
        n = rnd.choice([10, 12, 15, 20, 22, 27])
        xbar = rnd.randint(2, 12)
        b1 = Fr(rnd.choice([-3, -2, -1, 1, 2, 3, 4]), rnd.choice([1, 2]))
        b0 = Fr(rnd.randint(5, 40))
        ybar = b0 + b1 * xbar
        Sxx = rnd.choice([20, 25, 40, 50, 64, 80, 100])
        Sxy = b1 * Sxx
        SSE = b1 * b1 * Sxx
        SSR = rnd.randint(int(SSE * Fr(1, 3)) + 2, int(SSE * 2) + 10)
        SST = SSE + SSR
        s2 = Fr(SSR, n - 2)
        se1 = (float(s2) / Sxx) ** 0.5
        R2 = SSE / SST
        return dict(
            id=f"R{k + 1}", tipo="resumen", x_lab=ctx[0], y_lab=ctx[1], n=n, xbar=xbar, ybar=float(ybar), Sxx=Sxx, Sxy=float(Sxy), SSR=SSR,
            preguntas=[
                dict(k="b1", lab="β̂₁", ans=r4(b1), dec=2, pts=3),
                dict(k="b0", lab="β̂₀", ans=r4(b0), dec=2, pts=3),
                dict(k="SSE", lab="SSE (= β̂₁²·Σ(x − x̄)²)", ans=r4(SSE), dec=2, pts=3),
                dict(k="R2", lab="R² (3 decimales)", ans=r4(R2), dec=3, pts=3),
                dict(k="s2", lab="σ̂²", ans=r4(s2), dec=2, pts=3),
                dict(k="se1", lab="se(β̂₁)", ans=r4(se1), dec=3, pts=3),
            ],
            solucion=[
                f"β̂₁ = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² = {fmt(Sxy, 3)} / {Sxx} = <b>{fmt(b1, 3)}</b>.",
                f"β̂₀ = ȳ − β̂₁x̄ = {fmt(ybar, 3)} − ({fmt(b1, 3)})·{xbar} = <b>{fmt(b0, 3)}</b>.",
                f"Como ŷᵢ − ȳ = β̂₁(xᵢ − x̄), se tiene SSE = β̂₁²·Σ(x − x̄)² = {fmt(b1 * b1, 4)}·{Sxx} = <b>{fmt(SSE, 3)}</b>.",
                f"SST = SSE + SSR = {fmt(SSE, 3)} + {SSR} = {fmt(SST, 3)} ⇒ R² = SSE/SST = <b>{fmt(R2, 4)}</b>.",
                f"σ̂² = SSR/(n − 2) = {SSR}/{n - 2} = <b>{fmt(s2, 4)}</b> (en la regresión simple, k = 1).",
                f"se(β̂₁) = √(σ̂² / Σ(x − x̄)²) = √({fmt(s2, 4)}/{Sxx}) = <b>{fmt(se1, 4)}</b>.",
            ],
        )


# --------------------------------------------------------------------------------------------
# 7) Detective de residuos: completar residuos con Σû = 0 y Σxû = 0
# --------------------------------------------------------------------------------------------
def gen_residuos(k):
    for _ in range(800):
        xs = rnd.choice(XS_SIMPLE)
        n = len(xs)
        X = [[1, x] for x in xs]
        us = residuos_ortogonales(X, 4)
        if not us:
            continue
        u = rnd.choice(us)
        i, j = sorted(rnd.sample(range(n), 2))
        if xs[i] == xs[j]:
            continue
        b0, b1 = rnd.randint(3, 20), rnd.choice([-2, -1, 1, 2, 3])
        y = [b0 + b1 * x + e for x, e in zip(xs, u)]
        nombres = "ABCDEFGH"[:n]
        S0 = -sum(e for t, e in enumerate(u) if t not in (i, j))
        S1 = -sum(x * e for t, (x, e) in enumerate(zip(xs, u)) if t not in (i, j))
        SSR = sum(e * e for e in u)
        return dict(
            id=f"D{k + 1}", tipo="residuos", nombres=list(nombres), x=xs, u=[None if t in (i, j) else e for t, e in enumerate(u)], ij=[i, j],
            y=y, b0=b0, b1=b1,
            preguntas=[
                dict(k="ui", lab=f"û de {nombres[i]}", ans=u[i], dec=2, pts=4),
                dict(k="uj", lab=f"û de {nombres[j]}", ans=u[j], dec=2, pts=4),
                dict(k="SSR", lab="SSR", ans=SSR, dec=2, pts=3),
                dict(k="yhat", lab=f"ŷ de {nombres[i]} (y = {y[i]})", ans=y[i] - u[i], dec=2, pts=3),
            ],
            solucion=[
                "MCO con intercepto cumple dos condiciones: Σûᵢ = 0 y Σxᵢûᵢ = 0 (Clase 2, lámina 20).",
                f"Con los residuos conocidos: û_{nombres[i]} + û_{nombres[j]} = {S0} y {xs[i]}·û_{nombres[i]} + {xs[j]}·û_{nombres[j]} = {S1}.",
                f"Resolviendo el sistema: <b>û_{nombres[i]} = {u[i]}</b> y <b>û_{nombres[j]} = {u[j]}</b>.",
                f"SSR = Σûᵢ² = " + " + ".join(f"({e})²" for e in u) + f" = <b>{SSR}</b>.",
                f"ŷ_{nombres[i]} = y − û = {y[i]} − ({u[i]}) = <b>{y[i] - u[i]}</b>. (La recta estimada es ŷ = {b0} {'+' if b1 > 0 else '−'} {abs(b1)}x.)",
            ],
        )


# --------------------------------------------------------------------------------------------
# 8) Cambio de unidades
# --------------------------------------------------------------------------------------------
UNIDADES = [
    ("sueldo mensual", "miles de $", "años de educación", "años", [("y", 1000, "pesos (× 1 000)"), ("y", Fr(1, 1000), "millones de $ (÷ 1 000)"), ("x", 12, "meses (× 12)")]),
    ("precio de la vivienda", "millones de $", "superficie", "m²", [("x", Fr(1, 10), "decenas de m² (÷ 10)"), ("y", 1000, "miles de $ (× 1 000)")]),
    ("gasto en alimentos", "miles de $", "ingreso del hogar", "miles de $", [("x", Fr(1, 1000), "millones de $ (÷ 1 000)"), ("y", Fr(1, 1000), "millones de $ (÷ 1 000)")]),
    ("distancia recorrida", "km", "tiempo de viaje", "horas", [("x", 60, "minutos (× 60)"), ("y", 1000, "metros (× 1 000)")]),
]


def gen_unidades(k):
    ctx = rnd.choice(UNIDADES)
    b0 = Fr(rnd.randint(-40, 200), rnd.choice([1, 10]))
    b1 = Fr(rnd.randint(2, 90), rnd.choice([1, 10]))
    R2 = Fr(rnd.randint(15, 85), 100)
    var, c, txt = rnd.choice(ctx[4])
    if var == "y":
        nb0, nb1 = b0 * c, b1 * c
        exp = (f"Si y se multiplica por c = {fmt(c, 4)}, ambos coeficientes se multiplican por c: "
               f"β̃₀ = {fmt(b0, 3)}·{fmt(c, 4)} = <b>{fmt(nb0, 4)}</b> y β̃₁ = {fmt(b1, 3)}·{fmt(c, 4)} = <b>{fmt(nb1, 4)}</b>.")
    else:
        nb0, nb1 = b0, b1 / c
        exp = (f"Si x se multiplica por α = {fmt(c, 4)}, la pendiente se <b>divide</b> por α: β̃₁ = {fmt(b1, 3)}/{fmt(c, 4)} = <b>{fmt(nb1, 4)}</b>. "
               f"El intercepto no cambia: β̃₀ = <b>{fmt(b0, 3)}</b> (Clase 2, lámina 26).")
    return dict(
        id=f"U{k + 1}", tipo="unidades", y_lab=ctx[0], y_u=ctx[1], x_lab=ctx[2], x_u=ctx[3], b0=float(b0), b1=float(b1), R2=float(R2), var=var, c=float(c), txt=txt,
        preguntas=[
            dict(k="nb0", lab="Nuevo β̃₀", ans=r4(nb0), dec=3, pts=3),
            dict(k="nb1", lab="Nuevo β̃₁", ans=r4(nb1), dec=3, pts=3),
            dict(k="nR2", lab="Nuevo R²", ans=r4(R2), dec=2, pts=2),
        ],
        solucion=[exp, f"El R² no depende de las unidades de medida: sigue siendo <b>{fmt(R2, 2)}</b>.",
                  "Comprueba la interpretación: el efecto de un cambio real en x sobre y es el mismo en ambas unidades."],
    )


# --------------------------------------------------------------------------------------------
# 9) MCO simple con matrices de 2 × 2
# --------------------------------------------------------------------------------------------
def gen_matriz2(k):
    for _ in range(800):
        n = rnd.choice([4, 5])
        xs = [rnd.randint(0, 6) for _ in range(n)]
        X = [[1, x] for x in xs]
        A = xtx(X)
        d = det(A)
        if d <= 0 or d > 60:
            continue
        us = residuos_ortogonales(X, 2, 2)
        if not us:
            continue
        u = rnd.choice(us)
        b0, b1 = rnd.randint(2, 15), rnd.choice([-3, -2, -1, 1, 2, 3, 4])
        y = [b0 + b1 * x + e for x, e in zip(xs, u)]
        if min(y) <= 0:
            continue
        Adj = adj(A)
        Xty = [sum(y), sum(x * v for x, v in zip(xs, y))]
        return dict(
            id=f"X{k + 1}", tipo="matriz2", x=xs, y=y,
            preguntas=[
                dict(k="sx", lab="Σxᵢ (elemento (1,2) de XᵀX)", ans=A[0][1], dec=2, pts=2, exacto=True),
                dict(k="sxx", lab="Σxᵢ² (elemento (2,2) de XᵀX)", ans=A[1][1], dec=2, pts=2, exacto=True),
                dict(k="det", lab="det(XᵀX)", ans=d, dec=2, pts=3, exacto=True),
                dict(k="b0", lab="β̂₀", ans=b0, dec=2, pts=3),
                dict(k="b1", lab="β̂₁", ans=b1, dec=2, pts=3),
            ],
            solucion=[
                f"X tiene una columna de unos y la columna x: XᵀX = [[n, Σx], [Σx, Σx²]] = [[{A[0][0]}, {A[0][1]}], [{A[1][0]}, {A[1][1]}]].",
                f"det(XᵀX) = {A[0][0]}·{A[1][1]} − {A[0][1]}² = <b>{d}</b>.",
                f"(XᵀX)⁻¹ = (1/{d})·[[{Adj[0][0]}, {Adj[0][1]}], [{Adj[1][0]}, {Adj[1][1]}]]: se intercambia la diagonal y se cambia el signo de los demás elementos.",
                f"Xᵀy = (Σy, Σxy) = ({Xty[0]}, {Xty[1]}).",
                f"β̂ = (XᵀX)⁻¹Xᵀy = (1/{d})·({Adj[0][0]}·{Xty[0]} + ({Adj[0][1]})·{Xty[1]}, {Adj[1][0]}·{Xty[0]} + {Adj[1][1]}·{Xty[1]}) = <b>({b0}, {b1})</b>.",
                "Es el mismo resultado que con las fórmulas de la regresión simple: la notación matricial generaliza MCO.",
            ],
        )


# --------------------------------------------------------------------------------------------
# 10) Estadística descriptiva
# --------------------------------------------------------------------------------------------
DESC_CTX = ["minutos de espera en una consulta", "notas de un control (escala 1 a 7, × 10)", "ventas diarias de un kiosko (miles de $)",
            "precio de un mismo producto en distintas tiendas (cientos de $)", "goles por temporada de un equipo"]


def gen_descriptiva(k):
    n = rnd.choice([6, 7, 8, 9])
    base = rnd.randint(10, 40)
    datos = [base + rnd.randint(-8, 8) for _ in range(n)]
    atip = max(datos) + rnd.randint(25, 60)
    datos_a = datos[:-1] + [atip]
    rnd.shuffle(datos_a)
    srt = sorted(datos_a)
    med = Fr(srt[n // 2]) if n % 2 else Fr(srt[n // 2 - 1] + srt[n // 2], 2)
    media = Fr(sum(datos_a), n)
    var = sum((Fr(v) - media) ** 2 for v in datos_a) / (n - 1)
    sin = [v for v in datos_a if v != atip] if datos_a.count(atip) == 1 else datos_a[:-1]
    media_sin = Fr(sum(sin), len(sin))
    return dict(
        id=f"E{k + 1}", tipo="descriptiva", contexto=rnd.choice(DESC_CTX), datos=datos_a, atip=atip,
        preguntas=[
            dict(k="media", lab="Media", ans=r4(media), dec=2, pts=2),
            dict(k="mediana", lab="Mediana", ans=r4(med), dec=2, pts=3),
            dict(k="var", lab="Varianza muestral (n − 1)", ans=r4(var), dec=2, pts=3),
            dict(k="sd", lab="Desviación estándar", ans=r4(float(var) ** 0.5), dec=2, pts=2),
            dict(k="media_sin", lab=f"Media sin el atípico ({atip})", ans=r4(media_sin), dec=2, pts=2),
        ],
        solucion=[
            f"Datos ordenados: {', '.join(map(str, srt))}.",
            f"Media = {sum(datos_a)}/{n} = <b>{fmt(media, 3)}</b>.",
            (f"Mediana: con n = {n} impar, es el dato central (posición {n // 2 + 1}) = <b>{fmt(med, 2)}</b>." if n % 2 else
             f"Mediana: con n = {n} par, es el promedio de los datos en las posiciones {n // 2} y {n // 2 + 1} = ({srt[n // 2 - 1]} + {srt[n // 2]})/2 = <b>{fmt(med, 2)}</b>."),
            f"Varianza muestral = Σ(xᵢ − x̄)²/(n − 1) = {fmt(var * (n - 1), 3)}/{n - 1} = <b>{fmt(var, 3)}</b>; desviación estándar = √ = <b>{fmt(float(var) ** 0.5, 3)}</b>.",
            f"Sin el atípico, la media baja a <b>{fmt(media_sin, 3)}</b>, mientras la mediana casi no cambia: la media es sensible a los valores extremos (Ayudantía 1).",
        ],
    )


# --------------------------------------------------------------------------------------------
# 11) Tamaño muestral e intervalos para proporciones
# --------------------------------------------------------------------------------------------
import math


def gen_tamano(k):
    c = rnd.choice(list(Z))
    z = Z[c]
    tipo = k % 3
    if tipo == 0:
        sigma = rnd.choice([12, 15, 20, 25, 30, 40, 60])
        E = rnd.choice([2, 2.5, 3, 4, 5, 6])
        n = math.ceil((z * sigma / E) ** 2)
        return dict(id=f"T{k + 1}", tipo="tamano", sub="media", conf=c, sigma=sigma, E=E,
                    preguntas=[dict(k="n", lab="Tamaño muestral mínimo n", ans=n, dec=0, pts=4, exacto=True)],
                    solucion=[f"De E = z·σ/√n se despeja n = (z·σ/E)².",
                              f"n = ({z}·{sigma}/{E})² = {fmt((z * sigma / E) ** 2, 3)} ⇒ se redondea <b>hacia arriba</b>: n = <b>{n}</b>."])
    if tipo == 1:
        p = rnd.choice([0.5, 0.2, 0.3, 0.1, 0.15])
        E = rnd.choice([0.02, 0.03, 0.04, 0.05])
        n = math.ceil(z * z * p * (1 - p) / E ** 2)
        return dict(id=f"T{k + 1}", tipo="tamano", sub="prop_n", conf=c, p=p, E=E,
                    preguntas=[dict(k="n", lab="Tamaño muestral mínimo n", ans=n, dec=0, pts=4, exacto=True)],
                    solucion=[f"n = z²·p*(1 − p*)/E² = {z}²·{p}·{fmt(1 - p, 2)}/{E}² = {fmt(z * z * p * (1 - p) / E ** 2, 3)}.",
                              f"Se redondea hacia arriba: n = <b>{n}</b>." + (" Con p* = 0.5 es el peor escenario." if p == 0.5 else "")])
    n = rnd.choice([150, 200, 250, 300, 400, 500])
    x = rnd.randint(int(0.06 * n), int(0.45 * n))
    ph = x / n
    ee = (ph * (1 - ph) / n) ** 0.5
    return dict(id=f"T{k + 1}", tipo="tamano", sub="prop_ic", conf=c, x=x, n=n,
                preguntas=[dict(k="p", lab="p̂", ans=r4(ph), dec=3, pts=2),
                           dict(k="lo", lab="Límite inferior", ans=r4(ph - z * ee), dec=3, pts=3),
                           dict(k="hi", lab="Límite superior", ans=r4(ph + z * ee), dec=3, pts=3)],
                solucion=[f"p̂ = {x}/{n} = <b>{fmt(ph, 4)}</b>.",
                          f"Error estándar = √(p̂(1 − p̂)/n) = √({fmt(ph, 4)}·{fmt(1 - ph, 4)}/{n}) = {fmt(ee, 5)}.",
                          f"IC = p̂ ± {z}·{fmt(ee, 5)} = <b>({fmt(ph - z * ee, 4)}; {fmt(ph + z * ee, 4)})</b>."])


# --------------------------------------------------------------------------------------------
# 12) Comparar dos modelos con R² y R² ajustado
# --------------------------------------------------------------------------------------------
def gen_comparar(k):
    for _ in range(500):
        n = rnd.choice([12, 15, 18, 20, 25, 30])
        SST = rnd.choice([200, 250, 300, 400, 500, 800])
        kA, kB = rnd.choice([(1, 2), (1, 3), (2, 4), (2, 3), (1, 4)])
        SSRA = rnd.randint(int(0.3 * SST), int(0.8 * SST))
        SSRB = SSRA - rnd.randint(1, int(0.25 * SSRA))
        R2A, R2B = 1 - Fr(SSRA, SST), 1 - Fr(SSRB, SST)
        RaA = 1 - Fr(n - 1, n - kA - 1) * Fr(SSRA, SST)
        RaB = 1 - Fr(n - 1, n - kB - 1) * Fr(SSRB, SST)
        if abs(float(RaA - RaB)) < 0.005:
            continue
        mejor = "A" if RaA > RaB else "B"
        return dict(
            id=f"Q{k + 1}", tipo="comparar", n=n, SST=SST, kA=kA, kB=kB, SSRA=SSRA, SSRB=SSRB,
            preguntas=[
                dict(k="R2A", lab="R² del modelo A", ans=r4(R2A), dec=3, pts=2),
                dict(k="R2B", lab="R² del modelo B", ans=r4(R2B), dec=3, pts=2),
                dict(k="RaA", lab="R² ajustado de A", ans=r4(RaA), dec=3, pts=3),
                dict(k="RaB", lab="R² ajustado de B", ans=r4(RaB), dec=3, pts=3),
                dict(k="mejor", lab="¿Qué modelo prefiere el R² ajustado?", ans=mejor, opciones=["A", "B"], pts=3),
            ],
            solucion=[
                f"R²_A = 1 − {SSRA}/{SST} = <b>{fmt(R2A, 4)}</b>; R²_B = 1 − {SSRB}/{SST} = <b>{fmt(R2B, 4)}</b>. B tiene más variables y su R² es mayor, como siempre ocurre en modelos anidados.",
                f"R̄²_A = 1 − ({n - 1}/{n - kA - 1})·{SSRA}/{SST} = <b>{fmt(RaA, 4)}</b>.",
                f"R̄²_B = 1 − ({n - 1}/{n - kB - 1})·{SSRB}/{SST} = <b>{fmt(RaB, 4)}</b>.",
                (f"El R² ajustado prefiere <b>B</b>: la mejora en el ajuste compensa la penalización por {kB - kA} variable{'s' if kB - kA > 1 else ''} más." if mejor == "B" else
                 f"El R² ajustado prefiere <b>A</b>: las {kB - kA} variable{'s' if kB - kA > 1 else ''} extra de B no mejoran el ajuste lo suficiente para compensar la penalización."),
            ],
        )


def main():
    banco = dict(
        simple=[gen_simple(k) for k in range(24)],
        multi=[gen_multi(k) for k in range(20)],
        causal=[gen_causal(k) for k in range(16)],
        ovb=[gen_ovb(k) for k in range(20)],
        ic=[gen_ic(k) for k in range(16)],
        resumen=[gen_resumen(k) for k in range(16)],
        residuos=[gen_residuos(k) for k in range(16)],
        unidades=[gen_unidades(k) for k in range(16)],
        matriz2=[gen_matriz2(k) for k in range(16)],
        descriptiva=[gen_descriptiva(k) for k in range(16)],
        tamano=[gen_tamano(k) for k in range(18)],
        comparar=[gen_comparar(k) for k in range(16)],
    )
    js = ("/* ARCHIVO GENERADO por tools/practica_banco.py (verificado con tools/practica_verificar.R). No editar a mano. */\n"
          "window.PRACTICA_BANCO = " + json.dumps(banco, ensure_ascii=False) + ";\n")
    (REPO / "docs" / "javascripts" / "practica-banco.js").write_text(js, encoding="utf-8")
    (REPO / "tools" / "practica-banco.json").write_text(json.dumps(banco, ensure_ascii=False, indent=1), encoding="utf-8")
    print({k: len(v) for k, v in banco.items()})


if __name__ == "__main__":
    main()
