"""Línea de tiempo del reel 01 (LA MAESTRA QUE IBA A CABALLO, el caso Nanci Godoy): inicio de cada segmento de
narración (segundos). Copia la narración procesada a video/public y las palabras alineadas a video/src/data, con las
cifras y las comillas de los subtítulos (campo display del guion). Abre silencios DENTRO de los segmentos (INSERT)
después de una frase: «No volvió.», la cita del hijo y la pregunta final."""
import json, os, re, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN = os.path.join(ROOT, "audio", "reel01", "final")
G = json.load(open(os.path.join(ROOT, "guion", "reel01_godoy.json")))
D = json.load(open(os.path.join(FIN, "durations.json")))
LEAD = 0.25      # el reel arranca en movimiento: el caballo ya está cruzando el bañado
# pausa DESPUÉS de cada segmento: el título tras el gancho, la cita de la escuela fantasma y el silencio del hallazgo
GAP = {"r01": 1.5, "r02": 0.5, "r03": 0.6, "r04": 1.0, "r05": 0.7, "r06": 0.7, "r07": 1.6, "r08": 0.6}
# silencios dentro de un segmento: (final exacto de la frase, segundos)
INSERT = {
    "r03": [("Sin señal.", 0.3)],
    "r05": [("No volvió.", 0.5)],
    "r08": [("no lo está.", 0.4)],
    "r09": [("muy fuerte.", 0.3), ("es responsable?", 0.5)],
}
END_HOLD = 3.2   # placa final: el caballo sin jinete frente a la escuela, el nombre y el logo


def display(words, dmap):
    """Reemplaza el texto hablado por el de los subtítulos (cifras, comillas); las claves de varias palabras se funden."""
    keys = sorted(dmap, key=lambda k: -len(k.split()))
    out = []; i = 0
    while i < len(words):
        for k in keys:
            ks = k.split(); n = len(ks)
            chunk = words[i:i + n]
            if len(chunk) == n and all(c["w"] == kw for c, kw in zip(chunk, ks)):
                out.append({"w": dmap[k], "s": chunk[0]["s"], "e": chunk[-1]["e"]}); i += n; break
            if len(chunk) == n and all(re.sub(r"[^\wÁÉÍÓÚáéíóúñÑüÜ]", "", c["w"]) == re.sub(r"[^\wÁÉÍÓÚáéíóúñÑüÜ]", "", kw) for c, kw in zip(chunk, ks)):
                tail = re.sub(r"^.*?[\wÁÉÍÓÚáéíóúñÑüÜ]+", "", chunk[-1]["w"]) if not re.search(r"[^\w]$", k) else ""
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
NAR = os.path.join(ROOT, "video", "public", "reel01", "narracion"); os.makedirs(NAR, exist_ok=True)
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
end_at = round(t + 0.4, 3)
total = round(end_at + END_HOLD, 3)
W = {k: display(v, G["display"]) for k, v in W.items()}
DATA = os.path.join(ROOT, "video", "src", "data", "reel01"); os.makedirs(DATA, exist_ok=True)
json.dump({"fps": 30, "starts": starts, "durations": D, "inserts": inserts, "end": end_at, "total": total},
          open(os.path.join(DATA, "timeline.json"), "w"), indent=1)
json.dump(W, open(os.path.join(DATA, "words.json"), "w"), ensure_ascii=False, indent=0)
print("inicios", starts)
print("silencios", inserts)
print("fin de la voz", end_at, "total", total, f"({int(total // 60)}:{total % 60:04.1f})")
