#!/usr/bin/env node
/* build.js — Wiki estática "salud" (Salud / Utilidades / Curiosidades)
   Motor minimalista sin dependencias: lee tiddlers/*.tid y genera index.html.
   Edición: se crean/modifican los .tid desde github.com (web del repo) -> run Action -> publica.
   Reutiliza el enfoque de preparacionismo pero con secciones como categorías base. */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TID_DIR = path.join(ROOT, 'tiddlers');
const OUT = path.join(ROOT, 'index.html');

// Secciones base (menú). Todo tiddler con un tag que coincida va a esa sección.
const CATEGORIES = ['Salud', 'Utilidades', 'Curiosidades'];
const CAT_ICON = {
  'Salud': '🩺',
  'Utilidades': '🧰',
  'Curiosidades': '💡',
  'Otros': '📦',
};

function parseTid(raw) {
  const lines = raw.split('\n');
  const meta = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (l === '') { i++; break; }
    const m = l.match(/^([A-Za-z0-9_]+):\s?(.*)$/);
    if (m) meta[m[1]] = m[2];
  }
  const body = lines.slice(i).join('\n').trim();
  return { meta, body };
}

function wiki2html(body) {
  let h = body
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\[\[([^\]]+)\]\]/g, '<a href="#">$1</a>')
    .replace(/'''([^']+)'''/g, '<b>$1</b>')
    .replace(/''([^']+)''/g, '<i>$1</i>');
  const blocks = h.split('\n');
  let out = '', inList = false;
  for (let line of blocks) {
    if (line.startsWith('! ')) { if(inList){out+='</ul>';inList=false;} out += `<h1>${line.slice(2)}</h1>`; }
    else if (line.startsWith('!! ')) { if(inList){out+='</ul>';inList=false;} out += `<h2>${line.slice(3)}</h2>`; }
    else if (line.startsWith('# ')) { if(!inList){out+='<ol>';inList='ol';} out += `<li>${line.slice(2)}</li>`; }
    else if (line.startsWith('* ')) { if(!inList){out+='<ul>';inList='ul';} out += `<li>${line.slice(2)}</li>`; }
    else { if(inList){out+=`</${inList}>`;inList=false;} if(line.trim()) out += `<p>${line}</p>`; }
  }
  if (inList) out += `</${inList}>`;
  return out;
}

function extractRawHtml(body) {
  const m = body.match(/<html>([\s\S]*?)<\/html>/);
  return m ? m[1] : '';
}

function build() {
  const files = fs.readdirSync(TID_DIR).filter(f => f.endsWith('.tid'));
  if (!files.length) { console.error('No hay .tid en', TID_DIR); process.exit(1); }
  const tiddlers = files.map(f => {
    const raw = fs.readFileSync(path.join(TID_DIR, f), 'utf8');
    return parseTid(raw);
  });

  const home = tiddlers.find(t => (t.meta.tags || '').split(' ').includes('Portada')) || tiddlers[0];
  const homeId = encodeURIComponent(home.meta.title);

  const groups = {};
  CATEGORIES.forEach(c => groups[c] = []);
  groups['Otros'] = [];
  const articles = tiddlers.filter(t => t !== home);
  for (const t of articles) {
    const tags = (t.meta.tags || '').split(' ').filter(Boolean);
    const cats = tags.filter(tg => CATEGORIES.includes(tg));
    if (cats.length === 0) groups['Otros'].push(t);
    else cats.forEach(c => groups[c].push(t));
  }

  const entries = tiddlers.map(t => {
    const title = t.meta.title || 'Sin título';
    const id = encodeURIComponent(title);
    const tags = (t.meta.tags || '').split(' ').filter(Boolean);
    const tagHtml = tags.map(tg => `<span class="tag">${tg}</span>`).join(' ');
    const htmlBody = wiki2html(t.body).replace(/<html>[\s\S]*?<\/html>/g, '');
    const rawHtml = extractRawHtml(t.body);
    return `
<section class="view tiddler" id="${id}">
  <h2>${title}</h2>
  <div class="tags">${tagHtml}</div>
  <div class="body">${htmlBody}${rawHtml}</div>
</section>`;
  }).join('\n');

  const catSections = CATEGORIES.concat(['Otros']).filter(c => groups[c].length).map(c => {
    const links = groups[c].map(t =>
      `<li><a href="#" onclick="show('${encodeURIComponent(t.meta.title)}')">${t.meta.title}</a></li>`).join('\n');
    const cid = 'cat-' + encodeURIComponent(c);
    return `<section class="view" id="${cid}">
  <h2>${CAT_ICON[c]||''} ${c}</h2>
  <p class="catdesc">Artículos en <b>${c}</b>:</p>
  <ul class="catlist">${links}</ul>
</section>`;
  }).join('\n');

  const navCats = CATEGORIES.concat(['Otros']).filter(c => groups[c].length)
    .map(c => `<li><a href="#" onclick="show('cat-${encodeURIComponent(c)}')">${CAT_ICON[c]||''} ${c}</a></li>`).join('\n');
  const nav = `<li><a href="#" onclick="show('${homeId}')"><b>🏠 Inicio</b></a></li>\n${navCats}`;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wiki Mosqueteroweb</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f4f1ea;color:#222}
  header{background:#3a5a40;color:#fff;padding:1rem;position:sticky;top:0;display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
  header h1{margin:0;font-size:1.3rem}
  .layout{display:flex;min-height:80vh}
  nav{width:240px;background:#344e41;color:#fff;padding:1rem;flex-shrink:0}
  nav ul{list-style:none;padding:0;margin:0}
  nav a{color:#dad7cd;text-decoration:none;display:block;padding:.4rem 0}
  nav a:hover{color:#fff}
  main{flex:1;padding:1.5rem;max-width:820px}
  .view{display:none}
  .tiddler{border-bottom:1px solid #ccc;padding:1rem 0}
  .tags .tag{background:#a3b18a;color:#1c2b1f;border-radius:4px;padding:.1rem .5rem;font-size:.75rem;margin-right:.3rem}
  .body img{max-width:100%}
  .catlist li{margin:.3rem 0}
  .catlist a{color:#344e41;font-weight:600}
  .catdesc{color:#555}
  input#search{width:100%;padding:.5rem;margin-bottom:1rem;border-radius:6px;border:1px solid #ccc}
  .hint{font-size:.8rem;color:#888;margin-top:2rem;border-top:1px dashed #ccc;padding-top:1rem}
  @media(max-width:600px){.layout{flex-direction:column}nav{width:100%}}
</style>
</head>
<body>
<header>
  <h1>🩺 Wiki Mosqueteroweb</h1>
</header>
<div class="layout">
  <nav>
    <input id="search" placeholder="Buscar..." onkeyup="filter()">
    <ul id="navlist">${nav}</ul>
  </nav>
  <main>
${entries}
${catSections}
  <div class="hint">
    ¿Quieres añadir o editar un artículo? Entra en el repositorio de GitHub
    (<code>tiddlers/</code>), crea o modifica un archivo <code>.tid</code> y guarda.
    La web se actualiza sola con GitHub Actions. No necesitas ayuda externa.
  </div>
  </main>
</div>
<script>
function show(id){
  document.querySelectorAll('.view').forEach(s=>s.style.display='none');
  const el=document.getElementById(id);
  if(el){ el.style.display='block'; window.scrollTo(0,0); }
}
function filter(){
  const q=document.getElementById('search').value.toLowerCase().trim();
  if(!q){ show('${homeId}'); return; }
  document.querySelectorAll('.view').forEach(s=>s.style.display='none');
  document.querySelectorAll('.tiddler').forEach(s=>{
    if(s.innerText.toLowerCase().includes(q)){ s.style.display='block'; }
  });
  window.scrollTo(0,0);
}
window.addEventListener('DOMContentLoaded',()=>{
  const h=location.hash.slice(1);
  if(h && document.getElementById(h)) show(h);
  else show('${homeId}');
});
</script>
</body>
</html>`;
  fs.writeFileSync(OUT, html);
  console.log('Generado index.html con', tiddlers.length, 'articulo(s) y', CATEGORIES.length, 'secciones');
}
build();
