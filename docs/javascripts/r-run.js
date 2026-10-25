/* ==========================================================================
   r-run.js — Ejercicios de R que se ejecutan en el navegador.

   Cada bloque <div class="econ-r"> (generado por tools/clases.py) contiene un
   bloque de código R. Este script le agrega una barra con "Ejecutar", "Copiar"
   y "Restaurar", y hace editable el código para que el estudiante lo cambie.

   R corre con webR (R compilado a WebAssembly). Se descarga SOLO la primera
   vez que alguien presiona "Ejecutar" (~20 s); después cada ejecución es
   inmediata y todos los bloques de la página comparten la misma sesión.
   ========================================================================== */
(function () {
  "use strict";
  const WEBR_URL = "https://webr.r-wasm.org/v0.4.2/webr.mjs";
  let webRPromise = null;

  function getWebR(status) {
    if (!webRPromise) {
      status("⏳ Cargando R en tu navegador (solo la primera vez, puede tardar unos 20 segundos)…");
      webRPromise = import(WEBR_URL).then(async ({ WebR }) => {
        const webR = new WebR();
        await webR.init();
        return webR;
      }).catch((err) => {
        webRPromise = null;
        throw err;
      });
    }
    return webRPromise;
  }

  function mk(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  function mount(block) {
    if (block.dataset.mounted) return;
    const code = block.querySelector("pre code");
    if (!code) return;
    block.dataset.mounted = "1";
    const original = code.textContent;
    code.setAttribute("contenteditable", "plaintext-only");
    // Firefox antiguo no conoce "plaintext-only": se usa "true"
    if (code.contentEditable !== "plaintext-only") code.setAttribute("contenteditable", "true");
    code.setAttribute("spellcheck", "false");
    code.setAttribute("aria-label", "Código R editable");

    const bar = mk("div", "econ-r-bar");
    const run = mk("button", "econ-btn econ-btn-gold", "▶ Ejecutar en el navegador");
    const copy = mk("button", "econ-btn econ-btn-ghost", "Copiar");
    const reset = mk("button", "econ-btn econ-btn-ghost", "↺ Restaurar");
    [run, copy, reset].forEach((b) => { b.type = "button"; bar.append(b); });
    const hint = mk("span", "econ-r-hint", "Puedes editar el código antes de ejecutarlo.");
    bar.append(hint);
    const out = mk("div", "econ-r-out");
    out.setAttribute("aria-live", "polite");
    out.hidden = true;
    const host = code.closest(".highlight") || code.closest("pre");
    host.after(bar, out);

    const status = (msg) => {
      out.hidden = false;
      out.replaceChildren(mk("p", "econ-r-status", msg));
    };

    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        copy.textContent = "¡Copiado!";
      } catch (e) {
        copy.textContent = "Selecciona y copia (Ctrl+C)";
      }
      setTimeout(() => { copy.textContent = "Copiar"; }, 1600);
    });

    reset.addEventListener("click", () => {
      code.textContent = original;
      out.hidden = true;
      out.replaceChildren();
    });

    run.addEventListener("click", async () => {
      run.disabled = true;
      run.textContent = "⏳ Ejecutando…";
      try {
        const webR = await getWebR(status);
        status("⏳ Ejecutando…");
        const shelter = await new webR.Shelter();
        try {
          const res = await shelter.captureR(code.innerText, {
            withAutoprint: true,
            captureStreams: true,
            captureConditions: false,
            captureGraphics: { width: 720, height: 420 },
          });
          out.replaceChildren();
          const text = res.output
            .filter((o) => o.type === "stdout" || o.type === "stderr")
            .map((o) => o.data)
            .join("\n");
          if (text.trim()) out.append(mk("pre", "econ-r-text", text));
          (res.images || []).forEach((img) => {
            const cv = mk("canvas", "econ-r-plot");
            cv.width = img.width;
            cv.height = img.height;
            cv.getContext("2d").drawImage(img, 0, 0);
            out.append(cv);
          });
          if (!out.childNodes.length) out.append(mk("p", "econ-r-status", "✓ Listo (el código no imprimió resultados)."));
        } finally {
          shelter.purge();
        }
      } catch (err) {
        out.hidden = false;
        out.replaceChildren(mk("pre", "econ-r-text is-error",
          "Error: " + (err && err.message ? err.message : String(err)) +
          "\n\nSi R no carga, copia el código y ejecútalo en RStudio o en https://webr.r-wasm.org/latest/"));
      } finally {
        run.disabled = false;
        run.textContent = "▶ Ejecutar en el navegador";
      }
    });
  }

  function mountAll() {
    document.querySelectorAll(".econ-r").forEach(mount);
  }

  if (typeof document$ !== "undefined") document$.subscribe(mountAll);
  else document.addEventListener("DOMContentLoaded", mountAll);
})();
