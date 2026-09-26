"""Línea de tiempo del short "¿4 millones se van del conurbano?" (s4m).
Arranca con el clip de Sturzenegger en Bloomberg Línea (video/public/s4m/clip.mp4 = segundos 7,9 a 12,6 del original)
y lo corta la narración ("Pará, pará, pará"). Escribe video/src/data/s4m/{timeline,words}.json, con los subtítulos
ya armados (cifras en vez de números deletreados)."""
import json, os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(ROOT, "audio", "s4m", "final")
D = json.load(open(os.path.join(AUD, "durations.json")))
W = json.load(open(os.path.join(AUD, "words.json")))
OUT = os.path.join(ROOT, "video", "src", "data", "s4m"); os.makedirs(OUT, exist_ok=True)

CLIP_SRC = 7.9      # dónde empieza el clip recortado dentro de raw/s4m/clip_bloomberg.mp4
CLIP_DUR = 4.7
S01_AT = 4.1        # "Pará" entra 0,4 s después de "interior."; ahí se congela el clip
GAP = {"s01": 0.5}  # pausa después de cada segmento (0,45 s por defecto)
END_TAIL = 2.4      # la placa final arranca en "seguí a CONTEXTO" y dura hasta acá después de la última palabra

# lo que dice Sturzenegger (tiempos de whisper sobre el original, texto corregido con el subtítulo de Bloomberg Línea)
CLIP_WORDS = [("Cuatro", 8.48, 8.96), ("millones", 8.96, 9.28), ("de", 9.28, 9.46), ("personas", 9.46, 9.8), ("se", 9.8, 10.04),
              ("van", 10.04, 10.18), ("a", 10.18, 10.28), ("ir", 10.28, 10.38), ("del", 10.38, 10.68), ("conurbano", 10.68, 11.14),
              ("hacia", 11.14, 11.26), ("el", 11.26, 11.32), ("interior.", 11.32, 11.7)]

t = S01_AT; starts = {}
for k in sorted(D):
    starts[k] = round(t, 3); t += D[k] + GAP.get(k, 0.45)
last = sorted(D)[-1]
seg_end = starts[last] + D[last]
seg_word = next(w for w in W[last] if w["w"].lower().startswith("seguí"))
end_card = round(starts[last] + seg_word["s"] - 0.15, 3)
total = round(seg_end + END_TAIL, 3)

# ---- subtítulos: cifras en vez de palabras ----
NUM = [("cuatro millones", "4 millones"), ("dos millones", "2 millones"), ("treinta años", "30 años"), ("diez años", "10 años"),
       ("noventa mil millones", "90.000 millones"), ("siglo veinte", "siglo XX"), ("trescientas sesenta y cinco", "365"),
       ("un millón y medio", "1,5 millones"), ("dos mil diez", "2010"), ("dos mil veintidós", "2022"),
       ("veintinueve por ciento", "29 %"), ("un veinticinco", "un 25 %"), ("un ocho", "un 8 %"), ("un diez", "un 10 %"),
       ("treinta y treinta y cinco mil", "30.000 y 35.000"), ("un millón", "1 millón")]
key = lambda w: re.sub(r"[^\w]", "", w.lower())
def merge(ws):
    out, i = [], 0
    while i < len(ws):
        for a, b in NUM:
            toks = a.split(); n = len(toks)
            if i + n <= len(ws) and all(key(ws[i + k]["w"]) == toks[k] for k in range(n)):
                lead = re.match(r"^[¿¡«]*", ws[i]["w"]).group(0)
                trail = re.search(r"[.,:;!?…»]*$", ws[i + n - 1]["w"]).group(0)
                out.append({"w": lead + b + trail, "s": ws[i]["s"], "e": ws[i + n - 1]["e"]}); i += n; break
        else:
            out.append(ws[i]); i += 1
    return out

caps = [{"w": ("4" if w == "Cuatro" else w), "s": round(s - CLIP_SRC, 3), "e": round(e - CLIP_SRC, 3), "who": "fs"} for w, s, e in CLIP_WORDS]
for k in sorted(W):
    for w in merge(W[k]):
        caps.append({"w": w["w"], "s": round(starts[k] + w["s"], 3), "e": round(starts[k] + w["e"], 3), "who": "n"})

tl = {"fps": 30, "clip": {"src": CLIP_SRC, "dur": CLIP_DUR, "freeze": S01_AT}, "starts": starts, "durations": D,
      "endCard": end_card, "total": total, "caps": caps}
json.dump(tl, open(os.path.join(OUT, "timeline.json"), "w"), ensure_ascii=False, indent=0)
shutil.copy(os.path.join(AUD, "words.json"), os.path.join(OUT, "words.json"))
print(json.dumps(starts), "\nplaca", end_card, "TOTAL", total, f"= {int(total // 60)}:{total % 60:05.2f}")
