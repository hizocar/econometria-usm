/* ==========================================================================
   cuentas.js — Cuentas de estudiantes para la Práctica (Supabase).
   - Con CONFIG vacío queda inactivo: la práctica funciona solo con el navegador.
   - Con CONFIG lleno: hay que ingresar para practicar; cada primer intento se guarda
     en econ_respuestas y el puntaje se reconstruye desde el servidor.
   - Con la sesión iniciada registra las conexiones (econ_sesiones): página, hora de
     entrada y minutos activos (un "latido" por minuto con la pestaña visible y en uso).
   Solo usa la clave publicable: la seguridad la ponen las políticas RLS del proyecto.
   ========================================================================== */
(function () {
  "use strict";
  const CONFIG = { url: "https://zavmjmptlutvzkbygeeb.supabase.co", key: "sb_publishable_6KXY_ogDcVl7IsOnjhMHsg_h4TvdemR" };
  const SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.115.0/dist/umd/supabase.js";
  const CLAVE_AUTH = "econometria-usm-auth";

  if (!CONFIG.url || !CONFIG.key) { window.EconCuentas = null; return; }

  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const raiz = () => { try { return new URL(window.__md_scope || "/", location.href); } catch (e) { return new URL("/", location.href); } };

  let sbPromesa = null;
  function cliente() {
    if (!sbPromesa) {
      sbPromesa = new Promise((ok, mal) => {
        if (window.supabase?.createClient) return ok();
        const s = document.createElement("script");
        s.src = SDK; s.onload = ok; s.onerror = () => mal(new Error("No se pudo cargar el sistema de cuentas. Revisa tu conexión y recarga la página."));
        document.head.append(s);
      }).then(() => window.supabase.createClient(CONFIG.url, CONFIG.key, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: CLAVE_AUTH },
      }));
    }
    return sbPromesa;
  }
  const haySesionGuardada = () => { try { return !!localStorage.getItem(CLAVE_AUTH); } catch (e) { return false; } };

  async function perfilActual(sb) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return null;
    const { data } = await sb.from("econ_perfiles").select("id,email,nombre,apellido").eq("id", session.user.id).maybeSingle();
    return data || { id: session.user.id, email: session.user.email, nombre: session.user.user_metadata?.nombre || "", apellido: "" };
  }

  let docenteCache = null;
  async function esDocente(sb) {
    if (docenteCache === null) { const { data } = await sb.rpc("econ_soy_docente"); docenteCache = data === true; }
    return docenteCache;
  }

  /* ---------------------------- Formularios ---------------------------- */
  function formAcceso(caja, { soloIngreso = false, alEntrar }) {
    caja.innerHTML = "";
    caja.classList.add("is-acceso");
    const intro = h("div", "pr-acceso-intro", soloIngreso ? "<strong>Ingresa con tu cuenta</strong>"
      : "<strong>Ingresa para practicar</strong><span>Tu avance queda guardado y lo retomas desde cualquier dispositivo.</span>");
    const tabs = h("div", "pr-seg");
    const cuerpo = h("div", "pr-acceso-cuerpo");
    const modos = soloIngreso ? [["ingresar", "Ingresar"]] : [["ingresar", "Ya tengo cuenta"], ["crear", "Crear cuenta"]];
    caja.append(intro);
    if (!soloIngreso) caja.append(tabs);
    caja.append(cuerpo);
    const pintar = (modo) => {
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === modo));
      const crear = modo === "crear";
      cuerpo.innerHTML =
        `<form class="pr-acceso" novalidate>` +
        (crear ? `<label class="pr-in">Nombre<input name="nombre" autocomplete="given-name" required maxlength="60"></label>` +
          `<label class="pr-in">Apellido<input name="apellido" autocomplete="family-name" required maxlength="60"></label>` : "") +
        `<label class="pr-in pr-in-full">Correo USM<input name="email" type="email" autocomplete="email" placeholder="nombre.apellido@usm.cl" required></label>` +
        `<label class="pr-in">Contraseña${crear ? " (mínimo 8 caracteres)" : ""}<input name="password" type="password" autocomplete="${crear ? "new-password" : "current-password"}" required minlength="8" maxlength="72"></label>` +
        (crear ? `<label class="pr-in">Repite la contraseña<input name="password2" type="password" autocomplete="new-password" required></label>` : "") +
        `<div class="pr-acceso-pie"><button class="econ-btn" type="submit">${crear ? "Crear cuenta" : "Ingresar"}</button>` +
        `<p class="pr-acceso-msg" aria-live="polite"></p></div>` +
        (crear ? `<p class="pr-nota pr-in-full">Se registran tu nombre, tus respuestas y cuándo y cuánto tiempo usas el sitio con la sesión iniciada, para que el profesor sepa quién está practicando. Los puntajes de la práctica no son notas.</p>`
          : `<p class="pr-nota pr-in-full">¿Olvidaste tu contraseña? Pídele al profesor que la restablezca.</p>`) +
        `</form>`;
      const f = cuerpo.querySelector("form"), msg = cuerpo.querySelector(".pr-acceso-msg"), btn = f.querySelector("button");
      f.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const d = Object.fromEntries(new FormData(f));
        const decir = (t, ok) => { msg.textContent = t; msg.className = "pr-acceso-msg " + (ok ? "is-ok" : "is-bad"); };
        if (crear && d.password !== d.password2) return decir("Las contraseñas no coinciden.");
        btn.disabled = true; decir(crear ? "Creando tu cuenta…" : "Ingresando…", true);
        try {
          const sb = await cliente();
          const email = String(d.email || "").trim().toLowerCase();
          if (crear) {
            const res = await fetch(`${CONFIG.url}/functions/v1/registro`, {
              method: "POST", headers: { "Content-Type": "application/json", apikey: CONFIG.key },
              body: JSON.stringify({ email, nombre: d.nombre, apellido: d.apellido, password: d.password }),
            });
            const j = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(j.error || "No se pudo crear la cuenta.");
          }
          const { error } = await sb.auth.signInWithPassword({ email, password: d.password });
          if (error) throw new Error(/invalid/i.test(error.message) ? "Correo o contraseña incorrectos." : "No se pudo ingresar. Intenta de nuevo.");
          caja.classList.remove("is-acceso");
          seguimiento();
          alEntrar(sb);
        } catch (e) { decir(e.message || "Error de conexión."); btn.disabled = false; }
      });
    };
    modos.forEach(([k, lab]) => { const b = h("button", "", lab); b.type = "button"; b.dataset.k = k; b.addEventListener("click", () => pintar(k)); tabs.append(b); });
    pintar("ingresar");
  }

  function barraSesion(caja, sb, p) {
    caja.innerHTML = "";
    caja.classList.remove("is-acceso");
    const iniciales = ((p.nombre || "?").charAt(0) + (p.apellido || "").charAt(0)).toUpperCase();
    const t = h("div", "pr-sesion-t", `<span class="pr-avatar" aria-hidden="true">${esc(iniciales)}</span>` +
      `<span><strong>${esc(p.nombre)} ${esc(p.apellido)}</strong><span class="pr-sesion-mail">${esc(p.email)}</span></span>`);
    const acciones = h("div", "pr-sesion-acc");
    const cambiar = h("button", "econ-btn econ-btn-ghost econ-btn-sm", "Cambiar contraseña");
    const salir = h("button", "econ-btn econ-btn-ghost econ-btn-sm", "Cerrar sesión");
    [cambiar, salir].forEach((b) => (b.type = "button"));
    acciones.append(cambiar, salir);
    const zona = h("div", "pr-sesion-extra");
    salir.addEventListener("click", async () => { await cerrarVisita(); await sb.auth.signOut(); location.reload(); });
    cambiar.addEventListener("click", () => {
      if (zona.innerHTML) { zona.innerHTML = ""; return; }
      zona.innerHTML = `<form class="pr-acceso"><label class="pr-in">Nueva contraseña (mínimo 8)<input name="p" type="password" autocomplete="new-password" minlength="8" maxlength="72" required></label>` +
        `<div class="pr-acceso-pie"><button class="econ-btn econ-btn-sm" type="submit">Guardar contraseña</button><p class="pr-acceso-msg" aria-live="polite"></p></div></form>`;
      const f = zona.querySelector("form"), msg = zona.querySelector(".pr-acceso-msg");
      f.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const pw = f.p.value;
        if (pw.length < 8) { msg.textContent = "Debe tener al menos 8 caracteres."; msg.className = "pr-acceso-msg is-bad"; return; }
        const { error } = await sb.auth.updateUser({ password: pw });
        msg.textContent = error ? "No se pudo cambiar. Intenta de nuevo." : "Contraseña actualizada.";
        msg.className = "pr-acceso-msg " + (error ? "is-bad" : "is-ok");
        if (!error) f.querySelector("button").disabled = true;
      });
    });
    const fila = h("div", "pr-sesion-fila");
    fila.append(t, acciones);
    caja.append(fila, zona);
    esDocente(sb).then((doc) => {
      if (!doc || location.pathname.replace(/\/$/, "").endsWith("/admin")) return;
      const a = h("a", "econ-btn econ-btn-sm", "📊 Panel docente");
      a.href = new URL("admin/", raiz()).href;
      acciones.prepend(a);
    }).catch(() => {});
  }

  /* ---------------------------- Práctica ---------------------------- */
  // practica.js llama a cuandoSesion(contenedor, bloque, cb): muestra el acceso dentro del contenedor y,
  // al ingresar, entrega el usuario y sus datos del bloque: respuestas (ordenadas), precertámenes y conexiones.
  function cuandoSesion(cont, bloque, cb) {
    const caja = h("div", "pr-cuenta");
    cont.prepend(caja);
    caja.innerHTML = '<p class="pr-nota">Cargando tu cuenta…</p>';
    const entrar = async (sb) => {
      const p = await perfilActual(sb);
      if (!p) return formAcceso(caja, { alEntrar: entrar });
      const [r1, r2, r3] = await Promise.all([
        sb.from("econ_respuestas").select("tipo,item,tema,correcta,puntos,creado").eq("user_id", p.id).eq("bloque", +bloque)
          .order("creado", { ascending: true }).limit(1000),
        sb.from("econ_simulacros").select("id,modo,inicio,fin,limite_min,preguntas,correctas,logro,puntos,detalle").eq("user_id", p.id).eq("bloque", +bloque)
          .order("fin", { ascending: false }).limit(50),
        sb.from("econ_sesiones").select("inicio,activo_seg,bloque").eq("user_id", p.id)
          .gte("inicio", new Date(Date.now() - 60 * 864e5).toISOString()).order("inicio", { ascending: true }).limit(1000),
      ]);
      barraSesion(caja, sb, p);
      if (r1.error) caja.append(h("p", "pr-acceso-msg is-bad", "No se pudo cargar tu historial; tus nuevas respuestas sí se guardarán."));
      cb({ id: p.id, nombre: p.nombre }, { filas: r1.data || [], simulacros: r2.error ? [] : r2.data || [], sesiones: r3.error ? [] : r3.data || [] });
    };
    cliente().then(entrar).catch((e) => { caja.innerHTML = `<p class="pr-acceso-msg is-bad">${esc(e.message)}</p>`; });
  }

  const pendientes = [];
  async function guardar(r) {
    try {
      const sb = await cliente();
      const { error } = await sb.from("econ_respuestas").insert(r);
      if (error && error.code !== "23505") throw error; // 23505: ya estaba (primer intento ya registrado)
    } catch (e) {
      pendientes.push(r);
      setTimeout(() => { const x = pendientes.shift(); if (x) guardar(x); }, 15000);
    }
  }

  async function guardarSimulacro(reg) {
    try {
      const sb = await cliente();
      const { error } = await sb.from("econ_simulacros").insert(reg);
      return !error;
    } catch (e) { return false; }
  }

  /* ---------------------------- Conexiones ---------------------------- */
  // Una visita por página vista. Cuenta un minuto activo solo si la pestaña está visible
  // y hubo actividad (clic, tecla, scroll) en los últimos 2 minutos.
  let visita = null, ultimaAccion = Date.now();
  ["pointerdown", "keydown", "scroll", "pointermove", "touchstart"].forEach((ev) =>
    addEventListener(ev, () => { ultimaAccion = Date.now(); }, { passive: true, capture: true }));

  async function latido(final) {
    if (!visita || !visita.id) return;
    const ahora = Date.now();
    const activo = document.visibilityState === "visible" && ahora - ultimaAccion < 120000;
    if (activo) visita.seg += Math.min(75, Math.round((ahora - visita.marca) / 1000));
    visita.marca = ahora;
    if (!activo && !final) return;
    try { await visita.sb.from("econ_sesiones").update({ activo_seg: visita.seg }).eq("id", visita.id); } catch (e) { /* sin red: se reintenta en el próximo latido */ }
  }
  async function cerrarVisita() {
    if (!visita) return;
    clearInterval(visita.timer);
    await latido(true);
    visita = null;
  }
  async function seguimiento() {
    if (!haySesionGuardada()) return;
    await cerrarVisita();
    try {
      const sb = await cliente();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return;
      const base = raiz().pathname;
      let pagina = location.pathname.startsWith(base) ? location.pathname.slice(base.length) : location.pathname;
      pagina = (pagina || "inicio").slice(0, 120);
      const app = document.querySelector(".pr-app");
      const bloque = app && /^[123]$/.test(app.dataset.bloque || "") ? +app.dataset.bloque : null;
      const { data, error } = await sb.from("econ_sesiones").insert({ pagina, bloque }).select("id").single();
      if (error || !data) return;
      visita = { sb, id: data.id, seg: 0, marca: Date.now(), timer: setInterval(() => latido(false), 60000) };
    } catch (e) { /* el monitoreo nunca bloquea el sitio */ }
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") latido(true); else if (visita) visita.marca = Date.now(); });
  if (typeof document$ !== "undefined") document$.subscribe(() => seguimiento());
  else document.addEventListener("DOMContentLoaded", () => seguimiento());

  window.EconCuentas = { activo: true, cuandoSesion, guardar, guardarSimulacro, cliente, perfilActual, esDocente, formAcceso, barraSesion, esc, h, url: CONFIG.url, key: CONFIG.key };
})();
