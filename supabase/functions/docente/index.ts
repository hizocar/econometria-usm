// Acciones del docente sobre cuentas de estudiantes: restablecer contraseña o eliminar la cuenta.
// Solo responde si quien llama tiene sesión y está en private.docentes (comprobado con RLS/RPC).
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
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  const H = { ...cors(req), "Content-Type": "application/json" };
  const r = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: H });
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });
  if (req.method !== "POST") return r(405, { error: "Método no permitido." });

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return r(401, { error: "Falta la sesión." });
  const url = Deno.env.get("SUPABASE_URL")!;
  const comoUsuario = createClient(url, clave("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } }, auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: u, error: eu } = await comoUsuario.auth.getUser(auth.slice(7));
  if (eu || !u.user) return r(401, { error: "Sesión inválida." });
  const { data: esDoc, error: ed } = await comoUsuario.rpc("econ_soy_docente");
  if (ed || esDoc !== true) return r(403, { error: "Solo el docente puede hacer esto." });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return r(400, { error: "Solicitud inválida." }); }
  const id = String(b.user_id ?? "");
  if (!UUID.test(id)) return r(400, { error: "Estudiante inválido." });
  if (id === u.user.id) return r(400, { error: "No puedes aplicar esta acción a tu propia cuenta." });

  const admin = createClient(url, clave("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  if (b.accion === "restablecer") {
    const pw = String(b.password ?? "");
    if (pw.length < 8 || pw.length > 72) return r(400, { error: "La contraseña temporal debe tener entre 8 y 72 caracteres." });
    const { error } = await admin.auth.admin.updateUserById(id, { password: pw });
    return error ? r(500, { error: "No se pudo restablecer." }) : r(200, { ok: true });
  }
  if (b.accion === "eliminar") {
    const { error } = await admin.auth.admin.deleteUser(id);
    return error ? r(500, { error: "No se pudo eliminar." }) : r(200, { ok: true });
  }
  return r(400, { error: "Acción desconocida." });
});
