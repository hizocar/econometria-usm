/* ==========================================================================
   cuentas.js — Cuentas de estudiantes para la Práctica (Supabase).
   - Con CONFIG vacío queda inactivo: la práctica funciona solo con el navegador.
   - Con CONFIG lleno: hay que ingresar para practicar; cada primer intento se guarda
     en econ_respuestas y el puntaje se reconstruye desde el servidor.
   - En la página del panel (.econ-panel) muestra el resumen docente.
   Solo usa la clave publicable: la seguridad la ponen las políticas RLS del proyecto.
   ========================================================================== */
(function () {
  "use strict";
  const CONFIG = { url: "https://zavmjmptlutvzkbygeeb.supabase.co", key: "sb_publishable_6KXY_ogDcVl7IsOnjhMHsg_h4TvdemR" };
  const SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.115.0/dist/umd/supabase.js";

  if (!CONFIG.url || !CONFIG.key) { window.EconCuentas = null; return; }

  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  let sbPromesa = null;
  function cliente() {
    if (!sbPromesa) {
      sbPromesa = new Promise((ok, mal) => {
        if (window.supabase?.createClient) return ok();
        const s = document.createElement("script");
        s.src = SDK; s.onload = ok; s.onerror = () => mal(new Error("No se pudo cargar el sistema de cuentas."));
        document.head.append(s);
      }).then(() => window.supabase.createClient(CONFIG.url, CONFIG.key, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: "econometria-usm-auth" },
      }));
    }
    return sbPromesa;
  }

  async function perfilActual(sb) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return null;
    const { data } = await sb.from("econ_perfiles").select("id,email,nombre,apellido").eq("id", session.user.id).maybeSingle();
    return data || { id: session.user.id, email: session.user.email, nombre: session.user.user_metadata?.nombre || "", apellido: "" };
  }

  /* ---------------------------- Formularios ---------------------------- */
  function formAcceso(caja, { soloIngreso = false, alEntrar }) {
    caja.innerHTML = "";
    const tabs = h("div", "pr-chips");
    const cuerpo = h("div", "pr-acceso-cuerpo");
    const modos = soloIngreso ? [["ingresar", "Ingresar"]] : [["ingresar", "Ingresar"], ["crear", "Crear cuenta"]];
    if (!soloIngreso) caja.append(tabs);
    caja.append(cuerpo);
    const pintar = (modo) => {
      tabs.querySelectorAll(".pr-chip").forEach((b) => b.classList.toggle("is-on", b.dataset.k === modo));
      const crear = modo === "crear";
      cuerpo.innerHTML =
        `<form class="pr-form pr-acceso" novalidate>` +
        (crear ? `<div class="pr-campo"><label>Nombre<input name="nombre" autocomplete="given-name" required maxlength="60"></label></div>` +
          `<div class="pr-campo"><label>Apellido<input name="apellido" autocomplete="family-name" required maxlength="60"></label></div>` : "") +
        `<div class="pr-campo"><label>Correo USM<input name="email" type="email" autocomplete="email" placeholder="nombre.apellido@usm.cl" required></label></div>` +
        `<div class="pr-campo"><label>Contraseña${crear ? " (mínimo 8 caracteres)" : ""}<input name="password" type="password" autocomplete="${crear ? "new-password" : "current-password"}" required minlength="8" maxlength="72"></label></div>` +
        (crear ? `<div class="pr-campo"><label>Repite la contraseña<input name="password2" type="password" autocomplete="new-password" required></label></div>` : "") +
        `<div class="pr-nav"><button class="econ-btn" type="submit">${crear ? "✨ Crear cuenta y empezar" : "➜ Ingresar"}</button></div>` +
        `<p class="pr-acceso-msg" aria-live="polite"></p>` +
        (crear ? `<p class="pr-nota">🔒 Tu nombre y tus respuestas quedan registrados para que el profesor sepa quién está practicando. Los puntajes de la práctica no son notas.</p>`
          : `<p class="pr-nota">¿Olvidaste tu contraseña? Pídele al profesor que la restablezca.</p>`) +
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
          alEntrar(sb);
        } catch (e) { decir(e.message || "Error de conexión."); btn.disabled = false; }
      });
    };
    modos.forEach(([k, lab]) => { const b = h("button", "pr-chip", lab); b.type = "button"; b.dataset.k = k; b.addEventListener("click", () => pintar(k)); tabs.append(b); });
    pintar("ingresar");
  }

  function barraSesion(caja, sb, p) {
    caja.innerHTML = "";
    const t = h("span", "pr-sesion-t", `👤 <strong>${esc(p.nombre)} ${esc(p.apellido)}</strong> <span class="pr-sesion-mail">${esc(p.email)}</span>`);
    const cambiar = h("button", "econ-btn econ-btn-ghost econ-btn-sm", "🔑 Cambiar contraseña");
    const salir = h("button", "econ-btn econ-btn-ghost econ-btn-sm", "Cerrar sesión");
    [cambiar, salir].forEach((b) => (b.type = "button"));
    const zona = h("div", "pr-sesion-extra");
    salir.addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });
    cambiar.addEventListener("click", () => {
      zona.innerHTML = `<form class="pr-form pr-acceso"><div class="pr-campo"><label>Nueva contraseña (mínimo 8)<input name="p" type="password" autocomplete="new-password" minlength="8" maxlength="72" required></label></div>` +
        `<div class="pr-nav"><button class="econ-btn econ-btn-sm" type="submit">Guardar</button></div><p class="pr-acceso-msg" aria-live="polite"></p></form>`;
      const f = zona.querySelector("form"), msg = zona.querySelector(".pr-acceso-msg");
      f.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const pw = f.p.value;
        if (pw.length < 8) { msg.textContent = "Debe tener al menos 8 caracteres."; msg.className = "pr-acceso-msg is-bad"; return; }
        const { error } = await sb.auth.updateUser({ password: pw });
        msg.textContent = error ? "No se pudo cambiar. Intenta de nuevo." : "✓ Contraseña actualizada.";
        msg.className = "pr-acceso-msg " + (error ? "is-bad" : "is-ok");
        if (!error) f.querySelector("button").disabled = true;
      });
    });
    const fila = h("div", "pr-sesion-fila");
    fila.append(t, cambiar, salir);
    caja.append(fila, zona);
  }

  /* ---------------------------- Práctica ---------------------------- */
  // practica.js llama a cuandoSesion(bloque, cb): muestra el acceso y, al ingresar, entrega
  // el usuario y sus respuestas del bloque (ordenadas) para reconstruir el puntaje.
  function cuandoSesion(bloque, cb) {
    const m = document.querySelector(".pr-marcador");
    if (!m) return;
    document.querySelectorAll(".pr-cuenta").forEach((x) => x.remove());
    const caja = h("div", "pr-cuenta");
    m.before(caja);
    document.body.classList.add("pr-bloqueado");
    caja.innerHTML = '<p class="pr-nota">Cargando tu cuenta…</p>';
    const entrar = async (sb) => {
      const p = await perfilActual(sb);
      if (!p) return formAcceso(caja, { alEntrar: entrar });
      const { data, error } = await sb.from("econ_respuestas").select("tipo,item,correcta,puntos,creado")
        .eq("user_id", p.id).eq("bloque", +bloque).order("creado", { ascending: true }).limit(1000);
      barraSesion(caja, sb, p);
      if (error) caja.append(h("p", "pr-acceso-msg is-bad", "No se pudo cargar tu historial; tus nuevas respuestas sí se guardarán."));
      document.body.classList.remove("pr-bloqueado");
      cb({ id: p.id }, data || []);
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

  window.EconCuentas = { activo: true, cuandoSesion, guardar, cliente, perfilActual, formAcceso, barraSesion, esc, h, url: CONFIG.url, key: CONFIG.key };
})();
