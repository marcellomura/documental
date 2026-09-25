"""Línea de tiempo del episodio 3 (FMI): inicio de cada segmento de narración (segundos)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "audio", "ep03", "final", "durations.json")))
LEAD = 0.45
# pausa DESPUÉS de cada segmento (título, tarjetas de capítulo, silencio antes de la bronca)
GAP = {"s01": 2.7, "s02": 0.5, "s03": 0.55, "s04": 1.0, "s05": 0.95, "s06": 0.95, "s07": 0.95, "s08": 1.2, "s09": 0.8}
END_HOLD = 5.0
t = LEAD; starts = {}
for k in sorted(D):
    starts[k] = round(t, 3); t += D[k] + GAP.get(k, 0)
total = round(t + END_HOLD, 3)
os.makedirs(os.path.join(ROOT, "video", "src", "data", "ep03"), exist_ok=True)
json.dump({"fps": 30, "starts": starts, "durations": D, "total": total}, open(os.path.join(ROOT, "video", "src", "data", "ep03", "timeline.json"), "w"), indent=1)
print(json.dumps(starts), "\nTOTAL", total, f"= {int(total//60)}:{total%60:05.2f}")
