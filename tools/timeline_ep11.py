"""Línea de tiempo del episodio 11 (El Sol de Perón): inicio de cada segmento de narración (segundos).
Copia la narración procesada a video/public y las palabras alineadas a video/src/data, con los nombres
propios escritos bien (la locución usa grafías fonéticas: Ríjter → Richter, Spítser → Spitzer)."""
import json, os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN = os.path.join(ROOT, "audio", "ep11", "final")
G = json.load(open(os.path.join(ROOT, "guion", "ep11_huemul.json")))
D = json.load(open(os.path.join(FIN, "durations.json")))
LEAD = 0.45
# pausa DESPUÉS de cada segmento: placa de título tras el gancho, silencios dramáticos en los giros
GAP = {"s01": 3.0, "s02": 0.9, "s03": 0.8, "s04": 1.0, "s05": 1.3, "s06": 1.1, "s07": 1.7, "s08": 1.0, "s09": 1.0, "s10": 1.1}
END_HOLD = 5.8   # placa final con el logo
t = LEAD; starts = {}
for k in sorted(D):
    starts[k] = round(t, 3); t += D[k] + GAP.get(k, 0)
total = round(t + END_HOLD, 3)

def display(words, dmap):
    """Reemplaza las grafías fonéticas por las reales; las claves de varias palabras se funden en una."""
    keys = sorted(dmap, key=lambda k: -len(k.split()))
    out = []; i = 0
    while i < len(words):
        for k in keys:
            ks = k.split(); n = len(ks)
            chunk = words[i:i + n]
            if len(chunk) == n and all(re.sub(r"[^\wÁÉÍÓÚáéíóúñÑüÜöÖ]", "", c["w"]) == kw for c, kw in zip(chunk, ks)):
                tail = re.sub(r"^[\wÁÉÍÓÚáéíóúñÑüÜöÖ]+", "", chunk[-1]["w"])   # puntuación pegada a la última
                out.append({"w": dmap[k] + tail, "s": chunk[0]["s"], "e": chunk[-1]["e"]}); i += n; break
        else:
            out.append(words[i]); i += 1
    return out

W = json.load(open(os.path.join(FIN, "words.json")))
W = {k: display(v, G["display"]) for k, v in W.items()}
DATA = os.path.join(ROOT, "video", "src", "data", "ep11"); os.makedirs(DATA, exist_ok=True)
json.dump({"fps": 30, "starts": starts, "durations": D, "total": total}, open(os.path.join(DATA, "timeline.json"), "w"), indent=1)
json.dump(W, open(os.path.join(DATA, "words.json"), "w"), ensure_ascii=False, indent=0)
NAR = os.path.join(ROOT, "video", "public", "ep11", "narracion"); os.makedirs(NAR, exist_ok=True)
for k in D: shutil.copy(os.path.join(FIN, f"{k}.wav"), os.path.join(NAR, f"{k}.wav"))
print(json.dumps(starts), "\nTOTAL", total, f"= {int(total//60)}:{total%60:05.2f}")
