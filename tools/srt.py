"""Genera subtítulos .srt (español) a partir de words.json y la línea de tiempo."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# EP=ep02 OUT=el_robo_del_siglo_subtitulos_es.srt python3 tools/srt.py  (sin EP: episodio 1)
DATA = os.path.join(ROOT, "video/src/data", os.environ.get("EP", ""))
TL = json.load(open(os.path.join(DATA, "timeline.json")))
W = json.load(open(os.path.join(DATA, "words.json")))
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
# cifras en vez de números deletreados (el guion está escrito para la voz)
NUM_EP = {
    "ep02": [("ciento cuarenta y tres", "143"), ("dos mil seis", "2006"), ("dos mil diez", "2010"), ("dos mil veinte", "2020"),
             ("trescientos", "300"), ("veintitrés", "23"), ("diecinueve millones", "19 millones"), ("dos millones", "2 millones"),
             ("nueve y quince años", "9 y 15 años"), ("veintiuno", "21"), ("Viernes trece", "Viernes 13"), ("siete de la tarde", "7 de la tarde"),
             ("de cien cajas", "de 100 cajas")],
    "ep03": [("veinticinco de septiembre de dos mil veintiséis", "25 de septiembre de 2026"), ("ochocientos millones", "800 millones"),
             ("casi mil millones", "casi 1.000 millones"), ("doscientos veinte mil millones", "220.000 millones"),
             ("siete mil millones", "7.000 millones"), ("nueve defaults", "9 defaults"), ("mil novecientos cincuenta y ocho", "1958"),
             ("setenta y cinco millones", "75 millones"), ("diez días", "10 días"), ("dos mil seis", "2006"),
             ("diez mil millones", "10.000 millones"), ("doce años", "12 años"), ("dos mil dieciocho", "2018"),
             ("cincuenta y siete mil millones", "57.000 millones"), ("cuarenta y cinco mil", "45.000"), ("dos mil veintidós", "2022"),
             ("dos mil veinticinco", "2025"), ("veinte mil millones", "20.000 millones"), ("dos mil treinta", "2030"),
             ("trece mil millones", "13.000 millones"), ("trescientos dólares", "300 dólares"), ("casi treinta", "casi 30")],
    "ep04": [("cuatro coma seis grados", "4,6 grados"), ("tres grados", "3 grados"), ("cuarenta años", "40 años"),
             ("medio metro", "medio metro"), ("un grado y medio", "1,5 grados"), ("setenta y cinco años", "75 años"),
             ("mil novecientos ochenta y dos", "1982"), ("noventa y siete", "97"), ("dos mil quince", "2015"),
             ("mil novecientos noventa y ocho", "1998"), ("ciento veinte mil", "120.000"), ("diecisiete", "17"),
             ("cuatro millones", "4 millones"), ("Veinte mil", "20.000"), ("dos mil veintitrés", "2023"),
             ("veintiún grados y un décimo", "21,1 grados")],
    "sdb": [("dos mil veintiséis", "2026"), ("cuatro por ciento", "4 %"), ("un veintitrés", "un 23 %"), ("cien mil pesos", "100.000 pesos"),
            ("ciento veintitrés mil", "123.000"), ("sesenta y ocho", "68"), ("ochenta y un", "81"), ("uno a uno", "1 a 1"),
            ("dos mil diecisiete", "2017"), ("dos mil dos", "2002"), ("dos mil dieciocho", "2018"), ("dos mil diecinueve", "2019"), ("Trece ceros", "13 CEROS")],
    "rpb": [("uno coma siete por ciento", "1,7 %"), ("treinta y dos por ciento", "32 %"), ("Quince millones", "15 millones"), ("dos mil veintitrés", "2023"),
            ("veinticinco por ciento", "25 %"), ("once por ciento", "11 %"), ("un veinte", "un 20 %"), ("un veintiuno", "un 21 %"),
            ("un millón cuatrocientos mil pesos", "$1.400.000"), ("novecientos veinte mil", "$920.000"), ("cuatro puntos", "4 puntos"),
            ("cuarenta y dos por ciento", "42 %"), ("cuarenta y cuatro por ciento", "44 %"), ("dos minutos", "2 minutos")],
    "ocd": [("catorce", "14"), ("cuatrocientos", "400"), ("mil novecientos sesenta y uno", "1961"), ("treinta y ocho", "38"),
            ("dos mil veintidós", "2022"), ("dos mil veinticuatro", "2024"), ("dos mil veinticinco", "2025"), ("doscientas cuarenta", "240"),
            ("veinticinco", "25"), ("siete años", "7 años"), ("mil novecientos noventa y cuatro", "1994"), ("dos minutos", "2 minutos")],
    "ep05": [("siete y media", "7:30"), ("las doce", "las 12"), ("once y veinte", "11:20"),
             ("mil ochocientos noventa y cuatro", "1894"), ("mil novecientos cuarenta y dos", "1942"), ("mil novecientos cuarenta", "1940"),
             ("mil novecientos veinte", "1920"), ("mil novecientos treinta", "1930"), ("mil novecientos setenta", "1970"),
             ("veinticuatro franjas", "24 franjas"), ("quince grados", "15 grados"), ("diez grados", "10 grados"),
             ("menos cuatro", "−4"), ("menos cinco", "−5"), ("Menos tres", "−3"), ("menos tres", "−3"),
             ("setenta y cuatro", "74"), ("dos mil ocho", "2008"), ("dos mil nueve", "2009"), ("setecientos", "700"),
             ("las diez", "las 10"), ("dos mil veinticinco", "2025"), ("dos mil veintiséis", "2026"),
             ("primero de abril", "1.º de abril")],
}
NUM = NUM_EP.get(os.environ.get("EP", ""), [])
def merge_numbers(ws):
    """une los números deletreados en una sola 'palabra' con cifras (conserva tiempos y puntuación final)"""
    out, i = [], 0
    key = lambda w: re.sub(r"[^\w]", "", w.lower())
    while i < len(ws):
        for a, b in NUM:
            toks = a.lower().split(); n = len(toks)
            if i + n <= len(ws) and all(key(ws[i + k]["w"]) == toks[k] for k in range(n)):
                trail = re.search(r"[.,:;!?…»]*$", ws[i + n - 1]["w"]).group(0)
                out.append({"w": b + trail, "s": ws[i]["s"], "e": ws[i + n - 1]["e"]}); i += n; break
        else:
            out.append(ws[i]); i += 1
    return out
cues = []
for seg in sorted(W):
    base = TL["starts"][seg]; cur = []
    mw = merge_numbers(W[seg])
    for j, w in enumerate(mw):
        cur.append(w)
        txt = " ".join(x["w"] for x in cur)
        end_sentence = w["w"][-1] in ".?!:»" or w["w"].endswith("...")
        nxt = mw[j + 1]["w"] if j + 1 < len(mw) else ""
        # no cortar en la coma si lo que sigue es una palabra suelta que cierra la oración ("..., dos.")
        comma = w["w"].endswith(",") and not (len(nxt) <= 6 and nxt[-1:] in ".?!")
        if (end_sentence and len(txt) >= 10) or (comma and len(txt) > 45) or len(txt) > 78 or w["e"] == W[seg][-1]["e"]:
            cues.append((base + cur[0]["s"], base + cur[-1]["e"] + 0.15, txt)); cur = []
def numerals(t):
    for a, b in NUM: t = re.sub(r"\b" + a + r"\b", b, t, flags=re.I)
    return t
cues = [(a, b, numerals(t)) for a, b, t in cues]
out = []
for i, (a, b, t) in enumerate(cues, 1):
    if i < len(cues): b = min(b, cues[i][0] - 0.02)
    # partir en dos líneas si es largo
    if len(t) > 42:
        words = t.split(); half = len(t) // 2; acc = 0
        for k, wd in enumerate(words):
            acc += len(wd) + 1
            if acc >= half: t = " ".join(words[: k + 1]) + "\n" + " ".join(words[k + 1:]); break
    out.append(f"{i}\n{ts(a)} --> {ts(b)}\n{t.replace('«', '“').replace('»', '”')}\n")
open(os.path.join(ROOT, "entrega", os.environ.get("OUT", "13_ceros_subtitulos_es.srt")), "w").write("\n".join(out))
print(len(out), "subtítulos")
