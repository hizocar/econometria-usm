/* ==========================================================================
   econ.js — Simuladores interactivos del curso de Econometría (ICS-294, USM)

   Cada bloque <div class="econ-widget" data-widget="nombre"></div> en el
   Markdown se monta con la función WIDGETS[nombre]. Todo se dibuja en SVG
   y los colores salen de las variables CSS de la paleta USM (extra.css),
   por lo que los gráficos se adaptan al modo claro/oscuro automáticamente.

   Se re-monta en cada cambio de página vía document$ (navegación instantánea
   de Material for MkDocs).
   ========================================================================== */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  /* ------------------------------------------------------------------------
     Números aleatorios reproducibles (mulberry32) y normal (Box-Muller)
     ------------------------------------------------------------------------ */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gauss(r) {
    let u = 0;
    while (u === 0) u = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
  }

  const newSeed = () => (Math.random() * 4294967296) >>> 0;

  /* ------------------------------------------------------------------------
     Estadística
     ------------------------------------------------------------------------ */
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const mean = (a) => sum(a) / a.length;
  const sd = (a) => {
    if (a.length < 2) return NaN;
    const m = mean(a);
    return Math.sqrt(sum(a.map((v) => (v - m) ** 2)) / (a.length - 1));
  };

  function ols(x, y) {
    const mx = mean(x);
    const my = mean(y);
    let sxy = 0;
    let sxx = 0;
    for (let i = 0; i < x.length; i++) {
      sxy += (x[i] - mx) * (y[i] - my);
      sxx += (x[i] - mx) ** 2;
    }
    const b1 = sxy / sxx;
    const b0 = my - b1 * mx;
    const yhat = x.map((v) => b0 + b1 * v);
    const resid = y.map((v, i) => v - yhat[i]);
    const SST = sum(y.map((v) => (v - my) ** 2));
    const SSR = sum(resid.map((v) => v * v));
    const SSE = sum(yhat.map((v) => (v - my) ** 2));
    return { b0, b1, yhat, resid, SST, SSR, SSE, R2: SSE / SST, mx, my, sxx };
  }

  /* MCO con dos regresores (sumas centradas): devuelve b1 y b2. */
  function ols2(x1, x2, y) {
    const m1 = mean(x1);
    const m2 = mean(x2);
    const my = mean(y);
    let s11 = 0, s22 = 0, s12 = 0, s1y = 0, s2y = 0;
    for (let i = 0; i < y.length; i++) {
      const a = x1[i] - m1, b = x2[i] - m2, c = y[i] - my;
      s11 += a * a; s22 += b * b; s12 += a * b; s1y += a * c; s2y += b * c;
    }
    const det = s11 * s22 - s12 * s12;
    return { b1: (s22 * s1y - s12 * s2y) / det, b2: (s11 * s2y - s12 * s1y) / det };
  }

  const normPdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

  const Z = { "0.80": 1.2816, "0.90": 1.6449, "0.95": 1.96, "0.98": 2.3263, "0.99": 2.5758 };

  function histogram(vals, lo, hi, bins) {
    const counts = new Array(bins).fill(0);
    const w = (hi - lo) / bins;
    for (const v of vals) {
      const k = Math.floor((v - lo) / w);
      if (k >= 0 && k < bins) counts[k]++;
    }
    return { counts, w, lo };
  }

  function shuffle(a, r) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* Evita mostrar "-0.000" cuando el valor es cero por redondeo. */
  const f = (v, d = 2) => (Number.isFinite(v) ? (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d) : "—");
  const fBig = (v) => (Number.isFinite(v) ? Math.round(v).toLocaleString("es-CL") : "—");

  /* ------------------------------------------------------------------------
     Helpers de interfaz (HTML)
     ------------------------------------------------------------------------ */
  function h(tag, attrs, ...children) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === "class") e.className = attrs[k];
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    children.flat().forEach((c) => e.append(c instanceof Node ? c : document.createTextNode(c)));
    return e;
  }

  function header(root, title, sub) {
    root.append(h("div", { class: "econ-widget-title" }, h("span", { class: "econ-chip" }, "Interactivo"), title));
    if (sub) root.append(h("p", { class: "econ-widget-sub" }, sub));
  }

  function controls(root) {
    const c = h("div", { class: "econ-controls" });
    root.append(c);
    return c;
  }

  function slider(parent, o, onInput) {
    const fmt = o.fmt || ((v) => v);
    const out = h("output", {}, fmt(o.value));
    const inp = h("input", { type: "range", min: o.min, max: o.max, step: o.step, value: o.value, "aria-label": o.label });
    inp.addEventListener("input", () => {
      out.textContent = fmt(+inp.value);
      if (onInput) onInput(+inp.value);
    });
    const wrap = h("div", { class: "econ-control" }, h("label", {}, h("span", {}, o.label), out), inp);
    parent.append(wrap);
    return {
      get: () => +inp.value,
      set: (v) => { inp.value = v; out.textContent = fmt(+inp.value); },
      wrap,
      input: inp,
    };
  }

  function select(parent, o, onChange) {
    const s = h("select", { "aria-label": o.label });
    o.options.forEach(([v, l]) => {
      const opt = h("option", { value: v }, l);
      if (String(v) === String(o.value)) opt.selected = true;
      s.append(opt);
    });
    s.addEventListener("change", () => onChange(s.value));
    parent.append(h("div", { class: "econ-control" }, h("label", {}, h("span", {}, o.label)), s));
    return s;
  }

  function numberInput(parent, o, onChange) {
    const inp = h("input", { type: "number", value: o.value, step: o.step || "any", "aria-label": o.label });
    inp.addEventListener("input", () => onChange(inp.value));
    parent.append(h("div", { class: "econ-control" }, h("label", {}, h("span", {}, o.label)), inp));
    return inp;
  }

  function buttons(root) {
    const b = h("div", { class: "econ-buttons" });
    root.append(b);
    return b;
  }

  function btn(parent, label, onClick, cls) {
    const b = h("button", { type: "button", class: "econ-btn " + (cls || "") }, label);
    b.addEventListener("click", onClick);
    parent.append(b);
    return b;
  }

  function toggle(parent, label, initial, onChange) {
    const b = btn(parent, label, () => {
      const v = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(v));
      onChange(v);
    });
    b.setAttribute("aria-pressed", String(!!initial));
    return b;
  }

  function statsRow(root, defs) {
    const wrap = h("div", { class: "econ-stats" });
    const cells = {};
    defs.forEach((d) => {
      const strong = h("strong", {}, "—");
      cells[d.k] = strong;
      wrap.append(h("div", { class: "econ-stat " + (d.cls || "") }, h("span", {}, d.label), strong));
    });
    root.append(wrap);
    return { set: (k, v) => { cells[k].textContent = v; } };
  }

  function note(root) {
    const n = h("div", { class: "econ-note" });
    root.append(n);
    return n;
  }

  /* ------------------------------------------------------------------------
     Helpers de gráficos (SVG)
     ------------------------------------------------------------------------ */
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function text(parent, x, y, s, attrs) {
    const t = el("text", Object.assign({ x, y }, attrs || {}), parent);
    t.textContent = s;
    return t;
  }

  function ticks(a, b, n) {
    const raw = (b - a) / n;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const out = [];
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  const tickFmt = (v) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("es-CL") : String(+v.toFixed(4)));

  function plot(container, w, hgt, margin) {
    const m = Object.assign({ l: 46, r: 14, t: 14, b: 38 }, margin || {});
    const svg = el("svg", { viewBox: `0 0 ${w} ${hgt}`, class: "econ-plot", role: "img" });
    container.append(svg);
    const clipId = "econ-clip-" + uid++;
    const p = { svg, w, h: hgt, m, xd: [0, 1], yd: [0, 1] };

    p.domain = (xd, yd) => { p.xd = xd; p.yd = yd; return p; };
    p.x = (v) => m.l + ((v - p.xd[0]) / (p.xd[1] - p.xd[0])) * (w - m.l - m.r);
    p.y = (v) => hgt - m.b - ((v - p.yd[0]) / (p.yd[1] - p.yd[0])) * (hgt - m.t - m.b);
    p.ix = (px) => p.xd[0] + ((px - m.l) / (w - m.l - m.r)) * (p.xd[1] - p.xd[0]);
    p.iy = (py) => p.yd[0] + ((hgt - m.b - py) / (hgt - m.t - m.b)) * (p.yd[1] - p.yd[0]);

    p.clear = () => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const defs = el("defs", {}, svg);
      const cp = el("clipPath", { id: clipId }, defs);
      el("rect", { x: m.l, y: m.t, width: w - m.l - m.r, height: hgt - m.t - m.b }, cp);
    };

    p.clipped = () => el("g", { "clip-path": `url(#${clipId})` }, svg);

    p.axes = (o) => {
      o = o || {};
      const g = el("g", {}, svg);
      const xt = o.xticks || ticks(p.xd[0], p.xd[1], o.nx || 6);
      const yt = o.yticks || ticks(p.yd[0], p.yd[1], o.ny || 5);
      const xf = o.xfmt || tickFmt;
      const yf = o.yfmt || tickFmt;
      if (!o.noY && o.grid !== false) {
        yt.forEach((v) => el("line", { x1: m.l, x2: w - m.r, y1: p.y(v), y2: p.y(v), class: "grid" }, g));
      }
      el("line", { x1: m.l, x2: w - m.r, y1: hgt - m.b, y2: hgt - m.b, class: "ax" }, g);
      if (!o.noY) el("line", { x1: m.l, x2: m.l, y1: m.t, y2: hgt - m.b, class: "ax" }, g);
      if (!o.noX) {
        xt.forEach((v) => {
          el("line", { x1: p.x(v), x2: p.x(v), y1: hgt - m.b, y2: hgt - m.b + 4, class: "ax" }, g);
          text(g, p.x(v), hgt - m.b + 16, xf(v), { "text-anchor": "middle", class: "muted" });
        });
      }
      if (!o.noY) {
        yt.forEach((v) => text(g, m.l - 6, p.y(v) + 4, yf(v), { "text-anchor": "end", class: "muted" }));
      }
      if (o.xlabel) text(g, (m.l + w - m.r) / 2, hgt - 4, o.xlabel, { "text-anchor": "middle" });
      if (o.ylabel) {
        text(g, -(m.t + (hgt - m.t - m.b) / 2), 12, o.ylabel, { "text-anchor": "middle", transform: "rotate(-90)" });
      }
      if (o.title) text(g, m.l + 4, m.t + 12, o.title, { "font-weight": "700" });
      return g;
    };

    p.vline = (g, v, cls, label) => {
      el("line", { x1: p.x(v), x2: p.x(v), y1: m.t, y2: hgt - m.b, class: cls }, g);
      if (label) text(g, p.x(v) + 4, m.t + 12, label, { "font-weight": "700" });
    };

    p.hline = (g, v, cls) => el("line", { x1: m.l, x2: w - m.r, y1: p.y(v), y2: p.y(v), class: cls }, g);

    p.lineFn = (g, fn, cls) => {
      el("line", { x1: p.x(p.xd[0]), y1: p.y(fn(p.xd[0])), x2: p.x(p.xd[1]), y2: p.y(fn(p.xd[1])), class: cls }, g);
    };

    p.curve = (g, fn, cls, pts) => {
      pts = pts || 160;
      let d = "";
      for (let i = 0; i <= pts; i++) {
        const xv = p.xd[0] + ((p.xd[1] - p.xd[0]) * i) / pts;
        d += (i ? "L" : "M") + p.x(xv).toFixed(2) + "," + p.y(fn(xv)).toFixed(2);
      }
      el("path", { d, class: cls }, g);
    };

    p.bars = (g, H, cls) => {
      const bw = p.x(H.lo + H.w) - p.x(H.lo);
      H.counts.forEach((c, i) => {
        if (!c) return;
        el("rect", {
          x: p.x(H.lo + i * H.w) + 0.4,
          width: Math.max(0.6, bw - 0.8),
          y: p.y(c),
          height: p.y(0) - p.y(c),
          class: cls,
        }, g);
      });
    };

    /* Convierte un evento de puntero a coordenadas del viewBox. */
    p.local = (evt) => {
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    };

    p.clear();
    return p;
  }

  function arrow(g, x1, y1, x2, y2, color, width, opacity) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hl = 7 + width;
    const style = `stroke:${color};fill:${color};opacity:${opacity}`;
    el("line", {
      x1, y1,
      x2: x2 - Math.cos(ang) * hl * 0.8,
      y2: y2 - Math.sin(ang) * hl * 0.8,
      style: style + `;stroke-width:${width}`,
    }, g);
    const p1 = [x2 - hl * Math.cos(ang - 0.45), y2 - hl * Math.sin(ang - 0.45)];
    const p2 = [x2 - hl * Math.cos(ang + 0.45), y2 - hl * Math.sin(ang + 0.45)];
    el("polygon", { points: `${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`, style }, g);
  }

  const WIDGETS = {};

  /* ========================================================================
     CLASE 1 · Muestreo, TCL e intervalos de confianza
     ======================================================================== */

  /* --- Métodos de muestreo ------------------------------------------------ */
  WIDGETS.muestreo = function (root) {
    header(root, "Simulador: métodos de muestreo",
      "Población de 108 hogares: 3 estratos de ingreso (filas) y 6 barrios o conglomerados (bloques de columnas). " +
      "Elige un método para sacar una muestra de 12 hogares y compara qué tan precisa es la media muestral.");

    const COLS = 12, ROWS = 9, NSAMP = 12;
    const BASE = [1500, 900, 450]; // ingreso medio por estrato (miles de $)
    const BARRIO = [180, -120, 60, -180, 120, -60]; // efecto de cada barrio
    const STRATUM = ["Alto", "Medio", "Bajo"];
    const r0 = rng(2026);
    const units = [];
    for (let rr = 0; rr < ROWS; rr++) {
      for (let cc = 0; cc < COLS; cc++) {
        const s = Math.floor(rr / 3);
        const cl = Math.floor(cc / 2);
        units.push({ r: rr, c: cc, s, cl, v: BASE[s] + BARRIO[cl] + 110 * gauss(r0) });
      }
    }
    const popMean = mean(units.map((u) => u.v));
    const rnd = rng(newSeed());

    const METHODS = {
      simple: {
        label: "Aleatorio simple",
        pick: (r) => shuffle(units.map((_, i) => i), r).slice(0, NSAMP),
      },
      sistematico: {
        label: "Sistemático",
        pick: (r) => {
          const k = units.length / NSAMP;
          const start = Math.floor(r() * k);
          return Array.from({ length: NSAMP }, (_, j) => start + j * k);
        },
      },
      estratificado: {
        label: "Estratificado",
        pick: (r) => [0, 1, 2].flatMap((s) =>
          shuffle(units.map((u, i) => (u.s === s ? i : -1)).filter((i) => i >= 0), r).slice(0, NSAMP / 3)),
      },
      conglomerados: {
        label: "Conglomerados",
        pick: (r) => {
          const chosen = shuffle([0, 1, 2, 3, 4, 5], r).slice(0, 2);
          return chosen.flatMap((cl) =>
            shuffle(units.map((u, i) => (u.cl === cl ? i : -1)).filter((i) => i >= 0), r).slice(0, NSAMP / 2));
        },
      },
    };

    const st = { method: "simple", sample: [], se: null };
    const bwrap = buttons(root);
    const mbtns = {};
    Object.entries(METHODS).forEach(([k, m]) => {
      mbtns[k] = btn(bwrap, m.label, () => { st.method = k; draw(); });
    });
    btn(bwrap, "Repetir 1.000 veces (todos)", repeat, "econ-btn-gold");

    const pwrap = h("div");
    root.append(pwrap);
    const p = plot(pwrap, 600, 300, { l: 58, r: 10, t: 26, b: 12 });
    const stats = statsRow(root, [
      { k: "pop", label: "Media poblacional", cls: "is-gold" },
      { k: "smp", label: "Media muestral" },
      { k: "err", label: "Error de esta muestra", cls: "is-red" },
    ]);
    const n = note(root);

    function draw() {
      st.sample = METHODS[st.method].pick(rnd);
      render();
    }

    function repeat() {
      st.se = {};
      Object.entries(METHODS).forEach(([k, m]) => {
        const means = [];
        for (let i = 0; i < 1000; i++) means.push(mean(m.pick(rnd).map((j) => units[j].v)));
        st.se[k] = Math.sqrt(mean(means.map((v) => (v - popMean) ** 2)));
      });
      render();
    }

    function render() {
      Object.entries(mbtns).forEach(([k, b]) => b.setAttribute("aria-pressed", String(k === st.method)));
      p.clear();
      const g = el("g", {}, p.svg);
      const cw = (p.w - p.m.l - p.m.r) / COLS;
      const rh = (p.h - p.m.t - p.m.b) / ROWS;
      const cx = (c) => p.m.l + cw * (c + 0.5);
      const cy = (r) => p.m.t + rh * (r + 0.5);
      // estratos y barrios
      for (let s = 0; s < 3; s++) {
        el("rect", { x: p.m.l, y: p.m.t + rh * 3 * s, width: cw * COLS, height: rh * 3, class: "grid", fill: "none" }, g);
        text(g, p.m.l - 8, p.m.t + rh * (3 * s + 1.5) + 4, STRATUM[s], { "text-anchor": "end", class: "muted" });
      }
      const chosenCl = new Set(st.sample.map((i) => units[i].cl));
      for (let cl = 0; cl < 6; cl++) {
        const x = p.m.l + cw * 2 * cl;
        if (cl) el("line", { x1: x, x2: x, y1: p.m.t, y2: p.h - p.m.b, class: "ax", "stroke-dasharray": "3 3" }, g);
        const on = st.method === "conglomerados" && chosenCl.has(cl);
        text(g, x + cw, p.m.t - 9, "Barrio " + (cl + 1), {
          "text-anchor": "middle",
          class: on ? "" : "muted",
          "font-weight": on ? "700" : "400",
        });
        if (on) {
          el("rect", { x: x + 2, y: p.m.t + 2, width: cw * 2 - 4, height: rh * ROWS - 4, class: "line-gold", "stroke-dasharray": "6 4" }, g);
        }
      }
      const inS = new Set(st.sample);
      units.forEach((u, i) => {
        const sel = inS.has(i);
        el("circle", {
          cx: cx(u.c),
          cy: cy(u.r),
          r: sel ? 9 : 7,
          class: sel ? "pt-alt" : "pt",
          style: "fill-opacity:" + (sel ? 1 : [0.9, 0.55, 0.25][u.s]),
          stroke: sel ? "currentColor" : "none",
          "stroke-width": sel ? 1.5 : 0,
        }, g);
      });

      stats.set("pop", fBig(popMean));
      if (st.sample.length) {
        const sm = mean(st.sample.map((i) => units[i].v));
        stats.set("smp", fBig(sm));
        stats.set("err", (sm - popMean >= 0 ? "+" : "") + fBig(sm - popMean));
      }
      const desc = {
        simple: "Cada hogar tiene la misma probabilidad de salir. Simple, pero puede salir una muestra con muchos hogares de un solo estrato.",
        sistematico: "Se elige un inicio al azar y luego cada k = 9 hogares. Solo el primer elemento es realmente aleatorio. " +
          "Aquí resulta muy preciso porque la lista está ordenada por estrato, así que recorre todos los estratos (si el orden coincidiera con un ciclo de los datos, podría sesgarse).",
        estratificado: "4 hogares de cada estrato. Como cada estrato es internamente homogéneo, la media muestral varía poco entre muestras.",
        conglomerados: "Se sortean 2 barrios completos y se encuestan 6 hogares en cada uno. Es más barato (menos traslados), pero si los barrios difieren entre sí la estimación es menos precisa.",
      }[st.method];
      let html = "<strong>" + METHODS[st.method].label + ":</strong> " + desc;
      if (st.se) {
        html += "<br><strong>Error estándar empírico (1.000 muestras por método):</strong> " +
          Object.entries(METHODS).map(([k, m]) => m.label + " = " + fBig(st.se[k])).join(" · ");
      } else {
        html += "<br>Presiona <em>Repetir 1.000 veces</em> para comparar la precisión de los cuatro métodos.";
      }
      n.innerHTML = html;
    }
    draw();
  };

  /* --- Teorema Central del Límite ---------------------------------------- */
  WIDGETS.tcl = function (root) {
    header(root, "Simulador: Teorema Central del Límite",
      "Elige una población (¡ninguna es normal!), un tamaño muestral n y extrae muestras. " +
      "A la derecha se acumulan los promedios x̄ de cada muestra; la curva roja es la normal N(μ, σ²/n).");

    const POPS = {
      expo: { label: "Exponencial (asimétrica)", draw: (r) => -5 * Math.log(1 - r()), mu: 5, sd: 5, dom: [0, 25], need: 50 },
      unif: { label: "Uniforme (0 a 10)", draw: (r) => 10 * r(), mu: 5, sd: 10 / Math.sqrt(12), dom: [0, 10], need: 30 },
      bimod: { label: "Bimodal", draw: (r) => (r() < 0.5 ? 2 : 8) + gauss(r), mu: 5, sd: Math.sqrt(10), dom: [-1, 11], need: 30 },
      logn: {
        label: "Muy asimétrica (log-normal)",
        draw: (r) => Math.exp(1 + 0.8 * gauss(r)),
        mu: Math.exp(1.32),
        sd: Math.sqrt((Math.exp(0.64) - 1) * Math.exp(2.64)),
        dom: [0, 20],
        need: 100,
      },
    };
    const st = { pop: "expo", n: 5, means: [], last: [], r: rng(newSeed()) };
    const cache = {};

    const c = controls(root);
    select(c, { label: "Población", value: st.pop, options: Object.entries(POPS).map(([k, v]) => [k, v.label]) },
      (v) => { st.pop = v; reset(); });
    slider(c, { label: "Tamaño muestral n", min: 1, max: 120, step: 1, value: st.n }, (v) => { st.n = v; reset(); });
    const b = buttons(root);
    btn(b, "Extraer 1 muestra", () => drawSamples(1), "econ-btn-gold");
    btn(b, "+100 muestras", () => drawSamples(100));
    btn(b, "+1.000 muestras", () => drawSamples(1000));
    btn(b, "Reiniciar", reset, "econ-btn-ghost");

    const row = h("div", { class: "econ-plot-row" });
    root.append(row);
    const L = h("div"), R = h("div");
    row.append(L, R);
    const pL = plot(L, 380, 250, { l: 14 });
    const pR = plot(R, 380, 250, { l: 14 });
    const stats = statsRow(root, [
      { k: "mu", label: "μ poblacional", cls: "is-gold" },
      { k: "se", label: "σ/√n (teórico)" },
      { k: "mm", label: "Promedio de los x̄" },
      { k: "sm", label: "Desv. est. de los x̄" },
      { k: "N", label: "N.º de muestras" },
    ]);
    const n = note(root);

    function popHist(k) {
      if (!cache[k]) {
        const r = rng(7);
        const P = POPS[k];
        const v = [];
        for (let i = 0; i < 20000; i++) v.push(P.draw(r));
        cache[k] = histogram(v, P.dom[0], P.dom[1], 50);
      }
      return cache[k];
    }

    function drawSamples(m) {
      const P = POPS[st.pop];
      for (let j = 0; j < m; j++) {
        const s = [];
        for (let i = 0; i < st.n; i++) s.push(P.draw(st.r));
        st.means.push(mean(s));
        st.last = s;
      }
      render();
    }

    function reset() {
      st.means = [];
      st.last = [];
      render();
    }

    function render() {
      const P = POPS[st.pop];
      const H = popHist(st.pop);
      pL.clear();
      pL.domain(P.dom, [0, Math.max(...H.counts) * 1.2]);
      pL.axes({ noY: true, xlabel: "X en la población", title: "Población" });
      const gL = pL.clipped();
      pL.bars(gL, H, "bar");
      pL.vline(gL, P.mu, "mu");
      st.last.forEach((v) => el("line", { x1: pL.x(v), x2: pL.x(v), y1: pL.y(0), y2: pL.y(0) - 16, class: "line", style: "stroke-width:2px" }, gL));
      if (st.last.length) text(pL.svg, pL.w - pL.m.r - 4, pL.m.t + 12, "| = última muestra", { "text-anchor": "end", class: "muted" });

      const se = P.sd / Math.sqrt(st.n);
      const N = st.means.length;
      const HM = histogram(st.means, P.dom[0], P.dom[1], 80);
      const peak = normPdf(P.mu, P.mu, se) * Math.max(N, 1) * HM.w;
      const ymax = Math.max(N ? Math.max(...HM.counts) : 0, N ? peak : 1) * 1.15;
      pR.clear();
      pR.domain(P.dom, [0, ymax]);
      pR.axes({ noY: true, xlabel: "Promedio muestral x̄", title: "Distribución de x̄" });
      const gR = pR.clipped();
      if (N) {
        pR.bars(gR, HM, "bar-gold");
        if (N >= 30) pR.curve(gR, (x) => normPdf(x, P.mu, se) * N * HM.w, "line");
      } else {
        text(pR.svg, pR.w / 2, pR.h / 2, "Extrae muestras para construir la distribución", { "text-anchor": "middle", class: "muted" });
      }
      pR.vline(gR, P.mu, "mu");

      stats.set("mu", f(P.mu, 2));
      stats.set("se", f(se, 3));
      stats.set("mm", N ? f(mean(st.means), 3) : "—");
      stats.set("sm", N > 1 ? f(sd(st.means), 3) : "—");
      stats.set("N", N.toLocaleString("es-CL"));
      n.innerHTML = st.n >= P.need
        ? `Con n = ${st.n} ≥ ${P.need}, la distribución de x̄ es aproximadamente <strong>normal</strong>, centrada en μ y con desviación σ/√n — aunque la población no sea normal. Compara la desviación de los x̄ con σ/√n.`
        : `Regla de dedo para esta población: n ≥ ${P.need}. Con n = ${st.n} la distribución de x̄ <strong>todavía puede no ser normal</strong>. Sube n y observa cómo se vuelve simétrica y más angosta.`;
    }
    render();
  };

  /* --- Cobertura de intervalos de confianza ------------------------------- */
  WIDGETS["ic-cobertura"] = function (root) {
    header(root, "Simulador: ¿qué significa “95% de confianza”?",
      "Ventas mensuales con μ = 200 y σ = 60, como en el Ejemplo 1. Cada línea es el IC de una muestra distinta. " +
      "En la práctica no conocemos μ: aquí sí, para ver cuántos intervalos lo atrapan. Las líneas rojas no contienen a μ.");
    const MU = 200, SIG = 60;
    const st = { lvl: "0.95", n: 36, ivs: [], tot: 0, hit: 0, r: rng(newSeed()) };

    const c = controls(root);
    select(c, { label: "Nivel de confianza", value: st.lvl, options: [["0.90", "90%"], ["0.95", "95%"], ["0.99", "99%"]] },
      (v) => { st.lvl = v; restart(); });
    slider(c, { label: "Tamaño muestral n", min: 4, max: 144, step: 1, value: st.n }, (v) => { st.n = v; restart(); });
    const b = buttons(root);
    btn(b, "Nuevos 100 intervalos", gen100, "econ-btn-gold");
    btn(b, "+1.000 (solo contar)", () => {
      for (let i = 0; i < 1000; i++) count(one());
      render();
    });

    const wrap = h("div");
    root.append(wrap);
    const p = plot(wrap, 600, 380, { l: 14, t: 8 });
    const stats = statsRow(root, [
      { k: "these", label: "Contienen μ (estos 100)" },
      { k: "cum", label: "Cobertura acumulada", cls: "is-gold" },
      { k: "E", label: "Margen E = z·σ/√n" },
      { k: "z", label: "z" },
    ]);
    const n = note(root);

    function one() {
      const se = SIG / Math.sqrt(st.n);
      const z = Z[st.lvl];
      const xb = MU + se * gauss(st.r);
      return { xb, lo: xb - z * se, hi: xb + z * se };
    }
    const covers = (iv) => iv.lo <= MU && MU <= iv.hi;
    function count(iv) { st.tot++; if (covers(iv)) st.hit++; }

    function gen100() {
      st.ivs = Array.from({ length: 100 }, one);
      st.ivs.forEach(count);
      render();
    }

    function restart() {
      st.tot = 0;
      st.hit = 0;
      gen100();
    }

    function render() {
      const se = SIG / Math.sqrt(st.n);
      const z = Z[st.lvl];
      p.clear();
      p.domain([MU - 4.6 * se, MU + 4.6 * se], [0, 100]);
      p.axes({ noY: true, xlabel: "Ventas mensuales" });
      const g = p.clipped();
      st.ivs.forEach((iv, i) => {
        const y = p.y(i + 0.5);
        el("line", { x1: p.x(iv.lo), x2: p.x(iv.hi), y1: y, y2: y, class: covers(iv) ? "ci-hit" : "ci-miss" }, g);
        el("circle", { cx: p.x(iv.xb), cy: y, r: 1.4, class: "bar-navy" }, g);
      });
      p.vline(g, MU, "mu", "μ = 200");
      const k = st.ivs.filter(covers).length;
      stats.set("these", `${k} de 100`);
      stats.set("cum", st.tot ? f((100 * st.hit) / st.tot, 1) + "% de " + st.tot.toLocaleString("es-CL") : "—");
      stats.set("E", f(z * se, 1));
      stats.set("z", f(z, 3));
      n.innerHTML = `El “${Math.round(+st.lvl * 100)}%” no es la probabilidad de que μ esté en <em>un</em> intervalo ya calculado: ` +
        `es la proporción de intervalos que, construidos así una y otra vez, contienen a μ. ` +
        `Sube la confianza y verás intervalos más anchos (menos precisión); sube n y se angostan.`;
    }
    gen100();
  };

  /* --- Calculadora de IC y tamaño muestral --------------------------------- */
  WIDGETS["ic-calc"] = function (root) {
    header(root, "Calculadora de intervalos de confianza",
      "Viene cargada con los ejemplos de la clase. Cambia los números y observa el intervalo en la recta.");
    const MODES = {
      media: {
        label: "Media (σ conocida)",
        fields: [["xb", "x̄", 200], ["sigma", "σ", 60], ["n", "n", 36], ["ref", "Valor de referencia", ""]],
        calc: (v) => ({ est: v.xb, se: v.sigma / Math.sqrt(v.n) }),
        dec: 1,
        size: { E: 10, label: "E deseado", fn: (v, z, E) => (z * v.sigma / E) ** 2 },
      },
      prop: {
        label: "Proporción",
        fields: [["x", "Éxitos en la muestra", 19], ["n", "n", 200], ["ref", "Valor de referencia (p₀)", 0.05]],
        calc: (v) => {
          const p = v.x / v.n;
          return { est: p, se: Math.sqrt((p * (1 - p)) / v.n) };
        },
        dec: 4,
        size: { E: 0.025, pstar: 0.8667, label: "E deseado", fn: (v, z, E, ps) => (z * z * ps * (1 - ps)) / (E * E) },
      },
      dif: {
        label: "Diferencia de medias",
        fields: [["xb", "x̄ (grupo 1)", 800000], ["yb", "ȳ (grupo 2)", 680000], ["sx", "σx", 60000], ["sy", "σy", 50000],
          ["nx", "nx", 144], ["ny", "ny", 121], ["ref", "Valor de referencia", 0]],
        calc: (v) => ({ est: v.xb - v.yb, se: Math.sqrt(v.sx ** 2 / v.nx + v.sy ** 2 / v.ny) }),
        dec: 0,
      },
    };
    const st = { mode: "media", lvl: "0.95", vals: {}, E: null, pstar: null };

    const top = controls(root);
    select(top, { label: "Tipo de intervalo", value: st.mode, options: Object.entries(MODES).map(([k, m]) => [k, m.label]) },
      (v) => { st.mode = v; build(); });
    select(top, {
      label: "Nivel de confianza",
      value: st.lvl,
      options: [["0.80", "80%"], ["0.90", "90%"], ["0.95", "95%"], ["0.98", "98%"], ["0.99", "99%"]],
    }, (v) => { st.lvl = v; render(); });
    const fieldsWrap = h("div", { class: "econ-controls" });
    root.append(fieldsWrap);
    const wrap = h("div");
    root.append(wrap);
    const p = plot(wrap, 600, 110, { l: 14, t: 30, b: 34 });
    const stats = statsRow(root, [
      { k: "est", label: "Estimación puntual" },
      { k: "E", label: "Margen de error E" },
      { k: "ic", label: "Intervalo", cls: "is-gold" },
      { k: "ref", label: "¿Contiene la referencia?", cls: "is-red" },
    ]);
    const sizeWrap = h("div");
    root.append(sizeWrap);

    const fmt = (v) => (MODES[st.mode].dec === 0 ? fBig(v) : f(v, MODES[st.mode].dec));

    function build() {
      const M = MODES[st.mode];
      fieldsWrap.innerHTML = "";
      st.vals = {};
      M.fields.forEach(([k, label, def]) => {
        st.vals[k] = def === "" ? NaN : def;
        numberInput(fieldsWrap, { label, value: def }, (v) => { st.vals[k] = v === "" ? NaN : +v; render(); });
      });
      sizeWrap.innerHTML = "";
      if (M.size) {
        st.E = M.size.E;
        st.pstar = M.size.pstar;
        const sc = h("div", { class: "econ-controls" });
        sizeWrap.append(h("div", { class: "econ-widget-sub", style: "margin-top:.9rem;font-weight:700" }, "¿Qué tamaño de muestra necesito?"), sc);
        numberInput(sc, { label: M.size.label, value: st.E }, (v) => { st.E = +v; render(); });
        if (st.mode === "prop") numberInput(sc, { label: "p* (estimación previa)", value: st.pstar }, (v) => { st.pstar = +v; render(); });
        sizeWrap.append(h("div", { class: "econ-note", "data-size": "1" }));
      }
      render();
    }

    function render() {
      const M = MODES[st.mode];
      const z = Z[st.lvl];
      const { est, se } = M.calc(st.vals);
      const E = z * se;
      const lo = est - E, hi = est + E;
      const ref = st.vals.ref;
      const ok = Number.isFinite(est) && Number.isFinite(E) && E > 0;
      stats.set("est", ok ? fmt(est) : "—");
      stats.set("E", ok ? fmt(E) : "—");
      stats.set("ic", ok ? `(${fmt(lo)} ; ${fmt(hi)})` : "—");
      stats.set("ref", Number.isFinite(ref) && ok ? (ref >= lo && ref <= hi ? "Sí" : "No") : "—");

      p.clear();
      if (ok) {
        let a = lo - (hi - lo) * 0.6, b = hi + (hi - lo) * 0.6;
        if (Number.isFinite(ref)) { a = Math.min(a, ref - (hi - lo) * 0.2); b = Math.max(b, ref + (hi - lo) * 0.2); }
        p.domain([a, b], [0, 1]);
        p.axes({ noY: true, nx: 6 });
        const y = p.y(0.35);
        el("line", { x1: p.x(lo), x2: p.x(hi), y1: y, y2: y, class: "ci-hit", style: "stroke-width:6px", "stroke-linecap": "round" }, p.svg);
        el("circle", { cx: p.x(est), cy: y, r: 6, class: "pt-alt", stroke: "currentColor" }, p.svg);
        text(p.svg, p.x(lo), y - 12, fmt(lo), { "text-anchor": "middle", class: "muted" });
        text(p.svg, p.x(hi), y - 12, fmt(hi), { "text-anchor": "middle", class: "muted" });
        if (Number.isFinite(ref)) {
          el("line", { x1: p.x(ref), x2: p.x(ref), y1: p.m.t - 18, y2: p.h - p.m.b, class: "line line-dash" }, p.svg);
          text(p.svg, p.x(ref) + 5, p.m.t - 8, "referencia = " + fmt(ref), {});
        }
      }
      const sn = sizeWrap.querySelector("[data-size]");
      if (sn && M.size) {
        const nn = M.size.fn(st.vals, z, st.E, st.pstar);
        sn.innerHTML = Number.isFinite(nn) && nn > 0
          ? `n = ${f(nn, 2)} ⇒ se necesitan <strong>${Math.ceil(nn - 1e-9).toLocaleString("es-CL")}</strong> observaciones (siempre se redondea hacia arriba).`
          : "Ingresa un error deseado E mayor que cero.";
      }
    }
    build();
  };

  /* ========================================================================
     CLASE 2 · Regresión lineal simple
     ======================================================================== */

  /* Muestra ilustrativa de salario por hora (US$) vs años de educación,
     calibrada con la estimación de la clase (pendiente ≈ 0.54). */
  function wageData(seed, n) {
    const r = rng(seed);
    const x = [], y = [];
    for (let i = 0; i < n; i++) {
      const e = 8 + Math.floor(r() * 11);
      x.push(e);
      y.push(Math.max(0.8, -0.9 + 0.54 * e + 2.1 * gauss(r)));
    }
    return { x, y };
  }

  /* --- Encuentra la recta MCO --------------------------------------------- */
  WIDGETS.mco = function (root) {
    header(root, "Simulador: encuentra la recta de mínimos cuadrados",
      "Mueve los deslizadores para ajustar tu recta ŷ = b₀ + b₁·educ. Cada segmento rojo es un residuo ûᵢ = yᵢ − ŷᵢ. " +
      "MCO elige la recta que minimiza la suma de los residuos al cuadrado (SSR). También puedes arrastrar los puntos.");
    let d = wageData(11, 30);
    const st = { b0: 2, b1: 0.25, showOLS: false, squares: false, drag: -1 };

    const c = controls(root);
    const s0 = slider(c, { label: "Intercepto b₀", min: -6, max: 8, step: 0.05, value: st.b0, fmt: (v) => f(v, 2) }, (v) => { st.b0 = v; render(); });
    const s1 = slider(c, { label: "Pendiente b₁", min: -0.6, max: 1.6, step: 0.01, value: st.b1, fmt: (v) => f(v, 2) }, (v) => { st.b1 = v; render(); });
    const b = buttons(root);
    toggle(b, "Mostrar recta MCO", false, (v) => { st.showOLS = v; render(); });
    toggle(b, "Ver residuos al cuadrado", false, (v) => { st.squares = v; render(); });
    btn(b, "Llevar mi recta a MCO", () => {
      const o = ols(d.x, d.y);
      st.b0 = o.b0; st.b1 = o.b1;
      s0.set(o.b0); s1.set(o.b1);
      render();
    }, "econ-btn-gold");
    btn(b, "Nueva muestra", () => { d = wageData(newSeed(), 30); render(); }, "econ-btn-ghost");

    const wrap = h("div");
    root.append(wrap);
    const p = plot(wrap, 600, 340, { l: 50 });
    p.domain([6, 20], [0, 15]);
    const stats = statsRow(root, [
      { k: "ssr", label: "SSR de tu recta", cls: "is-red" },
      { k: "min", label: "SSR mínima (MCO)", cls: "is-gold" },
      { k: "b0", label: "β̂₀ MCO" },
      { k: "b1", label: "β̂₁ MCO" },
      { k: "su", label: "Σ ûᵢ (MCO)" },
      { k: "sxu", label: "Σ xᵢûᵢ (MCO)" },
    ]);
    const n = note(root);

    p.svg.addEventListener("pointerdown", (e) => {
      const q = p.local(e);
      let best = -1, bd = 16;
      d.x.forEach((xv, i) => {
        const dist = Math.hypot(p.x(xv) - q.x, p.y(d.y[i]) - q.y);
        if (dist < bd) { bd = dist; best = i; }
      });
      if (best >= 0) {
        st.drag = best;
        p.svg.setPointerCapture(e.pointerId);
        e.preventDefault();
      }
    });
    p.svg.addEventListener("pointermove", (e) => {
      if (st.drag < 0) return;
      const q = p.local(e);
      d.x[st.drag] = Math.min(19.8, Math.max(6.2, p.ix(q.x)));
      d.y[st.drag] = Math.min(14.8, Math.max(0.2, p.iy(q.y)));
      render();
    });
    const endDrag = () => { st.drag = -1; };
    p.svg.addEventListener("pointerup", endDrag);
    p.svg.addEventListener("pointercancel", endDrag);

    function render() {
      const o = ols(d.x, d.y);
      const userHat = d.x.map((v) => st.b0 + st.b1 * v);
      const ssrUser = sum(d.y.map((v, i) => (v - userHat[i]) ** 2));
      p.clear();
      p.axes({ xlabel: "Años de educación", ylabel: "Salario por hora (US$)" });
      const g = p.clipped();
      d.x.forEach((xv, i) => {
        const y1 = p.y(d.y[i]), y2 = p.y(userHat[i]);
        if (st.squares) {
          const s = Math.abs(y1 - y2);
          el("rect", { x: p.x(xv), y: Math.min(y1, y2), width: s, height: s, class: "sq" }, g);
        }
        el("line", { x1: p.x(xv), x2: p.x(xv), y1, y2, class: "resid" }, g);
      });
      p.lineFn(g, (x) => st.b0 + st.b1 * x, "line-navy");
      if (st.showOLS) {
        p.lineFn(g, (x) => o.b0 + o.b1 * x, "line line-dash");
        el("circle", { cx: p.x(o.mx), cy: p.y(o.my), r: 6, class: "pt-red", stroke: "currentColor" }, g);
        text(g, p.x(o.mx) + 8, p.y(o.my) - 8, "(x̄, ȳ)", { "font-weight": "700" });
      }
      d.x.forEach((xv, i) => el("circle", { cx: p.x(xv), cy: p.y(d.y[i]), r: st.drag === i ? 7 : 5, class: "pt drag" }, g));
      text(p.svg, p.w - p.m.r - 6, p.m.t + 14, "— tu recta", { "text-anchor": "end", style: "fill:var(--usm-navy)", "font-weight": "700" });
      if (st.showOLS) text(p.svg, p.w - p.m.r - 6, p.m.t + 30, "- - recta MCO", { "text-anchor": "end", style: "fill:var(--usm-red)", "font-weight": "700" });

      stats.set("ssr", f(ssrUser, 1));
      stats.set("min", f(o.SSR, 1));
      stats.set("b0", st.showOLS ? f(o.b0, 3) : "?");
      stats.set("b1", st.showOLS ? f(o.b1, 3) : "?");
      stats.set("su", st.showOLS ? f(sum(o.resid), 6) : "?");
      stats.set("sxu", st.showOLS ? f(sum(o.resid.map((u, i) => u * d.x[i])), 6) : "?");
      const gap = (ssrUser / o.SSR - 1) * 100;
      n.innerHTML = gap < 0.5
        ? "🎯 <strong>¡Encontraste la recta MCO!</strong> Ninguna otra recta logra una suma de residuos al cuadrado menor. Activa “Mostrar recta MCO” para comprobar las propiedades: Σûᵢ = 0 y Σxᵢûᵢ = 0."
        : `Tu SSR es <strong>${f(gap, 1)}% mayor</strong> que el mínimo posible. Intenta bajarla moviendo b₀ y b₁. ` +
          "Prueba también arrastrar un punto lejos de la nube: ¿cuánto cambia la recta MCO?";
    }
    render();
  };

  /* --- Descomposición SST = SSE + SSR ------------------------------------- */
  WIDGETS.varianza = function (root) {
    header(root, "Simulador: SST = SSE + SSR y el R²",
      "Cambia la pendiente verdadera y el tamaño del error u. Haz clic sobre un punto para ver cómo su desvío respecto de ȳ " +
      "se divide en una parte explicada por la regresión (ŷᵢ − ȳ) y un residuo (yᵢ − ŷᵢ).");
    const N = 40;
    let seed = 5;
    let base;
    const st = { b1: 0.54, su: 2, sel: 0 };
    function makeBase() {
      const r = rng(seed);
      base = Array.from({ length: N }, () => ({ x: 8 + 10 * r(), z: gauss(r) }));
    }
    makeBase();

    const c = controls(root);
    slider(c, { label: "Pendiente verdadera β₁", min: 0, max: 1.2, step: 0.01, value: st.b1, fmt: (v) => f(v, 2) }, (v) => { st.b1 = v; render(); });
    slider(c, { label: "Desv. est. del error σᵤ", min: 0.2, max: 6, step: 0.1, value: st.su, fmt: (v) => f(v, 1) }, (v) => { st.su = v; render(); });
    const b = buttons(root);
    btn(b, "Nueva muestra", () => { seed = newSeed(); makeBase(); render(); }, "econ-btn-ghost");

    const row = h("div", { class: "econ-plot-row is-2-1" });
    root.append(row);
    const L = h("div"), R = h("div");
    row.append(L, R);
    const p = plot(L, 420, 300, { l: 40 });
    const q = plot(R, 220, 300, { l: 14, r: 10 });
    const stats = statsRow(root, [
      { k: "sst", label: "SST = Σ(yᵢ − ȳ)²" },
      { k: "sse", label: "SSE = Σ(ŷᵢ − ȳ)²" },
      { k: "ssr", label: "SSR = Σûᵢ²", cls: "is-red" },
      { k: "r2", label: "R² = SSE/SST", cls: "is-gold" },
    ]);
    const n = note(root);

    p.svg.addEventListener("click", (e) => {
      const loc = p.local(e);
      let best = -1, bd = 1e9;
      base.forEach((u, i) => {
        const yv = 1 + st.b1 * u.x + st.su * u.z;
        const dist = Math.hypot(p.x(u.x) - loc.x, p.y(yv) - loc.y);
        if (dist < bd) { bd = dist; best = i; }
      });
      if (best >= 0 && bd < 30) { st.sel = best; render(); }
    });

    function render() {
      const x = base.map((u) => u.x);
      const y = base.map((u) => 1 + st.b1 * u.x + st.su * u.z);
      const o = ols(x, y);
      p.clear();
      const lo = Math.min(...y), hi = Math.max(...y), pad = Math.max(1.5, (hi - lo) * 0.12);
      p.domain([7, 19], [lo - pad, hi + pad]);
      p.axes({ xlabel: "x", ylabel: "y" });
      const g = p.clipped();
      p.hline(g, o.my, "line-gold line-dash");
      p.lineFn(g, (v) => o.b0 + o.b1 * v, "line");
      x.forEach((xv, i) => el("circle", { cx: p.x(xv), cy: p.y(y[i]), r: i === st.sel ? 7 : 4.5, class: i === st.sel ? "pt-alt" : "pt", stroke: i === st.sel ? "currentColor" : "none" }, g));
      const i = st.sel;
      const xs = p.x(x[i]) + 9;
      el("line", { x1: xs, x2: xs, y1: p.y(o.my), y2: p.y(o.yhat[i]), class: "line-navy", style: "stroke-width:4px" }, g);
      el("line", { x1: xs, x2: xs, y1: p.y(o.yhat[i]), y2: p.y(y[i]), class: "line", style: "stroke-width:4px" }, g);
      text(g, p.m.l + 6, p.y(o.my) - 6, "ȳ", { "font-weight": "700" });

      const top = o.SST * 1.08;
      q.clear();
      q.domain([0, 2], [0, top]);
      q.axes({ noY: true, noX: true });
      const bw = q.x(0.7) - q.x(0);
      el("rect", { x: q.x(0.15), width: bw, y: q.y(o.SST), height: q.y(0) - q.y(o.SST), class: "bar" }, q.svg);
      el("rect", { x: q.x(1.15), width: bw, y: q.y(o.SSE), height: q.y(0) - q.y(o.SSE), class: "bar-navy" }, q.svg);
      el("rect", { x: q.x(1.15), width: bw, y: q.y(o.SST), height: q.y(o.SSE) - q.y(o.SST), class: "bar-red" }, q.svg);
      text(q.svg, q.x(0.5), q.h - q.m.b + 16, "SST", { "text-anchor": "middle", "font-weight": "700" });
      text(q.svg, q.x(1.5), q.h - q.m.b + 16, "SSE + SSR", { "text-anchor": "middle", "font-weight": "700" });
      if (q.y(0) - q.y(o.SSE) > 16) text(q.svg, q.x(1.5), (q.y(0) + q.y(o.SSE)) / 2 + 4, "SSE", { "text-anchor": "middle", style: "fill:#fff", "font-weight": "700" });
      if (q.y(o.SSE) - q.y(o.SST) > 16) text(q.svg, q.x(1.5), (q.y(o.SSE) + q.y(o.SST)) / 2 + 4, "SSR", { "text-anchor": "middle", style: "fill:#fff", "font-weight": "700" });
      text(q.svg, q.w / 2, q.m.t + 4, "R² = " + f(o.R2, 3), { "text-anchor": "middle", "font-weight": "700" });

      stats.set("sst", f(o.SST, 1));
      stats.set("sse", f(o.SSE, 1));
      stats.set("ssr", f(o.SSR, 1));
      stats.set("r2", f(o.R2, 3));
      n.innerHTML = `Punto seleccionado: yᵢ − ȳ = <strong>${f(y[i] - o.my, 2)}</strong> = ` +
        `<span style="color:var(--usm-blue)">(ŷᵢ − ȳ) = ${f(o.yhat[i] - o.my, 2)}</span> + ` +
        `<span style="color:var(--usm-red)">ûᵢ = ${f(o.resid[i], 2)}</span>. ` +
        "Con más ruido (σᵤ grande) crece SSR y baja el R²; con β₁ = 0, x no explica nada y R² ≈ 0.";
    }
    render();
  };

  /* --- Cambio de unidades -------------------------------------------------- */
  WIDGETS.unidades = function (root) {
    header(root, "Cambio de unidades de medición",
      "Mismos datos de salario y educación, expresados en distintas unidades. ¿Qué cambia y qué se mantiene?");
    const d = wageData(11, 30);
    const st = { cy: 1, cx: 1 };
    const c = controls(root);
    select(c, { label: "Salario (y) medido en", value: "1", options: [["1", "US$ por hora"], ["100", "centavos por hora (×100)"], ["2080", "US$ por año (×2.080 horas)"]] },
      (v) => { st.cy = +v; render(); });
    select(c, { label: "Educación (x) medida en", value: "1", options: [["1", "años"], ["12", "meses (×12)"]] },
      (v) => { st.cx = +v; render(); });
    const stats = statsRow(root, [
      { k: "b0", label: "β̂₀" },
      { k: "b1", label: "β̂₁", cls: "is-gold" },
      { k: "r2", label: "R²", cls: "is-red" },
    ]);
    const n = note(root);
    function render() {
      const o = ols(d.x.map((v) => v * st.cx), d.y.map((v) => v * st.cy));
      const dec = st.cy > 1 ? 1 : 3;
      stats.set("b0", f(o.b0, dec));
      stats.set("b1", f(o.b1, st.cx > 1 && st.cy === 1 ? 4 : dec));
      stats.set("r2", f(o.R2, 4));
      n.innerHTML = `Multiplicar y por ${st.cy.toLocaleString("es-CL")} multiplica <strong>ambos</strong> coeficientes por ${st.cy.toLocaleString("es-CL")}; ` +
        `multiplicar x por ${st.cx} divide la <strong>pendiente</strong> por ${st.cx} y deja el intercepto igual. ` +
        "El R² no cambia: la bondad de ajuste no depende de las unidades.";
    }
    render();
  };

  /* --- Insesgamiento y varianza de β̂₁ ------------------------------------- */
  WIDGETS.insesgado = function (root) {
    header(root, "Simulador: insesgamiento y varianza de β̂₁",
      "Modelo poblacional: salario = −0.9 + 0.54·educ + u. Cada muestra aleatoria entrega un β̂₁ distinto. " +
      "Bajo los supuestos RLS.1–RLS.4, el promedio de los β̂₁ coincide con β₁ = 0.54.");
    const B0 = -0.9, B1 = 0.54;
    const st = { n: 30, su: 3, sx: 2.5, est: [], last: null, r: rng(newSeed()) };
    const c = controls(root);
    slider(c, { label: "Tamaño muestral n", min: 10, max: 300, step: 1, value: st.n }, (v) => { st.n = v; reset(); });
    slider(c, { label: "Desv. est. del error σᵤ", min: 0.5, max: 6, step: 0.1, value: st.su, fmt: (v) => f(v, 1) }, (v) => { st.su = v; reset(); });
    slider(c, { label: "Dispersión de educ (sₓ)", min: 0.5, max: 4, step: 0.1, value: st.sx, fmt: (v) => f(v, 1) }, (v) => { st.sx = v; reset(); });
    const b = buttons(root);
    btn(b, "+1 muestra", () => run(1), "econ-btn-gold");
    btn(b, "+500 muestras", () => run(500));
    btn(b, "Reiniciar", reset, "econ-btn-ghost");

    const row = h("div", { class: "econ-plot-row" });
    root.append(row);
    const L = h("div"), R = h("div");
    row.append(L, R);
    const pL = plot(L, 380, 260, { l: 36 });
    const pR = plot(R, 380, 260, { l: 14 });
    const stats = statsRow(root, [
      { k: "b1", label: "β₁ verdadero", cls: "is-gold" },
      { k: "m", label: "Promedio de β̂₁" },
      { k: "s", label: "Desv. est. de β̂₁" },
      { k: "t", label: "σ/√SSTₓ aprox." },
      { k: "N", label: "N.º de muestras" },
    ]);
    const n = note(root);
    const sdTheory = () => st.su / (st.sx * Math.sqrt(st.n - 1));

    function run(m) {
      for (let k = 0; k < m; k++) {
        const x = [], y = [];
        for (let i = 0; i < st.n; i++) {
          const e = 12 + st.sx * gauss(st.r);
          x.push(e);
          y.push(B0 + B1 * e + st.su * gauss(st.r));
        }
        const o = ols(x, y);
        st.est.push(o.b1);
        st.last = { x, y, o };
      }
      render();
    }
    function reset() { st.est = []; st.last = null; render(); }

    function render() {
      pL.clear();
      pL.domain([0, 24], [-12, 26]);
      pL.axes({ xlabel: "educ", title: "Última muestra" });
      const g = pL.clipped();
      pL.lineFn(g, (v) => B0 + B1 * v, "line-navy line-dash");
      if (st.last) {
        const L2 = st.last;
        L2.x.forEach((xv, i) => el("circle", { cx: pL.x(xv), cy: pL.y(L2.y[i]), r: 2.6, class: "pt" }, g));
        pL.lineFn(g, (v) => L2.o.b0 + L2.o.b1 * v, "line");
      }

      const s = sdTheory();
      const dom = [B1 - 4.5 * s, B1 + 4.5 * s];
      const H = histogram(st.est, dom[0], dom[1], 60);
      const N = st.est.length;
      const peak = normPdf(B1, B1, s) * Math.max(N, 1) * H.w;
      pR.clear();
      pR.domain(dom, [0, Math.max(N ? Math.max(...H.counts) : 0, N ? peak : 1) * 1.15]);
      pR.axes({ noY: true, xlabel: "β̂₁", title: "Distribución de β̂₁", nx: 5, xfmt: (v) => f(v, 2) });
      const gR = pR.clipped();
      if (N) {
        pR.bars(gR, H, "bar-gold");
        if (N >= 30) pR.curve(gR, (v) => normPdf(v, B1, s) * N * H.w, "line");
      }
      pR.vline(gR, B1, "mu", "β₁");
      stats.set("b1", f(B1, 3));
      stats.set("m", N ? f(mean(st.est), 4) : "—");
      stats.set("s", N > 1 ? f(sd(st.est), 4) : "—");
      stats.set("t", f(s, 4));
      stats.set("N", N.toLocaleString("es-CL"));
      n.innerHTML = "La línea punteada azul es la FRP (desconocida en la práctica); la roja, la FRM de la última muestra. " +
        "Var(β̂₁) = σ²/SSTₓ: <strong>más n</strong>, <strong>menos ruido σᵤ</strong> y <strong>más variabilidad en x</strong> ⇒ β̂₁ más preciso. " +
        "Ninguno de los tres mueve el centro de la distribución: el estimador sigue siendo insesgado.";
    }
    render();
  };

  /* ========================================================================
     CLASE 3 · Causalidad, sesgo de selección y variable omitida
     ======================================================================== */

  /* --- Outcomes potenciales ------------------------------------------------ */
  WIDGETS.po = function (root) {
    header(root, "Outcomes potenciales: lo que vemos y lo que no",
      "Cada persona tiene dos outcomes potenciales (salario con y sin universidad), pero solo observamos el que corresponde " +
      "a su decisión. Activa el “modo Dios” para ver los contrafactuales y calcular ATE, ATT y el sesgo de selección.");
    const P = [
      ["Sofía", 70, 100], ["Paula", 40, 55], ["Ezequiel", 60, 80], ["Juan", 20, 35],
      ["Carolina", 45, 60], ["Diego", 30, 50], ["Valentina", 55, 75], ["Matías", 25, 40],
    ];
    const SELF = [1, 0, 1, 0, 1, 0, 1, 0];
    const st = { T: SELF.slice(), god: false, avg: null, r: rng(newSeed()) };

    const b = buttons(root);
    toggle(b, "Modo Dios: revelar contrafactuales", false, (v) => { st.god = v; render(); });
    btn(b, "Autoselección (datos originales)", () => { st.T = SELF.slice(); st.avg = null; render(); }, "econ-btn-ghost");
    btn(b, "Sortear el tratamiento", () => { st.T = randomT(); st.avg = null; render(); });
    btn(b, "Sortear 2.000 veces", () => {
      const diffs = [];
      for (let k = 0; k < 2000; k++) diffs.push(naive(randomT()));
      st.avg = mean(diffs);
      render();
    }, "econ-btn-gold");

    const tbl = h("table", { class: "econ-po-table" });
    root.append(h("div", { style: "overflow-x:auto" }, tbl));
    const stats = statsRow(root, [
      { k: "nv", label: "Diferencia observada", cls: "is-gold" },
      { k: "att", label: "ATT" },
      { k: "ate", label: "ATE" },
      { k: "sb", label: "Sesgo de selección", cls: "is-red" },
    ]);
    const n = note(root);

    function randomT() {
      const idx = shuffle([0, 1, 2, 3, 4, 5, 6, 7], st.r).slice(0, 4);
      return P.map((_, i) => (idx.includes(i) ? 1 : 0));
    }
    function naive(T) {
      const t = P.filter((_, i) => T[i]).map((p) => p[2]);
      const c = P.filter((_, i) => !T[i]).map((p) => p[1]);
      return mean(t) - mean(c);
    }

    function render() {
      tbl.innerHTML = "";
      tbl.append(h("tr", {}, ["Persona", "Tᵢ", "Yᵢ observado", "Yᵢᴺᵀ", "Yᵢᵀ", "Yᵢᵀ − Yᵢᴺᵀ"].map((t) => h("th", {}, t))));
      P.forEach(([name, ynt, yt], i) => {
        const T = st.T[i];
        const cell = (v, observed) => observed
          ? h("td", {}, String(v))
          : st.god ? h("td", { class: "revealed-po" }, String(v)) : h("td", { class: "hidden-po" }, "??");
        tbl.append(h("tr", {},
          h("td", {}, name),
          h("td", {}, String(T)),
          h("td", { style: "font-weight:700" }, String(T ? yt : ynt)),
          cell(ynt, !T),
          cell(yt, !!T),
          st.god ? h("td", { class: "revealed-po" }, String(yt - ynt)) : h("td", { class: "hidden-po" }, "??")));
      });
      const nv = naive(st.T);
      const tr = P.filter((_, i) => st.T[i]);
      const co = P.filter((_, i) => !st.T[i]);
      const att = mean(tr.map((p) => p[2] - p[1]));
      const ate = mean(P.map((p) => p[2] - p[1]));
      const sb = mean(tr.map((p) => p[1])) - mean(co.map((p) => p[1]));
      stats.set("nv", f(nv, 2));
      stats.set("att", st.god ? f(att, 2) : "?");
      stats.set("ate", st.god ? f(ate, 2) : "?");
      stats.set("sb", st.god ? f(sb, 2) : "?");
      let html = st.god
        ? `<strong>${f(nv, 2)}</strong> (diferencia observada) = <strong>${f(att, 2)}</strong> (ATT) + <strong>${f(sb, 2)}</strong> (sesgo de selección).`
        : "Con los datos observados solo podemos calcular la diferencia de promedios entre tratados y no tratados. ¿Es ese el efecto causal?";
      if (st.avg !== null) {
        html += `<br>Promedio de la diferencia observada en <strong>2.000 sorteos</strong>: <strong>${f(st.avg, 2)}</strong> ≈ ATE = ${f(ate, 2)}. ` +
          "Al aleatorizar, el sesgo de selección es cero <em>en promedio</em>.";
      }
      n.innerHTML = html;
    }
    render();
  };

  /* --- Autoselección vs aleatorización ------------------------------------- */
  WIDGETS.seleccion = function (root) {
    header(root, "Simulador: autoselección vs. aleatorización",
      "Población de 4.000 personas. La habilidad a (no observada) aumenta el salario aun sin universidad y, con autoselección, " +
      "también la probabilidad de ir a la universidad. Compara la diferencia observada con el efecto causal.");
    const N = 4000;
    let seed = 99;
    let base;
    const st = { mode: "self", tau: 10, gamma: 1.5 };
    function makeBase() {
      const r = rng(seed);
      base = Array.from({ length: N }, () => ({ a: gauss(r), e: gauss(r), u: r() }));
    }
    makeBase();

    const c = controls(root);
    select(c, { label: "Asignación del tratamiento", value: st.mode, options: [["self", "Autoselección (observacional)"], ["rct", "Aleatorización (experimento)"]] },
      (v) => { st.mode = v; render(); });
    slider(c, { label: "Efecto promedio de la universidad τ", min: 0, max: 30, step: 1, value: st.tau }, (v) => { st.tau = v; render(); });
    const sg = slider(c, { label: "Fuerza de la autoselección γ", min: 0, max: 3, step: 0.1, value: st.gamma, fmt: (v) => f(v, 1) }, (v) => { st.gamma = v; render(); });
    const b = buttons(root);
    btn(b, "Nueva población", () => { seed = newSeed(); makeBase(); render(); }, "econ-btn-ghost");

    const row = h("div", { class: "econ-plot-row is-3-2" });
    root.append(row);
    const L = h("div"), R = h("div");
    row.append(L, R);
    const pL = plot(L, 420, 260, { l: 14 });
    const pR = plot(R, 280, 260, { l: 36, b: 52 });
    const stats = statsRow(root, [
      { k: "nv", label: "Diferencia observada", cls: "is-gold" },
      { k: "att", label: "ATT" },
      { k: "ate", label: "ATE" },
      { k: "sb", label: "Sesgo de selección", cls: "is-red" },
      { k: "pt", label: "% tratados" },
    ]);
    const n = note(root);

    function render() {
      sg.wrap.style.opacity = st.mode === "rct" ? 0.4 : 1;
      const rows = base.map((p) => {
        const ynt = 100 + 15 * p.a + 8 * p.e;
        const yt = ynt + st.tau + 3 * p.a;
        const prob = st.mode === "rct" ? 0.5 : 1 / (1 + Math.exp(-st.gamma * 1.5 * p.a));
        const T = p.u < prob ? 1 : 0;
        return { ynt, yt, T, y: T ? yt : ynt };
      });
      const tr = rows.filter((r) => r.T);
      const co = rows.filter((r) => !r.T);
      const nv = mean(tr.map((r) => r.y)) - mean(co.map((r) => r.y));
      const att = mean(tr.map((r) => r.yt - r.ynt));
      const ate = mean(rows.map((r) => r.yt - r.ynt));
      const sb = mean(tr.map((r) => r.ynt)) - mean(co.map((r) => r.ynt));

      const dom = [30, 190];
      const H1 = histogram(tr.map((r) => r.y), dom[0], dom[1], 40);
      const H0 = histogram(co.map((r) => r.y), dom[0], dom[1], 40);
      pL.clear();
      pL.domain(dom, [0, Math.max(...H1.counts, ...H0.counts) * 1.2]);
      pL.axes({ noY: true, xlabel: "Salario observado (índice)" });
      const g = pL.clipped();
      pL.bars(g, H0, "bar");
      pL.bars(g, H1, "bar-gold");
      pL.vline(g, mean(co.map((r) => r.y)), "line-navy");
      pL.vline(g, mean(tr.map((r) => r.y)), "line");
      text(pL.svg, pL.m.l + 6, pL.m.t + 12, "■ sin universidad (T=0)", { style: "fill:var(--usm-blue)", "font-weight": "700" });
      text(pL.svg, pL.m.l + 6, pL.m.t + 28, "■ con universidad (T=1)", { style: "fill:var(--usm-gold)", "font-weight": "700" });

      const vals = [nv, att, att + sb, ate];
      const lo = Math.min(0, ...vals, sb) * 1.15, hi = Math.max(...vals, 1) * 1.15;
      pR.clear();
      pR.domain([0, 3], [lo, hi]);
      pR.axes({ noX: true, ny: 4 });
      const bw = pR.x(0.7) - pR.x(0);
      const bar = (x0, a, bb, cls) => el("rect", { x: pR.x(x0), width: bw, y: pR.y(Math.max(a, bb)), height: Math.abs(pR.y(a) - pR.y(bb)), class: cls }, pR.svg);
      bar(0.15, 0, nv, "bar-gold");
      bar(1.15, 0, att, "bar");
      bar(1.15, att, att + sb, "bar-red");
      bar(2.15, 0, ate, "bar-navy");
      [["Dif. obs.", 0.5], ["ATT + sesgo", 1.5], ["ATE", 2.5]].forEach(([t, x]) =>
        text(pR.svg, pR.x(x), pR.h - pR.m.b + 16, t, { "text-anchor": "middle", "font-weight": "700" }));
      el("line", { x1: pR.m.l, x2: pR.w - pR.m.r, y1: pR.y(0), y2: pR.y(0), class: "ax" }, pR.svg);

      stats.set("nv", f(nv, 2));
      stats.set("att", f(att, 2));
      stats.set("ate", f(ate, 2));
      stats.set("sb", f(sb, 2));
      stats.set("pt", f((100 * tr.length) / N, 1) + "%");
      n.innerHTML = st.mode === "rct"
        ? "Con aleatorización, tratados y controles son iguales en promedio (también en habilidad): el sesgo de selección ≈ 0 y la diferencia observada ≈ ATE = ATT."
        : `Los más hábiles se autoseleccionan en la universidad, así que su salario <em>sin</em> universidad ya era mayor: ` +
          `la diferencia observada (${f(nv, 1)}) sobreestima el efecto causal (ATT = ${f(att, 1)}). Pon γ = 0 o cambia a aleatorización.`;
    }
    render();
  };

  /* --- Sesgo por variable omitida ------------------------------------------ */
  WIDGETS.ovb = function (root) {
    header(root, "Simulador: sesgo por variable omitida",
      "Modelo verdadero: y = 2 + β₁·x₁ + β₂·x₂ + u, con x₂ = δ₁·x₁ + v. Si omitimos x₂ y regresamos y solo en x₁, " +
      "la regresión corta estima β̃₁ = β₁ + β₂·δ₁.");
    const MAXN = 600;
    let seed = 3;
    let base;
    const st = { b1: 0.5, b2: 0.8, d1: 0.6, n: MAXN };
    function makeBase() {
      const r = rng(seed);
      base = Array.from({ length: MAXN }, () => ({ x1: gauss(r), v: gauss(r), u: gauss(r) }));
    }
    makeBase();

    const PRESETS = [
      ["Educación y habilidad", 0.5, 0.8, 0.6],
      ["Fumar y edad", 0.94, 0.98, -2.82],
      ["Sin sesgo: δ₁ = 0", 0.5, 0.8, 0],
      ["Sin sesgo: β₂ = 0", 0.5, 0, 0.6],
    ];
    const b = buttons(root);
    PRESETS.forEach(([label, b1, b2, d1]) => btn(b, label, () => {
      st.b1 = b1; st.b2 = b2; st.d1 = d1;
      s1.set(b1); s2.set(b2); s3.set(d1);
      render();
    }, "econ-btn-ghost"));
    const c = controls(root);
    const s1 = slider(c, { label: "β₁ (efecto causal de x₁)", min: -2, max: 2, step: 0.01, value: st.b1, fmt: (v) => f(v, 2) }, (v) => { st.b1 = v; render(); });
    const s2 = slider(c, { label: "β₂ (efecto de x₂ en y)", min: -2, max: 2, step: 0.01, value: st.b2, fmt: (v) => f(v, 2) }, (v) => { st.b2 = v; render(); });
    const s3 = slider(c, { label: "δ₁ (relación x₁ – x₂)", min: -3, max: 3, step: 0.01, value: st.d1, fmt: (v) => f(v, 2) }, (v) => { st.d1 = v; render(); });
    const b2w = buttons(root);
    btn(b2w, "Nueva muestra", () => { seed = newSeed(); makeBase(); render(); }, "econ-btn-ghost");

    const row = h("div", { class: "econ-plot-row is-2-1" });
    root.append(row);
    const L = h("div"), R = h("div");
    row.append(L, R);
    const p = plot(L, 420, 300, { l: 40 });
    const dag = el("svg", { viewBox: "0 0 240 170", class: "econ-plot", role: "img" });
    R.append(dag);
    const signTbl = h("table", { class: "econ-po-table", style: "margin-top:.4rem" });
    R.append(signTbl);
    const stats = statsRow(root, [
      { k: "b1", label: "β₁ verdadero", cls: "is-gold" },
      { k: "bs", label: "β̃₁ regresión corta", cls: "is-red" },
      { k: "th", label: "β₁ + β₂·δ₁ (fórmula)" },
      { k: "bl", label: "β̂₁ regresión larga (con x₂)" },
      { k: "bias", label: "Sesgo β̃₁ − β₁" },
    ]);
    const n = note(root);

    function render() {
      const D = base.slice(0, st.n);
      const x1 = D.map((d) => d.x1);
      // v y u se ortogonalizan respecto de los regresores en la muestra: así la regresión corta
      // reproduce exactamente β₁ + β₂·δ₁ y la larga exactamente β₁, sin ruido de muestreo que
      // distraiga del mensaje (p. ej., que "δ₁ = 0" muestre un sesgo espurio de −0.05).
      const v = ols(x1, D.map((d) => d.v)).resid;
      const u0 = D.map((d) => d.u);
      const ux = ols(x1, u0).resid;
      const vu = ols(v, ux).b1;
      const u = ux.map((e, i) => e - vu * v[i]);
      const x2 = D.map((d, i) => st.d1 * d.x1 + v[i]);
      const y = D.map((d, i) => 2 + st.b1 * d.x1 + st.b2 * x2[i] + u[i]);
      const sh = ols(x1, y);
      const lg = ols2(x1, x2, y);
      const med = [...x2].sort((a, b2) => a - b2)[Math.floor(x2.length / 2)];
      const ys = [...y].sort((a, b2) => a - b2);
      const ylo = ys[Math.floor(ys.length * 0.01)], yhi = ys[Math.floor(ys.length * 0.99)];
      const pad = (yhi - ylo) * 0.15;
      p.clear();
      p.domain([-3.2, 3.2], [ylo - pad, yhi + pad]);
      p.axes({ xlabel: "x₁", ylabel: "y" });
      const g = p.clipped();
      const shown = Math.min(D.length, 600);
      for (let i = 0; i < shown; i++) {
        el("circle", { cx: p.x(x1[i]), cy: p.y(y[i]), r: 2.6, class: x2[i] > med ? "pt-alt" : "pt" }, g);
      }
      p.lineFn(g, (v) => sh.my + st.b1 * (v - sh.mx), "line-navy line-dash");
      p.lineFn(g, (v) => sh.b0 + sh.b1 * v, "line");
      text(p.svg, p.m.l + 6, p.m.t + 12, "— regresión corta (β̃₁)", { style: "fill:var(--usm-red)", "font-weight": "700" });
      text(p.svg, p.m.l + 6, p.m.t + 28, "- - pendiente causal β₁", { style: "fill:var(--usm-navy)", "font-weight": "700" });
      text(p.svg, p.m.l + 6, p.m.t + 44, "● x₂ alto   ", { style: "fill:var(--usm-gold)", "font-weight": "700" });
      text(p.svg, p.m.l + 66, p.m.t + 44, "● x₂ bajo", { style: "fill:var(--usm-blue)", "font-weight": "700" });

      // Diagrama causal
      while (dag.firstChild) dag.removeChild(dag.firstChild);
      const node = (x, y0, label) => {
        el("circle", { cx: x, cy: y0, r: 19, style: "fill:var(--md-default-bg-color);stroke:var(--usm-navy);stroke-width:2" }, dag);
        text(dag, x, y0 + 5, label, { "text-anchor": "middle", "font-weight": "700", style: "font-size:14px" });
      };
      const biasOn = Math.abs(st.b2) > 0.01 && Math.abs(st.d1) > 0.01;
      const col = (v, path) => (Math.abs(v) < 0.01 ? "var(--md-default-fg-color--lighter)" : path && biasOn ? "var(--usm-red)" : "var(--usm-blue)");
      const wid = (v) => 1.2 + 2.2 * Math.min(Math.abs(v), 2);
      const op = (v) => (Math.abs(v) < 0.01 ? 0.35 : 1);
      arrow(dag, 52, 40, 189, 40, col(st.b1, false), wid(st.b1), op(st.b1));
      arrow(dag, 132, 132, 194, 57, col(st.b2, true), wid(st.b2), op(st.b2));
      arrow(dag, 108, 132, 46, 57, col(st.d1, true), wid(st.d1), op(st.d1));
      text(dag, 120, 32, "β₁ = " + f(st.b1, 2), { "text-anchor": "middle" });
      text(dag, 196, 106, "β₂ = " + f(st.b2, 2), { "text-anchor": "middle" });
      text(dag, 44, 106, "δ₁ = " + f(st.d1, 2), { "text-anchor": "middle" });
      node(34, 40, "x₁");
      node(206, 40, "y");
      node(120, 145, "x₂");

      // Tabla de signos
      const sgn = (v) => (Math.abs(v) < 0.01 ? 0 : v > 0 ? 1 : -1);
      const cur = [sgn(st.d1), sgn(st.b2)];
      signTbl.innerHTML = "";
      signTbl.append(h("tr", {}, h("th", {}, ""), h("th", {}, "β₂ > 0"), h("th", {}, "β₂ < 0")));
      [[1, "δ₁ > 0"], [-1, "δ₁ < 0"]].forEach(([ds, lab]) => {
        signTbl.append(h("tr", {}, h("th", {}, lab), ...[1, -1].map((bs) => {
          const on = cur[0] === ds && cur[1] === bs;
          return h("td", {
            style: on ? "background:var(--usm-gold);color:var(--usm-navy-dark);font-weight:700" : "",
          }, ds * bs > 0 ? "Sesgo +" : "Sesgo −");
        })));
      });

      const theo = st.b1 + st.b2 * st.d1;
      stats.set("b1", f(st.b1, 3));
      stats.set("bs", f(sh.b1, 3));
      stats.set("th", f(theo, 3));
      stats.set("bl", f(lg.b1, 3));
      stats.set("bias", (sh.b1 - st.b1 >= 0 ? "+" : "") + f(sh.b1 - st.b1, 3));
      const bias = st.b2 * st.d1;
      n.innerHTML = Math.abs(bias) < 0.005
        ? "Sin sesgo: x₂ no se relaciona con x₁ (δ₁ = 0) o no afecta a y (β₂ = 0). Omitirla no contamina β̃₁ — solo cambia la precisión."
        : `β₂·δ₁ = ${f(bias, 2)} ⇒ <strong>sesgo ${bias > 0 ? "positivo" : "negativo"}</strong>: la regresión corta ` +
          `${bias > 0 ? "sobreestima" : "subestima"} el efecto causal. Al incluir x₂ como control (regresión larga) recuperamos β₁ ≈ ${f(lg.b1, 2)}.` +
          (Math.sign(sh.b1) !== Math.sign(st.b1) && Math.abs(st.b1) > 0.05 ? " <strong>¡Incluso cambia el signo!</strong>" : "");
    }
    render();
  };

  /* ========================================================================
     Quizzes de selección múltiple
     <div class="econ-quiz"> … <button class="econ-quiz-opt" data-correct> …
     ======================================================================== */
  function mountQuiz(q) {
    if (q.dataset.mounted) return;
    q.dataset.mounted = "1";
    const opts = q.querySelectorAll(".econ-quiz-opt");
    const fb = q.querySelector(".econ-quiz-fb");
    opts.forEach((o) => {
      o.type = "button";
      o.addEventListener("click", () => {
        const ok = o.hasAttribute("data-correct");
        o.classList.add(ok ? "is-right" : "is-wrong");
        if (ok) {
          opts.forEach((x) => { x.disabled = true; });
          if (fb) fb.classList.add("is-visible");
        }
      });
    });
  }

  function mountAll() {
    document.querySelectorAll(".econ-widget[data-widget]").forEach((root) => {
      if (root.dataset.mounted) return;
      const fn = WIDGETS[root.dataset.widget];
      if (!fn) return;
      root.dataset.mounted = "1";
      try {
        fn(root);
      } catch (err) {
        console.error("econ.js:", root.dataset.widget, err);
        root.append(h("p", { class: "econ-note" }, "No se pudo cargar este simulador."));
      }
    });
    document.querySelectorAll(".econ-quiz").forEach(mountQuiz);
  }

  if (typeof document$ !== "undefined") document$.subscribe(mountAll);
  else document.addEventListener("DOMContentLoaded", mountAll);
})();
