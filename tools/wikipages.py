"""Lista archivos de imagen usados en artículos de Wikipedia (HTML cacheado, sin API)."""
import sys, re, time, urllib.parse, urllib.request
UA = "DocumentalProject/1.0 (https://github.com/marcellomura/documental)"
def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for i in range(3):
        try: return urllib.request.urlopen(req, timeout=30).read().decode("utf-8","replace")
        except Exception as e: err=e; time.sleep(4)
    raise err
for t in sys.argv[1:]:
    host = "es.wikipedia.org"
    if "|" in t: host, t = t.split("|",1)
    html = get(f"https://{host}/wiki/" + urllib.parse.quote(t.replace(" ","_")))
    files = sorted(set(re.findall(r'/wiki/(?:Archivo|File|Imagen):([^"#?]+)"', html)))
    files = [urllib.parse.unquote(f) for f in files if not re.search(r"\.svg$|Flag|Bandera|Escudo|icon|Logo|Commons-logo|Wiki", f, re.I)]
    print("===", t); [print("  ", f) for f in files]
    time.sleep(1)
