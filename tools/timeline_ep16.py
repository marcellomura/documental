"""Línea de tiempo del ep16 (EL PUNTO DÉBIL). El largo usa s01-s15; el vertical no tiene locución propia: reusa
s01, s04, s06, s08 y s13 del largo y agrega v01 (la invitación al canal).
Copia la narración procesada a video/public/ep16/narracion (con los silencios de INSERT adentro de cada segmento) y
escribe video/src/data/ep16/{timeline,words}.json y video/src/data/ep16v/{timeline,words}.json.
Uso: python3 tools/timeline_ep16.py"""
import json, os, re, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN = os.path.join(ROOT, "audio", "ep16", "final")
G = json.load(open(os.path.join(ROOT, "guion", "ep16_anomalia.json")))

# silencios adentro de los segmentos (después de la frase), iguales para el largo y el vertical
INSERT = {
    "s01": [("luz.", 0.5), ("Sudamérica.", 0.35)],
    "s02": [("planeta.", 0.3)],
    "s03": [("saturó.", 0.5), ("todo.", 0.35)],
    "s04": [("nuestro.", 0.4)],
    "s06": [("danzantes.", 0.4)],
    "s07": [("calma.", 0.7)],
    "s08": [("tercio.", 0.6), ("Chaco.", 0.5)],
    "s10": [("ciento veinte años.", 0.5), ("planeta.", 0.4)],
    "s11": [("entra.", 0.4)],
    "s12": [("mil años.", 0.4), ("pasado.", 0.3)],
    "s13": [("Nada.", 0.5)],
    "s15": [("abolladura.", 0.4), ("nada.", 0.5)],
}
LARGO = dict(
    orden=[f"s{i:02d}" for i in range(1, 16)],
    LEAD=3.2,          # la Estación Espacial sobre la Tierra de noche antes de la primera palabra
    GAP={"s01": 6.4, "s02": 1.6, "s03": 2.2, "s04": 2.6, "s05": 1.0, "s06": 2.0, "s07": 3.4, "s08": 2.4, "s09": 1.4,
         "s10": 2.6, "s11": 2.0, "s12": 2.2, "s13": 1.0, "s14": 1.8},
    END_HOLD=9.0)
VERT = dict(
    orden=G["vertical_orden"],
    LEAD=0.3,
    GAP={"s01": 1.9, "s04": 0.7, "s06": 0.7, "s08": 0.9, "s13": 0.8},
    END_HOLD=4.2)


def display(words, dmap):
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
    ps = phrase.split(); n = len(ps)
    hits = [i + n - 1 for i in range(len(words) - n + 1) if [w["w"] for w in words[i:i + n]] == ps]
    if len(hits) != 1: raise SystemExit(f"la frase «{phrase}» aparece {len(hits)} veces")
    return hits[0]


W = {**json.load(open(os.path.join(FIN, "words_s.json"))), **json.load(open(os.path.join(FIN, "words_v.json")))}
NAR = os.path.join(ROOT, "video", "public", "ep16", "narracion"); os.makedirs(NAR, exist_ok=True)
D, inserts = {}, {}
for k in sorted(W):
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
W = {k: display(v, G["display"]) for k, v in W.items()}

for ep, cfg in (("ep16", LARGO), ("ep16v", VERT)):
    t = cfg["LEAD"]; starts = {}
    for k in cfg["orden"]:
        starts[k] = round(t, 3); t += D[k] + cfg["GAP"].get(k, 0)
    end_at = round(t + 0.4, 3); total = round(end_at + cfg["END_HOLD"], 3)
    DATA = os.path.join(ROOT, "video", "src", "data", ep); os.makedirs(DATA, exist_ok=True)
    json.dump({"fps": 30, "orden": cfg["orden"], "starts": starts, "durations": {k: D[k] for k in cfg["orden"]},
               "inserts": {k: v for k, v in inserts.items() if k in cfg["orden"]}, "end": end_at, "total": total},
              open(os.path.join(DATA, "timeline.json"), "w"), indent=1)
    json.dump({k: W[k] for k in cfg["orden"]}, open(os.path.join(DATA, "words.json"), "w"), ensure_ascii=False, indent=0)
    print(ep, "inicios", starts)
    print(ep, "fin de la voz", end_at, "total", total, f"({int(total // 60)}:{total % 60:04.1f})")
