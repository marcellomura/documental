"""Genera subtítulos .srt (español) a partir de words.json y la línea de tiempo."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "video/src/data/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/words.json")))
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
open(os.path.join(ROOT, "entrega", "13_ceros_subtitulos_es.srt"), "w").write("\n".join(out))
print(len(out), "subtítulos")
