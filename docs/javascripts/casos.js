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
  const { WIDGETS, h, el, text, plot, rng, gauss, mean, ols, f, buttons, btn, statsRow, note, histogram } = E;

  // Miles con espacio: el sitio usa punto decimal, así que "10.140" se confundiría con un decimal
  const miles = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

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
    if (lead) {
      // Las bajadas son textos fijos del código y pueden traer énfasis (<em>, <strong>)
      const p = h("p", { class: "econ-caso-lead" });
      p.innerHTML = lead;
      root.append(p);
    }
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
     Componente: historia en pasos (pregunta → problema → diseño → resultado)
     Cada paso tiene un texto y una escena SVG que se redibuja con su animación.
     ======================================================================== */
  function story(root, steps, opts) {
    opts = opts || {};
    const nav = h("div", { class: "econ-steps", role: "tablist" });
    root.append(nav);
    const svg = svgBox(root, 600, opts.height || 230, opts.label || "Escena", opts.chart);
    const body = h("div", { class: "econ-step-body" });
    root.append(body);
    const ctrl = buttons(root);
    const prev = btn(ctrl, "← Anterior", () => go(cur - 1), "econ-btn-ghost");
    const next = btn(ctrl, "Siguiente →", () => go(cur + 1), "econ-btn-gold");
    let cur = -1;
    const pills = steps.map((s, i) => {
      const b = h("button", { type: "button", class: "econ-step-pill", role: "tab" }, h("span", {}, String(i + 1)), s.t);
      b.addEventListener("click", () => go(i));
      nav.append(b);
      return b;
    });
    function go(i) {
      if (i < 0 || i >= steps.length || i === cur) return;
      cur = i;
      pills.forEach((p, k) => {
        p.setAttribute("aria-selected", String(k === i));
        p.classList.toggle("is-done", k < i);
      });
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      if (!opts.chart) el("rect", { x: 0, y: 0, width: 600, height: opts.height || 230, rx: 14, class: "econ-scene-bg" }, svg);
      steps[i].draw(svg);
      body.innerHTML = steps[i].body;
      body.classList.remove("is-in");
      void body.offsetWidth;
      body.classList.add("is-in");
      prev.disabled = i === 0;
      next.disabled = i === steps.length - 1;
      next.textContent = i === steps.length - 2 ? "Ver resultado →" : "Siguiente →";
    }
    onVisible(svg, () => go(0));
    return { go };
  }

  function emoji(parent, x, y, ch, size, delay) {
    const t = text(parent, x, y, ch, { "text-anchor": "middle", style: `font-size:${size || 40}px` });
    popIn(t, delay || 0, 380);
    return t;
  }

  function school(parent, x, y, cls) {
    const g = el("g", { transform: `translate(${x},${y})` }, parent);
    el("polygon", { points: "-13,-2 0,-13 13,-2", class: "econ-roof " + (cls || "") }, g);
    el("rect", { x: -11, y: -2, width: 22, height: 15, rx: 1.5, class: "econ-wall " + (cls || "") }, g);
    el("rect", { x: -3, y: 5, width: 6, height: 8, fill: "#ffffff", opacity: 0.85 }, g);
    return g;
  }

  function factory(parent, x, y, cls) {
    const g = el("g", { transform: `translate(${x},${y})` }, parent);
    g.dataset.scale = "1.3";
    el("path", { transform: "scale(1.3)", d: "M-18,14 L-18,-4 L-8,2 L-8,-4 L2,2 L2,-4 L12,2 L12,-14 L18,-14 L18,14 Z", class: "econ-wall " + (cls || "") }, g);
    return g;
  }

  /* ========================================================================
     CASO · Dos estudios reales, contados como historia
     ======================================================================== */
  WIDGETS["casos-reales"] = function (root) {
    caso(root, "Caso real · La econometría en el mundo real",
      "Dos experimentos que cambiaron decisiones 🌍",
      "La lámina menciona dos estudios. Aquí los contamos paso a paso: qué querían saber, por qué no bastaba con comparar, " +
      "cómo diseñaron el estudio y qué encontraron. Elige un estudio y avanza con los pasos.");
    const tabs = h("div", { class: "econ-seg", role: "tablist" });
    root.append(tabs);
    const holder = h("div");
    root.append(holder);

    const WORMS = [
      {
        t: "La pregunta",
        body: "<strong>Kenia, fines de los 90.</strong> Muchos escolares tenían parásitos intestinales (gusanos), que causan anemia y cansancio. " +
          "Una pastilla antiparasitaria cuesta muy poco. <strong>¿Repartirla en los colegios mejora la salud y la asistencia a clases?</strong>",
        draw: (s) => {
          emoji(s, 150, 130, "🧒", 70, 0);
          emoji(s, 210, 160, "🪱", 34, 250);
          emoji(s, 330, 125, "💊", 54, 450);
          emoji(s, 470, 130, "🏫", 70, 650);
          hand(s, 330, 50, "¿más niños en clases?", { "text-anchor": "middle" });
          drawStroke(handArrow(s, "M370,64 Q430,70 452,92"), 450, 800);
        },
      },
      {
        t: "Por qué no basta comparar",
        body: "Si comparamos niños que toman la pastilla con niños que no, mezclamos otras diferencias: los que la toman pueden venir de " +
          "<strong>familias con más recursos</strong> o de colegios con <strong>mejor acceso a agua potable</strong>, y esos niños faltarían menos de todas formas. " +
          "Es el problema de la lámina <em>Ejemplo</em>: correlación no es causalidad.",
        draw: (s) => {
          text(s, 160, 40, "Toman la pastilla", { "text-anchor": "middle", "font-weight": "700" });
          text(s, 440, 40, "No la toman", { "text-anchor": "middle", "font-weight": "700" });
          [0, 1, 2].forEach((k) => { emoji(s, 110 + k * 50, 100, "🧒", 38, k * 80); emoji(s, 390 + k * 50, 100, "🧒", 38, 120 + k * 80); });
          [["💰 más recursos", 0], ["🚰 agua potable", 1]].forEach(([lbl, k]) => {
            const g = el("g", {}, s);
            el("rect", { x: 80, y: 140 + k * 34, width: 160, height: 26, rx: 13, class: "econ-badge-bg" }, g);
            text(g, 160, 158 + k * 34, lbl, { "text-anchor": "middle", "font-weight": "700" });
            popIn(g, 500 + k * 120, 380);
          });
          hand(s, 440, 175, "¿la pastilla o", { "text-anchor": "middle" });
          hand(s, 440, 198, "todo lo demás?", { "text-anchor": "middle" });
        },
      },
      {
        t: "Cómo lo diseñaron",
        body: "Miguel y Kremer trabajaron con <strong>75 escuelas</strong> del distrito de Busia. Las escuelas se <strong>sortearon en 3 grupos</strong> " +
          "que empezaron a recibir el tratamiento en años distintos (1998, 1999 y 2001). Mientras un grupo esperaba su turno, servía de comparación: " +
          "como el orden fue <strong>al azar</strong>, los grupos eran parecidos en todo lo demás.",
        draw: (s) => {
          const yrs = ["1998", "1999", "2001"];
          yrs.forEach((yv, j) => text(s, 70, 70 + j * 60, `Grupo ${j + 1}`, { "text-anchor": "middle", "font-weight": "700" }));
          text(s, 330, 26, "25 escuelas por grupo · el color indica desde qué año reciben pastillas", { "text-anchor": "middle", class: "muted" });
          const cols = ["#005f96", "#c28000", "#b30828"];
          for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 25; k++) {
              const g = school(s, 130 + (k % 13) * 33, 56 + j * 60 + Math.floor(k / 13) * 24, "is-off");
              setTimeout(() => {
                g.querySelectorAll(".econ-roof, .econ-wall").forEach((n) => { n.classList.remove("is-off"); n.style.fill = cols[j]; });
              }, reduced() ? 0 : 500 + j * 650 + k * 14);
            }
            const t = text(s, 575, 70 + j * 60, yrs[j], { "text-anchor": "end", "font-weight": "700" });
            popIn(t, 450 + j * 650, 360);
          }
        },
      },
      {
        t: "Resultado y decisión",
        body: "<strong>El ausentismo escolar bajó en torno a un cuarto</strong> en las escuelas tratadas. Además, los niños <strong>no tratados</strong> de escuelas vecinas " +
          "también mejoraron, porque hubo menos contagio: son las <em>externalidades</em> del título del paper. Con tan bajo costo, el programa se volvió " +
          "una de las formas más baratas de aumentar la asistencia escolar e inspiró programas masivos de desparasitación (por ejemplo, la iniciativa " +
          "<em>Deworm the World</em>). <span class=\"econ-fine\">Miguel y Kremer (2004), Econometrica · lectura del Certamen 1.</span>",
        draw: (s) => {
          const base = 196;
          el("line", { x1: 60, x2: 540, y1: base, y2: base, stroke: "#1b2a5e", "stroke-width": 2 }, s);
          const bars = [["Escuelas de comparación", 100, "#8fa3c8", 170], ["Escuelas con pastillas", 75, "#005f96", 400]];
          bars.forEach(([lbl, v, col, x], i) => {
            const r = el("rect", { x: x - 50, width: 100, y: base, height: 0, rx: 4, fill: col }, s);
            const t = text(s, x, base - 8, "", { "text-anchor": "middle", "font-weight": "700" });
            text(s, x, 216, lbl, { "text-anchor": "middle" });
            setTimeout(() => tween(650, ease.outCubic, (k) => {
              const hh = v * 1.4 * k;
              r.setAttribute("y", base - hh); r.setAttribute("height", hh);
              t.setAttribute("y", base - hh - 8); t.textContent = Math.round(v * k);
            }), reduced() ? 0 : i * 200);
          });
          text(s, 300, 26, "Ausentismo escolar (índice, comparación = 100)", { "text-anchor": "middle", class: "muted" });
          hand(s, 520, 92, "−25%", { "text-anchor": "middle", style: "font-size:34px" });
        },
      },
    ];

    const BLOOM = [
      {
        t: "La pregunta",
        body: "Las empresas gastan mucho en <strong>consultoras de gestión</strong>. Pero, <strong>¿realmente mejoran la productividad</strong>, " +
          "o es dinero tirado? Bloom y coautores lo estudiaron en grandes empresas textiles cerca de Mumbai, India.",
        draw: (s) => {
          emoji(s, 170, 130, "🏭", 80, 0);
          emoji(s, 300, 130, "➕", 34, 250);
          emoji(s, 420, 130, "📋", 70, 450);
          hand(s, 300, 52, "¿consultoría = más productividad?", { "text-anchor": "middle" });
        },
      },
      {
        t: "Por qué no basta comparar",
        body: "Las empresas que <strong>contratan</strong> consultores suelen ser más grandes, más ricas o más ambiciosas, y quizás serían más productivas " +
          "de todas formas. Comparar “con consultoría” vs. “sin consultoría” mezclaría el efecto de la consultoría con esas diferencias.",
        draw: (s) => {
          text(s, 160, 40, "Contratan consultoría", { "text-anchor": "middle", "font-weight": "700" });
          text(s, 440, 40, "No contratan", { "text-anchor": "middle", "font-weight": "700" });
          [0, 1, 2].forEach((k) => { popIn(factory(s, 110 + k * 50, 100), k * 80, 360); popIn(factory(s, 390 + k * 50, 100), 120 + k * 80, 360); });
          [["💰 más grandes y ricas", 0], ["🚀 más ambiciosas", 1]].forEach(([lbl, k]) => {
            const g = el("g", {}, s);
            el("rect", { x: 70, y: 140 + k * 34, width: 180, height: 26, rx: 13, class: "econ-badge-bg" }, g);
            text(g, 160, 158 + k * 34, lbl, { "text-anchor": "middle", "font-weight": "700" });
            popIn(g, 500 + k * 120, 380);
          });
          hand(s, 440, 175, "¿la consultoría o", { "text-anchor": "middle" });
          hand(s, 440, 198, "la empresa?", { "text-anchor": "middle" });
        },
      },
      {
        t: "Cómo lo diseñaron",
        body: "Los investigadores <strong>sortearon</strong> qué plantas recibían <strong>consultoría gratuita e intensiva</strong> durante varios meses " +
          "(de la consultora Accenture) en prácticas como control de calidad, inventarios y mantención, y cuáles quedaban como grupo de control. " +
          "Como la asignación fue al azar, las diferencias posteriores se deben a la consultoría.",
        draw: (s) => {
          emoji(s, 300, 74, "🪙", 46, 0);
          text(s, 150, 120, "Consultoría gratis", { "text-anchor": "middle", "font-weight": "700" });
          text(s, 450, 120, "Control", { "text-anchor": "middle", "font-weight": "700" });
          for (let k = 0; k < 8; k++) {
            const toT = k % 2 === 0;
            const g = factory(s, 300, 74, toT ? "is-t" : "is-c");
            const tx = (toT ? 72 : 372) + Math.floor(k / 2) * 52, ty = 166;
            g.setAttribute("transform", `translate(${tx},${ty})`);
            g.style.opacity = reduced() ? 1 : 0;
            setTimeout(() => tween(480, ease.outBack, (q) => {
              g.style.opacity = Math.min(1, q * 1.5);
              g.setAttribute("transform", `translate(${300 + (tx - 300) * q},${74 + (ty - 74) * q})`);
            }), reduced() ? 0 : 300 + k * 140);
          }
        },
      },
      {
        t: "Resultado",
        body: "Las plantas tratadas adoptaron más prácticas de gestión y su <strong>productividad subió 17% en el primer año</strong>, gracias a mejor calidad " +
          "y menos inventario. En los <strong>tres años siguientes abrieron más plantas</strong>. Conclusión: la gestión sí causa productividad, y el estudio " +
          "lo <em>cuantifica</em>. <span class=\"econ-fine\">Bloom, Eifert, Mahajan, McKenzie y Roberts (2013), Quarterly Journal of Economics · resumen en J-PAL.</span>",
        draw: (s) => {
          const base = 196;
          el("line", { x1: 60, x2: 540, y1: base, y2: base, stroke: "#1b2a5e", "stroke-width": 2 }, s);
          [["Plantas de control", 100, "#8fa3c8", 170], ["Plantas con consultoría", 117, "#005f96", 400]].forEach(([lbl, v, col, x], i) => {
            const r = el("rect", { x: x - 50, width: 100, y: base, height: 0, rx: 4, fill: col }, s);
            const t = text(s, x, base - 8, "", { "text-anchor": "middle", "font-weight": "700" });
            text(s, x, 216, lbl, { "text-anchor": "middle" });
            setTimeout(() => tween(650, ease.outCubic, (k) => {
              const hh = v * 1.25 * k;
              r.setAttribute("y", base - hh); r.setAttribute("height", hh);
              t.setAttribute("y", base - hh - 8); t.textContent = Math.round(v * k);
            }), reduced() ? 0 : i * 200);
          });
          text(s, 300, 26, "Productividad en el primer año (índice, control = 100)", { "text-anchor": "middle", class: "muted" });
          hand(s, 520, 70, "+17%", { "text-anchor": "middle", style: "font-size:34px" });
        },
      },
    ];

    const STUDIES = [["💊 Pastillas en colegios (Kenia)", WORMS], ["🏭 Consultoría en fábricas (India)", BLOOM]];
    const tbtn = STUDIES.map(([label, steps], i) => {
      const b = h("button", { type: "button", class: "econ-seg-btn", role: "tab" }, label);
      b.addEventListener("click", () => show(i));
      tabs.append(b);
      return b;
    });
    function show(i) {
      tbtn.forEach((b, k) => b.setAttribute("aria-selected", String(k === i)));
      holder.innerHTML = "";
      story(holder, STUDIES[i][1], { label: STUDIES[i][0] });
    }
    show(0);
  };

  /* ========================================================================
     CASO · Métodos de muestreo, aplicados
     ======================================================================== */
  WIDGETS["muestreo-casos"] = function (root) {
    caso(root, "Casos aplicados · Muestreo aleatorio",
      "Cada método, en un caso de la vida real 🔎",
      "Elige un método para ver un caso concreto, cómo se haría paso a paso y cuándo conviene.");
    const tabs = h("div", { class: "econ-seg", role: "tablist" });
    root.append(tabs);
    const svg = svgBox(root, 600, 240, "Escena del método de muestreo");
    const info = h("div", { class: "econ-metodo" });
    root.append(info);
    let timers = [];
    const later = (fn, ms) => { timers.push(setTimeout(fn, reduced() ? 0 : ms)); };
    const r0 = rng(77);

    const METODOS = {
      simple: {
        label: "🎟️ Aleatorio simple",
        caso: "Encuesta de satisfacción a los estudiantes de la USM",
        pasos: ["Conseguir la lista completa de estudiantes (el <em>marco muestral</em>).", "Un computador sortea 100 números de matrícula, como una tómbola.", "Se encuesta a esos 100 estudiantes."],
        ventaja: "Cada estudiante tiene la <strong>misma probabilidad</strong> de salir: es el método más simple de explicar.",
        cuidado: "Necesitas la lista completa; y por azar podrían salir muy pocos de alguna carrera chica.",
        draw: (s) => {
          const drum = el("g", { class: "econ-drum" }, s);
          el("circle", { cx: 110, cy: 125, r: 72, fill: "#ffffff", stroke: "#1b2a5e", "stroke-width": 4 }, drum);
          for (let k = 0; k < 16; k++) {
            const a = k * 2.4, rr = 18 + (k % 4) * 12;
            el("circle", { cx: 110 + rr * Math.cos(a), cy: 125 + rr * Math.sin(a), r: 9, fill: ["#005f96", "#c28000", "#b30828", "#8fa3c8"][k % 4] }, drum);
          }
          el("rect", { x: 102, y: 196, width: 16, height: 26, fill: "#1b2a5e" }, s);
          text(s, 110, 40, "tómbola", { "text-anchor": "middle", class: "muted" });
          const dots = [];
          for (let i = 0; i < 60; i++) {
            const x = 270 + (i % 12) * 26, y = 64 + Math.floor(i / 12) * 28;
            dots.push(el("circle", { cx: x, cy: y, r: 8, class: "econ-pop" }, s));
          }

          const picked = shuffleIdx(60, r0).slice(0, 8);
          const cnt = text(s, 413, 38, "60 estudiantes · seleccionados: 0", { "text-anchor": "middle", "font-weight": "700" });
          picked.forEach((idx, j) => later(() => {
            const d = dots[idx];
            const ball = el("circle", { cx: 110, cy: 60, r: 9, fill: "#e5b300", stroke: "#1b2a5e", "stroke-width": 1.5 }, s);
            const tx = +d.getAttribute("cx"), ty = +d.getAttribute("cy");
            tween(520, ease.outCubic, (k) => {
              ball.setAttribute("cx", 110 + (tx - 110) * k);
              ball.setAttribute("cy", 60 + (ty - 60) * k - Math.sin(Math.PI * k) * 60);
            }, () => { ball.remove(); d.classList.add("is-on"); popIn(d, 0, 260); cnt.textContent = `60 estudiantes · seleccionados: ${j + 1}`; });
          }, 300 + j * 380));
          hand(s, 413, 222, "todos con la misma probabilidad", { "text-anchor": "middle", style: "font-size:20px" });
        },
      },
      sistematico: {
        label: "🍾 Sistemático",
        caso: "Control de calidad en una embotelladora",
        pasos: ["Se sortea un número de inicio entre 1 y 10 (por ejemplo, la botella 3).", "Desde ahí se revisa <strong>una de cada 10</strong> botellas: la 3, 13, 23, 33…", "Con las botellas revisadas se estima la proporción de defectuosas."],
        ventaja: "Muy fácil de aplicar sobre una fila o una lista ordenada, sin tener que sortear cada elemento.",
        cuidado: "Si el proceso tiene un patrón que se repite cada 10 botellas (una máquina con 10 boquillas, por ejemplo), siempre revisarías la misma boquilla.",
        draw: (s) => {
          el("rect", { x: 0, y: 168, width: 600, height: 14, fill: "#5a6785" }, s);
          for (let k = 0; k < 15; k++) el("circle", { cx: 20 + k * 40, cy: 189, r: 6, fill: "#8a94ad" }, s);
          const belt = el("g", { class: "econ-belt" }, s);
          for (let i = -10; i < 15; i++) {
            const x = 20 + i * 40;
            const chk = ((i % 10) + 10) % 10 === 3;
            const g = el("g", {}, belt);
            el("rect", { x: x - 9, y: 120, width: 18, height: 46, rx: 5, fill: chk ? "#c28000" : "#7fb7dc", stroke: "#1b2a5e", "stroke-width": 1.5 }, g);
            el("rect", { x: x - 4, y: 106, width: 8, height: 16, rx: 2, fill: chk ? "#c28000" : "#7fb7dc", stroke: "#1b2a5e", "stroke-width": 1.5 }, g);
            if (chk) text(g, x, 96, "🔍", { "text-anchor": "middle", style: "font-size:20px" });
          }
          hand(s, 300, 44, "inicio al azar: la 3ª · luego cada 10", { "text-anchor": "middle" });
          s.classList.add("is-live");
        },
      },
      estratificado: {
        label: "🎓 Estratificado",
        caso: "Encuesta a estudiantes de Ingeniería Comercial, Civil e Informática",
        pasos: ["Dividir a la población en <strong>estratos</strong> (aquí, carreras), cada uno más homogéneo por dentro.", "Sortear dentro de cada carrera, en proporción a su tamaño: 50% → 5, 30% → 3, 20% → 2.", "Juntar las tres submuestras en una muestra de 10."],
        ventaja: "Garantiza que <strong>todos los grupos aparezcan</strong> en la muestra y suele dar estimaciones más precisas.",
        cuidado: "Necesitas saber de antemano a qué estrato pertenece cada persona.",
        draw: (s) => {
          const groups = [["Ing. Comercial · 50%", 20, 5, "#005f96"], ["Ing. Civil · 30%", 12, 3, "#c28000"], ["Informática · 20%", 8, 2, "#b30828"]];
          const tray = [];
          let t = 0;
          groups.forEach(([lbl, n, pick, col], j) => {
            const y0 = 30 + j * 68;
            el("rect", { x: 20, y: y0, width: 330, height: 56, rx: 10, fill: "#ffffff", stroke: col, "stroke-width": 2 }, s);
            text(s, 30, y0 + 16, lbl, { "font-weight": "700" });
            const ds = [];
            for (let k = 0; k < n; k++) ds.push(el("circle", { cx: 40 + k * 15, cy: y0 + 38, r: 6, fill: col, opacity: 0.85 }, s));
            shuffleIdx(n, r0).slice(0, pick).forEach((idx) => {
              const d = ds[idx];
              const slot = tray.length;
              tray.push(1);
              const tx = 420 + (slot % 5) * 30, ty = 100 + Math.floor(slot / 5) * 34;
              later(() => {
                const fx = +d.getAttribute("cx"), fy = +d.getAttribute("cy");
                d.setAttribute("opacity", 0.25);
                const m = el("circle", { cx: fx, cy: fy, r: 9, fill: col, stroke: "#1b2a5e", "stroke-width": 1.5 }, s);
                tween(480, ease.outCubic, (k) => {
                  m.setAttribute("cx", fx + (tx - fx) * k);
                  m.setAttribute("cy", fy + (ty - fy) * k - Math.sin(Math.PI * k) * 40);
                });
              }, 300 + t++ * 260);
            });
          });
          el("rect", { x: 400, y: 70, width: 165, height: 100, rx: 12, fill: "#ffffff", stroke: "#1b2a5e", "stroke-width": 2, "stroke-dasharray": "5 4" }, s);
          text(s, 482, 60, "Muestra (n = 10)", { "text-anchor": "middle", "font-weight": "700" });
          hand(s, 482, 205, "5 + 3 + 2", { "text-anchor": "middle" });
        },
      },
      conglomerados: {
        label: "🏫 Conglomerados",
        caso: "Estudio sobre hábitos de lectura de escolares de una región",
        pasos: ["Hacer la lista de <strong>colegios</strong> (no hace falta la lista de todos los alumnos).", "Sortear algunos colegios: los <em>conglomerados</em>.", "Encuestar a los alumnos de los colegios sorteados (todos, o una muestra dentro de cada uno)."],
        ventaja: "Mucho <strong>más barato</strong>: el encuestador visita 3 colegios en vez de recorrer toda la región.",
        cuidado: "Si los colegios son muy distintos entre sí, la estimación es menos precisa que con un muestreo simple del mismo tamaño.",
        draw: (s) => {
          const chosen = new Set(shuffleIdx(12, r0).slice(0, 3));
          for (let i = 0; i < 12; i++) {
            const cx = 70 + (i % 6) * 92, cy = 62 + Math.floor(i / 6) * 96;
            const card = el("rect", { x: cx - 38, y: cy - 30, width: 76, height: 78, rx: 10, class: "econ-cluster" }, s);
            school(s, cx, cy - 6);
            const kids = [];
            for (let k = 0; k < 6; k++) kids.push(el("circle", { cx: cx - 25 + k * 10, cy: cy + 32, r: 4, fill: "#8fa3c8" }, s));
            if (chosen.has(i)) {
              later(() => { card.classList.add("is-on"); popIn(card, 0, 320); }, 400 + [...chosen].indexOf(i) * 300);
              later(() => kids.forEach((kd) => kd.setAttribute("fill", "#c28000")), 1500);
            } else {
              later(() => card.classList.add("is-dim"), 1400);
            }
          }
          hand(s, 300, 232, "se sortean colegios, no alumnos", { "text-anchor": "middle", style: "font-size:20px" });
        },
      },
    };

    function shuffleIdx(n, r) {
      const a = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    }

    const btns = {};
    Object.entries(METODOS).forEach(([k, m]) => {
      btns[k] = h("button", { type: "button", class: "econ-seg-btn", role: "tab" }, m.label);
      btns[k].addEventListener("click", () => show(k));
      tabs.append(btns[k]);
    });
    function show(k) {
      timers.forEach(clearTimeout);
      timers = [];
      Object.entries(btns).forEach(([kk, b]) => b.setAttribute("aria-selected", String(kk === k)));
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.classList.remove("is-live");
      el("rect", { x: 0, y: 0, width: 600, height: 240, rx: 14, class: "econ-scene-bg" }, svg);
      const m = METODOS[k];
      m.draw(svg);
      info.innerHTML =
        `<div class="econ-metodo-caso">📌 <strong>Caso:</strong> ${m.caso}</div>` +
        `<ol>${m.pasos.map((p) => `<li>${p}</li>`).join("")}</ol>` +
        `<div class="econ-metodo-pc"><div><strong>✓ Ventaja:</strong> ${m.ventaja}</div><div><strong>⚠ Cuidado:</strong> ${m.cuidado}</div></div>`;
    }
    onVisible(svg, () => show("simple"));
  };

  /* ========================================================================
     CASO · Muestreo no probabilístico: la encuesta por Instagram
     ======================================================================== */
  WIDGETS["no-prob"] = function (root) {
    caso(root, "Caso · Muestreo no probabilístico",
      "La encuesta por Instagram 📱",
      "La cuenta de Instagram del curso publica una historia: “¿Te gusta la econometría?”. ¿Podemos concluir qué piensan todos los estudiantes de la USM?");
    const scene = svgBox(root, 600, 250, "Teléfono con una encuesta en una historia de Instagram");
    el("rect", { x: 0, y: 0, width: 600, height: 250, rx: 14, class: "econ-scene-bg" }, scene);
    el("rect", { x: 40, y: 14, width: 150, height: 226, rx: 22, fill: "#1b2a5e" }, scene);
    el("rect", { x: 48, y: 26, width: 134, height: 202, rx: 14, fill: "url(#econ-ig)" }, scene);
    const defs = el("defs", {}, scene);
    const g = el("linearGradient", { id: "econ-ig", x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el("stop", { offset: 0, "stop-color": "#f58529" }, g);
    el("stop", { offset: 0.5, "stop-color": "#dd2a7b" }, g);
    el("stop", { offset: 1, "stop-color": "#8134af" }, g);
    text(scene, 115, 70, "¿Te gusta la", { "text-anchor": "middle", style: "fill:#fff;font-weight:700;font-size:13px" });
    text(scene, 115, 88, "econometría? 🤓", { "text-anchor": "middle", style: "fill:#fff;font-weight:700;font-size:13px" });
    const bars = [["Sí 💙", 92, 112], ["No", 8, 150]].map(([lbl, v, y]) => {
      el("rect", { x: 60, y, width: 110, height: 26, rx: 13, fill: "#ffffff", opacity: 0.9 }, scene);
      const fill = el("rect", { x: 60, y, width: 0, height: 26, rx: 13, fill: "#e5b300" }, scene);
      text(scene, 70, y + 17, lbl, { style: "font-weight:700;font-size:12px" });
      const t = text(scene, 160, y + 17, "0%", { "text-anchor": "end", style: "font-weight:700;font-size:12px" });
      return { fill, t, v };
    });
    text(scene, 115, 210, "Votos: 250", { "text-anchor": "middle", style: "fill:#fff;font-size:11px" });
    const hearts = el("g", {}, scene);
    hand(scene, 400, 50, "¿quiénes votaron?", { "text-anchor": "middle" });
    const who = [["👀 solo quienes siguen la cuenta", 90], ["📲 y vieron la historia ese día", 128], ["🙋 y quisieron responder", 166]].map(([lbl, y]) => {
      const gg = el("g", {}, scene);
      el("rect", { x: 250, y: y - 18, width: 300, height: 28, rx: 14, class: "econ-badge-bg" }, gg);
      text(gg, 400, y + 1, lbl, { "text-anchor": "middle", "font-weight": "700" });
      gg.style.opacity = 0;
      return gg;
    });
    hand(scene, 400, 222, "= los fans del curso, no “todos”", { "text-anchor": "middle", style: "font-size:20px" });
    onVisible(scene, () => {
      bars.forEach((b) => tween(1100, ease.outCubic, (k) => {
        b.fill.setAttribute("width", 110 * (b.v / 100) * k);
        b.t.textContent = Math.round(b.v * k) + "%";
      }));
      for (let i = 0; i < 7; i++) {
        later(() => {
          const ht = text(hearts, 150 + (i % 3) * 12, 200, "💙", { style: "font-size:16px" });
          tween(900, ease.outCubic, (k) => { ht.setAttribute("y", 200 - 150 * k); ht.style.opacity = 1 - k; }, () => ht.remove());
        }, i * 140);
      }
      who.forEach((w, i) => later(() => { w.style.opacity = 1; popIn(w, 0, 360); }, 900 + i * 300));
    });
    function later(fn, ms) { setTimeout(fn, reduced() ? 0 : ms); }
    const nt = note(root);
    nt.innerHTML = "El 92% dice que sí… pero respondieron <strong>solo quienes eligieron responder</strong>: nadie sorteó a los participantes y no sabemos la probabilidad " +
      "de que cada estudiante aparezca. Otros ejemplos de muestreo no probabilístico: encuestar en la puerta de un mall, pedir voluntarios, o " +
      "<em>bola de nieve</em> (cada encuestado recomienda al siguiente). Sirven para explorar ideas, <strong>no para inferir sobre toda la población</strong>. " +
      "A continuación, un caso histórico donde esto salió muy mal. <span class=\"econ-fine\">Encuesta ilustrativa.</span>";
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

  /* ========================================================================
     CLASE 2 · Regresión lineal simple
     ======================================================================== */

  function mochila(parent, x, y, s) {
    const g = el("g", { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
    el("path", { d: "M-24,-34 Q0,-62 24,-34", fill: "none", stroke: "#1b2a5e", "stroke-width": 5, "stroke-linecap": "round" }, g);
    el("rect", { x: -38, y: -36, width: 76, height: 88, rx: 18, fill: "#c28000", stroke: "#1b2a5e", "stroke-width": 3 }, g);
    const flap = el("path", { d: "M-38,-14 Q0,10 38,-14 L38,-24 Q0,-2 -38,-24 Z", fill: "#8a5a00" }, g);
    el("rect", { x: -14, y: 14, width: 28, height: 22, rx: 5, fill: "#e5b300", stroke: "#1b2a5e", "stroke-width": 2 }, g);
    text(g, 0, 31, "u", { "text-anchor": "middle", style: "font-size:18px;font-weight:700" });
    return { g, flap };
  }

  /* --- Caso · ¿Qué hay en la mochila de u? ------------------------------- */
  WIDGETS["mochila-u"] = function (root) {
    caso(root, "Caso · El término de error",
      "¿Qué hay en la mochila de u? 🎒",
      "En salario = β₀ + β₁·educación + u, todo lo que afecta el salario y no es la educación viaja escondido en u. " +
      "Abre la mochila y, para cada factor, decide si se relaciona con los años de educación. Esa es justamente la pregunta de la lámina.");
    const scene = svgBox(root, 600, 160, "Ecuación del salario con una mochila que representa el término de error u");
    el("rect", { x: 0, y: 0, width: 600, height: 160, rx: 14, class: "econ-scene-bg" }, scene);
    text(scene, 245, 92, "salario = β₀ + β₁·educación +", { "text-anchor": "middle", style: "font-size:22px;font-weight:700" });
    const bag = mochila(scene, 495, 86);
    const burst = el("g", {}, scene);
    hand(scene, 432, 140, "lo que no observamos →", { "text-anchor": "end", style: "font-size:19px" });

    const ITEMS = [
      { e: "💡", n: "Habilidad", rel: true, why: "Las personas más hábiles tienden a estudiar más años, y la habilidad también sube el salario." },
      { e: "👪", n: "Ingreso y educación de los padres", rel: true, why: "Las familias con más recursos financian más años de estudio a sus hijos." },
      { e: "⏳", n: "Experiencia laboral", rel: true, why: "A una misma edad, quien estudió más años alcanzó a trabajar menos: es una relación negativa." },
      { e: "🎯", n: "Motivación y esfuerzo", rel: true, why: "La gente más motivada suele estudiar más y también rendir más en el trabajo." },
      { e: "🍀", n: "Suerte en la búsqueda de empleo", rel: false, why: "Encontrar por suerte un buen trabajo afecta el salario, pero no depende de cuántos años estudiaste." },
      { e: "📝", n: "Error al reportar el salario en la encuesta", rel: false, why: "Cambia el salario medido (está en u), pero no depende de cuántos años estudió la persona." },
    ];
    const b = buttons(root);
    const openBtn = btn(b, "Abrir la mochila 🎒", open, "econ-btn-gold");
    const grid = h("div", { class: "econ-cards6" });
    root.append(grid);
    const nt = note(root);
    nt.innerHTML = "Abre la mochila para ver qué factores se esconden en u.";
    let answered = 0, right = 0, opened = false;

    function open() {
      if (opened) return;
      opened = true;
      openBtn.disabled = true;
      tween(320, ease.outBack, (k) => bag.flap.setAttribute("transform", `translate(0,${-12 * k})`));
      ITEMS.forEach((it, i) => {
        const t = text(burst, 495, 70, it.e, { "text-anchor": "middle", style: "font-size:26px" });
        const tx = 310 + i * 52, ty = 30 + (i % 2) * 18;
        setTimeout(() => tween(520, ease.outCubic, (k) => {
          t.setAttribute("x", 495 + (tx - 495) * k);
          t.setAttribute("y", 70 + (ty - 70) * k - Math.sin(Math.PI * k) * 30);
        }), reduced() ? 0 : i * 90);
      });
      ITEMS.forEach((it, i) => {
        const fb = h("p", { class: "econ-card6-fb" });
        const yes = h("button", { type: "button", class: "econ-quiz-opt" }, "Sí se relaciona");
        const no = h("button", { type: "button", class: "econ-quiz-opt" }, "No se relaciona");
        const card = h("div", { class: "econ-card6" },
          h("div", { class: "econ-card6-e" }, it.e),
          h("strong", {}, it.n),
          h("div", { class: "econ-card6-opts" }, yes, no), fb);
        const pick = (saysRel, btnEl) => {
          if (card.dataset.done) return;
          card.dataset.done = "1";
          const ok = saysRel === it.rel;
          btnEl.classList.add(ok ? "is-right" : "is-wrong");
          (it.rel ? yes : no).classList.add("is-right");
          fb.innerHTML = (ok ? "✅ " : "❌ ") + it.why;
          answered++;
          if (ok) right++;
          if (answered === ITEMS.length) {
            nt.innerHTML = `Acertaste <strong>${right} de ${ITEMS.length}</strong>. Si <em>algún</em> factor de u se relaciona con la educación, ` +
              "no se cumple E[u|x] = 0 y β̂₁ ya no mide el efecto <em>ceteris paribus</em> de la educación: también captura el efecto de esos factores. " +
              "Esta idea es el corazón de la Clase 3 (sesgo por variable omitida).";
          }
        };
        yes.addEventListener("click", () => pick(true, yes));
        no.addEventListener("click", () => pick(false, no));
        grid.append(card);
        card.style.opacity = reduced() ? 1 : 0;
        setTimeout(() => {
          tween(380, ease.outBack, (k) => { card.style.opacity = Math.min(1, k * 1.4); card.style.transform = `translateY(${10 * (1 - k)}px)`; });
        }, reduced() ? 0 : 500 + i * 70);
      });
      nt.innerHTML = "Clasifica los 6 factores. Pregunta guía: ¿quienes estudian más años tienen, en promedio, más (o menos) de este factor?";
    }
  };

  /* --- Visual · La regresión es un promedio por grupos -------------------- */
  WIDGETS["esperanza-cond"] = function (root) {
    caso(root, "Visual · Esperanza condicional",
      "La regresión es un promedio por grupos 📊",
      "E[Y | X = x] es el promedio de Y entre quienes tienen el mismo valor de X. Primero con los 4 datos de la lámina; " +
      "después con 400 personas, donde se ve que la recta de regresión pasa casi exactamente por esos promedios.");
    const seg = h("div", { class: "econ-seg", role: "tablist" });
    root.append(seg);
    const wrap = h("div");
    root.append(wrap);
    const p = plot(wrap, 600, 300, { l: 52, b: 40 });
    const nt = note(root);
    const PEOPLE = [["María", 5, 120], ["Juan", 5, 100], ["Pedro", 4, 80], ["Catalina", 2, 50]];
    const r0 = rng(12);
    const BIG = Array.from({ length: 400 }, () => {
      const e = 8 + Math.floor(r0() * 11);
      return [e, 150 + 62 * e + 170 * gauss(r0)];
    });
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, reduced() ? 0 : ms));
    const VIEWS = {
      cuatro: {
        label: "1 · Los 4 de la lámina",
        draw: () => {
          p.domain([0, 7], [0, 140]);
          p.axes({ xlabel: "Años de educación (X)", ylabel: "Ingreso (Y)", nx: 7 });
          const g = p.clipped();
          el("line", { x1: p.x(0), x2: p.x(7), y1: p.y(87.5), y2: p.y(87.5), class: "line-gold line-dash" }, g);
          text(p.svg, p.x(6.95), p.y(87.5) - 6, "E[Y] = 87.5", { "text-anchor": "end", "font-weight": "700" });
          PEOPLE.forEach(([nm, x, y], i) => {
            const c = el("circle", { cx: p.x(x), cy: p.y(140), r: 7, class: "econ-dot", style: "fill:var(--econ-c1)" }, g);
            const t = text(p.svg, p.x(x) + 11, p.y(y) + 4, nm, { style: "opacity:0" });
            later(() => tween(520, ease.outBack, (k) => { c.setAttribute("cy", p.y(140) + (p.y(y) - p.y(140)) * k); }, () => { t.style.opacity = 1; }), 150 + i * 160);
          });
          [[5, 110], [4, 80], [2, 50]].forEach(([x, m], i) => {
            later(() => {
              const d = el("path", { d: `M${p.x(x) - 9},${p.y(m)} l9,-9 l9,9 l-9,9 z`, style: "fill:var(--econ-c2)" }, p.svg);
              popIn(d, 0, 360);
              hand(p.svg, p.x(x) - 14, p.y(m) + (x === 5 ? -14 : 24), `E[Y|X=${x}] = ${m}`, { "text-anchor": "end", style: "font-size:19px" });
            }, 1000 + i * 260);
          });
        },
        txt: "María y Juan tienen 5 años de educación: el promedio de su grupo es (120 + 100)/2 = <strong>110</strong>. Pedro (4 años) y Catalina (2 años) " +
          "están solos en su grupo. Los rombos son la <strong>función de esperanza condicional</strong>; la línea punteada es el promedio general E[Y] = 87.5, " +
          "que ignora la educación.",
      },
      muchos: {
        label: "2 · Con 400 personas",
        draw: () => {
          p.domain([7, 19], [0, 1800]);
          p.axes({ xlabel: "Años de educación (X)", ylabel: "Ingreso (miles de $)", nx: 6 });
          const g = p.clipped();
          BIG.forEach(([x, y], i) => {
            const c = el("circle", { cx: p.x(x + (r0() - 0.5) * 0.5), cy: p.y(y), r: 2.6, style: "fill:var(--econ-c1);opacity:0" }, g);
            later(() => { c.style.transition = "opacity .3s"; c.style.opacity = 0.35; }, i);
          });
          const means = [];
          for (let e = 8; e <= 18; e++) {
            const ys = BIG.filter(([x]) => x === e).map(([, y]) => y);
            means.push([e, mean(ys)]);
          }
          means.forEach(([x, m], i) => later(() => {
            const d = el("path", { d: `M${p.x(x) - 7},${p.y(m)} l7,-7 l7,7 l-7,7 z`, style: "fill:var(--econ-c2);stroke:var(--md-default-bg-color);stroke-width:1.5" }, p.svg);
            popIn(d, 0, 320);
          }, 600 + i * 45));
          later(() => {
            const o = ols(BIG.map((d) => d[0]), BIG.map((d) => d[1]));
            const ln = el("path", { d: `M${p.x(7.5)},${p.y(o.b0 + o.b1 * 7.5)} L${p.x(18.5)},${p.y(o.b0 + o.b1 * 18.5)}`, class: "line" }, p.svg);
            drawStroke(ln, 600, 0);
            hand(p.svg, p.x(9.4), p.y(1500), "la recta pasa (casi)", {});
            hand(p.svg, p.x(9.4), p.y(1380), "por los promedios (rombos)", {});
          }, 1300);
        },
        txt: "Con muchas personas hay muchos ingresos distintos para cada nivel de educación. Los <strong>rombos</strong> son los promedios de cada grupo, " +
          "E[Y|X = x], y la recta roja es la regresión: <strong>la regresión lineal aproxima la esperanza condicional</strong>, que es lo que dice la lámina " +
          "“el MRS aproxima la esperanza condicional de y”. <span class=\"econ-fine\">Datos simulados con fines ilustrativos.</span>",
      },
    };
    const btns = {};
    Object.entries(VIEWS).forEach(([k, v]) => {
      btns[k] = h("button", { type: "button", class: "econ-seg-btn", role: "tab" }, v.label);
      btns[k].addEventListener("click", () => show(k));
      seg.append(btns[k]);
    });
    function show(k) {
      timers.forEach(clearTimeout);
      timers = [];
      Object.entries(btns).forEach(([kk, b]) => b.setAttribute("aria-selected", String(kk === k)));
      p.clear();
      VIEWS[k].draw();
      nt.innerHTML = VIEWS[k].txt;
    }
    onVisible(wrap, () => show("cuatro"));
  };

  /* --- Pregunta clave · ¿Por qué al cuadrado? ----------------------------- */
  WIDGETS.cuadrados = function (root) {
    caso(root, "Pregunta clave · Mínimos cuadrados",
      "¿Por qué se elevan los residuos al cuadrado? 🟥",
      "Una idea tentadora: “elegir la recta cuyos residuos sumen cero”. El problema es que muchas rectas cumplen eso, incluso algunas pésimas. " +
      "Compara las dos rectas y luego eleva los residuos al cuadrado.");
    const X = [1, 2, 3, 4, 5, 6, 7], Y = [2.0, 3.4, 2.5, 4.9, 4.6, 6.6, 6.0];
    const o = ols(X, Y);
    const LINES = {
      a: { label: "Recta A · la de MCO", f: (x) => o.b0 + o.b1 * x },
      b: { label: "Recta B · horizontal en ȳ", f: () => o.my },
    };
    const st = { line: "a", sq: false };
    const seg = h("div", { class: "econ-seg", role: "tablist" });
    root.append(seg);
    const segB = {};
    Object.entries(LINES).forEach(([k, v]) => {
      segB[k] = h("button", { type: "button", class: "econ-seg-btn", role: "tab" }, v.label);
      segB[k].addEventListener("click", () => { st.line = k; render(true); });
      seg.append(segB[k]);
    });
    const b = buttons(root);
    const sqBtn = toggleBtn(b, "Elevar al cuadrado (ûᵢ²)", (v) => { st.sq = v; render(true); });
    const wrap = h("div");
    root.append(wrap);
    const p = plot(wrap, 600, 300, { l: 40 });
    const stats = statsRow(root, [
      { k: "s", label: "Suma de residuos Σûᵢ" },
      { k: "s2", label: "Suma de cuadrados Σûᵢ²", cls: "is-red" },
      { k: "v", label: "Veredicto", cls: "is-gold" },
    ]);
    const nt = note(root);

    function toggleBtn(parent, label, onChange) {
      const bt = btn(parent, label, () => {
        const v = bt.getAttribute("aria-pressed") !== "true";
        bt.setAttribute("aria-pressed", String(v));
        onChange(v);
      }, "econ-btn-gold");
      bt.setAttribute("aria-pressed", "false");
      return bt;
    }

    function render(animate) {
      Object.entries(segB).forEach(([k, bt]) => bt.setAttribute("aria-selected", String(k === st.line)));
      const fn = LINES[st.line].f;
      const res = X.map((x, i) => Y[i] - fn(x));
      const ssr = res.reduce((s, r) => s + r * r, 0);
      const ssrA = X.reduce((s, x, i) => s + (Y[i] - LINES.a.f(x)) ** 2, 0);
      const ssrB = X.reduce((s, x, i) => s + (Y[i] - LINES.b.f(x)) ** 2, 0);
      p.clear();
      p.domain([0, 8], [0, 8]);
      p.axes({ xlabel: "x", ylabel: "y", nx: 8 });
      const g = p.clipped();
      X.forEach((x, i) => {
        const y1 = p.y(Y[i]), y2 = p.y(fn(x));
        if (st.sq) {
          const side = Math.abs(y1 - y2);
          const sq = el("rect", { x: p.x(x), y: Math.min(y1, y2), width: 0, height: 0, class: "sq", style: "fill-opacity:.16;stroke-opacity:.55" }, g);
          setTimeout(() => tween(animate ? 420 : 0, ease.outBack, (k) => {
            sq.setAttribute("width", Math.max(0, side * k));
            sq.setAttribute("height", Math.max(0, side * k));
          }), reduced() || !animate ? 0 : i * 60);
        }
        el("line", { x1: p.x(x), x2: p.x(x), y1, y2, class: "resid", style: "stroke-width:2px;stroke-opacity:.8" }, g);
      });
      p.lineFn(g, fn, st.line === "a" ? "line" : "line-navy");
      X.forEach((x, i) => el("circle", { cx: p.x(x), cy: p.y(Y[i]), r: 6, class: "pt" }, g));
      if (st.sq && st.line === "b") hand(p.svg, p.x(4.6), p.y(1.2), "¡residuos grandes, cuadrados enormes!", { "text-anchor": "middle" });
      if (!st.sq) hand(p.svg, p.x(0.4), p.y(7.4), "los residuos + y − se compensan…", {});
      stats.set("s", f(res.reduce((s, r) => s + r, 0), 2));
      stats.set("s2", st.sq ? f(ssr, 2) : "?");
      stats.set("v", st.sq ? (st.line === "a" ? "MCO gana: es la mínima" : `Peor: ${f(ssrB / ssrA, 1)}× más que A`) : "Empate engañoso");
      nt.innerHTML = st.sq
        ? `Al elevar al cuadrado, todos los residuos suman (ninguno compensa a otro) y los grandes pesan mucho más. La recta A tiene Σûᵢ² = ${f(ssrA, 2)} y la B, ` +
          `${f(ssrB, 2)}. <strong>MCO elige la recta con la menor suma de cuadrados</strong>: es la definición de la lámina.`
        : "Las dos rectas tienen residuos que <strong>suman cero</strong>: los positivos compensan a los negativos (cualquier recta que pase por el punto de promedios lo cumple). " +
          "Por eso minimizar Σûᵢ no sirve para elegir. Prueba “Elevar al cuadrado (ûᵢ²)”.";
    }
    onVisible(wrap, () => render(false));
  };

  /* --- Aplicación · Interpretar la recta estimada ------------------------- */
  WIDGETS.prediccion = function (root) {
    caso(root, "Aplicación · Interpretar los coeficientes",
      "¿Cuánto más gana alguien que estudia 4 años más? 💼",
      "Usemos la estimación de la lámina: salario = 0.095 + 0.54·educación (dólares por hora, EE. UU.). Mueve los años de educación de Ana y de Bruno.");
    const B0 = 0.095, B1 = 0.54;
    const st = { a: 12, b: 16 };
    const c = E.controls(root);
    E.slider(c, { label: "Ana: años de educación", min: 0, max: 20, step: 1, value: st.a }, (v) => { st.a = v; render(); });
    E.slider(c, { label: "Bruno: años de educación", min: 0, max: 20, step: 1, value: st.b }, (v) => { st.b = v; render(); });
    const wrap = h("div");
    root.append(wrap);
    const p = plot(wrap, 600, 300, { l: 46 });
    const stats = statsRow(root, [
      { k: "a", label: "Salario predicho de Ana" },
      { k: "b", label: "Salario predicho de Bruno" },
      { k: "d", label: "Diferencia por hora", cls: "is-gold" },
      { k: "y", label: "Diferencia al año (2 080 h)", cls: "is-red" },
    ]);
    const nt = note(root);
    let first = true;
    function render() {
      const yA = B0 + B1 * st.a, yB = B0 + B1 * st.b, d = yB - yA;
      p.clear();
      p.domain([0, 20], [0, 12]);
      p.axes({ xlabel: "Años de educación", ylabel: "Salario por hora (US$)", nx: 10 });
      const g = p.clipped();
      const ln = el("path", { d: `M${p.x(0)},${p.y(B0)} L${p.x(20)},${p.y(B0 + B1 * 20)}`, class: "line" }, g);
      if (first) { drawStroke(ln, 700, 0); first = false; }
      [[st.a, yA, "Ana", "var(--econ-c1)"], [st.b, yB, "Bruno", "var(--econ-c2)"]].forEach(([x, y, nm, col]) => {
        el("line", { x1: p.x(x), x2: p.x(x), y1: p.y(0), y2: p.y(y), style: `stroke:${col};stroke-dasharray:4 4;stroke-width:1.5px` }, g);
        el("line", { x1: p.x(0), x2: p.x(x), y1: p.y(y), y2: p.y(y), style: `stroke:${col};stroke-dasharray:4 4;stroke-width:1.5px` }, g);
        el("circle", { cx: p.x(x), cy: p.y(y), r: 7, class: "econ-dot", style: `fill:${col}` }, g);
        text(p.svg, p.x(x) + 10, p.y(y) - 8, nm, { "font-weight": "700" });
      });
      el("circle", { cx: p.x(0), cy: p.y(B0), r: 5, class: "pt-red" }, g);
      hand(p.svg, p.x(0.6), p.y(1.6), "β̂₀ = 0.095: ¿0 años de educación?", {});
      if (st.a !== st.b) {
        // La llave va a la derecha del punto más alto; si no cabe, a la izquierda del más bajo
        const derecha = Math.max(st.a, st.b) <= 13;
        const xr = derecha ? Math.max(st.a, st.b) + 0.8 : Math.min(st.a, st.b) - 0.8;
        const s6 = derecha ? 6 : -6;
        el("path", { d: `M${p.x(xr)},${p.y(yA)} L${p.x(xr) + s6},${p.y(yA)} L${p.x(xr) + s6},${p.y(yB)} L${p.x(xr)},${p.y(yB)}`, fill: "none", class: "econ-hand-stroke" }, p.svg);
        hand(p.svg, p.x(xr) + 2 * s6, (p.y(yA) + p.y(yB)) / 2 + 6, `${d >= 0 ? "+" : "−"}${f(Math.abs(d), 2)} US$/h`, { "text-anchor": derecha ? "start" : "end" });
      }
      stats.set("a", `US$ ${f(yA, 2)}`);
      stats.set("b", `US$ ${f(yB, 2)}`);
      stats.set("d", `${d >= 0 ? "+" : "−"}US$ ${f(Math.abs(d), 2)}`);
      // Separador de miles con espacio: con punto se confundiría con el punto decimal de 2.16
      const anual = miles(Math.abs(d) * 2080);
      stats.set("y", `${d >= 0 ? "+" : "−"}US$ ${anual}`);
      const dx = st.b - st.a;
      if (dx === 0) {
        nt.innerHTML = "Ana y Bruno tienen los mismos años de educación: el modelo les predice el mismo salario. Mueve uno de los dos.";
        return;
      }
      nt.innerHTML = `Bruno tiene ${Math.abs(dx)} año(s) de educación ${dx >= 0 ? "más" : "menos"} que Ana, así que el modelo predice una diferencia de ` +
        `${Math.abs(dx)} × 0.54 = <strong>${f(Math.abs(d), 2)} dólares por hora</strong>: la pendiente β̂₁ es el cambio en el salario <em>esperado</em> por cada año adicional. ` +
        "El intercepto β̂₀ = 0.095 sería el salario con 0 años de educación: casi nadie en los datos está en ese punto, así que conviene no interpretarlo literalmente. " +
        "Y ojo: es una <strong>asociación</strong>; que sea causal depende de E[u|x] = 0 (¡la mochila de u!).";
    }
    onVisible(wrap, render);
  };

  /* --- Galería · R² en la vida real ---------------------------------------- */
  WIDGETS["r2-galeria"] = function (root) {
    caso(root, "Galería · Bondad de ajuste",
      "R² en la vida real: ¿cuánto de y explica x? 🎯",
      "Cuatro relaciones con R² muy distintos. Mira cada nube de puntos, adivina su R² y luego revélalo.");
    const r0 = rng(8);
    // Simula y = bt·x + ruido y reescala los residuos para que el R² muestral sea exactamente r2
    const sim = (n, xs, bt, r2) => {
      const y0 = xs.map((x) => bt * x + gauss(r0));
      const o0 = ols(xs, y0);
      const k = Math.sqrt((o0.SSE * (1 - r2)) / (r2 * o0.SSR));
      return xs.map((x, i) => o0.yhat[i] + k * o0.resid[i]);
    };
    const xC = Array.from({ length: 40 }, () => -5 + 40 * r0());
    const xP = Array.from({ length: 60 }, () => 160 + 30 * r0());
    const xE = Array.from({ length: 80 }, () => 8 + Math.floor(11 * r0()));
    const xZ = Array.from({ length: 80 }, () => 1 + Math.floor(12 * r0()));
    const CASOS = [
      { t: "💼 Salario vs. años de educación", x: xE, y: sim(80, xE, 0.54, 0.165).map((v) => v + 5), xl: "años de educación", yl: "salario (US$/h)", ans: 2,
        why: "La educación explica cerca del 16% de la variación del salario (en los datos de salarios de Wooldridge, R² ≈ 0.165). ¡El resto está en u!" },
      { t: "🌡️ Temperatura: °C vs. °F", x: xC, y: xC.map((c) => 32 + 1.8 * c), xl: "°C", yl: "°F", ans: 0,
        why: "Es una conversión exacta (°F = 32 + 1.8·°C): x explica <strong>todo</strong> y R² = 1. En economía casi nunca pasa." },
      { t: "♈ Salario vs. signo zodiacal", x: xZ, y: xZ.map(() => 6 + 2.5 * gauss(r0)), xl: "signo (1 = Aries … 12 = Piscis)", yl: "salario", ans: 3,
        why: "El signo no explica nada: R² ≈ 0. Cualquier pequeño valor distinto de cero es puro azar de la muestra." },
      { t: "👨‍👦 Estatura de padres vs. hijos", x: xP, y: sim(60, xP, 0.5, 0.25).map((v) => v + 88), xl: "padre (cm)", yl: "hijo (cm)", ans: 1,
        why: "La estatura del padre explica una parte importante, pero no todo: genes de la madre, alimentación… (ilustrativo, en el espíritu de los datos de Galton)." },
    ];
    const LABELS = ["Casi 1", "Medio (≈ 0.25)", "Bajo (≈ 0.165)", "Casi 0"];
    const grid = h("div", { class: "econ-r2-grid" });
    root.append(grid);
    CASOS.forEach((cs) => {
      const o = ols(cs.x, cs.y);
      const card = h("div", { class: "econ-r2-card" });
      card.append(h("strong", {}, cs.t));
      const pw = h("div");
      card.append(pw);
      const p = plot(pw, 300, 200, { l: 34, b: 34, t: 10, r: 10 });
      const xs = [Math.min(...cs.x), Math.max(...cs.x)], ys = [Math.min(...cs.y), Math.max(...cs.y)];
      const px = (xs[1] - xs[0]) * 0.06, py = (ys[1] - ys[0]) * 0.08 || 1;
      p.domain([xs[0] - px, xs[1] + px], [ys[0] - py, ys[1] + py]);
      p.axes({ xlabel: cs.xl, nx: 4, ny: 4 });
      const g = p.clipped();
      cs.x.forEach((x, i) => el("circle", { cx: p.x(x), cy: p.y(cs.y[i]), r: 3, style: "fill:var(--econ-c1);fill-opacity:.6" }, g));
      const fitLine = el("line", { x1: p.x(xs[0]), y1: p.y(o.b0 + o.b1 * xs[0]), x2: p.x(xs[1]), y2: p.y(o.b0 + o.b1 * xs[1]), class: "line", style: "opacity:0" }, g);
      const opts = h("div", { class: "econ-r2-opts" });
      const bar = h("div", { class: "econ-r2-bar" }, h("span"));
      const val = h("div", { class: "econ-r2-val" }, "R² = ?");
      const why = h("p", { class: "econ-card6-fb" });
      LABELS.forEach((lb, k) => {
        const bt = h("button", { type: "button", class: "econ-quiz-opt" }, lb);
        bt.addEventListener("click", () => {
          if (card.dataset.done) return;
          card.dataset.done = "1";
          bt.classList.add(k === cs.ans ? "is-right" : "is-wrong");
          opts.children[cs.ans].classList.add("is-right");
          fitLine.style.transition = "opacity .4s";
          fitLine.style.opacity = 1;
          countUp(val, 0, o.R2, 800, (v) => "R² = " + f(v, 3));
          tween(800, ease.outCubic, (q) => { bar.firstChild.style.width = `${o.R2 * q * 100}%`; });
          why.innerHTML = (k === cs.ans ? "✅ " : "❌ ") + cs.why;
        });
        opts.append(bt);
      });
      card.append(opts, val, bar, why);
      grid.append(card);
    });
    const nt = note(root);
    nt.innerHTML = "Un <strong>R² bajo no significa que la regresión sea inútil</strong>: la educación sí se asocia con el salario, aunque explique solo una parte " +
      "de su variación porque muchos otros factores importan. Y un R² alto no garantiza causalidad. <span class=\"econ-fine\">Nubes simuladas con fines ilustrativos.</span>";
  };

  /* --- Visual · Homocedasticidad vs. heterocedasticidad ------------------- */
  WIDGETS.homocedasticidad = function (root) {
    caso(root, "Visual · Supuesto RLS 5",
      "¿El ruido es parejo? Homocedasticidad 📏",
      "Ejemplo clásico: gasto en alimentación vs. ingreso del hogar. Los hogares de ingresos bajos gastan parecido; " +
      "los de ingresos altos pueden gastar muy poco… o muchísimo. Cambia entre los dos mundos.");
    const r0 = rng(4);
    const N = 160;
    const pts = Array.from({ length: N }, () => ({ x: 300 + 2700 * r0(), z: gauss(r0) }));
    const yHomo = (pt) => 200 + 0.12 * pt.x + 60 * pt.z;
    const sdH = (x) => 10 + 0.07 * x;
    const yHet = (pt) => 200 + 0.12 * pt.x + sdH(pt.x) * pt.z;
    const seg = h("div", { class: "econ-seg", role: "tablist" });
    root.append(seg);
    const wrap = h("div");
    root.append(wrap);
    const p = plot(wrap, 600, 300, { l: 52 });
    p.domain([0, 3200], [0, 1100]);
    const nt = note(root);
    p.axes({ xlabel: "Ingreso del hogar (miles de $ al mes)", ylabel: "Gasto en alimentación (miles de $)", nx: 6 });
    const clip = p.clipped(); // la franja y los puntos no se salen del área del gráfico
    const band = el("path", { class: "econ-band" }, clip);
    const g = el("g", {}, clip);
    el("line", { x1: p.x(0), y1: p.y(200), x2: p.x(3200), y2: p.y(200 + 0.12 * 3200), class: "line" }, clip);
    const circles = pts.map(() => el("circle", { r: 3.4, class: "econ-dot", style: "fill:var(--econ-c1);fill-opacity:.75" }, g));
    const ann = el("g", {}, p.svg);
    const bandPath = (sdf) => {
      const up = [], dn = [];
      for (let i = 0; i <= 20; i++) {
        const x = (3200 * i) / 20, m = 200 + 0.12 * x;
        up.push(`${p.x(x)},${p.y(m + 2 * sdf(x))}`);
        dn.push(`${p.x(x)},${p.y(m - 2 * sdf(x))}`);
      }
      return "M" + up.join(" L") + " L" + dn.reverse().join(" L") + " Z";
    };
    let cur = null;
    const VIEWS = {
      homo: { label: "Homocedasticidad", y: yHomo, sd: () => 60,
        txt: "La <strong>dispersión alrededor de la recta es la misma</strong> para cualquier ingreso: Var(u|x) = σ². Es el supuesto RLS 5, " +
          "que permite usar la fórmula de la varianza de β̂₁ de la lámina siguiente (lámina 34)." },
      het: { label: "Heterocedasticidad", y: yHet, sd: sdH,
        txt: "Ahora la dispersión <strong>crece con el ingreso</strong> (forma de embudo): Var(u|x) cambia con x. MCO sigue siendo insesgado, " +
          "pero la fórmula de la varianza de la lámina deja de ser válida. Lo veremos en detalle en la semana 11." },
    };
    Object.entries(VIEWS).forEach(([k, v]) => {
      const bt = h("button", { type: "button", class: "econ-seg-btn", role: "tab" }, v.label);
      bt.addEventListener("click", () => show(k));
      seg.append(bt);
      v.btn = bt;
    });
    function show(k) {
      const v = VIEWS[k];
      Object.entries(VIEWS).forEach(([kk, vv]) => vv.btn.setAttribute("aria-selected", String(kk === k)));
      const from = circles.map((c) => +c.getAttribute("cy") || p.y(200));
      const to = pts.map((pt) => p.y(v.y(pt)));
      circles.forEach((c, i) => c.setAttribute("cx", p.x(pts[i].x)));
      band.setAttribute("d", bandPath(v.sd));
      tween(cur ? 650 : 0, ease.inOutCubic, (q) => circles.forEach((c, i) => c.setAttribute("cy", from[i] + (to[i] - from[i]) * q)));
      while (ann.firstChild) ann.removeChild(ann.firstChild);
      if (k === "het") {
        hand(ann, p.x(700), p.y(980), "¡embudo!", { "text-anchor": "middle" });
        drawStroke(handArrow(ann, `M${p.x(1000)},${p.y(985)} Q${p.x(1900)},${p.y(1060)} ${p.x(2500)},${p.y(930)}`), 450, 300);
      } else {
        hand(ann, p.x(700), p.y(980), "franja pareja", { "text-anchor": "middle" });
      }
      cur = k;
      nt.innerHTML = v.txt + ' <span class="econ-fine">La franja muestra ±2 desviaciones estándar del error. Datos simulados.</span>';
    }
    onVisible(wrap, () => show("homo"));
  };

  /* --- Detective · ¿Qué supuesto falla? ------------------------------------ */
  WIDGETS.supuestos = function (root) {
    caso(root, "Detective · Supuestos RLS",
      "¿Qué supuesto falla? 🕵️",
      "Cuatro estudios sobre salario y educación, cada uno con un problema. Elige un caso y descubre qué supuesto RLS no se cumple.");
    const OPCIONES = ["RLS 1 · Linealidad", "RLS 2 · Muestra aleatoria", "RLS 3 · Variación en x", "RLS 4 · E(u|x) = 0", "RLS 5 · Homocedasticidad"];
    const r0 = rng(3);
    const CASOS = [
      {
        t: "Caso 1", q: "Para estudiar salario y educación en Chile, publicamos una encuesta en Instagram y respondió quien quiso.", ans: 1,
        why: "Quienes responden se <strong>autoseleccionan</strong>: no es una muestra aleatoria de los trabajadores de Chile, así que no representa a la población de interés.",
        draw: (s) => {
          for (let i = 0; i < 9; i++) {
            person(s, 70 + i * 58, 92, { body: ["#005f96", "#2d6f9c", "#3f86b8"][i % 3] });
            if (i % 2 === 0) emoji(s, 90 + i * 58, 128, "📱", 22, i * 60);
          }
          hand(s, 300, 196, "¡respondió quien quiso!", { "text-anchor": "middle" });
        },
      },
      {
        t: "Caso 2", q: "En nuestra muestra, todas las personas tienen exactamente 12 años de educación.", ans: 2,
        why: "Sin <strong>variación en x</strong>, Σ(xᵢ − x̄)² = 0 y la fórmula de β̂₁ divide por cero: no hay forma de saber cómo cambia el salario con la educación.",
        draw: (s) => {
          el("line", { x1: 60, y1: 200, x2: 560, y2: 200, stroke: "#1b2a5e", "stroke-width": 2 }, s);
          for (let i = 0; i < 14; i++) el("circle", { cx: 300 + (r0() - 0.5) * 4, cy: 60 + r0() * 130, r: 5, fill: "#005f96" }, s);
          const ln = el("line", { x1: 180, y1: 125, x2: 420, y2: 125, class: "econ-swing", stroke: "#b30828", "stroke-width": 3 }, s);
          text(s, 300, 218, "12 años", { "text-anchor": "middle", "font-weight": "700" });
          hand(s, 470, 60, "β̂₁ = ? / 0", { "text-anchor": "middle", style: "font-size:28px" });
          s.classList.add("is-live");
        },
      },
      {
        t: "Caso 3", q: "La habilidad aumenta el salario, y las personas más hábiles estudian más años. No observamos la habilidad.", ans: 3,
        why: "La habilidad está en u y se relaciona con la educación: <strong>E(u|x) ≠ 0</strong>. β̂₁ mezcla el efecto de la educación con el de la habilidad (Clase 3).",
        draw: (s) => {
          mochila(s, 150, 120);
          text(s, 150, 196, "u", { "text-anchor": "middle", "font-weight": "700" });
          emoji(s, 150, 52, "💡", 34, 0);
          const g = el("g", {}, s);
          el("rect", { x: 360, y: 96, width: 170, height: 46, rx: 23, class: "econ-badge-bg" }, g);
          text(g, 445, 125, "🎓 educación (x)", { "text-anchor": "middle", "font-weight": "700" });
          drawStroke(handArrow(s, "M200,110 Q280,80 352,112"), 500, 300);
          hand(s, 280, 74, "se relacionan", { "text-anchor": "middle" });
        },
      },
      {
        t: "Caso 4", q: "Entre las personas con más educación, los salarios son mucho más dispersos que entre las de menos educación.", ans: 4,
        why: "La varianza del error cambia con x: hay <strong>heterocedasticidad</strong>. β̂₁ sigue siendo insesgado, pero su varianza no es la de la lámina.",
        draw: (s) => {
          el("line", { x1: 60, y1: 200, x2: 560, y2: 200, stroke: "#1b2a5e", "stroke-width": 2 }, s);
          for (let i = 0; i < 60; i++) {
            const x = 80 + 460 * r0(), sp = 5 + (x - 80) * 0.09;
            const cy = Math.min(195, Math.max(20, 170 - (x - 80) * 0.18 + sp * gauss(r0)));
            el("circle", { cx: x, cy, r: 3.5, fill: "#005f96", opacity: 0.8 }, s);
          }
          hand(s, 470, 36, "embudo", { "text-anchor": "middle" });
        },
      },
    ];
    const tabs = h("div", { class: "econ-seg", role: "tablist" });
    root.append(tabs);
    const svg = svgBox(root, 600, 230, "Escena del caso");
    const qEl = h("p", { class: "econ-quiz-q" });
    const opts = h("div", { class: "econ-quiz-opts" });
    const fb = h("p", { class: "econ-card6-fb" });
    root.append(h("div", { class: "econ-metodo" }, qEl, opts, fb));
    const done = {};
    const tb = CASOS.map((cs, i) => {
      const bt = h("button", { type: "button", class: "econ-seg-btn", role: "tab" }, cs.t);
      bt.addEventListener("click", () => show(i));
      tabs.append(bt);
      return bt;
    });
    function show(i) {
      const cs = CASOS[i];
      tb.forEach((bt, k) => bt.setAttribute("aria-selected", String(k === i)));
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.classList.remove("is-live");
      el("rect", { x: 0, y: 0, width: 600, height: 230, rx: 14, class: "econ-scene-bg" }, svg);
      cs.draw(svg);
      qEl.textContent = cs.q;
      opts.innerHTML = "";
      fb.innerHTML = done[i] ? done[i] : "";
      OPCIONES.forEach((lb, k) => {
        const bt = h("button", { type: "button", class: "econ-quiz-opt" }, lb);
        bt.addEventListener("click", () => {
          if (opts.dataset.lock === String(i)) return;
          bt.classList.add(k === cs.ans ? "is-right" : "is-wrong");
          if (k === cs.ans) {
            opts.dataset.lock = String(i);
            done[i] = "✅ " + cs.why;
            fb.innerHTML = done[i];
            tb[i].textContent = cs.t + " ✓";
          } else {
            fb.innerHTML = "❌ No exactamente: vuelve a leer el caso y piensa qué condición de los supuestos se rompe.";
          }
        });
        opts.append(bt);
      });
      if (done[i]) { opts.dataset.lock = String(i); opts.children[cs.ans].classList.add("is-right"); } else delete opts.dataset.lock;
    }
    onVisible(svg, () => show(0));
  };

  /* ========================================================================
     CLASE 3 · Causalidad, sesgo de selección y variable omitida
     ======================================================================== */

  /* MCO con varios regresores: resuelve (X'X) b = X'y por eliminación gaussiana.
     X es una lista de columnas (sin la constante, que se agrega). */
  function olsMulti(cols, y) {
    const n = y.length, k = cols.length + 1;
    const X = (i, j) => (j === 0 ? 1 : cols[j - 1][i]);
    const A = Array.from({ length: k }, () => new Array(k + 1).fill(0));
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < k; a++) {
        const xa = X(i, a);
        for (let b = 0; b < k; b++) A[a][b] += xa * X(i, b);
        A[a][k] += xa * y[i];
      }
    }
    for (let c = 0; c < k; c++) {
      let piv = c;
      for (let r = c + 1; r < k; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]];
      for (let r = 0; r < k; r++) {
        if (r === c) continue;
        const m = A[r][c] / A[c][c];
        for (let q = c; q <= k; q++) A[r][q] -= m * A[c][q];
      }
    }
    return A.map((row, i) => row[k] / A[i][i]);
  }

  function shake(node, ms) {
    tween(ms || 360, (t) => t, (k) => {
      node.setAttribute("transform", `translate(${Math.sin(k * Math.PI * 6) * 9 * (1 - k)},0)`);
    }, () => node.removeAttribute("transform"));
  }

  /* --- Outcomes potenciales: la tabla de la lámina 6 en cuatro pasos ------- */
  WIDGETS.po = function (root) {
    caso(root, "Interactivo · La lámina 6 paso a paso",
      "Outcomes potenciales: lo que vemos y lo que no 🔍",
      "Las cinco personas de la tabla de la lámina 6. Los salarios <strong>observados</strong> son los de la lámina; " +
      "los contrafactuales (<strong>??</strong>) los inventamos para este ejercicio, para poder mirar “con los ojos de Dios”. " +
      "Recorre los cuatro pasos en orden.");
    // nt = Yᴺᵀ (sin universidad), t = Yᵀ (con universidad); T = tratamiento de la lámina
    const P = [
      { n: "Sofía", T: 1, nt: 75, t: 100 },
      { n: "Paula", T: 0, nt: 40, t: 55 },
      { n: "Ezequiel", T: 1, nt: 60, t: 80 },
      { n: "Juan", T: 0, nt: 20, t: 30 },
      { n: "Caro", T: 1, nt: 45, t: 60 },
    ];
    const T0 = P.map((p) => p.T);
    const st = { step: 0, T: T0.slice(), draws: [], all: false };
    const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
    const fmt = (v) => (Number.isInteger(v) ? String(v) : f(v, 2));
    const obs = (T) => P.map((p, i) => (T[i] ? p.t : p.nt));
    const diffObs = (T) => avg(P.filter((_, i) => T[i]).map((p) => p.t)) - avg(P.filter((_, i) => !T[i]).map((p) => p.nt));
    const ATE = avg(P.map((p) => p.t - p.nt));
    // Todas las formas de elegir 3 tratados entre 5 personas (10 sorteos posibles)
    const COMBOS = [];
    for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) for (let c = b + 1; c < 5; c++) {
      COMBOS.push(P.map((_, i) => (i === a || i === b || i === c ? 1 : 0)));
    }
    const comboDiffs = COMBOS.map(diffObs);

    const PASOS = ["Lo que vemos", "Modo Dios", "¿De dónde sale el 50?", "¿Y si sorteamos?"];
    const nav = h("div", { class: "econ-po-steps", role: "tablist", "aria-label": "Pasos" });
    const navBtns = PASOS.map((t, i) => {
      const b = h("button", { type: "button", class: "econ-po-step", role: "tab" }, h("span", {}, String(i + 1)), t);
      b.addEventListener("click", () => go(i));
      nav.append(b);
      return b;
    });
    root.append(nav);

    root.append(h("p", { class: "econ-po-legend" },
      h("span", {}, "🎓 Yᵀ = salario con universidad"), h("span", {}, "🏠 Yᴺᵀ = salario sin universidad"),
      h("span", { class: "is-cf" }, "?? = contrafactual (no se observa)")));
    const grid = h("div", { class: "econ-po-grid" });
    root.append(grid);
    const box = (lbl) => {
      const v = h("strong", {});
      const node = h("div", { class: "econ-po-box" }, h("span", {}, lbl), v);
      return { node, v };
    };
    const cards = P.map((p) => {
      const badge = h("span", { class: "econ-po-badge" });
      const bT = box("🎓 Yᵀ");
      const bN = box("🏠 Yᴺᵀ");
      const fx = h("div", { class: "econ-po-fx" });
      const card = h("div", { class: "econ-po-card" },
        h("div", { class: "econ-po-who" }, h("span", { class: "econ-po-av", "aria-hidden": "true" }, p.n[0]), h("strong", {}, p.n)),
        badge, bT.node, bN.node, fx);
      grid.append(card);
      return { card, badge, bT, bN, fx };
    });

    const panel = h("div", { class: "econ-po-panel", "aria-live": "polite" });
    root.append(panel);

    // Paso 3: barra "diferencia observada = ATT + sesgo"
    const barWrap = h("div", { class: "econ-po-extra" });
    root.append(barWrap);
    const bar = svgBox(barWrap, 600, 96, "La diferencia observada de 50 se descompone en ATT 20 más sesgo de selección 30");

    // Paso 4: sorteos
    const drawWrap = h("div", { class: "econ-po-extra" });
    root.append(drawWrap);
    const bd = buttons(drawWrap);
    const same = (A, B) => A.every((v, i) => v === B[i]);
    btn(bd, "🎲 Sortear: 3 de 5 van a la universidad", () => {
      // Nunca repite el sorteo anterior: si saliera igual, el botón parecería no funcionar
      const otros = COMBOS.filter((C) => !same(C, st.T));
      st.T = otros[Math.floor(Math.random() * otros.length)].slice();
      st.draws.push(diffObs(st.T));
      render(true);
    }, "econ-btn-gold");
    const allBtn = btn(bd, "Ver los 10 sorteos posibles", () => {
      st.all = !st.all;
      allBtn.setAttribute("aria-pressed", String(st.all));
      allBtn.textContent = st.all ? "Ocultar los 10 sorteos posibles" : "Ver los 10 sorteos posibles";
      render();
    }, "econ-btn-ghost");
    allBtn.setAttribute("aria-pressed", "false");
    const backBtn = btn(bd, "Volver a los datos de la lámina", () => { st.T = T0.slice(); render(true); }, "econ-btn-ghost");
    const dp = plot(drawWrap, 600, 170, { l: 14, r: 14, t: 26, b: 36 });
    const dstats = statsRow(drawWrap, [
      { k: "este", label: "Diferencia en este sorteo", cls: "is-gold" },
      { k: "prom", label: "Promedio de tus sorteos" },
      { k: "ate", label: "ATE (efecto causal promedio)" },
    ]);

    const navB = buttons(root);
    navB.classList.add("econ-po-nav");
    const prev = btn(navB, "← Anterior", () => go(st.step - 1), "econ-btn-ghost");
    const next = btn(navB, "Siguiente →", () => go(st.step + 1));

    function go(i) {
      st.step = Math.max(0, Math.min(PASOS.length - 1, i));
      if (st.step < 3) st.T = T0.slice();
      render(true);
    }

    function renderCards(dios, focusNT, animate) {
      P.forEach((p, i) => {
        const c = cards[i];
        const T = st.T[i];
        c.badge.textContent = T ? "Tᵢ = 1 · fue" : "Tᵢ = 0 · no fue";
        c.badge.className = "econ-po-badge " + (T ? "is-t" : "is-nt");
        c.card.classList.toggle("is-treated", !!T);
        [[c.bT, p.t, !!T], [c.bN, p.nt, !T]].forEach(([b, val, seen]) => {
          const shown = seen || dios;
          b.node.className = "econ-po-box" + (seen ? " is-obs" : shown ? " is-cf-shown" : " is-cf") +
            (focusNT && b === c.bN ? " is-focus" : "") + (animate && !seen && shown ? " is-flip" : "");
          b.v.textContent = shown ? String(val) : "??";
        });
        c.fx.textContent = dios ? `Efecto = ${p.t} − ${p.nt} = +${p.t - p.nt}` : "";
        c.fx.classList.toggle("is-on", dios);
        if (animate && st.step === 3) {
          c.badge.classList.remove("is-pop");
          void c.badge.offsetWidth; // reinicia la animación del distintivo
          c.badge.classList.add("is-pop");
        }
      });
    }

    function drawBar() {
      while (bar.firstChild) bar.removeChild(bar.firstChild);
      const x0 = 20, W = 560, total = 50;
      const wAtt = (W * 20) / total;
      text(bar, x0, 18, "Diferencia observada = 50", { "font-weight": "700" });
      const rA = el("rect", { x: x0, y: 28, width: 0, height: 34, rx: 4, style: "fill:var(--econ-c1)" }, bar);
      const rS = el("rect", { x: x0 + wAtt, y: 28, width: 0, height: 34, rx: 4, style: "fill:var(--econ-c3)" }, bar);
      const lA = text(bar, x0 + wAtt / 2, 50, "", { "text-anchor": "middle", style: "fill:#fff;font-weight:700" });
      const lS = text(bar, x0 + wAtt + (W - wAtt) / 2, 50, "", { "text-anchor": "middle", style: "fill:#fff;font-weight:700" });
      text(bar, x0, 84, "ATT: efecto causal en los tratados", { class: "muted" });
      text(bar, x0 + W, 84, "Sesgo de selección: ya eran distintos", { class: "muted", "text-anchor": "end" });
      tween(600, ease.outCubic, (k) => { rA.setAttribute("width", wAtt * k); }, () => {
        lA.textContent = "ATT = 20";
        tween(700, ease.outCubic, (k) => { rS.setAttribute("width", (W - wAtt) * k); }, () => { lS.textContent = "Sesgo = 30"; });
      });
    }

    function drawDots() {
      dp.clear();
      const lo = Math.floor(Math.min(...comboDiffs) / 5) * 5 - 5, hi = Math.ceil(Math.max(...comboDiffs) / 5) * 5 + 5;
      dp.domain([lo, hi], [0, 6]);
      dp.axes({ noY: true, grid: false, xlabel: "Diferencia observada (tratados − no tratados)" });
      const g = el("g", {}, dp.svg);
      el("line", { x1: dp.x(ATE), x2: dp.x(ATE), y1: 18, y2: dp.y(0), style: "stroke:var(--econ-c2);stroke-width:2.5" }, g);
      text(g, dp.x(ATE), 13, "ATE = 17", { "text-anchor": "middle", "font-weight": "700" });
      el("line", { x1: dp.x(50), x2: dp.x(50), y1: 18, y2: dp.y(0), style: "stroke:var(--econ-c3);stroke-width:1.5;stroke-dasharray:4 3" }, g);
      text(g, dp.x(50), 13, "lámina: 50", { "text-anchor": "middle", style: "fill:var(--econ-c3)" });
      const stack = {};
      const dot = (v, filled) => {
        const k = (stack[v] = (stack[v] || 0) + 1);
        return el("circle", { cx: dp.x(v), cy: dp.y(k - 0.5) - 2, r: 6, style: `fill:${filled ? "var(--econ-c1)" : "none"};stroke:var(--econ-c1);stroke-width:1.6` }, g);
      };
      if (st.all) comboDiffs.forEach((v) => dot(v, false));
      st.draws.slice(-24).forEach((v, i, a) => {
        const c = dot(v, true);
        if (i === a.length - 1) popIn(c, 0, 320);
      });
      if (st.all) {
        const m = avg(comboDiffs);
        text(g, dp.x(hi) - 4, 32, `Promedio de los 10 sorteos = ${fmt(m)}`, { "text-anchor": "end", "font-weight": "700", style: "fill:var(--econ-c2)" });
      }
      const d = diffObs(st.T);
      backBtn.disabled = same(st.T, T0);
      dstats.set("este", fmt(d));
      dstats.set("prom", st.draws.length ? `${fmt(avg(st.draws))} (${st.draws.length})` : "—");
      dstats.set("ate", fmt(ATE));
    }

    const sum = (vals) => vals.join(" + ");
    function render(animate) {
      navBtns.forEach((b, i) => {
        b.classList.toggle("is-active", i === st.step);
        b.classList.toggle("is-done", i < st.step);
        b.setAttribute("aria-selected", String(i === st.step));
      });
      prev.disabled = st.step === 0;
      next.disabled = st.step === PASOS.length - 1;
      next.textContent = st.step === PASOS.length - 1 ? "Fin del recorrido ✓" : `Siguiente: ${PASOS[st.step + 1]} →`;
      barWrap.hidden = st.step !== 2;
      drawWrap.hidden = st.step !== 3;
      const tr = P.filter((_, i) => st.T[i]), co = P.filter((_, i) => !st.T[i]);
      const y = obs(st.T);
      if (st.step === 0) {
        renderCards(false, false, false);
        panel.innerHTML =
          "<p><strong>Paso 1 · Lo que vemos.</strong> Cada persona vive en <em>un solo</em> mundo: si fue a la universidad vemos Yᵀ; si no, Yᴺᵀ. " +
          "El otro valor (??) es su <strong>contrafactual</strong>. Con los datos solo podemos comparar promedios de grupos:</p>" +
          `<p class="econ-po-eq">Fueron: (${sum(tr.map((p) => p.t))}) / ${tr.length} = <b>${fmt(avg(tr.map((p) => p.t)))}</b>` +
          ` &nbsp;·&nbsp; No fueron: (${sum(co.map((p) => p.nt))}) / ${co.length} = <b>${fmt(avg(co.map((p) => p.nt)))}</b></p>` +
          `<p class="econ-po-eq is-big">Diferencia observada = <b>${fmt(diffObs(st.T))}</b></p>` +
          "<p>Es lo mismo que entrega MCO al regresar Y en T (lámina 9). ¿Es 50 el efecto de la universidad? Para saberlo necesitamos los ??.</p>";
      } else if (st.step === 1) {
        renderCards(true, false, animate);
        const ef = P.map((p) => p.t - p.nt);
        const efT = P.filter((p) => p.T).map((p) => p.t - p.nt);
        panel.innerHTML =
          "<p><strong>Paso 2 · Modo Dios.</strong> Ahora vemos los dos outcomes de cada persona (en rojo, los contrafactuales). " +
          "El efecto individual es Yᵀ − Yᴺᵀ, y con él podemos calcular los dos promedios de la lámina 5:</p>" +
          `<p class="econ-po-eq"><b>ATE</b> = promedio de los 5 efectos = (${sum(ef)}) / 5 = <b>${fmt(ATE)}</b></p>` +
          `<p class="econ-po-eq"><b>ATT</b> = promedio solo entre quienes fueron (Sofía, Ezequiel y Caro) = (${sum(efT)}) / 3 = <b>${fmt(avg(efT))}</b></p>` +
          "<p>La universidad sí sube el salario, pero <strong>bastante menos que 50</strong>. En la vida real nunca tenemos este modo: por eso el ATE y el ATT no son observables.</p>";
      } else if (st.step === 2) {
        renderCards(true, true, false);
        const ntT = P.filter((p) => p.T).map((p) => p.nt), ntC = P.filter((p) => !p.T).map((p) => p.nt);
        panel.innerHTML =
          "<p><strong>Paso 3 · El sesgo de selección.</strong> Mira solo los recuadros <em>Sin universidad</em> (marcados): " +
          "aun sin ir a la universidad, Sofía, Ezequiel y Caro habrían ganado más que Paula y Juan. Los grupos ya eran distintos.</p>" +
          `<p class="econ-po-eq">E[Yᴺᵀ | T = 1] = (${sum(ntT)}) / 3 = <b>${fmt(avg(ntT))}</b> &nbsp;vs.&nbsp; E[Yᴺᵀ | T = 0] = (${sum(ntC)}) / 2 = <b>${fmt(avg(ntC))}</b>` +
          ` &nbsp;⇒&nbsp; sesgo = <b>${fmt(avg(ntT) - avg(ntC))}</b></p>` +
          "<p>Es la descomposición de la lámina 11: <strong>diferencia observada = ATT + sesgo de selección</strong>.</p>";
        drawBar();
      } else {
        renderCards(false, false, animate);
        panel.innerHTML =
          "<p><strong>Paso 4 · ¿Y si sorteamos?</strong> Ahora un sorteo decide quién va a la universidad (3 de 5). " +
          `En este sorteo: ${tr.map((p) => p.n).join(", ")} van; la diferencia observada es <b>${fmt(diffObs(st.T))}</b> ` +
          `(salarios observados: ${y.join(", ")}).</p>` +
          "<p>Sortea varias veces. Cada sorteo da otra diferencia, porque con 5 personas el azar pesa mucho, pero el promedio de " +
          "<strong>todos</strong> los sorteos posibles es exactamente el <strong>ATE = 17</strong>: con aleatorización el sesgo de selección " +
          "es cero <em>en promedio</em> (láminas 15–16). Con miles de personas, cada sorteo queda muy cerca del ATE (simulador más abajo).</p>";
        drawDots();
      }
    }
    render(false);
  };

  /* --- Caso · El contrafactual: dos universos ------------------------------ */
  WIDGETS.universo = function (root) {
    caso(root, "Caso · El contrafactual",
      "Si Sofía pudiera vivir dos vidas… 🌌",
      "El día que Sofía decide ir a la universidad, el universo se divide. En uno va; en el otro, no. " +
      "Para medir el efecto causal de la universidad en <em>su</em> salario tendríamos que observar ambos universos.");
    const scene = svgBox(root, 600, 240, "Dos universos paralelos con Sofía");
    const defs = el("defs", {}, scene);
    const gA = el("linearGradient", { id: "econ-uA", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: 0, "stop-color": "#dcebf7" }, gA);
    el("stop", { offset: 1, "stop-color": "#f6fafd" }, gA);
    const gB = el("linearGradient", { id: "econ-uB", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: 0, "stop-color": "#2a2f55" }, gB);
    el("stop", { offset: 1, "stop-color": "#4a4f78" }, gB);
    el("rect", { x: 0, y: 0, width: 300, height: 240, fill: "url(#econ-uA)" }, scene);
    el("rect", { x: 300, y: 0, width: 300, height: 240, fill: "url(#econ-uB)" }, scene);
    for (let i = 0; i < 26; i++) el("circle", { cx: 310 + ((i * 97) % 280), cy: 10 + ((i * 53) % 110), r: 1.4, fill: "#ffffff", opacity: 0.7, class: "econ-star" }, scene);
    el("line", { x1: 300, y1: 0, x2: 300, y2: 240, stroke: "#e5b300", "stroke-width": 4, "stroke-dasharray": "8 6" }, scene);
    text(scene, 150, 28, "Universo A · fue a la universidad", { "text-anchor": "middle", "font-weight": "700" });
    text(scene, 450, 28, "Universo B · no fue", { "text-anchor": "middle", style: "fill:#ffffff;font-weight:700" });
    person(scene, 90, 120, { cap: true, body: "#005f96" });
    person(scene, 390, 120, { body: "#8fa3c8" });
    const base = 214;
    const barA = el("rect", { x: 160, width: 50, y: base, height: 0, rx: 4, fill: "#005f96" }, scene);
    const lblA = text(scene, 185, base - 8, "", { "text-anchor": "middle", "font-weight": "700" });
    el("rect", { x: 460, width: 50, y: base - 80, height: 80, rx: 4, fill: "#ffffff", opacity: 0.18, "stroke-dasharray": "4 4", stroke: "#ffffff" }, scene);
    text(scene, 485, base - 88, "Yᴺᵀ = ??", { "text-anchor": "middle", style: "fill:#ffffff;font-weight:700" });
    text(scene, 185, 232, "Yᵀ (observado)", { "text-anchor": "middle", class: "muted" });
    text(scene, 485, 232, "Yᴺᵀ (contrafactual)", { "text-anchor": "middle", style: "fill:#c7cfdf" });
    const wall = el("g", { style: "opacity:0" }, scene);
    el("rect", { x: 292, y: 70, width: 16, height: 110, rx: 4, fill: "#b30828" }, wall);
    text(wall, 300, 64, "🚫", { "text-anchor": "middle", style: "font-size:26px" });
    const rocket = text(scene, 40, 70, "🚀", { style: "font-size:30px;opacity:0" });
    onVisible(scene, () => {
      tween(650, ease.outBack, (k) => { const hh = 110 * k; barA.setAttribute("y", base - hh); barA.setAttribute("height", hh); lblA.setAttribute("y", base - hh - 8); lblA.textContent = Math.round(100 * k); });
      scene.classList.add("is-live");
    });
    const b = buttons(root);
    btn(b, "Viajar al universo B 🚀", () => {
      rocket.style.opacity = 1;
      wall.style.opacity = 1;
      tween(700, ease.inQuad, (k) => { rocket.setAttribute("x", 40 + (250 - 40) * k); rocket.setAttribute("y", 70 + 30 * Math.sin(Math.PI * k)); }, () => {
        shake(rocket, 380);
        shake(wall, 380);
        nt.innerHTML = "💥 <strong>No existe un portal entre universos.</strong> Nunca veremos el salario que Sofía habría tenido sin universidad (Yᴺᵀ): " +
          "es su <strong>contrafactual</strong>. Por eso el efecto individual Yᵀ − Yᴺᵀ = 100 − ?? no se puede calcular. La salida es trabajar con " +
          "<strong>promedios de grupos</strong> y buscar un grupo de comparación que se parezca a lo que habría pasado sin tratamiento.";
      });
    }, "econ-btn-gold");
    const nt = note(root);
    nt.innerHTML = "En el universo A vemos el salario de Sofía con universidad (Yᵀ = 100). ¿Cuál habría sido sin universidad? Intenta viajar al universo B.";
  };

  /* --- Caso real · Los gemelos de Twinsburg -------------------------------- */
  WIDGETS.gemelos = function (root) {
    caso(root, "Caso real · Buscar el mejor contrafactual",
      "Los gemelos de Twinsburg 👯",
      "Si no podemos ver a la misma persona con y sin más educación, ¿quién se le parece más? Su gemelo idéntico. Avanza paso a paso.");
    const S = [
      {
        t: "La pregunta",
        body: "<strong>¿Cuánto aumenta el salario un año más de educación?</strong> Al comparar personas distintas, la habilidad o la familia " +
          "(lo que está en u) se mezclan con el efecto de la educación: quienes estudian más pueden ser distintos en todo lo demás.",
        draw: (s) => {
          emoji(s, 160, 130, "🎓", 64, 0);
          emoji(s, 300, 130, "➡️", 36, 250);
          emoji(s, 440, 130, "💵", 64, 450);
          hand(s, 300, 50, "¿cuánto vale un año más?", { "text-anchor": "middle" });
        },
      },
      {
        t: "La idea",
        body: "Los <strong>gemelos idénticos</strong> comparten genes y crecieron en la misma familia. Si uno estudió más que el otro, comparar sus salarios " +
          "elimina gran parte de lo que se esconde en u: el hermano es un contrafactual mucho mejor que un desconocido.",
        draw: (s) => {
          person(s, 220, 96, { cap: true, body: "#005f96" });
          person(s, 380, 96, { body: "#005f96" });
          [["🧬 mismos genes", 0], ["🏠 misma familia", 1]].forEach(([lbl, k]) => {
            const g = el("g", {}, s);
            el("rect", { x: 220, y: 172 + k * 30, width: 160, height: 24, rx: 12, class: "econ-badge-bg" }, g);
            text(g, 300, 189 + k * 30, lbl, { "text-anchor": "middle", "font-weight": "700" });
            popIn(g, 300 + k * 150, 360);
          });
          hand(s, 300, 40, "casi la misma persona", { "text-anchor": "middle" });
        },
      },
      {
        t: "Qué hicieron",
        body: "Ashenfelter y Krueger (1994) viajaron al <strong>Festival de Gemelos de Twinsburg</strong> (Ohio, EE. UU.), donde cada año se reúnen miles de gemelos, " +
          "y encuestaron a más de un centenar de pares de gemelos idénticos sobre su educación y su salario. Luego compararon <strong>dentro de cada par</strong>: " +
          "¿gana más el gemelo que estudió más?",
        draw: (s) => {
          const banner = el("g", {}, s);
          el("rect", { x: 170, y: 18, width: 260, height: 30, rx: 8, fill: "#e5b300" }, banner);
          text(banner, 300, 38, "🎉 Twins Days · Twinsburg, Ohio", { "text-anchor": "middle", "font-weight": "700" });
          popIn(banner, 0, 380);
          const cols = ["#005f96", "#c28000", "#b30828", "#2a9d55"];
          for (let i = 0; i < 8; i++) {
            const g = el("g", {}, s);
            const x = 60 + (i % 4) * 140, y = 92 + Math.floor(i / 4) * 88;
            const pa = person(g, x - 16, y, { body: cols[i % 4], cap: i % 2 === 0 });
            const pb = person(g, x + 18, y, { body: cols[i % 4] });
            pa.setAttribute("transform", `translate(${x - 16},${y}) scale(.7)`);
            pb.setAttribute("transform", `translate(${x + 18},${y}) scale(.7)`);
            popIn(g, 250 + i * 60, 360);
          }
        },
      },
      {
        t: "Resultado y cuidado",
        body: "Encontraron que <strong>cada año adicional de educación se asocia con alrededor de 12% a 16% más salario</strong>, comparando gemelos entre sí. " +
          "<strong>Cuidado:</strong> los gemelos no son idénticos en todo. Si uno estudió más por algo que también afecta el salario (por ejemplo, más motivación), " +
          "todavía quedaría algo de sesgo. Buscar contrafactuales creíbles es el corazón de la econometría aplicada. " +
          "<span class=\"econ-fine\">Ashenfelter, O. y Krueger, A. (1994), American Economic Review.</span>",
        draw: (s) => {
          const base = 196;
          el("line", { x1: 80, x2: 520, y1: base, y2: base, stroke: "#1b2a5e", "stroke-width": 2 }, s);
          [["Gemelo con menos educación", 100, "#8fa3c8", 200, "100"], ["Gemelo con 1 año más", 114, "#005f96", 400, "112 – 116"]].forEach(([lbl, v, col, x, val], i) => {
            const r = el("rect", { x: x - 50, width: 100, y: base, height: 0, rx: 4, fill: col }, s);
            const t = text(s, x, base, "", { "text-anchor": "middle", "font-weight": "700" });
            text(s, x, 216, lbl, { "text-anchor": "middle" });
            setTimeout(() => tween(650, ease.outCubic, (k) => {
              const hh = v * 1.2 * k;
              r.setAttribute("y", base - hh); r.setAttribute("height", hh);
              t.setAttribute("y", base - hh - (i ? 14 : 8));
              if (k === 1) t.textContent = val;
            }), reduced() ? 0 : i * 200);
          });
          const top = base - 112 * 1.2, bot = base - 116 * 1.2;
          el("path", { d: `M400,${top} L400,${bot} M392,${top} L408,${top} M392,${bot} L408,${bot}`, stroke: "#b30828", "stroke-width": 2.5 }, s);
          text(s, 300, 26, "Salario (índice, gemelo con menos educación = 100)", { "text-anchor": "middle", class: "muted" });
          hand(s, 505, 50, "+12% a +16%", { "text-anchor": "middle", style: "font-size:26px" });
          hand(s, 505, 74, "por año", { "text-anchor": "middle" });
        },
      },
    ];
    story(root, S, { label: "Gemelos de Twinsburg" });
  };

  /* --- Caso real · ¿Ir al hospital te enferma? ----------------------------- */
  WIDGETS.hospital = function (root) {
    caso(root, "Caso real · Sesgo de selección",
      "¿Ir al hospital te enferma? 🏥",
      "En una gran encuesta de salud de EE. UU. se preguntó a las personas si estuvieron hospitalizadas el último año y cómo evalúan su salud " +
      "(de 1 = mala a 5 = excelente). Compara los dos grupos.");
    const base = 200;
    const svg = svgBox(root, 600, 240, "Salud promedio de quienes fueron y no fueron al hospital", true);
    const bars = [["No fueron al hospital", 3.93, 180, "econ-bar-c1"], ["Fueron al hospital", 3.21, 400, "econ-bar-c3"]].map(([lbl, v, x, cls]) => {
      const r = el("rect", { x: x - 55, width: 110, y: base, height: 0, rx: 4, class: cls }, svg);
      const t = text(svg, x, base - 8, "", { "text-anchor": "middle", "font-weight": "700", class: "econ-bar-lbl" });
      text(svg, x, 222, lbl, { "text-anchor": "middle", class: "econ-bar-lbl" });
      return { r, t, v };
    });
    el("line", { x1: 80, x2: 520, y1: base, y2: base, class: "ax" }, svg);
    text(svg, 300, 22, "Salud autorreportada promedio (1 = mala, 5 = excelente)", { "text-anchor": "middle", class: "muted" });
    const ann = el("g", {}, svg);
    onVisible(svg, () => bars.forEach((b, i) => setTimeout(() => tween(650, ease.outCubic, (k) => {
      const hh = b.v * 36 * k;
      b.r.setAttribute("y", base - hh); b.r.setAttribute("height", hh);
      b.t.setAttribute("y", base - hh - 8); b.t.textContent = f(b.v * k, 2);
    }, () => {
      if (i === 1) {
        hand(ann, 466, 130, "¡los del hospital", {});
        hand(ann, 466, 154, "están peor!", {});
      }
    }), reduced() ? 0 : i * 200)));
    const bt = buttons(root);
    btn(bt, "¿Entonces los hospitales enferman? 🤔", reveal, "econ-btn-gold");
    const dec = h("div", { class: "econ-metodo", style: "display:none" });
    root.append(dec);
    const nt = note(root);
    nt.innerHTML = "La diferencia observada es 3.21 − 3.93 = <strong>−0.72</strong>: quienes fueron al hospital reportan peor salud. " +
      "<span class=\"econ-fine\">Datos de la National Health Interview Survey 2005, citados por Angrist y Pischke (2009), <em>Mostly Harmless Econometrics</em>.</span>";
    function reveal() {
      dec.style.display = "";
      dec.innerHTML = "<strong>No: es sesgo de selección.</strong> Usando la descomposición de la lámina:" +
        "<div class=\"econ-decomp\">" +
        "<div><span>Diferencia observada</span><strong>−0.72</strong></div><em>=</em>" +
        "<div class=\"is-att\"><span>ATT: efecto del hospital en quienes fueron</span><strong>probablemente positivo ↑</strong></div><em>+</em>" +
        "<div class=\"is-bias\"><span>Sesgo de selección: quienes van ya estaban más enfermos</span><strong>muy negativo ↓↓</strong></div>" +
        "</div>" +
        "Las personas que se internan lo hacen <em>porque</em> están enfermas: aun sin hospital, su salud sería peor, E[Yᴺᵀ | T=1] &lt; E[Yᴺᵀ | T=0]. " +
        "Ese sesgo negativo es tan grande que esconde el efecto (positivo) de la atención médica.";
      dec.classList.remove("is-in"); void dec.offsetWidth; dec.classList.add("is-in");
    }
  };

  /* --- Caso · Alarmas: ¿protegen o atraen ladrones? ------------------------- */
  WIDGETS.alarmas = function (root) {
    caso(root, "Caso · Pensar el signo del sesgo",
      "¿Las alarmas atraen a los ladrones? 🔔",
      "Una ciudad con dos barrios. Mira quién instala alarmas y dónde ocurren más robos, y responde la pregunta de la lámina.");
    const scene = svgBox(root, 600, 230, "Dos barrios: uno con muchas alarmas y robos, otro tranquilo");
    el("rect", { x: 0, y: 0, width: 600, height: 230, rx: 14, class: "econ-scene-bg" }, scene);
    el("rect", { x: 10, y: 10, width: 285, height: 210, rx: 12, fill: "#f6e3e6" }, scene);
    el("rect", { x: 305, y: 10, width: 285, height: 210, rx: 12, fill: "#e3f1e8" }, scene);
    text(scene, 152, 34, "Barrio A · más delitos", { "text-anchor": "middle", "font-weight": "700" });
    text(scene, 447, 34, "Barrio B · tranquilo", { "text-anchor": "middle", "font-weight": "700" });
    const bells = [];
    const house = (x, y, alarm, delay) => {
      const g = el("g", {}, scene);
      el("polygon", { points: `${x - 22},${y} ${x},${y - 20} ${x + 22},${y}`, fill: "#1b2a5e" }, g);
      el("rect", { x: x - 18, y, width: 36, height: 30, rx: 2, fill: "#ffffff", stroke: "#1b2a5e", "stroke-width": 2 }, g);
      el("rect", { x: x - 5, y: y + 12, width: 10, height: 18, fill: "#c28000" }, g);
      if (alarm) bells.push(text(g, x + 14, y - 8, "🔔", { style: "font-size:16px" }));
      popIn(g, delay, 360);
    };
    [[55, 85, 1], [123, 85, 1], [191, 85, 1], [259, 85, 0], [55, 160, 1], [123, 160, 1], [191, 160, 1], [259, 160, 0]].forEach(([x, y, a], i) => house(x, y, a, i * 60));
    [[350, 85, 0], [418, 85, 0], [486, 85, 1], [554, 85, 0], [350, 160, 0], [418, 160, 0], [486, 160, 0], [554, 160, 0]].forEach(([x, y, a], i) => house(x, y, a, 300 + i * 60));
    const thieves = [[89, 140], [157, 140], [225, 212], [452, 212]].map(([x, y]) => text(scene, x, y, "🦹", { "text-anchor": "middle", style: "font-size:22px;opacity:0" }));
    onVisible(scene, () => {
      thieves.forEach((t, i) => setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = 1; popIn(t, 0, 320); }, reduced() ? 0 : 900 + i * 150));
      setTimeout(() => bells.forEach((bl) => shake(bl, 420)), reduced() ? 0 : 1500);
    });
    const q = h("div", { class: "econ-metodo" });
    root.append(q);
    q.append(h("p", { class: "econ-quiz-q" }, "Si comparamos los robos en casas con alarma vs. sin alarma, la diferencia observada…"));
    const opts = h("div", { class: "econ-quiz-opts" });
    q.append(opts);
    const fb = h("p", { class: "econ-card6-fb" });
    q.append(fb);
    [
      ["…es el efecto causal de las alarmas.", false],
      ["…exagera cuánto protegen las alarmas.", false],
      ["…subestima cuánto protegen: hasta podría parecer que las alarmas atraen robos.", true],
    ].forEach(([lb, ok]) => {
      const bt2 = h("button", { type: "button", class: "econ-quiz-opt" }, lb);
      bt2.addEventListener("click", () => {
        if (q.dataset.done) return;
        bt2.classList.add(ok ? "is-right" : "is-wrong");
        if (!ok) { fb.innerHTML = "❌ Piensa: ¿quiénes instalan alarmas? ¿Cuántos robos habrían tenido <em>sin</em> alarma?"; return; }
        q.dataset.done = "1";
        fb.innerHTML = "✅ Las alarmas se instalan sobre todo donde ya hay más delitos. Sin alarma, esas casas tendrían más robos: " +
          "E[Yᴺᵀ | T=1] &gt; E[Yᴺᵀ | T=0], así que el <strong>sesgo de selección es positivo</strong> (en número de robos). " +
          "Diferencia observada = ATT (negativo: la alarma protege) + sesgo (positivo) ⇒ la comparación ingenua <strong>se acerca a cero o incluso se vuelve positiva</strong>.";
      });
      opts.append(bt2);
    });
  };

  /* --- Simulación · Test A/B (Obama 2008) ---------------------------------- */
  WIDGETS["ab-test"] = function (root) {
    caso(root, "Aleatorización en empresas · Test A/B",
      "El experimento de un botón que recaudó millones 🧪",
      "En 2008, la campaña presidencial de Obama asignó <em>al azar</em> a cada visitante de su web una versión distinta de la página de inscripción. " +
      "Simula el experimento: cada punto es un visitante; los dorados se inscriben.");
    const P = { A: 0.0826, B: 0.116 };
    const st = { n: { A: 0, B: 0 }, c: { A: 0, B: 0 }, pending: 0, running: false };
    const svg = svgBox(root, 600, 250, "Visitantes asignados al azar a la versión A o B");
    el("rect", { x: 0, y: 0, width: 600, height: 250, rx: 14, class: "econ-scene-bg" }, svg);
    const page = (x, label, btnTxt, emo) => {
      el("rect", { x: x - 85, y: 120, width: 170, height: 118, rx: 10, fill: "#ffffff", stroke: "#1b2a5e", "stroke-width": 2 }, svg);
      el("rect", { x: x - 85, y: 120, width: 170, height: 18, rx: 6, fill: "#1b2a5e" }, svg);
      text(svg, x, 133, label, { "text-anchor": "middle", style: "fill:#fff;font-size:11px;font-weight:700" });
      text(svg, x, 178, emo, { "text-anchor": "middle", style: "font-size:30px" });
      el("rect", { x: x - 55, y: 196, width: 110, height: 26, rx: 13, fill: "#b30828" }, svg);
      text(svg, x, 213, btnTxt, { "text-anchor": "middle", style: "fill:#fff;font-size:12px;font-weight:700" });
    };
    page(150, "Versión A", "Inscríbete ahora", "🧑‍💼");
    page(450, "Versión B", "Más información", "👨‍👩‍👧");
    text(svg, 300, 26, "🎲 cada visitante se asigna al azar", { "text-anchor": "middle", "font-weight": "700" });
    const dots = el("g", {}, svg);
    const stats = statsRow(root, [
      { k: "a", label: "Tasa de inscripción A" },
      { k: "b", label: "Tasa de inscripción B" },
      { k: "d", label: "Efecto estimado (B − A)", cls: "is-gold" },
      { k: "ic", label: "IC 95% del efecto", cls: "is-red" },
    ]);
    const b = buttons(root);
    btn(b, "Enviar 300 visitantes", () => send(300, true), "econ-btn-gold");
    btn(b, "Enviar 20 000 (rápido)", () => send(20000, false));
    btn(b, "Reiniciar", reset, "econ-btn-ghost");
    const nt = note(root);
    const r0 = rng(Date.now() % 9999);
    function visit() {
      const arm = r0() < 0.5 ? "A" : "B";
      const conv = r0() < P[arm];
      st.n[arm]++; if (conv) st.c[arm]++;
      return { arm, conv };
    }
    function animDot(arm, conv) {
      const x0 = 300, y0 = 40, x1 = (arm === "A" ? 150 : 450) + (r0() - 0.5) * 120, y1 = 92 + (r0() - 0.5) * 20;
      const d = el("circle", { cx: x0, cy: y0, r: conv ? 5 : 3.5, fill: conv ? "#e5b300" : "#8fa3c8", stroke: conv ? "#1b2a5e" : "none" }, dots);
      tween(520, ease.outCubic, (k) => { d.setAttribute("cx", x0 + (x1 - x0) * k); d.setAttribute("cy", y0 + (y1 - y0) * k); });
      if (dots.childNodes.length > 160) dots.removeChild(dots.firstChild);
    }
    function send(m, animate) {
      if (!animate || reduced()) { for (let i = 0; i < m; i++) visit(); update(); return; }
      st.pending += m;
      if (st.running) return;
      st.running = true;
      (function tick() {
        const k = Math.min(6, st.pending);
        for (let i = 0; i < k; i++) { const v = visit(); animDot(v.arm, v.conv); }
        st.pending -= k;
        update();
        if (st.pending > 0) setTimeout(tick, 60); else st.running = false;
      })();
    }
    function reset() { st.n = { A: 0, B: 0 }; st.c = { A: 0, B: 0 }; st.pending = 0; while (dots.firstChild) dots.removeChild(dots.firstChild); update(); }
    function update() {
      const pa = st.n.A ? st.c.A / st.n.A : NaN, pb = st.n.B ? st.c.B / st.n.B : NaN;
      const d = pb - pa;
      const se = Math.sqrt((pa * (1 - pa)) / st.n.A + (pb * (1 - pb)) / st.n.B);
      stats.set("a", st.n.A ? `${f(100 * pa, 1)}% (n = ${miles(st.n.A)})` : "—");
      stats.set("b", st.n.B ? `${f(100 * pb, 1)}% (n = ${miles(st.n.B)})` : "—");
      stats.set("d", Number.isFinite(d) ? `${d >= 0 ? "+" : ""}${f(100 * d, 1)} puntos` : "—");
      stats.set("ic", Number.isFinite(se) && se > 0 ? `(${f(100 * (d - 1.96 * se), 1)} ; ${f(100 * (d + 1.96 * se), 1)})` : "—");
      const tot = st.n.A + st.n.B;
      nt.innerHTML = (tot < 2000
        ? "Con pocos visitantes el efecto estimado salta mucho y el intervalo es ancho. Envía más visitantes."
        : "Con miles de visitantes el intervalo se angosta alrededor del efecto verdadero (+3.3 puntos). ") +
        " Como la versión se asigna <strong>al azar</strong>, los dos grupos son iguales en promedio en todo lo demás: la diferencia de tasas es el <strong>efecto causal</strong> " +
        "de la página (sin sesgo de selección). Según su responsable, Dan Siroker, la mejor combinación subió la inscripción de 8.26% a 11.6% (+40.6%). " +
        "<span class=\"econ-fine\">Simulación con esas tasas; textos de los botones ilustrativos.</span>";
    }
    update();
  };

  /* --- Juego · Adivina el signo del sesgo ----------------------------------- */
  WIDGETS["signo-sesgo"] = function (root) {
    caso(root, "Juego · Dirección del sesgo",
      "Adivina el signo del sesgo 🧭",
      "Para cada estudio, decide cómo se relaciona la variable omitida con x (δ₁) y con y (β₂). El sesgo es β₂·δ₁: usa la tabla de signos de la lámina.");
    const CASOS = [
      { ic: "👮", x: "policías por habitante", y: "delitos", om: "peligrosidad previa del barrio", d: 1, b: 1,
        why: "Se envían más policías a los barrios más peligrosos (δ₁ > 0) y esos barrios tienen más delitos (β₂ > 0): sesgo positivo. La regresión corta puede mostrar que <em>más policías se asocian con más delitos</em>." },
      { ic: "📚", x: "horas de estudio", y: "nota", om: "horas de trabajo remunerado", d: -1, b: -1,
        why: "Quien trabaja más estudia menos (δ₁ < 0) y trabajar baja la nota (β₂ < 0): β₂·δ₁ > 0, sesgo positivo. Se sobreestima el efecto del estudio." },
      { ic: "🏫", x: "tamaño del curso", y: "puntaje en la prueba", om: "nivel socioeconómico de las familias", d: -1, b: 1,
        why: "Supón que los colegios con familias de más recursos tienen cursos más chicos (δ₁ < 0) y que ese nivel sube el puntaje (β₂ > 0): sesgo negativo. Los cursos grandes parecen todavía peores de lo que son." },
      { ic: "📺", x: "gasto en publicidad del mes", y: "ventas del mes", om: "temporada alta (diciembre)", d: 1, b: 1,
        why: "Las empresas hacen más publicidad en temporada alta (δ₁ > 0) y en temporada alta se vende más de todas formas (β₂ > 0): sesgo positivo. Se sobreestima el efecto de la publicidad." },
    ];
    const grid = h("div", { class: "econ-signos" });
    root.append(grid);
    CASOS.forEach((cs) => {
      const pick = { d: 0, b: 0 };
      const card = h("div", { class: "econ-signo-card" });
      card.append(h("div", { class: "econ-card6-e" }, cs.ic),
        h("p", {}, h("strong", {}, "x: "), cs.x, h("br"), h("strong", {}, "y: "), cs.y, h("br"), h("strong", {}, "omitida: "), cs.om));
      const row = (lbl, key) => {
        const wrap = h("div", { class: "econ-signo-row" }, h("span", {}, lbl));
        [["+", 1], ["−", -1]].forEach(([s, v]) => {
          const bt = h("button", { type: "button", class: "econ-signo-btn", "aria-label": `${key === "d" ? "δ₁" : "β₂"} ${v > 0 ? "positivo" : "negativo"}` }, s);
          bt.addEventListener("click", () => {
            pick[key] = v;
            wrap.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === bt)));
          });
          wrap.append(bt);
        });
        return wrap;
      };
      card.append(row("δ₁ (omitida vs. x)", "d"), row("β₂ (omitida vs. y)", "b"));
      const res = h("p", { class: "econ-card6-fb" });
      const chk = h("button", { type: "button", class: "econ-btn econ-btn-gold" }, "Ver el sesgo");
      chk.addEventListener("click", () => {
        if (!pick.d || !pick.b) { res.innerHTML = "Elige un signo para δ₁ y otro para β₂."; return; }
        const ok = pick.d === cs.d && pick.b === cs.b;
        const sign = cs.d * cs.b > 0 ? "positivo ⬆️" : "negativo ⬇️";
        const fallas = [];
        if (pick.d !== cs.d) fallas.push(`δ₁ es ${cs.d > 0 ? "positivo" : "negativo"}`);
        if (pick.b !== cs.b) fallas.push(`β₂ es ${cs.b > 0 ? "positivo" : "negativo"}`);
        res.innerHTML = `${ok ? "✅" : "❌ " + fallas.join(" y ") + "."} Sesgo <strong>${sign}</strong>. ${cs.why}`;
        card.classList.remove("is-pop"); void card.offsetWidth; card.classList.add("is-pop");
      });
      card.append(chk, res);
      grid.append(card);
    });
  };

  /* --- Visual · Paradoja de Simpson: fumar y edad -------------------------- */
  WIDGETS.simpson = function (root) {
    caso(root, "Visual · Paradoja de Simpson",
      "¿Fumar protege? El efecto que cambia de signo 🚬",
      "Recrea las regresiones de las láminas con datos simulados: primero todos juntos y luego separando por edad. Mira qué pasa con la pendiente.");
    const r0 = rng(17);
    // Tres grupos de edad concentrada (≈30, 50 y 70 años): dentro de cada grupo la edad casi no varía,
    // así la pendiente por grupo recupera el efecto de fumar (≈ 0.94) y la global queda ≈ −1.8.
    const D = Array.from({ length: 220 }, (_, i) => {
      const g = i % 3;
      const age = 30 + 20 * g + 4 * (r0() - 0.5);
      const smoke = Math.max(0, 25 - 0.3 * (age - 20) + 2.2 * gauss(r0));
      const y = 12.8 + 0.94 * smoke + 0.98 * age + gauss(r0);
      return { age, smoke, y, g };
    });
    const GR = [["≈ 30 años", "var(--econ-c1)"], ["≈ 50 años", "var(--econ-c2)"], ["≈ 70 años", "var(--econ-c3)"]];
    const seg = h("div", { class: "econ-seg", role: "tablist" });
    root.append(seg);
    const wrap = h("div");
    root.append(wrap);
    const p = plot(wrap, 600, 320, { l: 48, r: 70 });
    p.domain([0, 32], [45, 115]);
    const stats = statsRow(root, [
      { k: "all", label: "Pendiente todos juntos", cls: "is-red" },
      { k: "g", label: "Pendientes por grupo de edad", cls: "is-gold" },
    ]);
    const nt = note(root);
    const oAll = ols(D.map((d) => d.smoke), D.map((d) => d.y));
    const oG = GR.map((_, k) => ols(D.filter((d) => d.g === k).map((d) => d.smoke), D.filter((d) => d.g === k).map((d) => d.y)));
    const VIEWS = {
      todos: { label: "1 · Todos juntos" },
      edad: { label: "2 · Separar por edad" },
    };
    Object.entries(VIEWS).forEach(([k, v]) => {
      v.btn = h("button", { type: "button", class: "econ-seg-btn", role: "tab" }, v.label);
      v.btn.addEventListener("click", () => show(k));
      seg.append(v.btn);
    });
    function show(k) {
      Object.entries(VIEWS).forEach(([kk, v]) => v.btn.setAttribute("aria-selected", String(kk === k)));
      p.clear();
      p.axes({ xlabel: "Cigarrillos al día", ylabel: "Índice de riesgo (ilustrativo)", nx: 8 });
      const g = p.clipped();
      D.forEach((d) => el("circle", { cx: p.x(d.smoke), cy: p.y(d.y), r: 3.4, class: "econ-dot", style: `fill:${k === "todos" ? "var(--econ-ink-soft)" : GR[d.g][1]};transition:fill .4s` }, g));
      if (k === "todos") {
        const ln = el("path", { d: `M${p.x(0)},${p.y(oAll.b0)} L${p.x(30)},${p.y(oAll.b0 + oAll.b1 * 30)}`, class: "line" }, g);
        drawStroke(ln, 600, 100);
        hand(p.svg, p.x(17), p.y(110), "¿más cigarrillos, menos riesgo?", { "text-anchor": "middle" });
      } else {
        oG.forEach((o, i) => {
          const xs = D.filter((d) => d.g === i).map((d) => d.smoke);
          const a = Math.min(...xs), bb = Math.max(...xs);
          const ln = el("path", { d: `M${p.x(a)},${p.y(o.b0 + o.b1 * a)} L${p.x(bb)},${p.y(o.b0 + o.b1 * bb)}`, style: `stroke:${GR[i][1]};stroke-width:3px;fill:none` }, g);
          drawStroke(ln, 500, 150 + i * 150);
          text(p.svg, p.x(bb) + 6, p.y(o.b0 + o.b1 * bb) + 4, GR[i][0], { "font-weight": "700", style: `fill:${GR[i][1]}` });
        });
        hand(p.svg, p.x(8), p.y(52), "dentro de cada edad, fumar SUBE el riesgo", {});
      }
      stats.set("all", f(oAll.b1, 2));
      stats.set("g", oG.map((o) => f(o.b1, 2)).join(" · "));
      nt.innerHTML = k === "todos"
        ? "Todos juntos, la pendiente es <strong>negativa</strong> (parecida al −1.81 de la lámina): parece que fumar reduce el riesgo. ¿Qué variable estamos omitiendo?"
        : "Las personas mayores fuman menos (δ₂ < 0) y la edad aumenta el riesgo (β₂ > 0): al omitir la edad, “fumar poco” se confunde con “ser mayor”. " +
          "Al comparar personas de edad parecida la pendiente es <strong>positiva</strong> (cerca del 0.94 de la lámina). Esto es la <strong>paradoja de Simpson</strong>. " +
          "En el estudio real de Whickham (Reino Unido), tras 20 años había muerto el 24% de las fumadoras y el 31% de las no fumadoras, ¡porque las no fumadoras eran mucho mayores! " +
          "<span class=\"econ-fine\">Puntos simulados con los coeficientes de las láminas.</span>";
    }
    onVisible(wrap, () => show("todos"));
  };

  /* --- Simulación · ¿Más controles es mejor? -------------------------------- */
  WIDGETS["mas-controles"] = function (root) {
    caso(root, "Simulación · ¿Más es mejor?",
      "Agregar variables irrelevantes: ¿gratis? ➕",
      "Modelo verdadero: y = 1 + 0.5·x + u. Agregamos variables que NO afectan a y pero se parecen a x. Mira qué pasa con β̂₁ en 400 muestras.");
    const st = { k: 3, rho: 0.7 };
    const c = E.controls(root);
    E.slider(c, { label: "Variables irrelevantes agregadas", min: 0, max: 6, step: 1, value: st.k }, (v) => { st.k = v; render(); });
    E.slider(c, { label: "Correlación con x (ρ)", min: 0, max: 0.95, step: 0.05, value: st.rho, fmt: (v) => f(v, 2) }, (v) => { st.rho = v; render(); });
    const wrap = h("div");
    root.append(wrap);
    const p = plot(wrap, 600, 260, { l: 14 });
    const stats = statsRow(root, [
      { k: "m0", label: "Promedio β̂₁ · sin extras" },
      { k: "m1", label: "Promedio β̂₁ · con extras", cls: "is-gold" },
      { k: "s0", label: "Desv. est. · sin extras" },
      { k: "s1", label: "Desv. est. · con extras", cls: "is-red" },
    ]);
    const nt = note(root);
    const SIMS = 400, N = 60;
    let timer = null;
    function simulate(k, rho, seed) {
      const r = rng(seed);
      const out = [];
      for (let s = 0; s < SIMS; s++) {
        const x = [], y = [], ws = Array.from({ length: k }, () => []);
        for (let i = 0; i < N; i++) {
          const xi = gauss(r);
          x.push(xi);
          y.push(1 + 0.5 * xi + gauss(r));
          for (let j = 0; j < k; j++) ws[j].push(rho * xi + Math.sqrt(1 - rho * rho) * gauss(r));
        }
        out.push(olsMulti([x, ...ws], y)[1]);
      }
      return out;
    }
    const base = simulate(0, 0, 5);
    function render() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const ext = simulate(st.k, st.rho, 5);
        const w = 4.2 * Math.max(E.sd(base), E.sd(ext)); // que ninguna distribución quede cortada
        const dom = [0.5 - w, 0.5 + w];
        const H0 = histogram(base, dom[0], dom[1], 45), H1 = histogram(ext, dom[0], dom[1], 45);
        p.clear();
        p.domain(dom, [0, Math.max(...H0.counts, ...H1.counts) * 1.15]);
        p.axes({ noY: true, xlabel: "β̂₁ en 400 muestras (verdadero = 0.5)", nx: 9, xfmt: (v) => f(v, 1) });
        const g = p.clipped();
        // La distribución más ancha (con extras) va atrás para que no tape a la otra
        p.bars(g, H1, "bar-gold");
        p.bars(g, H0, "bar");
        el("line", { x1: p.x(0.5), x2: p.x(0.5), y1: p.m.t, y2: p.h - p.m.b, class: "line-navy line-dash" }, g);
        text(p.svg, p.m.l + 8, p.m.t + 14, "■ sin extras", { style: "fill:var(--econ-c1);font-weight:700" });
        text(p.svg, p.m.l + 8, p.m.t + 30, `■ con ${st.k} extra(s)`, { style: "fill:var(--econ-c2);font-weight:700" });
        const sd0 = E.sd(base), sd1 = E.sd(ext);
        stats.set("m0", f(mean(base), 3));
        stats.set("m1", f(mean(ext), 3));
        stats.set("s0", f(sd0, 3));
        stats.set("s1", f(sd1, 3));
        if (st.k === 0) {
          nt.innerHTML = "Sin variables extra, las dos distribuciones son la misma. Agrega variables irrelevantes con el primer deslizador.";
          return;
        }
        nt.innerHTML = `Las dos distribuciones siguen centradas en 0.5: agregar variables irrelevantes <strong>no sesga</strong> β̂₁. Pero la dispersión pasa de ${f(sd0, 3)} a ` +
          `<strong>${f(sd1, 3)}</strong> (${f((sd1 / sd0 - 1) * 100, 0)}% más): el estimador se vuelve <strong>menos preciso</strong>, sobre todo cuando las variables extra se parecen a x. ` +
          "Es lo que dice la lámina: incluir variables irrelevantes incrementa la varianza de los estimadores. Prueba ρ = 0: casi no cambia.";
      }, 60);
    }
    onVisible(wrap, render);
  };

  /* ========================================================================
     CLASE 4 · Regresión lineal múltiple
     ======================================================================== */

  /* ---- Álgebra y distribuciones para la salida tipo R --------------------- */
  function matInv(A) {
    const n = A.length;
    const M = A.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      const d = M[c][c];
      if (Math.abs(d) < 1e-12) return null;
      for (let q = 0; q < 2 * n; q++) M[c][q] /= d;
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const m = M[r][c];
        for (let q = 0; q < 2 * n; q++) M[r][q] -= m * M[c][q];
      }
    }
    return M.map((r) => r.slice(n));
  }
  const matMul = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
  const tr = (A) => A[0].map((_, j) => A.map((r) => r[j]));

  function lgamma(x) {
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
      12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    let a = c[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  function betacf(a, b, x) {
    let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - (qab * x) / qap;
    d = 1 / (Math.abs(d) < 1e-30 ? 1e-30 : d);
    let hh = d;
    for (let m = 1; m <= 200; m++) {
      const m2 = 2 * m;
      let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
      d = 1 + aa * d; d = 1 / (Math.abs(d) < 1e-30 ? 1e-30 : d);
      c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
      hh *= d * c;
      aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
      d = 1 + aa * d; d = 1 / (Math.abs(d) < 1e-30 ? 1e-30 : d);
      c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
      const del = d * c;
      hh *= del;
      if (Math.abs(del - 1) < 3e-12) break;
    }
    return hh;
  }
  function ibeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
  }
  const pT = (t, df) => ibeta(df / (df + t * t), df / 2, 0.5);           // p-valor bilateral de la t de Student
  const pF = (F, d1, d2) => ibeta(d2 / (d2 + d1 * F), d2 / 2, d1 / 2);    // p-valor de la F

  /* Resumen tipo summary(lm()) para y ~ cols */
  function lmSummary(cols, y) {
    const n = y.length, k = cols.length;
    const X = y.map((_, i) => [1, ...cols.map((c) => c[i])]);
    const XtX = matMul(tr(X), X);
    const inv = matInv(XtX);
    if (!inv) return null;
    const Xty = matMul(tr(X), y.map((v) => [v]));
    const b = matMul(inv, Xty).map((r) => r[0]);
    const yhat = X.map((r) => r.reduce((s, v, j) => s + v * b[j], 0));
    const res = y.map((v, i) => v - yhat[i]);
    const ybar = mean(y);
    const SSR = res.reduce((s, r) => s + r * r, 0);
    const SST = y.reduce((s, v) => s + (v - ybar) ** 2, 0);
    const df = n - k - 1;
    const s2 = SSR / df;
    const se = inv.map((r, j) => Math.sqrt(s2 * r[j]));
    const t = b.map((v, j) => v / se[j]);
    const p = t.map((v) => pT(v, df));
    const R2 = 1 - SSR / SST;
    const R2a = 1 - ((n - 1) / df) * (SSR / SST);
    const F = ((SST - SSR) / k) / s2;
    return { X, XtX, inv, Xty: Xty.map((r) => r[0]), b, yhat, res, SSR, SST, df, se, t, p, R2, R2a, F, pF: pF(F, k, df), rse: Math.sqrt(s2), n, k };
  }

  function matHTML(M, fmt, cls) {
    const rows = M.map((r) => `<tr>${(Array.isArray(r) ? r : [r]).map((v) => `<td>${fmt(v)}</td>`).join("")}</tr>`).join("");
    return `<span class="econ-mat ${cls || ""}"><table>${rows}</table></span>`;
  }

  const SLIDE_DATA = [["Juan", 12, 93, 769], ["Pedro", 18, 119, 808], ["Sofía", 14, 108, 825], ["Caro", 12, 96, 650], ["Alex", 11, 74, 562]];

  /* --- Visual · El plano de regresión ------------------------------------- */
  WIDGETS.plano = function (root) {
    caso(root, "Visual · Interpretar β en la regresión múltiple",
      "Mover una perilla a la vez 🧊",
      "Con dos variables, la regresión ya no es una recta: es un <strong>plano</strong>. Usamos la estimación de la lámina siguiente: " +
      "salario = 0.065 + 0.37·educación + 0.20·IQ. Mueve una variable dejando la otra fija y mira la pendiente en esa dirección.");
    const B = [0.065, 0.37, 0.2];
    const E0 = [8, 20], Q0 = [80, 130];
    const yhat = (e, q) => B[0] + B[1] * e + B[2] * q;
    const Y0 = [yhat(E0[0], Q0[0]) - 1, yhat(E0[1], Q0[1]) + 1];
    const st = { e: 12, q: 100 };
    const svg = svgBox(root, 600, 320, "Plano de regresión con educación e IQ", true);
    // proyección isométrica
    const P = (e, q, y) => {
      const u = (e - E0[0]) / (E0[1] - E0[0]), v = (q - Q0[0]) / (Q0[1] - Q0[0]);
      const hgt = (y - Y0[0]) / (Y0[1] - Y0[0]);
      return [300 + (u - v) * 220, 250 + (u + v) * 40 - hgt * 170];
    };
    const pts = (arr) => arr.map((a) => a.join(",")).join(" ");
    const floor = [P(E0[0], Q0[0], Y0[0]), P(E0[1], Q0[0], Y0[0]), P(E0[1], Q0[1], Y0[0]), P(E0[0], Q0[1], Y0[0])];
    el("polygon", { points: pts(floor), class: "econ-floor" }, svg);
    const plane = [P(E0[0], Q0[0], yhat(E0[0], Q0[0])), P(E0[1], Q0[0], yhat(E0[1], Q0[0])), P(E0[1], Q0[1], yhat(E0[1], Q0[1])), P(E0[0], Q0[1], yhat(E0[0], Q0[1]))];
    el("polygon", { points: pts(plane), class: "econ-planeq" }, svg);
    for (let k = 1; k < 6; k++) {
      const e = E0[0] + (k * (E0[1] - E0[0])) / 6, q = Q0[0] + (k * (Q0[1] - Q0[0])) / 6;
      el("line", { x1: P(e, Q0[0], yhat(e, Q0[0]))[0], y1: P(e, Q0[0], yhat(e, Q0[0]))[1], x2: P(e, Q0[1], yhat(e, Q0[1]))[0], y2: P(e, Q0[1], yhat(e, Q0[1]))[1], class: "econ-gridline" }, svg);
      el("line", { x1: P(E0[0], q, yhat(E0[0], q))[0], y1: P(E0[0], q, yhat(E0[0], q))[1], x2: P(E0[1], q, yhat(E0[1], q))[0], y2: P(E0[1], q, yhat(E0[1], q))[1], class: "econ-gridline" }, svg);
    }
    const lblE = P(E0[1], Q0[0], Y0[0]), lblQ = P(E0[0], Q0[1], Y0[0]);
    text(svg, lblE[0] + 10, lblE[1] + 4, "educación →", { "font-weight": "700" });
    text(svg, lblQ[0] - 10, lblQ[1] + 4, "← IQ", { "text-anchor": "end", "font-weight": "700" });
    const drop = el("line", { class: "econ-drop" }, svg);
    const trail = el("path", { class: "econ-trail" }, svg);
    const dot = el("circle", { r: 8, class: "econ-dot", style: "fill:var(--econ-c2)" }, svg);
    const lab = text(svg, 0, 0, "", { "font-weight": "700" });
    const ann = el("g", {}, svg);
    const c = E.controls(root);
    const sE = E.slider(c, { label: "Años de educación", min: 8, max: 20, step: 1, value: st.e }, (v) => { st.e = v; place(); });
    const sQ = E.slider(c, { label: "IQ", min: 80, max: 130, step: 1, value: st.q }, (v) => { st.q = v; place(); });
    const b = buttons(root);
    btn(b, "+1 año de educación (IQ fijo)", () => step("e"), "econ-btn-gold");
    btn(b, "+10 puntos de IQ (educación fija)", () => step("q"));
    const stats = statsRow(root, [
      { k: "y", label: "Salario predicho ŷ", cls: "is-gold" },
      { k: "d", label: "Último cambio en ŷ" },
    ]);
    const nt = note(root);
    nt.innerHTML = "Cada punto del plano es un salario predicho para una combinación de educación e IQ. Prueba los botones.";
    function place(e, q) {
      e = e ?? st.e; q = q ?? st.q;
      const [x, y] = P(e, q, yhat(e, q)), [fx, fy] = P(e, q, Y0[0]);
      dot.setAttribute("cx", x); dot.setAttribute("cy", y);
      drop.setAttribute("x1", x); drop.setAttribute("y1", y); drop.setAttribute("x2", fx); drop.setAttribute("y2", fy);
      lab.setAttribute("x", x + 12); lab.setAttribute("y", y - 10);
      lab.textContent = `ŷ = ${f(yhat(e, q), 2)}`;
      stats.set("y", f(yhat(e, q), 2));
    }
    function step(which) {
      const from = [st.e, st.q];
      if (which === "e") st.e = Math.min(20, st.e + 1); else st.q = Math.min(130, st.q + 10);
      const to = [st.e, st.q];
      const y0 = yhat(...from), y1 = yhat(...to);
      sE.set(st.e); sQ.set(st.q);
      tween(520, ease.inOutCubic, (k) => place(from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k));
      const a = P(from[0], from[1], y0), z = P(to[0], to[1], y1);
      trail.setAttribute("d", `M${a[0]},${a[1]} L${z[0]},${z[1]}`);
      drawStroke(trail, 520, 0);
      while (ann.firstChild) ann.removeChild(ann.firstChild);
      const msg = which === "e" ? "pendiente β₁ = 0.37 en dirección educación" : "+10 puntos de IQ: 10 × 0.20 = +2.00";
      hand(ann, 300, 34, msg, { "text-anchor": "middle" });
      stats.set("d", `${y1 - y0 >= 0 ? "+" : ""}${f(y1 - y0, 2)}`);
      nt.innerHTML = which === "e"
        ? "Subimos <strong>un año de educación sin mover el IQ</strong>: el salario predicho cambia exactamente en β̂₁ = 0.37. Eso es lo que significa " +
          "“manteniendo todas las demás variables incluidas constantes”: es la pendiente del plano en la dirección de educación, como una <strong>derivada parcial</strong>."
        : "Ahora movemos solo el IQ (educación fija): cada punto de IQ suma β̂₂ = 0.20, así que 10 puntos suman 2. Cada coeficiente es la pendiente del plano " +
          "en <em>su</em> dirección.";
    }
    onVisible(svg, () => place());
  };

  /* --- Caso · ¿Por qué baja el coeficiente al agregar IQ? ------------------ */
  WIDGETS["iq-control"] = function (root) {
    caso(root, "Caso · Controlar por una variable",
      "¿Por qué el efecto de la educación baja de 0.54 a 0.37? ⚖️",
      "La lámina muestra dos regresiones con los mismos datos. Al agregar IQ, el coeficiente de educación se achica. Es la fórmula de variable omitida de la Clase 3, ahora con números reales.");
    const svg = svgBox(root, 600, 240, "Descomposición del coeficiente de educación", true);
    const base = 206, sc = 300;
    el("line", { x1: 60, x2: 540, y1: base, y2: base, class: "ax" }, svg);
    const bars = {
      simple: el("rect", { x: 120, width: 120, y: base, height: 0, rx: 4, class: "econ-bar-c1" }, svg),
      mult: el("rect", { x: 360, width: 120, y: base, height: 0, rx: 4, class: "econ-bar-c1" }, svg),
      extra: el("rect", { x: 360, width: 120, y: base, height: 0, rx: 4, class: "econ-bar-c3", style: "opacity:0" }, svg),
    };
    text(svg, 180, 226, "MCO simple", { "text-anchor": "middle", class: "econ-bar-lbl" });
    text(svg, 420, 226, "MCO múltiple (con IQ)", { "text-anchor": "middle", class: "econ-bar-lbl" });
    const tS = text(svg, 180, base - 8, "", { "text-anchor": "middle", "font-weight": "700", class: "econ-bar-lbl" });
    const tM = text(svg, 420, base - 8, "", { "text-anchor": "middle", "font-weight": "700", class: "econ-bar-lbl" });
    const ann = el("g", {}, svg);
    onVisible(svg, () => {
      tween(650, ease.outCubic, (k) => {
        const h1 = 0.54 * sc * k, h2 = 0.37 * sc * k;
        bars.simple.setAttribute("y", base - h1); bars.simple.setAttribute("height", h1);
        bars.mult.setAttribute("y", base - h2); bars.mult.setAttribute("height", h2);
        tS.setAttribute("y", base - h1 - 8); tS.textContent = f(0.54 * k, 2);
        tM.setAttribute("y", base - h2 - 8); tM.textContent = f(0.37 * k, 2);
      });
    });
    const b = buttons(root);
    btn(b, "¿Dónde quedó la diferencia? 🔍", reveal, "econ-btn-gold");
    const out = h("div", { class: "econ-metodo", style: "display:none" });
    root.append(out);
    const nt = note(root);
    nt.innerHTML = "En la regresión simple, un año más de educación se asocia con 0.54 más de salario; controlando por IQ, solo con 0.37.";
    function reveal() {
      const h2 = 0.37 * sc, h3 = 0.17 * sc;
      bars.extra.style.opacity = 1;
      tween(600, ease.outBack, (k) => { bars.extra.setAttribute("y", base - h2 - h3 * k); bars.extra.setAttribute("height", h3 * k); }, () => {
        while (ann.firstChild) ann.removeChild(ann.firstChild);
        tM.setAttribute("y", base - h2 - h3 - 8);
        tM.textContent = "0.37 + 0.17 = 0.54";
        hand(ann, 500, base - h2 - h3 / 2 + 6, "0.17: IQ", { });
        hand(ann, 500, base - h2 - h3 / 2 + 28, "“disfrazado”", {});
      });
      out.style.display = "";
      out.innerHTML = "Con la fórmula de variable omitida de la Clase 3 (que con MCO se cumple exactamente en la muestra):" +
        "<div class=\"econ-decomp\">" +
        "<div><span>β̃₁ · regresión simple</span><strong>0.54</strong></div><em>=</em>" +
        "<div class=\"is-att\"><span>β̂₁ · educación con IQ fijo</span><strong>0.37</strong></div><em>+</em>" +
        "<div class=\"is-bias\"><span>β̂₂ (IQ) × δ̂₁</span><strong>0.20 × δ̂₁ = 0.17</strong></div></div>" +
        "Despejando, <strong>δ̂₁ ≈ 0.85</strong>: en estos datos, cada año adicional de educación se asocia con unos 0.85 puntos más de IQ. " +
        "Como el IQ sube el salario (β̂₂ > 0) y se relaciona positivamente con la educación (δ̂₁ > 0), la regresión simple <strong>sobreestimaba</strong> " +
        "el efecto de la educación: parte del 0.54 era el efecto del IQ. La regresión múltiple lo separa.";
      out.classList.remove("is-in"); void out.offsetWidth; out.classList.add("is-in");
    }
  };

  /* --- Visual · Armando la matriz X ---------------------------------------- */
  WIDGETS["matriz-x"] = function (root) {
    caso(root, "Visual · Notación matricial",
      "Armando y = Xβ + u con la tabla de datos 🧩",
      "Usemos los 5 individuos del ejemplo de la clase. Cada fila de la tabla es una ecuación; al apilarlas aparecen el vector y y la matriz X.");
    const svg = svgBox(root, 600, 270, "Construcción de la matriz X a partir de la tabla de datos", true);
    const rowsY = (i) => 78 + i * 30;
    const head = ["", "x₁", "x₂", "y"];
    const colX = [40, 100, 150, 200];
    head.forEach((hh, j) => text(svg, colX[j], 50, hh, { "text-anchor": "middle", "font-weight": "700" }));
    text(svg, 120, 26, "Tabla de datos", { "text-anchor": "middle", class: "muted" });
    const cells = SLIDE_DATA.map(([nm, x1, x2, y], i) => {
      text(svg, colX[0], rowsY(i), nm, { "text-anchor": "middle" });
      return [x1, x2, y].map((v, j) => text(svg, colX[j + 1], rowsY(i), String(v), { "text-anchor": "middle", class: "econ-cellnum" }));
    });
    // destino: y (5x1) = X (5x3) β (3x1) + u (5x1)
    const yX = 280, XX = [350, 395, 440], bX = 495, uX = 560;
    const brk = (x, w, top, bottom) => {
      el("path", { d: `M${x - w / 2 + 6},${top} L${x - w / 2},${top} L${x - w / 2},${bottom} L${x - w / 2 + 6},${bottom}`, class: "econ-brk" }, svg);
      el("path", { d: `M${x + w / 2 - 6},${top} L${x + w / 2},${top} L${x + w / 2},${bottom} L${x + w / 2 - 6},${bottom}`, class: "econ-brk" }, svg);
    };
    const grp = el("g", { style: "opacity:0" }, svg);
    const top = 60, bot = 210;
    [[yX, 46], [395, 140], [bX, 40], [uX, 40]].forEach(([x, w]) => { const g = el("g", {}, grp); brk.call(null, x, w, x === bX ? 95 : top, x === bX ? 175 : bot); grp.append(...g.childNodes); });
    text(grp, 318, 140, "=", { "text-anchor": "middle", style: "font-size:20px" });
    text(grp, 530, 140, "+", { "text-anchor": "middle", style: "font-size:20px" });
    ["β₀", "β₁", "β₂"].forEach((s, i) => text(grp, bX, 115 + i * 25, s, { "text-anchor": "middle", "font-weight": "700" }));
    SLIDE_DATA.forEach((_, i) => text(grp, uX, rowsY(i), `u${"₁₂₃₄₅"[i]}`, { "text-anchor": "middle" }));
    const ones = SLIDE_DATA.map((_, i) => text(svg, XX[0], rowsY(i), "1", { "text-anchor": "middle", "font-weight": "700", style: "opacity:0;fill:var(--econ-c2)" }));
    const dims = el("g", { style: "opacity:0" }, svg);
    [[yX, "5×1"], [395, "5×3"], [bX, "3×1"], [uX, "5×1"]].forEach(([x, s]) => text(dims, x, 236, s, { "text-anchor": "middle", class: "muted" }));
    hand(dims, 440, 262, "n × (k + 1) con k = 2", { "text-anchor": "middle", style: "font-size:19px" });
    const b = buttons(root);
    let done = false;
    btn(b, "Armar las matrices", build, "econ-btn-gold");
    const nt = note(root);
    nt.innerHTML = "Presiona “Armar las matrices” para apilar las 5 ecuaciones.";
    function fly(node, tx, ty, delay, color) {
      const sx = +node.getAttribute("x"), sy = +node.getAttribute("y");
      const clone = text(svg, sx, sy, node.textContent, { "text-anchor": "middle", "font-weight": "700", style: `fill:${color}` });
      setTimeout(() => tween(560, ease.inOutCubic, (k) => {
        clone.setAttribute("x", sx + (tx - sx) * k);
        clone.setAttribute("y", sy + (ty - sy) * k - Math.sin(Math.PI * k) * 26);
      }), reduced() ? 0 : delay);
    }
    function build() {
      if (done) return;
      done = true;
      grp.style.transition = "opacity .35s"; grp.style.opacity = 1;
      cells.forEach((row, i) => fly(row[2], yX, rowsY(i), 200 + i * 60, "var(--econ-c3)"));
      ones.forEach((o, i) => setTimeout(() => { o.style.transition = "opacity .3s"; o.style.opacity = 1; popIn(o, 0, 300); }, reduced() ? 0 : 700 + i * 60));
      cells.forEach((row, i) => fly(row[0], XX[1], rowsY(i), 1100 + i * 60, "var(--econ-c1)"));
      cells.forEach((row, i) => fly(row[1], XX[2], rowsY(i), 1500 + i * 60, "var(--econ-c1)"));
      setTimeout(() => { dims.style.transition = "opacity .4s"; dims.style.opacity = 1; }, reduced() ? 0 : 2100);
      nt.innerHTML = "La columna de <strong>y</strong> forma el vector y (5×1). La matriz <strong>X</strong> (5×3) tiene una columna de <strong>unos</strong> " +
        "(que acompaña a β₀), la columna de experiencia y la de educación. Cada fila de X por el vector β da la parte explicada de una persona: " +
        "por ejemplo, para Juan, β₀·1 + β₁·12 + β₂·93.";
    }
  };

  /* --- Calculadora · β̂ = (XᵀX)⁻¹Xᵀy ---------------------------------------- */
  WIDGETS["calc-matricial"] = function (root) {
    caso(root, "Calculadora · El ejemplo, paso a paso",
      "Calcula β̂ = (XᵀX)⁻¹Xᵀy con tus propios datos 🧮",
      "Viene cargada con los datos de la lámina. Cambia cualquier valor y todo se recalcula: úsala para verificar tus cálculos a mano de la ayudantía.");
    const data = SLIDE_DATA.map((r) => r.slice());
    const tbl = h("table", { class: "econ-datagrid" });
    root.append(h("div", { style: "overflow-x:auto" }, tbl));
    const bt = buttons(root);
    btn(bt, "Restaurar datos de la lámina", () => { SLIDE_DATA.forEach((r, i) => { data[i] = r.slice(); }); build(); render(); }, "econ-btn-ghost");
    const out = h("div", { class: "econ-matflow" });
    root.append(out);
    const nt = note(root);
    const fx = (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? miles(v) : f(v, 2));
    function build() {
      tbl.innerHTML = "";
      tbl.append(h("tr", {}, ["Individuo", "x₁ (experiencia)", "x₂ (educación)", "y (salario)", "ŷ", "û"].map((t) => h("th", {}, t))));
      data.forEach((row, i) => {
        const tr2 = h("tr", {}, h("td", {}, row[0]));
        [1, 2, 3].forEach((j) => {
          const inp = h("input", { type: "number", value: row[j], step: "any", "aria-label": `${row[0]} columna ${j}` });
          inp.addEventListener("input", () => { data[i][j] = inp.value === "" ? NaN : +inp.value; render(); });
          tr2.append(h("td", {}, inp));
        });
        tr2.append(h("td", { class: "econ-calc-yhat" }), h("td", { class: "econ-calc-res" }));
        tbl.append(tr2);
      });
    }
    function render() {
      const ok = data.every((r) => [1, 2, 3].every((j) => Number.isFinite(r[j])));
      if (!ok) { out.innerHTML = "<p>Completa todos los valores.</p>"; return; }
      const S = lmSummary([data.map((r) => r[1]), data.map((r) => r[2])], data.map((r) => r[3]));
      if (!S) { out.innerHTML = "<p>⚠️ XᵀX no es invertible: alguna columna es combinación lineal de otras (por ejemplo, todos con la misma experiencia). Es la condición de rango completo de la lámina.</p>"; return; }
      [...tbl.querySelectorAll(".econ-calc-yhat")].forEach((td, i) => { td.textContent = f(S.yhat[i], 1); });
      [...tbl.querySelectorAll(".econ-calc-res")].forEach((td, i) => { td.textContent = f(S.res[i], 1); });
      const steps = [
        ["XᵀX", matHTML(S.XtX, fx)],
        ["(XᵀX)⁻¹", matHTML(S.inv, (v) => f(v, 4))],
        ["Xᵀy", matHTML(S.Xty.map((v) => [v]), fx)],
        ["β̂ = (XᵀX)⁻¹Xᵀy", matHTML(S.b.map((v) => [v]), (v) => f(v, 2), "is-result")],
      ];
      out.innerHTML = steps.map(([t, m], i) => `<div class="econ-matstep" style="animation-delay:${i * 90}ms"><span>${t}</span>${m}</div>`).join("<b class=\"econ-matarrow\">→</b>");
      const isSlide = data.every((r, i) => r.every((v, j) => v === SLIDE_DATA[i][j]));
      nt.innerHTML = (isSlide
        ? "✅ Con los datos de la lámina se obtiene β̂ = (140.59 ; −16.79 ; 8.24), igual que en la lámina y en la salida de R. "
        : "Cambiaste los datos: compara cómo se mueven XᵀX, su inversa y β̂. ") +
        "Las columnas ŷ = Xβ̂ y û = y − ŷ de la tabla cumplen las propiedades algebraicas: Σûᵢ = " + f(S.res.reduce((s, r) => s + r, 0), 2) + ".";
    }
    build();
    onVisible(out, render);
  };

  /* --- Juego · La trampa del R² --------------------------------------------- */
  WIDGETS["r2-trampa"] = function (root) {
    caso(root, "Juego · R² vs. R² ajustado",
      "La trampa del R²: agrega variables basura 🗑️",
      "Tenemos 20 personas y una regresión de salario en educación. Agrega variables que no tienen nada que ver con el salario y mira qué hacen el R² y el R² ajustado.");
    const BASURA = ["👟 número de calzado", "♈ signo zodiacal", "📞 último dígito del celular", "🎲 resultado de un dado", "🍕 pizzas comidas el mes pasado", "🌡️ temperatura de ayer", "🚌 minutos en micro"];
    const r0 = rng(23);
    const N = 20;
    const educ = Array.from({ length: N }, () => 8 + Math.floor(11 * r0()));
    const y = educ.map((e) => 1 + 0.6 * e + 2.2 * gauss(r0));
    const junk = BASURA.map(() => Array.from({ length: N }, () => gauss(r0)));
    const st = { k: 0, hist: [] };
    const chips = h("div", { class: "econ-chips" });
    root.append(chips);
    const svg = svgBox(root, 600, 230, "Evolución del R² y el R² ajustado", true);
    const stats = statsRow(root, [
      { k: "k", label: "Variables en el modelo (k)" },
      { k: "r2", label: "R²", cls: "is-gold" },
      { k: "r2a", label: "R² ajustado", cls: "is-red" },
    ]);
    const strongs = root.querySelectorAll(".econ-stat strong"); // [k, R², R² ajustado]
    const b = buttons(root);
    const addBtn = btn(b, "Agregar variable basura ➕", add, "econ-btn-gold");
    btn(b, "Reiniciar", reset, "econ-btn-ghost");
    const nt = note(root);
    function fit() {
      const cols = [educ, ...junk.slice(0, st.k)];
      const S = lmSummary(cols, y);
      return { r2: S.R2, r2a: S.R2a, k: cols.length };
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const x0 = 70, x1 = 560, y0 = 190, y1 = 30;
      const X = (i) => x0 + (i / BASURA.length) * (x1 - x0), Y = (v) => y0 - v * (y0 - y1);
      [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
        el("line", { x1: x0, x2: x1, y1: Y(v), y2: Y(v), class: "grid" }, svg);
        text(svg, x0 - 8, Y(v) + 4, f(v, 2), { "text-anchor": "end", class: "muted" });
      });
      for (let i = 0; i <= BASURA.length; i++) text(svg, X(i), y0 + 18, `+${i}`, { "text-anchor": "middle", class: "muted" });
      text(svg, (x0 + x1) / 2, y0 + 36, "variables basura agregadas", { "text-anchor": "middle", class: "muted" });
      const path = (key) => st.hist.map((p, i) => `${i ? "L" : "M"}${X(i)},${Y(p[key])}`).join(" ");
      el("path", { d: path("r2"), style: "fill:none;stroke:var(--econ-c2);stroke-width:2.5px" }, svg);
      el("path", { d: path("r2a"), style: "fill:none;stroke:var(--econ-c3);stroke-width:2.5px" }, svg);
      st.hist.forEach((p, i) => {
        el("circle", { cx: X(i), cy: Y(p.r2), r: 5, class: "econ-dot", style: "fill:var(--econ-c2)" }, svg);
        el("circle", { cx: X(i), cy: Y(p.r2a), r: 5, class: "econ-dot", style: "fill:var(--econ-c3)" }, svg);
      });
      const last = st.hist[st.hist.length - 1];
      text(svg, X(st.hist.length - 1) + 10, Y(last.r2) - 6, "R²", { style: "fill:var(--econ-c2);font-weight:700" });
      text(svg, X(st.hist.length - 1) + 10, Y(last.r2a) + 14, "R² ajustado", { style: "fill:var(--econ-c3);font-weight:700" });
    }
    function update(anim) {
      const r = fit();
      st.hist[st.k] = r;
      st.hist.length = st.k + 1;
      draw();
      stats.set("k", String(r.k));
      const prev = st.hist[st.k - 1];
      if (anim && prev) {
        countUp(strongs[1], prev.r2, r.r2, 500, (v) => f(v, 3));
        countUp(strongs[2], prev.r2a, r.r2a, 500, (v) => f(v, 3));
      } else {
        stats.set("r2", f(r.r2, 3));
        stats.set("r2a", f(r.r2a, 3));
      }
      addBtn.disabled = st.k >= BASURA.length;
      nt.innerHTML = st.k === 0
        ? "Con solo educación: R² y R² ajustado son parecidos. Agrega variables basura."
        : `Con ${st.k} variable(s) basura el R² <strong>subió</strong> de ${f(st.hist[0].r2, 3)} a ${f(r.r2, 3)}, aunque ninguna explica nada en la población. ` +
          `El R² ajustado, en cambio, <strong>${r.r2a < st.hist[0].r2a ? "bajó" : "casi no subió"}</strong> (${f(st.hist[0].r2a, 3)} → ${f(r.r2a, 3)}): ` +
          "su factor (n − 1)/(n − k − 1) penaliza cada variable agregada. Por eso, para comparar modelos con distinto número de variables, conviene mirar el R² ajustado.";
    }
    function add() {
      if (st.k >= BASURA.length) return;
      const chip = h("span", { class: "econ-chip-junk" }, BASURA[st.k]);
      chips.append(chip);
      if (!reduced() && chip.animate) {
        chip.animate([{ transform: "scale(.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 300, easing: "cubic-bezier(.175,.885,.32,1.275)" });
      }
      st.k++;
      update(true);
    }
    function reset() { st.k = 0; chips.innerHTML = ""; chips.append(h("span", { class: "econ-chip-junk is-real" }, "🎓 educación (real)")); update(false); }
    reset();
  };

  /* --- Lectura · La salida de R, explicada ---------------------------------- */
  WIDGETS["salida-r"] = function (root) {
    caso(root, "Lectura · Software",
      "¿Qué dice cada parte de la salida de R? 🔎",
      "Esta es la salida de la lámina, recalculada aquí mismo con los 5 datos del ejemplo. Haz clic en cada parte resaltada para ver qué significa.");
    const S = lmSummary([SLIDE_DATA.map((r) => r[1]), SLIDE_DATA.map((r) => r[2])], SLIDE_DATA.map((r) => r[3]));
    const pad = (s, n) => String(s).padStart(n, " ");
    const num = (v, d) => f(v, d);
    const EXPL = {
      call: "La fórmula del modelo: salario en función de experiencia y educación (R agrega la constante automáticamente).",
      res: "Los residuos ûᵢ = yᵢ − ŷᵢ de cada una de las 5 personas. Suman cero (propiedad 1).",
      est: "<strong>Estimate</strong>: los coeficientes β̂ = (XᵀX)⁻¹Xᵀy. Son exactamente los que calculamos a mano: 140.586, −16.790 y 8.237.",
      se: "<strong>Std. Error</strong>: la desviación estándar estimada de cada β̂ (cuánto variaría de muestra en muestra). Lo veremos en las clases de inferencia.",
      t: "<strong>t value</strong> = Estimate / Std. Error. Sirve para contrastar si el parámetro es cero (clase de inferencia sobre un parámetro).",
      p: "<strong>Pr(>|t|)</strong>: el p-valor de ese contraste. Con solo 5 datos, ninguno es significativo: los errores estándar son enormes.",
      rse: `<strong>Residual standard error</strong> = √(SSR/(n − k − 1)) = √(${miles(S.SSR)}/2): el tamaño típico de un residuo. Los <strong>degrees of freedom</strong> son n − k − 1 = 5 − 2 − 1 = 2.`,
      r2: "<strong>Multiple R-squared</strong> = 1 − SSR/SST: la regresión explica el 77.5% de la variación muestral del salario.",
      r2a: "<strong>Adjusted R-squared</strong> = 1 − (n − 1)/(n − k − 1)·SSR/SST = 1 − (4/2)·(1 − 0.7751) = 0.5501. Con tan pocos datos y 2 variables, la penalización es grande.",
      F: "<strong>F-statistic</strong>: contraste de que todos los coeficientes (salvo la constante) son cero a la vez. Se verá en la clase de inferencia sobre un conjunto de parámetros.",
    };
    const tok = (key, txt) => `<button type="button" class="econ-r-tok" data-k="${key}">${txt}</button>`;
    const coefRow = (name, i) =>
      `${name.padEnd(12, " ")}${tok("est", pad(num(S.b[i], 3), 9))} ${tok("se", pad(num(S.se[i], 3), 10))} ${tok("t", pad(num(S.t[i], 3), 7))} ${tok("p", pad(num(S.p[i], 3), 8))}`;
    const pre = h("pre", { class: "econ-r-out" });
    pre.innerHTML =
      `${tok("call", "lm(formula = y_sal ~ experiencia + educacion)")}\n\n` +
      `Residuals:\n${S.res.map((_, i) => pad(i + 1, 7)).join(" ")}\n${tok("res", S.res.map((r) => pad(num(r, 3), 7)).join(" "))}\n\n` +
      `Coefficients:\n            ${"Estimate".padStart(9)} ${"Std. Error".padStart(10)} ${"t value".padStart(7)} ${"Pr(>|t|)".padStart(8)}\n` +
      `${coefRow("(Intercept)", 0)}\n${coefRow("experiencia", 1)}\n${coefRow("educacion", 2)}\n\n` +
      `${tok("rse", `Residual standard error: ${num(S.rse, 2)} on ${S.df} degrees of freedom`)}\n` +
      `${tok("r2", `Multiple R-squared:  ${num(S.R2, 4)}`)},    ${tok("r2a", `Adjusted R-squared:  ${num(S.R2a, 4)}`)}\n` +
      `${tok("F", `F-statistic: ${num(S.F, 3)} on ${S.k} and ${S.df} DF,  p-value: ${num(S.pF, 4)}`)}`;
    root.append(h("div", { style: "overflow-x:auto" }, pre));
    const box = h("div", { class: "econ-metodo" });
    box.innerHTML = "👆 Haz clic en una parte resaltada de la salida.";
    root.append(box);
    pre.addEventListener("click", (e) => {
      const t = e.target.closest(".econ-r-tok");
      if (!t) return;
      pre.querySelectorAll(".econ-r-tok").forEach((x) => x.classList.toggle("is-on", x.dataset.k === t.dataset.k));
      box.innerHTML = EXPL[t.dataset.k];
      box.classList.remove("is-in"); void box.offsetWidth; box.classList.add("is-in");
    });
    const nt = note(root);
    nt.innerHTML = "Los números coinciden con la captura de la lámina porque se calculan con las mismas fórmulas: β̂ = (XᵀX)⁻¹Xᵀy, σ̂² = SSR/(n − k − 1) y Var(β̂) = σ̂²(XᵀX)⁻¹.";
  };

  /* --- Ayudantía · Menores y cofactores -------------------------------------- */
  WIDGETS.cofactores = function (root) {
    caso(root, "Ayudantía · Inversa por cofactores",
      "¿Qué fila y qué columna se eliminan? ✖️",
      "Elige un menor Mᵢⱼ: se tachan la fila i y la columna j de A = XᵀX, y queda la submatriz 2×2 cuyo determinante es el menor. El signo del tablero de ajedrez convierte el menor en cofactor.");
    const A = [["5", "67", "490"], ["67", "929", "6.736"], ["490", "6.736", "49.166"]];
    const M = {
      "11": ["929×49.166 − 6.736×6.736", "301.518"], "12": ["67×49.166 − 6.736×490", "−6.518"], "13": ["67×6.736 − 929×490", "−3.898"],
      "21": ["67×49.166 − 490×6.736", "−6.518"], "22": ["5×49.166 − 490×490", "5.730"], "23": ["5×6.736 − 67×490", "850"],
      "31": ["67×6.736 − 490×929", "−3.898"], "32": ["5×6.736 − 490×67", "850"], "33": ["5×929 − 67×67", "156"],
    };
    const C = { "11": "301.518", "12": "6.518", "13": "−3.898", "21": "6.518", "22": "5.730", "23": "−850", "31": "−3.898", "32": "−850", "33": "156" };
    const wrap = h("div", { class: "econ-cof" });
    root.append(wrap);
    const grid = h("div", { class: "econ-cof-grid" });
    const cells = A.map((row, i) => row.map((v, j) => { const c = h("div", { class: "econ-cof-cell" }, v); grid.append(c); return c; }));
    const picker = h("div", { class: "econ-cof-pick" });
    const info = h("div", { class: "econ-metodo" });
    wrap.append(h("div", {}, h("div", { class: "econ-widget-sub" }, "A = XᵀX"), grid), h("div", {}, h("div", { class: "econ-widget-sub" }, "Elige un menor"), picker));
    root.append(info);
    info.innerHTML = "Haz clic en un menor, por ejemplo M₁₁.";
    const sub = (n) => String(n).replace(/[0-9]/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
    for (let i = 1; i <= 3; i++) for (let j = 1; j <= 3; j++) {
      const bt = h("button", { type: "button", class: "econ-signo-btn econ-cof-btn" }, `M${sub(i)}${sub(j)}`);
      bt.addEventListener("click", () => show(i, j, bt));
      picker.append(bt);
    }
    function show(i, j, bt) {
      picker.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === bt)));
      cells.forEach((row, r) => row.forEach((c, k) => {
        c.classList.toggle("is-out", r === i - 1 || k === j - 1);
        c.classList.toggle("is-keep", !(r === i - 1 || k === j - 1));
        c.classList.remove("is-pulse");
        if (!(r === i - 1 || k === j - 1)) { void c.offsetWidth; c.classList.add("is-pulse"); }
      }));
      const key = `${i}${j}`;
      const sign = (i + j) % 2 === 0 ? "+" : "−";
      info.innerHTML = `Se eliminan la <strong>fila ${i}</strong> y la <strong>columna ${j}</strong>. ` +
        `M${sub(i)}${sub(j)} = ${M[key][0]} = <strong>${M[key][1]}</strong>. ` +
        `Signo del tablero (−1)<sup>${i}+${j}</sup> = <strong>${sign}</strong> ⇒ cofactor C${sub(i)}${sub(j)} = <strong>${C[key]}</strong>.` +
        (i !== j ? ` <span class="econ-fine">Como A es simétrica, M${sub(j)}${sub(i)} da lo mismo.</span>` : "");
    }
  };

  if (typeof document$ !== "undefined") document$.subscribe(E.mountAll);
  E.mountAll();
})();
