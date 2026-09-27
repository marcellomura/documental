"""Línea de tiempo de un reel vertical: segmentos seguidos con una pausa corta, placa final de 4,2 s.
EP=rpb python3 tools/timeline_reel.py  -> video/src/data/<EP>/timeline.json y words.json"""
import json, os, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.environ["EP"]
GAP, START, END = float(os.environ.get("GAP", "0.3")), 0.35, 4.2
AUD = os.path.join(ROOT, "audio", EP, "final")
dur = json.load(open(os.path.join(AUD, "durations.json")))
out = os.path.join(ROOT, "video/src/data", EP); os.makedirs(out, exist_ok=True)
t, segs = START, {}
for sid in sorted(dur):
    segs[sid] = {"at": round(t, 3), "dur": dur[sid]}; t += dur[sid] + GAP
end = round(t - GAP + 0.35, 3)
tl = {"fps": 30, "segs": segs, "endCard": end, "total": round(end + END, 3), "starts": {k: v["at"] for k, v in segs.items()}}
json.dump(tl, open(os.path.join(out, "timeline.json"), "w"), indent=1)
shutil.copy(os.path.join(AUD, "words.json"), os.path.join(out, "words.json"))
print(EP, "total", tl["total"])
