"""Descarga imágenes de Wikimedia Commons cuando la API y el wikitext responden 429: lee autor y licencia de la página
HTML del archivo (/wiki/File:...) y baja la miniatura de 1920 px (el original y los tamaños no estándar también dan 429).
Uso: IMGDIR=ep15/img python3 tools/getfiles_html.py local=Nombre_en_Commons.jpg [...]  → video/public/<IMGDIR>/local.jpg
Registra autor, licencia y enlace en video/public/<IMGDIR>/creditos.json."""
import hashlib, html as H, json, os, re, sys, time, urllib.parse, urllib.request
UA = "DocumentalProject/1.0 (https://github.com/marcellomura/documental)"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "video", "public", os.environ.get("IMGDIR", "img")); os.makedirs(OUT, exist_ok=True)
CRED = os.path.join(OUT, "creditos.json")
cred = json.load(open(CRED)) if os.path.exists(CRED) else {}
W = int(os.environ.get("THUMBW", "1920"))

def get(url, binary=False, tries=5):
    for i in range(tries):
        try:
            d = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read()
            return d if binary else d.decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            if e.code in (400, 404): raise
            time.sleep(8 * (i + 1))
    raise RuntimeError("sin respuesta: " + url)

def clean(s):
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", H.unescape(s)).strip()

for arg in sys.argv[1:]:
    local, name = arg.split("=", 1)
    fname = name.replace(" ", "_")
    q = urllib.parse.quote(fname)
    page = get("https://commons.wikimedia.org/wiki/File:" + q)
    lic = re.findall(r'class="licensetpl_short"[^>]*>(.*?)</span>', page, re.S)
    lic = clean(lic[0]) if lic else ("Dominio público" if re.search(r"public domain|dominio público|PD-", page, re.I) else "ver fuente")
    au = re.search(r'id="fileinfotpl_aut"[^>]*>.*?</td>\s*<td[^>]*>(.*?)</td>', page, re.S)
    au = clean(au.group(1))[:100] if au else "?"
    md5 = hashlib.md5(fname.encode()).hexdigest()
    thumb = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{md5[0]}/{md5[:2]}/{q}/{W}px-{q}"
    ext = ".png" if fname.lower().endswith(".png") else ".jpg"
    if fname.lower().endswith((".tif", ".tiff")): thumb += ".jpg"
    try:
        data = get(thumb, binary=True)
    except Exception:   # la imagen es más chica que el ancho pedido: probar los tamaños estándar más chicos
        data = None
        for w2 in (1280, 960):
            try:
                data = get(thumb.replace(f"/{W}px-", f"/{w2}px-"), binary=True); break
            except Exception:
                continue
        if data is None:
            print("NO BAJA", name); continue
    open(os.path.join(OUT, local + ext), "wb").write(data)
    cred[local + ext] = {"archivo": name, "autor": au, "licencia": lic, "url": "https://commons.wikimedia.org/wiki/File:" + q}
    json.dump(cred, open(CRED, "w"), ensure_ascii=False, indent=1)
    print(f"{local+ext:28s} {len(data)//1024:5d} KB | {lic} | {au[:60]}")
    time.sleep(1.5)
