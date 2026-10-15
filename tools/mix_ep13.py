"""Mezcla del episodio 13 (EL LOTE 31.202): narración + ocho temas con el mismo motivo (ducking bajo la voz) + diseño
sonoro sincronizado con las frases (chats, sala limpia, placas de barrera, agujeros, autoclave, fuego, celdas).
Salida: audio/mix/mezcla_ep13.wav (48 kHz estéreo, -14 LUFS integrados, pico -1,5 dBTP).
Silencios buscados: la paciente que muere el 12 de febrero, «Sí, lo sé», las nueve fetas alineadas y el homenaje."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep13/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep13/words.json")))
ST, TOTAL, D, INS = TL["starts"], TL["total"], TL["durations"], TL["inserts"]
MEM, END = TL["memorial"], TL["end"]
PUB = os.path.join(ROOT, "video/public")
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
CARD_LEAD = {"s04": 1.3, "s05": 1.1, "s06": 1.5, "s07": 1.6, "s08": 1.0, "s09": 1.4}   # igual que video/src/ep13/lib.ts

def load(path, stereo=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

def C(seg, phrase, n=0, which="s"):
    """tiempo absoluto de una frase; compara sin espacios (sirve para nombres fundidos en una palabra)"""
    ws = W[seg]; tg = norm(phrase); found = -1
    for i in range(len(ws)):
        acc = ""
        for j in range(i, len(ws)):
            acc += norm(ws[j]["w"])
            if acc == tg:
                found += 1
                if found == n:
                    return ST[seg] + (ws[i]["s"] if which == "s" else ws[j]["e"])
                break
            if not tg.startswith(acc): break
    raise KeyError(f"{seg} {phrase} #{n}")

N = int((TOTAL + 1) * SR)
voice = np.zeros(N, np.float32)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)

# ---------------- Narración ----------------
for k in sorted(ST):
    a = load(os.path.join(PUB, f"ep13/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música: ocho temas en re menor ----------------
NAMES = ["pulso", "tema", "barreras", "inspeccion", "alarma", "hospital", "encubrimiento", "cierre"]
M = {k: load(os.path.join(PUB, f"ep13/music/{k}.mp3")) for k in NAMES}
TARGET_RMS = 10 ** (-16 / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
REF = {k: rms(v[int(3 * SR): int(min(len(v) / SR - 6, 60) * SR)]) for k, v in M.items()}
def place(name, g0, g1, off=0.0, fin=0.05, fout=0.6, gain=1.0):
    src = M[name]; i0, i1 = int(g0 * SR), int(g1 * SR); o = int(off * SR)
    seg = src[o:o + (i1 - i0)].copy(); n = len(seg)
    seg *= TARGET_RMS / REF[name]
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain

TITLE = ST["s01"] + D["s01"]                    # empieza la secuencia de título
HIT = TITLE + 0.55                               # destello del título
card = {k: ST[k] - v for k, v in CARD_LEAD.items()}
t_ins = ST["s06"] + 2.3                          # "la sexta barrera es la inspección"
t_alarma = 416.0 - 69.0                          # el corte del tema de la alarma (69 s) cae en "Y entonces apareció"
t_alarma = C("s09", "Y entonces apareció") - 69.0
t_elegia = C("s12", "Las nueve barreras existían") - 0.4

place("pulso", 0.0, HIT + 0.2, 0.0, fin=1.5, fout=0.4, gain=0.9)
place("tema", HIT - 0.55, card["s04"] + 0.3, 0.0, fin=0.02, fout=1.2)
place("barreras", card["s04"] - 0.2, t_ins + 1.5, 0.0, fin=0.8, fout=1.6, gain=0.85)
place("inspeccion", t_ins, card["s08"] + 3.5, 0.0, fin=1.6, fout=2.0)
place("alarma", t_alarma, ST["s10"] - 0.2, 0.0, fin=0.6, fout=1.2)
place("hospital", ST["s10"] - 0.6, ST["s11"] - 0.2, 0.0, fin=1.4, fout=1.4)
place("encubrimiento", ST["s11"] - 0.45, ST["s12"] + 0.6, 0.0, fin=0.05, fout=2.0)
place("tema", ST["s12"] - 0.4, t_elegia + 2.0, 14.0, fin=2.0, fout=2.2, gain=0.8)
place("cierre", t_elegia, TOTAL, 0.0, fin=2.4, fout=3.0)

# ---------------- Ducking ----------------
def follower(x, att=0.015, rel=0.35):
    hop = SR // 100; n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(r); act = np.clip((db + 42) / 14, 0, 1)
    env = np.zeros(n); a_att = np.exp(-0.01 / att); a_rel = np.exp(-0.01 / rel); e = 0
    for i in range(n):
        target = act[i]; c = a_att if target > e else a_rel
        e = c * e + (1 - c) * target; env[i] = e
    return np.repeat(env, hop)[: len(x)]
env = follower(voice)
env = np.concatenate([env, np.zeros(N - len(env))])
LOW, HIGH = 0.2, 0.55
g = HIGH - (HIGH - LOW) * env
def dip(a, b, level, ramp=0.4):
    global g
    i0, i1, r = int(a * SR), int(b * SR), int(ramp * SR)
    d = np.ones(N); d[i0:i1] = level
    d[max(0, i0 - r):i0] = np.linspace(1, level, i0 - max(0, i0 - r)); d[i1:i1 + r] = np.linspace(level, 1, len(d[i1:i1 + r]))
    g = g * d
def ins(seg, k):
    a, s = INS[seg][k]; return ST[seg] + a, s
dip(TITLE - 0.2, ST["s02"] - 0.5, 1.7, ramp=0.3)                                   # título
a, s = ins("s01", 3); dip(a, a + s, 0.55, 0.2)                                       # noventa muertes
dip(C("s07", "La paciente") - 0.2, card["s08"] + 0.4, 0.55, ramp=0.6)              # murió el doce de febrero
a, s = ins("s08", 2); dip(a - 0.05, a + s, 0.25, 0.15)                               # «Sí, lo sé»
a, s = ins("s09", 1); dip(a, a + s, 1.45, 0.3)                                       # las nueve fetas alineadas
a, s = ins("s11", 0); dip(a, a + s, 0.6, 0.2)                                        # hoy quemamos todo
dip(C("s11", "Hoy hay trece") - 0.3, ST["s12"], 0.7, ramp=1.0)                      # la Justicia, más contenida
a, s = ins("s12", 2); dip(a, a + s, 1.5, 0.6)                                        # cada agujero tiene una fecha
dip(MEM - 0.3, TOTAL, 0.85, ramp=1.0)                                               # homenaje y placa final
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SF = {}
for d in ["sfx", "ep03/sfx", "ep05/sfx", "ep10/sfx", "ep12/sfx", "ep13/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        if not f.endswith((".mp3", ".wav")) or f.startswith("titan"): continue
        a = load(os.path.join(PUB, d, f))
        SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
from sfx_synth import swell
def put(a, t, gain=0.5):
    if a.ndim == 1: a = np.stack([a, a], axis=1)
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
def fx(name, t, gain=0.5, pan=0.0, dur=None, peak=None):
    """peak: alinea el pico del efecto (s dentro del archivo) con t"""
    a = SF[name]
    if dur:
        a = a[: int(dur * SR)].copy(); f = min(len(a), int(0.3 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    if peak is not None: t -= peak
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41
    sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41
def bed(name, t, sec, gain=0.1, xf=0.6):
    """cama en loop (sala limpia, hospital, drone) encadenada con fundidos"""
    src = SF[name]; L = len(src) / SR; left = sec; tt = t; first = True
    while left > 0.05:
        d = min(left, L); a = src[: int(d * SR)].copy(); n = len(a)
        fi, fo = (min(n, int(0.8 * SR)) if first else min(n, int(xf * SR))), min(n, int(xf * SR))
        a[:fi] *= np.linspace(0, 1, fi)[:, None]; a[-fo:] *= np.linspace(1, 0, fo)[:, None]
        put(a, tt, gain)
        if d >= left: break
        tt += d - xf; left -= d - xf; first = False
def card_fx(t0):
    fx("feta", t0 + 0.05, 0.42, peak=0.19); fx("agujero", t0 + 0.6, 0.3, 0.2); fx("impacto", t0 + 0.05, 0.12, peak=0.15)

# S01 — el aviso
bed("drone", 0.0, 19.5, 0.07)
tOut, tIn = C("s01", "es cierto"), C("s01", "Ella le contesta") + 0.1
fx("tipeo", tOut - 0.75, 0.16, -0.2, dur=0.8); fx("notif", tOut, 0.32, -0.2)
fx("notif", tIn, 0.3, 0.25)
fx("pop", C("s01", "Y le explica") + 0.05, 0.1)
for k in range(7): fx("pop", C("s01", "dieciocho tareas") + k * 0.22, 0.05, ((k % 2) - 0.5) * 0.8)
fx("tipeo", C("s01", "dieciocho tareas") - 0.1, 0.1, 0.4, dur=1.6)
fx("ampolla", C("s01", "Tres semanas") + 0.2, 0.3, 0.1); bed("sala", C("s01", "Tres semanas"), 7.2, 0.08)
fx("latido", C("s01", "noventa muertes") - 0.2, 0.3); fx("impacto", C("s01", "noventa muertes") + 0.05, 0.3, peak=0.15)
tV = C("s01", "Para llegar")
for i in range(9): fx("feta", tV + 0.25 + i * 0.12, 0.07, (i - 4) / 6, peak=0.19)
tA = C("s01", "Las atravesó todas")
fx("whoosh", tA, 0.3)
for i in range(9): fx("agujero", tA + 0.05 + (i + 0.5) / 9 * 1.6, 0.09, (i - 4) / 8)
fx("ampolla", C("s01", "Esta es la historia") + 0.15, 0.32)
tF = C("s01", "Y de cómo falló")
for i in range(9): fx("agujero", tF + 0.3 + i * 0.36, 0.07, (i - 4) / 8)
fx("subida", HIT, 0.32, peak=3.31); fx("impacto", HIT, 0.62, peak=0.15)

# S02 — qué es el fentanilo
put(swell(2.2), ST["s02"] - 1.4, 0.12)
fx("whoosh", C("s02", "cincuenta y cien") - 0.4, 0.16)
fx("latido", C("s02", "En la calle"), 0.18, dur=2.4)
fx("monitor", C("s02", "En un hospital") - 0.1, 0.1, 0.3, dur=5.0)
fx("pipeta", C("s02", "Se inyecta") - 0.2, 0.14, dur=2.6)
fx("microscopio", C("s02", "ni una sola bacteria") - 0.3, 0.2)
fx("monitor", C("s02", "Un paciente en terapia"), 0.08, 0.4, dur=3.0)
bed("drone", C("s02", "Las víctimas") - 0.3, 8.0, 0.05)

# S03 — el queso suizo
fx("whoosh", ST["s03"] - 0.45, 0.3, 0.3)
fx("aviones", C("s03", "accidentes de avión") - 0.1, 0.1, dur=2.4)
fx("feta", C("s03", "Ninguna barrera") - 0.3, 0.32, peak=0.19)
for k in range(5): fx("agujero", C("s03", "Cada una tiene agujeros") + k * 0.12, 0.09, (k - 2) / 3)
for i in range(3): fx("feta", C("s03", "Por eso se ponen varias") + i * 0.25, 0.18, (i - 1) / 2, peak=0.19)
fx("whoosh", C("s03", "lo que se escapa") - 0.2, 0.14)
fx("frenada", C("s03", "lo frena la feta siguiente") - 0.05, 0.36, peak=0.71)
fx("subida", C("s03", "se alinean") + 0.2, 0.22, peak=3.31)
tT = C("s03", "y algo atraviesa")
fx("whoosh", tT + 0.2, 0.32); fx("impacto", tT + 1.55, 0.36, peak=0.15)
for i in range(9): fx("feta", C("s03", "En esta historia hubo nueve fetas") - 0.4 + i * 0.08, 0.05, (i - 4) / 6, peak=0.19)
fx("whoosh", C("s03", "Vamos a recorrerlas") + 0.6, 0.2)

# placas de barrera (al principio de cada escena y en los silencios internos)
for k in ["s04", "s05", "s06", "s07", "s08", "s09"]: card_fx(card[k])
for seg, k in [("s04", 0), ("s04", 1), ("s05", 0)]: a, s = ins(seg, k); card_fx(a - 0.15)

# S04 — fábrica, ensayo, liberación
a2, _ = ins("s04", 0); a3, _ = ins("s04", 1)
bed("sala", ST["s04"] - 0.3, a2 - ST["s04"] + 0.6, 0.12)
fx("linea", ST["s04"] + 1.5, 0.12, dur=8.0); fx("linea", ST["s04"] + 9.0, 0.1, dur=8.0)
fx("glitch", C("s04", "producción en áreas") - 0.05, 0.12)
fx("tictac", C("s04", "limpiezas de apenas"), 0.1, dur=2.4)
fx("drone", C("s04", "agua para inyectables") - 0.2, 0.12, dur=3.5); fx("impacto", C("s04", "seis a siete veces"), 0.22, peak=0.15)
fx("pipeta", C("s04", "se toma una muestra"), 0.16, dur=2.4)
fx("pipeta", C("s04", "mezclaban") + 0.6, 0.24); fx("pipeta", C("s04", "mezclaban") + 1.6, 0.18, 0.3)
fx("pop", C("s04", "el ensayo da negativo"), 0.22); fx("camioneta", C("s04", "y el lote sale"), 0.16, 0.3)
fx("paginas", a3 + 0.9, 0.2, dur=1.2); fx("firma", C("s04", "esas firmas las ponía") + 0.3, 0.42)
fx("teclado", C("s04", "los registros se completaban"), 0.12, dur=2.4)

# S05 — historial y clausura
a5, _ = ins("s05", 0)
fx("paginas", ST["s05"] + 1.6, 0.14, dur=1.0)
for k in range(14): fx("pop", C("s05", "ciento dieciocho") - 0.4 + k * 0.23, 0.04, ((k % 3) - 1) * 0.5)
for k in range(3): fx("stamp", C("s05", "treinta y ocho") + k * 0.35, 0.14, (k - 1) * 0.5)
fx("ampolla", C("s05", "contaminada con Ralstonia") + 0.6, 0.2); fx("microscopio", C("s05", "analizaron una") - 0.2, 0.2)
fx("stamp", C("s05", "Y no se tomaron medidas") + 0.15, 0.42)
fx("paginas", C("s05", "En dos mil diecinueve") + 0.2, 0.16, dur=1.2)
fx("candado", C("s05", "Esa clausura") - 0.1, 0.45); fx("stamp", C("s05", "nunca se ejecutó") + 0.1, 0.5)

# S06 — la inspección avisada
tMe, tSi = C("s06", "me comentaron"), C("s06", "sí, es una inspección")
fx("tipeo", tMe - 0.75, 0.14, -0.2, dur=0.8); fx("notif", tMe, 0.3, 0.2); fx("notif", tSi, 0.28, 0.35)
for ph in ["masillar paredes", "sacar la materia", "poner carteles", "completar planillas", "tirar reactivos"]: fx("pop", C("s06", ph) + 0.25, 0.14)
fx("tipeo", C("s06", "Esa noche") + 0.2, 0.08, 0.3, dur=2.6)
fx("pop", C("s06", "Las inspectoras"), 0.12); fx("stamp", C("s06", "deficiencias críticas"), 0.4)
fx("whoosh", C("s06", "Pero el acta"), 0.14); fx("impacto", C("s06", "el dieciséis de diciembre") - 0.2, 0.26, peak=0.15)
fx("linea", C("s06", "empezó a fabricarse"), 0.1, dur=4.0)
for k in range(6): fx("ampolla", C("s06", "Seis lotes") - 0.1 + k * 0.09, 0.06, (k - 2.5) / 3)
fx("impacto", C("s06", "Uno de ellos") + 0.6, 0.22, peak=0.15)

# S07 — la sanción
fx("paginas", C("s07", "Una para Ramallo") - 0.2, 0.18, -0.3, dur=1.0); fx("paginas", C("s07", "Y otra para HLB") - 0.2, 0.18, 0.3, dur=1.0)
fx("pop", C("s07", "prohibía comercializar") + 0.3, 0.12, 0.3)
fx("stamp", C("s07", "nunca se firmó") + 0.45, 0.5, 0.3)
fx("firma", C("s07", "La de Ramallo se firmó") + 0.2, 0.4, -0.3); fx("stamp", C("s07", "el diez de febrero") + 0.2, 0.34, -0.3)
fx("pop", C("s07", "el catorce de enero"), 0.14)
fx("camioneta", C("s07", "El treinta de enero"), 0.16, 0.2)
fx("monitor", C("s07", "El ocho de febrero") - 0.1, 0.12, 0.3, dur=4.2)
fx("latido", C("s07", "murió el doce") - 0.6, 0.22, dur=3.0)
bed("drone", C("s07", "murió el doce") + 0.4, 4.5, 0.12)

# S08 — la alarma interna
bed("drone", ST["s08"] - 0.6, 13.0, 0.09)
for ph, pan in [("es peligroso", -0.2), ("Una persona que reporte", -0.2), ("es un montón de guita", 0.3), ("sí, lo sé", 0.3)]:
    fx("notif", C("s08", ph) - 0.05, 0.26, pan)
fx("tipeo", C("s08", "es peligroso") - 0.75, 0.12, -0.2, dur=0.8)
a, s = ins("s08", 2); fx("impacto", a + 0.15, 0.3, peak=0.15)
fx("tictac", C("s08", "ciento veinte mil") - 0.4, 0.1, dur=3.2)
for k in range(5): fx("ampolla", C("s08", "ciento veinte mil") + k * 0.55, 0.05, (k - 2) / 3)
fx("tipeo", C("s08", "decime en dos palabras") - 0.8, 0.12, -0.2, dur=0.8); fx("notif", C("s08", "decime en dos palabras"), 0.26, -0.2)
fx("whoosh", C("s08", "Ese Mario sería") - 0.3, 0.14)
for k in range(5): fx("pop", C("s08", "El cierre recién llegó") - 0.1 + k * 0.2, 0.1, (k - 2) / 3)
fx("latido", C("s08", "ya había muertos") - 0.1, 0.22, dur=3.4)

# S09 — trazabilidad y alineación
for k in range(7): fx("pop", C("s09", "para muchos remedios") - 0.2 + k * 0.12, 0.05)
fx("glitch", C("s09", "El fentanilo no estaba") + 0.1, 0.16)
for ph in ["Buenos Aires", "Santa Fe", "Córdoba", "la Ciudad", "Neuquén", "Formosa", "Jujuy"]: fx("pop", C("s09", ph), 0.14, 0.3)
fx("glitch", C("s09", "nadie podía") + 0.2, 0.12)
tAl = C("s09", "Las nueve fetas")
fx("whoosh", tAl + 0.2, 0.32)
for i in range(9): fx("agujero", tAl + 0.2 + (i + 1) / 10 * 3.6, 0.12, (i - 4) / 8)
tE = C("s09", "Y entonces apareció")
fx("feta", tE + 0.15, 0.45, peak=0.19); fx("frenada", tE + 1.45, 0.55, peak=0.71)

# S10 — el hospital
fx("microscopio", ST["s10"] - 0.4, 0.2)
bed("hospital", ST["s10"] - 0.3, 14.5, 0.1); fx("monitor", ST["s10"] + 1.0, 0.06, 0.4, dur=5.0)
fx("microscopio", C("s10", "Klebsiella pneumoniae") - 0.2, 0.16, -0.3); fx("microscopio", C("s10", "y Ralstonia") - 0.2, 0.16, 0.3)
for k in range(11): fx("pop", C("s10", "a todos les habían") + k * 0.08, 0.05, ((k % 5) - 2) / 3)
for k in range(10): fx("ampolla", C("s10", "Diez tenían") + k * 0.1, 0.06, (k - 5) / 6)
fx("pop", C("s10", "Las de otra marca"), 0.14)
fx("teclado", C("s10", "El dos de mayo") + 0.4, 0.16, dur=2.8); fx("mail", C("s10", "mandó un correo") + 1.2, 0.36, 0.4)
fx("subida", C("s10", "la coincidencia genómica") + 1.4, 0.18, peak=3.31); fx("pop", C("s10", "la coincidencia genómica") + 1.4, 0.2)
fx("feta", C("s10", "La barrera que funcionó") - 0.2, 0.22, peak=0.19)

# S11 — el encubrimiento y la Justicia
fx("impacto", ST["s11"] - 0.4, 0.34, peak=0.15)
fx("autoclave", C("s11", "se esterilizaron") - 0.2, 0.42)
fx("vandalismo", C("s11", "El domingo once") + 0.85, 0.5)
fx("servidores", C("s11", "información digital") - 0.1, 0.34); fx("trituradora", C("s11", "documentación") - 0.1, 0.3, 0.3, dur=2.2)
fx("drone", C("s11", "y el citrato") - 0.1, 0.12, dur=3.0)
fx("tipeo", C("s11", "hoy quemamos todo") - 0.8, 0.12, dur=0.8); fx("notif", C("s11", "hoy quemamos todo"), 0.26)
fx("fuego", C("s11", "hoy quemamos todo") + 1.12, 0.55, peak=0.74)  # el fuego visual arranca al terminar la frase
fx("pop", C("s11", "Casi cinco kilos"), 0.14); fx("whoosh", C("s11", "la empresa dice"), 0.12, -0.4); fx("whoosh", C("s11", "el juez investiga"), 0.12, 0.4)
fx("celda", C("s11", "Ariel García Furfaro") - 0.3, 0.42)
for k in range(13): fx("pop", C("s11", "Hoy hay trece") + 0.1 + k * 0.06, 0.04, (k - 6) / 7)
fx("celda", C("s11", "detuvieron a la extitular"), 0.38); fx("stamp", C("s11", "En septiembre"), 0.26)
fx("pop", C("s11", "Al ministro Lugones") - 0.1, 0.14)

# S12 — cierre
put(swell(2.4), ST["s12"] - 1.6, 0.12)
fx("impacto", C("s12", "noventa muertes") - 0.25, 0.26, peak=0.15); fx("impacto", C("s12", "cuarenta y cuatro") - 0.25, 0.18, 0.2, peak=0.15)
fx("martillo", C("s12", "la Cámara Federal") + 0.1, 0.28)
for k in range(16): fx("pop", C("s12", "autorizó") - 0.2 + k * 0.18, 0.035, ((k % 4) - 1.5) / 2)
for i in range(9): fx("feta", C("s12", "Las nueve barreras existían") + 0.3 + i * 0.12, 0.05, (i - 4) / 6, peak=0.19)
tFa = C("s12", "Fallaron una por una")
for i in range(9): fx("agujero", tFa + i * 0.17, 0.12, (i - 4) / 8)
a, s = ins("s12", 2); step = (s - 0.4) / 9
for i in range(9): fx("agujero", a + 0.15 + i * step, 0.16, (i - 4) / 8); fx("stamp", a + 0.25 + i * step, 0.08, (i - 4) / 8)
fx("pop", C("s12", "¿Quién tiene más culpa") - 0.2, 0.18)
fx("whoosh", END + 0.1, 0.16)

# ---------------- Suma y master (loudnorm lineal en dos pasadas) ----------------
act = env[: N] > 0.5
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print("voz (hablando) dB:", round(db(voice[act]), 1), "| música bajo voz dB:", round(db(music[act].mean(axis=1)), 1),
      "| música en pausas dB:", round(db(music[~act].mean(axis=1)), 1), "| sfx pico:", round(float(np.abs(sfx).max()), 2))
mix = music + sfx * 0.9
mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]
peak = np.abs(mix).max(); print("pico previo", round(float(peak), 3))
mix = mix / max(peak, 1e-9) * 0.89
raw = os.path.join(OUT, "pre13.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep13.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
