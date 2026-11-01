"""Arma la página de publicación del ep15 (EL HOMBRE DE LAS MIL CARAS) a partir de los .md de entrega/, para que la
página y el repo digan exactamente lo mismo.
Uso: python3 tools/pagina_publicacion_ep15.py ids.json previas/ salida.html
  ids.json: IDs de Drive de la carpeta ("folder"), del largo ("largo"), del vertical ("vertical") y de los
            subtítulos ("srt", "srt_v")
  previas/: l01..l08.jpg (cuadros del largo, 16:9), v01..v06.jpg (del vertical, 9:16) y cuadros.json
            ({"l": [["0:10", "Castelli"], ...], "v": [...]}), que se embeben en la página"""
import base64, html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENT = os.path.join(ROOT, "entrega")
ids = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {}
PREV = sys.argv[2] if len(sys.argv) > 2 else "previas"
OUT = sys.argv[3] if len(sys.argv) > 3 else "el_hombre_de_las_mil_caras_kit.html"

def sec(md, title):
    return md.split(f"## {title}")[1].split("\n## ")[0]
blocks = lambda s: re.findall(r"```\n(.*?)```", s, re.S)
YT = open(f"{ENT}/el_hombre_de_las_mil_caras_descripcion_youtube.md").read()
VE = open(f"{ENT}/el_hombre_de_las_mil_caras_vertical_publicacion.md").read()
AB = open(f"{ENT}/el_hombre_de_las_mil_caras_ab_miniaturas.md").read()
TITLES = re.findall(r"^\d\. \*\*(.+?)\*\*$", sec(YT, "Títulos sugeridos (elegí uno)"), re.M)
DESC = sec(YT, "Descripción (copiá desde acá)").strip()
YT_PIN = blocks(sec(YT, "Comentario fijado"))[0]
TAGS = blocks(sec(YT, "Etiquetas"))[0]
IG_TEXT, IG_PIN = blocks(sec(VE, "Instagram (Reels)"))
TT_TEXT, TT_PIN = blocks(sec(VE, "TikTok"))
SH = blocks(sec(VE, "YouTube Shorts"))
FB_TEXT = blocks(sec(VE, "Facebook"))[0]
THUMBS = blocks(AB.split("## Portadas para el vertical")[0])
COVERS = blocks(AB.split("## Portadas para el vertical")[1])
assert len(TITLES) == 3 and len(THUMBS) == 3 and len(COVERS) == 3 and len(SH) == 2

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

FR = json.load(open(f"{PREV}/cuadros.json"))
frames_l = "".join(
    f'<figure class="frame wide"><img src="{img(f"{PREV}/l{i + 1:02d}.jpg")}" alt="{html.escape(c)}, en el minuto {t} del largo" loading="lazy" width="480" height="270">'
    f'<figcaption><span class="tc">{t}</span>{html.escape(c)}</figcaption></figure>' for i, (t, c) in enumerate(FR["l"]))
frames_v = "".join(
    f'<figure class="frame tall"><img src="{img(f"{PREV}/v{i + 1:02d}.jpg")}" alt="{html.escape(c)}, en el segundo {t} del vertical" loading="lazy" width="270" height="480">'
    f'<figcaption><span class="tc">{t}</span>{html.escape(c)}</figcaption></figure>' for i, (t, c) in enumerate(FR["v"]))

def size(path):
    try:
        b = os.path.getsize(path)
        return f" · {b / 1e9:.2f} GB" if b > 1e9 else f" · {b / 1e6:.0f} MB"
    except OSError:
        return ""
files = [
    ("Documental", "el_hombre_de_las_mil_caras_1440p.mp4", "2560×1440 · 9:22" + size(f"{ROOT}/video/out/el_hombre_de_las_mil_caras_1440p.mp4"), "largo", "YouTube"),
    ("Vertical", "el_hombre_de_las_mil_caras_vertical.mp4", "1080×1920 · 2:46" + size(f"{ENT}/el_hombre_de_las_mil_caras_vertical.mp4"), "vertical", "Reels · TikTok · Shorts · Facebook"),
    ("Subtítulos", "el_hombre_de_las_mil_caras_subtitulos_es.srt", "Español · para el largo", "srt", "YouTube"),
    ("Subtítulos", "el_hombre_de_las_mil_caras_vertical_subtitulos_es.srt", "Español · opcional", "srt_v", "Facebook"),
]
file_cards = "".join(
    f'<a class="file" href="{drive(k)}" target="_blank" rel="noopener"><span class="file-kind">{p}</span>'
    f'<span class="file-name">{t}</span><span class="file-path">{f}</span><span class="file-meta">{m}</span><span class="file-go">Abrir en Drive ↗</span></a>'
    for t, f, m, k, p in files)

# la cinta de los nombres y los años del caso
YEARS = [(1959, "nace en Posadas"), (1982, "quiebra"), (2004, "Paraguay"), (2005, "Nozzi"), (2009, "libre"), (2011, "Roseo"), (2013, "2.ª perpetua"), (2019, "Qaramta"), (2026, "Ezeiza")]
X0, X1 = 56, 664
ORD = {y: i for i, (y, _) in enumerate(YEARS)}
def xy(y): return X0 + ORD[y] / (len(YEARS) - 1) * (X1 - X0)   # en orden, no a escala: los años del medio se amontonan
rib = f'<line x1="{X0}" y1="52" x2="{X1}" y2="52" class="rb-line" />'
for i, (y, lab) in enumerate(YEARS):
    up = i % 2 == 0
    key = y in (2005, 2011)
    rib += (f'<circle cx="{xy(y):.1f}" cy="52" r="{6.5 if key else 4}" class="{"rb-key" if key else "rb-dot"}" />'
            f'<text x="{xy(y):.1f}" y="{32 if up else 80}" text-anchor="middle" class="rb-day">{y}</text>'
            f'<text x="{xy(y):.1f}" y="{18 if up else 96}" text-anchor="middle" class="rb-lab">{html.escape(lab.upper())}</text>')
NAMES = ["Luis Raúl Menocchio", "el Niño Raúl", "el Gusano", "Hugo Jara", "«Raúl»"]
names = "".join(f'<span class="alias{" real" if i == 0 else ""}">{html.escape(a)}</span>' for i, a in enumerate(NAMES))

thumbs = [("1", "Mil caras", "la cabeza que se desarma"), ("2", "250.000 hectáreas", "el monte desde el aire"), ("3", "Sin huellas", "la huella proyectada")]
covers = [("A", "El hombre de las mil caras", "la cabeza y los nombres"), ("B", "Sellados con cemento", "los dos tambores"), ("C", "Dijo llamarse Hugo Jara", "el yate en el Paraná")]
def cards(items, prompts):
    return "".join(
        f'<div class="cover"><div class="cover-head"><span class="badge">{l}</span><span class="cover-title">{html.escape(t)}</span>'
        f'<span class="cover-sub">{html.escape(s)}</span></div>{copy(prompts[i], None, True)}</div>' for i, (l, t, s) in enumerate(items))
titles = "".join(f"<li>{html.escape(t)}</li>" for t in TITLES)

page = f"""<title>El hombre de las mil caras</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;600;700&display=swap">
<style>
/* Expediente del ep15: casi negro, hueso y el rojo de los sellos judiciales; ámbar para lo que se toca. Claro como una
   hoja de expediente con tinta. Anton para los titulares (la del documental), Plex Mono para los datos. */
:root {{
  --bg: #07090B; --panel: #101418; --panel-2: #171D22; --ink: #EEE7D9; --mute: #A3A8AA; --line: rgba(238,231,217,0.14);
  --amber: #E9A55A; --amber-ink: #1A1206; --red: #E0473B; --steel: #8DB0C3;
  --display: 'Anton', 'Arial Narrow', Impact, sans-serif; --serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  --sans: 'Inter', -apple-system, 'Segoe UI', Arial, sans-serif; --mono: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace;
  color-scheme: dark;
}}
@media (prefers-color-scheme: light) {{ :root:not([data-theme="dark"]) {{
  --bg: #EFEBE2; --panel: #F8F5EE; --panel-2: #E4DED2; --ink: #16130F; --mute: #57534C; --line: rgba(22,19,15,0.15);
  --amber: #8F4A0E; --amber-ink: #FFF5E8; --red: #A3241B; --steel: #2C5A73; color-scheme: light; }} }}
:root[data-theme="light"] {{
  --bg: #EFEBE2; --panel: #F8F5EE; --panel-2: #E4DED2; --ink: #16130F; --mute: #57534C; --line: rgba(22,19,15,0.15);
  --amber: #8F4A0E; --amber-ink: #FFF5E8; --red: #A3241B; --steel: #2C5A73; color-scheme: light; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--ink); font: 400 16px/1.6 var(--sans); }}
.wrap {{ max-width: 920px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 80px; }}
body::before {{ content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }}
header.top {{ display: grid; gap: 16px; padding-block: 10px 26px; border-bottom: 1px solid var(--line); }}
.eyebrow {{ font: 600 12px/1.3 var(--mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--mute); }}
h1 {{ font: 400 clamp(52px, 12vw, 104px)/0.92 var(--display); text-transform: uppercase; letter-spacing: 0.005em; margin: 0; text-wrap: balance; }}
h1 em {{ font-style: normal; color: var(--red); }}
.sub {{ font: 400 italic clamp(22px, 4.4vw, 30px)/1.2 var(--serif); color: var(--mute); margin: 0; max-width: 40ch; }}
.aliases {{ display: flex; flex-wrap: wrap; gap: 8px; }}
.alias {{ font: 500 13px/1 var(--mono); letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 10px; border: 1px solid var(--line); border-radius: 4px; color: var(--mute); text-decoration: line-through; text-decoration-color: var(--red); }}
.alias.real {{ color: var(--ink); text-decoration: none; border-color: var(--red); }}
.ribbon {{ overflow-x: auto; }}
.ribbon svg {{ display: block; width: 100%; min-width: 600px; height: auto; }}
.rb-line {{ stroke: var(--line); stroke-width: 2; }}
.rb-dot {{ fill: var(--ink); }}
.rb-key {{ fill: var(--red); }}
.rb-day {{ font: 600 13px var(--mono); fill: var(--ink); font-variant-numeric: tabular-nums; }}
.rb-lab {{ font: 500 9.5px var(--mono); letter-spacing: 0.1em; fill: var(--mute); }}
.lede {{ margin: 0; max-width: 66ch; color: var(--mute); }}
nav.sections {{ position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); display: flex; gap: 6px; overflow-x: auto; padding-block: 10px; scrollbar-width: none; }}
nav.sections a {{ flex: none; font: 600 13px/1 var(--sans); color: var(--ink); text-decoration: none; padding: 9px 12px; border-radius: 999px; border: 1px solid var(--line); }}
nav.sections a:hover, nav.sections a:focus-visible {{ border-color: var(--amber); color: var(--amber); outline: none; }}
section {{ padding-block: 34px 6px; scroll-margin-top: 64px; display: grid; gap: 16px; }}
section > *, header.top > * {{ min-width: 0; }}
h2 {{ font: 400 clamp(34px, 6vw, 50px)/1 var(--display); text-transform: uppercase; margin: 0; text-wrap: balance; letter-spacing: 0.01em; }}
h2 small {{ display: block; font: 600 12px/1.4 var(--mono); letter-spacing: 0.14em; color: var(--mute); margin-top: 10px; text-transform: uppercase; }}
h3 {{ font: 700 17px/1.3 var(--sans); margin: 14px 0 0; }}
p {{ margin: 0; max-width: 66ch; }}
ul, ol {{ margin: 0; padding-left: 1.2em; display: grid; gap: 6px; max-width: 66ch; }}
a {{ color: var(--amber); }}
code {{ font: 500 0.86em/1 var(--mono); overflow-wrap: anywhere; }}
.files {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }}
.file {{ display: grid; gap: 4px; align-content: start; padding: 14px; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); color: var(--ink); text-decoration: none; min-width: 0; }}
.file:hover, .file:focus-visible {{ border-color: var(--amber); outline: none; }}
.file-kind {{ font: 600 11px/1.2 var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); }}
.file-name {{ font: 400 28px/1.05 var(--display); text-transform: uppercase; }}
.file-path {{ font: 500 12px/1.4 var(--mono); color: var(--mute); overflow-wrap: anywhere; }}
.file-meta {{ font: 500 13px/1.3 var(--mono); color: var(--ink); font-variant-numeric: tabular-nums; }}
.file-go {{ font: 600 13px/1.3 var(--sans); color: var(--amber); margin-top: 4px; }}
.frames {{ display: grid; gap: 12px; }}
.frames.l {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
.frames.v {{ grid-template-columns: repeat(6, minmax(0, 1fr)); }}
.frame {{ margin: 0; display: grid; gap: 6px; min-width: 0; align-content: start; }}
.frame img {{ display: block; width: 100%; max-width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--line); background: var(--panel-2); }}
.frame.wide img {{ aspect-ratio: 16 / 9; object-fit: cover; }}
.frame.tall img {{ aspect-ratio: 9 / 16; object-fit: cover; }}
.frame figcaption {{ font: 500 13px/1.35 var(--sans); color: var(--mute); }}
.tc {{ font: 600 12px/1 var(--mono); color: var(--ink); font-variant-numeric: tabular-nums; margin-right: 8px; }}
.table-wrap {{ overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); }}
table {{ border-collapse: collapse; width: 100%; min-width: 460px; font-size: 15px; }}
th, td {{ text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }}
th {{ font: 600 12px/1.3 var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--mute); }}
tr:last-child td {{ border-bottom: 0; }}
.copy {{ position: relative; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); min-width: 0; }}
.copy-label {{ display: block; padding: 10px 92px 0 14px; font: 600 12px/1.3 var(--mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--mute); }}
.copy pre {{ margin: 0; padding: 12px 92px 14px 14px; white-space: pre-wrap; word-break: break-word; font: 400 15px/1.55 var(--sans); color: var(--ink); }}
.copy pre.tall {{ max-height: 360px; overflow-y: auto; }}
.copy-btn {{ position: absolute; top: 8px; right: 8px; font: 600 13px/1 var(--sans); padding: 9px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel-2); color: var(--ink); cursor: pointer; }}
.copy-btn:hover, .copy-btn:focus-visible {{ border-color: var(--amber); color: var(--amber); outline: none; }}
.cover {{ display: grid; gap: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel-2); }}
.cover-head {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px; }}
.badge {{ font: 600 16px/1 var(--mono); background: var(--red); color: #FFF; border-radius: 4px; padding: 6px 9px; }}
.cover-title {{ font: 700 16px/1.3 var(--sans); }}
.cover-sub {{ font: 500 13px/1.3 var(--mono); color: var(--mute); }}
.note {{ font-size: 15px; color: var(--mute); border-left: 3px solid var(--steel); padding-left: 12px; max-width: 66ch; }}
.note.alert {{ border-left-color: var(--red); color: var(--ink); }}
.titles {{ list-style: none; padding: 0; display: grid; gap: 8px; }}
.titles li {{ font: 400 clamp(22px, 4vw, 28px)/1.15 var(--display); text-transform: uppercase; padding: 12px 14px; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); }}
.steps {{ counter-reset: s; list-style: none; padding: 0; }}
.steps li {{ counter-increment: s; position: relative; padding-left: 34px; }}
.steps li::before {{ content: counter(s); position: absolute; left: 0; top: 1px; width: 24px; height: 24px; border-radius: 50%; background: var(--amber); color: var(--amber-ink); font: 600 13px/24px var(--mono); text-align: center; }}
footer {{ margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--line); font-size: 14px; color: var(--mute); display: grid; gap: 6px; min-width: 0; }}
footer > span {{ min-width: 0; overflow-wrap: anywhere; }}
@media (max-width: 720px) {{ .frames.v {{ grid-template-columns: repeat(3, minmax(0, 1fr)); }} }}
@media (max-width: 520px) {{ .frames.l {{ grid-template-columns: minmax(0, 1fr); }} }}
@media (prefers-reduced-motion: no-preference) {{ html {{ scroll-behavior: smooth; }} }}
</style>
<div class="wrap">
<header class="top">
  <div class="eyebrow">CONTEXTO · Episodio 15 · documental + vertical</div>
  <h1>El hombre de las <em>mil</em> caras</h1>
  <p class="sub">El Gusano Menocchio y el crimen de La Fidelidad, el campo que hoy es el Parque Nacional El Impenetrable.</p>
  <div class="aliases" aria-label="Los nombres que usó">{names}</div>
  <div class="ribbon"><svg viewBox="0 0 720 104" role="img" aria-label="Cinta de años del caso: 1959 nace en Posadas, 1982 quiebra, 2004 Paraguay, 2005 Nozzi, 2009 libre, 2011 Roseo, 2013 segunda perpetua, 2019 Qaramta, 2026 Ezeiza">{rib}</svg></div>
  <p class="lede">Todo para publicar: los dos videos en Drive, cuadros de cada parte, los textos de YouTube y de cada red listos para copiar, los comentarios para fijar y los prompts de miniaturas y portadas para GPT Image 2.1.</p>
</header>
<nav class="sections" aria-label="Secciones">
  <a href="#archivos">Archivos</a><a href="#vista">Vista previa</a><a href="#orden">Orden</a><a href="#youtube">YouTube</a><a href="#vertical">Vertical</a><a href="#miniaturas">Miniaturas</a><a href="#portadas">Portadas</a><a href="#cuidados">Cuidados</a>
</nav>

<section id="archivos">
  <h2>Archivos<small>Google Drive · CONTEXTO / Ep15 · El hombre de las mil caras</small></h2>
  <div class="files">{file_cards}</div>
  <p class="note">Las dos mezclas están a −14 LUFS. El largo no trae subtítulos incrustados: subí el <code>.srt</code> en YouTube. El vertical sí los trae, palabra por palabra.</p>
</section>

<section id="vista">
  <h2>Vista previa<small>Cuadros sacados de los archivos finales</small></h2>
  <h3>Documental (9:22)</h3>
  <div class="frames l">{frames_l}</div>
  <h3>Vertical (2:46)</h3>
  <div class="frames v">{frames_v}</div>
</section>

<section id="orden">
  <h2>Orden de publicación<small>El vertical manda al largo</small></h2>
  <ol class="steps">
    <li><b>Primero el documental</b> en YouTube, con el <code>.srt</code>, los capítulos de la descripción y «Contenido alterado o sintético: Sí».</li>
    <li><b>Al día siguiente, el vertical</b> en Reels, TikTok, Shorts y Facebook, a la tarde (entre las 13 y las 19).</li>
    <li><b>En Shorts,</b> «Video relacionado» apuntando al documental. En Instagram y TikTok, el enlace en la bio y el comentario fijado.</li>
  </ol>
</section>

<section id="youtube">
  <h2>YouTube<small>Títulos, descripción, comentario y etiquetas</small></h2>
  <ul class="titles">{titles}</ul>
  {copy(DESC, "Descripción completa (con capítulos, datos, fuentes y créditos)", True)}
  {copy(YT_PIN, "Comentario para fijar")}
  {copy(TAGS, "Etiquetas")}
</section>

<section id="vertical">
  <h2>Vertical<small>El mismo archivo para las cuatro redes</small></h2>
  {copy(IG_TEXT, "Instagram · texto del Reel", True)}
  {copy(IG_PIN, "Instagram · comentario para fijar")}
  {copy(TT_TEXT, "TikTok · texto")}
  {copy(TT_PIN, "TikTok · comentario para fijar")}
  {copy(SH[0], "YouTube Shorts · título")}
  {copy(SH[1], "YouTube Shorts · descripción", True)}
  {copy(FB_TEXT, "Facebook · texto")}
</section>

<section id="miniaturas">
  <h2>Miniaturas<small>A/B testing en YouTube · prompts para GPT Image 2.1 · 1280×720</small></h2>
  <p class="note alert">La cabeza es un maniquí sin rasgos de nadie real. Sin fotos de las personas del caso, sin sangre, sin logos de Netflix ni de Interpol. Revisá los acentos letra por letra.</p>
  {cards(thumbs, THUMBS)}
</section>

<section id="portadas">
  <h2>Portadas<small>Para el vertical · 1080×1920</small></h2>
  {cards(covers, COVERS)}
</section>

<section id="cuidados">
  <h2>Cuidados<small>Lo que el documental afirma y lo que no</small></h2>
  <ul>
    <li><b>Condenado</b> solo por tres asesinatos: Claudio Nozzi (Corrientes, 30/5/2012) y Manuel Roseo y Nélida Bartolomé (Sáenz Peña, 7/10/2013).</li>
    <li><b>Paraguay, 2004:</b> principal sospechoso para la policía, nunca juzgado.</li>
    <li><b>Las huellas con ácido</b> las contó un abogado que lo conocía. La cirugía y el pelo teñido son de su propio relato.</li>
    <li><b>La red narco de 2026</b> es una acusación del gobierno del Chubut, y él la niega. <b>Netflix</b> no confirmó nada.</li>
    <li>Las escenas en 3D, la polaroid y el yaguareté son ilustrativos, y en pantalla se dice.</li>
  </ul>
  <p class="note">En los comentarios, borrá insultos, amenazas y datos de familiares. No agregues datos que no estén en el documental o en el dossier.</p>
</section>

<footer>
  <span>Carpeta de Drive: <a href="{FOLDER}" target="_blank" rel="noopener">CONTEXTO / Ep15 · El hombre de las mil caras</a></span>
  <span>Fuentes: Infobae, La Nación (Paraguay), HOY, El Litoral, El Tribuno, El Territorio, Noticiero 9, Radio Clan, La Tapa, Pulitzer Center, Rewilding Argentina, Mongabay, El Chubut, Primera Edición. Satélite: Copernicus Sentinel-2 (mayo de 2026). Contorno del parque: OpenStreetMap.</span>
  <span>En el repo: <code>entrega/el_hombre_de_las_mil_caras_*.md</code> y <code>guion/ep15_investigacion.md</code> (cronología y enlaces).</span>
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
