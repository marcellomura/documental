"""Genera subtítulos .srt (español) a partir de words.json y la línea de tiempo."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# EP=ep02 OUT=el_robo_del_siglo_subtitulos_es.srt python3 tools/srt.py  (sin EP: episodio 1)
DATA = os.path.join(ROOT, "video/src/data", os.environ.get("EP", ""))
TL = json.load(open(os.path.join(DATA, "timeline.json")))
if "starts" not in TL: TL["starts"] = {k: v["at"] for k, v in TL["segs"].items()}
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
    "msi": [("Noventa mil pesos", "$90.000"), ("seiscientos ochenta y ocho mil", "$688.000"), ("tres mil quinientos millones", "3.500 millones"),
            ("dos millones trescientos mil dólares", "2,3 millones de dólares"), ("siete millones", "7 millones"), ("tres millones", "3 millones"),
            ("Seis de octubre", "6 de octubre"), ("seis de octubre", "6 de octubre"), ("noventa y tres", "93"), ("doscientos ocho", "208"),
            ("treinta y uno de agosto", "31 de agosto"), ("Veinte años", "20 años"), ("veinte años", "20 años"),
            ("veinticuatro de septiembre", "24 de septiembre"), ("seis de la tarde", "18 h"), ("cuatro entradas", "4 entradas"),
            ("ochenta y cinco mil", "85.000"), ("cuarenta y seis millones", "46 millones"), ("seiscientos mil", "$600.000"),
            ("mil novecientos ochenta y seis", "1986"), ("quince dólares", "15 dólares"), ("a veinte", "a 20"),
            ("ochenta y dos por ciento", "82 %"), ("cuatro de cada diez", "4 de cada 10"), ("tres revendedores", "3 revendedores"),
            ("ciento cincuenta mil", "150.000"), ("cuatro por cuenta", "4 por cuenta"), ("dos mil veinticuatro", "2024"),
            ("ciento cuarenta y ocho libras", "148 libras"), ("trescientas cincuenta y cinco", "355"),
            ("deportick punto net", "deportick.net"), ("deportick punto com", "deportick.com")],
    "ep05": [("siete y media", "7:30"), ("las doce", "las 12"), ("once y veinte", "11:20"),
             ("mil ochocientos noventa y cuatro", "1894"), ("mil novecientos cuarenta y dos", "1942"), ("mil novecientos cuarenta", "1940"),
             ("mil novecientos veinte", "1920"), ("mil novecientos treinta", "1930"), ("mil novecientos setenta", "1970"),
             ("veinticuatro franjas", "24 franjas"), ("quince grados", "15 grados"), ("diez grados", "10 grados"),
             ("menos cuatro", "−4"), ("menos cinco", "−5"), ("Menos tres", "−3"), ("menos tres", "−3"),
             ("setenta y cuatro", "74"), ("dos mil ocho", "2008"), ("dos mil nueve", "2009"), ("setecientos", "700"),
             ("las diez", "las 10"), ("dos mil veinticinco", "2025"), ("dos mil veintiséis", "2026"),
             ("primero de abril", "1.º de abril")],
}
NUM_EP["msv"] = [("Noventa mil pesos", "$90.000"), ("seiscientos ochenta y ocho mil", "$688.000"), ("tres millones", "3 millones"), ("Seis de octubre", "6 de octubre"), ("Cuatro entradas", "4 entradas"), ("dos horas", "2 horas"), ("Ochenta y cinco mil", "85.000"), ("mil novecientos ochenta y seis", "1986"), ("ochenta y dos por ciento", "82 %"), ("cuatro de cada diez", "4 de cada 10"), ("deportick punto net", "deportick.net"), ("dos millones de dólares", "2 millones de dólares")]
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
U = {"cero": 0, "un": 1, "uno": 1, "una": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10,
     "once": 11, "doce": 12, "trece": 13, "catorce": 14, "quince": 15, "dieciséis": 16, "diecisiete": 17, "dieciocho": 18, "diecinueve": 19,
     "veinte": 20, "veintiuno": 21, "veintiún": 21, "veintiuna": 21, "veintidós": 22, "veintitrés": 23, "veinticuatro": 24, "veinticinco": 25,
     "veintiséis": 26, "veintisiete": 27, "veintiocho": 28, "veintinueve": 29, "treinta": 30, "cuarenta": 40, "cincuenta": 50,
     "sesenta": 60, "setenta": 70, "ochenta": 80, "noventa": 90, "cien": 100, "ciento": 100, "doscientos": 200, "doscientas": 200,
     "trescientos": 300, "trescientas": 300, "cuatrocientos": 400, "cuatrocientas": 400, "quinientos": 500, "quinientas": 500,
     "seiscientos": 600, "seiscientas": 600, "setecientos": 700, "setecientas": 700, "ochocientos": 800, "ochocientas": 800,
     "novecientos": 900, "novecientas": 900}
def spell_to_digits(t):
    """cifras genéricas: 'mil novecientos trece' -> 1913, 'treinta y tres mil' -> 33.000, 'treinta por ciento' -> 30 %"""
    toks = re.findall(r"\S+|\s+", t); out = []; i = 0
    def bare(x): return re.sub(r"[^\wáéíóúñü]", "", x.lower())
    words = [x for x in toks]
    while i < len(words):
        w = words[i]
        if w.isspace() or (bare(w) not in U and bare(w) != "mil"):
            out.append(w); i += 1; continue
        # juntar la secuencia numérica
        j = i; seq = []; lastj = i
        while j < len(words):
            b = bare(words[j])
            if words[j].isspace(): j += 1; continue
            if b in U or b in ("mil", "millón", "millones") or (b == "y" and seq and j + 2 < len(words) and bare(words[j + 2]) in U):
                seq.append(b); lastj = j
                if re.search(r"[^\wáéíóúñü]$", words[j]): break
                j += 1
            else: break
        total = cur = 0; has_mil = False
        for b in seq:
            if b == "y": continue
            if b == "mil": cur = (cur or 1) * 1000; total += cur; cur = 0; has_mil = True
            elif b in ("millón", "millones"): total = (total + cur) * 1000000; cur = 0
            else: cur += U[b]
        n = total + cur
        trail = re.search(r"[^\wáéíóúñü]*$", words[lastj]).group(0)
        lead = re.match(r"^[^\wáéíóúñü]*", words[i]).group(0)
        nxt = "".join(words[lastj + 1: lastj + 5]).lower()
        pct = nxt.startswith(" por ciento")
        if (n < 11 or seq == ["mil"]) and not pct and len([b for b in seq if b != "y"]) == 1:
            out.append(w); i += 1; continue
        if n >= 1_000_000 and n % 1_000_000 == 0: s_ = f"{n // 1_000_000} millones" if n > 1_000_000 else "1 millón"
        elif has_mil and 1800 <= n <= 2100 and seq[0] == "mil" or (has_mil and 1800 <= n <= 2100 and len(seq) > 2 and seq[0] in ("dos",)): s_ = str(n)
        else: s_ = f"{n:,}".replace(",", ".")
        if pct:
            out.append(lead + s_ + " %"); i = lastj + 1
            m = re.match(r"(\s+por\s+ciento)", "".join(words[i:i + 4]), re.I)
            k = i; acc = ""
            while k < len(words) and len(acc) < len(m.group(1)): acc += words[k]; k += 1
            i = k; out.append(re.search(r"[^\wáéíóúñü]*$", words[k - 1]).group(0)); continue
        out.append(lead + s_ + trail); i = lastj + 1
    return "".join(out)
def numerals(t):
    for a, b in NUM: t = re.sub(r"\b" + a + r"\b", b, t, flags=re.I)
    if os.environ.get("EP") == "rico": t = spell_to_digits(re.sub(r"siglo veinte", "siglo XX", re.sub(r"siglo diecinueve", "siglo XIX", t)))
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
