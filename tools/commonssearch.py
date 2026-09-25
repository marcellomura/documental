"""Busca archivos en Wikimedia Commons vía Special:MediaSearch (sin API). Uso: python3 tools/commonssearch.py "consulta" [image|video]"""
import sys, re, time, urllib.parse, urllib.request, html as H
UA = "DocumentalProject/1.0 (https://github.com/marcellomura/documental)"
q = sys.argv[1]; kind = sys.argv[2] if len(sys.argv) > 2 else "image"
url = "https://commons.wikimedia.org/w/index.php?" + urllib.parse.urlencode({"search": q, "title": "Special:MediaSearch", "type": kind})
page = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40).read().decode()
seen = []
for m in re.findall(r'File:([^"&\\]+?\.(?:jpe?g|png|webm|ogv|mp4|tiff?|gif))', page, re.I):
    f = urllib.parse.unquote(H.unescape(m)).replace("_", " ")
    if f not in seen: seen.append(f)
print(f"=== {q} ({kind}): {len(seen)}")
for f in seen[:25]: print("  ", f)
