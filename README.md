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

Publicación: `mkdocs gh-deploy --force` (construye y sube a la rama `gh-pages`). El workflow
`.github/workflows/documentation.yml` automatiza esto en cada push a `main`, pero para subirlo el
token de `gh` necesita el scope `workflow` (`gh auth refresh -h github.com -s workflow`).

Los simuladores interactivos de cada clase viven en `docs/javascripts/econ.js` (JavaScript puro,
sin dependencias) y las fórmulas se renderizan con MathJax (`docs/javascripts/mathjax.js`).

## Clases generadas desde las diapositivas

Las páginas `docs/clases/claseN.md` **no se editan a mano**: se generan desde los `.tex` oficiales
de cada semana (carpeta `../semN/`, junto a este repo), para que el contenido sea idéntico al de la
sección paralela del curso.

```bash
python3 tools/clases.py --inventario   # lista las láminas de cada .tex (con su número)
python3 tools/clases.py                # regenera todas las clases (o: python3 tools/clases.py 2)
mkdocs build --site-dir site && python3 tools/auditar.py site   # verifica que no falte texto
```

- `tools/tex2md.py` convierte cada lámina con pandoc (incluido en Quarto) sin reescribir su texto.
- `tools/clases.py` define, por clase, qué `.tex` la componen y qué material interactivo se
  intercala después de qué lámina (simuladores, quizzes, soluciones plegables y figuras TikZ).
- `tools/auditar.py` compara las palabras de cada lámina con la página publicada.

Para agregar una clase nueva (p. ej. semana 4): añade una entrada en `CLASES` de `tools/clases.py`
con sus `.tex`, genera, agrega la página al `nav` de `mkdocs.yml` y audita.
