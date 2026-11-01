"""Mezcla del ep15 (EL HOMBRE DE LAS MIL CARAS): narración (Octavio, eleven_v4) + seis temas telúricos originales con
ducking bajo la voz + diseño sonoro atado a las frases (los mismos cortes que video/src/ep15/Doc.tsx y Vert.tsx).
Uso: EP=ep15 python3 tools/mix_ep15.py   → audio/mix/mezcla_ep15.wav  (largo, 9:22)
     EP=ep15v python3 tools/mix_ep15.py  → audio/mix/mezcla_ep15v.wav (vertical, 2:46)
48 kHz estéreo, -14 LUFS integrados, pico -1,5 dBTP.
Música del largo: «apertura» hasta el título (el pico del tema cae en «el hombre de las mil caras»); «paraguay» para Posadas
y Asunción; «rio» para la fuga, Hugo Jara y el Paraná (su caída natural coincide con el Hotel de Turismo); «fidelidad»
para Roseo y el monte; «crimen» para la calle España y Berg (su hueco cae en «sobrevivió»); las condenas sólo con un
dron grave y el bombo; «fidelidad» vuelve cuando el campo se hace parque; «final» crece hasta «hoy es de todos»."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.environ.get("EP", "ep15")
SR = 48000
TL = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/timeline.json")))
W = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/words.json")))
ST, TOTAL, END = TL["starts"], TL["total"], TL["end"]
D = TL["durations"]
PUB = os.path.join(ROOT, "video/public")
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)


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
    """tiempo absoluto de una frase (igual que at() en video/src/ep15/lib.ts)"""
    ws = W[seg]; tg = norm(phrase); found = -1
    for i in range(len(ws)):
        acc = ""
        for j in range(i, len(ws)):
            acc += norm(ws[j]["w"])
            if acc == tg or (j == i and acc.startswith(tg)):
                found += 1
                if found == n:
                    return ST[seg] + (ws[i]["s"] if which == "s" else ws[j]["e"])
                break
            if not tg.startswith(acc): break
    raise KeyError(f"{seg} {phrase} #{n}")
def CE(seg, phrase, n=0): return C(seg, phrase, n, "e")
def S(seg): return ST[seg]


N = int((TOTAL + 1) * SR)
voice = np.zeros(N, np.float32)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)

# ---------------- narración ----------------
NAR = "ep15/narracion" if EP == "ep15" else "ep15/narracion_v"
for k in sorted(ST):
    a = load(os.path.join(PUB, f"{NAR}/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- música ----------------
M = {k: load(os.path.join(PUB, f"ep15/music/{k}.mp3")) for k in ["apertura", "paraguay", "rio", "fidelidad", "crimen", "final"]}
TARGET_RMS = 10 ** (-17 / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
REF = {k: rms(v[int(4 * SR): int(min(len(v) / SR - 8, 60) * SR)]) for k, v in M.items()}
def place(name, g0, g1, off=0.0, fin=0.05, fout=0.6, gain=1.0):
    src = M[name]; i0, i1 = int(g0 * SR), int(g1 * SR); o = int(off * SR)
    seg = src[o:o + (i1 - i0)].copy(); n = len(seg)
    seg *= TARGET_RMS / REF[name]
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain

# ---------------- efectos ----------------
SRC = {
    **{f[:-4]: f"ep15/sfx/{f}" for f in os.listdir(os.path.join(PUB, "ep15/sfx")) if f.endswith(".mp3")},
    "impacto": "ep13/sfx/impacto.mp3", "subida": "ep13/sfx/subida.mp3", "drone": "ep13/sfx/drone.mp3", "latido": "ep13/sfx/latido.mp3",
    "celda": "ep13/sfx/celda.mp3", "camioneta": "ep13/sfx/camioneta.mp3", "candado": "ep13/sfx/candado.mp3", "tipeo": "ep13/sfx/tipeo.mp3",
    "firma": "ep13/sfx/firma.mp3", "notif": "ep13/sfx/notif.mp3",
    "flash": "ep10/sfx/flash.mp3", "radio": "ep10/sfx/radio.mp3", "barco": "ep10/sfx/barco.mp3", "paginas": "ep10/sfx/paginas.mp3",
    "botas": "ep10/sfx/botas.mp3", "patrulleros": "ep10/sfx/patrulleros.mp3", "proyector": "ep10/sfx/proyector.mp3",
    "whoosh": "ep12/sfx/whoosh.mp3", "crujido": "ep12/sfx/crujido.mp3", "burbujas": "ep12/sfx/burbujas.mp3", "reloj": "ep12/sfx/reloj.mp3",
    "teletipo": "ep12/sfx/teletipo.mp3",
    "monte": "ep14/sfx/monte.mp3", "viento": "ep14/sfx/viento_noche.mp3", "resonancia": "ep14/sfx/resonancia.mp3", "mapa": "ep14/sfx/mapa.mp3",
    "pluma": "ep14/sfx/pluma.mp3",
    "stamp": "ep03/sfx/stamp.mp3", "pop": "sfx/pop.mp3", "boom": "sfx/boom.mp3", "glitch": "sfx/glitch.mp3", "riser": "sfx/riser.mp3",
    "typewriter": "sfx/typewriter.mp3",
}
SF = {}
for k, rel in SRC.items():
    a = load(os.path.join(PUB, rel)); SF[k] = a / (np.abs(a).max() + 1e-9) * 0.5
def put(a, t, gain=0.5):
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    if n > 0: sfx[i:i + n] += a[:n] * gain
def fx(name, t, gain=0.5, pan=0.0, dur=None, rate=1.0, skip=0.0):
    a = SF[name][int(skip * SR):]
    if rate != 1.0:
        idx = np.arange(0, len(a) - 1, rate); a = np.stack([np.interp(idx, np.arange(len(a)), a[:, c]) for c in (0, 1)], 1).astype(np.float32)
    if dur:
        a = a[: int(dur * SR)].copy(); f = min(len(a), int(0.3 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.41, np.sin((pan + 1) * np.pi / 4) * 1.41
    b = a.copy(); b[:, 0] *= l; b[:, 1] *= r
    put(b, t, gain)
def bed(name, t, sec, gain=0.1, xf=0.8, fin=0.8, fout=0.8):
    """cama en loop encadenada con fundidos"""
    src = SF[name]; L = len(src) / SR; left = sec; tt = t; first = True
    while left > 0.05:
        d = min(left, L); a = src[: int(d * SR)].copy(); n = len(a)
        fi = min(n, int((fin if first else xf) * SR)); fo = min(n, int((fout if d >= left else xf) * SR))
        if fi: a[:fi] *= np.linspace(0, 1, fi)[:, None]
        if fo: a[-fo:] *= np.linspace(1, 0, fo)[:, None]
        put(a, tt, gain)
        if d >= left: break
        tt += d - xf; left -= d - xf; first = False

dips = []   # (desde, hasta, nivel, rampa) sobre la ganancia de la música

if EP == "ep15":
    TITLE = CE("s01", "caras") + 0.45
    # ---------- música ----------
    place("apertura", 0.0, S("s02") - 1.0, off=20.0, fin=2.5, fout=2.2)
    place("paraguay", S("s02") - 0.6, S("s04") - 0.2, off=0.0, fin=1.6, fout=1.8)
    place("rio", S("s04") - 0.3, S("s06") - 0.3, off=0.0, fin=1.2, fout=2.0)
    place("fidelidad", S("s06") - 0.8, S("s07") + 3.5, off=22.0, fin=2.0, fout=3.0)
    place("crimen", S("s07") + 0.4, S("s09") - 1.0, off=0.0, fin=1.5, fout=2.5)
    place("fidelidad", S("s10") - 2.4, S("s11") - 0.6, off=0.0, fin=2.0, fout=2.4)
    place("final", S("s11") - 2.2, TOTAL, off=8.0, fin=2.0, fout=3.0)
    dips += [(TITLE - 0.3, S("s02") - 2.4, 1.7, 0.3),                       # el título respira
             (C("s03", "adentro") - 0.3, C("s03", "para la policia"), 0.35, 0.3),   # «adentro estaban los dos»
             (C("s05", "era nozzi") - 0.3, C("s05", "la prefectura"), 0.4, 0.3),
             (C("s06", "yo como") - 0.4, CE("s06", "norte") + 0.3, 0.6, 0.5),       # la cita de Roseo
             (C("s07", "los dos murieron") - 0.2, C("s07", "despues los") - 0.1, 0.25, 0.3),
             (C("s09", "era mi") - 0.3, CE("s09", "repite") + 0.5, 0.7, 0.4),
             (END - 0.2, TOTAL, 1.35, 0.8)]                                   # placa final

    # ---------- s01 · Castelli al amanecer ----------
    bed("amanecer_1", 0.0, C("s01", "adentro") + 0.4, 0.2, fin=2.0)
    fx("teletipo", 0.7, 0.08, -0.4, dur=2.4)
    fx("botas", C("s01", "tres") - 1.2, 0.12, -0.5, dur=5.0)
    fx("puerta_1", C("s01", "castelli") + 0.5, 0.3, -0.1)
    fx("impacto", C("s01", "adentro") - 0.15, 0.14)
    bed("amanecer_2", C("s01", "adentro") - 0.2, C("s01", "y era") - C("s01", "adentro") + 0.6, 0.1)
    fx("pop", C("s01", "cama"), 0.1); fx("pop", C("s01", "jeep"), 0.1)
    fx("whoosh", C("s01", "y era") - 0.35, 0.2)
    fx("monte", C("s01", "y era") - 0.2, 0.12, dur=4.5)
    fx("resonancia", C("s01", "250000") - 0.05, 0.22)
    fx("mapa", C("s01", "un campo") - 0.2, 0.18, dur=2.0)
    fx("pop", C("s01", "luxemburgo") - 0.1, 0.12)
    fx("subida", C("s01", "uno de los hombres") - 0.4, 0.16, dur=4.0)
    fx("drone", C("s01", "uno de los hombres") - 0.2, 0.12, dur=7.0)
    fx("glitch", C("s01", "nombre"), 0.1, -0.3, dur=0.4); fx("glitch", C("s01", "pais"), 0.1, 0.3, dur=0.4)
    fx("glitch", C("s01", "cara") - 0.1, 0.22, dur=0.6); fx("impacto", C("s01", "cara") - 0.05, 0.22)
    fx("bombo_1", C("s01", "el gusano") - 0.05, 0.3)
    fx("riser", C("s01", "el hombre de las mil caras") - 1.4, 0.18, dur=2.0)
    fx("glitch", C("s01", "mil caras") - 0.1, 0.24, dur=0.7)
    fx("whoosh", C("s01", "el hombre de las mil caras") + 0.3, 0.22)
    fx("bombo_2", TITLE - 0.02, 0.5); fx("boom", TITLE, 0.4); fx("resonancia", TITLE + 0.15, 0.34)
    fx("whoosh", S("s02") - 2.1, 0.16); fx("bombo_1", S("s02") - 1.95, 0.22)        # placa I

    # ---------- s02 · Posadas, la yerba, el Gusano ----------
    fx("mapa", S("s02") + 0.3, 0.16, dur=2.5); fx("pop", C("s02", "posadas"), 0.14)
    fx("typewriter", C("s02", "1959") - 0.05, 0.12, dur=0.8)
    fx("whoosh", C("s02", "en una de las familias") - 0.4, 0.14)
    for ph in ["diputado", "presidente", "una gran empresa"]: fx("pop", C("s02", ph), 0.1)
    fx("whoosh", C("s02", "tan grande") - 0.4, 0.12)
    fx("mapa", C("s02", "puerto menocchio") - 0.6, 0.14, dur=1.6); fx("pop", C("s02", "puerto menocchio"), 0.14)
    fx("whoosh", C("s02", "a luis") - 0.4, 0.14)
    fx("glitch", C("s02", "el gusano") - 0.15, 0.2, dur=0.5); fx("bombo_2", C("s02", "el gusano"), 0.22)
    fx("resonancia", C("s02", "era muy alto") - 0.1, 0.12)
    for k in range(3): fx("glitch", C("s02", "tartamudeaba") - 0.6 + k * 0.22, 0.12, (k - 1) * 0.4, dur=0.15)
    fx("paginas", C("s02", "en 1982") - 0.2, 0.16, dur=1.2)
    fx("stamp", C("s02", "quebro") + 0.02, 0.3); fx("impacto", C("s02", "quebro"), 0.12)
    fx("mapa", C("s02", "y los menocchio") - 0.3, 0.16, dur=3.0)

    # ---------- s03 · Asunción, la noche del 15 de agosto ----------
    bed("viento", S("s03") - 0.3, C("s03", "a la madrugada") - S("s03") + 0.3, 0.07)
    fx("teletipo", S("s03") + 0.1, 0.07, -0.4, dur=1.4)
    for k, ph in enumerate(["television", "seguridad"]): fx("pop", C("s03", ph), 0.1)
    for k in range(3): fx("stamp", C("s03", "denuncias") - 0.1 + k * 0.32, 0.24, (k - 1) * 0.4)
    fx("teletipo", C("s03", "la noche"), 0.07, -0.4, dur=1.6)
    fx("glitch", C("s03", "el puerto madero"), 0.08, dur=0.7)
    fx("whoosh", C("s03", "eduardo maciel") - 0.4, 0.1); fx("whoosh", C("s03", "graciela mendez") - 0.4, 0.1, 0.3)
    fx("camioneta", C("s03", "los tres") - 0.2, 0.22, dur=5.5)
    fx("resonancia", C("s03", "es la ultima") + 0.2, 0.16)
    fx("impacto", C("s03", "once dias") - 0.1, 0.18)
    bed("rio_noche_1", C("s03", "once dias") - 0.3, C("s03", "adentro") - C("s03", "once dias") + 0.4, 0.14, fin=0.6)
    fx("patrulleros", C("s03", "en una laguna"), 0.07, -0.6, dur=4.0)
    fx("tambores_1", C("s03", "aparecen") - 0.1, 0.32, 0.1)
    fx("tambores_2", C("s03", "sellados") - 0.1, 0.24, -0.1)
    fx("bombo_1", C("s03", "adentro") - 0.05, 0.3); fx("resonancia", C("s03", "adentro"), 0.16)
    fx("drone", C("s03", "para la policia") - 0.2, 0.1, dur=5.0)
    fx("stamp", C("s03", "principal sospechoso") + 0.05, 0.26)
    fx("whoosh", C("s03", "el siempre") - 0.3, 0.1)
    fx("stamp", C("s03", "juzgaron") + 0.02, 0.32); fx("impacto", C("s03", "juzgaron"), 0.14)
    fx("glitch", C("s03", "ya se habia") + 0.1, 0.18, dur=0.6)
    fx("whoosh", CE("s03", "ido") + 0.2, 0.16); fx("bombo_2", CE("s03", "ido") + 0.35, 0.22)   # placa II

    # ---------- s04 · la fuga, Hugo Jara, Nozzi ----------
    fx("mapa", S("s04") + 0.3, 0.16, dur=2.0)
    fx("riser", C("s04", "en avion") - 0.8, 0.08, dur=1.4)
    bed("balsa_1", C("s04", "la otra") - 0.2, C("s04", "lo cierto") - C("s04", "la otra") + 0.2, 0.16, fin=0.6)
    fx("pop", C("s04", "cargada"), 0.08); fx("pop", C("s04", "mochila"), 0.08)
    fx("glitch", C("s04", "hugo jara") - 0.1, 0.22, dur=0.6); fx("bombo_1", C("s04", "hugo jara"), 0.22)
    fx("drone", C("s04", "se opero") - 0.2, 0.1, dur=6.0)
    fx("whoosh", C("s04", "se opero") - 0.2, 0.12)
    fx("crujido", C("s04", "se quemo") - 0.05, 0.16, dur=1.8)
    fx("proyector", C("s04", "como hugo") - 0.3, 0.16, dur=8.5)
    fx("subida", C("s04", "10 millones") - 0.6, 0.12, dur=2.2)
    bed("rio_noche_2", C("s04", "vivia") - 0.5, C("s05", "y paran") - C("s04", "vivia") + 0.5, 0.16, fin=1.0)
    fx("barco", C("s04", "navegaba") - 0.2, 0.12, dur=6.0)

    # ---------- s05 · el Paraná, Itatí, las cadenas ----------
    fx("teletipo", S("s05"), 0.07, -0.4, dur=1.2)
    fx("whoosh", C("s05", "y paran") - 0.4, 0.12)
    fx("whoosh", C("s05", "despues") - 0.4, 0.12)
    fx("glitch", C("s05", "desaparece") + 0.2, 0.16, dur=0.5)
    fx("burbujas", C("s05", "a los pocos") - 0.5, 0.2, dur=6.5)
    fx("cadenas_1", C("s05", "atado") - 0.1, 0.32)
    fx("cadenas_2", C("s05", "a dos anclas") - 0.1, 0.26)
    fx("bombo_2", C("s05", "era nozzi") - 0.05, 0.32); fx("resonancia", C("s05", "era nozzi"), 0.18)
    fx("radio", C("s05", "la prefectura") - 0.1, 0.1, 0.4, dur=1.5)
    fx("stamp", C("s05", "detiene") + 0.05, 0.28); fx("candado", C("s05", "detiene") + 0.4, 0.14)
    fx("glitch", C("s05", "se cae") - 0.1, 0.26, dur=0.8); fx("impacto", C("s05", "es luis"), 0.2)
    fx("stamp", C("s05", "interpol") + 0.05, 0.28)
    fx("mapa", C("s05", "paraguay pide") - 0.2, 0.14, dur=2.0)
    fx("whoosh", C("s05", "pide"), 0.1, -0.4); fx("whoosh", C("s05", "la argentina responde"), 0.1, 0.4)
    bed("celda", C("s05", "y el juicio") - 0.3, C("s05", "y se va") - C("s05", "y el juicio") + 0.3, 0.12)
    fx("reloj", C("s05", "en mayo") - 0.1, 0.14, dur=2.4)
    fx("candado", C("s05", "libertad") - 0.3, 0.2); fx("stamp", C("s05", "libertad") + 0.05, 0.28)
    fx("whoosh", C("s05", "y se va") - 0.4, 0.12)
    fx("whoosh", CE("s05", "corrientes", 1) + 0.25, 0.16); fx("bombo_1", CE("s05", "corrientes", 1) + 0.4, 0.22)   # placa III

    # ---------- s06 · Manuel Roseo y el monte ----------
    bed("monte", S("s06") - 0.8, C("s06", "manuel roseo") - S("s06") + 1.0, 0.12, fin=1.2)
    fx("mapa", C("s06", "roma") - 0.6, 0.12, dur=4.0)
    fx("paginas", C("s06", "a principios") - 0.1, 0.14, dur=1.2)
    fx("resonancia", C("s06", "250000") - 0.05, 0.2)
    bed("monte", C("s06", "250000") - 0.3, C("s06", "y manuel") - C("s06", "250000") + 0.4, 0.12)
    fx("crujido", C("s06", "se convertia") - 0.1, 0.1, dur=1.4)
    bed("amanecer_2", C("s06", "y manuel") - 0.2, C("s06", "un campo asi") - C("s06", "y manuel") + 0.4, 0.08)
    fx("subida", C("s06", "cientos") - 0.8, 0.1, dur=2.0)
    bed("monte", C("s06", "un campo asi") - 0.3, S("s07") - C("s06", "un campo asi") - 0.5, 0.1)
    for ph in ["75", "ningun hijo", "ninguna custodia"]: fx("pop", C("s06", ph), 0.12)
    fx("bombo_2", C("s06", "ninguna custodia") + 0.1, 0.18)
    fx("whoosh", CE("s06", "custodia") + 0.1, 0.16); fx("bombo_1", CE("s06", "custodia") + 0.25, 0.22)   # placa IV

    # ---------- s07 · el boleto, los 40 millones, la foto, la calle España ----------
    fx("paginas", S("s07") + 0.5, 0.16, dur=1.4)
    fx("tipeo", C("s07", "le inicio"), 0.1, dur=2.4)
    fx("firma", C("s07", "con un boleto") + 0.3, 0.14)
    fx("stamp", C("s07", "nego") + 0.05, 0.3)
    fx("subida", C("s07", "40 millones") - 0.7, 0.12, dur=2.0)
    fx("stamp", C("s07", "probar") + 0.05, 0.32); fx("impacto", C("s07", "probar"), 0.12)
    fx("flash", C("s07", "foto") - 0.05, 0.3)
    fx("bombo_2", C("s07", "siete dias") - 0.05, 0.22)
    bed("amanecer_1", C("s07", "siete dias") - 0.2, C("s07", "roseo y su") - C("s07", "siete dias") + 0.3, 0.12)
    fx("puerta_2", C("s07", "entran") + 0.2, 0.3)
    fx("drone", C("s07", "roseo y su") - 0.2, 0.12, dur=9.0)
    fx("reloj", C("s07", "durante") - 0.2, 0.16, dur=2.6)
    for ph, g in [("una firma", 0.26), ("una huella", 0.26), ("el lugar", 0.3)]: fx("stamp", C("s07", ph), g)
    fx("latido", C("s07", "los dos murieron") - 0.2, 0.2, dur=3.2)
    fx("whoosh", C("s07", "despues los") - 0.4, 0.1)
    bed("amanecer_2", C("s07", "despues los") - 0.6, S("s08") - C("s07", "despues los") + 0.6, 0.1)

    # ---------- s08 · el error: Sergio Berg ----------
    fx("impacto", C("s08", "un error") - 0.05, 0.24); fx("bombo_1", C("s08", "un error"), 0.2)
    fx("baul_1", C("s08", "lo metieron") + 0.1, 0.4)
    fx("camioneta", C("s08", "lo metieron") + 0.6, 0.12, dur=6.0)
    fx("resonancia", C("s08", "tenemos") - 0.1, 0.14)
    fx("mapa", C("s08", "lo dejaron") - 0.2, 0.14, dur=1.8)
    fx("drone", C("s08", "junto a un pozo") - 0.2, 0.12, dur=3.5)
    fx("latido", C("s08", "berg rompio") - 0.4, 0.26, dur=4.5)
    fx("bombo_2", C("s08", "sobrevivio") - 0.03, 0.34); fx("resonancia", C("s08", "sobrevivio") + 0.05, 0.22)
    fx("bombo_1", C("s08", "raul") - 0.03, 0.24)
    for k in range(3): fx("glitch", C("s08", "tartamudeo") - 0.5 + k * 0.22, 0.14, (k - 1) * 0.4, dur=0.15)
    fx("patrulleros", C("s08", "once dias") - 0.2, 0.1, 0.4, dur=4.5)
    fx("stamp", C("s08", "encontro") + 0.05, 0.3); fx("candado", C("s08", "encontro") + 0.4, 0.14)
    fx("whoosh", CE("s08", "vacaciones") + 0.3, 0.16); fx("bombo_2", CE("s08", "vacaciones") + 0.45, 0.24)   # placa V

    # ---------- s09 · las dos perpetuas ----------
    bed("drone", S("s09") - 0.5, S("s10") - S("s09") - 1.0, 0.1, fin=1.2)
    fx("tipeo", S("s09") + 0.3, 0.1, dur=2.0)
    fx("stamp", C("s09", "perpetua") + 0.1, 0.34); fx("bombo_1", C("s09", "perpetua") + 0.1, 0.3)
    fx("tipeo", C("s09", "en octubre") + 0.2, 0.1, dur=2.2)
    fx("stamp", C("s09", "perpetua", 1) + 0.1, 0.34); fx("bombo_2", C("s09", "perpetua", 1) + 0.1, 0.32)
    fx("whoosh", C("s09", "menocchio nego") - 0.4, 0.1)
    fx("resonancia", C("s09", "era mi") - 0.1, 0.14)
    fx("whoosh", CE("s09", "repite") + 0.3, 0.16); fx("bombo_1", CE("s09", "repite") + 0.45, 0.24)   # placa VI

    # ---------- s10 · el parque ----------
    bed("monte", S("s10") - 0.4, C("s10", "y el ambientalista") - S("s10") + 0.4, 0.12)
    fx("stamp", C("s10", "expropiar") + 0.05, 0.28)
    fx("paginas", C("s10", "una ley") - 0.1, 0.12, dur=1.2)
    bed("monte", C("s10", "en 2014") - 0.3, C("s10", "en 2019") - C("s10", "en 2014") + 0.3, 0.12)
    fx("resonancia", C("s10", "parque nacional"), 0.16)
    bed("rio_noche_1", C("s10", "en 2019") - 0.3, C("s10", "el campo por") - C("s10", "en 2019") + 0.4, 0.08)
    fx("yaguarete_1", C("s10", "yaguarete") - 0.2, 0.3, 0.2)
    bed("amanecer_1", C("s10", "el campo por") - 0.4, S("s11") - C("s10", "el campo por"), 0.12)
    fx("whoosh", CE("s10", "justicia") + 0.3, 0.16); fx("bombo_2", CE("s10", "justicia") + 0.45, 0.24)   # placa VII

    # ---------- s11 · Rawson, Ezeiza, las mil caras ----------
    fx("glitch", C("s11", "mil caras") - 0.1, 0.16, dur=0.5)
    fx("mapa", C("s11", "en 2014") - 0.2, 0.14, dur=2.0)
    bed("celda", C("s11", "ahi paso") - 0.4, C("s11", "un fin de semana") - C("s11", "ahi paso") + 0.3, 0.12)
    fx("candado", C("s11", "doce anos") - 0.1, 0.18)
    fx("radio", C("s11", "en agosto") - 0.1, 0.08, 0.4, dur=1.5)
    fx("pop", C("s11", "40"), 0.12); fx("pop", C("s11", "17"), 0.12, 0.3)
    fx("impacto", C("s11", "el lo niega") - 0.05, 0.14)
    fx("mapa", C("s11", "un fin de semana") - 0.2, 0.14, dur=2.0)
    fx("proyector", C("s11", "y su abogado") - 0.2, 0.12, dur=6.0)
    fx("stamp", C("s11", "no lo confirmo") + 0.05, 0.28)
    fx("drone", C("s11", "luis raul") - 0.4, 0.1, dur=10.0)
    fx("glitch", C("s11", "de cara") - 0.1, 0.2, dur=0.6)
    fx("bombo_1", C("s11", "tiene dos") - 0.03, 0.2)
    fx("whoosh", C("s11", "y el campo") - 0.4, 0.14)
    bed("monte", C("s11", "y el campo") - 0.6, TOTAL - C("s11", "y el campo") + 0.6, 0.14, fin=1.4, fout=3.0)
    fx("resonancia", C("s11", "hoy es de todos") - 0.1, 0.2)
    fx("bombo_2", END + 0.3, 0.26)

else:
    # ---------- vertical (2:46): un tema por bloque, el cierre con el llamado a YouTube ----------
    place("apertura", 0.0, S("v02") + 0.4, off=55.0, fin=0.05, fout=1.0)
    place("paraguay", S("v02") - 0.4, S("v03") + 0.2, off=10.0, fin=0.8, fout=1.0)
    place("rio", S("v03") - 0.3, S("v04") + 0.2, off=20.0, fin=0.6, fout=1.0)
    place("crimen", S("v04") - 0.3, S("v05") + 0.2, off=6.0, fin=0.6, fout=1.2)
    place("final", S("v05") - 0.4, TOTAL, off=50.0, fin=1.0, fout=2.0)
    dips += [(END - 0.2, TOTAL, 1.4, 0.6)]
    exec(open(os.path.join(ROOT, "tools/mix_ep15v_cues.py")).read())

# ---------------- ducking ----------------
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
LOW, HIGH = 0.1, 0.56
g = HIGH - (HIGH - LOW) * env
for a, b, level, ramp in dips:
    i0, i1, r = int(a * SR), int(b * SR), int(ramp * SR)
    d = np.ones(N); d[i0:i1] = level
    d[max(0, i0 - r):i0] = np.linspace(1, level, i0 - max(0, i0 - r)); d[i1:i1 + r] = np.linspace(level, 1, len(d[i1:i1 + r]))
    g = g * d
music *= g[:, None].astype(np.float32)

# ---------------- suma y máster (loudnorm lineal en dos pasadas) ----------------
act = env[: N] > 0.5
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print("voz (hablando) dB:", round(db(voice[act]), 1), "| música bajo voz dB:", round(db(music[act].mean(axis=1)), 1),
      "| música en pausas dB:", round(db(music[~act].mean(axis=1)), 1), "| efectos pico:", round(float(np.abs(sfx).max()), 2))
sfx *= (1 - 0.3 * env[:, None]).astype(np.float32)
mix = music + sfx * 0.9
hop = SR // 2; bg = mix.mean(axis=1)
for i in range(0, int(TOTAL * SR) - hop, hop):
    if act[i:i + hop].mean() < 0.6: continue
    v, b = db(voice[i:i + hop]), db(bg[i:i + hop])
    if b > v - 9: print(f"  fondo alto {i / SR:7.1f}s  voz {v:5.1f}  fondo {b:5.1f}  (música {db(music[i:i + hop].mean(axis=1)):5.1f}, efectos {db(sfx[i:i + hop].mean(axis=1) * 0.9):5.1f})")
mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]
peak = np.abs(mix).max(); print("pico previo", round(float(peak), 3))
mix = mix / max(peak, 1e-9) * 0.89
raw = os.path.join(OUT, f"pre_{EP}.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, f"mezcla_{EP}.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
