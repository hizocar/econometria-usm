/* ==========================================================================
   casos2.js — Simuladores y casos de las clases 5 a 8 (propiedades de MCO,
   interpretación, inferencia sobre uno y varios parámetros).

   Usa las herramientas de econ.js (window.Econ) y de casos.js
   (window.EconCasos). Mismas reglas de diseño: paleta validada por
   variables CSS (--econ-c1/2/3), motion breve que respeta
   prefers-reduced-motion, y cada botón cambia algo visible.
   ========================================================================== */
(function () {
  "use strict";
  const E = window.Econ, C = window.EconCasos;
  if (!E || !C) return;
  const { WIDGETS, h, el, text, plot, rng, gauss, newSeed, mean, sd, ols, f, header, controls, slider, select,
    buttons, btn, statsRow, note, histogram } = E;
  const { caso, svgBox, tween, ease, onVisible, popIn, hand, miles, shake, lmSummary, matHTML, lgamma, pT, pF } = C;

  const C1 = "var(--econ-c1)", C2 = "var(--econ-c2)", C3 = "var(--econ-c3)";
  const st_ = (o) => Object.entries(o).map(([k, v]) => `${k}:${v}`).join(";");

  /* ---------- Distribución t: densidad, cola y cuantil ---------- */
  const dT = (x, df) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI)
    - ((df + 1) / 2) * Math.log(1 + (x * x) / df));
  const upperT = (t, df) => (t >= 0 ? pT(t, df) / 2 : 1 - pT(-t, df) / 2);   // P(T > t)
  function qT(p, df) {                                                          // P(T ≤ q) = p
    let lo = -60, hi = 60;
    for (let i = 0; i < 100; i++) {
      const m = (lo + hi) / 2;
      if (1 - upperT(m, df) < p) lo = m; else hi = m;
    }
    return (lo + hi) / 2;
  }
  const f4 = (v) => f(v, 4);

  /* Campo numérico con etiqueta (mismo estilo que los controles de econ.js) */
  function numero(parent, label, value, step, onChange) {
    const inp = h("input", { type: "number", value, step: step || "any", "aria-label": label });
    inp.addEventListener("input", () => { if (inp.value !== "" && Number.isFinite(+inp.value)) onChange(+inp.value); });
    parent.append(h("div", { class: "econ-control" }, h("label", {}, h("span", {}, label)), inp));
    return inp;
  }

  /* Botones de "ejemplo cargado": el activo queda marcado */
  function presets(parent, items, onPick) {
    const bs = items.map((it, i) => btn(parent, it.label, () => { mark(i); onPick(it); }, "econ-btn-ghost"));
    const mark = (k) => bs.forEach((b, i) => b.setAttribute("aria-pressed", String(i === k)));
    mark(0);
    return { mark, clear: () => mark(-1) };
  }

  /* ========================================================================
     CLASE 5 · Propiedades estadísticas del estimador MCO
     ======================================================================== */

  /* --- Juego · ¿Qué supuesto se rompe? ------------------------------------ */
  WIDGETS["supuestos-mlc"] = function (root) {
    caso(root, "Juego · Detective de supuestos",
      "¿Qué supuesto se rompe? 🕵️",
      "Seis situaciones reales. En cada una se viola <strong>uno</strong> de los cinco supuestos clásicos de la lámina 10. Elige cuál.");
    const S = ["1 · Linealidad", "2 · Muestra aleatoria", "3 · Identificación", "4 · Ortogonalidad", "5 · Homocedasticidad"];
    const CASOS = [
      ["🏪", "Encuestas solo a los clientes que dejaron una reseña en la tienda online.", 1,
        "Quienes dejan reseñas no son una muestra aleatoria de los clientes: suelen ser los muy contentos o los muy enojados."],
      ["💵", "Incluyes en la regresión el ingreso en pesos y, además, el mismo ingreso en miles de pesos.", 2,
        "Una columna es exactamente 1 000 veces la otra: hay una relación lineal exacta, XᵀX no tiene inversa (lámina 5)."],
      ["🧠", "Explicas el salario con la educación, pero la habilidad, que no observas, queda en u y se relaciona con la educación.", 3,
        "E[u | X] ≠ 0: es el sesgo por variable omitida de la Clase 3. Es el supuesto crítico (lámina 7)."],
      ["📈", "Con pocos años de estudio los salarios son parecidos; entre los más educados varían muchísimo.", 4,
        "La varianza del error crece con x: heterocedasticidad. Es justo el ejemplo de la lámina 8."],
      ["🏭", "Quieres estimar Y = A·K^α·L^β tal cual por MCO, sin transformarla.", 0,
        "El modelo no es lineal en los parámetros. Se arregla con logaritmos, como en la lámina 3."],
      ["🔢", "Tienes 3 observaciones y quieres estimar un modelo con 4 variables explicativas.", 2,
        "Se necesita n ≥ k + 1: con menos datos que parámetros, X no puede tener rango completo (lámina 5)."],
    ];
    const st = { i: 0, ok: 0, done: false, answered: false };
    const card = h("div", { class: "econ-sup-card" });
    const prog = h("div", { class: "econ-sup-prog" });
    const opts = h("div", { class: "econ-sup-opts" });
    const fb = h("p", { class: "econ-sup-fb", "aria-live": "polite" });
    root.append(prog, card, opts, fb);
    const nav = buttons(root);
    const next = btn(nav, "Siguiente caso →", () => { st.i++; render(true); });
    const again = btn(nav, "↺ Jugar de nuevo", () => { Object.assign(st, { i: 0, ok: 0, done: false }); render(true); }, "econ-btn-ghost");

    function render(anim) {
      const done = st.i >= CASOS.length;
      next.hidden = done;
      again.hidden = !done;
      prog.textContent = done ? "" : `Caso ${st.i + 1} de ${CASOS.length} · ${st.ok} correctas`;
      opts.innerHTML = "";
      fb.textContent = "";
      fb.className = "econ-sup-fb";
      if (done) {
        card.innerHTML = `<span class="econ-sup-emoji">${st.ok === CASOS.length ? "🏆" : "🔎"}</span>` +
          `<strong>${st.ok} de ${CASOS.length}</strong> a la primera. ` +
          (st.ok === CASOS.length ? "¡Detective certificado!" : "Repasa las láminas 3 a 10 y vuelve a jugar.");
        return;
      }
      const [emo, txt, ans, why] = CASOS[st.i];
      card.innerHTML = `<span class="econ-sup-emoji">${emo}</span>${txt}`;
      if (anim) { card.classList.remove("is-in"); void card.offsetWidth; card.classList.add("is-in"); }
      next.disabled = true;
      let first = true;
      S.forEach((lab, k) => {
        const b = h("button", { type: "button", class: "econ-quiz-opt" }, lab);
        b.addEventListener("click", () => {
          if (k === ans) {
            b.classList.add("is-right");
            if (first) st.ok++;
            opts.querySelectorAll("button").forEach((x) => { x.disabled = true; });
            fb.textContent = "✅ " + why;
            fb.className = "econ-sup-fb is-ok";
            prog.textContent = `Caso ${st.i + 1} de ${CASOS.length} · ${st.ok} correctas`;
            next.disabled = false;
            next.textContent = st.i === CASOS.length - 1 ? "Ver resultado →" : "Siguiente caso →";
          } else {
            first = false;
            b.classList.add("is-wrong");
            b.disabled = true;
            fb.textContent = "❌ No es ese. Pregúntate: ¿falla el modelo, los datos, X, la relación entre X y u, o la varianza de u?";
            fb.className = "econ-sup-fb is-bad";
            shake(card, 300);
          }
        });
        opts.append(b);
      });
    }
    render(false);
  };

  /* Muestra para los laboratorios de Monte Carlo: x1, x2 correlacionadas */
  function muestra(r, n, rho) {
    const x1 = [], x2 = [];
    for (let i = 0; i < n; i++) {
      const a = gauss(r);
      x1.push(a);
      x2.push(rho * a + Math.sqrt(Math.max(0, 1 - rho * rho)) * gauss(r));
    }
    return { x1, x2 };
  }

  /* --- Laboratorio · ¿Qué pasa si falla un supuesto? ---------------------- */
  WIDGETS["lab-supuestos"] = function (root) {
    header(root, "Laboratorio: 1 000 muestras para ver insesgamiento y varianza",
      "Modelo verdadero: y = 1 + 2·x₁ + 1.5·x₂ + u, con n = 50. Cada muestra da un β̂₁ distinto; el histograma muestra todos. " +
      "Compara su centro con β₁ = 2 y su dispersión con la que predice la fórmula σ²(XᵀX)⁻¹.");
    const ESC = [
      ["ok", "Se cumplen los supuestos 1 a 5"],
      ["s4", "Falla el 4: omito x₂ (correlacionada con x₁)"],
      ["s5", "Falla el 5: heterocedasticidad"],
    ];
    const st = { esc: "ok", res: null };
    const c = controls(root);
    select(c, { label: "Escenario", value: st.esc, options: ESC }, (v) => { st.esc = v; correr(); });
    const b = buttons(root);
    btn(b, "🎲 Simular otras 1 000 muestras", correr, "econ-btn-gold");
    const p = plot(root, 640, 250, { l: 14, b: 38 });
    const stats = statsRow(root, [
      { k: "m", label: "Promedio de β̂₁ (verdadero: 2)", cls: "is-gold" },
      { k: "sd", label: "Desv. estándar real de β̂₁" },
      { k: "se", label: "s.e. promedio según la fórmula" },
    ]);
    const n_ = note(root);

    function correr() {
      const r = rng(newSeed()), n = 50, B = 1000, est = [], ses = [];
      for (let k = 0; k < B; k++) {
        const { x1, x2 } = muestra(r, n, 0.6);
        const y = x1.map((a, i) => {
          const s = st.esc === "s5" ? 0.2 + 1.6 * Math.abs(a) : 1;
          return 1 + 2 * a + 1.5 * x2[i] + s * gauss(r);
        });
        if (st.esc === "s4") {
          const o = ols(x1, y);
          est.push(o.b1);
          ses.push(Math.sqrt(o.SSR / (n - 2) / o.sxx));
        } else {
          const S = lmSummary([x1, x2], y);
          est.push(S.b[1]);
          ses.push(S.se[1]);
        }
      }
      st.res = { est, ses };
      render();
    }

    function render() {
      const { est, ses } = st.res;
      const lo = 1.2, hi = 3.4;
      const H = histogram(est, lo, hi, 44);
      const top = Math.max(...H.counts);
      p.clear();
      p.domain([lo, hi], [0, top * 1.15]);
      p.axes({ noY: true, grid: false, xlabel: "β̂₁ estimado en cada muestra" });
      const g = p.clipped();
      H.counts.forEach((cnt, i) => {
        if (!cnt) return;
        const x0 = p.x(lo + i * H.w), w = p.x(lo + (i + 1) * H.w) - x0;
        const rct = el("rect", { x: x0 + 0.5, width: Math.max(0.5, w - 1), y: p.y(0), height: 0, rx: 1.5, style: `fill:${C1};opacity:.85` }, g);
        tween(420, ease.outCubic, (t) => { const hh = (p.y(0) - p.y(cnt)) * t; rct.setAttribute("y", p.y(0) - hh); rct.setAttribute("height", hh); });
      });
      const m = mean(est);
      el("line", { x1: p.x(2), x2: p.x(2), y1: 10, y2: p.y(0), style: `stroke:${C2};stroke-width:2.5` }, p.svg);
      text(p.svg, p.x(2), 9, "β₁ = 2", { "text-anchor": "middle", "font-weight": "700" });
      el("line", { x1: p.x(m), x2: p.x(m), y1: 22, y2: p.y(0), style: `stroke:${C3};stroke-width:2;stroke-dasharray:5 3` }, p.svg);
      text(p.svg, p.x(m) + (m > 2 ? 6 : -6), 30, `promedio ${f(m, 2)}`, { "text-anchor": m > 2 ? "start" : "end", style: `fill:${C3}` });
      stats.set("m", f(m, 3));
      stats.set("sd", f(sd(est), 3));
      stats.set("se", f(mean(ses), 3));
      n_.innerHTML = {
        ok: "Con los supuestos 1 a 4 el histograma queda <strong>centrado en 2</strong>: β̂ es insesgado (lámina 12). Con el 5, la fórmula σ²(XᵀX)⁻¹ predice bien la dispersión real (lámina 13).",
        s4: "Al omitir x₂, que se relaciona con x₁, E[u | X] ≠ 0 y el histograma <strong>se corre lejos de 2</strong>: β̂₁ queda sesgado. Más muestras no lo arreglan (lámina 7).",
        s5: "Con heterocedasticidad el histograma <strong>sigue centrado en 2</strong> (no se necesita el supuesto 5 para el insesgamiento), pero la fórmula σ²(XᵀX)⁻¹ <strong>ya no acierta</strong> a la dispersión real.",
      }[st.esc];
    }
    onVisible(root, correr);
  };

  /* --- Simulador · Multicolinealidad ------------------------------------- */
  WIDGETS.multicolinealidad = function (root) {
    header(root, "Simulador: ¿qué tan parecidas pueden ser x₁ y x₂?",
      "Mueve la correlación entre x₁ y x₂. Mientras más se parecen, más difícil es separar sus efectos y más se dispersa β̂₁. " +
      "Si son idénticas, se viola el supuesto 3: XᵀX no tiene inversa.");
    const st = { rho: 0.3 };
    const c = controls(root);
    const s = slider(c, { label: "Correlación entre x₁ y x₂ (ρ)", min: 0, max: 1, step: 0.01, value: st.rho, fmt: (v) => f(v, 2) },
      (v) => { st.rho = v; render(); });
    const b = buttons(root);
    btn(b, "ρ = 0 (independientes)", () => { s.set(0); st.rho = 0; render(); }, "econ-btn-ghost");
    btn(b, "ρ = 0.95", () => { s.set(0.95); st.rho = 0.95; render(); }, "econ-btn-ghost");
    btn(b, "ρ = 1 (x₂ = x₁)", () => { s.set(1); st.rho = 1; render(); }, "econ-btn-gold");
    const row = h("div", { class: "econ-plot-row is-2-1" });
    root.append(row);
    const L = h("div"), R = h("div");
    row.append(L, R);
    const pL = plot(L, 420, 230, { l: 14, b: 38 });
    const pR = plot(R, 220, 230, { l: 34, b: 38 });
    const stats = statsRow(root, [
      { k: "sd", label: "Desv. estándar de β̂₁ (300 muestras)", cls: "is-gold" },
      { k: "inf", label: "Varianza respecto de ρ = 0" },
    ]);
    const n_ = note(root);
    let sd0 = null;

    function sims(rho, B) {
      const r = rng(7), out = [];
      for (let k = 0; k < B; k++) {
        const { x1, x2 } = muestra(r, 60, rho);
        const y = x1.map((a, i) => 1 + 2 * a + 1 * x2[i] + gauss(r));
        const S = lmSummary([x1, x2], y);
        if (S) out.push(S.b[1]);
      }
      return out;
    }

    function render() {
      if (sd0 === null) sd0 = sd(sims(0, 300));
      const rho = st.rho;
      pR.clear();
      pR.domain([-3, 3], [-3, 3]);
      pR.axes({ xlabel: "x₁", ylabel: "x₂", nx: 3, ny: 3 });
      const r = rng(3), { x1, x2 } = muestra(r, 80, Math.min(rho, 1));
      const gR = pR.clipped();
      x1.forEach((a, i) => el("circle", { cx: pR.x(a), cy: pR.y(x2[i]), r: 2.6, style: `fill:${C1};opacity:.6` }, gR));
      pL.clear();
      if (rho >= 0.999) {
        pL.domain([0, 1], [0, 1]);
        text(pL.svg, 210, 100, "XᵀX no es invertible", { "text-anchor": "middle", "font-weight": "700", style: `fill:${C3};font-size:16px` });
        text(pL.svg, 210, 126, "MCO no puede separar el efecto de x₁ del de x₂", { "text-anchor": "middle" });
        stats.set("sd", "—");
        stats.set("inf", "∞");
        n_.innerHTML = "Con ρ = 1, x₂ es una copia de x₁: hay una relación lineal exacta entre columnas de X. Es la violación del " +
          "<strong>supuesto 3</strong> (lámina 5): no existe (XᵀX)⁻¹ y R entrega <code>NA</code> para uno de los coeficientes.";
        shake(pL.svg, 320);
        return;
      }
      const est = sims(rho, 300);
      const lo = -2, hi = 6;
      const H = histogram(est, lo, hi, 40);
      pL.domain([lo, hi], [0, Math.max(...H.counts) * 1.15]);
      pL.axes({ noY: true, grid: false, xlabel: "β̂₁ en 300 muestras (verdadero: 2)" });
      const g = pL.clipped();
      H.counts.forEach((cnt, i) => {
        if (!cnt) return;
        const x0 = pL.x(lo + i * H.w), w = pL.x(lo + (i + 1) * H.w) - x0;
        el("rect", { x: x0 + 0.5, width: Math.max(0.5, w - 1), y: pL.y(cnt), height: pL.y(0) - pL.y(cnt), rx: 1.5, style: `fill:${C1};opacity:.85` }, g);
      });
      el("line", { x1: pL.x(2), x2: pL.x(2), y1: 12, y2: pL.y(0), style: `stroke:${C2};stroke-width:2.5` }, pL.svg);
      const v = sd(est);
      stats.set("sd", f(v, 3));
      stats.set("inf", "× " + f((v / sd0) ** 2, 1));
      n_.innerHTML = rho < 0.5
        ? "Con x₁ y x₂ poco relacionadas, β̂₁ es preciso: el histograma es angosto y centrado en 2."
        : `Con ρ = ${f(rho, 2)} el histograma sigue centrado en 2 (no hay sesgo), pero es <strong>${f((v / sd0) ** 2, 1)} veces más disperso</strong> en varianza: ` +
          "la información para separar ambos efectos es poca. Prueba ρ = 1.";
    }
    onVisible(root, render);
  };

  /* --- Caso · La matriz de varianzas y covarianzas de la lámina 18 -------- */
  const XTX_INV = [[0.05987, -0.00177, -0.00035], [-0.00177, 0.0003, -0.00002], [-0.00035, -0.00002, 0.00001]];
  WIDGETS.vcov = function (root) {
    caso(root, "Interactivo · Láminas 17 y 18",
      "De σ̂²(XᵀX)⁻¹ a los errores estándar 🧮",
      "Los datos de la lámina: (XᵀX)⁻¹ y σ̂² = 141 925. Multiplica y haz clic en un elemento de la <strong>diagonal</strong> para obtener la " +
      "varianza y el error estándar de ese β̂. Cambia σ̂² para ver qué le pasa a la precisión.");
    const NOMBRES = ["β̂₀", "β̂₁", "β̂₂"];
    const st = { s2: 141925, j: 1 };
    const b = buttons(root);
    const pr = presets(b, [
      { label: "σ̂² de la lámina (141 925)", v: 141925 },
      { label: "Mitad del ruido (σ̂² ÷ 2)", v: 141925 / 2 },
      { label: "El doble (σ̂² × 2)", v: 141925 * 2 },
    ], (it) => { st.s2 = it.v; render(true); });
    const box = h("div", { class: "econ-vc" });
    root.append(box);
    const out = h("div", { class: "econ-vc-out", "aria-live": "polite" });
    root.append(out);
    void pr;

    function render(anim) {
      const V = XTX_INV.map((r) => r.map((v) => v * st.s2));
      box.innerHTML = "";
      const m1 = h("span", { class: "econ-vc-lbl" }, `σ̂² = ${miles(st.s2)}  ×`);
      const A = h("span", {});
      A.innerHTML = matHTML(XTX_INV, (v) => f(v, 5));
      const eq = h("span", { class: "econ-vc-lbl" }, "=");
      const tbl = h("table", { class: "econ-vc-mat" });
      V.forEach((r, i) => {
        const tr_ = h("tr");
        r.forEach((v, j) => {
          const td = h("td", { class: i === j ? "is-diag" + (i === st.j ? " is-sel" : "") : "" }, f(v, 2));
          if (i === j) {
            td.setAttribute("tabindex", "0");
            td.setAttribute("role", "button");
            td.setAttribute("aria-label", `Varianza de ${NOMBRES[i]}`);
            const pick = () => { st.j = i; render(true); };
            td.addEventListener("click", pick);
            td.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
          }
          tr_.append(td);
        });
        tbl.append(tr_);
      });
      box.append(m1, A, eq, h("span", { class: "econ-mat is-result" }, tbl));
      const v = V[st.j][st.j], se = Math.sqrt(v);
      out.innerHTML = `<strong>V̂(${NOMBRES[st.j]})</strong> = ${miles(st.s2)} × ${f(XTX_INV[st.j][st.j], 5)} = <strong>${f(v, 2)}</strong> ` +
        `&nbsp;⇒&nbsp; <strong>s.e.(${NOMBRES[st.j]})</strong> = √${f(v, 2)} = <strong>${f(se, 2)}</strong>` +
        (st.s2 !== 141925 ? `<br>Con ${st.s2 > 141925 ? "más" : "menos"} ruido en el error, todos los errores estándar se multiplican por √${f(st.s2 / 141925, 1)} = ${f(Math.sqrt(st.s2 / 141925), 2)}.` : "");
      if (anim) { out.classList.remove("is-in"); void out.offsetWidth; out.classList.add("is-in"); }
    }
    render(false);
  };

  /* ========================================================================
     CLASE 6 · Interpretación: logaritmos, cuadráticas, interacciones, escala
     ======================================================================== */

  /* --- Simulador · Las cuatro formas funcionales -------------------------- */
  WIDGETS["log-modelos"] = function (root) {
    header(root, "Simulador: ¿cómo se lee β en cada modelo?",
      "Elige la forma del modelo y mueve β y el cambio en x. El gráfico muestra la forma de la relación y el texto, su interpretación (lámina 13).");
    const MOD = [
      ["nn", "Nivel-nivel: y = β₀ + β₁x"],
      ["ln", "Log-nivel: log(y) = β₀ + β₁x"],
      ["nl", "Nivel-log: y = β₀ + β₁log(x)"],
      ["ll", "Log-log: log(y) = β₀ + β₁log(x)"],
    ];
    const st = { m: "ln", b: 0.083, dx: 1 };
    const b = buttons(root);
    const pr = presets(b, [
      { label: "Educación y salario (lámina 3)", m: "ln", b: 0.083, dx: 1 },
      { label: "Demanda de vino (lámina 4)", m: "ll", b: -0.2, dx: 1 },
    ], (it) => { Object.assign(st, it); sel.value = it.m; sb.set(it.b); sx.set(it.dx); render(); });
    const c = controls(root);
    const sel = select(c, { label: "Modelo", value: st.m, options: MOD }, (v) => { st.m = v; pr.clear(); render(); });
    const sb = slider(c, { label: "β₁", min: -1, max: 1, step: 0.001, value: st.b, fmt: (v) => f(v, 3) }, (v) => { st.b = v; pr.clear(); render(); });
    const sx = slider(c, { label: "Cambio en x (unidades o %)", min: 1, max: 20, step: 1, value: st.dx }, (v) => { st.dx = v; pr.clear(); render(); });
    const p = plot(root, 640, 230, { l: 14, b: 36 });
    const n_ = note(root);

    function render() {
      const { m, b: B, dx } = st;
      const fn = {
        nn: (x) => 10 + B * 4 * x,
        ln: (x) => Math.exp(Math.log(10) + B * x),
        nl: (x) => 10 + B * 10 * Math.log(x),
        ll: (x) => Math.exp(Math.log(10) + B * Math.log(x)),
      }[m];
      const xs = Array.from({ length: 121 }, (_, i) => 1 + (i * 24) / 120);
      const ys = xs.map(fn);
      const lo = Math.min(...ys), hi = Math.max(...ys);
      const pad = (hi - lo) * 0.12 || 1;
      p.clear();
      p.domain([1, 25], [lo - pad, hi + pad]);
      p.axes({ noY: true, xlabel: "x" });
      p.curve(p.svg, fn, "", 160);
      const path = p.svg.lastChild;
      path.setAttribute("style", `fill:none;stroke:${C1};stroke-width:3`);
      C.drawStroke(path, 500, 0);
      let txt;
      if (m === "nn") txt = `Si x aumenta en ${dx} unidad${dx > 1 ? "es" : ""}, y cambia en promedio <strong>β₁·Δx = ${f(B * dx, 3)} unidades</strong>.`;
      if (m === "ln") {
        const ap = 100 * B * dx, ex = 100 * (Math.exp(B * dx) - 1);
        txt = `Si x aumenta en ${dx} unidad${dx > 1 ? "es" : ""}, y cambia aproximadamente <strong>100·β₁·Δx = ${f(ap, 1)}%</strong>. ` +
          `El cambio exacto es 100·(e^{β₁Δx} − 1) = ${f(ex, 1)}%: la aproximación log(1 + x) ≈ x de la lámina 2 funciona bien solo para cambios chicos` +
          (Math.abs(ap - ex) > 1 ? ` (aquí ya difiere en ${f(Math.abs(ap - ex), 1)} puntos).` : ".");
      }
      if (m === "nl") txt = `Si x aumenta en ${dx}%, y cambia en promedio <strong>(β₁/100)·Δ%x = ${f((B / 100) * dx, 4)} unidades</strong>.`;
      if (m === "ll") txt = `Si x aumenta en ${dx}%, y cambia aproximadamente <strong>β₁·Δ%x = ${f(B * dx, 2)}%</strong>: β₁ es una <strong>elasticidad</strong>` +
        (B < 0 ? ` (con β₁ = ${f(B, 2)}, ${B > -1 ? "inelástica" : "elástica"}).` : ".");
      n_.innerHTML = txt;
    }
    render();
  };

  /* --- Caso · La curva de la experiencia --------------------------------- */
  WIDGETS.cuadratica = function (root) {
    caso(root, "Interactivo · Lámina 6",
      "¿Cuánto vale un año más de experiencia? 📈",
      "La ecuación de la lámina: salario = 3.73 + 0.298·exper − 0.0061·exper². Mueve la experiencia: la <strong>pendiente</strong> " +
      "(el efecto de un año más) cambia según cuántos años ya tienes.");
    const b0 = 3.73, b1 = 0.298, b2 = -0.0061, PEAK = -b1 / (2 * b2);
    const fn = (x) => b0 + b1 * x + b2 * x * x;
    const st = { x: 5 };
    const c = controls(root);
    const s = slider(c, { label: "Años de experiencia", min: 0, max: 45, step: 0.5, value: st.x, fmt: (v) => f(v, 1) }, (v) => { st.x = v; mover(); });
    const b = buttons(root);
    btn(b, "Recién egresado (2 años)", () => { s.set(2); st.x = 2; mover(); }, "econ-btn-ghost");
    btn(b, "En el máximo (24.4 años)", () => { s.set(24.5); st.x = PEAK; mover(); }, "econ-btn-gold");
    btn(b, "Cerca del retiro (40 años)", () => { s.set(40); st.x = 40; mover(); }, "econ-btn-ghost");
    const p = plot(root, 640, 260, { l: 40, b: 38 });
    const stats = statsRow(root, [
      { k: "y", label: "Salario predicho", cls: "is-gold" },
      { k: "m", label: "Efecto de un año más: 0.298 − 2·0.0061·exper" },
    ]);
    const n_ = note(root);
    p.domain([0, 45], [2, 8.5]);
    p.axes({ xlabel: "años de experiencia", ylabel: "salario (US$/hora)" });
    const curve = el("path", { style: `fill:none;stroke:${C1};stroke-width:3` }, p.svg);
    let d = "";
    for (let i = 0; i <= 180; i++) { const x = (45 * i) / 180; d += (i ? "L" : "M") + p.x(x).toFixed(1) + "," + p.y(fn(x)).toFixed(1); }
    curve.setAttribute("d", d);
    el("line", { x1: p.x(PEAK), x2: p.x(PEAK), y1: p.y(fn(PEAK)), y2: p.y(2), style: `stroke:${C2};stroke-dasharray:4 4;stroke-width:1.5` }, p.svg);
    hand(p.svg, p.x(PEAK) + 6, p.y(fn(PEAK)) - 10, "máximo: 24.4 años");
    const tan = el("line", { style: `stroke:${C3};stroke-width:2.5` }, p.svg);
    const dot = el("circle", { r: 6, style: `fill:${C3};stroke:#fff;stroke-width:2` }, p.svg);
    onVisible(root, () => C.drawStroke(curve, 700, 0));

    function mover() {
      const x = st.x, y = fn(x), m = b1 + 2 * b2 * x;
      const w = 6;
      tan.setAttribute("x1", p.x(x - w)); tan.setAttribute("y1", p.y(y - m * w));
      tan.setAttribute("x2", p.x(x + w)); tan.setAttribute("y2", p.y(y + m * w));
      dot.setAttribute("cx", p.x(x)); dot.setAttribute("cy", p.y(y));
      stats.set("y", f(y, 2) + " US$/h");
      stats.set("m", (m >= 0 ? "+" : "") + f(m, 3));
      n_.innerHTML = Math.abs(x - PEAK) < 0.6
        ? "En <strong>24.4 años</strong> la pendiente es cero: es el punto |β₁ / 2β₂| de la lámina 6, donde el efecto de la experiencia cambia de dirección."
        : x < PEAK
          ? `Con ${f(x, 1)} años, un año más se asocia con <strong>${f(m, 3)} US$/h</strong> más. El efecto es positivo, pero <strong>decreciente</strong>: β̂₂ &lt; 0.`
          : `Con ${f(x, 1)} años la pendiente ya es <strong>negativa</strong> (${f(m, 3)}): según el modelo, más experiencia se asocia con menor salario. ¿Tiene sentido económico? Es la pregunta de la lámina 6.`;
    }
    mover();
  };

  /* --- Simulador · Términos de interacción -------------------------------- */
  WIDGETS.interaccion = function (root) {
    header(root, "Simulador: ¿cuánto vale un dormitorio más?",
      "precio = β₀ + β₁·msq + β₂·dorm + β₃·msq·dorm (valores ilustrativos, en millones de pesos). Con β₃ ≠ 0, el efecto de un dormitorio " +
      "depende del tamaño de la casa: las rectas dejan de ser paralelas.");
    const st = { b2: -2, b3: 0.05, msq: 100 };
    const c = controls(root);
    slider(c, { label: "β₂ (dormitorio, con msq = 0)", min: -4, max: 4, step: 0.1, value: st.b2, fmt: (v) => f(v, 1) }, (v) => { st.b2 = v; render(); });
    const s3 = slider(c, { label: "β₃ (interacción msq·dorm)", min: -0.05, max: 0.1, step: 0.005, value: st.b3, fmt: (v) => f(v, 3) }, (v) => { st.b3 = v; render(); });
    const sm = slider(c, { label: "Metros cuadrados para evaluar", min: 40, max: 200, step: 5, value: st.msq }, (v) => { st.msq = v; render(); });
    const b = buttons(root);
    btn(b, "Sin interacción (β₃ = 0)", () => { st.b3 = 0; s3.set(0); render(); }, "econ-btn-ghost");
    btn(b, "Evaluar en la casa promedio (100 m²)", () => { st.msq = 100; sm.set(100); render(); }, "econ-btn-ghost");
    const p = plot(root, 640, 260, { l: 44, b: 38 });
    const n_ = note(root);
    const SIZES = [[60, C1], [100, C2], [160, C3]];

    function precio(m, d) { return 10 + 0.9 * m + st.b2 * d + st.b3 * m * d; }
    function render() {
      const all = SIZES.flatMap(([m]) => [1, 5].map((d) => precio(m, d))).concat([precio(st.msq, 1), precio(st.msq, 5)]);
      const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.1 + 2;
      p.clear();
      p.domain([1, 5], [lo - pad, hi + pad]);
      p.axes({ xlabel: "número de dormitorios", ylabel: "precio (millones)", nx: 4 });
      SIZES.forEach(([m, col]) => {
        el("line", { x1: p.x(1), y1: p.y(precio(m, 1)), x2: p.x(5), y2: p.y(precio(m, 5)), style: `stroke:${col};stroke-width:3` }, p.svg);
        text(p.svg, p.x(5) - 4, p.y(precio(m, 5)) - 7, `${m} m²`, { "text-anchor": "end", "font-weight": "700", style: `fill:${col}` });
      });
      el("line", { x1: p.x(1), y1: p.y(precio(st.msq, 1)), x2: p.x(5), y2: p.y(precio(st.msq, 5)), style: "stroke:currentColor;stroke-width:1.5;stroke-dasharray:5 4" }, p.svg);
      const ef = st.b2 + st.b3 * st.msq;
      n_.innerHTML = `Para una casa de <strong>${st.msq} m²</strong>, un dormitorio más cambia el precio en β₂ + β₃·msq = ${f(st.b2, 1)} + ${f(st.b3, 3)}·${st.msq} = ` +
        `<strong>${f(ef, 2)} millones</strong> (línea punteada). ` +
        (st.b3 === 0 ? "Con β₃ = 0 el efecto es el mismo para todos los tamaños: rectas paralelas."
          : st.b3 > 0 ? "Con β₃ &gt; 0 el dormitorio extra vale más en casas grandes (lámina 8)." : "Con β₃ &lt; 0 el dormitorio extra vale menos en casas grandes.");
    }
    render();
  };

  /* --- Simulador · Reescalar variables ------------------------------------ */
  WIDGETS.reescalar = function (root) {
    header(root, "Simulador: cambiar la unidad de medida",
      "Una regresión de salario en educación con 200 personas. Cambia las unidades y mira qué se mueve y qué no: " +
      "los coeficientes y sus errores estándar cambian juntos, pero t y R² quedan iguales (lámina 10).");
    const r = rng(11), n = 200;
    const educ = Array.from({ length: n }, () => 8 + Math.floor(r() * 13));
    const sal = educ.map((e) => 150 + 20 * e + 90 * gauss(r));
    const OPC = [
      ["base", "Salario en US$, educación en años"],
      ["y1000", "Salario en pesos (× 1 000, lámina 11)"],
      ["x12", "Educación en meses (x × 12)"],
      ["x10", "Educación en décadas (x ÷ 10)"],
    ];
    const st = { o: "base" };
    const c = controls(root);
    select(c, { label: "Unidades", value: st.o, options: OPC }, (v) => { st.o = v; render(); });
    const tbl = h("table", { class: "econ-po-table econ-esc-tbl" });
    root.append(h("div", { style: "overflow-x:auto" }, tbl));
    const n_ = note(root);
    const base = lmSummary([educ], sal);

    function render() {
      const o = st.o;
      const y = o === "y1000" ? sal.map((v) => v * 1000) : sal;
      const x = o === "x12" ? educ.map((v) => v * 12) : o === "x10" ? educ.map((v) => v / 10) : educ;
      const S = lmSummary([x], y);
      const fmtN = (v) => (Math.abs(v) >= 1000 ? miles(v) : f(v, Math.abs(v) < 10 ? 3 : 2));
      const filas = [["β̂₀", S.b[0], base.b[0]], ["β̂₁", S.b[1], base.b[1]], ["s.e.(β̂₁)", S.se[1], base.se[1]],
        ["t de β̂₁", S.t[1], base.t[1]], ["R²", S.R2, base.R2]];
      tbl.innerHTML = "<tr><th></th><th>Unidades originales</th><th>Unidades nuevas</th><th>¿Cambió?</th></tr>" +
        filas.map(([lab, v, v0]) => {
          const ch = Math.abs(v - v0) > 1e-6 * Math.max(1, Math.abs(v0));
          return `<tr><td>${lab}</td><td>${fmtN(v0)}</td><td class="${ch ? "revealed-po" : ""}">${fmtN(v)}</td><td>${ch ? "sí" : "no"}</td></tr>`;
        }).join("");
      n_.innerHTML = {
        base: "Elige otras unidades en el menú.",
        y1000: "Al multiplicar y por 1 000, <strong>todos</strong> los coeficientes y sus errores estándar se multiplican por 1 000: β̃ⱼ = 1 000·βⱼ (lámina 11). El estadístico t y el R² no cambian.",
        x12: "Si x se multiplica por α = 12, la pendiente se <strong>divide</strong> por 12 (lámina 12), igual que su error estándar. El intercepto, t y R² no cambian.",
        x10: "Si x se divide por 10 (α = 1/10), la pendiente se multiplica por 10, igual que su error estándar. El intercepto, t y R² no cambian.",
      }[o];
    }
    render();
  };

  /* ========================================================================
     CLASE 7 · Inferencia sobre un parámetro
     ======================================================================== */

  /* --- Simulador · Errores tipo I y II ------------------------------------ */
  WIDGETS["errores-tipo"] = function (root) {
    header(root, "Simulador: 1 000 investigadores hacen el mismo test",
      "Modelo y = 1 + β₁·x + u. Cada investigador toma su propia muestra y testea H₀: β₁ = 0. Si β₁ = 0 de verdad, " +
      "cada rechazo es un <strong>error tipo I</strong>; si β₁ ≠ 0, cada no rechazo es un <strong>error tipo II</strong>.");
    const st = { b: 0, n: 30, a: 0.05, ts: null };
    const c = controls(root);
    const sb = slider(c, { label: "β₁ verdadero", min: 0, max: 0.8, step: 0.05, value: st.b, fmt: (v) => f(v, 2) }, (v) => { st.b = v; correr(); });
    slider(c, { label: "Tamaño muestral n", min: 10, max: 300, step: 10, value: st.n }, (v) => { st.n = v; correr(); });
    select(c, { label: "Nivel de significancia α", value: "0.05", options: [["0.01", "1%"], ["0.05", "5%"], ["0.1", "10%"]] }, (v) => { st.a = +v; correr(); });
    const b = buttons(root);
    btn(b, "🎲 Repetir con otros 1 000", correr, "econ-btn-gold");
    btn(b, "H₀ verdadera (β₁ = 0)", () => { sb.set(0); st.b = 0; correr(); }, "econ-btn-ghost");
    const p = plot(root, 640, 240, { l: 14, b: 38 });
    const stats = statsRow(root, [
      { k: "rej", label: "Rechazan H₀", cls: "is-gold" },
      { k: "lab", label: "" },
    ]);
    const lab = root.querySelectorAll(".econ-stat span")[1];
    const n_ = note(root);

    function correr() {
      const r = rng(newSeed()), ts = [];
      for (let k = 0; k < 1000; k++) {
        const x = Array.from({ length: st.n }, () => gauss(r));
        const y = x.map((v) => 1 + st.b * v + gauss(r));
        const o = ols(x, y);
        ts.push(o.b1 / Math.sqrt(o.SSR / (st.n - 2) / o.sxx));
      }
      st.ts = ts;
      render();
    }
    function render() {
      const df = st.n - 2, crit = qT(1 - st.a / 2, df);
      const lo = -5, hi = Math.max(8, Math.ceil(Math.max(...st.ts)) + 1);
      const H = histogram(st.ts, lo, hi, Math.round((hi - lo) * 5));
      p.clear();
      p.domain([lo, hi], [0, Math.max(...H.counts) * 1.2]);
      p.axes({ noY: true, grid: false, xlabel: "estadístico t de cada investigador" });
      const g = p.clipped();
      H.counts.forEach((cnt, i) => {
        if (!cnt) return;
        const mid = lo + (i + 0.5) * H.w, rej = Math.abs(mid) >= crit;
        const x0 = p.x(lo + i * H.w), w = p.x(lo + (i + 1) * H.w) - x0;
        el("rect", { x: x0 + 0.4, width: Math.max(0.5, w - 0.8), y: p.y(cnt), height: p.y(0) - p.y(cnt), style: `fill:${rej ? C3 : C1};opacity:.85` }, g);
      });
      [-crit, crit].forEach((v) => el("line", { x1: p.x(v), x2: p.x(v), y1: 14, y2: p.y(0), style: `stroke:${C2};stroke-width:2;stroke-dasharray:5 3` }, p.svg));
      text(p.svg, p.x(crit) + 4, 14, `±${f(crit, 2)}`, { style: `fill:${C2};font-weight:700` });
      const rate = st.ts.filter((t) => Math.abs(t) >= crit).length / st.ts.length;
      stats.set("rej", f(100 * rate, 1) + "%");
      if (st.b === 0) {
        lab.textContent = "Error tipo I (debería ser ≈ α)";
        stats.set("lab", f(100 * rate, 1) + "% ≈ " + f(100 * st.a, 0) + "%");
        n_.innerHTML = `H₀ es verdadera: los ${Math.round(rate * 1000)} rechazos (barras rojas) son <strong>errores tipo I</strong>, y son cerca del α = ${f(100 * st.a, 0)}% que fijamos (lámina 11). Sube β₁ para ver el poder del test.`;
      } else {
        lab.textContent = "Poder = 1 − P(error tipo II)";
        stats.set("lab", f(100 * rate, 1) + "%");
        n_.innerHTML = `H₀ es falsa (β₁ = ${f(st.b, 2)}): los rechazos son aciertos. El <strong>${f(100 * (1 - rate), 1)}%</strong> que no rechaza comete <strong>error tipo II</strong>. ` +
          "Sube n: el error tipo II baja y el poder sube (lámina 9).";
      }
    }
    onVisible(root, correr);
  };

  /* --- Simulador · Intervalos de confianza para β ------------------------- */
  WIDGETS["ic-beta"] = function (root) {
    header(root, "Simulador: 40 muestras, 40 intervalos para β₁",
      "β₁ verdadero = 1 (línea dorada). Cada barra es el intervalo β̂₁ ± t·s.e.(β̂₁) de una muestra de n = 30. Las rojas no contienen a β₁: " +
      "en esas muestras, el test de H₀: β₁ = 1 rechazaría (lámina 12).");
    const st = { conf: 0.95, ivs: [], total: 0, fuera: 0 };
    const c = controls(root);
    select(c, { label: "Confianza", value: "0.95", options: [["0.9", "90%"], ["0.95", "95%"], ["0.99", "99%"]] }, (v) => { st.conf = +v; reset(); });
    const b = buttons(root);
    btn(b, "🎲 40 muestras más", () => add(40), "econ-btn-gold");
    btn(b, "↺ Empezar de nuevo", reset, "econ-btn-ghost");
    const p = plot(root, 640, 300, { l: 14, b: 36 });
    const stats = statsRow(root, [
      { k: "tot", label: "Intervalos construidos" },
      { k: "cov", label: "Contienen a β₁", cls: "is-gold" },
    ]);
    const r = rng(newSeed());
    function uno() {
      const n = 30, x = Array.from({ length: n }, () => gauss(r)), y = x.map((v) => 2 + 1 * v + 1.2 * gauss(r));
      const o = ols(x, y), se = Math.sqrt(o.SSR / (n - 2) / o.sxx), t = qT(1 - (1 - st.conf) / 2, n - 2);
      return [o.b1 - t * se, o.b1 + t * se];
    }
    function add(k) {
      for (let i = 0; i < k; i++) {
        const iv = uno();
        st.ivs.push(iv);
        st.total++;
        if (iv[0] > 1 || iv[1] < 1) st.fuera++;
      }
      st.ivs = st.ivs.slice(-40);
      render(true);
    }
    function reset() { st.ivs = []; st.total = 0; st.fuera = 0; add(40); }
    function render(anim) {
      p.clear();
      p.domain([0, 2], [0, 41]);
      p.axes({ noY: true, grid: false, xlabel: "valores de β₁" });
      el("line", { x1: p.x(1), x2: p.x(1), y1: p.y(41), y2: p.y(0), style: `stroke:${C2};stroke-width:2.5` }, p.svg);
      st.ivs.forEach(([a, z], i) => {
        const bad = a > 1 || z < 1;
        const ln = el("line", { x1: p.x(Math.max(0, a)), x2: p.x(Math.min(2, z)), y1: p.y(i + 1), y2: p.y(i + 1), style: `stroke:${bad ? C3 : C1};stroke-width:${bad ? 3 : 2};stroke-linecap:round` }, p.svg);
        if (anim && !C.reduced()) { ln.style.opacity = 0; setTimeout(() => { ln.style.transition = "opacity .25s"; ln.style.opacity = 1; }, i * 12); }
      });
      stats.set("tot", miles(st.total));
      stats.set("cov", f(100 * (1 - st.fuera / st.total), 1) + "% (meta: " + f(100 * st.conf, 0) + "%)");
    }
    onVisible(root, reset);
  };

  /* --- Calculadora · Test t con la regla de rechazo y el valor-p ---------- */
  WIDGETS["t-test"] = function (root) {
    caso(root, "Calculadora · Láminas 14 a 20",
      "Test t paso a paso, con su valor-p 🎯",
      "Ingresa β̂ⱼ, su error estándar y el valor de la hipótesis nula. La curva es la distribución t bajo H₀: en rojo la zona de rechazo, " +
      "en rosado el valor-p y en negro tu estadístico. Parte con los ejemplos de las láminas.");
    const st = { b: 42.0576, se: 6.5498, a0: 0, df: 932, al: 0.05, tipo: "dos" };
    const bx = buttons(root);
    const pr = presets(bx, [
      { label: "Educación e IQ (lámina 14)", b: 42.0576, se: 6.5498, a0: 0, df: 932, al: 0.05, tipo: "dos" },
      { label: "Experiencia, una cola (lámina 20)", b: 0.0041, se: 0.0017, a0: 0, df: 522, al: 0.05, tipo: "der" },
      { label: "Un coeficiente no significativo", b: 0.9, se: 0.75, a0: 0, df: 40, al: 0.05, tipo: "dos" },
    ], (it) => { Object.assign(st, it); sync(); render(); });
    const c = controls(root);
    const iB = numero(c, "β̂ⱼ", st.b, "any", (v) => { st.b = v; pr.clear(); render(); });
    const iS = numero(c, "s.e.(β̂ⱼ)", st.se, "any", (v) => { if (v > 0) { st.se = v; pr.clear(); render(); } });
    const iA = numero(c, "Valor bajo H₀ (aⱼ)", st.a0, "any", (v) => { st.a0 = v; pr.clear(); render(); });
    const iD = numero(c, "Grados de libertad n − k − 1", st.df, 1, (v) => { if (v >= 1) { st.df = Math.round(v); pr.clear(); render(); } });
    const sA = select(c, { label: "α", value: "0.05", options: [["0.01", "1%"], ["0.05", "5%"], ["0.1", "10%"]] }, (v) => { st.al = +v; pr.clear(); render(); });
    const sT = select(c, { label: "Hipótesis alternativa", value: "dos", options: [["dos", "H₁: βⱼ ≠ aⱼ (dos colas)"], ["der", "H₁: βⱼ > aⱼ"], ["izq", "H₁: βⱼ < aⱼ"]] }, (v) => { st.tipo = v; pr.clear(); render(); });
    const p = plot(root, 640, 240, { l: 14, b: 36 });
    const steps = h("ol", { class: "econ-ttest-steps", "aria-live": "polite" });
    root.append(steps);
    function sync() { iB.value = st.b; iS.value = st.se; iA.value = st.a0; iD.value = st.df; sA.value = String(st.al); sT.value = st.tipo; }

    function render() {
      const { b, se, a0, df, al, tipo } = st;
      const t = (b - a0) / se;
      const crit = tipo === "dos" ? qT(1 - al / 2, df) : qT(1 - al, df);
      const pv = tipo === "dos" ? pT(t, df) : tipo === "der" ? upperT(t, df) : 1 - upperT(t, df);
      const rech = tipo === "dos" ? Math.abs(t) >= crit : tipo === "der" ? t >= crit : t <= -crit;
      const L = Math.max(5, Math.min(12, Math.abs(t) + 1.5));
      p.clear();
      p.domain([-L, L], [0, dT(0, df) * 1.25]);
      p.axes({ noY: true, grid: false, xlabel: `t con ${miles(df)} gl` });
      const area = (from, to, col, op) => {
        let d = `M${p.x(from)},${p.y(0)}`;
        for (let i = 0; i <= 80; i++) { const x = from + ((to - from) * i) / 80; d += `L${p.x(x).toFixed(1)},${p.y(dT(x, df)).toFixed(1)}`; }
        d += `L${p.x(to)},${p.y(0)}Z`;
        el("path", { d, style: `fill:${col};opacity:${op}` }, p.svg);
      };
      const tc = Math.min(Math.abs(t), L);
      if (tipo === "dos") { area(-L, -crit, C3, 0.35); area(crit, L, C3, 0.35); area(-L, -tc, "#e879c6", 0.45); area(tc, L, "#e879c6", 0.45); }
      if (tipo === "der") { area(crit, L, C3, 0.35); if (t < L) area(Math.max(-L, t), L, "#e879c6", 0.45); }
      if (tipo === "izq") { area(-L, -crit, C3, 0.35); if (t > -L) area(-L, Math.min(L, t), "#e879c6", 0.45); }
      p.curve(p.svg, (x) => dT(x, df), "", 200);
      p.svg.lastChild.setAttribute("style", `fill:none;stroke:${C2};stroke-width:2.5`);
      const tx = Math.max(-L, Math.min(L, t));
      const ln = el("line", { x1: p.x(tx), x2: p.x(tx), y1: 16, y2: p.y(0), style: "stroke:currentColor;stroke-width:2.5" }, p.svg);
      text(p.svg, p.x(tx), 12, `t = ${f(t, 2)}${Math.abs(t) > L ? " →" : ""}`, { "text-anchor": "middle", "font-weight": "700" });
      popIn(ln, 0, 300);
      const h1 = { dos: "≠", der: ">", izq: "<" }[tipo];
      const pvTxt = pv < 0.0001 ? "&lt; 0.0001" : f(pv, 4);
      steps.innerHTML =
        `<li><strong>Hipótesis:</strong> H₀: βⱼ = ${a0} vs. H₁: βⱼ ${h1} ${a0}.</li>` +
        `<li><strong>Estadístico:</strong> t = (${b} − ${a0}) / ${se} = <strong>${f(t, 4)}</strong>.</li>` +
        `<li><strong>Regla:</strong> con α = ${f(100 * al, 0)}% y ${miles(df)} gl, el valor crítico es ${tipo === "dos" ? "±" : tipo === "izq" ? "−" : ""}${f(crit, 3)}` +
        `${df > 120 ? " (casi igual al de la normal)" : ""}.</li>` +
        `<li><strong>Decisión:</strong> ${rech ? "<span class='is-rej'>se rechaza H₀</span>" : "<span class='is-norej'>no se rechaza H₀</span>"} ` +
        `· valor-p = <strong>${pvTxt}</strong> ${pv < al ? "&lt;" : "≥"} α.</li>`;
    }
    render();
  };

  /* ========================================================================
     CLASE 8 · Inferencia sobre combinaciones de parámetros
     ======================================================================== */

  /* --- Simulador · ¿Por qué importa la covarianza? ------------------------ */
  WIDGETS["cov-importa"] = function (root) {
    header(root, "Simulador: β̂₁ y β̂₂ no son independientes",
      "300 muestras de y = 1 + 1·x₁ + 1·x₂ + u (β₁ = β₂). Cada punto es un par (β̂₁, β̂₂). Si x₁ y x₂ están correlacionadas, los " +
      "estimadores también lo están, y la varianza de β̂₁ − β̂₂ necesita el término 2·Cov (lámina 3).");
    const st = { rho: 0.7 };
    const c = controls(root);
    const s = slider(c, { label: "Correlación entre x₁ y x₂", min: -0.9, max: 0.9, step: 0.05, value: st.rho, fmt: (v) => f(v, 2) }, (v) => { st.rho = v; render(); });
    const b = buttons(root);
    btn(b, "x₁ y x₂ independientes", () => { s.set(0); st.rho = 0; render(); }, "econ-btn-ghost");
    btn(b, "Muy correlacionadas (0.9)", () => { s.set(0.9); st.rho = 0.9; render(); }, "econ-btn-ghost");
    const p = plot(root, 420, 300, { l: 40, b: 40 });
    const stats = statsRow(root, [
      { k: "real", label: "Desv. est. real de β̂₁ − β̂₂", cls: "is-gold" },
      { k: "bien", label: "√(Var₁ + Var₂ − 2·Cov)" },
      { k: "mal", label: "Ignorando la covarianza", cls: "is-red" },
    ]);
    const n_ = note(root);
    function render() {
      const r = rng(21), b1 = [], b2 = [];
      for (let k = 0; k < 300; k++) {
        const { x1, x2 } = muestra(r, 40, st.rho);
        const y = x1.map((a, i) => 1 + a + x2[i] + gauss(r));
        const S = lmSummary([x1, x2], y);
        b1.push(S.b[1]); b2.push(S.b[2]);
      }
      const m1 = mean(b1), m2 = mean(b2);
      const cov = b1.reduce((s_, v, i) => s_ + (v - m1) * (b2[i] - m2), 0) / (b1.length - 1);
      const v1 = sd(b1) ** 2, v2 = sd(b2) ** 2;
      const real = sd(b1.map((v, i) => v - b2[i]));
      p.clear();
      p.domain([-0.5, 2.5], [-0.5, 2.5]);
      p.axes({ xlabel: "β̂₁", ylabel: "β̂₂", nx: 3, ny: 3 });
      const g = p.clipped();
      el("line", { x1: p.x(-0.5), y1: p.y(-0.5), x2: p.x(2.5), y2: p.y(2.5), style: `stroke:${C2};stroke-dasharray:5 4;stroke-width:1.5` }, g);
      b1.forEach((v, i) => el("circle", { cx: p.x(v), cy: p.y(b2[i]), r: 2.5, style: `fill:${C1};opacity:.55` }, g));
      text(p.svg, p.x(2.45), p.y(2.3), "β̂₁ = β̂₂", { "text-anchor": "end", style: `fill:${C2}` });
      stats.set("real", f(real, 3));
      stats.set("bien", f(Math.sqrt(Math.max(0, v1 + v2 - 2 * cov)), 3));
      stats.set("mal", f(Math.sqrt(v1 + v2), 3));
      n_.innerHTML = Math.abs(st.rho) < 0.1
        ? "Con x₁ y x₂ independientes, Cov(β̂₁, β̂₂) ≈ 0: la nube es redonda y da igual incluir o no la covarianza."
        : `Con correlación ${f(st.rho, 2)} entre las x, la nube se inclina: Cov(β̂₁, β̂₂) = ${f(cov, 3)} (${cov < 0 ? "negativa" : "positiva"}). ` +
          `Ignorarla da un error estándar ${Math.sqrt(v1 + v2) < real ? "<strong>demasiado chico</strong>: rechazaríamos H₀: β₁ = β₂ más de la cuenta" : "<strong>demasiado grande</strong>: perderíamos poder"}.`;
    }
    onVisible(root, render);
  };

  /* --- Calculadora · H₀: c₁β₁ + c₂β₂ = r con los datos de la lámina 4 ----- */
  const V8 = [[8497.04975, -251.20725, -49.67375], [-251.20725, 42.5775, -2.8385], [-49.67375, -2.8385, 1.41925]];
  WIDGETS["test-combinacion"] = function (root) {
    caso(root, "Calculadora · Láminas 4 a 7",
      "Testear una combinación de parámetros 🧪",
      "Con los datos de la lámina 4 (β̂₁ = 42, β̂₂ = 5, n = 140) arma la hipótesis H₀: c₁β₁ + c₂β₂ = r. La calculadora usa " +
      "Var(c₁β̂₁ + c₂β̂₂) = c₁²·Var(β̂₁) + c₂²·Var(β̂₂) + 2c₁c₂·Cov(β̂₁, β̂₂).");
    const st = { c1: 1, c2: -1, r: 0 };
    const b = buttons(root);
    const pr = presets(b, [
      { label: "β₁ = β₂ (lámina 5)", c1: 1, c2: -1, r: 0 },
      { label: "β₁ = 2β₂ (lámina 7)", c1: 1, c2: -2, r: 0 },
      { label: "β₁ = 0 (test individual)", c1: 1, c2: 0, r: 0 },
    ], (it) => { Object.assign(st, it); i1.value = it.c1; i2.value = it.c2; ir.value = it.r; render(true); });
    const c = controls(root);
    const i1 = numero(c, "c₁", st.c1, "any", (v) => { st.c1 = v; pr.clear(); render(true); });
    const i2 = numero(c, "c₂", st.c2, "any", (v) => { st.c2 = v; pr.clear(); render(true); });
    const ir = numero(c, "r", st.r, "any", (v) => { st.r = v; pr.clear(); render(true); });
    const out = h("div", { class: "econ-comb", "aria-live": "polite" });
    root.append(out);
    const crit = qT(0.975, 137);

    function render(anim) {
      const { c1, c2, r } = st;
      const V1 = V8[1][1], V2 = V8[2][2], Cv = V8[1][2];
      const est = c1 * 42 + c2 * 5;
      const v = c1 * c1 * V1 + c2 * c2 * V2 + 2 * c1 * c2 * Cv;
      const se = Math.sqrt(v), t = (est - r) / se, rej = Math.abs(t) > crit;
      const sg = (x) => (x < 0 ? `(${f(x, 2).replace(/\.?0+$/, "")})` : f(x, 2).replace(/\.?0+$/, ""));
      out.innerHTML =
        `<p><strong>H₀:</strong> ${sg(c1)}·β₁ + ${sg(c2)}·β₂ = ${r} &nbsp;vs.&nbsp; <strong>H₁:</strong> ≠</p>` +
        `<p class="econ-po-eq">Var = ${sg(c1)}²·42.5775 + ${sg(c2)}²·1.41925 + 2·${sg(c1)}·${sg(c2)}·(−2.8385) = <strong>${f(v, 4)}</strong> ` +
        `⇒ s.e. = <strong>${f(se, 3)}</strong></p>` +
        `<p class="econ-po-eq">t = (${sg(c1)}·42 + ${sg(c2)}·5 − ${r}) / ${f(se, 3)} = ${f(est - r, 2)} / ${f(se, 3)} = <strong>${f(t, 3)}</strong></p>` +
        `<p class="econ-comb-dec ${rej ? "is-rej" : "is-norej"}">${rej ? "Se rechaza H₀" : "No se rechaza H₀"}: |t| = ${f(Math.abs(t), 2)} ${rej ? "&gt;" : "≤"} ${f(crit, 3)}, ` +
        `valor crítico de la t con 137 gl al 5%.</p>` +
        (c1 === 1 && c2 === -2 && r === 0 ? `<p class="econ-comb-note">La lámina 7 usa Var(β̂₁) ≈ 42.5 y obtiene 59.5, s.e. 7.68 y t = 4.16; con 42.5775 sale ${f(v, 1)}, ${f(se, 2)} y ${f(t, 2)}. La decisión es la misma.</p>` : "") +
        (c1 === 1 && c2 === -1 && r === 0 ? `<p class="econ-comb-note">La lámina 5 redondea a s.e. = 7.05 y t = 5.3.</p>` : "");
      if (anim) { out.classList.remove("is-in"); void out.offsetWidth; out.classList.add("is-in"); }
    }
    render(false);
  };


  /* ========================================================================
     CLASE 9 · El test F
     ======================================================================== */
  const dF = (x, d1, d2) => (x <= 0 ? 0 : Math.exp(0.5 * d1 * Math.log(d1) + 0.5 * d2 * Math.log(d2) + (0.5 * d1 - 1) * Math.log(x)
    - 0.5 * (d1 + d2) * Math.log(d2 + d1 * x) - (lgamma(d1 / 2) + lgamma(d2 / 2) - lgamma((d1 + d2) / 2))));
  function qF(p, d1, d2) {                       // P(F ≤ q) = p
    let lo = 0, hi = 200;
    for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (1 - pF(m, d1, d2) < p) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }

  /* --- Calculadora · Test F (SSR, R², significancia global, Chow) --------- */
  WIDGETS["f-test"] = function (root) {
    caso(root, "Calculadora · Láminas 14 a 20",
      "El test F paso a paso 🧮",
      "Elige cómo calcular el estadístico: con las SSR de los modelos restringido y no restringido, con sus R², o la prueba de " +
      "significancia global. La curva es la distribución F bajo H₀: en rojo la zona de rechazo y en negro tu estadístico.");
    const st = { modo: "ssr", ssrr: 198.31, ssru: 183.6, r2r: 0.5971, r2u: 0.627, n: 353, k: 4, j: 2, al: 0.05 };
    const b = buttons(root);
    const pr = presets(b, [
      { label: "Baseball con SSR (lámina 16)", modo: "ssr", ssrr: 198.31, ssru: 183.6, n: 353, k: 4, j: 2 },
      { label: "Baseball con R² (lámina 17)", modo: "r2", r2r: 0.5971, r2u: 0.627, n: 353, k: 4, j: 2 },
      { label: "Significancia global (lámina 20)", modo: "global", r2u: 0.627, n: 353, k: 4, j: 4 },
      { label: "Test de Chow (Clase 11)", modo: "ssr", ssrr: 85, ssru: 78, n: 366, k: 7, j: 4 },
    ], (it) => { Object.assign(st, it); sync(); render(); });

    const c = controls(root);
    const sM = select(c, { label: "Forma del estadístico", value: st.modo, options: [["ssr", "Con SSR"], ["r2", "Con R²"], ["global", "Significancia global"]] },
      (v) => { st.modo = v; if (v === "global") st.j = st.k; pr.clear(); sync(); render(); });
    const iRr = numero(c, "SSR restringido", st.ssrr, "any", (v) => { st.ssrr = v; pr.clear(); render(); });
    const iRu = numero(c, "SSR no restringido", st.ssru, "any", (v) => { st.ssru = v; pr.clear(); render(); });
    const i2r = numero(c, "R² restringido", st.r2r, "any", (v) => { st.r2r = v; pr.clear(); render(); });
    const i2u = numero(c, "R² no restringido", st.r2u, "any", (v) => { st.r2u = v; pr.clear(); render(); });
    const iN = numero(c, "n", st.n, 1, (v) => { st.n = Math.round(v); pr.clear(); render(); });
    const iK = numero(c, "k (regresores del modelo no restringido)", st.k, 1, (v) => { st.k = Math.round(v); if (st.modo === "global") st.j = st.k; pr.clear(); sync(); render(); });
    const iJ = numero(c, "j (restricciones)", st.j, 1, (v) => { st.j = Math.round(v); pr.clear(); render(); });
    select(c, { label: "α", value: "0.05", options: [["0.01", "1%"], ["0.05", "5%"], ["0.1", "10%"]] }, (v) => { st.al = +v; pr.clear(); render(); });
    const p = plot(root, 640, 220, { l: 14, b: 36 });
    const steps = h("ol", { class: "econ-ttest-steps", "aria-live": "polite" });
    root.append(steps);
    function vis(inp, on) { inp.closest(".econ-control").style.display = on ? "" : "none"; }
    function sync() {
      sM.value = st.modo; iRr.value = st.ssrr; iRu.value = st.ssru; i2r.value = st.r2r; i2u.value = st.r2u; iN.value = st.n; iK.value = st.k; iJ.value = st.j;
      vis(iRr, st.modo === "ssr"); vis(iRu, st.modo === "ssr"); vis(i2r, st.modo === "r2"); vis(i2u, st.modo !== "ssr"); vis(iJ, st.modo !== "global");
    }
    function render() {
      const { n, k, al } = st, j = st.modo === "global" ? k : st.j, gl = n - k - 1;
      if (gl < 1 || j < 1) { steps.innerHTML = "<li>Revisa n, k y j: los grados de libertad deben ser positivos.</li>"; return; }
      let F, form;
      if (st.modo === "ssr") {
        F = ((st.ssrr - st.ssru) / st.ssru) * (gl / j);
        form = `F = (${st.ssrr} − ${st.ssru}) / ${st.ssru} · (${n} − ${k} − 1)/${j}`;
      } else if (st.modo === "r2") {
        F = ((st.r2u - st.r2r) / (1 - st.r2u)) * (gl / j);
        form = `F = (${st.r2u} − ${st.r2r}) / (1 − ${st.r2u}) · (${n} − ${k} − 1)/${j}`;
      } else {
        F = (st.r2u / (1 - st.r2u)) * (gl / k);
        form = `F = ${st.r2u} / (1 − ${st.r2u}) · (${n} − ${k} − 1)/${k}`;
      }
      const crit = qF(1 - al, j, gl), pv = pF(Math.max(F, 0), j, gl), rech = F > crit;
      const hi = Math.max(crit * 2.2, Math.min(F * 1.15, 40), 5);
      p.clear();
      const ymax = Math.max(...Array.from({ length: 60 }, (_, i) => dF(0.05 + (i * hi) / 60, j, gl)));
      p.domain([0, hi], [0, ymax * 1.15]);
      p.axes({ noY: true, grid: false, xlabel: `F con (${j}, ${miles(gl)}) gl` });
      let d = `M${p.x(crit)},${p.y(0)}`;
      for (let i = 0; i <= 80; i++) { const x = crit + ((hi - crit) * i) / 80; d += `L${p.x(x).toFixed(1)},${p.y(dF(x, j, gl)).toFixed(1)}`; }
      el("path", { d: d + `L${p.x(hi)},${p.y(0)}Z`, style: `fill:${C3};opacity:.35` }, p.svg);
      p.curve(p.svg, (x) => dF(Math.max(x, 1e-6), j, gl), "", 200);
      p.svg.lastChild.setAttribute("style", `fill:none;stroke:${C2};stroke-width:2.5`);
      const fx = Math.min(F, hi);
      const ln = el("line", { x1: p.x(fx), x2: p.x(fx), y1: 16, y2: p.y(0), style: "stroke:currentColor;stroke-width:2.5" }, p.svg);
      text(p.svg, p.x(fx), 12, `F = ${f(F, 2)}${F > hi ? " →" : ""}`, { "text-anchor": "middle", "font-weight": "700" });
      popIn(ln, 0, 300);
      steps.innerHTML =
        `<li><strong>Hipótesis:</strong> H₀: ${st.modo === "global" ? "β₁ = … = βₖ = 0 (el modelo no explica y)" : `las ${j} variables excluidas tienen coeficiente 0`}; H₁: al menos uno ≠ 0.</li>` +
        `<li><strong>Estadístico:</strong> ${form} = <strong>${f(F, 3)}</strong>.</li>` +
        `<li><strong>Valor crítico:</strong> F(${j}, ${miles(gl)}) al ${f(100 * al, 0)}% = ${f(crit, 3)}.</li>` +
        `<li><strong>Decisión:</strong> ${rech ? "<span class='is-rej'>se rechaza H₀</span>" : "<span class='is-norej'>no se rechaza H₀</span>"} · valor-p = <strong>${pv < 1e-4 ? "&lt; 0.0001" : f(pv, 4)}</strong>.</li>`;
    }
    sync(); render();
    // data-preset="3" en el HTML abre la calculadora con ese ejemplo (la Clase 11 la usa para Chow)
    const ini = +(root.dataset.preset || 0);
    if (ini) b.querySelectorAll("button")[ini].click();
  };

  /* --- Simulador · F conjunto contra t individuales (lámina 19) ----------- */
  WIDGETS["f-vs-t"] = function (root) {
    header(root, "Simulador: ninguna t es significativa, pero el F sí",
      "y = 1 + 0.3·x₁ + 0.3·x₂ + u con n = 60. Sube la correlación entre x₁ y x₂: cada t individual pierde fuerza porque es difícil separar " +
      "los efectos, pero el F conjunto sigue detectando que importan (como hrunsyr y rbisyr en el ejemplo del baseball).");
    const st = { rho: 0.9, seed: 5 };
    const c = controls(root);
    const s = slider(c, { label: "Correlación entre x₁ y x₂", min: 0, max: 0.98, step: 0.01, value: st.rho, fmt: (v) => f(v, 2) }, (v) => { st.rho = v; render(); });
    const b = buttons(root);
    btn(b, "🎲 Otra muestra", () => { st.seed = newSeed(); render(); }, "econ-btn-gold");
    btn(b, "Sin correlación", () => { s.set(0); st.rho = 0; render(); }, "econ-btn-ghost");
    const tbl = h("table", { class: "econ-po-table econ-esc-tbl" });
    root.append(h("div", { style: "overflow-x:auto" }, tbl));
    const n_ = note(root);
    function render() {
      const r = rng(st.seed), n = 60;
      const { x1, x2 } = muestra(r, n, st.rho);
      const y = x1.map((a, i) => 1 + 0.3 * a + 0.3 * x2[i] + gauss(r));
      const S = lmSummary([x1, x2], y);
      const F = (S.R2 / (1 - S.R2)) * ((n - 3) / 2), pv = pF(F, 2, n - 3);
      const fila = (lab, est, se, t, p) => `<tr><td>${lab}</td><td>${est}</td><td>${se}</td><td>${t}</td><td class="${p < 0.05 ? "revealed-po" : ""}">${p < 1e-4 ? "&lt;0.0001" : f(p, 4)}</td></tr>`;
      tbl.innerHTML = "<tr><th></th><th>Estimación</th><th>s.e.</th><th>t o F</th><th>valor-p</th></tr>" +
        fila("β̂₁ (x₁)", f(S.b[1], 3), f(S.se[1], 3), f(S.t[1], 2), S.p[1]) +
        fila("β̂₂ (x₂)", f(S.b[2], 3), f(S.se[2], 3), f(S.t[2], 2), S.p[2]) +
        fila("F conjunto: β₁ = β₂ = 0", "—", "—", f(F, 2), pv);
      const indiv = (S.p[1] < 0.05 ? 1 : 0) + (S.p[2] < 0.05 ? 1 : 0);
      n_.innerHTML = pv < 0.05 && indiv === 0
        ? "<strong>Ninguna t es significativa al 5%, pero el F rechaza H₀.</strong> Con x₁ y x₂ muy correlacionadas, los errores estándar individuales se inflan; el F, al evaluarlas juntas, no tiene ese problema (lámina 19)."
        : pv < 0.05 ? `El F rechaza H₀ y ${indiv} de las 2 t individuales también. Sube la correlación para ver cómo las t pierden fuerza.`
          : "En esta muestra ni el F ni las t rechazan. Prueba otra muestra.";
    }
    render();
  };

  /* ========================================================================
     CLASE 10 · Propiedades asintóticas
     ======================================================================== */
  function errorAsim(r) { return -Math.log(r() || 1e-12) - 1; }            // exponencial centrada: muy asimétrica, media 0

  /* --- Simulador · Consistencia ------------------------------------------- */
  WIDGETS.consistencia = function (root) {
    header(root, "Simulador: ¿qué le pasa a β̂₁ cuando n crece?",
      "Modelo y = 1 + 2·x + u con errores muy asimétricos (no normales). Para cada n se toman 400 muestras: el histograma muestra todas las β̂₁. " +
      "Con exogeneidad, se concentran en 2 (consistencia). Si omites una variable correlacionada con x, se concentran… en otro valor.");
    const NS = [10, 25, 50, 100, 250, 1000];
    const st = { i: 1, omit: false };
    const c = controls(root);
    slider(c, { label: "Tamaño muestral n", min: 0, max: NS.length - 1, step: 1, value: st.i, fmt: (v) => miles(NS[v]) }, (v) => { st.i = v; render(); });
    const b = buttons(root);
    const tg = btn(b, "Omitir una variable correlacionada con x", () => { st.omit = !st.omit; tg.setAttribute("aria-pressed", String(st.omit)); render(); }, "econ-btn-ghost");
    tg.setAttribute("aria-pressed", "false");
    const p = plot(root, 640, 230, { l: 14, b: 38 });
    const stats = statsRow(root, [
      { k: "m", label: "Promedio de β̂₁", cls: "is-gold" },
      { k: "sd", label: "Desv. estándar de β̂₁" },
      { k: "lejos", label: "% de β̂₁ a más de 0.25 de 2" },
    ]);
    const n_ = note(root);
    function render() {
      const n = NS[st.i], r = rng(17 + st.i), est = [];
      for (let k = 0; k < 400; k++) {
        const x = [], y = [];
        for (let i = 0; i < n; i++) {
          const xi = gauss(r), z = 0.7 * xi + 0.7 * gauss(r);
          x.push(xi);
          y.push(1 + 2 * xi + (st.omit ? 1 * z : 0) + errorAsim(r));
        }
        est.push(ols(x, y).b1);
      }
      const lo = 0.5, hi = 4;
      const H = histogram(est, lo, hi, 50);
      p.clear();
      p.domain([lo, hi], [0, Math.max(...H.counts) * 1.15]);
      p.axes({ noY: true, grid: false, xlabel: `β̂₁ en 400 muestras de n = ${miles(n)}` });
      const g = p.clipped();
      H.counts.forEach((cnt, i) => {
        if (!cnt) return;
        const x0 = p.x(lo + i * H.w), w = p.x(lo + (i + 1) * H.w) - x0;
        el("rect", { x: x0 + 0.5, width: Math.max(0.5, w - 1), y: p.y(cnt), height: p.y(0) - p.y(cnt), rx: 1.5, style: `fill:${C1};opacity:.85` }, g);
      });
      el("line", { x1: p.x(2), x2: p.x(2), y1: 12, y2: p.y(0), style: `stroke:${C2};stroke-width:2.5` }, p.svg);
      text(p.svg, p.x(2), 10, "β₁ = 2", { "text-anchor": "middle", "font-weight": "700" });
      const m = mean(est), lejos = est.filter((v) => Math.abs(v - 2) > 0.25).length / est.length;
      stats.set("m", f(m, 3));
      stats.set("sd", f(sd(est), 3));
      stats.set("lejos", f(100 * lejos, 1) + "%");
      n_.innerHTML = st.omit
        ? `Con la variable omitida, E(x′u) ≠ 0: al crecer n la distribución se <strong>concentra en ${f(m, 2)}</strong>, no en 2. El sesgo no desaparece con más datos: MCO es <strong>inconsistente</strong> (lámina 4).`
        : `Al crecer n, la probabilidad de que β̂₁ quede lejos de 2 cae hacia cero (hoy ${f(100 * lejos, 1)}%): <strong>plim β̂₁ = β₁</strong>, aunque los errores no sean normales (lámina 5).`;
    }
    render();
  };

  /* --- Simulador · Normalidad asintótica ---------------------------------- */
  WIDGETS["normal-asintotica"] = function (root) {
    header(root, "Simulador: la t se vuelve normal aunque u no lo sea",
      "Errores muy asimétricos. Para cada muestra se calcula t = (β̂₁ − β₁)/s.e.(β̂₁). Con n chico, su distribución se aleja de la normal; " +
      "con n grande, la curva normal (en dorado) la describe bien: es el TCL en acción (láminas 7 a 10).");
    const NS = [5, 10, 30, 100, 500];
    const st = { i: 0 };
    const c = controls(root);
    slider(c, { label: "Tamaño muestral n", min: 0, max: NS.length - 1, step: 1, value: st.i, fmt: (v) => NS[v] }, (v) => { st.i = v; render(); });
    const p = plot(root, 640, 230, { l: 14, b: 38 });
    const stats = statsRow(root, [
      { k: "rej", label: "Rechazos de H₀ verdadera con |t| > 1.96 (meta 5%)", cls: "is-gold" },
    ]);
    const n_ = note(root);
    function render() {
      const n = NS[st.i], r = rng(31 + st.i), ts = [];
      for (let k = 0; k < 3000; k++) {
        const x = [], y = [];
        for (let i = 0; i < n; i++) { const xi = Math.abs(gauss(r)) + 0.2 * r(); x.push(xi); y.push(1 + 2 * xi + 2 * errorAsim(r) * xi); }
        const o = ols(x, y);
        const se = Math.sqrt(o.SSR / (n - 2) / o.sxx);
        if (Number.isFinite(se) && se > 0) ts.push((o.b1 - 2) / se);
      }
      const lo = -5, hi = 5, H = histogram(ts, lo, hi, 50);
      const dens = H.counts.map((v) => v / (ts.length * H.w));
      p.clear();
      p.domain([lo, hi], [0, Math.max(0.45, ...dens) * 1.1]);
      p.axes({ noY: true, grid: false, xlabel: `t en 3 000 muestras de n = ${n}` });
      const g = p.clipped();
      dens.forEach((v, i) => {
        if (!v) return;
        const x0 = p.x(lo + i * H.w), w = p.x(lo + (i + 1) * H.w) - x0;
        el("rect", { x: x0 + 0.5, width: Math.max(0.5, w - 1), y: p.y(v), height: p.y(0) - p.y(v), style: `fill:${C1};opacity:.75` }, g);
      });
      p.curve(g, (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI), "", 160);
      g.lastChild.setAttribute("style", `fill:none;stroke:${C2};stroke-width:2.5`);
      const rej = ts.filter((t) => Math.abs(t) > 1.96).length / ts.length;
      stats.set("rej", f(100 * rej, 1) + "%");
      n_.innerHTML = n <= 10
        ? `Con n = ${n} la distribución es asimétrica y se aleja de la normal: el test rechaza H₀ verdadera el ${f(100 * rej, 1)}% de las veces, no el 5%.`
        : `Con n = ${n} la normal ya describe bien a t: rechaza cerca del 5%. Por eso la inferencia habitual sirve en muestras grandes aunque u no sea normal (lámina 10).`;
    }
    render();
  };

  /* ========================================================================
     CLASE 11 · Variables binarias
     ======================================================================== */
  WIDGETS.dummies = function (root) {
    header(root, "Simulador: diferencias de intercepto y de pendiente",
      "salario = β₀ + δ₀·mujer + β₁·educ + δ₁·mujer·educ (valores ilustrativos). δ₀ desplaza la recta de las mujeres hacia arriba o abajo; " +
      "δ₁ cambia su pendiente: el retorno a la educación.");
    const st = { d0: -1, d1: 0 };
    const b = buttons(root);
    const pr = presets(b, [
      { label: "Solo intercepto (lámina 4)", d0: -1, d1: 0 },
      { label: "Panel (a): δ₀ < 0, δ₁ < 0", d0: -0.5, d1: -0.25 },
      { label: "Panel (b): δ₀ < 0, δ₁ > 0", d0: -0.5, d1: 0.35 },
    ], (it) => { Object.assign(st, it); s0.set(it.d0); s1.set(it.d1); render(); });
    const c = controls(root);
    const s0 = slider(c, { label: "δ₀ (diferencia de intercepto)", min: -2, max: 2, step: 0.05, value: st.d0, fmt: (v) => f(v, 2) }, (v) => { st.d0 = v; pr.clear(); render(); });
    const s1 = slider(c, { label: "δ₁ (diferencia de pendiente)", min: -0.5, max: 0.5, step: 0.01, value: st.d1, fmt: (v) => f(v, 2) }, (v) => { st.d1 = v; pr.clear(); render(); });
    const p = plot(root, 640, 260, { l: 44, b: 38 });
    const n_ = note(root);
    const B0 = 1.5, B1 = 0.55;
    function render() {
      const hom = (e) => B0 + B1 * e, muj = (e) => B0 + st.d0 + (B1 + st.d1) * e;
      const ys = [hom(0), hom(16), muj(0), muj(16)];
      p.clear();
      p.domain([0, 16], [Math.min(0, ...ys) - 0.5, Math.max(...ys) + 1]);
      p.axes({ xlabel: "años de educación", ylabel: "salario" });
      [[hom, C1, "mujer = 0"], [muj, C3, "mujer = 1"]].forEach(([fn, col, lab]) => {
        el("line", { x1: p.x(0), y1: p.y(fn(0)), x2: p.x(16), y2: p.y(fn(16)), style: `stroke:${col};stroke-width:3` }, p.svg);
        text(p.svg, p.x(16) - 4, p.y(fn(16)) - 8, lab, { "text-anchor": "end", "font-weight": "700", style: `fill:${col}` });
      });
      n_.innerHTML = `Pendiente de los hombres β₁ = ${f(B1, 2)}; de las mujeres β₁ + δ₁ = ${f(B1 + st.d1, 2)}. ` +
        (st.d1 === 0 ? "Con δ₁ = 0 las rectas son <strong>paralelas</strong>: la brecha δ₀ es la misma para todo nivel de educación (efecto aditivo)."
          : `Con δ₁ ${st.d1 > 0 ? "&gt;" : "&lt;"} 0 las rectas <strong>no son paralelas</strong>: la brecha cambia con la educación${B0 + st.d0 + (B1 + st.d1) * 16 > B0 + B1 * 16 && st.d0 < 0 ? " y hasta se invierte" : ""}. ` +
            "Para testear que hombres y mujeres ganan igual dadas sus características: H₀: δ₀ = δ₁ = 0, con un test F (lámina 14).");
    }
    render();
  };

  WIDGETS.mpl = function (root) {
    caso(root, "Interactivo · Lámina 8",
      "Probabilidades imposibles en el MPL ⚠️",
      "La regresión de la lámina: P̂(accidente) = 0.30 − 0.05·educ − 0.0001·ingreso. Mueve la educación y el ingreso: el modelo lineal puede " +
      "predecir probabilidades negativas, que no tienen sentido.");
    const st = { e: 4, ing: 500 };
    const c = controls(root);
    slider(c, { label: "Años de educación", min: 0, max: 20, step: 1, value: st.e }, (v) => { st.e = v; render(); });
    slider(c, { label: "Ingreso (US$)", min: 0, max: 3000, step: 100, value: st.ing, fmt: (v) => miles(v) }, (v) => { st.ing = v; render(); });
    const meter = h("div", { class: "econ-mpl" });
    root.append(meter);
    const n_ = note(root);
    function render() {
      const pr_ = 0.3 - 0.05 * st.e - 0.0001 * st.ing;
      const pct = Math.max(-0.5, Math.min(1, pr_));
      meter.innerHTML = `<div class="econ-mpl-bar"><span class="econ-mpl-zero"></span><span class="econ-mpl-fill ${pr_ < 0 ? "is-neg" : ""}" style="${pr_ >= 0 ? `left:33.3%;width:${(pct / 1.5) * 100}%` : `left:${((pct + 0.5) / 1.5) * 100}%;width:${(-pct / 1.5) * 100}%`}"></span></div>` +
        `<div class="econ-mpl-lbl"><span>−0.5</span><span>0</span><span>1</span></div>` +
        `<p class="econ-po-eq is-big">P̂ = 0.30 − 0.05·${st.e} − 0.0001·${miles(st.ing)} = <strong>${f(pr_, 3)}</strong></p>`;
      n_.innerHTML = pr_ < 0
        ? "<strong>¡Probabilidad negativa!</strong> Es el primer problema del MPL (lámina 7): una recta no respeta los límites 0 y 1. Prueba con 20 años de educación e ingreso 2 000 (la pregunta de la lámina 8)."
        : `Para esta persona el modelo predice una probabilidad de accidente de ${f(100 * pr_, 1)}%. Cada año más de educación la reduce en 0.05 (5 puntos porcentuales).`;
    }
    render();
  };

  /* ========================================================================
     CLASE 12 · Heterocedasticidad y variables instrumentales
     ======================================================================== */
  WIDGETS["robustos"] = function (root) {
    header(root, "Simulador: ¿cuántos intervalos de 95% contienen a β₁?",
      "2 000 muestras de y = 1 + 2·x + u con n = 100. Con heterocedasticidad, el error estándar usual se equivoca y el intervalo cubre menos " +
      "del 95%; el error estándar robusto de White (lámina 18) corrige el problema.");
    const st = { het: true };
    const c = controls(root);
    select(c, { label: "Errores", value: "het", options: [["het", "Heterocedásticos: la varianza crece con x"], ["hom", "Homocedásticos"]] }, (v) => { st.het = v === "het"; render(); });
    const b = buttons(root);
    btn(b, "🎲 Otras 2 000 muestras", () => { seed = newSeed(); render(); }, "econ-btn-gold");
    const stats = statsRow(root, [
      { k: "u", label: "Cobertura con s.e. usual", cls: "is-red" },
      { k: "r", label: "Cobertura con s.e. robusto", cls: "is-gold" },
      { k: "sd", label: "Desv. est. real de β̂₁ / s.e. usual promedio / robusto" },
    ]);
    const n_ = note(root);
    let seed = 4;
    function render() {
      const r = rng(seed), n = 100;
      let cu = 0, cr = 0;
      const est = [], seu = [], ser = [];
      for (let k = 0; k < 2000; k++) {
        const x = [], y = [];
        for (let i = 0; i < n; i++) { const xi = 3 * r(); x.push(xi); y.push(1 + 2 * xi + (st.het ? 0.2 + 1.2 * xi * xi : 2.2) * gauss(r) * 0.6); }
        const o = ols(x, y);
        const s2 = o.SSR / (n - 2), se1 = Math.sqrt(s2 / o.sxx);
        let num = 0;
        for (let i = 0; i < n; i++) num += (x[i] - o.mx) ** 2 * o.resid[i] ** 2;
        const se2 = Math.sqrt(num) / o.sxx;
        est.push(o.b1); seu.push(se1); ser.push(se2);
        if (Math.abs(o.b1 - 2) <= 1.984 * se1) cu++;
        if (Math.abs(o.b1 - 2) <= 1.984 * se2) cr++;
      }
      stats.set("u", f((100 * cu) / 2000, 1) + "%");
      stats.set("r", f((100 * cr) / 2000, 1) + "%");
      stats.set("sd", `${f(sd(est), 3)} / ${f(mean(seu), 3)} / ${f(mean(ser), 3)}`);
      n_.innerHTML = st.het
        ? "Con heterocedasticidad, el s.e. usual <strong>subestima</strong> la dispersión real de β̂₁: los intervalos son muy angostos y cubren menos del 95% (los tests rechazan de más). El s.e. robusto se acerca a la dispersión real. Más datos no corrigen el s.e. usual (lámina 2)."
        : "Con homocedasticidad, ambos errores estándar funcionan: los dos intervalos cubren cerca del 95%.";
    }
    render();
  };

  WIDGETS["iv-sim"] = function (root) {
    header(root, "Simulador: MCO contra variables instrumentales",
      "y = 1 + 1·x + u, pero x es endógena: comparte un factor no observado con u. El instrumento z afecta a x (relevancia) y, si es válido, " +
      "no se relaciona con u (exogeneidad). 1 000 muestras de n = 200.");
    const st = { endo: 0.6, rel: 0.6, inval: 0 };
    const c = controls(root);
    slider(c, { label: "Endogeneidad de x (Cov(x, u))", min: 0, max: 1, step: 0.05, value: st.endo, fmt: (v) => f(v, 2) }, (v) => { st.endo = v; render(); });
    const sR = slider(c, { label: "Relevancia del instrumento (efecto de z en x)", min: 0.05, max: 1, step: 0.05, value: st.rel, fmt: (v) => f(v, 2) }, (v) => { st.rel = v; render(); });
    const sI = slider(c, { label: "Violación de exogeneidad (Cov(z, u))", min: 0, max: 0.5, step: 0.05, value: st.inval, fmt: (v) => f(v, 2) }, (v) => { st.inval = v; render(); });
    const b = buttons(root);
    btn(b, "Buen instrumento (gráfico A)", () => { st.rel = 0.6; st.inval = 0; sR.set(0.6); sI.set(0); render(); }, "econ-btn-ghost");
    btn(b, "Instrumento inválido (gráfico B)", () => { st.inval = 0.4; sI.set(0.4); render(); }, "econ-btn-ghost");
    btn(b, "Instrumento débil (gráfico C)", () => { st.rel = 0.05; st.inval = 0; sR.set(0.05); sI.set(0); render(); }, "econ-btn-ghost");
    const p = plot(root, 640, 240, { l: 14, b: 38 });
    const stats = statsRow(root, [
      { k: "mco", label: "Mediana β̂ MCO", cls: "is-red" },
      { k: "iv", label: "Mediana β̂ VI", cls: "is-gold" },
      { k: "r2", label: "R² de x sobre z (promedio)" },
    ]);
    const n_ = note(root);
    function render() {
      const r = rng(9), n = 200, mco = [], iv = [], r2s = [];
      for (let k = 0; k < 1000; k++) {
        const x = [], y = [], z = [];
        for (let i = 0; i < n; i++) {
          const a = gauss(r), zi = gauss(r), u = st.endo * a + st.inval * zi + gauss(r) * 0.8;
          const xi = st.rel * zi + st.endo * a + gauss(r) * 0.8;
          x.push(xi); z.push(zi); y.push(1 + xi + u);
        }
        mco.push(ols(x, y).b1);
        const mx = mean(x), my = mean(y), mz = mean(z);
        let szy = 0, szx = 0;
        for (let i = 0; i < n; i++) { szy += (z[i] - mz) * (y[i] - my); szx += (z[i] - mz) * (x[i] - mx); }
        iv.push(szy / szx);
        r2s.push(ols(z, x).R2);
      }
      const med = (a) => { const s = a.slice().sort((p_, q) => p_ - q); return s[Math.floor(s.length / 2)]; };
      const lo = -1, hi = 3;
      const Hm = histogram(mco, lo, hi, 60), Hi = histogram(iv, lo, hi, 60);
      p.clear();
      p.domain([lo, hi], [0, Math.max(...Hm.counts, ...Hi.counts) * 1.1]);
      p.axes({ noY: true, grid: false, xlabel: "estimaciones de β₁ (verdadero: 1)" });
      const g = p.clipped();
      [[Hi, C2, 0.6], [Hm, C3, 0.55]].forEach(([H, col, op]) => H.counts.forEach((cnt, i) => {
        if (!cnt) return;
        const x0 = p.x(lo + i * H.w), w = p.x(lo + (i + 1) * H.w) - x0;
        el("rect", { x: x0 + 0.4, width: Math.max(0.5, w - 0.8), y: p.y(cnt), height: p.y(0) - p.y(cnt), style: `fill:${col};opacity:${op}` }, g);
      }));
      el("line", { x1: p.x(1), x2: p.x(1), y1: 12, y2: p.y(0), style: "stroke:currentColor;stroke-width:2;stroke-dasharray:5 3" }, p.svg);
      text(p.svg, p.x(1), 10, "β₁ = 1", { "text-anchor": "middle", "font-weight": "700" });
      text(p.svg, p.x(hi) - 4, 26, "rojo: MCO · dorado: VI", { "text-anchor": "end" });
      const mm = med(mco), mi = med(iv), r2 = mean(r2s);
      stats.set("mco", f(mm, 2)); stats.set("iv", f(mi, 2)); stats.set("r2", f(r2, 3));
      n_.innerHTML = st.inval > 0
        ? `El instrumento se relaciona con el error: <strong>VI también queda sesgado</strong> (mediana ${f(mi, 2)}). Viola la exogeneidad (gráfico B de la lámina 6).`
        : st.rel < 0.15
          ? `Instrumento <strong>débil</strong> (R² de x sobre z = ${f(r2, 3)}): VI se dispersa muchísimo. Var(β̂_VI) = σ̂²/(SSTₓ·R²ₓ,z) se dispara cuando R²ₓ,z es chico (lámina 15).`
          : st.endo === 0 ? "Sin endogeneidad, MCO y VI apuntan a 1; MCO es más preciso (Var VI ≥ Var MCO)."
            : `MCO está sesgado por la endogeneidad (mediana ${f(mm, 2)}), mientras VI se centra en el valor verdadero (${f(mi, 2)}) a costa de más dispersión.`;
    }
    render();
  };

  if (typeof document$ !== "undefined") document$.subscribe(E.mountAll);
  E.mountAll();
})();
