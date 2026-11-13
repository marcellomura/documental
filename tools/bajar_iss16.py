"""Descarga las fotos originales y la posición de las cuatro pasadas de la Estación Espacial que usa el ep16
(Gateway to Astronaut Photography of Earth, NASA JSC; dominio público). Después: python3 -I tools/iss16.py
Uso: python3 -I tools/bajar_iss16.py   (≈ 900 MB en raw/ep16/iss, ignorado por git)"""
import concurrent.futures as cf, html, json, os, re, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw/ep16/iss")
UA = {"User-Agent": "Mozilla/5.0 (documental educativo)"}
SEQ = {"boreal": ("ISS030", 271717, 271798, 3), "namerica": ("ISS030", 260394, 260709, 5),
       "carib": ("ISS031", 169858, 170189, 8), "term": ("ISS030", 140634, 141048, 10)}


def get(u, tries=4):
    for _ in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=120).read()
        except Exception:
            pass
    return b""


def foto(mis, f, d):
    p = os.path.join(d, f"{f}.jpg")
    if not (os.path.exists(p) and os.path.getsize(p) > 50000):
        b = get(f"https://eol.jsc.nasa.gov/DatabaseImages/ESC/large/{mis}/{mis}-E-{f}.JPG")
        if b: open(p, "wb").write(b)


def meta(mis, f):
    s = get(f"https://eol.jsc.nasa.gov/SearchPhotos/photo.pl?mission={mis}&roll=E&frame={f}").decode("utf-8", "replace")
    s = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))
    r = {"f": f}
    m = re.search(r"Spacecraft nadir point:\s*([\d.]+)°\s*([NS]),\s*([\d.]+)°\s*([EW])", s)
    if m:
        r["lat"] = float(m.group(1)) * (-1 if m.group(2) == "S" else 1); r["lon"] = float(m.group(3)) * (-1 if m.group(4) == "W" else 1)
    for k, pat in (("fecha", r"Date taken\s*(\d{4}\.\d{2}\.\d{2})"), ("hora", r"Time taken\s*(\d{2}:\d{2}:\d{2})")):
        m = re.search(pat, s)
        if m: r[k] = m.group(1)
    m = re.search(r"\((\d+)\s*km\)", s)
    if m: r["alt"] = int(m.group(1))
    return r


out = {}
with cf.ThreadPoolExecutor(6) as ex:
    for name, (mis, a, b, st) in SEQ.items():
        d = os.path.join(RAW, name); os.makedirs(d, exist_ok=True)
        list(ex.map(lambda f: foto(mis, f, d), range(a, b + 1)))
        fr = list(range(a, b + 1, st)) + ([b] if (b - a) % st else [])
        out[name] = sorted(ex.map(lambda f: meta(mis, f), fr), key=lambda r: r["f"])
        print(name, len(os.listdir(d)), "fotos")
os.makedirs(os.path.join(RAW, "meta"), exist_ok=True)
json.dump(out, open(os.path.join(RAW, "meta", "meta.json"), "w"), indent=0)
