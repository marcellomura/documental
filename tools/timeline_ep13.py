"""Línea de tiempo del episodio 13 (EL LOTE 31.202, edición especial): inicio de cada segmento de narración (segundos).
Copia la narración procesada a video/public y las palabras alineadas a video/src/data, con la ortografía real de las
siglas y los nombres (la locución usa grafías fonéticas: hache ele be → HLB, Anmat → ANMAT, Klebsiela neumonie →
Klebsiella pneumoniae). Abre silencios DENTRO de los segmentos (INSERT) después de una frase: las placas de cada
barrera, los golpes dramáticos y el montaje final de las fechas."""
import json, os, re, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN = os.path.join(ROOT, "audio", "ep13", "final")
G = json.load(open(os.path.join(ROOT, "guion", "ep13_fentanilo.json")))
D = json.load(open(os.path.join(FIN, "durations.json")))
LEAD = 2.0       # negro, el teléfono se ilumina y llega el primer mensaje
# pausa DESPUÉS de cada segmento: secuencia de título tras el gancho, placas de barrera y silencios en los giros
GAP = {"s01": 7.5, "s02": 1.2, "s03": 1.4, "s04": 1.2, "s05": 1.6, "s06": 1.8, "s07": 2.4, "s08": 2.0,
       "s09": 1.8, "s10": 2.2, "s11": 1.8}
# silencios dentro de un segmento: (final exacto de la frase, segundos)
INSERT = {
    "s01": [("vienen a inspeccionar?", 0.5), ("Y le explica por qué.", 0.4), ("lo que no tenía que ver.", 0.5),
            ("noventa muertes.", 0.8), ("Las atravesó todas.", 0.9)],
    "s02": [("ni una sola bacteria.", 0.5)],
    "s03": [("de punta a punta.", 1.6)],
    "s04": [("por encima del límite.", 1.2), ("y el lote sale.", 1.2)],
    "s05": [("Y no se tomaron medidas.", 1.2)],
    "s06": [("reportes de productos.", 0.5), ("tirar reactivos vencidos.", 0.8), ("recién un mes después.", 0.5)],
    "s07": [("nunca se firmó.", 1.0), ("parte de su equipo.", 0.5), ("por primera vez.", 0.5)],
    "s08": [("es nuestra responsabilidad.", 0.6), ("está en la calle.", 0.5), ("sí, lo sé.", 1.2), ("porque Mario pregunta.", 0.6)],
    "s09": [("en esa lista.", 0.4), ("Las nueve fetas estaban alineadas.", 3.0)],
    "s10": [("otra marca, ninguna.", 0.8), ("un correo a la Anmat.", 0.5)],
    "s11": [("hoy quemamos todo.", 1.0), ("si se desviaron.", 0.5), ("por sus enfermedades.", 0.6)],
    "s12": [("con secuelas.", 0.8), ("en sus depósitos.", 0.6), ("cada agujero tiene una fecha.", 9.0), ("no lo detuvo?", 0.6)],
}
MEMORIAL = 6.0   # 90 muertes · 44 pacientes con secuelas, sin voz
END_HOLD = 9.0   # placa final: fuentes, logo y suscripción

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
NAR = os.path.join(ROOT, "video", "public", "ep13", "narracion"); os.makedirs(NAR, exist_ok=True)
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
memorial_at = round(t + 0.4, 3)
end_at = round(memorial_at + MEMORIAL, 3)
total = round(end_at + END_HOLD, 3)
W = {k: display(v, G["display"]) for k, v in W.items()}
DATA = os.path.join(ROOT, "video", "src", "data", "ep13"); os.makedirs(DATA, exist_ok=True)
json.dump({"fps": 30, "starts": starts, "durations": D, "inserts": inserts, "memorial": memorial_at, "end": end_at, "total": total},
          open(os.path.join(DATA, "timeline.json"), "w"), indent=1)
json.dump(W, open(os.path.join(DATA, "words.json"), "w"), ensure_ascii=False, indent=0)
print(json.dumps(starts), "\nMEMORIAL", memorial_at, "FINAL", end_at, "\nTOTAL", total, f"= {int(total//60)}:{total%60:05.2f}")
