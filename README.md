# ICS-294 — Econometría

Sitio del curso (USM, Ingeniería Comercial · Trimestre 3, 2026), publicado con MkDocs Material en
GitHub Pages: https://hizocar.github.io/econometria-usm/

## Desarrollo local

```bash
pip install -r requirements.txt
mkdocs serve
```

## Build

```bash
mkdocs build --strict --site-dir public
```

El despliegue a GitHub Pages se realiza automáticamente vía GitHub Actions
(`.github/workflows/documentation.yml`) en cada push a `main`.

Los simuladores interactivos de cada clase viven en `docs/javascripts/econ.js` (JavaScript puro,
sin dependencias) y las fórmulas se renderizan con MathJax (`docs/javascripts/mathjax.js`).
