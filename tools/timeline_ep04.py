"""Línea de tiempo del episodio 4 (Súper Niño): inicio de cada segmento de narración (segundos)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "audio", "ep04", "final", "durations.json")))
LEAD = 0.45
# pausa DESPUÉS de cada segmento: título tras el gancho, respiros para los gráficos grandes
GAP = {"s01": 3.2, "s02": 0.6, "s03": 0.8, "s04": 1.3, "s05": 1.1, "s06": 1.1, "s07": 0.9, "s08": 1.0, "s09": 1.3}
END_HOLD = 7.0   # placa final con el logo
t = LEAD; starts = {}
for k in sorted(D):
    starts[k] = round(t, 3); t += D[k] + GAP.get(k, 0)
total = round(t + END_HOLD, 3)
os.makedirs(os.path.join(ROOT, "video", "src", "data", "ep04"), exist_ok=True)
json.dump({"fps": 30, "starts": starts, "durations": D, "total": total}, open(os.path.join(ROOT, "video", "src", "data", "ep04", "timeline.json"), "w"), indent=1)
print(json.dumps(starts), "\nTOTAL", total, f"= {int(total//60)}:{total%60:05.2f}")
