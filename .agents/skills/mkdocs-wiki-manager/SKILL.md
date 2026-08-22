---
name: mkdocs-wiki-manager
description: >-
  Crea, edita y mantiene artículos y recursos en la web estática Wiki Mosqueteroweb (salud-prototipo)
  usando MkDocs Material, awesome-pages y despliegue en GitHub Pages. Utiliza esta habilidad
  cuando se solicite redactar nuevos artículos, actualizar índices de tarjetas, insertar multimedia
  o validar la compilación y sincronización del sitio.
---

# MkDocs Wiki Manager (Salud & Utilidades)

Esta habilidad proporciona el flujo de trabajo estándar para redactar, estructurar, verificar y publicar contenidos en la wiki **Wiki Mosqueteroweb** construida con **MkDocs Material**.

---

## 🚀 Flujo de Trabajo para Nuevos Artículos

### 1. Seleccionar la Sección y Nombre del Archivo
Identifica la sección adecuada dentro de `docs/`:
- `docs/salud/`: Guías de salud, estiramientos, primeros auxilios, bienestar y hábitos.
- `docs/utilidades/`: Trucos del hogar, bricolaje, nudos, ropa, guías prácticas.
- `docs/curiosidades/`: Divulgación, datos interesantes, curiosidades cotidianas.
- `docs/educacion/`: Técnicas de estudio, métodos de aprendizaje y uso de IA.
- `docs/oculto/`: Contenido en borrador o no listado.

Crea el archivo con nombre en formato kebab-case (sin tildes, solo minúsculas y guiones):
`docs/<seccion>/mi-articulo-ejemplo.md`

### 2. Estructurar el Contenido Markdown
Usa la siguiente plantilla de referencia:

```markdown
# Título del Artículo

Párrafo resumen explicando el objetivo o fuente del artículo (1-2 párrafos concisos).

## Puntos Clave / Procedimiento
- **Punto 1**: Explicación directa y clara.
- **Punto 2**: Explicación con detalles prácticos.

## Recomendaciones
!!! tip "Consejo práctico"
    Información destacada o truco para mejores resultados.

!!! warning "Atención / Precaución"
    Avisos de seguridad, contraindicaciones médicas o precauciones.

## Multimedia (Opcional)
<!-- Vídeo local (si está en docs/video/) -->
<video controls preload="none" src="../video/nombre-video.mp4">Título del vídeo</video>

<!-- O Vídeo de YouTube -->
<div class="video-wrapper">
  <iframe width="100%" height="400" src="https://www.youtube-nocookie.com/embed/ID_DEL_VIDEO" frameborder="0" allowfullscreen></iframe>
</div>

**Aplicación / Conclusión:** Resumen de utilidad práctica en el día a día.
```

---

## 🗂️ 3. Actualizar Índices y Navegación

### A. Tarjetas en `docs/<seccion>/index.md`
Añade una nueva tarjeta dentro del bloque `<div class="grid cards" markdown>`:

```markdown
- [__Título del Artículo__](mi-articulo-ejemplo.md)

    ---

    Descripción breve y atractiva (1-2 líneas).

    [:octicons-arrow-right-24: Leer](mi-articulo-ejemplo.md)
```

### B. Navegación en `.pages` (si aplica)
Si la sección tiene un archivo `.pages` con un árbol `nav:` manual (como `docs/utilidades/.pages`), agrega el archivo `.md` bajo la categoría correspondiente.

---

## ⚙️ 4. Procesamiento de Multimedia y Transcripciones (Scripts Auxiliares)

Si el artículo proviene de un audio, vídeo o transcripción en otro idioma:
- `translate.py` / `translate_gemma.py`: Traduce transcripciones largas en inglés a español.
- `tts_xtts.py` / `tts_fish.py`: Genera locuciones de texto a voz para acompañar el contenido.

---

## 🔍 5. Validación Local

Antes de hacer commit, verifica que no existan enlaces rotos ni errores de sintaxis:

```bash
cd /Users/pedro/carpetaHermes/salud-prototipo
.venv/bin/mkdocs build
```

Revisa que la salida reporte `0` errores/warnings y genere correctamente la carpeta `_site/`.

---

## 🌐 6. Publicación en GitHub Pages

Para publicar los cambios en la web en vivo:

```bash
git add docs/ mkdocs.yml
git commit -m "feat(<seccion>): añadir artículo sobre <tema>"
git push origin main
```

El flujo de GitHub Actions (`.github/workflows/deploy.yml`) compilará automáticamente el sitio y lo publicará en `https://mosqueteroweb.github.io/Salud/`.
