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

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function wiki2html(body) {
  // Seguridad: escapar todo salvo bloques <html>...</html> explícitos (controlados por el autor).
  const segs = body.split(/(<html>[\s\S]*?<\/html>)/g);
  let h = '';
  for (const seg of segs) {
    if (seg.startsWith('<html>')) { h += seg.slice(6, -7); continue; }
    h += esc(seg);
  }
  h = h
    .replace(/\[\[([^\]|]+)\|(video\/[^\]]+\.mp4)\]\]/g, '<video controls preload=\'metadata\' src=\'$2\'>$1</video>')
    .replace(/\[\[([^\]|]+)\|xFrame\|([^\]]+)\]\]/g, '<iframe loading=\'lazy\' allow=\'encrypted-media; picture-in-picture\' allowfullscreen src=\'$2\' style=\'width:100%;aspect-ratio:16/9;border:0;border-radius:8px;margin:.5rem 0\'></iframe>')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '<a href=\'$2\' target=\'_blank\'>$1</a>')
    .replace(/\[\[([^\]]+)\]\]/g, '<a href=\'#\'>$1</a>')
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
    const t = parseTid(raw);
    t._file = f;
    return t;
  });

  // Validación: evitar artículos rotos/vacíos (falla el build con mensaje claro)
  const errs = [];
  for (const t of tiddlers) {
    const fn = t._file || '(desconocido)';
    const title = (t.meta.title || '').trim();
    if (!title) errs.push(`Tiddler sin título (archivo: ${fn}). Añade 'title: ...' en la primera línea.`);
    const isHome = (t.meta.tags || '').split(' ').includes('Portada');
    if (!isHome) {
      const tags = (t.meta.tags || '').trim();
      if (!tags) errs.push(`"${title}" no tiene tags. Añade 'tags: Salud Utilidades Curiosidades ...' al menos con una sección.`);
      const body = (t.body || '').trim();
      if (!body) errs.push(`"${title}" tiene el cuerpo vacío. Escribe el contenido del artículo.`);
    }
  }
  if (errs.length) {
    console.error('✖ Build abortado: se encontraron tiddlers inválidos:');
    errs.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }

  const home = tiddlers.find(t => (t.meta.tags || '').split(' ').includes('Portada')) || tiddlers[0];
  const homeId = encodeURIComponent(home.meta.title);

  const groups = {};
  CATEGORIES.forEach(c => groups[c] = []);
  groups['Otros'] = [];
  const articles = tiddlers.filter(t => t !== home);
  const HIDDEN = 'Oculto';
  const isHidden = t => ((t.meta.tags || '').split(' ').includes(HIDDEN));
  for (const t of articles) {
    if (isHidden(t)) continue;
    const tags = (t.meta.tags || '').split(' ').filter(Boolean);
    const cats = tags.filter(tg => CATEGORIES.includes(tg));
    if (cats.length === 0) groups['Otros'].push(t);
    else cats.forEach(c => groups[c].push(t));
  }

  const entries = tiddlers.map(t => {
    const title = t.meta.title || 'Sin título';
    const id = encodeURIComponent(title);
    const tags = (t.meta.tags || '').split(' ').filter(Boolean);
    const hidden = tags.includes(HIDDEN);
    const tagHtml = tags.filter(tg => tg !== HIDDEN).map(tg => `<span class="tag">${esc(tg)}</span>`).join(' ');
    const htmlBody = wiki2html(t.body).replace(/<html>[\s\S]*?<\/html>/g, '');
    const rawHtml = extractRawHtml(t.body);
    return `
<section class="view card tiddler" id="${esc(id)}"${hidden ? ' data-hidden="1"' : ''}>
  <h2>${esc(title)}</h2>
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
    .map(c => `<li><a href="#" data-cat="${c}" onclick="show('cat-${encodeURIComponent(c)}')"><span class="dot"></span> ${CAT_ICON[c]||''} ${c}</a></li>`).join('\n');
  const nav = `<li><a href="#" onclick="show('${homeId}')"><span class="dot"></span> <b>🏠 Inicio</b></a></li>\n${navCats}`;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noai, noimageai, nosnippet">
<meta name="googlebot" content="noindex, nofollow, noai">
<title>Wiki Mosqueteroweb</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<style>
  :root{
    --bg:#f3f6f4; --panel:#e7eee9; --ink:#2f3e36; --muted:#6b7d72;
    --accent:#5a8a6b; --card:#ffffff; --line:#d8e3db;
  }
  *{box-sizing:border-box}
  body{font-family:-apple-system,system-ui,Segoe UI,Roboto,sans-serif;margin:0;background:var(--bg);color:var(--ink)}
  header{background:linear-gradient(120deg,#5a8a6b,#7fae8e);color:#fff;padding:1.1rem 1.6rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;box-shadow:0 2px 10px rgba(0,0,0,.08)}
  header h1{margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:1.45rem;letter-spacing:.3px}
  header button{background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:8px;padding:.45rem .8rem;font-size:.82rem;cursor:pointer;font-weight:600}
  header button:hover{background:rgba(255,255,255,.3)}
  .layout{display:flex;min-height:86vh}
  nav{width:265px;background:var(--panel);padding:1.4rem 1.2rem;border-right:1px solid var(--line);flex-shrink:0}
  nav .search{width:100%;padding:.6rem .8rem;border:1px solid var(--line);border-radius:10px;background:#fff;margin-bottom:1.3rem;font-size:.9rem;color:var(--muted)}
  nav h3{font-size:.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:.4rem 0 .6rem}
  nav ul{list-style:none;padding:0;margin:0 0 1.2rem}
  nav a{display:flex;align-items:center;gap:.6rem;color:var(--ink);text-decoration:none;padding:.55rem .7rem;border-radius:9px;font-size:.92rem}
  nav a:hover{background:var(--card);box-shadow:0 1px 4px rgba(0,0,0,.05)}
  nav a.active{background:var(--accent);color:#fff;font-weight:600}
  nav a.active .dot{background:#fff}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0}
  main{flex:1;padding:2rem 2.4rem;max-width:860px}
  .crumb{font-size:.8rem;color:var(--muted);margin-bottom:1.2rem}
  .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:1.6rem 1.8rem;box-shadow:0 4px 18px rgba(47,62,54,.06);margin-bottom:1.4rem}
  .card h2{font-family:Georgia,serif;margin:.1rem 0 .6rem;font-size:1.35rem;overflow-wrap:anywhere;word-break:break-word;max-width:100%}
  .tag{display:inline-block;background:var(--panel);color:var(--accent);border-radius:6px;padding:.15rem .6rem;font-size:.72rem;margin-right:.4rem}
  .card p{color:var(--muted);line-height:1.65;font-size:.95rem;margin:.4rem 0}
  .body img{max-width:100%;border-radius:12px}
  .body video{max-width:100%;border-radius:12px;margin:.5rem 0;background:#000;display:block}
  .body iframe{max-width:100%;border:0;border-radius:8px;margin:.5rem 0}
  .catlist li{margin:.3rem 0}
  .catlist a{color:#344e41;font-weight:600}
  .catdesc{color:#555}
  .hint{font-size:.8rem;color:#888;margin-top:2rem;border-top:1px dashed #ccc;padding-top:1rem}
  @media(max-width:600px){
    .layout{flex-direction:column}
    nav{width:100%;border-right:none;border-bottom:1px solid var(--line)}
    main{padding:1.2rem}
    header h1{font-size:1.15rem}
    .card h2{font-size:1.15rem}
    .body video,.body iframe{max-width:100%}
  }
</style>
</head>
<body>
<header>
  <h1>🩺 Wiki Mosqueteroweb</h1>
  <button onclick="goBack()" title="Volver atrás">⬅ Atrás</button>
  <button onclick="exportZip()" title="Descargar copia de seguridad (ZIP)">⬇ Copia seguridad</button>
</header>
<div class="layout">
  <nav>
    <input id="search" class="search" placeholder="🔎 Buscar..." onkeyup="filter()">
    <ul id="navlist">${nav}</ul>
  </nav>
  <main>
<div class="crumb" id="crumb"></div>
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
var _history=[];
const CATS = ${JSON.stringify(CATEGORIES)};
function titleOf(id){ return decodeURIComponent(id); }
function activeCatFor(id){
  if(id && id.indexOf('cat-')===0){ return decodeURIComponent(id.slice(4)); }
  // tiddler: buscar primera categoria base en sus tags
  const el=document.getElementById(id);
  if(el){
    const tags=[...el.querySelectorAll('.tags .tag')].map(t=>t.textContent.trim());
    for(const c of CATS){ if(tags.includes(c)) return c; }
  }
  return null;
}
function highlightCat(cat){
  document.querySelectorAll('#navlist a[data-cat]').forEach(a=>{
    if(cat && a.getAttribute('data-cat')===cat) a.classList.add('active');
    else a.classList.remove('active');
  });
}
function show(id){
  document.querySelectorAll('.view').forEach(s=>s.style.display='none');
  const el=document.getElementById(id);
  if(el){ el.style.display='block'; window.scrollTo(0,0); _history.push(id); updateCrumb(id); highlightCat(activeCatFor(id)); }
}
function updateCrumb(id){
  const crumb=document.getElementById('crumb');
  if(!crumb) return;
  if(id && id.indexOf('cat-')===0){
    const cat=decodeURIComponent(id.slice(4));
    crumb.textContent='Inicio › '+cat;
  } else if(id){
    crumb.textContent='Inicio › '+decodeURIComponent(id);
  } else {
    crumb.textContent='Inicio';
  }
}
function goBack(){
  if(_history.length>1){ _history.pop(); const prev=_history.pop(); show(prev); }
  else if(_history.length===1){ /* ya en inicio */ }
}
function filter(){
  const q=document.getElementById('search').value.toLowerCase().trim();
  if(!q){ show('${homeId}'); updateCrumb('${homeId}'); highlightCat(null); return; }
  document.querySelectorAll('.view').forEach(s=>s.style.display='none');
  document.querySelectorAll('.tiddler').forEach(s=>{
    if(s.dataset.hidden) return;
    if(s.innerText.toLowerCase().includes(q)){ s.style.display='block'; }
  });
  window.scrollTo(0,0);
  const crumb=document.getElementById('crumb'); if(crumb) crumb.textContent='Búsqueda: '+q;
  highlightCat(null);
}
// Genera el ZIP en el navegador (index.html + media local) para uso offline
async function exportZip(){
  if(typeof JSZip==='undefined'){ alert('Cargando librería ZIP, inténtalo en unos segundos...'); return; }
  const btn=document.querySelector('header button[onclick^="exportZip"]')||document.querySelector('header button');
  const old=btn.textContent; btn.textContent='⏳ Generando...'; btn.disabled=true;
  try{
    const zip=new JSZip();
    zip.file('index.html', document.documentElement.outerHTML);
    const dirs=['img','video','pdf'];
    for(const d of dirs){
      const re=new RegExp(d+'/[^"\\x27\\s)]+','g');
      const found=new Set([...document.documentElement.outerHTML.matchAll(re)].map(m=>m[0]));
      for(const rel of found){
        try{
          const r=await fetch(rel);
          if(r.ok){ const buf=await r.arrayBuffer(); zip.file(rel, buf); }
        }catch(e){ console.warn('No se pudo añadir',rel,e); }
      }
    }
    const blob=await zip.generateAsync({type:'blob'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    const mm=String(new Date().getMonth()+1).padStart(2,'0');
    const yyyy=new Date().getFullYear();
    a.download='wikisalud-'+mm+'-'+yyyy+'.zip';
    a.click();
    URL.revokeObjectURL(a.href);
  }catch(e){ alert('Error: '+e.message); }
  finally{ btn.textContent=old; btn.disabled=false; }
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
