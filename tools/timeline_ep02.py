"""Línea de tiempo del episodio 2: inicio de cada segmento de narración (segundos)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "audio", "ep02", "final", "durations.json")))
LEAD = 0.4
# pausa ANTES de cada segmento (título / tarjetas de "track" tipo vinilo)
PRE = {"s02": 3.4, "s03": 1.35, "s04": 1.35, "s05": 1.35, "s06": 1.35, "s07": 1.35, "s08": 1.35, "s09": 1.35, "s10": 1.35, "s11": 1.1}
END_HOLD = 4.2
t = LEAD; starts = {}
for k in sorted(D):
    t += PRE.get(k, 0)
    starts[k] = round(t, 3); t += D[k]
total = round(t + END_HOLD, 3)
json.dump({"fps": 30, "starts": starts, "durations": D, "total": total}, open(os.path.join(ROOT, "video", "src", "data", "ep02", "timeline.json"), "w"), indent=1)
print(json.dumps(starts), "\nTOTAL", total, f"= {int(total//60)}:{total%60:05.2f}")
