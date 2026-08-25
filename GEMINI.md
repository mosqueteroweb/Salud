# Reglas y Guías de Desarrollo · Wiki Mosqueteroweb (Salud)

Este repositorio contiene la wiki personal construida con **MkDocs Material** y desplegada automáticamente en **GitHub Pages** mediante GitHub Actions.

## 📂 Estructura del Sitio

- `mkdocs.yml`: Configuración general del sitio (tema Material, plugins, extensiones markdown, estilos).
- `docs/`: Directorio raíz de contenidos:
  - `docs/salud/`: Artículos de salud, bienestar, primeros auxilios, movilidad y prevención.
  - `docs/utilidades/`: Trucos domésticos, bricolaje, nudos, cuidado de ropa, guías prácticas.
  - `docs/curiosidades/`: Temas de interés general, ciencia y curiosidades.
  - `docs/educacion/`: Métodos de estudio, aprendizaje con IA y técnicas formativas.
  - `docs/oculto/`: Notas internas o borradores no indexados en el menú principal.
  - `docs/video/`, `docs/img/`, `docs/pdf/`: Recursos multimedia locales.
  - `docs/stylesheets/extra-v2.css`: Estilos personalizados adicionales.
  - `docs/.pages` y `docs/<seccion>/.pages`: Configuración de navegación y orden (plugin `awesome-pages`).

---

## ✍️ Estándares para Crear y Editar Artículos

1. **Nomenclatura de archivos**:
   - Formato kebab-case en minúsculas sin acentos ni caracteres especiales: `docs/<seccion>/mi-nuevo-articulo.md`.
2. **Estructura del contenido Markdown**:
   - `# Título del Artículo` (solo un H1 al inicio).
   - Párrafo introductorio conciso con el resumen del tema y origen/fuente si aplica.
   - Encabezados de segundo nivel `## Sección` para organizar los puntos clave.
   - Uso de negritas `**concepto clave**`, listas con viñetas `-` y tablas cuando ayude a la legibilidad.
   - Avisos o llamadas destacadas con la sintaxis de Material:
     ```markdown
     !!! tip "Consejo clave"
         Texto del consejo...

     !!! warning "Atención"
         Advertencia de seguridad o contraindicaciones...
     ```
3. **Multimedia**:
   - **Vídeos cortos (≤ 5 min / locales)**: Colocados en `docs/video/` y embebidos con:
     ```html
     <video controls preload="none" src="../video/nombre-video.mp4">Título del vídeo</video>
     ```
   - **Vídeos largos / externos**: Alojados en YouTube (p. ej. no listado) e incrustados mediante `<iframe>`.
   - **Imágenes**: En `docs/img/` referenciadas con `![Descripción](../img/nombre.jpg)`.

4. **Indexación y Navegación**:
   - Al añadir un artículo a una sección (ej. `salud/`), añadir su tarjeta al `docs/<seccion>/index.md` dentro del contenedor `<div class="grid cards" markdown>`:
     ```markdown
     - [__Título del Artículo__](nombre-archivo.md)

         ---

         Descripción breve de 1 o 2 líneas.

         [:octicons-arrow-right-24: Leer](nombre-archivo.md)
     ```
   - Si la sección usa navegación manual en `.pages` (como `utilidades/.pages`), incluir el archivo en el grupo correspondiente.

---

## 🛠️ Comprobación y Despliegue

1. **Validación local (Build)**:
   - Para verificar que no hay enlaces rotos ni advertencias:
     ```bash
     .venv/bin/mkdocs build
     ```
     (o usando el Python del entorno virtual: `python3 -m mkdocs build`). Debe finalizar con 0 advertencias.
2. **Publicación**:
   - Todo commit y push a la rama `main` activa el workflow `.github/workflows/deploy.yml`, que compila con MkDocs y publica automáticamente en `https://mosqueteroweb.github.io/Salud/`.

---

## ⚡ Regla Permanente de Flujo Completo
- Al añadir o actualizar contenido en la wiki:
  1. Crear el artículo y descargar o generar los recursos multimedia necesarios en local.
  2. Indexar la tarjeta en el `index.md` de la sección.
  3. Validar la compilación con `mkdocs build`.
  4. **Ejecutar siempre en local y subir a GitHub (`git add`, `git commit`, `git push origin main`) de forma directa y automática, sin preguntar.**
  5. **Verificar con `gh run watch` o `gh run list` que el GitHub Action ha finalizado con éxito (`completed / success`) sin errores de despliegue.**
  6. **Entregar al usuario únicamente el enlace web directo al artículo publicado, sin incluir resúmenes ni listas de tareas al final.**

