"""Completa autor y licencia de las imágenes de Commons de un creditos.json leyendo el wikitext (action=raw), con
reintentos lentos: desde IPs compartidas Commons responde 429 a ráfagas. Uso: python3 tools/creditos_commons.py video/public/ep15/img/creditos.json"""
import json, re, sys, time, urllib.parse, urllib.request
UA = "DocumentalProject/1.0 (https://github.com/marcellomura/documental)"
LIC = [(r"CC-AR-Presidency", "CC BY 2.5 AR (Casa Rosada)"), (r"CC-AR-ArgentinaGobAr", "CC BY 4.0 (argentina.gob.ar)"), (r"cc-zero|CC0", "CC0"),
       (r"PD-|public domain|PD-AR|PD-USGov|PD-NASA", "Dominio público"),
       (r"cc-by-sa-4\.0", "CC BY-SA 4.0"), (r"cc-by-sa-3\.0", "CC BY-SA 3.0"), (r"cc-by-sa-2\.5", "CC BY-SA 2.5"), (r"cc-by-sa-2\.0", "CC BY-SA 2.0"),
       (r"cc-by-4\.0", "CC BY 4.0"), (r"cc-by-3\.0", "CC BY 3.0"), (r"cc-by-2\.5", "CC BY 2.5"), (r"cc-by-2\.0", "CC BY 2.0"), (r"GFDL", "GFDL")]
P = sys.argv[1]
cred = json.load(open(P))
for k, v in cred.items():
    if v.get("licencia") not in (None, "ver fuente") and v.get("autor") not in (None, "?"): continue
    url = "https://commons.wikimedia.org/w/index.php?title=File:" + urllib.parse.quote(v["archivo"].replace(" ", "_")) + "&action=raw"
    raw = None
    for i in range(12):
        try:
            raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read().decode("utf-8", "replace"); break
        except Exception as e:
            time.sleep(20 + 10 * i)
    if raw is None: print("SIN DATOS", k); continue
    lic = next((n for pat, n in LIC if re.search(pat, raw, re.I)), "ver fuente")
    au = re.search(r"\|\s*[Aa]uthor\s*=\s*(.*)", raw)
    au = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", au.group(1)).strip() if au else "?"
    au = re.sub(r"\{\{[^}]*\}\}|\[https?://\S+\s*([^\]]*)\]", r"\1", au).strip()[:100] or "?"
    v["licencia"], v["autor"] = lic, au
    json.dump(cred, open(P, "w"), ensure_ascii=False, indent=1)
    print(f"{k:28s} {lic} | {au}", flush=True)
    time.sleep(15)
print("CREDITOS LISTOS")
