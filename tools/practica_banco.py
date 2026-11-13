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


def main():
    banco = dict(
        simple=[gen_simple(k) for k in range(24)],
        multi=[gen_multi(k) for k in range(20)],
        causal=[gen_causal(k) for k in range(16)],
        ovb=[gen_ovb(k) for k in range(20)],
        ic=[gen_ic(k) for k in range(16)],
    )
    js = ("/* ARCHIVO GENERADO por tools/practica_banco.py (verificado con tools/practica_verificar.R). No editar a mano. */\n"
          "window.PRACTICA_BANCO = " + json.dumps(banco, ensure_ascii=False) + ";\n")
    (REPO / "docs" / "javascripts" / "practica-banco.js").write_text(js, encoding="utf-8")
    (REPO / "tools" / "practica-banco.json").write_text(json.dumps(banco, ensure_ascii=False, indent=1), encoding="utf-8")
    print({k: len(v) for k, v in banco.items()})


if __name__ == "__main__":
    main()
