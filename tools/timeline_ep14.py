"""Línea de tiempo del episodio 14 (CAMPO DEL CIELO): inicio de cada segmento de narración (segundos).
Copia la narración procesada a video/public y las palabras alineadas a video/src/data, con la ortografía real de los
nombres (la locución usa grafías fonéticas: Kladni → Chladni, Jag → Haag, Mejía → Mexía). Abre silencios DENTRO de los
segmentos (INSERT) después de una frase: el impacto, la voladura, las revelaciones y los golpes dramáticos."""
import json, os, re, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN = os.path.join(ROOT, "audio", "ep14", "final")
G = json.load(open(os.path.join(ROOT, "guion", "ep14_cielo.json")))
D = json.load(open(os.path.join(FIN, "durations.json")))
LEAD = 2.6       # negro con estrellas, un zumbido metálico y la mesa que aparece
# pausa DESPUÉS de cada segmento: secuencia de título tras el gancho y respiros en los cambios de época
GAP = {"s01": 6.8, "s02": 1.6, "s03": 1.4, "s04": 1.8, "s05": 1.4, "s06": 1.6, "s07": 1.6, "s08": 1.4}
# silencios dentro de un segmento: (final exacto de la frase, segundos)
INSERT = {
    "s01": [("había caído del cielo.", 0.8), ("le puso pólvora.", 0.9), ("la volvió a ver.", 0.6), ("la mesa, no.", 0.5)],
    "s02": [("kilómetros por hora.", 0.5), ("sobre la llanura.", 2.6), ("más de cien metros.", 0.4)],
    "s03": [("nadie puede volver.", 0.6), ("parte de plata.", 0.9), ("¿Plata?", 0.4)],
    "s04": [("El Mesón de Fierro.", 1.2), ("que volé.", 0.3), ("Pólvora.", 1.3), ("Se equivocaba.", 0.6)],
    "s05": [("también se perdió.", 0.6), ("hechas de cielo?", 0.4), ("pudo comprobar.", 0.5)],
    "s06": [("alguien la quiere.", 0.9), ("va el meteorito.", 0.6)],
    "s07": [("el viaje se canceló.", 0.6), ("de forma ilegal.", 0.6), ("ochocientos kilos.", 0.8)],
    "s08": [("de la mesa, nada.", 0.8), ("Y no aparece.", 0.6), ("dónde estaba.", 0.8), ("casi adivinar.", 0.6)],
    "s09": [("monte chaqueño.", 1.2), ("hace siglos?", 0.6)],
}
END_HOLD = 9.0   # placa final: fuentes, logo, suscripción y pantalla final de YouTube

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

def find_end(words, phrase):
    """Índice de la última palabra de la frase (coincidencia exacta, con puntuación) dentro del segmento."""
    ps = phrase.split(); n = len(ps)
    hits = [i + n - 1 for i in range(len(words) - n + 1) if [w["w"] for w in words[i:i + n]] == ps]
    if len(hits) != 1: raise SystemExit(f"la frase «{phrase}» aparece {len(hits)} veces")
    return hits[0]

W = json.load(open(os.path.join(FIN, "words.json")))
NAR = os.path.join(ROOT, "video", "public", "ep14", "narracion"); os.makedirs(NAR, exist_ok=True)
inserts = {}
for k in sorted(D):
    w = wave.open(os.path.join(FIN, f"{k}.wav")); sr = w.getframerate(); p = w.getparams()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16); w.close()
    ins = []
    for phrase, secs in INSERT.get(k, []):
        i = find_end(W[k], phrase)
        cut = (W[k][i]["e"] + W[k][i + 1]["s"]) / 2 if i + 1 < len(W[k]) else W[k][i]["e"] + 0.05
        ins.append((cut, secs))
    ins.sort()
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
end_at = round(t + 0.6, 3)
total = round(end_at + END_HOLD, 3)
W = {k: display(v, G["display"]) for k, v in W.items()}
DATA = os.path.join(ROOT, "video", "src", "data", "ep14"); os.makedirs(DATA, exist_ok=True)
json.dump({"fps": 30, "starts": starts, "durations": D, "inserts": inserts, "end": end_at, "total": total},
          open(os.path.join(DATA, "timeline.json"), "w"), indent=1)
json.dump(W, open(os.path.join(DATA, "words.json"), "w"), ensure_ascii=False, indent=0)
print(json.dumps(starts), "\nFINAL", end_at, "\nTOTAL", total, f"= {int(total//60)}:{total%60:05.2f}")
