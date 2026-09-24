import sys, re, time, urllib.parse, urllib.request, html as H
UA = "DocumentalProject/1.0 (https://github.com/marcellomura/documental)"
for c in sys.argv[1:]:
    url = "https://commons.wikimedia.org/wiki/Category:" + urllib.parse.quote(c.replace(" ","_"))
    try:
        page = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30).read().decode()
    except Exception as e:
        print("===", c, "ERR", e); continue
    files = []
    for m in re.finditer(r'<div class="gallerytext">\s*<a href="/wiki/File:([^"]+)"[^>]*>.*?</a>\s*<br\s*/?>\s*([^<]*)', page, re.S):
        files.append((urllib.parse.unquote(m.group(1)), H.unescape(m.group(2)).strip()))
    if not files:
        files = [(urllib.parse.unquote(f), "") for f in sorted(set(re.findall(r'href="/wiki/File:([^"]+)"', page)))]
    subc = sorted(set(urllib.parse.unquote(x) for x in re.findall(r'href="/wiki/Category:([^"]+)"', page)))
    print("===", c, len(files), "files")
    for f, info in files[:60]: print("  ", f, "|", info)
    print("   subcats:", [s for s in subc if not re.search("Hidden|Pages|CommonsRoot|Uploaded|Media_needing|License|Self-published|CC-BY|GFDL|Files_", s)][:15])
    time.sleep(1.5)
