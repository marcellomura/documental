"""Busca en Commons con la API y muestra resolución y licencia. Uso: python3 tools/commonsapi.py "consulta" [min_ancho]"""
import sys, json, time, urllib.parse, urllib.request
UA = "DocumentalProject/1.0 (https://github.com/marcellomura/documental)"
q = sys.argv[1]; minw = int(sys.argv[2]) if len(sys.argv) > 2 else 1900
p = {"action": "query", "format": "json", "generator": "search", "gsrsearch": q + " filetype:bitmap", "gsrnamespace": 6, "gsrlimit": 40,
     "prop": "imageinfo", "iiprop": "size|extmetadata", "iiextmetadatafilter": "LicenseShortName|Artist"}
u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)
d = {}
for i in range(3):
    try: d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=40)); break
    except Exception as e: time.sleep(5 * (i + 1))
rows = []
for pg in d.get("query", {}).get("pages", {}).values():
    ii = pg["imageinfo"][0]; m = ii.get("extmetadata", {})
    if ii["width"] >= minw:
        rows.append((ii["width"], ii["height"], pg["title"][5:], m.get("LicenseShortName", {}).get("value", "?")))
print(f"=== {q}: {len(rows)} >= {minw}px")
for r in sorted(rows, key=lambda r: -r[0])[:20]: print(f"  {r[0]}x{r[1]}  {r[3]:14}  {r[2]}")
