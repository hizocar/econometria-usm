// Quiz de fin de clase. Los estudiantes nunca leen las preguntas con pauta: esta función
// (con la clave secreta) entrega las preguntas sin respuestas mientras el quiz está abierto,
// controla el tiempo con el reloj del servidor, corrige y guarda un único intento por estudiante.
// La pauta se muestra recién cuando el docente cierra el quiz.
import { createClient } from "npm:@supabase/supabase-js@2.115.0";

const ORIGENES = ["https://hizocar.github.io"];
const cors = (req: Request) => {
  const o = req.headers.get("Origin") ?? "";
  const ok = ORIGENES.includes(o) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(o);
  return {
    "Access-Control-Allow-Origin": ok ? o : ORIGENES[0],
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};
const clave = (env: string, legacy: string) => {
  try { return JSON.parse(Deno.env.get(env) ?? "{}")["default"] ?? Deno.env.get(legacy); } catch { return Deno.env.get(legacy); }
};
const GRACIA_MS = 90_000; // margen para la entrega automática al acabarse el tiempo

type Pregunta = { id: string; tipo: "numero" | "opcion" | "vfi"; enunciado: string; opciones?: string[]; ans: number | string; tol?: number; dec?: number; exp?: string[]; repaso?: string };

const publica = (p: Pregunta) => ({ id: p.id, tipo: p.tipo, enunciado: p.enunciado, opciones: p.opciones ?? null, dec: p.dec ?? null });
const numero = (v: unknown) => {
  const t = String(v ?? "").trim().replace(/\s+/g, "").replace(",", ".").replace("−", "-");
  return t === "" || !/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(t) ? null : parseFloat(t);
};
function correcta(p: Pregunta, r: unknown) {
  if (r === undefined || r === null || r === "") return false;
  if (p.tipo === "numero") {
    const v = numero(r);
    const tol = Math.max(p.tol ?? 0, 0.5 * 10 ** -(p.dec ?? 2), 0.002 * Math.abs(Number(p.ans)));
    return v !== null && Math.abs(v - Number(p.ans)) <= tol + 1e-9;
  }
  if (p.tipo === "opcion") return Number(r) === Number(p.ans);
  return String(r) === String(p.ans);
}
const barajar = (n: number) => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

Deno.serve(async (req) => {
  const H = { ...cors(req), "Content-Type": "application/json" };
  const r = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: H });
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });
  if (req.method !== "POST") return r(405, { error: "Método no permitido." });

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return r(401, { error: "Ingresa con tu cuenta para rendir el quiz." });
  const url = Deno.env.get("SUPABASE_URL")!;
  const comoUsuario = createClient(url, clave("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: u, error: eu } = await comoUsuario.auth.getUser(auth.slice(7));
  if (eu || !u.user) return r(401, { error: "Tu sesión expiró. Vuelve a ingresar." });
  const uid = u.user.id;
  const db = createClient(url, clave("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return r(400, { error: "Solicitud inválida." }); }
  const accion = String(b.accion ?? "");

  if (accion === "lista") {
    const [{ data: qs }, { data: its }] = await Promise.all([
      db.from("econ_quizzes").select("id,titulo,clase,duracion_min,abierto,preguntas").order("clase", { ascending: false }),
      db.from("econ_quiz_intentos").select("quiz_id,entregado,limite,logro,correctas,total").eq("user_id", uid),
    ]);
    const mio = Object.fromEntries((its ?? []).map((x) => [x.quiz_id, x]));
    return r(200, { quizzes: (qs ?? []).map((q) => {
      const x = mio[q.id];
      return { id: q.id, titulo: q.titulo, clase: q.clase, duracion_min: q.duracion_min, abierto: q.abierto, preguntas: (q.preguntas as Pregunta[]).length,
        estado: !x ? "pendiente" : x.entregado ? "entregado" : "en_curso", logro: x?.entregado ? x.logro : null,
        correctas: x?.entregado ? x.correctas : null, total: x?.entregado ? x.total : null };
    }) });
  }

  const quizId = String(b.quiz ?? "");
  const { data: q } = await db.from("econ_quizzes").select("*").eq("id", quizId).maybeSingle();
  if (!q) return r(404, { error: "Ese quiz no existe." });
  const P = q.preguntas as Pregunta[];
  const { data: it } = await db.from("econ_quiz_intentos").select("*").eq("quiz_id", quizId).eq("user_id", uid).maybeSingle();

  const resultado = (x: Record<string, unknown>) => {
    const base = { estado: "entregado", correctas: x.correctas, total: x.total, logro: x.logro, fuera_de_tiempo: x.fuera_de_tiempo,
      entregado: x.entregado, inicio: x.inicio, pauta_disponible: !q.abierto };
    if (q.abierto) return base;
    const resp = (x.respuestas ?? {}) as Record<string, unknown>;
    return { ...base, pauta: (x.orden as number[]).map((i) => { const p = P[i]; return { ...publica(p), ans: p.ans, exp: p.exp ?? [], repaso: p.repaso ?? "", tu: resp[p.id] ?? null, ok: correcta(p, resp[p.id]) }; }) };
  };

  if (accion === "comenzar") {
    if (it?.entregado) return r(200, resultado(it));
    if (!q.abierto && !it) return r(403, { error: "El quiz no está abierto. Espera a que el profesor lo abra." });
    let x = it; // si ya lo había comenzado, puede terminarlo aunque el profesor lo cierre
    if (!x) {
      const orden = barajar(P.length);
      const limite = new Date(Date.now() + q.duracion_min * 60_000).toISOString();
      const ins = await db.from("econ_quiz_intentos").insert({ quiz_id: quizId, user_id: uid, limite, orden }).select("*").single();
      if (ins.error) {
        const otra = await db.from("econ_quiz_intentos").select("*").eq("quiz_id", quizId).eq("user_id", uid).maybeSingle(); // doble clic
        if (!otra.data) return r(500, { error: "No se pudo comenzar el quiz. Intenta de nuevo." });
        x = otra.data;
      } else x = ins.data;
    }
    return r(200, { estado: "en_curso", titulo: q.titulo, limite: x.limite, ahora: new Date().toISOString(),
      preguntas: (x.orden as number[]).map((i) => publica(P[i])) });
  }

  if (accion === "entregar") {
    if (!it) return r(400, { error: "No has comenzado este quiz." });
    if (it.entregado) return r(200, resultado(it));
    const resp = (typeof b.respuestas === "object" && b.respuestas) ? b.respuestas as Record<string, unknown> : {};
    const limpio: Record<string, string> = {};
    for (const p of P) if (resp[p.id] !== undefined && resp[p.id] !== null) limpio[p.id] = String(resp[p.id]).slice(0, 40);
    const oks = P.map((p) => correcta(p, limpio[p.id]));
    const correctas = oks.filter(Boolean).length;
    const ahora = Date.now();
    const upd = await db.from("econ_quiz_intentos").update({
      entregado: new Date(ahora).toISOString(), respuestas: limpio, correctas, total: P.length,
      logro: Math.round((1000 * correctas) / P.length) / 10, fuera_de_tiempo: ahora > new Date(it.limite).getTime() + GRACIA_MS,
      detalle: { aciertos: Object.fromEntries(P.map((p, i) => [p.id, oks[i] ? 1 : 0])), usados_seg: Math.round((ahora - new Date(it.inicio).getTime()) / 1000) },
    }).eq("id", it.id).is("entregado", null).select("*").single();
    if (upd.error || !upd.data) return r(500, { error: "No se pudo guardar tu entrega. Intenta de nuevo." });
    return r(200, resultado(upd.data));
  }

  if (accion === "resultado") {
    if (!it || !it.entregado) return r(200, { estado: it ? "en_curso" : "pendiente" });
    return r(200, resultado(it));
  }
  return r(400, { error: "Acción desconocida." });
});
