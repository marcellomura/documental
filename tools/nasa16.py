"""Buscador mínimo de la biblioteca de imágenes y video de la NASA (images.nasa.gov, dominio público salvo aviso).
  python3 tools/nasa16.py buscar "iss aurora" video [n]     → lista id · fecha · título
  python3 tools/nasa16.py archivos <nasa_id>                → archivos disponibles (elige el tamaño al bajar)"""
import json, sys, urllib.parse, urllib.request
UA = {"User-Agent": "Mozilla/5.0 (CONTEXTO documental educativo)"}
def get(u):
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40))
if sys.argv[1] == "buscar":
    q = sys.argv[2]; mt = sys.argv[3] if len(sys.argv) > 3 else "video"; n = int(sys.argv[4]) if len(sys.argv) > 4 else 12
    d = get("https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": q, "media_type": mt}))
    for it in d["collection"]["items"][:n]:
        m = it["data"][0]
        print(m["nasa_id"], "·", m.get("date_created", "")[:10], "·", m.get("center", ""), "·", m["title"][:90], "·", (m.get("description") or "")[:110].replace("\n", " "))
else:
    d = get("https://images-api.nasa.gov/asset/" + urllib.parse.quote(sys.argv[2]))
    for it in d["collection"]["items"]:
        print(it["href"])
