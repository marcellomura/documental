"""Página de publicación del ep16 (EL PUNTO DÉBIL), armada con los mismos .md de entrega/ para que página y repo digan
exactamente lo mismo.
Uso: python3 tools/pagina_publicacion_ep16.py ids.json previas/ salida.html
  ids.json: IDs de Drive de la carpeta ("folder"), del largo ("largo"), del vertical ("vertical") y de los subtítulos
            ("srt", "srt_v")
  previas/: l01..lNN.jpg (cuadros del largo), v01..vNN.jpg (del vertical) y cuadros.json ({"l": [["0:12", "texto"], ...],
            "v": [...]}), que se embeben en la página"""
import base64, html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENT = os.path.join(ROOT, "entrega")
ids = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {}
PREV = sys.argv[2] if len(sys.argv) > 2 else "previas"
OUT = sys.argv[3] if len(sys.argv) > 3 else "el_punto_debil_kit.html"
YT = open(f"{ENT}/el_punto_debil_descripcion_youtube.md").read()
VE = open(f"{ENT}/el_punto_debil_vertical_textos.md").read()
AB = open(f"{ENT}/el_punto_debil_miniaturas.md").read()
sec = lambda md, t: md.split(f"## {t}")[1].split("\n## ")[0].strip()
esc = html.escape
TITLES = re.findall(r"^- [AB]: \*\*(.+?)\*\*$", sec(YT, "Título (elegir uno; A/B)"), re.M)
DESC = sec(YT, "Descripción")
TAGS = sec(YT, "Etiquetas")
CHAPS = re.findall(r"^(\d\d:\d\d) (.+)$", DESC, re.M)
VTEXT = re.search(r"\*\*TikTok / Reels / Shorts \(texto\)\*\*\n(.+?)\n\n", VE, re.S).group(1).strip()
VTITLE = re.search(r"\*\*Título corto \(Shorts\):\*\* (.+)", VE).group(1).strip()
VPIN = re.search(r"\*\*Primer comentario fijado:\*\* (.+?)\n\n", VE, re.S).group(1).strip()
VTAGS = VE.strip().splitlines()[-1]
THUMBS = [(m.group(1), m.group(2).strip()) for m in re.finditer(r"## ([AB] · .+?)\nPrompt: (.+?)(?=\n\n|\Z)", AB, re.S)]
cuadros = json.load(open(os.path.join(PREV, "cuadros.json"))) if os.path.exists(os.path.join(PREV, "cuadros.json")) else {"l": [], "v": []}


def img64(p):
    return "data:image/jpeg;base64," + base64.b64encode(open(p, "rb").read()).decode()


def drive(k, label, kind="file"):
    i = ids.get(k)
    if not i: return f'<span class="muted">{esc(label)} (pendiente)</span>'
    url = f"https://drive.google.com/drive/folders/{i}" if kind == "folder" else f"https://drive.google.com/file/d/{i}/view"
    return f'<a href="{url}" target="_blank" rel="noopener">{esc(label)}</a>'


def copy_block(text, cid):
    return f'<div class="copy"><button type="button" data-copy="{cid}">Copiar</button><pre id="{cid}">{esc(text)}</pre></div>'


def md_inline(s):
    s = esc(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    return re.sub(r"(https?://[^\s<]+)", r'<a href="\1" target="_blank" rel="noopener">\1</a>', s)


lframes = "".join(f'<figure><img src="{img64(os.path.join(PREV, f"l{i + 1:02d}.jpg"))}" alt="{esc(c[1])}"><figcaption><span class="tc">{esc(c[0])}</span> {esc(c[1])}</figcaption></figure>'
                  for i, c in enumerate(cuadros.get("l", [])) if os.path.exists(os.path.join(PREV, f"l{i + 1:02d}.jpg")))
vframes = "".join(f'<figure class="v"><img src="{img64(os.path.join(PREV, f"v{i + 1:02d}.jpg"))}" alt="{esc(c[1])}"><figcaption><span class="tc">{esc(c[0])}</span> {esc(c[1])}</figcaption></figure>'
                  for i, c in enumerate(cuadros.get("v", [])) if os.path.exists(os.path.join(PREV, f"v{i + 1:02d}.jpg")))
chap_html = "".join(f"<li><span class=\"tc\">{esc(a)}</span>{esc(b)}</li>" for a, b in CHAPS)
desc_paras = DESC.split("**Capítulos**")[0].strip()
facts = sec(YT, "Descripción").split("**Qué calculamos nosotros**")[1].split("**Fuentes**")[0].strip().splitlines()
fuentes = DESC.split("**Fuentes**")[1].split("**Imágenes**")[0].strip().splitlines()
imagenes = DESC.split("**Imágenes**")[1].split("#AnomalíaDelAtlánticoSur")[0].strip()

page = f"""<title>El punto débil</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112..125,500..800&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap">
<style>
:root {{ --bg:#F4F1EA; --panel:#FFFDF8; --ink:#141A22; --dim:#5D6878; --line:rgba(20,26,34,.14); --hot:#C2410C; --hot2:#B7791F; --cool:#0F766E; --chip:#EFE8DA; color-scheme:light }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#05080F; --panel:#0B111C; --ink:#E9EEF4; --dim:#8F9DB0; --line:rgba(233,238,244,.14); --hot:#FF7A1F; --hot2:#FFC24A; --cool:#48F3D2; --chip:#121B2A; color-scheme:dark }} }}
:root[data-theme="dark"] {{ --bg:#05080F; --panel:#0B111C; --ink:#E9EEF4; --dim:#8F9DB0; --line:rgba(233,238,244,.14); --hot:#FF7A1F; --hot2:#FFC24A; --cool:#48F3D2; --chip:#121B2A; color-scheme:dark }}
body {{ background:var(--bg); color:var(--ink); font:16px/1.6 Inter, system-ui, sans-serif; overflow-wrap:anywhere }}
.wrap {{ max-width:1080px; margin:0 auto; padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:40px 80px }}
header {{ display:grid; gap:10px; padding-bottom:28px; border-bottom:1px solid var(--line) }}
.kicker {{ font:500 13px/1.2 'Geist Mono', ui-monospace, monospace; letter-spacing:.2em; text-transform:uppercase; color:var(--dim) }}
h1 {{ font:800 clamp(40px, 7vw, 76px)/1 Archivo, sans-serif; font-stretch:122%; letter-spacing:.02em; margin:0; text-wrap:balance }}
.sub {{ font:italic 400 clamp(20px, 3vw, 28px)/1.3 'Instrument Serif', serif; color:var(--dim) }}
.coord {{ font:500 14px/1.4 'Geist Mono', monospace; color:var(--hot) }}
h2 {{ font:700 22px/1.2 Archivo, sans-serif; font-stretch:115%; letter-spacing:.03em; margin:44px 0 14px; text-wrap:balance }}
h3 {{ font:600 15px/1.3 Inter, sans-serif; margin:22px 0 8px }}
.grid2 {{ display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px }}
.card {{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:18px; min-width:0 }}
.card .lab {{ font:500 12px/1.2 'Geist Mono', monospace; letter-spacing:.16em; text-transform:uppercase; color:var(--dim) }}
.big {{ font:600 18px/1.35 Inter, sans-serif; margin-top:6px }}
a {{ color:var(--cool) }}
.muted {{ color:var(--dim) }}
.frames {{ display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:12px }}
.frames.v {{ grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)) }}
figure {{ margin:0; min-width:0 }}
figure img {{ width:100%; display:block; border-radius:8px; border:1px solid var(--line); aspect-ratio:16/9; object-fit:cover }}
figure.v img {{ aspect-ratio:9/16 }}
figcaption {{ font-size:13px; color:var(--dim); margin-top:6px }}
.tc {{ font:500 12px 'Geist Mono', monospace; color:var(--hot); margin-right:8px }}
ol.chap {{ list-style:none; padding:0; margin:0; display:grid; gap:4px; columns:2 }}
ol.chap li {{ break-inside:avoid }}
@media (max-width:640px) {{ ol.chap {{ columns:1 }} }}
.copy {{ position:relative; background:var(--chip); border-radius:10px; border:1px solid var(--line) }}
.copy pre {{ margin:0; padding:16px; white-space:pre-wrap; word-break:break-word; font:13px/1.55 'Geist Mono', monospace; max-height:420px; overflow:auto }}
.copy button {{ position:absolute; top:8px; right:8px; font:500 12px 'Geist Mono', monospace; letter-spacing:.08em; background:var(--panel); color:var(--ink); border:1px solid var(--line); border-radius:6px; padding:6px 10px; cursor:pointer }}
ul.facts {{ padding-left:18px; margin:0; display:grid; gap:6px }}
.note {{ font-size:14px; color:var(--dim) }}
</style>
<div class="wrap">
<header>
  <div class="kicker">CONTEXTO · Episodio 16 · kit de publicación</div>
  <h1>EL PUNTO DÉBIL</h1>
  <div class="sub">La anomalía magnética que vive sobre nosotros</div>
  <div class="coord">mínimo del campo · 26,23° S · 60,02° O · 22.071 nT · modelo IGRF-14, 2025</div>
</header>

<h2>Archivos</h2>
<div class="grid2">
  <div class="card"><div class="lab">Documental · YouTube</div><div class="big">{drive("largo", "el_punto_debil_1440p.mp4")}</div><div class="note">2560×1440 · 8:25 · sin subtítulos incrustados · {drive("srt", "subtítulos .srt")}</div></div>
  <div class="card"><div class="lab">Vertical · Reels, TikTok, Shorts</div><div class="big">{drive("vertical", "el_punto_debil_vertical.mp4")}</div><div class="note">1080×1920 · 2:48 · subtítulos palabra por palabra · {drive("srt_v", "subtítulos .srt")}</div></div>
  <div class="card"><div class="lab">Carpeta de Drive</div><div class="big">{drive("folder", "CONTEXTO / Ep16 · El punto débil", "folder")}</div><div class="note">videos, subtítulos, descripción, textos, miniaturas y dossier</div></div>
</div>

<h2>Cómo se ve</h2>
<div class="frames">{lframes}</div>
<h3>Vertical</h3>
<div class="frames v">{vframes}</div>

<h2>YouTube</h2>
<div class="grid2">{"".join(f'<div class="card"><div class="lab">Título {"AB"[i]}</div><div class="big">{esc(t)}</div></div>' for i, t in enumerate(TITLES))}</div>
<h3>Descripción</h3>
{copy_block(DESC, "desc")}
<h3>Capítulos</h3>
<ol class="chap">{chap_html}</ol>
<h3>Etiquetas</h3>
{copy_block(TAGS, "tags")}

<h2>Vertical</h2>
<div class="card"><div class="lab">Título corto</div><div class="big">{esc(VTITLE)}</div></div>
<h3>Texto</h3>
{copy_block(VTEXT + chr(10) + chr(10) + VTAGS, "vtext")}
<h3>Comentario fijado</h3>
{copy_block(VPIN, "vpin")}

<h2>Miniaturas</h2>
<p class="note">Prompts para GPT Image 2.1 (no generadas). Prueba A/B: A como principal.</p>
{"".join(f'<h3>{esc(n)}</h3>' + copy_block(p, f"th{i}") for i, (n, p) in enumerate(THUMBS))}

<h2>Lo que calculamos</h2>
<ul class="facts">{"".join(f"<li>{md_inline(f[2:])}</li>" for f in facts if f.startswith("- "))}</ul>

<h2>Fuentes</h2>
<ul class="facts">{"".join(f"<li>{md_inline(f[2:])}</li>" for f in fuentes if f.startswith("- "))}</ul>
<h3>Imágenes, música y efectos</h3>
<p class="note">{md_inline(imagenes)}</p>
</div>
<script>
document.querySelectorAll('button[data-copy]').forEach(function (b) {{
  b.addEventListener('click', function () {{
    var el = document.getElementById(b.getAttribute('data-copy'));
    var done = function () {{ b.textContent = 'Copiado'; setTimeout(function () {{ b.textContent = 'Copiar'; }}, 1600); }};
    var sel = function () {{ var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Seleccionado'; }};
    try {{ navigator.clipboard.writeText(el.textContent).then(done, sel); }} catch (e) {{ sel(); }}
  }});
}});
</script>
"""
open(OUT, "w").write(page)
print(OUT, len(page) // 1024, "KB")
