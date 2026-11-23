/* ==========================================================================
   quiz.js — Quiz de fin de clase (20 minutos, un intento, misma cuenta de la práctica).
   Las preguntas y la corrección viven en el servidor (Edge Function "quiz"): aquí solo se
   muestran las preguntas sin pauta, se guarda el avance en el navegador por si se recarga
   y se entrega. La pauta aparece cuando el profesor cierra el quiz.
   ========================================================================== */
(function () {
  "use strict";
  const VERED = { V: "Verdadero", F: "Falso", I: "Incierto" };
  const coma = (x) => String(x).replace(".", ",");
  const mmss = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const notaRef = (l) => Math.round(10 * (l < 60 ? 1 + (3 * l) / 60 : 4 + (3 * (l - 60)) / 40)) / 10;
  const claveLocal = (quiz, uid) => `econometria-usm:quiz:${quiz}:${uid}`;
  const leer = (k) => { try { return JSON.parse(localStorage.getItem(k) || "{}"); } catch (e) { return {}; } };
  // MathJax solo procesa elementos con la clase "arithmatex" (ver mathjax.js): todo texto con fórmulas va envuelto así
  const M = (html) => `<span class="arithmatex">${html ?? ""}</span>`;
  function tipografiar(el, intentos = 0) {
    const mj = window.MathJax;
    if (mj && mj.typesetPromise) { mj.typesetPromise([el]).catch(() => {}); return; }
    if (intentos < 40) setTimeout(() => tipografiar(el, intentos + 1), 250); // MathJax aún cargando
  }
  const numTxt = (v) => String(v).replace(".", ",");
  const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };

  function montar(root) {
    const C = window.EconCuentas;
    root.innerHTML = "";
    const app = document.createElement("div");
    app.className = "pr-app qz";
    app.dataset.ok = "1"; // que practica.js no lo monte como práctica
    root.append(app);
    if (!C) { app.innerHTML = '<p class="pr-acceso-msg is-bad">Las cuentas no están configuradas.</p>'; return; }
    const { h, esc } = C;
    const caja = h("div", "pr-cuenta");
    const vista = h("div", "qz-vista");
    app.append(caja, vista);
    let sb = null, perfil = null;

    async function api(cuerpo) {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw new Error("Tu sesión expiró. Vuelve a ingresar.");
      const res = await fetch(`${C.url}/functions/v1/quiz`, {
        method: "POST", headers: { "Content-Type": "application/json", apikey: C.key, Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(cuerpo),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "No se pudo conectar con el servidor.");
      return j;
    }
    const error = (e) => { vista.innerHTML = ""; vista.append(h("p", "pr-acceso-msg is-bad", esc(e.message || String(e)))); vista.append(boton("econ-btn econ-btn-ghost", "Volver a la lista", lista)); };
    const boton = (cls, html, fn) => { const b = h("button", cls, html); b.type = "button"; if (fn) b.addEventListener("click", fn); return b; };

    const entrar = async (cliente) => {
      sb = cliente;
      perfil = await C.perfilActual(sb);
      if (!perfil) return C.formAcceso(caja, { alEntrar: entrar });
      C.barraSesion(caja, sb, perfil);
      lista();
    };
    caja.innerHTML = '<p class="pr-nota">Cargando tu cuenta…</p>';
    C.cliente().then(entrar).catch(error);

    /* ---------- Lista de quizzes ---------- */
    async function lista() {
      vista.innerHTML = '<p class="pr-nota">Buscando quizzes…</p>';
      let j;
      try { j = await api({ accion: "lista" }); } catch (e) { return error(e); }
      vista.innerHTML = "";
      if (!j.quizzes.length) { vista.append(h("p", "pr-nota", "Todavía no hay quizzes publicados.")); return; }
      const abiertos = j.quizzes.filter((q) => q.abierto && q.estado !== "entregado");
      vista.append(h("p", "qz-cab", abiertos.length ? `Hay <strong>${abiertos.length === 1 ? "un quiz abierto" : abiertos.length + " quizzes abiertos"}</strong> ahora.`
        : "No hay quizzes abiertos en este momento. El profesor los abre al final de la clase."));
      const grid = h("div", "pr-grid");
      j.quizzes.forEach((q) => {
        const card = h("article", "pr-tema qz-card" + (q.abierto && q.estado !== "entregado" ? " is-abierto" : ""));
        const estado = q.estado === "entregado" ? `Entregado: <strong>${coma(q.logro)}%</strong> (${q.correctas} de ${q.total})`
          : q.estado === "en_curso" ? "Comenzado, sin entregar" : q.abierto ? "Abierto ahora" : "Cerrado";
        card.innerHTML = `<p class="pr-tema-clase">Clase ${q.clase ?? ""}</p><h3 class="pr-tema-t">${esc(q.titulo)}</h3>` +
          `<p class="pr-tema-d">${q.preguntas} preguntas, ${q.duracion_min} minutos, un solo intento.</p>` +
          `<p class="qz-estado">${q.abierto && q.estado !== "entregado" ? '<span class="qz-punto" aria-hidden="true"></span>' : ""}${estado}</p>`;
        if (q.estado === "entregado") card.append(boton("econ-btn econ-btn-ghost pr-tema-btn", "Ver resultado", () => resultado(q)));
        else if (q.estado === "en_curso") card.append(boton("econ-btn pr-tema-btn", "Continuar", () => comenzar(q)));
        else if (q.abierto) card.append(boton("econ-btn econ-btn-gold pr-tema-btn", "Comenzar", () => intro(q)));
        grid.append(card);
      });
      vista.append(grid, boton("econ-btn econ-btn-ghost qz-recargar", "Actualizar", lista));
    }

    /* ---------- Antes de comenzar ---------- */
    function intro(q) {
      vista.innerHTML = "";
      const box = h("section", "qz-intro");
      box.innerHTML = `<h3>${esc(q.titulo)}</h3><ul>` +
        `<li>Tienes <strong>${q.duracion_min} minutos</strong> desde que presiones Comenzar; el tiempo lo controla el servidor.</li>` +
        `<li>Son <strong>${q.preguntas} preguntas</strong> y tienes <strong>un solo intento</strong>. Puedes moverte entre ellas y cambiar respuestas hasta entregar.</li>` +
        `<li>Si se acaba el tiempo, se entrega lo que hayas respondido.</li>` +
        `<li>Si se corta la conexión o recargas la página, vuelve aquí y presiona Continuar: tus respuestas quedan guardadas en este navegador.</li>` +
        `<li>Ten a mano lápiz, papel y calculadora. La pauta se publica cuando el profesor cierre el quiz.</li></ul>`;
      const nav = h("div", "pr-nav");
      nav.append(boton("econ-btn econ-btn-gold", "Comenzar ahora", () => comenzar(q)), boton("econ-btn econ-btn-ghost", "Volver", lista));
      box.append(nav);
      vista.append(box);
    }

    /* ---------- Rendir ---------- */
    let reloj = null;
    async function comenzar(q) {
      vista.innerHTML = '<p class="pr-nota">Preparando el quiz…</p>';
      let j;
      try { j = await api({ accion: "comenzar", quiz: q.id }); } catch (e) { return error(e); }
      if (j.estado === "entregado") return mostrarResultado(q, j);
      const desfase = Date.now() - new Date(j.ahora).getTime();
      const fin = new Date(j.limite).getTime() + desfase;
      const k = claveLocal(q.id, perfil.id);
      const resp = leer(k);
      let actual = 0, entregando = false;
      vista.innerHTML = "";
      const barra = h("div", "pr-pre-barra");
      barra.innerHTML = `<div class="pr-reloj" role="timer" aria-label="Tiempo restante"><strong class="pr-reloj-t">${mmss(fin - Date.now())}</strong><span class="pr-k">restantes</span></div>` +
        '<div class="pr-pre-nav" role="group" aria-label="Preguntas"></div>';
      const entregar = boton("econ-btn econ-btn-gold pr-entregar", "Entregar");
      barra.append(entregar);
      const aviso = h("p", "pr-sr"); aviso.setAttribute("aria-live", "polite");
      const panel = h("div", "pr-pre-panel");
      const pie = h("div", "pr-nav pr-pre-pie");
      const prev = boton("econ-btn econ-btn-ghost", "Anterior", () => mostrar(actual - 1));
      const next = boton("econ-btn", "Siguiente", () => mostrar(actual + 1));
      pie.append(prev, next);
      vista.append(barra, aviso, panel, pie);
      const navG = barra.querySelector(".pr-pre-nav");
      const guardarLocal = () => escribir(k, resp);
      const respondida = (p) => resp[p.id] !== undefined && String(resp[p.id]).trim() !== "";

      const panes = j.preguntas.map((p, i) => {
        const card = h("article", "pr-card pr-pre-preg");
        card.hidden = true;
        card.innerHTML = `<div class="pr-meta"><span>Pregunta ${i + 1} de ${j.preguntas.length}</span></div><div class="pr-stmt">${M(p.enunciado)}</div>`;
        if (p.tipo === "vfi" || p.tipo === "opcion") {
          const ops = h("div", p.tipo === "vfi" ? "pr-vfi" : "qz-opciones");
          const valores = p.tipo === "vfi" ? ["V", "F", "I"] : p.opciones.map((_, n) => String(n));
          valores.forEach((val, n) => {
            const lab = p.tipo === "vfi" ? `<kbd>${val}</kbd>${VERED[val]}` : `<span class="qz-letra">${"abcdef"[n]}</span>${M(p.opciones[n])}`;
            const b = boton(p.tipo === "vfi" ? "pr-vfi-btn" : "qz-opcion", lab, () => {
              resp[p.id] = resp[p.id] === val ? "" : val;
              ops.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.v === resp[p.id]));
              guardarLocal(); pintarNav();
            });
            b.dataset.v = val;
            b.setAttribute("aria-pressed", resp[p.id] === val);
            ops.append(b);
          });
          card.append(ops);
        } else {
          const campo = h("div", "pr-campo qz-num");
          campo.innerHTML = `<label>Tu respuesta${p.unidad ? ` (en ${esc(p.unidad)})` : ""}<input type="text" inputmode="decimal" autocomplete="off" placeholder="número (coma o punto)"></label>`;
          const inp = campo.querySelector("input");
          if (resp[p.id] !== undefined) inp.value = resp[p.id];
          inp.addEventListener("input", () => { resp[p.id] = inp.value; guardarLocal(); pintarNav(); });
          inp.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && !next.disabled) { ev.preventDefault(); next.click(); } });
          card.append(campo);
        }
        panel.append(card);
        return card;
      });
      function pintarNav() {
        navG.innerHTML = "";
        j.preguntas.forEach((p, i) => {
          const b = boton("pr-pre-celda" + (respondida(p) ? " is-resp" : "") + (i === actual ? " is-actual" : ""), String(i + 1), () => mostrar(i));
          b.setAttribute("aria-label", `Pregunta ${i + 1}${respondida(p) ? ", respondida" : ", sin responder"}`);
          if (i === actual) b.setAttribute("aria-current", "step");
          navG.append(b);
        });
      }
      function mostrar(i) {
        actual = Math.max(0, Math.min(panes.length - 1, i));
        panes.forEach((p, n) => (p.hidden = n !== actual));
        prev.disabled = actual === 0;
        next.disabled = actual === panes.length - 1;
        pintarNav();
      }
      mostrar(0);
      tipografiar(panel);

      async function enviar(porTiempo) {
        if (entregando) return;
        entregando = true;
        clearInterval(reloj);
        entregar.disabled = true;
        entregar.textContent = "Entregando…";
        try {
          const r = await api({ accion: "entregar", quiz: q.id, respuestas: resp });
          removeEventListener("beforeunload", noSalir);
          try { localStorage.removeItem(k); } catch (e) { /* nada */ }
          mostrarResultado(q, r, porTiempo);
        } catch (e) {
          entregando = false;
          entregar.disabled = false;
          entregar.textContent = "Reintentar entrega";
          aviso.textContent = "";
          vista.prepend(h("p", "pr-acceso-msg is-bad", `${esc(e.message)} Tus respuestas siguen guardadas: presiona "Reintentar entrega".`));
        }
      }
      let armado = false;
      entregar.addEventListener("click", () => {
        const faltan = j.preguntas.filter((p) => !respondida(p)).length;
        if (faltan && !armado) {
          armado = true;
          entregar.textContent = `${faltan} sin responder: toca otra vez para entregar`;
          setTimeout(() => { armado = false; if (!entregando) entregar.textContent = "Entregar"; }, 4000);
          return;
        }
        enviar(false);
      });
      let avisado5 = false, avisado1 = false;
      const tic = () => {
        if (!vista.isConnected) return clearInterval(reloj);
        const resta = fin - Date.now();
        barra.querySelector(".pr-reloj-t").textContent = mmss(resta);
        barra.classList.toggle("is-alerta", resta < 5 * 60000);
        if (!avisado5 && resta < 5 * 60000) { avisado5 = true; aviso.textContent = "Quedan 5 minutos."; }
        if (!avisado1 && resta < 60000) { avisado1 = true; aviso.textContent = "Queda 1 minuto."; }
        if (resta <= 0) enviar(true);
      };
      clearInterval(reloj);
      reloj = setInterval(tic, 1000);
      addEventListener("beforeunload", noSalir);
      tic();
    }
    function noSalir(ev) { ev.preventDefault(); ev.returnValue = ""; }

    /* ---------- Resultado y pauta ---------- */
    async function resultado(q) {
      vista.innerHTML = '<p class="pr-nota">Cargando tu resultado…</p>';
      try { mostrarResultado(q, await api({ accion: "resultado", quiz: q.id })); } catch (e) { error(e); }
    }
    function mostrarResultado(q, r, porTiempo) {
      vista.innerHTML = "";
      const res = h("section", "pr-res");
      res.innerHTML = `<div class="pr-res-cab"><div class="pr-res-logro"><strong>${coma(r.logro)}%</strong><span>de logro</span></div>` +
        `<dl class="pr-res-datos"><div><dt>Correctas</dt><dd>${r.correctas} de ${r.total}</dd></div>` +
        `<div><dt>Nota referencial</dt><dd>${coma(notaRef(+r.logro).toFixed(1))}</dd></div>` +
        `<div><dt>Entregado</dt><dd>${new Date(r.entregado).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</dd></div></dl></div>` +
        `<p class="pr-nota">${porTiempo ? "Se acabó el tiempo y tu quiz se entregó solo. " : ""}${r.fuera_de_tiempo ? "La entrega llegó después del tiempo límite; el profesor lo verá marcado. " : ""}` +
        `La nota referencial usa una escala de 1,0 a 7,0 con 60% de exigencia. ` +
        (r.pauta ? "" : "La pauta con las respuestas correctas se publica cuando el profesor cierre el quiz: vuelve más tarde.") + "</p>";
      vista.append(res);
      if (r.pauta) {
        const pauta = h("section", "pr-pauta");
        const cab = h("div", "qz-pauta-cab", "<h4>Pauta</h4>");
        const todas = boton("econ-btn econ-btn-ghost econ-btn-sm", "Abrir todas las preguntas", () => {
          const abrir = todas.textContent.startsWith("Abrir");
          pauta.querySelectorAll("details").forEach((d) => (d.open = abrir));
          todas.textContent = abrir ? "Cerrar todas las preguntas" : "Abrir todas las preguntas";
        });
        cab.append(todas);
        pauta.append(cab, h("p", "pr-nota", "Las preguntas que respondiste mal o dejaste en blanco aparecen abiertas."));
        const vacia = (v) => v === null || v === undefined || String(v).trim() === "";
        const TIPO = { vfi: "Verdadero, falso o incierto", opcion: "Selección múltiple", numero: "Cálculo" };
        r.pauta.forEach((p, i) => {
          const d = h("details", "pr-pauta-item " + (p.ok ? "is-ok" : vacia(p.tu) ? "is-vacia" : "is-bad"));
          d.open = !p.ok;
          d.innerHTML = `<summary><span class="pr-pauta-n">${i + 1}</span><span>${TIPO[p.tipo]}</span>` +
            `<span class="pr-pauta-e">${p.ok ? "correcta" : vacia(p.tu) ? "sin responder" : "incorrecta"}</span><span></span></summary>`;
          let resp = "";
          if (p.tipo === "opcion") {
            resp = `<ol class="qz-alts">` + p.opciones.map((o, n) => {
              const correcta = n === Number(p.ans), tuya = !vacia(p.tu) && n === Number(p.tu);
              return `<li class="${correcta ? "is-correcta" : ""}${tuya ? " is-tuya" : ""}"><span class="qz-letra">${"abcdef"[n]}</span>` +
                `<div><div class="qz-alt-t">${M(o)}${correcta ? '<span class="qz-tag is-ok">respuesta correcta</span>' : ""}${tuya && !correcta ? '<span class="qz-tag is-bad">tu respuesta</span>' : tuya ? '<span class="qz-tag">tu respuesta</span>' : ""}</div>` +
                (p.por_que && p.por_que[n] ? `<p class="qz-alt-por">${M(p.por_que[n])}</p>` : "") + "</div></li>";
            }).join("") + "</ol>" + (vacia(p.tu) ? '<p class="pr-nota">No respondiste esta pregunta.</p>' : "");
          } else {
            const ver = (v, clave) => (vacia(v) ? "sin responder" : p.tipo === "vfi" ? VERED[v]
              : numTxt(clave ? Number(v).toFixed(p.dec ?? 2) : v) + (p.unidad ? ` ${esc(p.unidad)}` : ""));
            resp = `<dl class="qz-resp"><div><dt>Tu respuesta</dt><dd class="${p.ok ? "is-ok" : "is-bad"}">${esc(ver(p.tu))}</dd></div>` +
              `<div><dt>Respuesta correcta</dt><dd>${esc(ver(p.ans, true))}</dd></div></dl>` +
              (p.tipo === "numero" ? '<p class="pr-nota">Se aceptaba un pequeño margen de redondeo.</p>' : "");
          }
          // Dentro de un paso numerado, una fórmula destacada \[ \] quedaría centrada y lejos del número: se muestra en línea a tamaño completo
          const enLinea = (x) => x.replace(/\\\[([\s\S]*?)\\\]/g, (_, f) => `\\(\\displaystyle ${f.trim()}\\)`);
          const pasos = (p.pasos || []).length ? `<p class="qz-pauta-t">Desarrollo</p><ol class="qz-pasos">${p.pasos.map((x) => `<li>${M(enLinea(x))}</li>`).join("")}</ol>` : "";
          d.insertAdjacentHTML("beforeend", `<div class="pr-pauta-cuerpo"><div class="pr-stmt">${M(p.enunciado)}</div>${resp}${pasos}` +
            (p.idea ? `<p class="qz-idea"><strong>Idea clave.</strong> ${M(p.idea)}</p>` : "") +
            (p.repaso ? `<p class="pr-repaso">Repasa en ${esc(p.repaso)}</p>` : "") + "</div>");
          pauta.append(d);
        });
        vista.append(pauta);
        tipografiar(pauta);
      }
      vista.append(boton("econ-btn econ-btn-ghost qz-recargar", "Volver a la lista", lista));
    }
  }

  function montarTodo() { document.querySelectorAll(".qz-root:not([data-ok])").forEach((r) => { r.dataset.ok = 1; montar(r); }); }
  if (typeof document$ !== "undefined") document$.subscribe(montarTodo);
  else document.addEventListener("DOMContentLoaded", montarTodo);
})();
