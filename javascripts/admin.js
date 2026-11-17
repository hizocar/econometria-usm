/* ==========================================================================
   admin.js — Panel docente (/admin): avance de los estudiantes en la Práctica.
   Datos agregados en el servidor (econ_resumen3, econ_actividad, econ_avance), con RLS:
   solo la cuenta docente ve a todos. Usa las utilidades de cuentas.js (window.EconCuentas).
   ========================================================================== */
(function () {
  "use strict";
  const BLOQUES = { 1: "Primer bloque", 2: "Segundo bloque", 3: "Tercer bloque" };

  function etiquetas() {
    const m = {};
    const meta = { 1: window.PRACTICA_META1 || {}, 2: { temas: window.PRACTICA_TEMAS2, talleres: window.PRACTICA_TALLERES2 },
      3: { temas: window.PRACTICA_TEMAS3, talleres: window.PRACTICA_TALLERES3 } };
    Object.entries(meta).forEach(([b, d]) => {
      (d.temas || []).filter(([k]) => k !== "todos").forEach(([k, lab]) => (m[`${b}:${k}`] = { lab: "💬 Comentes · " + lab, b: +b, tipo: "comente" }));
      (d.talleres || []).forEach(([k, lab]) => (m[`${b}:${k}`] = { lab, b: +b, tipo: "taller" }));
    });
    return m;
  }

  function montar(z) {
    const C = window.EconCuentas;
    if (!C) { z.innerHTML = '<p class="pr-acceso-msg is-bad">Las cuentas no están configuradas.</p>'; return; }
    const { h, esc } = C;
    z.innerHTML = "";
    const caja = h("div", "pr-cuenta");
    const area = h("div", "econ-panel-area");
    z.append(caja, area);
    const entrar = async (sb) => {
      const p = await C.perfilActual(sb);
      if (!p) return C.formAcceso(caja, { soloIngreso: true, alEntrar: entrar });
      C.barraSesion(caja, sb, p);
      const { data: esDoc } = await sb.rpc("econ_soy_docente");
      if (esDoc !== true) { area.innerHTML = '<p class="pr-acceso-msg is-bad">Esta página es solo para el docente del curso.</p>'; return; }
      cargar(sb, area, p, C);
    };
    C.cliente().then(entrar).catch((e) => { caja.innerHTML = `<p class="pr-acceso-msg is-bad">${esc(e.message)}</p>`; });
  }

  const fecha = (s) => (s ? new Date(s).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");
  const dia = (s) => new Date(s + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "2-digit", month: "2-digit" });
  const corto = (s) => new Date(s + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
  const pct = (ok, n) => (n ? Math.round((100 * ok) / n) + "%" : "—");

  async function cargar(sb, area, yo, C, vista = "resumen", aviso) {
    const { h, esc } = C;
    area.innerHTML = '<p class="pr-nota">Cargando datos…</p>';
    const [r1, r2, r3, r4, r5, r6, r7, r8] = await Promise.all([sb.rpc("econ_resumen3"), sb.rpc("econ_actividad", { dias: 42 }), sb.rpc("econ_avance"),
      sb.rpc("econ_conexiones"), sb.rpc("econ_minutos", { dias: 42 }), sb.rpc("econ_horario", { dias: 28 }), sb.rpc("econ_paginas", { dias: 28 }),
      sb.from("econ_simulacros").select("user_id,bloque,modo,inicio,fin,limite_min,preguntas,correctas,logro,puntos,detalle").order("fin", { ascending: false }).limit(1000)]);
    if (r1.error || r2.error || r3.error) { area.innerHTML = '<p class="pr-acceso-msg is-bad">No se pudieron cargar los datos. Usa ↻ para reintentar.</p>'; return; }
    const est = r1.data.filter((r) => r.id !== yo.id);
    const act = r2.data;
    const avance = Object.fromEntries(r3.data.filter((r) => r.id !== yo.id).map((r) => [r.id, r]));
    // Monitoreo (conexiones y precertámenes): si la migración aún no está aplicada, esas vistas lo dicen y el resto funciona igual
    const monitoreo = !r4.error;
    const con = Object.fromEntries((r4.data || []).map((r) => [r.id, r]));
    const mins = r5.data || [], horario = r6.data || [], paginas = r7.data || [];
    const sims = (r8.data || []).filter((x) => x.user_id !== yo.id);
    const nombreDe = Object.fromEntries(est.map((r) => [r.id, `${r.apellido}, ${r.nombre}`]));
    const L = etiquetas();
    const total = (r) => r.resp_b1 + r.resp_b2 + r.resp_b3;
    const practicaron = est.filter((r) => total(r) + r.soluciones > 0);
    const resp7 = act.slice(-7).reduce((s, d) => s + d.respuestas, 0);
    const respTot = est.reduce((s, r) => s + total(r), 0);
    const okTot = est.reduce((s, r) => s + r.ok_b1 + r.ok_b2 + r.ok_b3, 0);

    area.innerHTML = "";
    const kpis = h("div", "econ-panel-kpis",
      `<div><span class="pr-lbl">Registrados</span><strong>${est.length}</strong></div>` +
      `<div><span class="pr-lbl">Han practicado</span><strong>${practicaron.length}</strong><span class="econ-kpi-sub">${est.length - practicaron.length} sin practicar</span></div>` +
      `<div><span class="pr-lbl">Activos últimos 7 días</span><strong>${est.filter((r) => r.ultimos7 > 0).length}</strong></div>` +
      `<div><span class="pr-lbl">Respuestas (7 días)</span><strong>${resp7}</strong><span class="econ-kpi-sub">${respTot} en total</span></div>` +
      `<div><span class="pr-lbl">Aciertos al primer intento</span><strong>${pct(okTot, respTot)}</strong></div>` +
      `<div><span class="pr-lbl">Minutos activos (7 días)</span><strong>${monitoreo ? est.reduce((a, r) => a + ((con[r.id] || {}).minutos7 || 0), 0) : "—"}</strong>` +
      `<span class="econ-kpi-sub">${monitoreo ? `${sims.length} precertámenes rendidos` : "monitoreo pendiente"}</span></div>`);
    const tabs = h("div", "pr-chips econ-admin-tabs");
    const cuerpo = h("div", "econ-admin-cuerpo");
    const pie = h("div", "pr-nav");
    const recargar = h("button", "econ-btn econ-btn-ghost econ-btn-sm", "↻ Actualizar");
    recargar.type = "button";
    recargar.addEventListener("click", () => cargar(sb, area, yo, C, vista));
    const msg = h("p", "pr-acceso-msg"); msg.setAttribute("aria-live", "polite");
    if (aviso) { msg.className = "pr-acceso-msg is-ok"; msg.innerHTML = aviso; }
    pie.append(recargar);
    area.append(kpis, tabs, msg, cuerpo, pie);
    const VISTAS = [["resumen", "📌 Resumen por bloque"], ["actividad", "📈 Actividad diaria"], ["conexiones", "⏰ Conexiones"], ["temas", "🧠 Por tema"],
      ["precert", "⏱️ Precertámenes"], ["estudiantes", "👥 Estudiantes"]];
    const ir = (k) => {
      vista = k;
      tabs.querySelectorAll(".pr-chip").forEach((b) => b.classList.toggle("is-on", b.dataset.k === k));
      cuerpo.innerHTML = "";
      ({ resumen, actividad, conexiones, temas, precert, estudiantes })[k]();
    };
    VISTAS.forEach(([k, lab]) => { const b = h("button", "pr-chip", lab); b.type = "button"; b.dataset.k = k; b.addEventListener("click", () => ir(k)); tabs.append(b); });

    /* ---------- Resumen por bloque ---------- */
    function resumen() {
      const filas = [1, 2, 3].map((b) => {
        const r = est.map((x) => [x[`resp_b${b}`], x[`ok_b${b}`], x[`pts_b${b}`]]);
        const con = r.filter(([n]) => n > 0);
        const n = r.reduce((s, x) => s + x[0], 0), ok = r.reduce((s, x) => s + x[1], 0);
        const mediana = con.length ? con.map((x) => x[0]).sort((a, c) => a - c)[Math.floor(con.length / 2)] : 0;
        return [BLOQUES[b], `${con.length} de ${est.length}`, n, pct(ok, n), mediana, con.length ? Math.round(con.reduce((s, x) => s + x[2], 0) / con.length) : "—"];
      });
      cuerpo.append(h("div", "econ-panel-tabla",
        `<table><thead><tr><th>Bloque</th><th>Estudiantes que practicaron</th><th>Respuestas</th><th>Aciertos</th><th>Respuestas por estudiante (mediana)</th><th>Puntos promedio</th></tr></thead><tbody>` +
        filas.map((f) => `<tr>${f.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("") + `</tbody></table>`));
      const sin = est.filter((r) => total(r) + r.soluciones === 0);
      const inactivos = est.filter((r) => total(r) > 0 && r.ultimos7 === 0);
      cuerpo.append(h("div", "econ-admin-listas",
        `<div><p class="pr-lbl">🚩 Registrados que nunca han practicado (${sin.length})</p><p>${sin.length ? sin.map((r) => esc(`${r.nombre} ${r.apellido}`)).join(" · ") : "Nadie 🎉"}</p></div>` +
        `<div><p class="pr-lbl">💤 Practicaron, pero no en los últimos 7 días (${inactivos.length})</p><p>${inactivos.length ? inactivos.map((r) => esc(`${r.nombre} ${r.apellido}`)).join(" · ") : "Nadie"}</p></div>`));
    }

    /* ---------- Actividad diaria (dos gráficos de una serie, un eje cada uno) ---------- */
    function barras(titulo, datos, campo, unidad) {
      const W = 720, H = 170, pl = 34, pb = 22, pt = 10;
      const max = Math.max(1, ...datos.map((d) => d[campo]));
      const paso = max <= 5 ? 1 : Math.ceil(max / 4 / 5) * 5;
      const top = Math.ceil(max / paso) * paso;
      const bw = (W - pl) / datos.length;
      const y = (v) => pt + (H - pt - pb) * (1 - v / top);
      let svg = `<svg viewBox="0 0 ${W} ${H}" class="econ-graf" role="img" aria-label="${titulo}">`;
      for (let v = 0; v <= top; v += paso) svg += `<line x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="econ-graf-grid"/><text x="${pl - 6}" y="${y(v) + 3}" class="econ-graf-eje" text-anchor="end">${v}</text>`;
      datos.forEach((d, i) => {
        const x = pl + i * bw, v = d[campo], alto = Math.max(0, y(0) - y(v));
        const tip = `${dia(d.dia)} · ${v} ${unidad}${campo === "respuestas" && v ? ` · ${pct(d.aciertos, v)} aciertos` : ""}`;
        svg += `<g class="econ-graf-barra" tabindex="0"><title>${tip}</title><rect x="${x}" y="${pt}" width="${bw}" height="${H - pt - pb}" class="econ-graf-hit"/>` +
          (v ? `<rect x="${x + 1}" y="${y(v)}" width="${Math.max(1, bw - 2)}" height="${alto}" rx="${Math.min(4, bw / 3)}" class="econ-graf-mark"/>` : "") + `</g>`;
        const ult = i === datos.length - 1;
        if (i % 7 === 0 || ult) svg += `<text x="${ult ? W : x + bw / 2}" y="${H - 6}" class="econ-graf-eje" text-anchor="${ult ? "end" : "middle"}">${corto(d.dia)}</text>`;
      });
      svg += "</svg>";
      return h("figure", "econ-graf-fig", `<figcaption>${titulo}</figcaption>${svg}`);
    }
    function actividad() {
      cuerpo.append(barras("Respuestas por día (últimas 6 semanas)", act, "respuestas", "respuestas"),
        barras("Estudiantes que respondieron por día", act, "estudiantes", "estudiantes"));
      const det = h("details", "econ-admin-tabla-datos", `<summary>Ver como tabla</summary><div class="econ-panel-tabla"><table><thead><tr><th>Día</th><th>Estudiantes</th><th>Respuestas</th><th>Aciertos</th></tr></thead><tbody>` +
        act.slice().reverse().map((d) => `<tr><td>${dia(d.dia)}</td><td>${d.estudiantes}</td><td>${d.respuestas}</td><td>${pct(d.aciertos, d.respuestas)}</td></tr>`).join("") + `</tbody></table></div>`);
      cuerpo.append(det);
    }

    /* ---------- Conexiones: cuándo entran y cuánto tiempo pasan en el sitio ---------- */
    const pendienteMonitoreo = () => h("p", "pr-acceso-msg is-bad", "Todavía no hay datos de conexiones: falta aplicar la migración de monitoreo (supabase/migrations/20261124130000_econ_monitoreo.sql) en el proyecto.");
    const DIAS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
    const nombrePagina = (pg) => {
      let m;
      if (!pg || pg === "inicio") return "Inicio";
      if ((m = pg.match(/^clases\/clase(\d+)/))) return `Clase ${m[1]}`;
      if ((m = pg.match(/^ayudantias\/ayudantia(\d+)/))) return `Ayudantía ${m[1]}`;
      if ((m = pg.match(/^practica\/bloque(\d)/))) return `Práctica · ${BLOQUES[m[1]]}`;
      if (/^practica\/?$/.test(pg)) return `Práctica · ${BLOQUES[1]}`;
      if (pg.startsWith("admin")) return "Panel docente";
      return pg.replace(/\/$/, "");
    };
    function conexiones() {
      if (!monitoreo) { cuerpo.append(pendienteMonitoreo()); return; }
      cuerpo.append(barras("Minutos activos por día (últimas 6 semanas)", mins, "minutos", "minutos"),
        barras("Estudiantes conectados por día", mins, "estudiantes", "estudiantes"));
      // horario: día de la semana × hora (últimas 4 semanas)
      const celda = {};
      horario.forEach((x) => (celda[`${x.dow}-${x.hora}`] = x));
      const maxM = Math.max(1, ...horario.map((x) => x.minutos));
      const pico = horario.slice().sort((a, b) => b.minutos - a.minutos)[0];
      let g = `<div class="econ-horario" role="img" aria-label="${pico ? `Horario con más actividad: ${DIAS[pico.dow - 1]} a las ${pico.hora}:00` : "Sin conexiones en las últimas 4 semanas"}"><span></span>`;
      for (let hr = 0; hr < 24; hr++) g += `<span class="econ-horario-h">${hr % 3 === 0 ? hr : ""}</span>`;
      for (let d = 1; d <= 7; d++) {
        g += `<span class="econ-horario-d">${DIAS[d - 1]}</span>`;
        for (let hr = 0; hr < 24; hr++) {
          const x = celda[`${d}-${hr}`];
          const a = x ? Math.round(12 + (88 * x.minutos) / maxM) : 0;
          g += `<i${x ? ` style="--a:${a}%" title="${DIAS[d - 1]} ${hr}:00: ${x.minutos} min, ${x.estudiantes} ${x.estudiantes === 1 ? "estudiante" : "estudiantes"}"` : ""}></i>`;
        }
      }
      g += "</div>";
      cuerpo.append(h("figure", "econ-graf-fig", `<figcaption>¿A qué hora practican? Minutos activos por día y hora (últimas 4 semanas)</figcaption>${g}` +
        (pico ? `<p class="pr-nota">Horario con más actividad: <strong>${DIAS[pico.dow - 1]} a las ${pico.hora}:00</strong>. Más oscuro, más minutos.</p>` : '<p class="pr-nota">Sin conexiones en las últimas 4 semanas.</p>')));
      // por estudiante
      const filas = est.map((r) => Object.assign({ r }, con[r.id] || { sesiones: 0, minutos: 0, minutos7: 0, ultima: null, dias: 0 }))
        .sort((a, b) => String(b.ultima || "").localeCompare(String(a.ultima || "")));
      const nunca = filas.filter((x) => !x.sesiones).length;
      cuerpo.append(h("h4", "econ-admin-h", `Por estudiante${nunca ? ` (${nunca} sin conexiones registradas)` : ""}`),
        h("div", "econ-panel-tabla", `<table><thead><tr><th>Estudiante</th><th>Última conexión</th><th>Sesiones</th><th>Minutos activos</th><th>Últimos 7 días</th><th>Días conectado</th></tr></thead><tbody>` +
          filas.map((x) => `<tr class="${x.sesiones ? "" : "is-cero"}"><td>${esc(x.r.apellido)}, ${esc(x.r.nombre)}</td><td>${fecha(x.ultima)}</td><td>${x.sesiones}</td><td>${x.minutos}</td><td>${x.minutos7}</td><td>${x.dias}</td></tr>`).join("") +
          "</tbody></table>"));
      if (paginas.length) cuerpo.append(h("h4", "econ-admin-h", "Páginas más visitadas (últimas 4 semanas)"),
        h("div", "econ-panel-tabla", `<table><thead><tr><th>Página</th><th>Visitas</th><th>Estudiantes</th><th>Minutos activos</th></tr></thead><tbody>` +
          paginas.map((x) => `<tr><td>${esc(nombrePagina(x.pagina))}</td><td>${x.visitas}</td><td>${x.estudiantes}</td><td>${x.minutos}</td></tr>`).join("") + "</tbody></table>"));
    }

    /* ---------- Precertámenes ---------- */
    const MODO = { rapido: "Rápido (15 min)", estandar: "Estándar (35 min)", completo: "Completo (60 min)" };
    const notaRef = (l) => Math.round(10 * (l < 60 ? 1 + (3 * l) / 60 : 4 + (3 * (l - 60)) / 40)) / 10;
    const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
    function precert() {
      if (!monitoreo) { cuerpo.append(pendienteMonitoreo()); return; }
      let filtro = "todos";
      const chips = h("div", "pr-chips");
      const res = h("div", "");
      cuerpo.append(chips, res);
      [["todos", "Todos los bloques"], ["1", BLOQUES[1]], ["2", BLOQUES[2]], ["3", BLOQUES[3]]].forEach(([k, lab]) => {
        const b = h("button", "pr-chip" + (k === filtro ? " is-on" : ""), lab); b.type = "button";
        b.addEventListener("click", () => { filtro = k; chips.querySelectorAll(".pr-chip").forEach((x) => x.classList.toggle("is-on", x === b)); pintar(); });
        chips.append(b);
      });
      function pintar() {
        const xs = sims.filter((x) => filtro === "todos" || String(x.bloque) === filtro);
        const quienes = new Set(xs.map((x) => x.user_id));
        const prom = xs.length ? Math.round((10 * xs.reduce((a, x) => a + +x.logro, 0)) / xs.length) / 10 : null;
        res.innerHTML = `<div class="econ-admin-listas"><div><p class="pr-lbl">Intentos</p><p><strong>${xs.length}</strong></p></div>` +
          `<div><p class="pr-lbl">Estudiantes que han rendido</p><p><strong>${quienes.size}</strong> de ${est.length}</p></div>` +
          `<div><p class="pr-lbl">Logro promedio</p><p><strong>${prom === null ? "—" : String(prom).replace(".", ",") + "%"}</strong></p></div></div>` +
          (xs.length ? `<div class="econ-panel-tabla"><table><thead><tr><th>Estudiante</th><th>Bloque</th><th>Fecha</th><th>Modalidad</th><th>Correctas</th><th>Logro</th><th>Nota ref.</th><th>Tiempo usado</th></tr></thead><tbody>` +
            xs.map((x) => `<tr><td>${esc(nombreDe[x.user_id] || "—")}</td><td>${x.bloque}</td><td>${fecha(x.fin)}</td><td>${MODO[x.modo] || x.modo}</td><td>${x.correctas} de ${x.preguntas}</td>` +
              `<td>${String(x.logro).replace(".", ",")}%</td><td>${String(notaRef(+x.logro).toFixed(1)).replace(".", ",")}</td><td>${x.detalle && x.detalle.usados_seg != null ? mmss(x.detalle.usados_seg) : "—"}${x.detalle && x.detalle.por_tiempo ? " ⏰" : ""}</td></tr>`).join("") +
            "</tbody></table></div><p class=\"pr-nota\">⏰ = se acabó el tiempo y se entregó solo. Nota referencial: escala 1,0 a 7,0 con 60% de exigencia.</p>"
            : '<p class="pr-nota">Nadie ha rendido un precertamen en este filtro.</p>');
      }
      pintar();
    }

    /* ---------- Por tema: dónde practican y dónde fallan ---------- */
    function agregadoTemas() {
      const ag = {};
      Object.values(avance).forEach((r) => Object.entries(r.temas || {}).forEach(([k, [n, ok, pts]]) => {
        const a = (ag[k] = ag[k] || { n: 0, ok: 0, pts: 0, est: 0 });
        a.n += n; a.ok += ok; a.pts += pts; if (n > 0) a.est++;
      }));
      return ag;
    }
    function temas() {
      const ag = agregadoTemas();
      let filtro = "1";
      const chips = h("div", "pr-chips");
      const box = h("div", "econ-panel-tabla");
      cuerpo.append(h("p", "pr-nota", "Aciertos al primer intento por tema. Los temas con menos de 50% de aciertos aparecen marcados: conviene reforzarlos en clase."), chips, box);
      ["1", "2", "3"].forEach((b) => { const c = h("button", "pr-chip" + (b === filtro ? " is-on" : ""), BLOQUES[b]); c.type = "button";
        c.addEventListener("click", () => { filtro = b; chips.querySelectorAll(".pr-chip").forEach((x) => x.classList.toggle("is-on", x === c)); pintar(); }); chips.append(c); });
      function pintar() {
        const filas = Object.entries(L).filter(([, v]) => String(v.b) === filtro).map(([k, v]) => [v.lab, ag[k] || { n: 0, ok: 0, est: 0 }]);
        box.innerHTML = `<table><thead><tr><th>Tema</th><th>Estudiantes</th><th>Respuestas</th><th>Aciertos</th></tr></thead><tbody>` +
          filas.map(([lab, a]) => {
            const p = a.n ? Math.round((100 * a.ok) / a.n) : null;
            return `<tr class="${p !== null && p < 50 ? "is-debil" : ""}"><td>${esc(lab)}</td><td>${a.est} de ${est.length}</td><td>${a.n}</td>` +
              `<td>${p === null ? "—" : `<span class="econ-medidor"><span style="width:${p}%"></span></span> ${p}%${p < 50 ? " ⚠️" : ""}`}</td></tr>`;
          }).join("") + `</tbody></table>`;
      }
      pintar();
    }

    /* ---------- Estudiantes: tabla, ficha individual y gestión ---------- */
    function estudiantes() {
      let filtro = "todos", orden = "apellido";
      const filtros = h("div", "pr-chips");
      const tablaBox = h("div", "econ-panel-tabla");
      const ficha = h("div", "econ-admin-ficha");
      const acciones = h("div", "pr-nav");
      const csv = h("button", "econ-btn econ-btn-ghost econ-btn-sm", "⬇ Descargar CSV");
      csv.type = "button"; acciones.append(csv);
      cuerpo.append(filtros, tablaBox, ficha, acciones);
      [["todos", "Todos"], ["sin", "Sin practicar"], ["con", "Han practicado"], ["inactivos", "Sin actividad en 7 días"]].forEach(([k, lab]) => {
        const b = h("button", "pr-chip" + (k === filtro ? " is-on" : ""), lab); b.type = "button";
        b.addEventListener("click", () => { filtro = k; filtros.querySelectorAll(".pr-chip").forEach((x) => x.classList.toggle("is-on", x === b)); pintar(); });
        filtros.append(b);
      });
      function pintar() {
        let filas = est.filter((r) => filtro === "todos" || (filtro === "sin" ? total(r) + r.soluciones === 0 : filtro === "con" ? total(r) + r.soluciones > 0 : r.ultimos7 === 0));
        filas = filas.slice().sort((a, b) => orden === "actividad" ? total(b) - total(a) : orden === "ultima" ? String(b.ultima || "").localeCompare(String(a.ultima || "")) :
          (a.apellido + a.nombre).localeCompare(b.apellido + b.nombre, "es"));
        tablaBox.innerHTML =
          `<table><thead><tr><th><button type="button" data-o="apellido">Estudiante</button></th>` +
          `<th><button type="button" data-o="actividad">Respuestas B1 · B2 · B3</button></th><th>Aciertos B1 · B2 · B3</th>` +
          `<th>Soluciones vistas</th><th>Días activos</th><th><button type="button" data-o="ultima">Última respuesta</button></th><th>Última conexión</th><th>Minutos activos</th><th></th></tr></thead><tbody>` +
          (filas.length ? filas.map((r) =>
            `<tr class="${total(r) + r.soluciones === 0 ? "is-cero" : ""}"><td><button type="button" class="econ-admin-nombre" data-ver="${r.id}">${esc(r.apellido)}, ${esc(r.nombre)}</button><br><span class="pr-sesion-mail">${esc(r.email)}</span></td>` +
            `<td>${r.resp_b1} · ${r.resp_b2} · ${r.resp_b3}</td><td>${pct(r.ok_b1, r.resp_b1)} · ${pct(r.ok_b2, r.resp_b2)} · ${pct(r.ok_b3, r.resp_b3)}</td>` +
            `<td>${r.soluciones}</td><td>${r.dias_activos}</td><td>${fecha(r.ultima)}</td><td>${monitoreo ? fecha((con[r.id] || {}).ultima) : "—"}</td><td>${monitoreo ? (con[r.id] || {}).minutos || 0 : "—"}</td>` +
            `<td class="econ-panel-acc"><button type="button" class="econ-btn econ-btn-ghost econ-btn-sm" data-a="restablecer" data-id="${r.id}" title="Restablecer contraseña" aria-label="Restablecer contraseña">🔑</button>` +
            `<button type="button" class="econ-btn econ-btn-ghost econ-btn-sm" data-a="eliminar" data-id="${r.id}" title="Eliminar cuenta" aria-label="Eliminar cuenta">🗑</button></td></tr>`).join("")
            : `<tr><td colspan="9">Nadie en este filtro.</td></tr>`) + `</tbody></table>`;
        tablaBox.querySelectorAll("th button").forEach((b) => b.addEventListener("click", () => { orden = b.dataset.o; pintar(); }));
        tablaBox.querySelectorAll("button[data-a]").forEach((b) => b.addEventListener("click", () => accion(b)));
        tablaBox.querySelectorAll("button[data-ver]").forEach((b) => b.addEventListener("click", () => verFicha(b.dataset.ver)));
      }
      function verFicha(id) {
        const r = est.find((x) => x.id === id), av = avance[id] || { temas: {}, semanas: {} };
        const sem = Object.entries(av.semanas || {}).sort();
        const maxS = Math.max(1, ...sem.map(([, n]) => n));
        const temasEst = Object.entries(av.temas || {}).map(([k, [n, ok]]) => [L[k]?.lab || k, BLOQUES[k.split(":")[0]] || "", n, ok]).sort((a, b) => (a[1] + a[0]).localeCompare(b[1] + b[0], "es"));
        ficha.innerHTML = `<div class="econ-admin-ficha-t"><strong>${esc(r.nombre)} ${esc(r.apellido)}</strong> · registrado ${fecha(r.registrado)} · ${r.dias_activos} días activos` +
          `<button type="button" class="econ-btn econ-btn-ghost econ-btn-sm" data-cerrar>Cerrar</button></div>` +
          (monitoreo ? (() => { const c = con[id] || {}; const mis = sims.filter((x) => x.user_id === id);
            return `<p class="econ-admin-ficha-con">Última conexión: <strong>${fecha(c.ultima)}</strong>; ${c.sesiones || 0} sesiones, <strong>${c.minutos || 0} minutos activos</strong> (${c.minutos7 || 0} en los últimos 7 días).` +
              (mis.length ? ` Precertámenes: ${mis.map((x) => `bloque ${x.bloque}, ${String(x.logro).replace(".", ",")}%`).join("; ")}.` : " Sin precertámenes.") + "</p>"; })() : "") +
          `<p class="pr-lbl">Respuestas por semana</p>` +
          (sem.length ? `<div class="econ-semanas">${sem.map(([s, n]) => `<div title="Semana del ${s}: ${n} respuestas"><span style="height:${Math.round((100 * n) / maxS)}%"></span><em>${n}</em><small>${s.slice(5).split("-").reverse().join("/")}</small></div>`).join("")}</div>` : "<p>Sin actividad todavía.</p>") +
          (temasEst.length ? `<div class="econ-panel-tabla"><table><thead><tr><th>Bloque</th><th>Tema</th><th>Respuestas</th><th>Aciertos</th></tr></thead><tbody>` +
            temasEst.map(([lab, b, n, ok]) => `<tr><td>${b}</td><td>${esc(lab)}</td><td>${n}</td><td>${pct(ok, n)}</td></tr>`).join("") + `</tbody></table></div>` : "");
        ficha.querySelector("[data-cerrar]").addEventListener("click", () => (ficha.innerHTML = ""));
        ficha.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      const armado = {};
      async function accion(b) {
        const r = est.find((x) => x.id === b.dataset.id), a = b.dataset.a, k = a + r.id;
        if (!armado[k]) {
          armado[k] = true; b.textContent = a === "eliminar" ? "¿Eliminar? toca otra vez" : "¿Restablecer? toca otra vez";
          setTimeout(() => { armado[k] = false; b.textContent = a === "eliminar" ? "🗑" : "🔑"; }, 3500);
          return;
        }
        armado[k] = false;
        const pw = a === "restablecer" ? "econ-" + Math.random().toString(36).slice(2, 8) + Math.floor(10 + Math.random() * 89) : undefined;
        const { data: { session } } = await sb.auth.getSession();
        const res = await fetch(`${C.url}/functions/v1/docente`, {
          method: "POST", headers: { "Content-Type": "application/json", apikey: C.key, Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ accion: a, user_id: r.id, password: pw }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) { msg.className = "pr-acceso-msg is-bad"; msg.textContent = j.error || "No se pudo completar la acción."; return; }
        const texto = a === "restablecer"
          ? `Contraseña temporal de <strong>${esc(r.nombre)} ${esc(r.apellido)}</strong>: <code>${pw}</code> · pídele que la cambie al ingresar (🔑 Cambiar contraseña).`
          : `Cuenta de <strong>${esc(r.nombre)} ${esc(r.apellido)}</strong> eliminada.`;
        if (a === "eliminar") cargar(sb, area, yo, C, "estudiantes", texto);
        else { msg.className = "pr-acceso-msg is-ok"; msg.innerHTML = texto; }
      }
      csv.addEventListener("click", () => {
        const cab = ["apellido", "nombre", "email", "registrado", "ultima_actividad", "respuestas_b1", "aciertos_b1", "puntos_b1", "respuestas_b2", "aciertos_b2", "puntos_b2",
          "respuestas_b3", "aciertos_b3", "puntos_b3", "soluciones_vistas", "dias_activos", "ultimos_7_dias", "ultima_conexion", "sesiones", "minutos_activos", "minutos_7_dias", "precertamenes", "mejor_logro_precertamen"];
        const filas = est.map((r) => [r.apellido, r.nombre, r.email, r.registrado, r.ultima || "", r.resp_b1, r.ok_b1, r.pts_b1, r.resp_b2, r.ok_b2, r.pts_b2,
          r.resp_b3, r.ok_b3, r.pts_b3, r.soluciones, r.dias_activos, r.ultimos7,
          ...(() => { const c = con[r.id] || {}; return [c.ultima || "", c.sesiones || 0, c.minutos || 0, c.minutos7 || 0, c.simulacros || 0, c.mejor_logro ?? ""]; })()]);
        const txt = "﻿" + [cab, ...filas].map((f) => f.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
        const a = h("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" }));
        a.download = `practica-econometria-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
      const lista = h("details", "econ-panel-lista",
        `<summary>📋 ¿Quién no se ha registrado? (pega la lista de correos del curso)</summary>` +
        `<textarea rows="4" placeholder="un correo por línea, o separados por coma"></textarea>` +
        `<div class="pr-nav"><button type="button" class="econ-btn econ-btn-sm">Comparar</button></div><div class="econ-panel-faltan"></div>`);
      cuerpo.append(lista);
      lista.querySelector("button").addEventListener("click", () => {
        const reg = new Set(est.map((r) => r.email.toLowerCase()));
        const correos = [...new Set(lista.querySelector("textarea").value.toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g) || [])];
        const faltan = correos.filter((c) => !reg.has(c));
        lista.querySelector(".econ-panel-faltan").innerHTML = correos.length
          ? `<p><strong>${faltan.length}</strong> de ${correos.length} no tienen cuenta${faltan.length ? ":" : " 🎉"}</p>${faltan.length ? `<p class="pr-sesion-mail">${faltan.map(esc).join("<br>")}</p>` : ""}`
          : '<p class="pr-acceso-msg is-bad">No encontré correos en el texto.</p>';
      });
      pintar();
    }
    ir(vista);
  }

  function montarTodo() { document.querySelectorAll(".econ-admin:not([data-ok])").forEach((z) => { z.dataset.ok = 1; montar(z); }); }
  if (typeof document$ !== "undefined") document$.subscribe(montarTodo);
  else document.addEventListener("DOMContentLoaded", montarTodo);
})();
