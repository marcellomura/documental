"""Línea de tiempo del ep15 (EL HOMBRE DE LAS MIL CARAS): el documental largo (EP=ep15, segmentos s01-s11) y el vertical
(EP=ep15v, v01-v05). Copia la narración procesada a video/public/<EP>/narracion, abre silencios DENTRO de los segmentos
(INSERT) después de las frases que necesitan aire, y escribe video/src/data/<EP>/{timeline,words}.json con la
ortografía real de los nombres en los subtítulos (campo display del guion: Menoquio → Menocchio, etc.)."""
import json, os, re, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.environ.get("EP", "ep15")
FIN = os.path.join(ROOT, "audio", EP, "final")
G = json.load(open(os.path.join(ROOT, "guion", "ep15_menocchio.json")))
D = json.load(open(os.path.join(FIN, "durations.json")))
CFG = {
    "ep15": dict(
        LEAD=3.6,       # apertura en frío: el pueblo amanece antes de la primera palabra
        # pausa DESPUÉS de cada segmento: la secuencia de título y las placas de capítulo
        GAP={"s01": 6.5, "s02": 2.6, "s03": 2.4, "s04": 1.2, "s05": 3.0, "s06": 1.6, "s07": 1.2, "s08": 2.4, "s09": 2.6, "s10": 2.6},
        INSERT={
            "s01": [("cara.", 0.5)],
            "s03": [("dos.", 1.0)],
            "s04": [("ácido.", 0.6)],
            "s05": [("Nozzi.", 0.9)],
            "s06": [("Norte.", 0.5)],
            "s07": [("España.", 0.6), ("asfixiados.", 0.9)],
            "s08": [("sobrevivió.", 0.7), ("tartamudeo.", 0.6)],
            "s10": [("Caramta.", 0.7)],
            "s11": [("confirmó.", 0.4)],
        },
        END_HOLD=8.0),  # el monte, el logo y los créditos
    "ep15v": dict(
        LEAD=0.3,
        GAP={"v01": 1.8, "v02": 0.6, "v03": 0.7, "v04": 0.8},
        INSERT={"v02": [("cemento.", 0.6)], "v03": [("Menoquio,", 0.3)], "v04": [("tartamudeo.", 0.3)]},
        END_HOLD=4.2),  # placa final con el llamado a YouTube
}[EP]


def display(words, dmap):
    """Reemplaza el texto hablado por el de los subtítulos; las claves de varias palabras se funden en una."""
    keys = sorted(dmap, key=lambda k: -len(k.split()))
    out = []; i = 0
    strip = lambda s: re.sub(r"[^\wÁÉÍÓÚáéíóúñÑüÜ]", "", s)
    while i < len(words):
        for k in keys:
            ks = k.split(); n = len(ks)
            chunk = words[i:i + n]
            if len(chunk) == n and all(strip(c["w"]) == strip(kw) for c, kw in zip(chunk, ks)):
                lead = re.match(r"^[^\wÁÉÍÓÚáéíóúñÑüÜ]*", chunk[0]["w"]).group(0)
                tail = re.search(r"[^\wÁÉÍÓÚáéíóúñÑüÜ]*$", chunk[-1]["w"]).group(0)
                out.append({"w": lead + dmap[k] + tail, "s": chunk[0]["s"], "e": chunk[-1]["e"]}); i += n; break
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
NAR = os.path.join(ROOT, "video", "public", "ep15", "narracion" if EP == "ep15" else "narracion_v"); os.makedirs(NAR, exist_ok=True)
inserts = {}
for k in sorted(D):
    w = wave.open(os.path.join(FIN, f"{k}.wav")); sr = w.getframerate(); p = w.getparams()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16); w.close()
    ins = []
    for phrase, secs in CFG["INSERT"].get(k, []):
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

t = CFG["LEAD"]; starts = {}
for k in sorted(D):
    starts[k] = round(t, 3); t += D[k] + CFG["GAP"].get(k, 0)
end_at = round(t + 0.4, 3)
total = round(end_at + CFG["END_HOLD"], 3)
W = {k: display(v, G["display"]) for k, v in W.items()}
DATA = os.path.join(ROOT, "video", "src", "data", EP); os.makedirs(DATA, exist_ok=True)
json.dump({"fps": 30, "starts": starts, "durations": D, "inserts": inserts, "end": end_at, "total": total},
          open(os.path.join(DATA, "timeline.json"), "w"), indent=1)
json.dump(W, open(os.path.join(DATA, "words.json"), "w"), ensure_ascii=False, indent=0)
print("inicios", starts)
print("silencios", inserts)
print("fin de la voz", end_at, "total", total, f"({int(total // 60)}:{total % 60:04.1f})")
