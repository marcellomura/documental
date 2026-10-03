"""Mezcla del episodio 12 (ARA San Juan): narración + cuatro temas con ducking + diseño sonoro (sonar, agua,
casco, la grabación real de la implosión del Titan). Salida: audio/mix/mezcla_ep12.wav (48 kHz estéreo, -14 LUFS).
Momentos de silencio buscados: "Después, silencio." y los 3,4 s en que suena sola la grabación del Titan."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep12/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep12/words.json")))
ST, TOTAL, D, INS, NAMES = TL["starts"], TL["total"], TL["durations"], TL["inserts"], TL["names"]
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
    ws = W[seg]; tg = [norm(x) for x in phrase.split()]; found = -1
    for i in range(len(ws) - len(tg) + 1):
        if all(norm(ws[i + k]["w"]) == t for k, t in enumerate(tg)):
            found += 1
            if found == n:
                return ST[seg] + (ws[i]["s"] if which == "s" else ws[i + len(tg) - 1]["e"])
    raise KeyError(f"{seg} {phrase} #{n}")

N = int((TOTAL + 1) * SR)
voice = np.zeros(N, np.float32)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)

# ---------------- Narración ----------------
for k in sorted(ST):
    a = load(os.path.join(PUB, f"ep12/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música ----------------
M = {k: load(os.path.join(PUB, f"ep12/music/{k}.mp3")) for k in ["abismo", "senal", "hallazgo", "nombres"]}
TARGET_RMS = 10 ** (-16 / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
REF = {k: rms(v[int(5 * SR): int(75 * SR)]) for k, v in M.items()}
def place(name, g0, g1, off, fin=0.05, fout=0.35, gain=1.0):
    src = M[name]; i0, i1 = int(g0 * SR), int(g1 * SR); o = int(off * SR)
    seg = src[o:o + (i1 - i0)].copy(); n = len(seg)
    seg *= TARGET_RMS / REF[name]
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain

TITLE = ST["s01"] + D["s01"] + 0.15
cut5, cut7, cut10 = ST["s05"] - 0.35, ST["s07"] - 0.5, ST["s10"] - 0.5
place("abismo", 0.0, cut5 + 0.8, 0.0, fin=0.6, fout=1.6)
place("senal", cut5 - 0.5, cut7 + 0.4, 0.0, fin=1.2, fout=1.8)
span3 = cut10 + 0.4 - (cut7 - 0.3)
place("hallazgo", cut7 - 0.3, cut10 + 0.4, max(0.0, len(M["hallazgo"]) / SR - span3 - 0.5), fin=1.6, fout=1.6)
span4 = TOTAL - (cut10 - 0.2)
place("nombres", cut10 - 0.2, TOTAL, max(0.0, len(M["nombres"]) / SR - span4 - 0.3), fin=2.0, fout=2.0)

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
dip(TITLE - 0.3, ST["s02"] - 0.4, 1.6, ramp=0.4)                                   # placa de título
dip(C("s03", "Después,") + 0.2, ST["s04"] - 0.5, 0.08, ramp=0.8)                   # "Después, silencio."
ins1, ins2 = ST["s06"] + INS["s06"][0][0], ST["s06"] + INS["s06"][1][0]
dip(ins1 - 0.1, ins1 + 1.1, 0.25, ramp=0.15)                                       # la implosión
dip(ins2 - 1.6, ins2 + INS["s06"][1][1] + 0.2, 0.0, ramp=0.6)                      # suena sola la grabación del Titan
dip(C("s07", "Nada.", 2) - 0.1, C("s07", "Nada.", 2) + 1.2, 0.3, ramp=0.2)
dip(C("s08", "lo vieron.") - 0.3, C("s08", "El ARA") + 0.1, 1.4, ramp=0.3)          # el momento del hallazgo
dip(NAMES - 0.5, TOTAL, 1.65, ramp=1.2)                                           # los nombres y la placa final
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx", "ep05/sfx", "ep06/sfx", "ep09/sfx", "ep10/sfx", "ep11/sfx", "ep12/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        a = load(os.path.join(PUB, d, f))
        SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
SF["whoosh_rev"] = SF["whoosh"][::-1].copy()
from sfx_synth import swell, wind, powerdown
def put(a, t, gain=0.5):
    if a.ndim == 1: a = np.stack([a, a], axis=1)
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
def fx(name, t, gain=0.5, pan=0.0, dur=None):
    a = SF[name]
    if dur:
        a = a[: int(dur * SR)].copy(); f = min(len(a), int(0.3 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41
    sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41
def amb(t, sec, gain=0.12):
    """cama de ambiente submarino (se encadena si hace falta)"""
    left = sec; tt = t; first = True
    while left > 0.05:
        d = min(left, 20.0); a = SF["ambiente"][: int(d * SR)].copy(); n = len(a)
        fi, fo = (0 if first else min(n, int(0.5 * SR))), min(n, int(0.3 * SR))
        if fi: a[:fi] *= np.linspace(0, 1, fi)[:, None]
        a[-fo:] *= np.linspace(1, 0, fo)[:, None]
        put(a, tt, gain)
        if d >= left: break
        tt += d - 0.5; left -= d - 0.5; first = False

# transiciones
CUT = {"s02": ST["s02"] - 0.35, "s03": ST["s03"] - 0.35, "s04": ST["s04"] - 0.6, "s05": ST["s05"] - 0.35, "s06": ST["s06"] - 0.35,
       "s07": ST["s07"] - 0.5, "s08": ST["s08"] - 0.35, "s09": ST["s09"] - 0.25, "s10": ST["s10"] - 0.5}
for k in ["s02", "s05"]: fx("sonar", CUT[k] - 0.35, 0.42)                    # ping
for k in ["s03", "s08"]: fx("whoosh", CUT[k] - 0.4, 0.38); fx("burbujas", CUT[k] - 0.1, 0.16)   # descenso
fx("whoosh", CUT["s06"] - 0.3, 0.4, 0.4)                                        # barrido
for k in ["s04", "s07", "s10"]: put(swell(2.2), CUT[k] - 1.2, 0.14)            # disolvencias
fx("impacto", CUT["s09"] - 0.05, 0.55); fx("whoosh_rev", CUT["s09"] - 0.8, 0.25)   # destello

# S01 — el micrófono
amb(0.0, 11.5, 0.16); fx("sonar", 0.15, 0.4); put(wind(4.0, 0.3, 0.6), 0.0, 0.06)
fx("sonar", C("s01", "micrófono.") - 0.1, 0.32, 0.3)
for k in range(3): fx("sonar", C("s01", "Está") + 0.5 + k * 1.1, 0.16 - k * 0.03, (k - 1) * 0.4)
fx("explosion", C("s01", "escuchar") - 0.25, 0.42); fx("boom", C("s01", "bombas"), 0.35)
fx("glitch", C("s01", "El quince") - 0.15, 0.12); fx("teletipo", C("s01", "El quince"), 0.12, dur=1.4)
fx("impacto", C("s01", "registró") + 1.0, 0.42); fx("sonar", C("s01", "registró") + 1.0, 0.22)
fx("whoosh", C("s01", "No era") - 0.3, 0.2)
fx("whoosh", C("s01", "Era un") - 0.35, 0.28); fx("impacto", C("s01", "cuarenta") - 0.1, 0.25)
for k in range(3): fx("sonar", C("s01", "Durante") + k * 0.9, 0.14, (k - 1) * 0.6)
fx("tictac", C("s01", "Durante"), 0.1, dur=2.8)
fx("whoosh", C("s01", "Esta es") + 0.4, 0.22)
fx("crujido", C("s01", "qué le") - 0.1, 0.3, dur=1.4); fx("burbujas", C("s01", "qué le") + 0.3, 0.16)
fx("rov", C("s01", "cómo lo") - 0.1, 0.18, dur=1.6)
fx("tictac", C("s01", "las dos horas") - 0.3, 0.16, dur=3.6)
fx("riser", TITLE - 2.2, 0.3); fx("impacto", TITLE - 0.02, 0.62); fx("sonar", TITLE + 0.05, 0.3)

# S02 — el submarino
amb(CUT["s02"], 29.0, 0.1)
fx("whoosh", C("s02", "sesenta") - 0.3, 0.16)
fx("stamp", C("s02", "No era") + 0.45, 0.3); fx("impacto", C("s02", "era diésel-eléctrico.") - 0.05, 0.2)
fx("glitch", C("s02", "Bajo") - 0.2, 0.14); fx("zumbido", C("s02", "Bajo") + 0.5, 0.06, dur=5.0)
put(powerdown(1.4), C("s02", "se gastan.") - 0.4, 0.22)
fx("mar", C("s02", "Para recargarlas") - 0.3, 0.12, dur=8.0); fx("burbujas", C("s02", "asomar") - 0.2, 0.18)
fx("motor", C("s02", "respiran") - 0.2, 0.1, dur=3.5)
fx("crujido", C("s02", "Es uno") + 0.2, 0.18, dur=2.6); fx("sonar", C("s02", "Es uno") + 0.1, 0.18)

# S03 — la noche
fx("mar", CUT["s03"], 0.1, dur=5.0); fx("teletipo", ST["s03"] + 0.1, 0.1, dur=1.2)
for k in range(4): fx("pop", C("s03", "cuarenta") - 0.3 + k * 0.33, 0.07, (k - 1.5) * 0.4)
put(swell(2.4), C("s03", "Entre") - 0.4, 0.12)
fx("tormenta", C("s03", "El mar") - 0.25, 0.5, dur=2.4); fx("impacto", C("s03", "El mar") + 0.3, 0.2)
amb(C("s03", "Navegando") - 0.1, 19.0, 0.08)
fx("burbujas", C("s03", "entró") - 0.1, 0.3); fx("mar", C("s03", "entró"), 0.12, dur=3.5)
fx("pop", C("s03", "válvula") - 0.05, 0.16)
fx("burbujas", C("s03", "llegó") - 0.1, 0.22)
fx("corto", C("s03", "Cortocircuito,") - 0.1, 0.62); fx("glitch", C("s03", "Cortocircuito,"), 0.22)
fx("chisporroteo", C("s03", "humo,") - 0.1, 0.22, dur=2.6)
put(powerdown(1.6), C("s03", "La tripulación") + 0.4, 0.2)
fx("teletipo", C("s03", "A las siete") - 0.15, 0.24, dur=3.8); fx("radio", C("s03", "última") - 0.2, 0.14, dur=2.4)
fx("tictac", C("s03", "silencio.") + 0.25, 0.12, dur=2.6)

# S04 — la búsqueda
fx("teletipo", ST["s04"] - 0.2, 0.18, dur=2.0); fx("paginas", ST["s04"] + 1.6, 0.18, dur=0.9)
fx("aviones", C("s04", "Empezó") - 0.2, 0.26, dur=4.5); fx("helicoptero", C("s04", "más de") + 0.2, 0.12, dur=3.0)
fx("pop", C("s04", "más de") + 0.2, 0.2); fx("pop", C("s04", "cuatro mil") + 0.1, 0.2)
fx("sonar", C("s04", "barcos") + 0.1, 0.18); fx("whoosh", C("s04", "España.") - 0.6, 0.2)
fx("mar", C("s04", "Las familias") - 0.2, 0.08, dur=5.0)
for k in range(7): fx("satelital", C("s04", "Siete") - 0.05 + k * 0.22, 0.09, ((k % 4) - 1.5) * 0.4, dur=0.6)
fx("satelital", C("s04", "llamadas"), 0.2, dur=2.4)
fx("glitch", C("s04", "no eran") - 0.1, 0.25); fx("stamp", C("s04", "no eran") + 0.4, 0.45)
fx("sonar", C("s04", "habló") - 0.05, 0.5); fx("impacto", C("s04", "habló"), 0.28)

# S05 — el canal SOFAR y las estaciones
fx("zumbido", ST["s05"] + 2.0, 0.05, dur=12.0)
fx("sonar", C("s05", "el sonido") - 0.1, 0.32); fx("sonar", C("s05", "rebota") - 0.1, 0.18, -0.4); fx("sonar", C("s05", "y viaja") - 0.1, 0.2, 0.4)
fx("impacto", C("s05", "Se llama") + 0.1, 0.32)
fx("mar", C("s05", "Después de") - 0.2, 0.1, dur=7.0)
fx("pop", C("s05", "Uno está") - 0.1, 0.18, 0.4); fx("whoosh", C("s05", "a seis") - 0.3, 0.16, 0.3)
fx("pop", C("s05", "Otro,") - 0.1, 0.18, 0.6); fx("whoosh", C("s05", "a casi") - 0.3, 0.16, 0.6)
fx("sonar", C("s05", "Al primero,") - 0.2, 0.3); fx("tictac", C("s05", "Al primero,"), 0.14, dur=2.6)
fx("riser", C("s05", "Cruzando") - 0.6, 0.24); fx("impacto", C("s05", "un punto") - 0.05, 0.42)

# S06 — la implosión y el Titan
fx("teletipo", ST["s06"] - 0.1, 0.14, dur=1.5)
for ph in ["anómalo,", "singular,", "corto,", "violento", "no nuclear,"]: fx("knock", C("s06", ph) - 0.03, 0.18)
fx("impacto", C("s06", "explosión.") - 0.03, 0.32)
fx("tictac", C("s06", "En la") - 0.1, 0.12, dur=3.6)
fx("whoosh_rev", C("s06", "Fue una") - 0.5, 0.24)
fx("implosion", ins1 - 0.05, 0.72); fx("impacto", ins1, 0.5)
amb(C("s06", "Cada diez") - 0.3, 15.0, 0.16)
fx("crujido", C("s06", "El casco") - 0.2, 0.28); fx("crujido", C("s06", "Según") + 0.5, 0.38, 0.3)
fx("implosion", C("s06", "cedió.") + 0.3, 0.6); fx("impacto", C("s06", "cedió.") + 0.35, 0.45)
fx("pop", C("s06", "El colapso"), 0.16); fx("pop", C("s06", "un parpadeo.") - 0.1, 0.18)
fx("rov", C("s06", "En dos") - 0.1, 0.1, dur=6.5)
put(SF["titan_real"], ins2 - 2.5, 0.95)          # grabación real de la implosión del Titan (NOAA)
fx("impacto", C("s06", "La Argentina") - 0.1, 0.22)

# S07 — un año de nada
amb(CUT["s07"], 4.0, 0.14); fx("sonar", ST["s07"] + 0.3, 0.2)
fx("tictac", C("s07", "El treinta"), 0.08, dur=1.4)
for k in range(9): fx("pop", C("s07", "meses sin") - 0.2 + k * 0.32, 0.06, ((k % 3) - 1) * 0.5)
fx("glitch", C("s07", "meses sin") + 0.4, 0.14)
fx("mar", C("s07", "Al final,") - 0.2, 0.12, dur=10.0); fx("barco", C("s07", "Al final,"), 0.1, dur=6.0)
fx("pop", C("s07", "si no") , 0.18); fx("cashregister", C("s07", "siete millones") + 0.5, 0.24)
fx("rov", C("s07", "En septiembre") - 0.2, 0.18, dur=5.6); fx("sonar", C("s07", "cinco robots"), 0.2)
fx("tictac", C("s07", "Pasaron") - 0.1, 0.14, dur=1.8); fx("impacto", C("s07", "Nada.", 2) - 0.03, 0.42)

# S08 — el hallazgo
fx("pop", C("s08", "el domingo") + 0.2, 0.2); fx("stamp", C("s08", "Sudáfrica.") - 0.2, 0.42)
fx("zumbido", C("s08", "Entonces,") - 0.2, 0.08, dur=9.0); fx("sonar", C("s08", "apareció"), 0.3)
fx("pop", C("s08", "Un objeto"), 0.2); fx("sonar", C("s08", "punto de") - 0.1, 0.22, 0.3)
fx("rov", C("s08", "El viernes") - 0.2, 0.34, dur=8.0); fx("burbujas", C("s08", "El viernes"), 0.18)
fx("tictac", C("s08", "A bordo,"), 0.1, dur=4.0)
fx("riser", C("s08", "lo vieron.") - 2.0, 0.3); fx("impacto", C("s08", "lo vieron.") - 0.05, 0.55); fx("sonar", C("s08", "lo vieron."), 0.2)
amb(C("s08", "El ARA") - 0.2, 8.0, 0.16); fx("crujido", C("s08", "Con el") - 0.1, 0.22, dur=3.0)

# S09 — la verdad
fx("martillo", C("s09", "un tribunal") + 0.5, 0.42)
fx("burbujas", C("s09", "La válvula"), 0.12); fx("pop", C("s09", "cuatro meses"), 0.18)
fx("pop", C("s09", "veintiséis"), 0.2); fx("pop", C("s09", "treinta y tres"), 0.2)
fx("impacto", C("s09", "Aun así,") - 0.05, 0.25)
fx("martillo", C("s09", "tres años") - 0.15, 0.36)
for k in range(3): fx("stamp", C("s09", "absueltos.") - 0.3 + k * 0.12, 0.3, (k - 1) * 0.6)
fx("tictac", C("s09", "Entre las") - 0.2, 0.2, dur=7.5); fx("sonar", C("s09", "nadie sabe"), 0.12)

# S10 — el mar
amb(CUT["s10"], 6.0, 0.12)
for k in range(13): fx("pop", C("s10", "a casi") - 0.1 + k * 0.12, 0.05, 0.4)
fx("mar", C("s10", "Y queda") - 0.2, 0.08, dur=10.0); fx("sonar", C("s10", "La red") , 0.22)
fx("mar", C("s10", "Lo que") - 0.2, 0.16, dur=5.5)
fx("pop", C("s10", "¿Vos") - 0.2, 0.22); fx("pop", C("s10", "¿Vos") + 0.2, 0.18)
fx("impacto", C("s10", "Estos son") - 0.1, 0.2)

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
raw = os.path.join(OUT, "pre12.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep12.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
