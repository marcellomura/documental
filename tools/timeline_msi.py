"""Línea de tiempo del video de Messi y la reventa (EP=msi): segmentos seguidos con pausas de guion/msi_gaps.json y placa final.
python3 tools/timeline_msi.py -> video/src/data/msi/timeline.json y words.json"""
import json, os, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.environ.get("EP", "msi")
AUD = os.path.join(ROOT, "audio", EP, "final")
dur = json.load(open(os.path.join(AUD, "durations.json")))
# pausa ANTES de cada segmento (s): intro con aire para el título, capítulos con placa
GAPS = json.load(open(os.path.join(ROOT, "guion", "" + EP + "_gaps.json")))
END = float(os.environ.get("END", "5.5"))
out = os.path.join(ROOT, "video/src/data", EP); os.makedirs(out, exist_ok=True)
t, segs = 0.0, {}
for sid in sorted(dur):
    t += GAPS.get(sid, 0.35)
    segs[sid] = {"at": round(t, 3), "dur": dur[sid]}; t += dur[sid]
tl = {"fps": 30, "segs": segs, "total": round(t + END, 3)}
json.dump(tl, open(os.path.join(out, "timeline.json"), "w"), indent=1)
shutil.copy(os.path.join(AUD, "words.json"), os.path.join(out, "words.json"))
print(EP, "total", tl["total"])
