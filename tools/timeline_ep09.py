"""Línea de tiempo del episodio 9 (Vaca Muerta): inicio de cada segmento de narración (segundos).
También copia la narración procesada y las palabras alineadas a video/public y video/src/data."""
import json, os, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN = os.path.join(ROOT, "audio", "ep09", "final")
D = json.load(open(os.path.join(FIN, "durations.json")))
LEAD = 0.45
# pausa DESPUÉS de cada segmento: placa de título tras el gancho, respiros para los gráficos grandes
GAP = {"s01": 3.0, "s02": 0.7, "s03": 0.8, "s04": 0.7, "s05": 0.9, "s06": 0.8, "s07": 0.9, "s08": 0.8, "s09": 1.0}
END_HOLD = 5.8   # placa final con el logo
t = LEAD; starts = {}
for k in sorted(D):
    starts[k] = round(t, 3); t += D[k] + GAP.get(k, 0)
total = round(t + END_HOLD, 3)
DATA = os.path.join(ROOT, "video", "src", "data", "ep09"); os.makedirs(DATA, exist_ok=True)
json.dump({"fps": 30, "starts": starts, "durations": D, "total": total}, open(os.path.join(DATA, "timeline.json"), "w"), indent=1)
shutil.copy(os.path.join(FIN, "words.json"), os.path.join(DATA, "words.json"))
NAR = os.path.join(ROOT, "video", "public", "ep09", "narracion"); os.makedirs(NAR, exist_ok=True)
for k in D: shutil.copy(os.path.join(FIN, f"{k}.wav"), os.path.join(NAR, f"{k}.wav"))
print(json.dumps(starts), "\nTOTAL", total, f"= {int(total//60)}:{total%60:05.2f}")
