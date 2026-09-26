"""Línea de tiempo del episodio "¿El país más rico del mundo?" (EP=rico):
segmentos seguidos con pausas definidas en GAPS (respiro para cortes y golpes), placa final.
python3 tools/timeline_rico.py -> video/src/data/rico/timeline.json y words.json"""
import json, os, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = "rico"
AUD = os.path.join(ROOT, "audio", EP, "final")
dur = json.load(open(os.path.join(AUD, "durations.json")))
# pausa ANTES de cada segmento (s): intro con aire para el título, capítulos con placa
GAPS = json.load(open(os.path.join(ROOT, "guion", "rico_gaps.json")))
END = 6.5
out = os.path.join(ROOT, "video/src/data", EP); os.makedirs(out, exist_ok=True)
t, segs = 0.0, {}
for sid in sorted(dur):
    t += GAPS.get(sid, 0.35)
    segs[sid] = {"at": round(t, 3), "dur": dur[sid]}; t += dur[sid]
tl = {"fps": 30, "segs": segs, "total": round(t + END, 3)}
json.dump(tl, open(os.path.join(out, "timeline.json"), "w"), indent=1)
shutil.copy(os.path.join(AUD, "words.json"), os.path.join(out, "words.json"))
print(EP, "total", tl["total"])
