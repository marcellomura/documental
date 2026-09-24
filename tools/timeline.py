"""Línea de tiempo maestra: dónde arranca cada segmento de narración (segundos)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "audio", "final", "durations.json")))
LEAD = 0.45
# pausa DESPUÉS de cada segmento
GAP = {"s01":0.45, "s02":1.9, "s03":0.45, "s04":0.9, "s05":0.85, "s06":0.75,
       "s07":0.8, "s08":0.85, "s09":0.85, "s10":0.75, "s11":0.85}
END_HOLD = 3.6
t = LEAD; starts = {}
for k in sorted(D):
    starts[k] = round(t, 3); t += D[k] + GAP.get(k, 0)
total = round(t + END_HOLD, 3)
out = {"fps": 30, "starts": starts, "durations": D, "total": total}
json.dump(out, open(os.path.join(ROOT, "video", "src", "data", "timeline.json"), "w"), indent=1)
print(json.dumps(starts), "\nTOTAL", total, "s =", f"{int(total//60)}:{total%60:05.2f}")
