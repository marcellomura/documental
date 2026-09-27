"""Descarga videos de Wikimedia Commons (transcodificación de Commons o el original) + licencia/autor.
Uso: VIDDIR=ep06/vid python3 tools/getvideos.py local=Archivo.webm ...
Deja el original en raw/<VIDDIR>/ (para elegir el tramo) y registra créditos en video/public/<VIDDIR>/creditos.json."""
import sys, re, time, json, os, urllib.parse, urllib.request, hashlib
UA = "DocumentalProject/1.0 (https://github.com/marcellomura/documental)"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VD = os.environ.get("VIDDIR", "vid")
RAW = os.path.join(ROOT, "raw", VD); os.makedirs(RAW, exist_ok=True)
OUT = os.path.join(ROOT, "video", "public", VD); os.makedirs(OUT, exist_ok=True)
CRED = os.path.join(OUT, "creditos.json")
cred = json.load(open(CRED)) if os.path.exists(CRED) else {}
LIC = [(r"cc-zero|CC0", "CC0"), (r"PD-|public domain|PD-USGov", "Dominio público"),
       (r"cc-by-sa-4\.0", "CC BY-SA 4.0"), (r"cc-by-sa-3\.0", "CC BY-SA 3.0"), (r"cc-by-sa-2\.0", "CC BY-SA 2.0"),
       (r"cc-by-4\.0", "CC BY 4.0"), (r"cc-by-3\.0", "CC BY 3.0"), (r"cc-by-2\.0", "CC BY 2.0"), (r"GFDL", "GFDL")]
def lic_of(raw):
    for pat, n in LIC:
        if re.search(pat, raw, re.I): return n
    return "ver fuente"

def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    err = None
    for i in range(4):
        try:
            d = urllib.request.urlopen(req, timeout=120).read()
            return d if binary else d.decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            if e.code == 404: raise
            err = e; time.sleep(8 * (i + 1))
    raise err

for arg in sys.argv[1:]:
    local, name = arg.split("=", 1)
    fname = name.replace(" ", "_")
    try:
        raw = get("https://commons.wikimedia.org/w/index.php?title=File:" + urllib.parse.quote(fname) + "&action=raw")
    except Exception as e:
        print("NO RAW", name, e); continue
    au = re.search(r"\|\s*[Aa]uthor\s*=\s*(.*)", raw)
    au = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", au.group(1)).strip()[:90] if au else "?"
    au = re.sub(r"\{\{[^}]*\}\}|\[https?://\S+\s*([^\]]*)\]", r"\1", au).strip() or "?"
    lic = lic_of(raw)
    md5 = hashlib.md5(fname.encode()).hexdigest()
    q = urllib.parse.quote(fname)
    base = f"https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}/{q}"
    tr = f"https://upload.wikimedia.org/wikipedia/commons/transcoded/{md5[0]}/{md5[:2]}/{q}/{q}"
    data = None
    for u in (tr + ".1080p.vp9.webm", tr + ".720p.vp9.webm", base, tr + ".480p.vp9.webm"):
        try:
            data = get(u, binary=True); src = u; break
        except Exception as e:
            last = e
    if data is None: print("DL FAIL", name, last); continue
    ext = os.path.splitext(src)[1] or ".webm"
    dst = os.path.join(RAW, local + ext); open(dst, "wb").write(data)
    cred[local + ".mp4"] = {"archivo": name, "licencia": lic, "autor": au, "fuente": "https://commons.wikimedia.org/wiki/File:" + fname}
    json.dump(cred, open(CRED, "w"), ensure_ascii=False, indent=1)
    print(f"OK {local:18} {len(data)/1e6:6.1f} MB {src.rsplit('.',3)[-3:]} | {lic:14} | {au[:60]}")
    time.sleep(3)
