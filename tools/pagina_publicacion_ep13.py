"""Arma la página de publicación de "EL LOTE 31.202" (video largo y short) a partir de los .md de entrega/, para que la
página y el repo digan exactamente lo mismo.
Uso: python3 tools/pagina_publicacion_ep13.py ids.json previas/ salida.html
  ids.json: IDs de Drive de master, short y srt
  previas/: m01..m12.jpg (cuadros del video largo) y s01..s06.jpg (cuadros del short), que van embebidos en la página"""
import base64, html, json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "entrega")
ids = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {}
PREV = sys.argv[2] if len(sys.argv) > 2 else "previas"
OUT = sys.argv[3] if len(sys.argv) > 3 else "el_lote_kit.html"

desc = open(f"{ROOT}/el_lote_31202_descripcion_youtube.md").read()
ab = open(f"{ROOT}/el_lote_31202_ab_miniaturas.md").read()
short = open(f"{ROOT}/el_lote_31202_short_publicacion.md").read()

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
assert len(TITLES) == 3 and len(PROMPTS) == 3 and len(S) == 3 and len(S_ALT) == 2 and len(CHAPTERS) == 13

FOLDER = "https://drive.google.com/drive/folders/1EjWkitY8xLsjo7Dpg1IaWdIST8Uc4DOF"
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

# cuadros del video largo: uno por capítulo (menos el homenaje), con su minuto real
MASTER = [("0:38", 0), ("1:02", 1), ("1:52", 2), ("2:20", 3), ("3:20", 4), ("4:22", 5), ("5:07", 6), ("5:56", 7), ("6:50", 8), ("7:44", 9), ("8:13", 10), ("9:45", 11)]
master_figs = "".join(
    f'<figure class="frame"><img src="{img(f"{PREV}/m{i + 1:02d}.jpg")}" alt="{html.escape(CHAPTERS[c][1])}, en el minuto {t}" loading="lazy" width="640" height="360">'
    f'<figcaption><span class="tc">{t}</span>{html.escape(CHAPTERS[c][1])}</figcaption></figure>'
    for i, (t, c) in enumerate(MASTER))
SHORT = [("0:03", "El chat de la noche anterior"), ("0:15", "La pila de nueve fetas"), ("0:27", "«Sí, lo sé»"), ("0:43", "Hoy quemamos todo"), ("0:58", "La barrera que funcionó"), ("1:12", "El cierre con la flecha")]
short_figs = "".join(
    f'<figure class="frame tall"><img src="{img(f"{PREV}/s{i + 1:02d}.jpg")}" alt="{html.escape(c)}, en el segundo {t}" loading="lazy" width="360" height="640">'
    f'<figcaption><span class="tc">{t}</span>{html.escape(c)}</figcaption></figure>'
    for i, (t, c) in enumerate(SHORT))

files = [
    ("Video largo", "el_lote_31202_1440p.mp4", "2560×1440 · 10:20 · 1,2 GB", "master", "YouTube"),
    ("Short", "el_lote_31202_short.mp4", "1080×1920 · 1:18", "short", "Shorts y TikTok"),
    ("Subtítulos", "el_lote_31202_subtitulos_es.srt", "Español · 184 líneas", "srt", "YouTube"),
]
file_cards = "".join(
    f'<a class="file" href="{drive(k)}" target="_blank" rel="noopener"><span class="file-kind">{p}</span>'
    f'<span class="file-name">{t}</span><span class="file-path">{f}</span><span class="file-meta">{m}</span><span class="file-go">Abrir en Drive ↗</span></a>'
    for t, f, m, k, p in files)

thumbs = [("1", "Les avisaron el día antes", "LES AVISARON EL DÍA ANTES", "el aviso"), ("2", "9 barreras", "9 BARRERAS", "el sistema que falló"), ("3", "«Sí, lo sé»", "«SÍ, LO SÉ»", "la frase del chat")]
thumb_cards = "".join(
    f'<div class="thumb"><div class="thumb-head"><span class="badge">{l}</span><span class="thumb-title">{html.escape(t)}</span>'
    f'<span class="thumb-text">Texto: {html.escape(tx)} · gancho: {g}</span></div>{copy(PROMPTS[i], None, True)}</div>'
    for i, (l, t, tx, g) in enumerate(thumbs))

# nueve fetas caídas y la décima, la del hospital: el resumen visual del episodio
slices = "".join(
    f'<g transform="translate({18 + i * 34},24)"><rect x="-13" y="-19" width="26" height="38" rx="5" class="sl" />'
    f'<circle cx="-4.7" cy="-7.6" r="3.4" class="sl-hole" /><circle cx="1.3" cy="4.6" r="5.2" class="sl-fail" /></g>'
    for i in range(9)) + '<g transform="translate({x},24)"><rect x="-17" y="-23" width="34" height="46" rx="8" class="sl-glow" /><rect x="-13" y="-19" width="26" height="38" rx="5" class="sl-ok" /></g>'.format(x=18 + 9 * 34 + 14)

page = f"""<title>Kit El lote 31.202</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap">
<style>
/* Expediente clínico: una columna de lectura (máx. 880 px) con barra de secciones fija. Oscuro por defecto, como el
   episodio (verde petróleo, verde quirófano, rojo de alarma y el amarillo de las fetas); claro como papel de expediente. */
:root {{
  --bg: #040A0B; --panel: #0A1517; --panel-2: #0F1E21; --ink: #E6F0EE; --mute: #8CA5A1; --line: rgba(140,200,190,0.16);
  --teal: #22C9B4; --red: #FF4A3D; --cheese: #F2C14E; --chip: #F2C14E; --chip-ink: #040A0B; --hole: #040A0B;
  --display: 'Geist', 'Helvetica Neue', Arial, sans-serif; --body: 'Geist', 'Helvetica Neue', Arial, sans-serif;
  --mono: 'Geist Mono', ui-monospace, Menlo, Consolas, monospace; --serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  color-scheme: dark;
}}
@media (prefers-color-scheme: light) {{ :root:not([data-theme="dark"]) {{
  --bg: #EEF2F1; --panel: #FFFFFF; --panel-2: #E3EAE8; --ink: #0B1416; --mute: #4D605E; --line: rgba(11,20,22,0.14);
  --teal: #0B7F71; --red: #C42B20; --cheese: #9A6510; --chip: #0B1416; --chip-ink: #F2F6F5; --hole: #EEF2F1; color-scheme: light; }} }}
:root[data-theme="light"] {{
  --bg: #EEF2F1; --panel: #FFFFFF; --panel-2: #E3EAE8; --ink: #0B1416; --mute: #4D605E; --line: rgba(11,20,22,0.14);
  --teal: #0B7F71; --red: #C42B20; --cheese: #9A6510; --chip: #0B1416; --chip-ink: #F2F6F5; --hole: #EEF2F1; color-scheme: light; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--ink); font: 400 16px/1.6 var(--body); }}
.wrap {{ max-width: 880px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 80px; }}
body::before {{ content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }}
header.top {{ display: grid; gap: 16px; padding-block: 10px 26px; border-bottom: 1px solid var(--line); }}
.eyebrow {{ font: 600 12px/1.3 var(--mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--mute); }}
h1 {{ font: 800 clamp(44px, 10vw, 84px)/0.95 var(--display); letter-spacing: -0.035em; margin: 0; text-wrap: balance; }}
h1 .lote {{ font-family: var(--mono); font-weight: 500; letter-spacing: -0.04em; }}
.sub {{ font: 400 italic clamp(24px, 4.6vw, 34px)/1.15 var(--serif); color: var(--mute); margin: 0; }}
.sub b {{ font-style: normal; font-weight: 400; color: var(--red); }}
.slices {{ display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }}
.slices svg {{ width: 360px; max-width: 100%; height: auto; }}
.sl {{ fill: var(--cheese); }} .sl-hole {{ fill: var(--hole); opacity: 0.8; }} .sl-fail {{ fill: var(--red); }}
.sl-ok {{ fill: var(--teal); }} .sl-glow {{ fill: var(--teal); opacity: 0.22; }}
.slices-cap {{ font: 500 13px/1.5 var(--mono); color: var(--mute); }}
.slices-cap b {{ color: var(--red); font-weight: 600; }} .slices-cap i {{ color: var(--teal); font-style: normal; font-weight: 600; }}
.lede {{ margin: 0; max-width: 64ch; color: var(--mute); }}
nav.sections {{ position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); display: flex; gap: 6px; overflow-x: auto; padding-block: 10px; scrollbar-width: none; }}
nav.sections a {{ flex: none; font: 600 13px/1 var(--body); color: var(--ink); text-decoration: none; padding: 9px 12px; border-radius: 999px; border: 1px solid var(--line); }}
nav.sections a:hover, nav.sections a:focus-visible {{ border-color: var(--teal); color: var(--teal); outline: none; }}
section {{ padding-block: 34px 6px; scroll-margin-top: 64px; display: grid; gap: 16px; }}
h2 {{ font: 800 clamp(28px, 5.4vw, 38px)/1.05 var(--display); letter-spacing: -0.03em; margin: 0; text-wrap: balance; }}
h2 small {{ display: block; font: 600 12px/1.4 var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); margin-top: 8px; }}
h3 {{ font: 700 17px/1.3 var(--body); margin: 14px 0 0; }}
p {{ margin: 0; max-width: 66ch; }}
ul, ol {{ margin: 0; padding-left: 1.2em; display: grid; gap: 6px; max-width: 66ch; }}
a {{ color: var(--teal); }}
code {{ font: 500 0.88em/1 var(--mono); }}
.files {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }}
.file {{ display: grid; gap: 4px; align-content: start; padding: 14px; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); color: var(--ink); text-decoration: none; min-width: 0; }}
.file:hover, .file:focus-visible {{ border-color: var(--teal); outline: none; }}
.file-kind {{ font: 600 11px/1.2 var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); }}
.file-name {{ font: 800 24px/1.1 var(--display); letter-spacing: -0.02em; }}
.file-path {{ font: 500 12px/1.4 var(--mono); color: var(--mute); overflow-wrap: anywhere; }}
.file-meta {{ font: 500 13px/1.3 var(--mono); color: var(--ink); }}
.file-go {{ font: 600 13px/1.3 var(--body); color: var(--teal); margin-top: 4px; }}
.frames {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }}
.frames.vertical {{ grid-template-columns: repeat(6, minmax(0, 1fr)); }}
.frame {{ margin: 0; display: grid; gap: 6px; min-width: 0; }}
.frame img {{ display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 6px; border: 1px solid var(--line); background: var(--panel-2); }}
.frame.tall img {{ aspect-ratio: 9 / 16; }}
.frame figcaption {{ font: 500 13px/1.35 var(--body); color: var(--mute); }}
.tc {{ font: 600 12px/1 var(--mono); color: var(--ink); font-variant-numeric: tabular-nums; margin-right: 8px; }}
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
.copy-btn:hover, .copy-btn:focus-visible {{ border-color: var(--teal); color: var(--teal); outline: none; }}
.thumb {{ display: grid; gap: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel-2); }}
.thumb-head {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px; }}
.badge {{ font: 600 16px/1 var(--mono); background: var(--chip); color: var(--chip-ink); border-radius: 6px; padding: 6px 9px; }}
.thumb-title {{ font: 700 16px/1.3 var(--body); }}
.thumb-text {{ font: 500 13px/1.3 var(--mono); color: var(--mute); }}
.note {{ font-size: 15px; color: var(--mute); border-left: 3px solid var(--teal); padding-left: 12px; max-width: 66ch; }}
.note.alert {{ border-left-color: var(--red); color: var(--ink); }}
.steps {{ counter-reset: s; list-style: none; padding: 0; }}
.steps li {{ counter-increment: s; position: relative; padding-left: 34px; }}
.steps li::before {{ content: counter(s); position: absolute; left: 0; top: 1px; width: 24px; height: 24px; border-radius: 50%; background: var(--chip); color: var(--chip-ink); font: 600 13px/24px var(--mono); text-align: center; }}
footer {{ margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--line); font-size: 14px; color: var(--mute); display: grid; gap: 6px; }}
@media (max-width: 620px) {{ .frames {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} .frames.vertical {{ grid-template-columns: repeat(3, minmax(0, 1fr)); }} }}
@media (prefers-reduced-motion: no-preference) {{ html {{ scroll-behavior: smooth; }} }}
</style>
<div class="wrap">
<header class="top">
  <div class="eyebrow">CONTEXTO · Episodio 13 · edición especial · kit de publicación</div>
  <h1>El lote <span class="lote">31.202</span></h1>
  <p class="sub">Nueve barreras, <b>noventa muertes</b>.</p>
  <div class="slices">
    <svg viewBox="0 0 368 48" role="img" aria-label="Nueve fetas con su agujero rojo y una décima verde, sin agujeros">{slices}</svg>
    <div class="slices-cap"><b>9 barreras</b> fallaron una por una.<br>La décima fue <i>un equipo de hospital</i>.</div>
  </div>
  <p class="lede">Todo para subir el video largo y el short: los archivos en Drive, cuadros de cada capítulo, títulos y miniaturas para la prueba A/B, la descripción con capítulos, la configuración y los textos del short para YouTube y TikTok.</p>
</header>
<nav class="sections" aria-label="Secciones">
  <a href="#archivos">Archivos</a><a href="#vista">Vista previa</a><a href="#calendario">Calendario</a><a href="#youtube">YouTube</a><a href="#miniaturas">Miniaturas</a><a href="#short">Short</a><a href="#tiktok">TikTok</a><a href="#cuidados">Cuidados</a>
</nav>

<section id="archivos">
  <h2>Archivos<small>Google Drive · CONTEXTO / Ep13 · El lote 31.202 (fentanilo contaminado)</small></h2>
  <div class="files">{file_cards}</div>
  <p class="note">Video largo a −14 LUFS en 1440p: YouTube le da el códec de alta calidad. El short tiene los subtítulos incrustados y es el mismo archivo para YouTube Shorts y TikTok. En la carpeta también están la descripción, las miniaturas y el instructivo del short en <code>.txt</code>.</p>
</section>

<section id="vista">
  <h2>Vista previa<small>Un cuadro por capítulo, sacado del archivo final</small></h2>
  <div class="frames">{master_figs}</div>
  <h3>Short · 1:18</h3>
  <div class="frames vertical">{short_figs}</div>
</section>

<section id="calendario">
  <h2>Calendario<small>El short sale después, cuando el video ya es público, porque lo enlaza</small></h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Pieza</th><th>Dónde</th><th>Cuándo</th></tr></thead>
    <tbody>
      <tr><td>Video largo</td><td>YouTube</td><td class="time">jue 26/11 · 19:00</td></tr>
      <tr><td>Short</td><td>YouTube Shorts</td><td class="time">sáb 28/11 · 13:00</td></tr>
      <tr><td>Short (mismo archivo)</td><td>TikTok</td><td class="time">sáb 28/11 · 19:00</td></tr>
    </tbody>
  </table></div>
  <p class="note alert"><b>Antes de publicar:</b> la causa sigue abierta. Fijate si hubo novedades (que la Cámara Federal resuelva las apelaciones, nuevas detenciones, otra cifra de víctimas). Si cambió algo, avisame y actualizo el cierre.</p>
</section>

<section id="youtube">
  <h2>YouTube · video largo<small>10:20 · subí el master 1440p de Drive</small></h2>
  <h3>Títulos para la prueba A/B</h3>
  {copy(TITLES[0], "Título 1 · el aviso")}
  {copy(TITLES[1], "Título 2 · las barreras")}
  {copy(TITLES[2], "Título 3 · la frase")}
  <h3>Descripción</h3>
  {copy(DESC, "Pegala entera, con capítulos, fuentes y créditos", True)}
  <h3>Etiquetas</h3>
  {copy(TAGS)}
  <h3>Comentario para fijar</h3>
  {copy(PIN)}
  <h3>Configuración</h3>
  <ul>
    <li><b>Subtítulos:</b> subí <code>el_lote_31202_subtitulos_es.srt</code> (Subtítulos → Agregar idioma: Español → Subir archivo → Con sincronización).</li>
    <li><b>Pantalla final</b> desde <b>10:10</b>: en los dos recuadros de «SEGUÍ MIRANDO», <b>Video → «907 metros»</b> arriba y <b>Lista → la del canal</b> abajo; <b>Suscribirse</b> sobre el logo CONTEXTO.</li>
    <li><b>Tarjeta</b> en <b>9:51</b>, cuando el video hace la pregunta: encuesta «¿Quién tiene más culpa? El laboratorio que lo fabricó / El Estado que no lo detuvo».</li>
    <li><b>Contenido alterado o sintético: Sí.</b> Además de la voz, los chats, los documentos, la ampolla y las fetas son recreaciones (el video lo aclara en pantalla).</li>
    <li>No es contenido para niños, sin restricción de edad, categoría Educación, idioma Español (Latinoamérica). Lista «CONTEXTO · Argentina explicada».</li>
  </ul>
</section>

<section id="miniaturas">
  <h2>Miniaturas A/B<small>Prompts para GPT Image 2.1 · 1280×720 JPG, menos de 2 MB</small></h2>
  <p>Pedí 3 o 4 variantes de cada una y revisá números, comillas y acentos letra por letra: 31.202, DÍA, SÍ, SÉ. Nada que identifique a alguien real: ni caras, ni pacientes, ni logos de laboratorios o de la ANMAT. Si el logo sale mal, pegá encima <code>video/public/brand/logo_transparente.png</code>.</p>
  {thumb_cards}
  <h3>Cómo cargar la prueba</h3>
  <ol class="steps">
    <li>En YouTube Studio, abrí el video y, en Miniatura, elegí <b>Probar y comparar</b>.</li>
    <li>Subí las miniaturas 1, 2 y 3. Si tu canal ya tiene la prueba de títulos, emparejá cada una con su título.</li>
    <li>Si solo te deja probar miniaturas, usá el título 1 en las tres.</li>
    <li>Dejala correr al menos 7 días o hasta que YouTube marque una ganadora: elige por tiempo de reproducción, no por clics.</li>
    <li>Anotá cuál ganó. Si gana la 1, funciona el giro de la historia; si la 2, la explicación visual del sistema; si la 3, la cita textual.</li>
  </ol>
</section>

<section id="short">
  <h2>YouTube Shorts<small>el_lote_31202_short.mp4 · 1:18 · sáb 28/11, 13:00</small></h2>
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
    <li>Contenido alterado o sintético: <b>Sí</b> (voz sintética y recreaciones). No es para niños.</li>
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
  <h2>Cuidados<small>Es una tragedia con familias que todavía esperan un juicio</small></h2>
  <p>El video no muestra pacientes ni usa sus nombres, no se apoya en el morbo y termina con un homenaje. En los comentarios:</p>
  <ul>
    <li><b>Procesados, no condenados.</b> No fijes comentarios que traten de culpables a los procesados ni que los insulten.</li>
    <li><b>Víctimas.</b> Borrá los que mencionen a pacientes con nombre y apellido.</li>
    <li><b>Grieta.</b> Si se arma una pelea partidaria, el video ya responde: el laboratorio creció durante varios gobiernos, y las dos exfuncionarias procesadas fueron designadas por gobiernos distintos.</li>
  </ul>
  <p>El video habla del fentanilo como remedio de hospital y no da información sobre su uso como droga.</p>
</section>

<footer>
  <span>Carpeta de Drive: <a href="{FOLDER}" target="_blank" rel="noopener">CONTEXTO / Ep13 · El lote 31.202 (fentanilo contaminado)</a></span>
  <span>En el repo: <code>entrega/el_lote_31202_descripcion_youtube.md</code>, <code>el_lote_31202_ab_miniaturas.md</code> y <code>el_lote_31202_short_publicacion.md</code>.</span>
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
