"""Arma la página de publicación del reel 01 (LA MAESTRA QUE IBA A CABALLO) a partir de entrega/
la_maestra_que_iba_a_caballo_publicacion.md, para que la página y el repo digan exactamente lo mismo.
Uso: python3 tools/pagina_publicacion_reel01.py ids.json previas/ salida.html
  ids.json: IDs de Drive de la carpeta ("folder"), del reel ("reel") y de los subtítulos ("srt")
  previas/: r01..r08.jpg (cuadros del reel, verticales) y cuadros.json ([["0:01", "El gancho"], ...]), embebidos"""
import base64, html, json, os, re, sys

ENT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "entrega")
ids = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {}
PREV = sys.argv[2] if len(sys.argv) > 2 else "previas"
OUT = sys.argv[3] if len(sys.argv) > 3 else "la_maestra_que_iba_a_caballo_kit.html"

md = open(f"{ENT}/la_maestra_que_iba_a_caballo_publicacion.md").read()
def sec(title):
    return md.split(f"## {title}")[1].split("\n## ")[0]
blocks = lambda s: re.findall(r"```\n(.*?)```", s, re.S)
IG_TEXT, IG_PIN = blocks(sec("Instagram (Reels)"))
TT_TEXT = blocks(sec("TikTok"))[0]
PROMPTS = blocks(sec("Portada: tres prompts para GPT Image 2.1 (vertical 9:16)"))
assert len(PROMPTS) == 3

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
frames = "".join(
    f'<figure class="frame"><img src="{img(f"{PREV}/r{i + 1:02d}.jpg")}" alt="{html.escape(c)}, en el segundo {t}" loading="lazy" width="270" height="480">'
    f'<figcaption><span class="tc">{t}</span>{html.escape(c)}</figcaption></figure>'
    for i, (t, c) in enumerate(FR))

def size(path):
    try:
        return f" · {os.path.getsize(path) / 1e6:.0f} MB"
    except OSError:
        return ""
srt_lines = len(re.findall(r"^\d+$", open(f"{ENT}/la_maestra_que_iba_a_caballo_subtitulos_es.srt").read(), re.M))
files = [
    ("Reel", "la_maestra_que_iba_a_caballo_reel.mp4", "1080×1920 · 2:42" + size(f"{ENT}/la_maestra_que_iba_a_caballo_reel.mp4"), "reel", "Instagram, TikTok y Facebook"),
    ("Subtítulos", "la_maestra_que_iba_a_caballo_subtitulos_es.srt", f"Español · {srt_lines} líneas · opcional", "srt", "Facebook"),
]
file_cards = "".join(
    f'<a class="file" href="{drive(k)}" target="_blank" rel="noopener"><span class="file-kind">{p}</span>'
    f'<span class="file-name">{t}</span><span class="file-path">{f}</span><span class="file-meta">{m}</span><span class="file-go">Abrir en Drive ↗</span></a>'
    for t, f, m, k, p in files)

# la cinta de fechas del caso (octubre de 2026): la escala es la de los días
DATES = [(7, "último audio"), (9, "debía volver"), (15, "la denuncia"), (21, "detienen al capataz"), (28, "el hallazgo"), (29, "paro docente")]
X0, X1 = 24, 696
def xd(d): return X0 + (d - 6) / (29 - 6) * (X1 - X0)
ribbon = f'<line x1="{X0}" y1="44" x2="{X1}" y2="44" class="rb-line" />'
for d in range(6, 30):
    ribbon += f'<line x1="{xd(d):.1f}" y1="40" x2="{xd(d):.1f}" y2="48" class="rb-tick" />'
ribbon += f'<rect x="{xd(7):.1f}" y="41" width="{xd(28) - xd(7):.1f}" height="6" class="rb-span" />'
for i, (d, lab) in enumerate(DATES):
    key = d == 28
    up = i % 2 == 0
    ribbon += (f'<circle cx="{xd(d):.1f}" cy="44" r="{7 if key else 4.5}" class="{"rb-key" if key else "rb-dot"}" />'
               f'<text x="{xd(d):.1f}" y="{24 if up else 72}" text-anchor="middle" class="rb-day">{d}</text>'
               # la última etiqueta se alinea a la derecha para no salirse de la cinta
               f'<text x="{xd(d) + (8 if d == DATES[-1][0] else 0):.1f}" y="{12 if up else 86}" '
               f'text-anchor="{"end" if d == DATES[-1][0] else "middle"}" class="rb-lab">{html.escape(lab.upper())}</text>')
ribbon += f'<text x="{(xd(7) + xd(28)) / 2:.1f}" y="104" text-anchor="middle" class="rb-note">21 DÍAS DESDE SU ÚLTIMO MENSAJE</text>'

covers = [("1", "Iba a caballo a dar clases", "el amanecer en el bañado"), ("2", "¿Quién la dejó sola?", "la escuela vacía"), ("3", "¿Crimen o abandono?", "el país partido")]
cover_cards = "".join(
    f'<div class="cover"><div class="cover-head"><span class="badge">{l}</span><span class="cover-title">{html.escape(t)}</span>'
    f'<span class="cover-sub">{html.escape(s)}</span></div>{copy(PROMPTS[i], None, True)}</div>'
    for i, (l, t, s) in enumerate(covers))

page = f"""<title>La maestra que iba a caballo</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..100,400..900&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
/* Expediente de publicación: una columna de lectura (máx. 880 px) con barra de secciones fija. Oscuro por defecto, como
   el bañado antes del amanecer (pizarra azulada y tiza); claro como un papel de expediente con tinta. El ámbar del sol bajo
   es el único acento; el rojo queda para lo judicial. La cinta de fechas de la cabecera es la del caso. */
:root {{
  --bg: #0B1419; --panel: #132027; --panel-2: #1B2B33; --ink: #F3EFE4; --mute: #A4ABA4; --line: rgba(243,239,228,0.14);
  --amber: #F0A85A; --amber-ink: #1A1206; --red: #E0473B; --celeste: #74ACDF;
  --display: 'Archivo', 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif; --serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  --mono: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace;
  color-scheme: dark;
}}
@media (prefers-color-scheme: light) {{ :root:not([data-theme="dark"]) {{
  --bg: #ECEEE7; --panel: #F7F7F2; --panel-2: #DFE4DC; --ink: #13201F; --mute: #4D5956; --line: rgba(19,32,31,0.15);
  --amber: #9A520F; --amber-ink: #FFF5E8; --red: #A8261E; --celeste: #285F8A; color-scheme: light; }} }}
:root[data-theme="light"] {{
  --bg: #ECEEE7; --panel: #F7F7F2; --panel-2: #DFE4DC; --ink: #13201F; --mute: #4D5956; --line: rgba(19,32,31,0.15);
  --amber: #9A520F; --amber-ink: #FFF5E8; --red: #A8261E; --celeste: #285F8A; color-scheme: light; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--ink); font: 400 16px/1.6 var(--display); font-stretch: 96%; }}
.wrap {{ max-width: 880px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 80px; }}
body::before {{ content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }}
header.top {{ display: grid; gap: 16px; padding-block: 10px 26px; border-bottom: 1px solid var(--line); }}
.eyebrow {{ font: 600 12px/1.3 var(--mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--mute); }}
h1 {{ font: 900 clamp(48px, 12vw, 96px)/0.9 var(--display); font-stretch: 68%; text-transform: uppercase; letter-spacing: -0.005em; margin: 0; text-wrap: balance; }}
h1 em {{ font-style: normal; color: var(--amber); }}
.sub {{ font: 400 italic clamp(22px, 4.4vw, 30px)/1.2 var(--serif); color: var(--mute); margin: 0; max-width: 36ch; }}
.ribbon {{ overflow-x: auto; }}
.ribbon svg {{ display: block; width: 100%; min-width: 560px; height: auto; }}
.rb-line {{ stroke: var(--line); stroke-width: 2; }}
.rb-tick {{ stroke: var(--line); stroke-width: 1.5; }}
.rb-span {{ fill: var(--amber); opacity: 0.22; }}
.rb-dot {{ fill: var(--ink); }}
.rb-key {{ fill: var(--red); }}
.rb-day {{ font: 600 13px var(--mono); fill: var(--ink); font-variant-numeric: tabular-nums; }}
.rb-lab {{ font: 500 9.5px var(--mono); letter-spacing: 0.1em; fill: var(--mute); }}
.rb-note {{ font: 600 10px var(--mono); letter-spacing: 0.16em; fill: var(--amber); }}
.lede {{ margin: 0; max-width: 64ch; color: var(--mute); }}
nav.sections {{ position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); display: flex; gap: 6px; overflow-x: auto; padding-block: 10px; scrollbar-width: none; }}
nav.sections a {{ flex: none; font: 600 13px/1 var(--display); color: var(--ink); text-decoration: none; padding: 9px 12px; border-radius: 999px; border: 1px solid var(--line); }}
nav.sections a:hover, nav.sections a:focus-visible {{ border-color: var(--amber); color: var(--amber); outline: none; }}
section {{ padding-block: 34px 6px; scroll-margin-top: 64px; display: grid; gap: 16px; }}
section > *, header.top > * {{ min-width: 0; }}
h2 {{ font: 850 clamp(32px, 6vw, 46px)/1 var(--display); font-stretch: 70%; text-transform: uppercase; margin: 0; text-wrap: balance; }}
h2 small {{ display: block; font: 600 12px/1.4 var(--mono); letter-spacing: 0.14em; color: var(--mute); margin-top: 10px; text-transform: uppercase; }}
h3 {{ font: 700 17px/1.3 var(--display); margin: 14px 0 0; }}
p {{ margin: 0; max-width: 66ch; }}
ul, ol {{ margin: 0; padding-left: 1.2em; display: grid; gap: 6px; max-width: 66ch; }}
a {{ color: var(--amber); }}
code {{ font: 500 0.86em/1 var(--mono); overflow-wrap: anywhere; }}
.files {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }}
.file {{ display: grid; gap: 4px; align-content: start; padding: 14px; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); color: var(--ink); text-decoration: none; min-width: 0; }}
.file:hover, .file:focus-visible {{ border-color: var(--amber); outline: none; }}
.file-kind {{ font: 600 11px/1.2 var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); }}
.file-name {{ font: 850 28px/1.05 var(--display); font-stretch: 72%; text-transform: uppercase; }}
.file-path {{ font: 500 12px/1.4 var(--mono); color: var(--mute); overflow-wrap: anywhere; }}
.file-meta {{ font: 500 13px/1.3 var(--mono); color: var(--ink); font-variant-numeric: tabular-nums; }}
.file-go {{ font: 600 13px/1.3 var(--display); color: var(--amber); margin-top: 4px; }}
.frames {{ display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }}
.frame {{ margin: 0; display: grid; gap: 6px; min-width: 0; align-content: start; }}
.frame img {{ display: block; width: 100%; max-width: 100%; height: auto; aspect-ratio: 9 / 16; object-fit: cover; border-radius: 8px; border: 1px solid var(--line); background: var(--panel-2); }}
.frame figcaption {{ font: 500 13px/1.35 var(--display); color: var(--mute); }}
.tc {{ font: 600 12px/1 var(--mono); color: var(--ink); font-variant-numeric: tabular-nums; margin-right: 8px; }}
.table-wrap {{ overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); }}
table {{ border-collapse: collapse; width: 100%; min-width: 460px; font-size: 15px; }}
th, td {{ text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }}
th {{ font: 600 12px/1.3 var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--mute); }}
tr:last-child td {{ border-bottom: 0; }}
.copy {{ position: relative; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); min-width: 0; }}
.copy-label {{ display: block; padding: 10px 92px 0 14px; font: 600 12px/1.3 var(--mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--mute); }}
.copy pre {{ margin: 0; padding: 12px 92px 14px 14px; white-space: pre-wrap; word-break: break-word; font: 400 15px/1.55 var(--display); color: var(--ink); }}
.copy pre.tall {{ max-height: 340px; overflow-y: auto; }}
.copy-btn {{ position: absolute; top: 8px; right: 8px; font: 600 13px/1 var(--display); padding: 9px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel-2); color: var(--ink); cursor: pointer; }}
.copy-btn:hover, .copy-btn:focus-visible {{ border-color: var(--amber); color: var(--amber); outline: none; }}
.cover {{ display: grid; gap: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel-2); }}
.cover-head {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px; }}
.badge {{ font: 600 16px/1 var(--mono); background: var(--amber); color: var(--amber-ink); border-radius: 6px; padding: 6px 9px; }}
.cover-title {{ font: 700 16px/1.3 var(--display); }}
.cover-sub {{ font: 500 13px/1.3 var(--mono); color: var(--mute); }}
.note {{ font-size: 15px; color: var(--mute); border-left: 3px solid var(--celeste); padding-left: 12px; max-width: 66ch; }}
.note.alert {{ border-left-color: var(--red); color: var(--ink); }}
.steps {{ counter-reset: s; list-style: none; padding: 0; }}
.steps li {{ counter-increment: s; position: relative; padding-left: 34px; }}
.steps li::before {{ content: counter(s); position: absolute; left: 0; top: 1px; width: 24px; height: 24px; border-radius: 50%; background: var(--amber); color: var(--amber-ink); font: 600 13px/24px var(--mono); text-align: center; }}
.both {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }}
.side {{ display: grid; gap: 8px; align-content: start; padding: 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--panel); min-width: 0; }}
.side .who {{ font: 600 12px/1.3 var(--mono); letter-spacing: 0.12em; text-transform: uppercase; }}
.side.a .who {{ color: var(--amber); }}
.side.b .who {{ color: var(--celeste); }}
.side q {{ font: 400 22px/1.2 var(--serif); }}
footer {{ margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--line); font-size: 14px; color: var(--mute); display: grid; gap: 6px; min-width: 0; }}
footer > span {{ min-width: 0; overflow-wrap: anywhere; }}
@media (max-width: 620px) {{ .frames {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} .both {{ grid-template-columns: minmax(0, 1fr); }} }}
@media (prefers-reduced-motion: no-preference) {{ html {{ scroll-behavior: smooth; }} }}
</style>
<div class="wrap">
<header class="top">
  <div class="eyebrow">CONTEXTO · Reel 01 · edición especial vertical</div>
  <h1>La maestra que iba <em>a caballo</em></h1>
  <p class="sub">El caso Nanci Godoy, en 2:42, con el debate que divide al país.</p>
  <div class="ribbon"><svg viewBox="0 0 720 112" role="img" aria-label="Cinta de fechas de octubre de 2026: el 7, último audio; el 9, debía volver; el 15, la denuncia; el 21, detienen al capataz; el 28, el hallazgo; el 29, el paro docente">{ribbon}</svg></div>
  <p class="lede">Todo para publicar el reel en Instagram, TikTok y Facebook: el archivo en Drive, un cuadro de cada parte, los textos listos para copiar, el comentario para fijar, cómo moderar y tres portadas para GPT Image.</p>
</header>
<nav class="sections" aria-label="Secciones">
  <a href="#archivos">Archivos</a><a href="#vista">Vista previa</a><a href="#antes">Antes de publicar</a><a href="#instagram">Instagram</a><a href="#tiktok">TikTok</a><a href="#facebook">Facebook</a><a href="#debate">El debate</a><a href="#moderacion">Moderación</a><a href="#portadas">Portadas</a>
</nav>

<section id="archivos">
  <h2>Archivos<small>Google Drive · CONTEXTO / Reel · La maestra que iba a caballo</small></h2>
  <div class="files">{file_cards}</div>
  <p class="note">El reel tiene los subtítulos incrustados y la mezcla a −14 LUFS. Pesa menos de 500 MB, así que también se puede programar en Metricool. En la carpeta están además los textos de publicación y las portadas en <code>.txt</code>.</p>
</section>

<section id="vista">
  <h2>Vista previa<small>Cuadros sacados del archivo final</small></h2>
  <div class="frames">{frames}</div>
</section>

<section id="antes">
  <h2>Antes de publicar<small>La causa está abierta</small></h2>
  <ol class="steps">
    <li><b>Revisá las novedades.</b> El reel está cerrado con lo que se sabía el 29 de octubre de 2026. Esa noche circularon resultados preliminares y extraoficiales de la autopsia, que el reel no usa. Si sale el informe oficial, hay más detenidos o cambian las imputaciones, avisame y actualizo ese tramo.</li>
    <li><b>Publicalo cuanto antes:</b> hoy o mañana, entre las 19:30 y las 22:00, o entre las 12:30 y las 14:00.</li>
    <li><b>Subilo a las tres redes a la misma hora</b> y fijá el comentario apenas sale.</li>
  </ol>
</section>

<section id="instagram">
  <h2>Instagram<small>Reels · compartir también en el feed</small></h2>
  {copy(IG_TEXT, "Texto del posteo", True)}
  {copy(IG_PIN, "Comentario para fijar")}
  <div class="table-wrap"><table>
    <thead><tr><th>Campo</th><th>Qué poner</th></tr></thead>
    <tbody>
      <tr><td>Portada</td><td>El cuadro del título («La maestra que iba a caballo») o una de las portadas de GPT Image</td></tr>
      <tr><td>Etiqueta de IA</td><td>Activala: la voz es sintética y el 3D es una recreación</td></tr>
      <tr><td>Música</td><td>Ninguna: el reel ya tiene su música original</td></tr>
    </tbody>
  </table></div>
</section>

<section id="tiktok">
  <h2>TikTok<small>El mismo archivo</small></h2>
  {copy(TT_TEXT, "Texto del posteo")}
  <ul>
    <li><b>Comentario para fijar:</b> el mismo de Instagram.</li>
    <li>Activá <b>Contenido generado por IA</b>.</li>
    <li><b>Portada:</b> el cuadro del título, que ya trae el texto.</li>
  </ul>
</section>

<section id="facebook">
  <h2>Facebook<small>Reels</small></h2>
  <p>Usá el mismo texto de Instagram. Los subtítulos ya están en el video; si querés, subí además el <code>.srt</code>.</p>
</section>

<section id="debate">
  <h2>El debate<small>Las dos posturas, tal como las presenta el reel</small></h2>
  <div class="both">
    <div class="side a"><span class="who">Su familia y los gremios</span><q>Que el Estado esté presente, hoy no lo está.</q><span class="cover-sub">Sebastián, hijo de Nanci</span></div>
    <div class="side b"><span class="who">El gobierno de Corrientes</span><q>Hay un operativo muy fuerte.</q><span class="cover-sub">Juan Pablo Valdés, gobernador, 19/10</span></div>
  </div>
  <p class="note">La pregunta del cierre es si fue un crimen que nadie podía evitar (A) o si el Estado también es responsable (B). El debate es sobre la responsabilidad del Estado: la culpabilidad de las personas detenidas la decide la Justicia.</p>
</section>

<section id="moderacion">
  <h2>Moderación<small>Un femicidio con una causa abierta y una familia que lee los comentarios</small></h2>
  <ul>
    <li><b>Borrá</b> insultos, amenazas, nombres o fotos de los detenidos y cualquier imagen de la víctima o del lugar del hallazgo.</li>
    <li><b>No respondas</b> con datos que no estén en el reel.</li>
    <li>Si alguien de la familia pide bajarlo, se baja.</li>
    <li>Los cinco detenidos tienen presunción de inocencia: el reel no los nombra y los comentarios fijados tampoco.</li>
  </ul>
</section>

<section id="portadas">
  <h2>Portadas<small>Prompts para GPT Image 2.1 · 1080×1920</small></h2>
  <p class="note alert">Sin caras, sin fotos de la víctima, sin sangre ni cinta policial. Revisá los acentos letra por letra. Si el logo sale mal, pegá encima <code>video/public/brand/logo_transparente.png</code>.</p>
  {cover_cards}
</section>

<footer>
  <span>Carpeta de Drive: <a href="{FOLDER}" target="_blank" rel="noopener">CONTEXTO / Reel · La maestra que iba a caballo</a></span>
  <span>Fuentes: Chequeado, Infobae, El Destape, Diario UNO, Perfil, Momarandu, Qué Pasa Salta. Satélite: Copernicus Sentinel-2 (19/10/2026). Caballo 3D: Quaternius (CC0).</span>
  <span>En el repo: <code>entrega/la_maestra_que_iba_a_caballo_publicacion.md</code> y <code>guion/reel01_investigacion.md</code>.</span>
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
