# Wiki Mosqueteroweb · Salud

Recopilatorio personal de notas y recursos publicado como web estática (MkDocs Material) en GitHub Pages.

## Estructura

- `docs/` — contenido de la web:
  - `docs/salud/` — artículos de salud
  - `docs/utilidades/` — trucos y recursos prácticos
  - `docs/curiosidades/` — temas curiosos
  - `docs/educacion/` — métodos de estudio y aprendizaje con IA
  - `docs/video/`, `docs/pdf/`, `docs/img/` — recursos multimedia
- `mkdocs.yml` — configuración del sitio (tema, plugins, búsqueda)
- `overrides/404.html` — página de error 404 personalizada
- `.github/workflows/` — despliegue automático a GitHub Pages (Actions)

## Cómo añadir o editar contenido

1. Crear o modificar un archivo `.md` en la carpeta `docs/<seccion>/`.
2. Markdown: `# Título`, `**negrita**`, listas `-`, tablas `|…|`, avisos `!!! note` / `!!! warning`.
3. Vídeos: cortos (≤5 min) en `docs/video/` y embebidos con `<video>`; largos en YouTube no listado e incrustados con `<iframe>`.
4. Hacer commit y push: GitHub Actions compila solo y publica (el menú se actualiza automáticamente).

## Despliegue

El workflow de Actions ejecuta `mkdocs build` y publica `_site/` en GitHub Pages. No hace falta build local salvo para verificar cambios de configuración o diseño.

## Build local (verificación)

```bash
python3 -m venv .venv
.venv/bin/pip install mkdocs-material mkdocs-awesome-pages-plugin
.venv/bin/mkdocs build   # genera _site/; 0 warnings = correcto
```
