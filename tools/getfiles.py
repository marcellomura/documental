"""Descarga imágenes de Wikimedia Commons (sin API) + registra licencia/autor desde el wikitext."""
import sys, re, time, json, os, urllib.parse, urllib.request, hashlib
UA = "DocumentalProject/1.0 (https://github.com/marcellomura/documental)"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "video", "public", "img"); CRED = os.path.join(OUT, "creditos.json")
cred = json.load(open(CRED)) if os.path.exists(CRED) else {}
def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for i in range(4):
        try:
            d = urllib.request.urlopen(req, timeout=60).read()
            return d if binary else d.decode("utf-8","replace")
        except urllib.error.HTTPError as e:
            if e.code == 404: raise
            err = e; time.sleep(6*(i+1))
    raise err
LIC = [(r"cc-zero|CC0", "CC0"), (r"PD-|public domain|PD-AR", "Dominio público"),
       (r"cc-by-sa-4\.0","CC BY-SA 4.0"),(r"cc-by-sa-3\.0","CC BY-SA 3.0"),(r"cc-by-sa-2\.5","CC BY-SA 2.5"),(r"cc-by-sa-2\.0","CC BY-SA 2.0"),
       (r"cc-by-4\.0","CC BY 4.0"),(r"cc-by-3\.0","CC BY 3.0"),(r"cc-by-2\.5","CC BY 2.5"),(r"cc-by-2\.0","CC BY 2.0"),(r"GFDL","GFDL")]
def lic_of(raw):
    for pat, name in LIC:
        if re.search(pat, raw, re.I): return name
    return "ver fuente"
for arg in sys.argv[1:]:
    local, name = arg.split("=",1)
    fname = name.replace(" ","_")
    try:
        raw = get("https://commons.wikimedia.org/w/index.php?title=File:" + urllib.parse.quote(fname) + "&action=raw")
    except Exception as e:
        print("NO RAW", name, e); continue
    au = re.search(r"\|\s*[Aa]uthor\s*=\s*(.*)", raw)
    au = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", au.group(1)).strip()[:90] if au else "?"
    au = re.sub(r"\{\{[^}]*\}\}|\[https?://\S+\s*([^\]]*)\]", r"\1", au).strip() or "?"
    lic = lic_of(raw)
    md5 = hashlib.md5(fname.encode()).hexdigest()
    base = f"https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}/{urllib.parse.quote(fname)}"
    thumb = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{md5[0]}/{md5[:2]}/{urllib.parse.quote(fname)}/1280px-{urllib.parse.quote(fname)}"
    if fname.lower().endswith((".tif",".tiff")): thumb += ".jpg"
    data = None
    for u in (thumb, base):
        try:
            data = get(u, binary=True); break
        except Exception as e:
            last = e
    if data is None: print("DL FAIL", name, last); continue
    ext = ".png" if data[:4] == b"\x89PNG" else ".jpg"
    dst = os.path.join(OUT, local + ext); open(dst,"wb").write(data)
    cred[local+ext] = {"archivo": name, "licencia": lic, "autor": au, "fuente": "https://commons.wikimedia.org/wiki/File:"+fname}
    from PIL import Image; sz = Image.open(dst).size
    print(f"OK {local+ext:26} {str(sz):12} | {lic:14} | {au[:60]}")
    json.dump(cred, open(CRED,"w"), ensure_ascii=False, indent=1)
    time.sleep(2)
