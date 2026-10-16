/* ==========================================================================
   casos.js — "Casos" ilustrados e interactivos que acompañan las láminas.

   Cada caso es un <div class="econ-widget" data-widget="..."> que se monta
   con las mismas herramientas de econ.js (window.Econ). Estilo visual:
   ilustraciones planas en SVG + anotaciones "a plumón" (tipografía Caveat),
   como el profe marcando la pizarra.

   Motion (personalidad "Playful"): cada caso anima UNA vez al entrar en
   pantalla (IntersectionObserver), entradas 200–450 ms con ease-out-back,
   y respeta prefers-reduced-motion (se muestra el estado final sin animar).
   ========================================================================== */
(function () {
  "use strict";
  const E = window.Econ;
  if (!E) return;
  const { WIDGETS, h, el, text, plot, rng, gauss, mean, ols, f, buttons, btn, statsRow, note } = E;

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Motion: easings, tween y "al entrar en pantalla" ---------- */
  const ease = {
    outCubic: (t) => 1 - (1 - t) ** 3,
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
    outBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
    },
    inQuad: (t) => t * t,
  };

  function tween(ms, easing, update, done) {
    if (reduced() || ms <= 0) {
      update(1);
      if (done) done();
      return;
    }
    const t0 = performance.now();
    function frame(now) {
      // El timestamp de rAF puede ser anterior a t0 en el primer cuadro: se acota a [0, 1]
      const t = Math.max(0, Math.min(1, (now - t0) / ms));
      update(easing(t));
      if (t < 1) requestAnimationFrame(frame);
      else if (done) done();
    }
    requestAnimationFrame(frame);
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));

  function onVisible(node, fn) {
    if (reduced() || !("IntersectionObserver" in window)) {
      fn();
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    }, { threshold: 0.3 });
    io.observe(node);
  }

  function countUp(node, from, to, ms, fmt) {
    tween(ms, ease.outCubic, (k) => { node.textContent = fmt(from + (to - from) * k); });
  }

  /* Trazo "a plumón": la flecha/ subrayado se dibuja con stroke-dashoffset */
  function drawStroke(path, ms, delay) {
    const len = path.getTotalLength ? path.getTotalLength() : 200;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = reduced() ? 0 : len;
    setTimeout(() => tween(ms, ease.outCubic, (k) => { path.style.strokeDashoffset = len * (1 - k); }), reduced() ? 0 : delay || 0);
  }

  /* Pop de entrada (escala con rebote) para un grupo SVG */
  function popIn(g, delay, ms) {
    g.style.transformBox = "fill-box";
    g.style.transformOrigin = "center";
    g.style.transform = reduced() ? "none" : "scale(0)";
    setTimeout(() => tween(ms || 380, ease.outBack, (k) => { g.style.transform = `scale(${k})`; }), reduced() ? 0 : delay || 0);
  }

  function hand(parent, x, y, s, attrs) {
    return text(parent, x, y, s, Object.assign({ class: "econ-hand" }, attrs || {}));
  }

  function handArrow(parent, d) {
    return el("path", { d, class: "econ-hand-stroke" }, parent);
  }

  /* Cabecera de un caso: antetítulo + título + bajada */
  function caso(root, eyebrow, title, lead) {
    root.classList.add("econ-caso");
    root.append(
      h("div", { class: "econ-caso-eyebrow" }, eyebrow),
      h("div", { class: "econ-caso-title" }, title),
    );
    if (lead) root.append(h("p", { class: "econ-caso-lead" }, lead));
  }

  function svgBox(root, w, hgt, label, chart) {
    const svg = el("svg", { viewBox: `0 0 ${w} ${hgt}`, class: chart ? "econ-plot econ-chart" : "econ-scene", role: "img", "aria-label": label });
    root.append(svg);
    return svg;
  }

  /* Persona plana: cuerpo redondeado + cabeza; accesorios opcionales */
  function person(parent, x, y, o) {
    o = o || {};
    const g = el("g", { transform: `translate(${x},${y})` }, parent);
    el("path", { d: "M-22,58 Q-22,18 0,18 Q22,18 22,58 Z", fill: o.body || "#005f96" }, g);
    el("circle", { cx: 0, cy: 4, r: 15, fill: o.skin || "#f1c7a3" }, g);
    el("circle", { cx: -5, cy: 3, r: 1.8, fill: "#1b2a5e" }, g);
    el("circle", { cx: 5, cy: 3, r: 1.8, fill: "#1b2a5e" }, g);
    el("path", { d: "M-5,10 Q0,14 5,10", stroke: "#1b2a5e", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, g);
    if (o.cap) {
      el("polygon", { points: "-20,-9 0,-18 20,-9 0,0", fill: "#1b2a5e" }, g);
      el("rect", { x: -9, y: -8, width: 18, height: 6, fill: "#1b2a5e" }, g);
      el("path", { d: "M16,-10 L18,4", stroke: "#e5b300", "stroke-width": 2 }, g);
    }
    if (o.hat) {
      el("rect", { x: -13, y: -24, width: 26, height: 16, rx: 2, fill: "#1b2a5e" }, g);
      el("rect", { x: -19, y: -10, width: 38, height: 4, rx: 2, fill: "#1b2a5e" }, g);
      el("rect", { x: -13, y: -13, width: 26, height: 3, fill: "#e5b300" }, g);
    }
    return g;
  }

  /* ========================================================================
     CASO · Correlación espuria: helados y ataques de tiburón
     ======================================================================== */
  WIDGETS.espuria = function (root) {
    caso(root, "Caso · Correlación no es causalidad",
      "¿Los helados causan ataques de tiburón? 🍦🦈",
      "En una ciudad costera, los meses en que se venden más helados también hay más ataques de tiburón. " +
      "¿Deberíamos prohibir los helados para proteger a los bañistas?");

    // Ilustración
    const scene = svgBox(root, 600, 170, "Playa con sol, un helado y la aleta de un tiburón");
    const defs = el("defs", {}, scene);
    const grad = el("linearGradient", { id: "econ-sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: "0", "stop-color": "#dcebf7" }, grad);
    el("stop", { offset: "1", "stop-color": "#f6fafd" }, grad);
    el("rect", { x: 0, y: 0, width: 600, height: 170, rx: 14, fill: "url(#econ-sky)" }, scene);
    const sun = el("g", { class: "econ-sun" }, scene);
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI) / 6;
      el("line", { x1: 520 + 30 * Math.cos(a), y1: 44 + 30 * Math.sin(a), x2: 520 + 42 * Math.cos(a), y2: 44 + 42 * Math.sin(a), stroke: "#e5b300", "stroke-width": 4, "stroke-linecap": "round" }, sun);
    }
    el("circle", { cx: 520, cy: 44, r: 22, fill: "#e5b300" }, scene);
    // arena y mar
    el("path", { d: "M0,128 Q150,112 300,124 L300,170 L0,170 Z", fill: "#f3dfae" }, scene);
    const sea = el("path", { d: "M300,120 Q380,112 450,120 T600,118 L640,118 L640,170 L300,170 Z", fill: "#7fb7dc", class: "econ-wave" }, scene);
    el("path", { d: "M300,120 Q380,112 450,120 T600,118", fill: "none", stroke: "#ffffff", "stroke-width": 3, opacity: 0.7 }, scene);
    // helado
    const cone = el("g", {}, scene);
    el("polygon", { points: "110,102 140,102 125,150", fill: "#c28000" }, cone);
    el("path", { d: "M114,110 L136,110 M117,120 L133,120 M120,130 L130,130", stroke: "#8a5a00", "stroke-width": 1.5 }, cone);
    el("circle", { cx: 117, cy: 94, r: 14, fill: "#f7a8c4" }, cone);
    el("circle", { cx: 134, cy: 94, r: 14, fill: "#fff3d6" }, cone);
    el("circle", { cx: 125, cy: 79, r: 13, fill: "#8b5a2b" }, cone);
    // aleta
    const fin = el("g", {}, scene);
    el("path", { d: "M440,124 Q458,84 486,72 Q478,100 494,124 Z", fill: "#1b2a5e" }, fin);
    el("path", { d: "M430,126 Q462,118 500,126", stroke: "#ffffff", "stroke-width": 2.5, fill: "none" }, fin);
    // anotación a plumón
    hand(scene, 222, 46, "¿culpables?", { "text-anchor": "middle" });
    const a1 = handArrow(scene, "M188,54 Q160,62 146,78");
    const a2 = handArrow(scene, "M262,52 Q360,50 432,90");

    onVisible(scene, () => {
      popIn(cone, 0, 420);
      fin.style.transform = reduced() ? "none" : "translateX(140px)";
      tween(650, ease.outCubic, (k) => { fin.style.transform = `translateX(${140 * (1 - k)}px)`; });
      drawStroke(a1, 450, 450);
      drawStroke(a2, 550, 600);
      scene.classList.add("is-live");
    });

    // Datos simulados: 48 meses, la temperatura mueve ambas variables
    const r0 = rng(21); // semilla elegida: r ≈ 0.89 en bruto y ≈ 0 a igual temperatura
    const D = Array.from({ length: 48 }, (_, i) => {
      const mes = i % 12;
      const T = 19 + 7 * Math.cos((2 * Math.PI * mes) / 12) + 1.4 * gauss(r0);
      const hel = 30 + 5.5 * T + 9 * gauss(r0);
      const at = Math.max(0, Math.round(-5 + 0.42 * T + 1.1 * gauss(r0)));
      return { mes, T, hel, at, jit: (r0() - 0.5) * 0.36, anio: 2021 + Math.floor(i / 12) };
    });
    const T = D.map((d) => d.T);
    const resH = ols(T, D.map((d) => d.hel)).resid;
    const resA = ols(T, D.map((d) => d.at + d.jit)).resid;
    const corr = (x, y) => {
      const mx = mean(x), my = mean(y);
      let a = 0, b = 0, c = 0;
      x.forEach((v, i) => { a += (v - mx) * (y[i] - my); b += (v - mx) ** 2; c += (y[i] - my) ** 2; });
      return a / Math.sqrt(b * c);
    };
    const rRaw = corr(D.map((d) => d.hel), D.map((d) => d.at + d.jit));
    const rRes = corr(resH, resA);
    const Tmin = Math.min(...T), Tmax = Math.max(...T);
    const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

    const seg = h("div", { class: "econ-seg", role: "tablist" });
    root.append(seg);
    const steps = [
      ["1 · Lo que vemos", "raw"],
      ["2 · Mostrar la temperatura", "temp"],
      ["3 · Comparar a igual temperatura", "ctrl"],
    ];
    const segBtns = steps.map(([label, v]) => {
      const b = h("button", { type: "button", class: "econ-seg-btn", role: "tab" }, label);
      b.addEventListener("click", () => show(v));
      seg.append(b);
      return [v, b];
    });

    const wrap = h("div", { class: "econ-plot-row is-2-1" });
    root.append(wrap);
    const L = h("div"), R = h("div", { class: "econ-dag-side" });
    wrap.append(L, R);
    const p = plot(L, 440, 300, { l: 46, b: 40 });
    const ptsG = el("g", {}, p.svg);
    let axesG = null, overG = null;
    const circles = D.map((d) => {
      const c = el("circle", { r: 5.5, class: "econ-dot" }, ptsG);
      const t = el("title", {}, c);
      t.textContent = `${MESES[d.mes]} ${d.anio} · ${f(d.T, 1)} °C · ${Math.round(d.hel)} mil helados · ${d.at} ataques`;
      return c;
    });

    // Diagrama: la temperatura como causa común
    const dag = el("svg", { viewBox: "-6 0 232 170", class: "econ-plot", role: "img", "aria-label": "La temperatura causa ventas de helados y ataques" }, R);
    const mk = el("marker", { id: "econ-ah-" + Math.random().toString(36).slice(2, 8), viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, el("defs", {}, dag));
    el("path", { d: "M0,0 L10,5 L0,10 z", class: "econ-arrowhead" }, mk);
    const dagNodes = el("g", {}, dag);
    const node = (x, y, label, cls) => {
      const g = el("g", {}, dagNodes);
      el("rect", { x: x - 52, y: y - 17, width: 104, height: 34, rx: 17, class: cls }, g);
      text(g, x, y + 5, label, { "text-anchor": "middle", "font-weight": "700" });
      return g;
    };
    const tNode = node(110, 30, "☀️ Temperatura", "econ-node-hot");
    node(50, 140, "🍦 Helados", "econ-node");
    node(170, 140, "🦈 Ataques", "econ-node");
    const ar1 = el("path", { d: "M92,50 L62,118", class: "econ-arrow", "marker-end": `url(#${mk.id})` }, dag);
    const ar2 = el("path", { d: "M128,50 L158,118", class: "econ-arrow", "marker-end": `url(#${mk.id})` }, dag);
    el("path", { d: "M104,140 L116,140", class: "econ-arrow-q" }, dag);
    const qm = text(dag, 110, 128, "?", { "text-anchor": "middle", class: "econ-hand", style: "font-size:26px" });

    const stats = statsRow(root, [
      { k: "r", label: "Correlación mostrada (r)", cls: "is-gold" },
      { k: "lectura", label: "Lectura" },
    ]);
    const nt = note(root);

    const tempColor = (t) => {
      const k = (t - Tmin) / (Tmax - Tmin);
      return `color-mix(in oklab, var(--econ-seq-hi) ${Math.round(k * 100)}%, var(--econ-seq-lo))`;
    };

    let view = null;
    function targets(v) {
      if (v === "ctrl") return D.map((_, i) => [resH[i], resA[i]]);
      return D.map((d) => [d.hel, d.at + d.jit]);
    }

    function show(v) {
      if (v === view) return;
      const first = view === null;
      view = v;
      segBtns.forEach(([k, b]) => b.setAttribute("aria-selected", String(k === v)));
      const from = circles.map((c) => [+c.getAttribute("cx") || 0, +c.getAttribute("cy") || 0]);
      if (v === "ctrl") {
        const mh = Math.max(...resH.map(Math.abs)) * 1.15, ma = Math.max(...resA.map(Math.abs)) * 1.15;
        p.domain([-mh, mh], [-ma, ma]);
      } else {
        p.domain([70, 210], [-0.8, 9]);
      }
      if (axesG) axesG.remove();
      if (overG) overG.remove();
      axesG = v === "ctrl"
        ? p.axes({ xlabel: "Helados: diferencia vs. lo esperado a esa temperatura", ylabel: "Ataques: diferencia", nx: 5 })
        : p.axes({ xlabel: "Venta de helados (miles por mes)", ylabel: "Ataques de tiburón por mes", nx: 6 });
      p.svg.insertBefore(axesG, ptsG);
      const to = targets(v).map(([x, y]) => [p.x(x), p.y(y)]);
      circles.forEach((c, i) => {
        c.style.fill = v === "raw" ? "var(--econ-c1)" : tempColor(D[i].T);
      });
      tween(first ? 0 : 650, ease.inOutCubic, (k) => {
        circles.forEach((c, i) => {
          c.setAttribute("cx", first ? to[i][0] : from[i][0] + (to[i][0] - from[i][0]) * k);
          c.setAttribute("cy", first ? to[i][1] : from[i][1] + (to[i][1] - from[i][1]) * k);
        });
      }, () => annotate(v));
      // Diagrama: la temperatura aparece en los pasos 2 y 3
      const showT = v !== "raw";
      [tNode, ar1, ar2].forEach((n) => n.classList.toggle("is-hidden", !showT));
      qm.textContent = v === "ctrl" ? "✗" : "?";

      const r = v === "ctrl" ? rRes : rRaw;
      stats.set("r", f(r, 2));
      stats.set("lectura", v === "ctrl" ? "Sin relación" : "Relación fuerte y positiva");
      nt.innerHTML = {
        raw: "Cada punto es un mes (2021–2024). La relación es clarísima: <strong>r ≈ " + f(rRaw, 2) + "</strong>. ¿Significa que los helados atraen tiburones?",
        temp: "Coloreando cada mes por su temperatura aparece el patrón: los meses <strong>calurosos</strong> (más oscuros) están arriba a la derecha. " +
          "El calor hace que se vendan más helados <em>y</em> que más gente se bañe en el mar.",
        ctrl: "Comparamos meses con la <strong>misma temperatura</strong> (<em>ceteris paribus</em>): a igual calor, vender más helados no se asocia con más ataques (r ≈ " + f(rRes, 2) + "). " +
          "La temperatura era una <strong>variable omitida</strong> que movía a las dos.",
      }[v] + ' <span class="econ-fine">Datos simulados con fines ilustrativos.</span>';
    }

    function annotate(v) {
      overG = el("g", {}, p.svg);
      if (v === "ctrl") {
        el("line", { x1: p.x(p.xd[0]), x2: p.x(p.xd[1]), y1: p.y(0), y2: p.y(0), class: "line-navy line-dash" }, overG);
        hand(overG, p.x(p.xd[1] * 0.95), p.y(p.yd[0] * 0.8), "plano: ¡no hay relación!", { "text-anchor": "end" });
      } else {
        const o = ols(D.map((d) => d.hel), D.map((d) => d.at + d.jit));
        el("line", { x1: p.x(75), y1: p.y(o.b0 + o.b1 * 75), x2: p.x(205), y2: p.y(o.b0 + o.b1 * 205), class: "line" }, overG);
        if (v === "raw") {
          hand(overG, p.x(78), p.y(7.9), "¡más helados,", {});
          hand(overG, p.x(78), p.y(7.0), "más ataques!", {});
        } else {
          hand(overG, p.x(178), p.y(1.0), "¡es el verano!", { "text-anchor": "middle" });
          drawStroke(handArrow(overG, `M${p.x(192)},${p.y(1.6)} Q${p.x(208)},${p.y(3.3)} ${p.x(197)},${p.y(5.0)}`), 450, 50);
        }
      }
    }

    show("raw");
    root.append(h("div", { class: "econ-sabias" },
      h("strong", {}, "🍫 ¿Sabías que? "),
      "Messerli (2012), en el New England Journal of Medicine, encontró una correlación de r = 0.79 entre el consumo de chocolate per cápita de cada país " +
      "y su número de premios Nobel por habitante. ¿El chocolate te hace Nobel… o hay una variable omitida? (pista: ¿qué países pueden comprar más chocolate " +
      "y financiar más investigación?)"));
  };

  /* ========================================================================
     CASO · El 30% de la universidad: lo que no vemos
     ======================================================================== */
  WIDGETS.confusores = function (root) {
    caso(root, "Caso · ¿Por qué no podemos concluir eso?",
      "El 30% que no es solo la universidad 🎓",
      "Quienes terminaron la universidad ganan 30% más. Pero las dos personas no son iguales en todo lo demás.");
    const scene = svgBox(root, 600, 230, "Dos personas: una con birrete y factores ocultos a su alrededor");
    el("rect", { x: 0, y: 0, width: 600, height: 230, rx: 14, class: "econ-scene-bg" }, scene);
    // barras de ingreso
    const base = 194;
    el("line", { x1: 30, x2: 570, y1: base, y2: base, stroke: "#1b2a5e", "stroke-width": 2 }, scene);
    const b1 = el("rect", { x: 120, width: 44, y: base - 130, height: 130, rx: 4, fill: "#005f96" }, scene);
    const b2 = el("rect", { x: 470, width: 44, y: base - 100, height: 100, rx: 4, fill: "#8fa3c8" }, scene);
    text(scene, 142, base - 138, "ingreso 130", { "text-anchor": "middle", "font-weight": "700" });
    text(scene, 492, base - 108, "ingreso 100", { "text-anchor": "middle", "font-weight": "700" });
    person(scene, 76, 134, { cap: true, body: "#005f96" });
    person(scene, 426, 134, { body: "#8fa3c8" });
    text(scene, 112, 216, "Terminó la universidad", { "text-anchor": "middle" });
    text(scene, 462, 216, "No terminó", { "text-anchor": "middle" });
    hand(scene, 316, 34, "+30%", { "text-anchor": "middle", style: "font-size:30px" });
    const brace = handArrow(scene, "M170,58 Q316,18 466,88");

    const hidden = [
      [190, 104, "💡 más habilidad"],
      [190, 136, "👛 padres con más ingreso"],
      [190, 168, "🤝 más contactos"],
    ].map(([x, y, label]) => {
      const g = el("g", { class: "econ-badge" }, scene);
      const w = label.length * 6.6 + 18;
      el("rect", { x, y: y - 14, width: w, height: 24, rx: 12, class: "econ-badge-bg" }, g);
      text(g, x + 10, y + 3, label, { "font-weight": "700", class: "econ-badge-txt" });
      g.style.display = "none";
      return g;
    });
    const tag = hand(scene, 300, 214, "el 30% mezcla todo esto", { "text-anchor": "middle", style: "display:none;font-size:20px" });

    const b = buttons(root);
    const rev = btn(b, "Ver lo que no vemos 👀", () => toggleHidden(true), "econ-btn-gold");
    btn(b, "Ocultar", () => toggleHidden(false), "econ-btn-ghost");
    const nt = note(root);
    nt.innerHTML = "Estos factores están en el término de error: no los observamos, pero afectan el ingreso <em>y</em> se relacionan con ir a la universidad. " +
      "Por eso el 30% no es (solo) el efecto causal de la universidad. En la Clase 3 le pondremos nombre: <strong>sesgo de selección</strong>.";

    function toggleHidden(on) {
      rev.setAttribute("aria-pressed", String(on));
      hidden.forEach((g, i) => {
        g.style.display = on ? "" : "none";
        if (on) popIn(g, i * 90, 360);
      });
      tag.style.display = on ? "" : "none";
    }

    onVisible(scene, () => {
      [b1, b2].forEach((bar, i) => {
        const hgt = +bar.getAttribute("height");
        tween(500, ease.outBack, (k) => {
          bar.setAttribute("height", hgt * k);
          bar.setAttribute("y", base - hgt * k);
        });
        if (i) drawStroke(brace, 500, 450);
      });
    });
  };

  /* ========================================================================
     CASO · Dos estudios reales que cambiaron decisiones
     ======================================================================== */
  WIDGETS["casos-reales"] = function (root) {
    caso(root, "Caso · La econometría en el mundo real",
      "Dos estudios, dos decisiones 🌍",
      "Los dos ejemplos de la lámina, en una cifra cada uno.");
    const grid = h("div", { class: "econ-reales" });
    root.append(grid);
    const items = [
      {
        icon: "💊🏫", num: -25, suf: "%", label: "ausentismo escolar",
        txt: "Repartir pastillas antiparasitarias en escuelas de Kenia redujo el ausentismo en torno a un cuarto, también entre vecinos no tratados.",
        src: "Miguel y Kremer (2004), Econometrica · lectura del Certamen 1",
      },
      {
        icon: "🏭📋", num: 17, suf: "%", label: "productividad en el primer año",
        txt: "Consultoría gratuita de gestión, asignada al azar a plantas textiles en India, aumentó su productividad.",
        src: "Bloom et al., experimento en India (J-PAL)",
      },
    ];
    items.forEach((it) => {
      const numEl = h("span", { class: "econ-real-num" }, "0" + it.suf);
      grid.append(h("div", { class: "econ-real" },
        h("div", { class: "econ-real-icon" }, it.icon),
        h("div", {}, numEl, h("span", { class: "econ-real-lbl" }, it.label)),
        h("p", {}, it.txt),
        h("span", { class: "econ-fine" }, it.src)));
      onVisible(grid, () => countUp(numEl, 0, it.num, 900, (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(Math.round(v)) + it.suf));
    });
  };

  /* ========================================================================
     CASO · La forma de los datos (corte transversal, serie, panel)
     ======================================================================== */
  WIDGETS["tipos-datos"] = function (root) {
    caso(root, "Visual · Tipos de datos",
      "La forma de los datos 🧮",
      "Imagina una grilla: cada fila es una unidad (persona, empresa, país) y cada columna un período. Cada tipo de datos es un recorte distinto.");
    const ROWS = ["Ana", "Benjamín", "Camila", "Diego", "Elena", "Felipe"];
    const COLS = [2019, 2020, 2021, 2022, 2023, 2024];
    const seg = h("div", { class: "econ-seg", role: "tablist" });
    root.append(seg);
    const svg = svgBox(root, 600, 250, "Grilla de unidades por períodos", true);
    const cw = 60, ch = 30, x0 = 104, y0 = 34;
    COLS.forEach((c, j) => text(svg, x0 + j * cw + cw / 2, 22, String(c), { "text-anchor": "middle", class: "muted" }));
    ROWS.forEach((r, i) => text(svg, x0 - 10, y0 + i * ch + ch / 2 + 4, r, { "text-anchor": "end" }));
    const cells = [];
    ROWS.forEach((_, i) => COLS.forEach((__, j) => {
      const c = el("rect", { x: x0 + j * cw + 3, y: y0 + i * ch + 3, width: cw - 6, height: ch - 6, rx: 6, class: "econ-cell" }, svg);
      cells.push({ c, i, j });
    }));
    const lab = hand(svg, 534, 130, "", { "text-anchor": "middle" });
    const nt = note(root);
    const VIEWS = {
      corte: {
        label: "Corte transversal", on: (i, j) => j === 5, hand: "un momento",
        txt: "<strong>Corte transversal:</strong> muchas unidades en <em>un</em> momento del tiempo (una columna). Ej.: ingreso de cada persona encuestada en la CASEN.",
      },
      serie: {
        label: "Serie de tiempo", on: (i) => i === 3, hand: "una unidad",
        txt: "<strong>Serie de tiempo:</strong> <em>una</em> unidad a lo largo del tiempo (una fila). Ej.: el IPC o el dólar mes a mes. Lo de ayer influye en lo de hoy.",
      },
      panel: {
        label: "Panel", on: () => true, hand: "¡todo!",
        txt: "<strong>Panel (longitudinal):</strong> las <em>mismas</em> unidades seguidas en varios períodos (la grilla completa). Permite controlar características que no cambian en el tiempo.",
      },
    };
    const btns = {};
    Object.entries(VIEWS).forEach(([k, v]) => {
      btns[k] = h("button", { type: "button", class: "econ-seg-btn", role: "tab" }, v.label);
      btns[k].addEventListener("click", () => show(k));
      seg.append(btns[k]);
    });
    function show(k) {
      const v = VIEWS[k];
      Object.entries(btns).forEach(([kk, b]) => b.setAttribute("aria-selected", String(kk === k)));
      let order = 0;
      cells.forEach(({ c, i, j }) => {
        const on = v.on(i, j);
        c.classList.remove("is-on");
        if (on) {
          const d = order++ * (k === "panel" ? 12 : 45);
          setTimeout(() => c.classList.add("is-on"), reduced() ? 0 : d);
        }
      });
      lab.textContent = v.hand;
      nt.innerHTML = v.txt;
    }
    nt.innerHTML = VIEWS.corte.txt;
    onVisible(svg, () => show("corte"));
  };

  /* ========================================================================
     CASO · La analogía de la sopa (muestreo aleatorio)
     ======================================================================== */
  WIDGETS.sopa = function (root) {
    caso(root, "Analogía · Muestreo",
      "No necesitas tomarte toda la sopa 🍲",
      "Para saber si una olla de sopa está salada basta una cucharada… siempre que la hayas revuelto. Revolver es lo que hace el muestreo aleatorio.");
    const scene = svgBox(root, 600, 220, "Dos ollas: una revuelta y otra sin revolver");
    el("rect", { x: 0, y: 0, width: 600, height: 220, rx: 14, class: "econ-scene-bg" }, scene);
    const r0 = rng(5);
    function pot(cx, stirred, verdict, ok) {
      const g = el("g", {}, scene);
      // vapor (ambiente)
      for (let k = 0; k < 3; k++) {
        el("path", { d: `M${cx - 30 + k * 30},70 q-8,-12 0,-24 q8,-12 0,-24`, class: "econ-steam", style: `animation-delay:${k * 0.6}s` }, g);
      }
      el("path", { d: `M${cx - 80},86 L${cx + 80},86 L${cx + 68},176 Q${cx},190 ${cx - 68},176 Z`, fill: "#1b2a5e" }, g);
      el("rect", { x: cx - 92, y: 80, width: 184, height: 12, rx: 6, fill: "#2d3f7a" }, g);
      el("ellipse", { cx, cy: 92, rx: 74, ry: 9, fill: "#e8a33d" }, g);
      // sal: repartida (revuelta) o en el fondo (sin revolver)
      for (let k = 0; k < 40; k++) {
        const x = cx - 60 + r0() * 120;
        const y = stirred ? 98 + r0() * 70 : 158 + r0() * 14;
        el("circle", { cx: x, cy: y, r: 2.2, fill: "#ffffff", opacity: 0.9 }, g);
      }
      if (stirred) el("path", { d: `M${cx - 40},130 q40,-26 80,0 q-40,26 -80,0`, fill: "none", stroke: "#ffffff", "stroke-width": 2, "stroke-dasharray": "4 4", opacity: 0.7 }, g);
      // cuchara
      const spoon = el("g", { class: "econ-spoon" }, g);
      el("rect", { x: cx + 50, y: 18, width: 8, height: 80, rx: 4, fill: "#8a94ad", transform: `rotate(20 ${cx + 54} 58)` }, spoon);
      el("ellipse", { cx: cx + 40, cy: 96, rx: 14, ry: 8, fill: "#c7cfdf" }, spoon);
      text(scene, cx, 210, verdict, { "text-anchor": "middle", "font-weight": "700", style: `fill:${ok ? "#1d7a46" : "#b30828"}` });
      return spoon;
    }
    const s1 = pot(150, true, "✓ Revuelta: la cucharada representa la olla", true);
    const s2 = pot(450, false, "✗ Sin revolver: solo pruebas la superficie", false);
    hand(scene, 150, 30, "“¡está salada!”", { "text-anchor": "middle" });
    hand(scene, 450, 30, "“le falta sal…”", { "text-anchor": "middle" });
    onVisible(scene, () => {
      [s1, s2].forEach((s, i) => {
        s.style.transformBox = "fill-box";
        setTimeout(() => {
          tween(420, ease.inOutCubic, (k) => { s.style.transform = `translateY(${-26 * Math.sin(Math.PI * k)}px)`; });
        }, reduced() ? 0 : 300 + i * 220);
      });
      scene.classList.add("is-live");
    });
    const nt = note(root);
    nt.innerHTML = "Lo que importa no es cuánta sopa pruebas, sino <strong>cómo</strong> eliges la cucharada: con una muestra aleatoria, " +
      "cada parte de la población tiene una probabilidad conocida de aparecer, y la muestra se parece a la población.";
  };

  /* ========================================================================
     CASO · Literary Digest 1936: una muestra gigante y sesgada
     ======================================================================== */
  WIDGETS.digest = function (root) {
    caso(root, "Caso real · Muestreo no probabilístico",
      "2,4 millones de respuestas… y se equivocó por casi 20 puntos 🗳️",
      "En 1936 la revista Literary Digest envió 10 millones de encuestas para predecir la elección presidencial de EE. UU. entre Roosevelt y Landon. " +
      "Respondieron 2,4 millones: una de las encuestas más grandes de la historia.");
    const svg = svgBox(root, 600, 196, "Comparación entre la predicción del Literary Digest y el resultado de la elección", true);
    const rows = [
      { y: 24, lbl: "Predicción del Digest", vals: [["Landon", 57, "c3"], ["Roosevelt", 43, "c1"]] },
      { y: 122, lbl: "Resultado real", vals: [["Roosevelt", 61, "c1"], ["Landon", 37, "c3"]] },
    ];
    const x0 = 150, scale = 4.2;
    const bars = [];
    rows.forEach((r) => {
      text(svg, x0 - 12, r.y + 20, r.lbl, { "text-anchor": "end", "font-weight": "700" });
      r.vals.forEach(([who, v, c], k) => {
        const y = r.y + k * 30;
        const rect = el("rect", { x: x0, y, width: 0, height: 24, rx: 4, class: "econ-bar-" + c }, svg);
        const t = text(svg, x0 + 8, y + 17, "", { "font-weight": "700", class: "econ-bar-lbl" });
        bars.push({ rect, t, w: v * scale, v, who });
      });
    });
    hand(svg, 500, 100, "¡el más grande", { "text-anchor": "middle" });
    hand(svg, 500, 122, "no es el mejor!", { "text-anchor": "middle" });
    onVisible(svg, () => {
      bars.forEach((b, i) => {
        setTimeout(() => tween(550, ease.outCubic, (k) => {
          b.rect.setAttribute("width", b.w * k);
          b.t.setAttribute("x", 150 + b.w * k + 8);
          b.t.textContent = `${b.who} ${Math.round(b.v * k)}%`;
        }), reduced() ? 0 : i * 90);
      });
    });
    const nt = note(root);
    nt.innerHTML = "¿Qué falló? La muestra salió de guías telefónicas, registros de automóviles y suscriptores de la revista: en plena Gran Depresión, " +
      "personas con más ingresos que el promedio. Además, solo respondió una de cada cuatro. Una muestra enorme pero <strong>no representativa</strong> " +
      "da una respuesta precisa… sobre la población equivocada. <span class=\"econ-fine\">Porcentajes redondeados.</span>";
  };

  /* ========================================================================
     CASO · Entra Bill Gates al bar (media vs mediana)
     ======================================================================== */
  WIDGETS["bar-gates"] = function (root) {
    caso(root, "Chiste estadístico · Media vs. mediana",
      "Entra Bill Gates a un bar 🍺",
      "En el bar hay 9 personas con ingresos mensuales parecidos. ¿Qué pasa con el ingreso “promedio” cuando entra un multimillonario?");
    const INC = [0.9, 1.1, 1.2, 1.3, 1.3, 1.5, 1.6, 1.8, 2.1]; // millones de $ al mes
    const GATES = 1000; // ilustrativo
    const scene = svgBox(root, 600, 200, "Un bar con nueve clientes y una puerta");
    el("rect", { x: 0, y: 0, width: 600, height: 200, rx: 14, class: "econ-scene-bg" }, scene);
    el("rect", { x: 20, y: 150, width: 470, height: 16, rx: 4, fill: "#8b5a2b" }, scene);
    el("rect", { x: 520, y: 70, width: 60, height: 112, rx: 4, fill: "#c7cfdf", stroke: "#1b2a5e", "stroke-width": 2 }, scene);
    el("circle", { cx: 568, cy: 128, r: 3, fill: "#1b2a5e" }, scene);
    text(scene, 550, 62, "PUERTA", { "text-anchor": "middle", class: "muted", style: "font-size:10px;letter-spacing:.1em" });
    INC.forEach((v, i) => {
      person(scene, 50 + i * 50, 92, { body: ["#005f96", "#2d6f9c", "#3f86b8"][i % 3] });
      text(scene, 50 + i * 50, 186, `$${f(v, 1)}M`, { "text-anchor": "middle", style: "font-size:11px" });
    });
    const gates = person(scene, 494, 92, { body: "#1b2a5e", hat: true });
    const gl = text(scene, 494, 186, `$${GATES}M`, { "text-anchor": "middle", "font-weight": "700", style: "font-size:11px" });
    gates.style.display = "none";
    gl.style.display = "none";
    const joke = hand(scene, 300, 40, "", { "text-anchor": "middle" });

    const tiles = h("div", { class: "econ-tiles" });
    const tMean = h("strong", {}, "—"), tMed = h("strong", {}, "—");
    tiles.append(
      h("div", { class: "econ-tile is-c2" }, h("span", {}, "Media"), tMean, h("em", {}, "millones de $ al mes")),
      h("div", { class: "econ-tile is-c1" }, h("span", {}, "Mediana"), tMed, h("em", {}, "millones de $ al mes")));
    const b = buttons(root);
    const bIn = btn(b, "Que entre Bill Gates 🎩", () => set(true), "econ-btn-gold");
    btn(b, "Que se vaya", () => set(false), "econ-btn-ghost");
    root.append(tiles);
    const nt = note(root);

    const med = (a) => {
      const s = [...a].sort((x, y) => x - y), k = s.length;
      return k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2;
    };
    let state = false;
    let cur = { m: mean(INC), md: med(INC) };
    tMean.textContent = f(cur.m, 2);
    tMed.textContent = f(cur.md, 2);

    function set(on) {
      if (on === state) return;
      state = on;
      bIn.setAttribute("aria-pressed", String(on));
      const data = on ? [...INC, GATES] : INC;
      const next = { m: mean(data), md: med(data) };
      countUp(tMean, cur.m, next.m, 900, (v) => f(v, 2));
      countUp(tMed, cur.md, next.md, 900, (v) => f(v, 2));
      cur = next;
      if (on) {
        gates.style.display = "";
        gl.style.display = "";
        tween(480, ease.outBack, (k) => { gates.setAttribute("transform", `translate(${560 - 66 * k},92)`); });
        joke.textContent = "¡el cliente “promedio” ahora es millonario!";
      } else {
        gates.style.display = "none";
        gl.style.display = "none";
        joke.textContent = "";
      }
      nt.innerHTML = on
        ? `Con Bill Gates la media salta de ${f(mean(INC), 2)} a <strong>${f(next.m, 1)} millones</strong>, pero la mediana apenas pasa de ${f(med(INC), 2)} a <strong>${f(next.md, 2)}</strong>. ` +
          "La media usa el valor de cada dato, así que un atípico la arrastra; la mediana solo mira el dato del medio. <span class=\"econ-fine\">Ingresos ilustrativos.</span>"
        : "Sin atípicos, media y mediana son parecidas. Haz entrar a Bill Gates.";
    }
    nt.innerHTML = "Sin atípicos, media y mediana son parecidas. Haz entrar a Bill Gates.";
  };

  /* ========================================================================
     CASO · Máquina de Galton (intuición del TCL)
     ======================================================================== */
  WIDGETS.galton = function (root) {
    caso(root, "Visual · Teorema central del límite",
      "La máquina de Galton 🎯",
      "Cada bolita choca con 12 clavos y en cada uno va a la izquierda o a la derecha al azar. Su posición final es una suma de 12 decisiones aleatorias… y juntas dibujan una campana.");
    const LEVELS = 12;
    const W = 600, H = 360;
    const cv = h("canvas", { class: "econ-galton", width: W * 2, height: H * 2, role: "img", "aria-label": "Tablero de Galton con bolitas que caen" });
    root.append(cv);
    const ctx = cv.getContext("2d");
    ctx.scale(2, 2);
    const bins = new Array(LEVELS + 1).fill(0);
    const balls = [];
    let pending = 0, total = 0, running = false;
    const pegY0 = 40, pegDy = 14, binTop = pegY0 + LEVELS * pegDy + 10;
    const binW = 36;
    const cx = W / 2;
    const col = () => {
      const cs = getComputedStyle(root);
      return {
        peg: cs.getPropertyValue("--econ-ink-soft").trim() || "#8a94ad",
        ball: cs.getPropertyValue("--econ-c2").trim() || "#c28000",
        bar: cs.getPropertyValue("--econ-c1").trim() || "#005f96",
        curve: cs.getPropertyValue("--econ-c3").trim() || "#b30828",
        ink: cs.getPropertyValue("--md-default-fg-color").trim() || "#222",
      };
    };
    const pegX = (level, k) => cx + (k - level / 2) * binW;

    function draw() {
      const C = col();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = C.peg;
      for (let l = 0; l < LEVELS; l++) for (let k = 0; k <= l; k++) {
        ctx.beginPath(); ctx.arc(pegX(l, k), pegY0 + l * pegDy, 2.6, 0, 2 * Math.PI); ctx.fill();
      }
      const maxB = Math.max(8, ...bins);
      const hMax = H - binTop - 18;
      bins.forEach((b, k) => {
        const x = cx + (k - LEVELS / 2) * binW;
        const hh = (b / maxB) * hMax;
        ctx.fillStyle = C.bar;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x - binW / 2 + 2, H - 18 - hh, binW - 4, hh, [4, 4, 0, 0]) : ctx.rect(x - binW / 2 + 2, H - 18 - hh, binW - 4, hh);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      if (total >= 40) {
        // curva normal con media n/2 y varianza n/4
        ctx.strokeStyle = C.curve; ctx.lineWidth = 2.5; ctx.beginPath();
        const mu = LEVELS / 2, s = Math.sqrt(LEVELS / 4);
        for (let i = 0; i <= 120; i++) {
          const kk = -0.5 + ((LEVELS + 1) * i) / 120;
          const dens = Math.exp(-0.5 * ((kk - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
          const y = H - 18 - (dens * total / maxB) * hMax;
          const x = cx + (kk - LEVELS / 2) * binW;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = C.ball;
      balls.forEach((b) => { ctx.beginPath(); ctx.arc(b.x, b.y, 4.5, 0, 2 * Math.PI); ctx.fill(); });
      ctx.fillStyle = C.ink; ctx.font = "12px Roboto, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`Bolitas: ${total}`, 12, 20);
    }

    function spawn() {
      balls.push({ level: -1, k: 0, t: 0, x: cx, y: 10, fromX: cx, fromY: 10, toX: cx, toY: pegY0, r: Math.random() });
    }

    let last = 0, acc = 0;
    function loop(now) {
      const dt = Math.min(50, now - (last || now));
      last = now;
      acc += dt;
      while (pending > 0 && acc > 16) { spawn(); pending--; acc -= 16; }
      if (pending === 0) acc = 0;
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.t += dt / 48;
        const k = Math.min(1, b.t);
        const e = ease.inQuad(k);
        b.x = b.fromX + (b.toX - b.fromX) * k;
        b.y = b.fromY + (b.toY - b.fromY) * e - Math.sin(Math.PI * k) * 5;
        if (k >= 1) {
          b.level++;
          if (b.level >= LEVELS) {
            bins[b.k]++; total++;
            balls.splice(i, 1);
            continue;
          }
          if (Math.random() >= 0.5) b.k += 1; // derecha; si no, izquierda
          b.fromX = b.x; b.fromY = b.y;
          b.toX = b.level + 1 < LEVELS ? pegX(b.level + 1, b.k) : cx + (b.k - LEVELS / 2) * binW;
          b.toY = b.level + 1 < LEVELS ? pegY0 + (b.level + 1) * pegDy : H - 24;
          b.t = 0;
        }
      }
      draw();
      if (balls.length || pending) requestAnimationFrame(loop);
      else { running = false; last = 0; }
    }
    function drop(n) {
      if (reduced()) {
        for (let i = 0; i < n; i++) {
          let k = 0;
          for (let l = 0; l < LEVELS; l++) k += Math.random() < 0.5 ? 0 : 1;
          bins[k]++; total++;
        }
        draw();
        return;
      }
      pending += n;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    const b = buttons(root);
    btn(b, "Soltar 100 bolitas", () => drop(100), "econ-btn-gold");
    btn(b, "Soltar 500", () => drop(500));
    btn(b, "Vaciar", () => { bins.fill(0); total = 0; balls.length = 0; pending = 0; draw(); }, "econ-btn-ghost");
    const nt = note(root);
    nt.innerHTML = "Ninguna bolita “sabe” que debe formar una campana: cada una es pura suerte. Pero <strong>sumar muchas cosas aleatorias</strong> " +
      "produce una distribución normal. Eso mismo le pasa a <strong>x̄</strong>, que es una suma (dividida por n) de observaciones aleatorias: es la idea del TCL.";
    draw();
    onVisible(cv, () => drop(60));
    // Redibuja si cambia el tema claro/oscuro
    new MutationObserver(draw).observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });
  };

  /* ========================================================================
     CASO · Lanzar el aro (interpretación del intervalo de confianza)
     ======================================================================== */
  WIDGETS.aro = function (root) {
    caso(root, "Analogía · Intervalos de confianza",
      "Lanzar el aro ⭕",
      "El parámetro μ es una estaca clavada en el suelo: está fija, pero no la vemos. Cada muestra lanza un aro (un intervalo). " +
      "“95% de confianza” describe al lanzador: 95 de cada 100 aros encierran la estaca.");
    const svg = svgBox(root, 600, 230, "Aros lanzados alrededor de una estaca");
    el("rect", { x: 0, y: 0, width: 600, height: 230, rx: 14, class: "econ-scene-bg" }, svg);
    el("path", { d: "M20,190 L580,190", stroke: "#1b2a5e", "stroke-width": 2 }, svg);
    const STAKE = 330;
    el("rect", { x: STAKE - 5, y: 80, width: 10, height: 112, rx: 3, fill: "#8b5a2b" }, svg);
    hand(svg, STAKE, 64, "μ (fija, invisible en la vida real)", { "text-anchor": "middle" });
    person(svg, 60, 132, { body: "#005f96" });
    const ringsG = el("g", {}, svg);
    const counter = text(svg, 560, 30, "", { "text-anchor": "end", "font-weight": "700" });
    let hits = 0, thrown = 0, busy = false;
    const r0 = rng(Date.now() % 100000);

    function throwRings(n) {
      if (busy) return;
      busy = true;
      while (ringsG.firstChild) ringsG.removeChild(ringsG.firstChild);
      hits = 0; thrown = 0;
      const half = 70; // semiancho del aro (en píxeles) ≈ 1.96 errores estándar
      const se = half / 1.96;
      for (let i = 0; i < n; i++) {
        setTimeout(() => {
          const center = STAKE + se * gauss(r0);
          const ok = Math.abs(center - STAKE) <= half;
          const y = 186 - i * 4.8;
          const ring = el("ellipse", { cx: 80, cy: 110, rx: half, ry: 4, class: ok ? "econ-ring" : "econ-ring is-miss" }, ringsG);
          tween(520, ease.outCubic, (k) => {
            const x = 80 + (center - 80) * k;
            const yy = 110 + (y - 110) * k - Math.sin(Math.PI * k) * 70;
            ring.setAttribute("cx", x);
            ring.setAttribute("cy", yy);
          }, () => {
            thrown++; if (ok) hits++;
            counter.textContent = `${hits} de ${thrown} aros encierran la estaca`;
            if (thrown === n) busy = false;
          });
        }, reduced() ? 0 : i * 110);
      }
    }
    const b = buttons(root);
    btn(b, "Lanzar 20 aros", () => throwRings(20), "econ-btn-gold");
    const nt = note(root);
    nt.innerHTML = "Una vez que el aro cayó, <strong>encierra la estaca o no</strong>: no tiene sentido decir que “este” aro tiene 95% de probabilidad. " +
      "El 95% es la tasa de acierto del <em>procedimiento</em>. Los aros rojos son los intervalos que fallan; más abajo puedes lanzar cientos con el simulador.";
    onVisible(svg, () => throwRings(20));
  };

  if (typeof document$ !== "undefined") document$.subscribe(E.mountAll);
  E.mountAll();
})();
