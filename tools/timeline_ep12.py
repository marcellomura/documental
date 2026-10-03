"""Línea de tiempo del episodio 12 (ARA San Juan): inicio de cada segmento de narración (segundos).
Copia la narración procesada a video/public y las palabras alineadas a video/src/data, con los nombres
propios escritos bien (la locución usa grafías fonéticas: Kráfchik → Krawczyk, Óushen Infíniti → Ocean Infinity).
Además abre silencios DENTRO de un segmento (INSERT): después de "implosión." para el colapso en 3D y después
de "Titanic." para que suene sola la grabación real de la implosión del Titan."""
import json, os, re, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN = os.path.join(ROOT, "audio", "ep12", "final")
G = json.load(open(os.path.join(ROOT, "guion", "ep12_sanjuan.json")))
D = json.load(open(os.path.join(FIN, "durations.json")))
LEAD = 1.0
# pausa DESPUÉS de cada segmento: placa de título tras el gancho, silencios dramáticos en los giros
GAP = {"s01": 3.4, "s02": 0.9, "s03": 1.8, "s04": 1.0, "s05": 1.1, "s06": 1.8, "s07": 1.3, "s08": 1.9, "s09": 1.5}
INSERT = {"s06": [("implosión.", 1.1), ("Titanic.", 3.4)]}
NAMES = 19.0     # los 44 nombres, sin voz
END_HOLD = 6.0   # placa final con el logo

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
NAR = os.path.join(ROOT, "video", "public", "ep12", "narracion"); os.makedirs(NAR, exist_ok=True)
inserts = {}
for k in sorted(D):
    w = wave.open(os.path.join(FIN, f"{k}.wav")); sr = w.getframerate(); p = w.getparams()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16); w.close()
    ins = []
    for word, secs in INSERT.get(k, []):
        i = next(j for j, ww in enumerate(W[k]) if ww["w"] == word)
        cut = (W[k][i]["e"] + W[k][i + 1]["s"]) / 2
        ins.append((cut, secs))
    shift = 0.0; parts = []; last = 0
    for cut, secs in ins:
        c = int(cut * sr); parts += [x[last:c], np.zeros(int(secs * sr), dtype=np.int16)]; last = c
        for ww in W[k]:
            if ww["s"] >= cut + shift: ww["s"] = round(ww["s"] + secs, 3); ww["e"] = round(ww["e"] + secs, 3)
        shift += secs
    parts.append(x[last:])
    y = np.concatenate(parts)
    o = wave.open(os.path.join(NAR, f"{k}.wav"), "wb"); o.setparams(p); o.writeframes(y.tobytes()); o.close()
    D[k] = round(len(y) / sr, 3)
    if ins: inserts[k] = [[round(c + sum(s for _, s in ins[:n]), 3), s] for n, (c, s) in enumerate(ins)]

t = LEAD; starts = {}
for k in sorted(D):
    starts[k] = round(t, 3); t += D[k] + GAP.get(k, 0)
names_at = round(t + 0.6, 3)
total = round(names_at + NAMES + END_HOLD, 3)
W = {k: display(v, G["display"]) for k, v in W.items()}
DATA = os.path.join(ROOT, "video", "src", "data", "ep12"); os.makedirs(DATA, exist_ok=True)
json.dump({"fps": 30, "starts": starts, "durations": D, "inserts": inserts, "names": names_at, "total": total},
          open(os.path.join(DATA, "timeline.json"), "w"), indent=1)
json.dump(W, open(os.path.join(DATA, "words.json"), "w"), ensure_ascii=False, indent=0)
print(json.dumps(starts), "\nINSERTS", inserts, "\nNOMBRES", names_at, "\nTOTAL", total, f"= {int(total//60)}:{total%60:05.2f}")
