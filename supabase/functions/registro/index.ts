// Registro de estudiantes de la Práctica: crea la cuenta ya confirmada (sin correo de verificación,
// porque el SMTP por defecto de Supabase solo permite unos pocos correos por hora) y su perfil.
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
const secreto = () => {
  try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}")["default"]; } catch { return undefined; }
};

const CORREO = /^[a-z0-9._%+-]{1,64}@(usm\.cl|sansano\.usm\.cl|alumnos\.usm\.cl)$/;
const limpiar = (s: unknown) => String(s ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
const NOMBRE = /^[\p{L}][\p{L}\p{M}' .-]{0,59}$/u;

Deno.serve(async (req) => {
  const H = { ...cors(req), "Content-Type": "application/json" };
  const r = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: H });
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });
  if (req.method !== "POST") return r(405, { error: "Método no permitido." });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return r(400, { error: "Solicitud inválida." }); }
  const email = limpiar(b.email).toLowerCase();
  const nombre = limpiar(b.nombre), apellido = limpiar(b.apellido);
  const password = String(b.password ?? "");

  if (!CORREO.test(email)) return r(400, { error: "Usa tu correo institucional de la USM (termina en @usm.cl o @sansano.usm.cl)." });
  if (!NOMBRE.test(nombre) || !NOMBRE.test(apellido)) return r(400, { error: "Escribe tu nombre y apellido (solo letras)." });
  if (password.length < 8 || password.length > 72) return r(400, { error: "La contraseña debe tener entre 8 y 72 caracteres." });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, secreto() ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { nombre, apellido },
  });
  if (error || !data.user) {
    const dup = /already|registered|exists/i.test(error?.message ?? "");
    return r(dup ? 409 : 500, {
      error: dup ? "Ese correo ya tiene una cuenta. Ingresa con tu contraseña; si no la recuerdas, pídele al profesor que la restablezca."
        : "No se pudo crear la cuenta. Intenta de nuevo en unos minutos.",
    });
  }
  const { error: e2 } = await admin.from("econ_perfiles").insert({ id: data.user.id, email, nombre, apellido });
  if (e2) {
    await admin.auth.admin.deleteUser(data.user.id);
    return r(500, { error: "No se pudo crear el perfil. Intenta de nuevo." });
  }
  return r(200, { ok: true });
});
