"""Genera subtítulos .srt (español) a partir de words.json y la línea de tiempo."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# EP=ep02 OUT=el_robo_del_siglo_subtitulos_es.srt python3 tools/srt.py  (sin EP: episodio 1)
DATA = os.path.join(ROOT, "video/src/data", os.environ.get("EP", ""))
TL = json.load(open(os.path.join(DATA, "timeline.json")))
W = json.load(open(os.path.join(DATA, "words.json")))
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
cues = []
for seg in sorted(W):
    base = TL["starts"][seg]; cur = []
    for w in W[seg]:
        cur.append(w)
        txt = " ".join(x["w"] for x in cur)
        end_sentence = w["w"][-1] in ".?!:»" or w["w"].endswith("...")
        comma = w["w"].endswith(",")
        if (end_sentence and len(txt) >= 14) or (comma and len(txt) > 55) or len(txt) > 78 or w is W[seg][-1]:
            cues.append((base + cur[0]["s"], base + cur[-1]["e"] + 0.15, txt)); cur = []
# cifras en vez de números deletreados (el guion está escrito para la voz)
NUM = [("ciento cuarenta y tres", "143"), ("dos mil seis", "2006"), ("dos mil diez", "2010"), ("dos mil veinte", "2020"),
       ("trescientos", "300"), ("veintitrés", "23"), ("diecinueve millones", "19 millones"), ("dos millones", "2 millones"),
       ("nueve y quince años", "9 y 15 años"), ("veintiuno", "21"), ("Viernes trece", "Viernes 13"), ("siete de la tarde", "7 de la tarde"),
       ("de cien cajas", "de 100 cajas")] if os.environ.get("EP") else []
def numerals(t):
    for a, b in NUM: t = re.sub(r"\b" + a + r"\b", b, t, flags=re.I)
    return t
cues = [(a, b, numerals(t)) for a, b, t in cues]
out = []
for i, (a, b, t) in enumerate(cues, 1):
    if i < len(cues): b = min(b, cues[i][0] - 0.02)
    # partir en dos líneas si es largo
    if len(t) > 42:
        words = t.split(); half = len(t) // 2; acc = 0
        for k, wd in enumerate(words):
            acc += len(wd) + 1
            if acc >= half: t = " ".join(words[: k + 1]) + "\n" + " ".join(words[k + 1:]); break
    out.append(f"{i}\n{ts(a)} --> {ts(b)}\n{t.replace('«', '“').replace('»', '”')}\n")
open(os.path.join(ROOT, "entrega", os.environ.get("OUT", "13_ceros_subtitulos_es.srt")), "w").write("\n".join(out))
print(len(out), "subtítulos")
