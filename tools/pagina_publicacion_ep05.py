"""Arma la página de publicación de "Tu reloj está mal" (video largo, Short, Reel y TikTok) a partir de los .md de
entrega/, para que la página y el repo digan exactamente lo mismo. Uso: python3 tools/pagina_publicacion_ep05.py ids.json salida.html (ids.json: IDs de Drive de master, yt, ig y tt)"""
import html, json, re, sys

import os
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "entrega")
ids = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {}
OUT = sys.argv[2] if len(sys.argv) > 2 else "tu_reloj_kit.html"
cortos = open(f"{ROOT}/tu_reloj_esta_mal_cortos_publicacion.md").read()
ab = open(f"{ROOT}/tu_reloj_esta_mal_ab_miniaturas.md").read()
desc = open(f"{ROOT}/tu_reloj_esta_mal_descripcion_youtube.md").read()
B = re.findall(r"```\n(.*?)```", cortos, re.S)
A = re.findall(r"```\n(.*?)```", ab, re.S)
DESC = desc.split("## Descripción (copiá desde acá)")[1].split("## Etiquetas")[0].strip()
TAGS = desc.split("## Etiquetas")[1].split("##")[0].strip()
FOLDER = "https://drive.google.com/drive/folders/1pHe9G-0pln8FFn3qYIH5uLeHT03jJryD"
def drive(key):
    return f"https://drive.google.com/file/d/{ids[key]}/view" if ids.get(key) else FOLDER

n = 0
def copy(text, label=None, tall=False):
    global n
    n += 1
    lab = f'<span class="copy-label">{html.escape(label)}</span>' if label else ""
    return (f'<div class="copy">{lab}<button type="button" class="copy-btn" data-copy="c{n}">Copiar</button>'
            f'<pre id="c{n}" class="{"tall" if tall else ""}">{html.escape(text.strip())}</pre></div>')

titles_yt = ["Tu reloj está mal (y el de toda la Argentina)", "Por qué en la Argentina vivimos una hora adelantados", "Son las 7:30 y es de noche: el error de la hora argentina"]
thumbs = [("A", "El reloj roto", "TU RELOJ ESTÁ MAL", A[0]), ("B", "El globo con la franja equivocada", "+1 HORA · VIVIMOS ADELANTADOS", A[1]), ("C", "La escuela a oscuras", "07:30 · ¿Y ES DE NOCHE?", A[2])]

files = [
    ("Video largo", "tu_reloj_esta_mal_4k_master.mp4", "3840×2160 · 4:40", "master", "YouTube"),
    ("Short", "tu_reloj_esta_mal_short_youtube.mp4", "1080×1920 · 1:15", "yt", "YouTube Shorts"),
    ("Reel", "tu_reloj_esta_mal_reel_instagram.mp4", "1080×1920 · 1:16", "ig", "Instagram"),
    ("TikTok", "tu_reloj_esta_mal_tiktok.mp4", "1080×1920 · 1:16", "tt", "TikTok"),
]
file_cards = "".join(
    f'<a class="file" href="{drive(k)}" target="_blank" rel="noopener"><span class="file-kind">{p}</span>'
    f'<span class="file-name">{t}</span><span class="file-meta">{m}</span><span class="file-go">Abrir en Drive ↗</span></a>'
    for t, f, m, k, p in files)

page = f"""<title>Kit Tu reloj está mal</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Una columna de lectura (máx. 860 px) con barra de secciones fija; noche por defecto, día en el tema claro,
   como el episodio: la luz contra el reloj. Cada texto para pegar lleva su botón de copiar. */
:root {{
  --bg: #EDF2F7; --panel: #FFFFFF; --panel-2: #E2EAF2; --ink: #0B1726; --mute: #4C5E72; --line: rgba(11,23,38,0.13);
  --sun: #9A5800; --dawn: #B4441A; --err: #BE2A1F; --chip: #0B1726; --chip-ink: #F2F6FA;
  --display: 'Anton', Impact, 'Arial Narrow', sans-serif; --body: 'Archivo', 'Helvetica Neue', Arial, sans-serif; --mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #050A12; --panel: #0C1520; --panel-2: #121F2F; --ink: #EAF1F7; --mute: #93A6B8; --line: rgba(150,195,230,0.17);
  --sun: #FFB547; --dawn: #FF7A45; --err: #FF5A4A; --chip: #FFB547; --chip-ink: #050A12; color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --bg: #050A12; --panel: #0C1520; --panel-2: #121F2F; --ink: #EAF1F7; --mute: #93A6B8; --line: rgba(150,195,230,0.17);
  --sun: #FFB547; --dawn: #FF7A45; --err: #FF5A4A; --chip: #FFB547; --chip-ink: #050A12; color-scheme: dark; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--ink); font: 400 16px/1.6 var(--body); }}
.wrap {{ max-width: 860px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 80px; }}
body::before {{ content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }}
header.top {{ display: grid; gap: 18px; padding-block: 10px 26px; border-bottom: 1px solid var(--line); }}
.eyebrow {{ font: 600 12px/1.2 var(--mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--mute); }}
h1 {{ font: 400 clamp(46px, 11vw, 88px)/0.95 var(--display); letter-spacing: 0.01em; margin: 0; text-wrap: balance; }}
h1 .err {{ color: var(--err); }}
.lede {{ margin: 0; max-width: 62ch; color: var(--mute); }}
.flap {{ display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }}
.flap-digits {{ display: inline-flex; gap: 4px; }}
.flap-digits span {{ font: 400 34px/1 var(--display); background: var(--chip); color: var(--chip-ink); padding: 8px 9px 6px; border-radius: 6px; min-width: 34px; text-align: center; position: relative; }}
.flap-digits span::after {{ content: ""; position: absolute; left: 0; right: 0; top: 50%; border-top: 1px solid var(--bg); opacity: 0.7; }}
.flap-digits .colon {{ background: none; color: var(--ink); min-width: 0; padding: 8px 2px; }}
.flap-digits .colon::after {{ display: none; }}
.zones {{ font: 500 13px/1.5 var(--mono); color: var(--mute); }}
.zones b {{ color: var(--err); font-weight: 600; }}
.zones i {{ color: var(--sun); font-style: normal; font-weight: 600; }}
nav.sections {{ position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); display: flex; gap: 6px; overflow-x: auto; padding-block: 10px; scrollbar-width: none; }}
nav.sections a {{ flex: none; font: 600 13px/1 var(--body); color: var(--ink); text-decoration: none; padding: 9px 12px; border-radius: 999px; border: 1px solid var(--line); }}
nav.sections a:hover, nav.sections a:focus-visible {{ border-color: var(--sun); color: var(--sun); outline: none; }}
section {{ padding-block: 34px 6px; scroll-margin-top: 64px; display: grid; gap: 16px; }}
h2 {{ font: 400 clamp(30px, 6vw, 42px)/1 var(--display); margin: 0; letter-spacing: 0.01em; }}
h2 small {{ display: block; font: 600 12px/1.4 var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); margin-top: 8px; }}
h3 {{ font: 700 17px/1.3 var(--body); margin: 14px 0 0; }}
p {{ margin: 0; max-width: 66ch; }}
ul, ol {{ margin: 0; padding-left: 1.2em; display: grid; gap: 6px; max-width: 66ch; }}
a {{ color: var(--sun); }}
.files {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; }}
.file {{ display: grid; gap: 4px; padding: 14px; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); color: var(--ink); text-decoration: none; min-width: 0; }}
.file:hover, .file:focus-visible {{ border-color: var(--sun); outline: none; }}
.file-kind {{ font: 600 11px/1.2 var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); }}
.file-name {{ font: 400 26px/1 var(--display); }}
.file-meta {{ font: 500 13px/1.3 var(--mono); color: var(--mute); }}
.file-go {{ font: 600 13px/1.3 var(--body); color: var(--sun); margin-top: 4px; }}
.table-wrap {{ overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); }}
table {{ border-collapse: collapse; width: 100%; min-width: 520px; font-size: 15px; }}
th, td {{ text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }}
th {{ font: 600 12px/1.3 var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--mute); }}
tr:last-child td {{ border-bottom: 0; }}
td.time {{ font: 600 14px/1.4 var(--mono); font-variant-numeric: tabular-nums; white-space: nowrap; }}
.copy {{ position: relative; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); min-width: 0; }}
.copy-label {{ display: block; padding: 10px 92px 0 14px; font: 600 12px/1.3 var(--mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--mute); }}
.copy pre {{ margin: 0; padding: 12px 92px 14px 14px; white-space: pre-wrap; word-break: break-word; font: 400 15px/1.55 var(--body); color: var(--ink); }}
.copy pre.tall {{ max-height: 340px; overflow-y: auto; }}
.copy-btn {{ position: absolute; top: 8px; right: 8px; font: 600 13px/1 var(--body); padding: 9px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel-2); color: var(--ink); cursor: pointer; }}
.copy-btn:hover, .copy-btn:focus-visible {{ border-color: var(--sun); color: var(--sun); outline: none; }}
.thumb {{ display: grid; gap: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel-2); }}
.thumb-head {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px; }}
.badge {{ font: 400 22px/1 var(--display); background: var(--chip); color: var(--chip-ink); border-radius: 6px; padding: 6px 10px 4px; }}
.thumb-title {{ font: 700 16px/1.3 var(--body); }}
.thumb-text {{ font: 500 13px/1.3 var(--mono); color: var(--mute); }}
.note {{ font-size: 15px; color: var(--mute); border-left: 3px solid var(--sun); padding-left: 12px; max-width: 66ch; }}
.steps {{ counter-reset: s; list-style: none; padding: 0; }}
.steps li {{ counter-increment: s; position: relative; padding-left: 34px; }}
.steps li::before {{ content: counter(s); position: absolute; left: 0; top: 1px; width: 24px; height: 24px; border-radius: 50%; background: var(--chip); color: var(--chip-ink); font: 600 13px/24px var(--mono); text-align: center; }}
footer {{ margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--line); font-size: 14px; color: var(--mute); display: grid; gap: 6px; }}
@media (prefers-reduced-motion: no-preference) {{ html {{ scroll-behavior: smooth; }} }}
</style>
<div class="wrap">
<header class="top">
  <div class="eyebrow">CONTEXTO · Episodio 5 · kit de publicación</div>
  <h1>Tu reloj <span class="err">está mal</span></h1>
  <div class="flap">
    <div class="flap-digits" aria-label="07:30"><span>0</span><span>7</span><span class="colon">:</span><span>3</span><span>0</span></div>
    <div class="zones">Usamos <b>UTC−3</b> (la hora de Brasilia).<br>Por geografía nos toca <i>UTC−4</i>, y a la cordillera <i>UTC−5</i>.</div>
  </div>
  <p class="lede">Todo para subir el video largo y los tres cortos verticales: archivos en Drive, títulos y miniaturas para la prueba A/B de YouTube, textos listos para pegar en Shorts, Reels y TikTok, portadas y calendario.</p>
</header>
<nav class="sections" aria-label="Secciones">
  <a href="#archivos">Archivos</a><a href="#calendario">Calendario</a><a href="#youtube">YouTube</a><a href="#shorts">Shorts</a><a href="#reels">Reels</a><a href="#tiktok">TikTok</a><a href="#portadas">Portadas</a>
</nav>

<section id="archivos">
  <h2>Archivos<small>Google Drive · CONTEXTO / Ep5 · Tu reloj está mal</small></h2>
  <div class="files">{file_cards}</div>
  <p class="note">Los tres cortos tienen el mismo cuerpo y cambian el cierre: el Short manda a «Video relacionado», el Reel dice «el link está en la bio» y el TikTok dice «buscá CONTEXTO en YouTube». Subtítulos incrustados, sonido a −14 LUFS.</p>
</section>

<section id="calendario">
  <h2>Calendario<small>Los cortos van después del video largo, porque lo enlazan</small></h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Pieza</th><th>Si el largo ya salió (jue 15/10)</th><th>Si todavía no salió</th></tr></thead>
    <tbody>
      <tr><td>Video largo · YouTube</td><td>listo</td><td class="time">vie 16/10 · 19:00</td></tr>
      <tr><td>Short · YouTube</td><td class="time">vie 16/10 · 13:00</td><td class="time">sáb 17/10 · 13:00</td></tr>
      <tr><td>Reel · Instagram</td><td class="time">vie 16/10 · 19:00</td><td class="time">sáb 17/10 · 19:00</td></tr>
      <tr><td>TikTok</td><td class="time">sáb 17/10 · 19:00</td><td class="time">dom 18/10 · 19:00</td></tr>
    </tbody>
  </table></div>
  <p class="note">El jueves 22/10 sale La paradoja de la carne, así que esta semana queda libre para los cortos.</p>
</section>

<section id="youtube">
  <h2>YouTube · video largo<small>4:40 · subí el master 4K de Drive</small></h2>
  <h3>Títulos para la prueba A/B</h3>
  {copy(titles_yt[0], "Título A · la acusación")}
  {copy(titles_yt[1], "Título B · el dato")}
  {copy(titles_yt[2], "Título C · la escena")}
  <h3>Miniaturas para la prueba A/B (prompts para GPT Image 2.1)</h3>
  <p>Pedí 3 o 4 variantes de cada una, revisá los acentos letra por letra (ESTÁ, ¿, −4) y exportá en 1280×720 JPG de menos de 2 MB. Si el logo sale mal, pegá encima <code>video/public/brand/logo_transparente.png</code>.</p>
  {"".join(f'<div class="thumb"><div class="thumb-head"><span class="badge">{l}</span><span class="thumb-title">{html.escape(t)}</span><span class="thumb-text">{html.escape(tx)}</span></div>{copy(p, None, True)}</div>' for l, t, tx, p in thumbs)}
  <h3>Cómo cargar la prueba</h3>
  <ol class="steps">
    <li>En YouTube Studio, abrí el video y, en Miniatura, elegí <b>Probar y comparar</b>.</li>
    <li>Subí las miniaturas A, B y C. Si tu canal ya tiene la prueba de títulos, cargá también los títulos A, B y C, emparejados con su miniatura.</li>
    <li>Si solo te deja probar miniaturas, usá el título A en las tres.</li>
    <li>Dejala correr al menos 7 días o hasta que YouTube marque un ganador: elige por tiempo de reproducción, no por clics.</li>
    <li>Anotá qué ganó: si la A, funciona la acusación; si la B, el dato; si la C, la escena. Sirve para las próximas miniaturas.</li>
  </ol>
  <h3>Descripción</h3>
  {copy(DESC, "Pegala entera", True)}
  <h3>Etiquetas</h3>
  {copy(TAGS)}
  <h3>Comentario para fijar</h3>
  {copy("¿Qué preferís: luz a la mañana o luz a la tarde? ☀️ Respondé A (mañana) o B (tarde) 👇")}
  <h3>Configuración</h3>
  <ul>
    <li><b>Subtítulos:</b> subí <code>tu_reloj_esta_mal_subtitulos_es.srt</code> (Español, con sincronización).</li>
    <li><b>Pantalla final</b> desde <b>4:27</b>: dos recuadros a la derecha con «Súper Niño» arriba y «El robo del siglo» abajo, y Suscribirse sobre el logo.</li>
    <li><b>Tarjeta</b> en <b>3:41</b>: encuesta «¿Qué preferís? Luz a la mañana / Luz a la tarde».</li>
    <li>No es contenido para niños, categoría Educación, idioma Español (Latinoamérica), contenido alterado o sintético: Sí (voz IA).</li>
  </ul>
</section>

<section id="shorts">
  <h2>YouTube Shorts<small>tu_reloj_esta_mal_short_youtube.mp4 · 1:15</small></h2>
  <p class="note">Los Shorts no tienen prueba A/B de portada: elegí uno de los tres títulos. Lo que no puede faltar es el <b>Video relacionado</b> apuntando al video largo, porque el cierre dice «tocá el enlace de acá abajo».</p>
  {copy(B[0], "Título 1")}
  {copy(B[1], "Título 2")}
  {copy(B[2], "Título 3")}
  <h3>Descripción</h3>
  {copy(B[3])}
  <h3>Comentario para fijar</h3>
  {copy(B[4])}
  <ul>
    <li><b>Portada:</b> en la app de YouTube, tocá Portada y elegí el cuadro de <b>0:24</b>, con el título TU RELOJ ESTÁ MAL y los relojes girando.</li>
    <li>Contenido alterado o sintético: Sí. No es para niños. La música es original: no hace falta audio de la biblioteca.</li>
  </ul>
</section>

<section id="reels">
  <h2>Reels de Instagram<small>tu_reloj_esta_mal_reel_instagram.mp4 · 1:16</small></h2>
  <p class="note">Antes de publicar, poné el link del video de YouTube en la bio (Editar perfil → Enlaces): el Reel lo pide al final.</p>
  <h3>Texto</h3>
  {copy(B[5], None, True)}
  <h3>Comentario para fijar</h3>
  {copy(B[6])}
  <ul>
    <li><b>Portada:</b> la portada vertical 1 (abajo) o el cuadro de 0:24. Revisá el recorte 3:4 del perfil: tiene que leerse TU RELOJ ESTÁ MAL entero.</li>
    <li><b>Audio:</b> renombrá el audio original como «Tu reloj está mal · CONTEXTO».</li>
    <li>Dejá activado <b>Compartir en el feed</b> y activá la <b>etiqueta de IA</b> (voz generada por IA). Ubicación: Argentina.</li>
    <li><b>Reels de prueba</b> (opcional): primero se muestra a gente que no te sigue. Sirve para probar el gancho antes de mostrárselo a tus seguidores.</li>
  </ul>
</section>

<section id="tiktok">
  <h2>TikTok<small>tu_reloj_esta_mal_tiktok.mp4 · 1:16</small></h2>
  <h3>Texto</h3>
  {copy(B[7])}
  <h3>Comentario para fijar</h3>
  {copy(B[8])}
  <ul>
    <li><b>Portada:</b> elegí el cuadro de <b>0:24</b> y agregá el texto «TU RELOJ ESTÁ MAL» con el editor de portada. Si tu cuenta te deja subir una imagen, usá la portada vertical 1.</li>
    <li>Activá <b>Contenido generado por IA</b> (voz) y permití Dúo y Stitch.</li>
    <li>Si tu cuenta ya puede poner un enlace en la bio, poné el del canal de YouTube.</li>
  </ul>
</section>

<section id="portadas">
  <h2>Portadas verticales<small>Prompts para GPT Image 2.1 · 1080×1920</small></h2>
  <p>Lo importante va entre el 12 % y el 80 % de la altura: Instagram recorta la portada en 3:4 en el perfil y las tres aplicaciones tapan la parte de abajo.</p>
  <div class="thumb"><div class="thumb-head"><span class="badge">1</span><span class="thumb-title">Tu reloj está mal</span><span class="thumb-text">Reels y TikTok</span></div>{copy(B[9], None, True)}</div>
  <div class="thumb"><div class="thumb-head"><span class="badge">2</span><span class="thumb-title">¿Y es de noche?</span><span class="thumb-text">alternativa</span></div>{copy(B[10], None, True)}</div>
</section>

<footer>
  <span>Carpeta de Drive: <a href="{FOLDER}" target="_blank" rel="noopener">CONTEXTO / Ep5 · Tu reloj está mal</a></span>
  <span>En el repo: <code>entrega/tu_reloj_esta_mal_cortos_publicacion.md</code>, <code>tu_reloj_esta_mal_ab_miniaturas.md</code> y <code>tu_reloj_esta_mal_descripcion_youtube.md</code>.</span>
</footer>
</div>
<script>
document.addEventListener('click', async (e) => {{
  const b = e.target.closest('button[data-copy]');
  if (!b) return;
  const pre = document.getElementById(b.dataset.copy);
  try {{
    await navigator.clipboard.writeText(pre.innerText);
    b.textContent = 'Copiado';
  }} catch (err) {{
    const r = document.createRange(); r.selectNodeContents(pre);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    b.textContent = 'Seleccionado';
  }}
  setTimeout(() => {{ b.textContent = 'Copiar'; }}, 1800);
}});
</script>
"""
open(OUT, "w").write(page)
print(OUT, len(page), "bytes,", n, "bloques para copiar")
