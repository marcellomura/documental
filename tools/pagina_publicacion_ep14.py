"""Arma la página de publicación de "CAMPO DEL CIELO" (video largo y short) a partir de los .md de entrega/, para que la
página y el repo digan exactamente lo mismo.
Uso: python3 tools/pagina_publicacion_ep14.py ids.json previas/ salida.html
  ids.json: IDs de Drive de la carpeta ("folder") y de master, short y srt
  previas/: m01..m09.jpg (cuadros del video largo) y s01..s06.jpg (cuadros del short), que van embebidos en la página"""
import base64, html, json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "entrega")
ids = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {}
PREV = sys.argv[2] if len(sys.argv) > 2 else "previas"
OUT = sys.argv[3] if len(sys.argv) > 3 else "campo_del_cielo_kit.html"

desc = open(f"{ROOT}/campo_del_cielo_descripcion_youtube.md").read()
ab = open(f"{ROOT}/campo_del_cielo_ab_miniaturas.md").read()
short = open(f"{ROOT}/campo_del_cielo_short_publicacion.md").read()

TITLES = re.findall(r"^\d\. \*\*(.+?)\*\*$", desc.split("## Títulos sugeridos")[1].split("##")[0], re.M)
DESC = desc.split("## Descripción (copiá desde acá)")[1].split("## Etiquetas")[0].strip()
TAGS = desc.split("## Etiquetas")[1].split("##")[0].strip()
PIN = re.findall(r"```\n(.*?)```", desc.split("### Comentario fijado sugerido")[1], re.S)[0]
CHAPTERS = re.findall(r"^(\d+:\d\d) (.+)$", DESC, re.M)
PROMPTS = re.findall(r"```\n(.*?)```", ab, re.S)
S = re.findall(r"```\n(.*?)```", short, re.S)  # comentario fijado, título, descripción
S_ALT = re.findall(r"^- `(.+?)`$", short.split("Alternativas:")[1].split("##")[0], re.M)
TT_TEXT = re.search(r"\*\*Texto:\*\* `(.+?)`", short).group(1)
TT_PIN = re.search(r"\*\*Comentario fijado:\*\* `(.+?)`", short).group(1)
assert len(TITLES) == 3 and len(PROMPTS) == 3 and len(S) == 3 and len(S_ALT) == 2 and len(CHAPTERS) == 9

FOLDER = f"https://drive.google.com/drive/folders/{ids['folder']}" if ids.get("folder") else "https://drive.google.com/drive/my-drive"
def drive(key):
    return f"https://drive.google.com/file/d/{ids[key]}/view" if ids.get(key) else FOLDER

n = 0
def copy(text, label=None, tall=False):
    global n
    n += 1
    lab = f'<span class="copy-label">{html.escape(label)}</span>' if label else ""
    return (f'<div class="copy">{lab}<button type="button" class="copy-btn" data-copy="c{n}">Copiar</button>'
            f'<pre id="c{n}" class="{"tall" if tall else ""}">{html.escape(text.strip())}</pre></div>')

def img(path):
    return "data:image/jpeg;base64," + base64.b64encode(open(path, "rb").read()).decode()

# un cuadro por capítulo, con el minuto real del cuadro
MASTER = json.load(open(f"{PREV}/cuadros.json"))  # [["0:16", 0], ...]: minuto del cuadro e índice del capítulo
assert len(MASTER) == 9
master_figs = "".join(
    f'<figure class="frame"><img src="{img(f"{PREV}/m{i + 1:02d}.jpg")}" alt="{html.escape(CHAPTERS[c][1])}, en el minuto {t}" loading="lazy" width="640" height="360">'
    f'<figcaption><span class="tc">{t}</span>{html.escape(CHAPTERS[c][1])}</figcaption></figure>'
    for i, (t, c) in enumerate(MASTER))
SHORT = json.load(open(f"{PREV}/cuadros_short.json"))  # [["0:05", "La mesa en el monte"], ...]
assert len(SHORT) == 6
short_figs = "".join(
    f'<figure class="frame tall"><img src="{img(f"{PREV}/s{i + 1:02d}.jpg")}" alt="{html.escape(c)}, en el segundo {t}" loading="lazy" width="360" height="640">'
    f'<figcaption><span class="tc">{t}</span>{html.escape(c)}</figcaption></figure>'
    for i, (t, c) in enumerate(SHORT))

ENT = os.path.dirname(ROOT)
def size(path):
    try:
        b = os.path.getsize(os.path.join(ENT, path))
    except OSError:
        return ""
    return f" · {b / 1e9:.2f} GB".replace(".", ",") if b > 1e9 else f" · {b / 1e6:.0f} MB"
srt_lines = len(re.findall(r"^\d+$", open(f"{ROOT}/campo_del_cielo_subtitulos_es.srt").read(), re.M))
files = [
    ("Video largo", "campo_del_cielo_1440p.mp4", "2560×1440 · 6:58" + size("video/out/campo_del_cielo_1440p.mp4"), "master", "YouTube"),
    ("Short", "campo_del_cielo_short.mp4", "1080×1920 · 1:16" + size("entrega/campo_del_cielo_short.mp4"), "short", "Shorts y TikTok"),
    ("Subtítulos", "campo_del_cielo_subtitulos_es.srt", f"Español · {srt_lines} líneas", "srt", "YouTube"),
]
file_cards = "".join(
    f'<a class="file" href="{drive(k)}" target="_blank" rel="noopener"><span class="file-kind">{p}</span>'
    f'<span class="file-name">{t}</span><span class="file-path">{f}</span><span class="file-meta">{m}</span><span class="file-go">Abrir en Drive ↗</span></a>'
    for t, f, m, k, p in files)

thumbs = [("1", "Cayó del cielo", "CAYÓ DEL CIELO", "la imagen imposible"), ("2", "Perdida desde 1783", "PERDIDA DESDE 1783", "el misterio sin resolver"), ("3", "La volaron", "LA VOLARON CON PÓLVORA", "la acción")]
thumb_cards = "".join(
    f'<div class="thumb"><div class="thumb-head"><span class="badge">{l}</span><span class="thumb-title">{html.escape(t)}</span>'
    f'<span class="thumb-text">Texto: {html.escape(tx)} · gancho: {g}</span></div>{copy(PROMPTS[i], None, True)}</div>'
    for i, (l, t, tx, g) in enumerate(thumbs))

# la cinta de los años del episodio: la escala es la del video (los siglos se comprimen) y 1783 queda marcado como la
# última vez que alguien vio la mesa
YEARS = [("hace 4.000 años", 0.0, "la caída"), ("1576", 0.2, "Mexía"), ("1774", 0.34, "la plata"), ("1783", 0.42, "última vez vista"),
         ("1803", 0.5, "otro bloque"), ("1816", 0.57, "las pistolas"), ("1990", 0.8, "la grúa"), ("2016", 0.91, "Gancedo"), ("hoy", 1.0, "")]
X0, X1 = 14, 706
ribbon = '<line x1="{0}" y1="40" x2="{1}" y2="40" class="rb-line" />'.format(X0, X1)
for i, (y, f, lab) in enumerate(YEARS):
    x = X0 + f * (X1 - X0)
    key = y == "1783"
    anchor = "start" if i == 0 else "end" if i == len(YEARS) - 1 else "middle"
    ribbon += (f'<circle cx="{x:.1f}" cy="40" r="{7 if key else 3.5}" class="{"rb-key" if key else "rb-dot"}" />'
               f'<text x="{x:.1f}" y="{22 if i % 2 == 0 else 66}" text-anchor="{anchor}" class="{"rb-year rb-on" if key else "rb-year"}">{html.escape(y)}</text>')
    if key:
        ribbon += f'<text x="{x:.1f}" y="88" text-anchor="middle" class="rb-note">{html.escape(lab.upper())}</text>'

page = f"""<title>Kit Campo del Cielo</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Archivo:wdth,wght@75..100,400..800&family=JetBrains+Mono:wght@400;500;600&display=swap">
<style>
/* Carta celeste: una columna de lectura (máx. 880 px) con barra de secciones fija. Oscuro por defecto como el cielo del
   episodio (noche austral, hierro y brasa); claro como una carta astronómica impresa (papel azulado y tinta azul noche).
   La brasa es el único acento; la cinta de años de la cabecera es la del video. */
:root {{
  --bg: #05070F; --panel: #0B1020; --panel-2: #121A30; --ink: #ECE6D8; --mute: #9298AE; --line: rgba(170,185,235,0.15);
  --ember: #FF7A2E; --ember-ink: #1A0C04; --star: #A9BCFF; --key-ring: rgba(255,122,46,0.28);
  --display: 'Fraunces', 'Iowan Old Style', Georgia, 'Times New Roman', serif; --body: 'Archivo', 'Helvetica Neue', Arial, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
  color-scheme: dark;
}}
@media (prefers-color-scheme: light) {{ :root:not([data-theme="dark"]) {{
  --bg: #E9EDF5; --panel: #F6F8FC; --panel-2: #DCE3EF; --ink: #0E1630; --mute: #4D5672; --line: rgba(14,22,48,0.15);
  --ember: #B33A0B; --ember-ink: #FFF4EC; --star: #2B4590; --key-ring: rgba(179,58,11,0.2); color-scheme: light; }} }}
:root[data-theme="light"] {{
  --bg: #E9EDF5; --panel: #F6F8FC; --panel-2: #DCE3EF; --ink: #0E1630; --mute: #4D5672; --line: rgba(14,22,48,0.15);
  --ember: #B33A0B; --ember-ink: #FFF4EC; --star: #2B4590; --key-ring: rgba(179,58,11,0.2); color-scheme: light; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--ink); font: 400 16px/1.6 var(--body); font-stretch: 92%; }}
.wrap {{ max-width: 880px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 80px; }}
body::before {{ content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }}
header.top {{ display: grid; gap: 18px; padding-block: 10px 26px; border-bottom: 1px solid var(--line); }}
.eyebrow {{ font: 600 12px/1.3 var(--mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--mute); }}
h1 {{ font: 700 clamp(46px, 11vw, 92px)/0.92 var(--display); font-variation-settings: 'opsz' 144; letter-spacing: -0.03em; margin: 0; text-wrap: balance; }}
h1 em {{ font-style: italic; font-weight: 400; color: var(--ember); }}
.sub {{ font: 400 italic clamp(21px, 4vw, 28px)/1.25 var(--display); color: var(--mute); margin: 0; max-width: 34ch; }}
.ribbon {{ overflow-x: auto; }}
.ribbon svg {{ display: block; width: 100%; min-width: 560px; height: auto; }}
.rb-line {{ stroke: var(--line); stroke-width: 2; }}
.rb-dot {{ fill: var(--star); }}
.rb-key {{ fill: var(--ember); stroke: var(--key-ring); stroke-width: 8; }}
.rb-year {{ font: 500 12px var(--mono); fill: var(--mute); }}
.rb-year.rb-on {{ font-weight: 600; fill: var(--ember); }}
.rb-note {{ font: 600 10px var(--mono); letter-spacing: 0.14em; fill: var(--ember); }}
.lede {{ margin: 0; max-width: 64ch; color: var(--mute); }}
nav.sections {{ position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); display: flex; gap: 6px; overflow-x: auto; padding-block: 10px; scrollbar-width: none; }}
nav.sections a {{ flex: none; font: 600 13px/1 var(--body); color: var(--ink); text-decoration: none; padding: 9px 12px; border-radius: 999px; border: 1px solid var(--line); }}
nav.sections a:hover, nav.sections a:focus-visible {{ border-color: var(--ember); color: var(--ember); outline: none; }}
section {{ padding-block: 34px 6px; scroll-margin-top: 64px; display: grid; gap: 16px; }}
section > *, header.top > * {{ min-width: 0; }}
h2 {{ font: 650 clamp(30px, 5.6vw, 42px)/1.04 var(--display); font-variation-settings: 'opsz' 96; letter-spacing: -0.02em; margin: 0; text-wrap: balance; }}
h2 small {{ display: block; font: 600 12px/1.4 var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); margin-top: 8px; }}
h3 {{ font: 700 17px/1.3 var(--body); margin: 14px 0 0; }}
p {{ margin: 0; max-width: 66ch; }}
ul, ol {{ margin: 0; padding-left: 1.2em; display: grid; gap: 6px; max-width: 66ch; }}
a {{ color: var(--ember); }}
code {{ font: 500 0.86em/1 var(--mono); }}
.files {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }}
.file {{ display: grid; gap: 4px; align-content: start; padding: 14px; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); color: var(--ink); text-decoration: none; min-width: 0; }}
.file:hover, .file:focus-visible {{ border-color: var(--ember); outline: none; }}
.file-kind {{ font: 600 11px/1.2 var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); }}
.file-name {{ font: 650 25px/1.1 var(--display); letter-spacing: -0.01em; }}
.file-path {{ font: 500 12px/1.4 var(--mono); color: var(--mute); overflow-wrap: anywhere; }}
.file-meta {{ font: 500 13px/1.3 var(--mono); color: var(--ink); font-variant-numeric: tabular-nums; }}
.file-go {{ font: 600 13px/1.3 var(--body); color: var(--ember); margin-top: 4px; }}
.frames {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }}
.frames.vertical {{ grid-template-columns: repeat(6, minmax(0, 1fr)); }}
.frame {{ margin: 0; display: grid; gap: 6px; min-width: 0; }}
.frame img {{ display: block; width: 100%; max-width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 6px; border: 1px solid var(--line); background: var(--panel-2); }}
.frame.tall img {{ aspect-ratio: 9 / 16; }}
.frame figcaption {{ font: 500 13px/1.35 var(--body); color: var(--mute); }}
.tc {{ font: 600 12px/1 var(--mono); color: var(--ink); font-variant-numeric: tabular-nums; margin-right: 8px; }}
.table-wrap {{ overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); }}
table {{ border-collapse: collapse; width: 100%; min-width: 480px; font-size: 15px; }}
th, td {{ text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }}
th {{ font: 600 12px/1.3 var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--mute); }}
tr:last-child td {{ border-bottom: 0; }}
td.time {{ font: 600 14px/1.4 var(--mono); font-variant-numeric: tabular-nums; white-space: nowrap; }}
.copy {{ position: relative; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); min-width: 0; }}
.copy-label {{ display: block; padding: 10px 92px 0 14px; font: 600 12px/1.3 var(--mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--mute); }}
.copy pre {{ margin: 0; padding: 12px 92px 14px 14px; white-space: pre-wrap; word-break: break-word; font: 400 15px/1.55 var(--body); color: var(--ink); }}
.copy pre.tall {{ max-height: 340px; overflow-y: auto; }}
.copy-btn {{ position: absolute; top: 8px; right: 8px; font: 600 13px/1 var(--body); padding: 9px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel-2); color: var(--ink); cursor: pointer; }}
.copy-btn:hover, .copy-btn:focus-visible {{ border-color: var(--ember); color: var(--ember); outline: none; }}
.thumb {{ display: grid; gap: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel-2); }}
.thumb-head {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px; }}
.badge {{ font: 600 16px/1 var(--mono); background: var(--ember); color: var(--ember-ink); border-radius: 6px; padding: 6px 9px; }}
.thumb-title {{ font: 700 16px/1.3 var(--body); }}
.thumb-text {{ font: 500 13px/1.3 var(--mono); color: var(--mute); }}
.note {{ font-size: 15px; color: var(--mute); border-left: 3px solid var(--star); padding-left: 12px; max-width: 66ch; }}
.note.alert {{ border-left-color: var(--ember); color: var(--ink); }}
.steps {{ counter-reset: s; list-style: none; padding: 0; }}
.steps li {{ counter-increment: s; position: relative; padding-left: 34px; }}
.steps li::before {{ content: counter(s); position: absolute; left: 0; top: 1px; width: 24px; height: 24px; border-radius: 50%; background: var(--ember); color: var(--ember-ink); font: 600 13px/24px var(--mono); text-align: center; }}
footer {{ margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--line); font-size: 14px; color: var(--mute); display: grid; gap: 6px; }}
@media (max-width: 620px) {{ .frames {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} .frames.vertical {{ grid-template-columns: repeat(3, minmax(0, 1fr)); }} }}
@media (prefers-reduced-motion: no-preference) {{ html {{ scroll-behavior: smooth; }} }}
</style>
<div class="wrap">
<header class="top">
  <div class="eyebrow">CONTEXTO · Episodio 14 · kit de publicación</div>
  <h1>Campo del <em>Cielo</em></h1>
  <p class="sub">La mesa de hierro que nadie encuentra hace más de 240 años.</p>
  <div class="ribbon"><svg viewBox="0 0 720 96" role="img" aria-label="Cinta de años del episodio: la caída hace 4.000 años, 1576, 1774, 1783 (la última vez que alguien vio la mesa), 1803, 1816, 1990, 2016 y hoy">{ribbon}</svg></div>
  <p class="lede">Todo para subir el video largo y el short: los archivos en Drive, un cuadro por capítulo, títulos y miniaturas para la prueba A/B, la descripción con capítulos y fuentes, la configuración y los textos del short para YouTube y TikTok.</p>
</header>
<nav class="sections" aria-label="Secciones">
  <a href="#archivos">Archivos</a><a href="#vista">Vista previa</a><a href="#calendario">Calendario</a><a href="#youtube">YouTube</a><a href="#miniaturas">Miniaturas</a><a href="#short">Short</a><a href="#tiktok">TikTok</a><a href="#cuidados">Cuidados</a>
</nav>

<section id="archivos">
  <h2>Archivos<small>Google Drive · CONTEXTO / Ep14 · Campo del Cielo</small></h2>
  <div class="files">{file_cards}</div>
  <p class="note">Video largo a −14 LUFS en 1440p: YouTube le da el códec de alta calidad. El short tiene los subtítulos incrustados y es el mismo archivo para YouTube Shorts y TikTok. En la carpeta también están la descripción, las miniaturas y el instructivo del short en <code>.txt</code>.</p>
</section>

<section id="vista">
  <h2>Vista previa<small>Un cuadro por capítulo, sacado del archivo final</small></h2>
  <div class="frames">{master_figs}</div>
  <h3>Short · 1:16</h3>
  <div class="frames vertical">{short_figs}</div>
</section>

<section id="calendario">
  <h2>Calendario<small>El short sale después, cuando el video ya es público, porque lo enlaza</small></h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Pieza</th><th>Dónde</th><th>Cuándo</th></tr></thead>
    <tbody>
      <tr><td>Video largo</td><td>YouTube</td><td class="time">jue 3/12 · 19:00</td></tr>
      <tr><td>Short</td><td>YouTube Shorts</td><td class="time">sáb 5/12 · 13:00</td></tr>
      <tr><td>Short (mismo archivo)</td><td>TikTok</td><td class="time">sáb 5/12 · 19:00</td></tr>
    </tbody>
  </table></div>
  <p class="note">Es una historia que no depende de la actualidad: se puede adelantar o atrasar sin tocar nada. Va la semana siguiente a «El lote 31.202» (jueves 26/11).</p>
</section>

<section id="youtube">
  <h2>YouTube · video largo<small>6:58 · subí el master 1440p de Drive</small></h2>
  <h3>Títulos para la prueba A/B</h3>
  {copy(TITLES[0], "Título 1 · cayó del cielo")}
  {copy(TITLES[1], "Título 2 · el meteorito perdido")}
  {copy(TITLES[2], "Título 3 · la voladura")}
  <h3>Descripción</h3>
  {copy(DESC, "Pegala entera, con capítulos, fuentes y créditos", True)}
  <h3>Etiquetas</h3>
  {copy(TAGS)}
  <h3>Comentario para fijar</h3>
  {copy(PIN)}
  <h3>Configuración</h3>
  <ul>
    <li><b>Subtítulos:</b> subí <code>campo_del_cielo_subtitulos_es.srt</code> (Subtítulos → Agregar idioma: Español → Subir archivo → Con sincronización).</li>
    <li><b>Pantalla final</b> desde <b>6:49</b>: en los dos recuadros de «SEGUÍ MIRANDO», <b>Video → «El lote 31.202»</b> (o el más visto del canal) arriba y <b>Lista → la del canal</b> abajo; <b>Suscribirse</b> sobre el logo CONTEXTO.</li>
    <li><b>Tarjeta</b> en <b>6:29</b>, cuando el video hace la pregunta: encuesta «Si aparece el Mesón de Fierro, ¿de quién es? Del que lo encuentra / Del Estado / De los pueblos originarios».</li>
    <li><b>Contenido alterado o sintético: Sí.</b> Además de la voz, las masas de hierro en 3D, la explosión, los documentos y los mapas antiguos son recreaciones.</li>
    <li>No es contenido para niños, sin restricción de edad, categoría Educación, idioma Español (Latinoamérica). Lista «CONTEXTO · Argentina explicada».</li>
  </ul>
</section>

<section id="miniaturas">
  <h2>Miniaturas A/B<small>Prompts para GPT Image 2.1 · 1280×720 JPG, menos de 2 MB</small></h2>
  <p>Pedí 3 o 4 variantes de cada una y revisá números y acentos letra por letra: CAYÓ, PÓLVORA, 1783. La mesa tiene que parecer un meteorito de verdad: una losa chata de hierro oscuro con óxido y huecos ovalados, como El Chaco; nada de lava ni de roca gris. Si el logo sale mal, pegá encima <code>video/public/brand/logo_transparente.png</code>.</p>
  {thumb_cards}
  <h3>Cómo cargar la prueba</h3>
  <ol class="steps">
    <li>En YouTube Studio, abrí el video y, en Miniatura, elegí <b>Probar y comparar</b>.</li>
    <li>Subí las miniaturas 1, 2 y 3. Si tu canal ya tiene la prueba de títulos, emparejá cada una con su título.</li>
    <li>Si solo te deja probar miniaturas, usá el título 1 en las tres.</li>
    <li>Dejala correr al menos 7 días o hasta que YouTube marque una ganadora: elige por tiempo de reproducción, no por clics.</li>
    <li>Anotá cuál ganó. Si gana la 1, funciona la imagen imposible; si la 2, el misterio sin resolver; si la 3, la acción.</li>
  </ol>
</section>

<section id="short">
  <h2>YouTube Shorts<small>campo_del_cielo_short.mp4 · 1:16 · sáb 5/12, 13:00</small></h2>
  <p class="note alert">El short <b>tiene</b> que enlazar al video largo: el cierre dice «tocá el enlace de acá abajo» y aparece una flecha. Publicá primero el video largo y, al subir el short, elegilo en <b>Video relacionado</b>.</p>
  <h3>Título</h3>
  {copy(S[1], "Título")}
  {copy(S_ALT[0], "Alternativa 1")}
  {copy(S_ALT[1], "Alternativa 2")}
  <h3>Descripción</h3>
  {copy(S[2], None, True)}
  <h3>Comentario para fijar</h3>
  {copy(S[0])}
  <ul>
    <li>Contenido alterado o sintético: <b>Sí</b> (voz sintética y recreaciones en 3D). No es para niños.</li>
    <li>La música es original de ElevenLabs: no hace falta sumar audio de la biblioteca de Shorts.</li>
  </ul>
</section>

<section id="tiktok">
  <h2>TikTok<small>El mismo archivo del short</small></h2>
  <p class="note">En TikTok no hay «video relacionado»: el texto del posteo reemplaza el «tocá el enlace de acá abajo».</p>
  <h3>Texto</h3>
  {copy(TT_TEXT)}
  <h3>Comentario para fijar</h3>
  {copy(TT_PIN)}
  <ul>
    <li>Activá <b>Contenido generado por IA</b> (voz sintética).</li>
    <li>Si tu cuenta ya puede poner un enlace en la bio, poné el del canal de YouTube.</li>
  </ul>
</section>

<section id="cuidados">
  <h2>Cuidados<small>Historia real, con personas y comunidades reales</small></h2>
  <ul>
    <li><b>Los detenidos de 1990</b> fueron procesados y la causa quedó en nada: no fijes comentarios que los traten de condenados.</li>
    <li><b>Pueblos originarios.</b> El video no les atribuye leyendas sin fuente: dice que el lugar es central para la cosmovisión moqoit y que se opusieron al traslado de 2012. Borrá los comentarios racistas.</li>
    <li><b>«Yo sé dónde está».</b> Van a aparecer. Si alguien da coordenadas, no las fijes: sacar meteoritos del Chaco es ilegal.</li>
    <li><b>Las pistolas.</b> Que sean de hierro del cielo es un misterio abierto, y el video lo dice. La pistola que se ve es ilustrativa: no es la del museo de Virginia.</li>
  </ul>
</section>

<footer>
  <span>Carpeta de Drive: <a href="{FOLDER}" target="_blank" rel="noopener">CONTEXTO / Ep14 · Campo del Cielo</a></span>
  <span>En el repo: <code>entrega/campo_del_cielo_descripcion_youtube.md</code>, <code>campo_del_cielo_ab_miniaturas.md</code> y <code>campo_del_cielo_short_publicacion.md</code>.</span>
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
