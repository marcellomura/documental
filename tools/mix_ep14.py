"""Mezcla del episodio 14 (CAMPO DEL CIELO): narración + ocho temas con el mismo motivo de cuatro notas (ducking bajo
la voz) + diseño sonoro sincronizado con las frases (el monte, la caída, la lluvia de hierro, los cinceles, la voladura,
la forja, la grúa de 1990, el barro de Gancedo, los detectores).
Salida: audio/mix/mezcla_ep14.wav (48 kHz estéreo, -14 LUFS integrados, pico -1,5 dBTP).
Golpes atados a la música: el impacto del tema «impacto» cae en el silencio de «sobre la llanura»; el corte en seco de
«pólvora» cae en la voladura; el corte de «robo» cae en «En el camión va el meteorito»; el golpe grande de «gigante»
cae en «apareció otro gigante»."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep14/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep14/words.json")))
ST, TOTAL, D, INS, END = TL["starts"], TL["total"], TL["durations"], TL["inserts"], TL["end"]
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
def CE(seg, phrase, n=0): return C(seg, phrase, n, "e")
def ins(seg, k):
    a, s = INS[seg][k]; return ST[seg] + a, s

N = int((TOTAL + 1) * SR)
voice = np.zeros(N, np.float32)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)

# ---------------- Narración ----------------
for k in sorted(ST):
    a = load(os.path.join(PUB, f"ep14/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Momentos clave (los mismos que usa video/src/ep14) ----------------
TITLE = ST["s01"] + D["s01"]                    # termina el gancho: secuencia de título
HIT = TITLE + 0.55                               # el meteoro arma el título
T_IMP = ins("s02", 1)[0] + 0.1                   # la lluvia de hierro toca el suelo (silencio de 2,6 s)
T_BLAST = ins("s04", 2)[0] + 0.05                # la voladura de Rubín de Celis, después de «Pólvora.»
T_ALG = ins("s06", 0)[0]                         # «Y alguien la quiere.»
T_CAMION = ins("s06", 1)[0] + 0.05               # «En el camión va el meteorito.»
T_GIG = CE("s07", "otro gigante:") + 0.05            # el golpe entra después de la palabra, en el respiro

# ---------------- Música: ocho temas con el motivo de cuatro notas ----------------
NAMES = ["tema", "impacto", "conquista", "polvora", "pedazos", "robo", "gigante", "busqueda"]
M = {k: load(os.path.join(PUB, f"ep14/music/{k}.mp3")) for k in NAMES}
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

# posiciones medidas dentro de cada tema (detección de ataques y cortes)
IMPACTO_HIT = 53.32      # golpe orquestal después del vacío de 47,9 s
POLVORA_STOP = 59.28     # corte en seco después de 40 s de tensión
ROBO_STOP = 32.78        # corte abrupto del tema del robo
GIGANTE_HIT = 49.04      # florece la orquesta con el coro

place("tema", 0.0, HIT + 0.1, 0.0, fin=0.05, fout=0.25)                                    # gancho
place("tema", HIT - 0.05, ST["s02"] - 0.2, 74.5, fin=0.03, fout=1.0, gain=0.95)              # título: la cresta del tema
t0 = ST["s02"] - 0.6
place("impacto", t0, ST["s03"] - 0.3, IMPACTO_HIT - (T_IMP - t0), fin=1.4, fout=1.6)        # caída e impacto
place("conquista", ST["s03"] - 0.6, ST["s04"] - 0.3, 0.0, fin=0.7, fout=1.3, gain=0.9)        # 1576-1774
t0 = ST["s04"] - 0.5
place("polvora", t0, ST["s05"] + 1.4, POLVORA_STOP - (T_BLAST - t0), fin=0.6, fout=1.6)      # Rubín de Celis
place("pedazos", ST["s05"] - 0.2, ST["s06"] - 0.3, 0.0, fin=1.2, fout=1.2, gain=0.9)          # 1803-1825
place("gigante", ST["s06"] - 0.4, T_ALG + 0.15, 0.0, fin=0.05, fout=0.5, gain=0.9)            # el siglo XX devuelve gigantes
t0 = T_ALG + 0.75
place("robo", t0, C("s06", "Seis días después") + 0.6, ROBO_STOP - (T_CAMION - t0), fin=0.04, fout=2.2)  # 1990
place("tema", C("s06", "Seis días después") - 0.6, C("s07", "Y bajo la tierra") - 0.2, 12.0, fin=1.6, fout=1.4, gain=0.85)
t0 = C("s07", "Y bajo la tierra") - 0.5
place("gigante", t0, ST["s08"] - 0.25, GIGANTE_HIT - (T_GIG - t0), fin=1.0, fout=1.0)         # Gancedo
place("busqueda", CE("s08", "nada.") + 0.3, ST["s09"] + 0.4, 0.0, fin=1.6, fout=1.6, gain=1.0)  # la búsqueda
place("tema", ST["s09"] - 0.6, TOTAL, 72.0, fin=2.0, fout=3.2)                               # cierre y placa final

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
LOW, HIGH = 0.17, 0.55
g = HIGH - (HIGH - LOW) * env
def dip(a, b, level, ramp=0.4):
    global g
    i0, i1, r = int(a * SR), int(b * SR), int(ramp * SR)
    d = np.ones(N); d[i0:i1] = level
    d[max(0, i0 - r):i0] = np.linspace(1, level, i0 - max(0, i0 - r)); d[i1:i1 + r] = np.linspace(level, 1, len(d[i1:i1 + r]))
    g = g * d
dip(ST["s01"], TITLE - 0.3, 0.82, ramp=0.6)                                         # el gancho, con la voz bien adelante
dip(TITLE - 0.2, ST["s02"] - 0.5, 1.7, ramp=0.3)                                    # título
a, s = ins("s01", 0); dip(a, a + s, 0.7, 0.2)                                        # había caído del cielo
dip(C("s02", "Pesa cientos") - 0.2, CE("s02", "lo calienta") + 0.2, 0.65, 0.3)          # la subida de «impacto» bajo la voz
dip(C("s04", "construí dos") - 0.2, T_BLAST - 0.15, 0.75, 0.3)                       # la tensión antes de la voladura
a, s = ins("s01", 1); dip(a - 0.1, a + s, 0.3, 0.15)                                 # le puso pólvora (la explosión)
a, s = ins("s01", 3); dip(a - 0.3, a + s + 0.2, 0.45, 0.3)                          # pero la mesa, no
dip(T_IMP - 0.05, ins("s02", 1)[0] + ins("s02", 1)[1], 1.6, ramp=0.2)              # el impacto
a, s = ins("s03", 1); dip(a - 0.15, a + s + 0.6, 0.4, 0.25)                         # una quinta parte de plata. ¿Plata?
a, s = ins("s04", 0); dip(a, a + s, 1.35, 0.3)                                       # El Mesón de Fierro
a, s = ins("s04", 3); dip(a, a + s, 0.7, 0.2)                                        # se equivocaba
dip(C("s04", "pisadas de aves") - 0.4, C("s04", "manos humanas"), 0.6, 0.15)         # acento del tema bajo la voz
dip(C("s04", "Ernst Chladni") - 0.3, C("s04", "usa ese hierro") + 0.3, 0.6, 0.15)
a, s = ins("s05", 1); dip(a - 0.4, ins("s05", 2)[0] + 0.5, 0.55, 0.3)              # ¿hechas de cielo? nadie lo pudo comprobar
a, s = ins("s07", 2); dip(a, a + s, 1.4, 0.3)                                        # treinta toneladas y ochocientos kilos
a, s = ins("s08", 1); dip(a - 0.1, a + s, 0.6, 0.2)                                  # y no aparece
a, s = ins("s08", 2); dip(a, a + s, 0.75, 0.2)                                       # un punto que nadie sabía dónde estaba
dip(ST["s09"] - 0.2, END - 0.3, 0.6, ramp=0.8)                                      # la cresta del tema, debajo de la pregunta
a, s = ins("s09", 0); dip(a, a + s, 1.9, 0.4)                                        # perdidas en el monte chaqueño
dip(END - 0.3, TOTAL, 0.95, ramp=1.0)                                               # placa final
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SRC = {  # nombre: archivo (los del episodio y algunos de la biblioteca de episodios anteriores)
    **{f[:-4]: f"ep14/sfx/{f}" for f in os.listdir(os.path.join(PUB, "ep14/sfx")) if f.endswith(".mp3")},
    "golpe": "ep13/sfx/impacto.mp3", "subida": "ep13/sfx/subida.mp3", "drone": "ep13/sfx/drone.mp3", "latido": "ep13/sfx/latido.mp3",
    "teclado": "ep13/sfx/teclado.mp3", "whoosh": "ep12/sfx/whoosh.mp3", "crujido": "ep12/sfx/crujido.mp3", "satelital": "ep12/sfx/satelital.mp3",
    "explosion": "ep11/sfx/explosion.mp3", "paginas": "ep10/sfx/paginas.mp3", "barco": "ep10/sfx/barco.mp3", "stamp": "ep03/sfx/stamp.mp3",
    "tictac": "ep05/sfx/tictac.mp3", "campanada": "ep05/sfx/campanada.mp3", "pop": "sfx/pop.mp3", "boom": "sfx/boom.mp3",
}
SF = {}
for k, rel in SRC.items():
    p = os.path.join(PUB, rel)
    if not os.path.exists(p): p = p[:-4] + ".wav"
    a = load(p); SF[k] = a / (np.abs(a).max() + 1e-9) * 0.5
def brillo(sec=1.2, f0=2093.0):
    """destello metálico (plata, estrellas): parciales inarmónicos con decaimiento"""
    t = np.arange(int(sec * SR)) / SR
    y = sum(a * np.sin(2 * np.pi * f0 * r * t + r) * np.exp(-t * d) for a, r, d in [(1, 1, 4.5), (0.6, 2.76, 6), (0.4, 5.4, 9), (0.25, 8.93, 12)])
    y *= 1 - np.exp(-t / 0.002)
    y = (y / np.abs(y).max() * 0.5).astype(np.float32)
    d = int(0.011 * SR)
    return np.stack([y, np.concatenate([np.zeros(d, np.float32), y[:-d]])], 1)
SF["brillo"] = brillo(); SF["brillo_bajo"] = brillo(1.6, 1046.5)
from sfx_synth import swell
def put(a, t, gain=0.5):
    if a.ndim == 1: a = np.stack([a, a], axis=1)
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
def fx(name, t, gain=0.5, pan=0.0, dur=None, peak=None, rate=1.0, skip=0.0):
    """peak: alinea el pico del efecto (s dentro del archivo, después de skip) con t; rate: cambia la velocidad (y el tono);
    skip: descarta el comienzo del archivo"""
    a = SF[name][int(skip * SR):]
    if rate != 1.0:
        idx = np.arange(0, len(a) - 1, rate); a = np.stack([np.interp(idx, np.arange(len(a)), a[:, c]) for c in (0, 1)], 1).astype(np.float32)
    if dur:
        a = a[: int(dur * SR)].copy(); f = min(len(a), int(0.3 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    if peak is not None: t -= peak / rate
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41
    sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41
def bed(name, t, sec, gain=0.1, xf=0.6):
    """cama en loop (monte, viento de noche, drone) encadenada con fundidos"""
    src = SF[name]; L = len(src) / SR; left = sec; tt = t; first = True
    while left > 0.05:
        d = min(left, L); a = src[: int(d * SR)].copy(); n = len(a)
        fi, fo = (min(n, int(0.8 * SR)) if first else min(n, int(xf * SR))), min(n, int(xf * SR))
        a[:fi] *= np.linspace(0, 1, fi)[:, None]; a[-fo:] *= np.linspace(1, 0, fo)[:, None]
        put(a, tt, gain)
        if d >= left: break
        tt += d - xf; left -= d - xf; first = False

# S01 — el gancho: 1783, la mesa en el monte, la pólvora y la promesa
fx("resonancia", 0.25, 0.3)
bed("monte", 1.6, 18.5, 0.07); bed("viento_noche", 17.5, 30.0, 0.12)
fx("caballos", C("s01", "en el medio del monte") - 0.4, 0.13, -0.35)
fx("resonancia", C("s01", "una mesa de hierro") + 0.2, 0.26, 0.1)
fx("golpe", C("s01", "catorce toneladas") + 0.1, 0.2)
fx("meteoro_entrada", ins("s01", 0)[0] + 0.3, 0.34, -0.2, skip=2.05)               # la cámara sube al cielo: pasa un bólido
fx("crujido", C("s01", "la dio vuelta") + 0.1, 0.22)
a, _ = ins("s01", 1); fx("polvora", a + 0.08, 0.55, peak=0.2); fx("boom", a + 0.08, 0.2)
fx("caballos", C("s01", "Después se fue") - 0.2, 0.08, 0.55, dur=3.0)
fx("resonancia", C("s01", "nadie la volvió") + 0.2, 0.18)
fx("whoosh", C("s01", "En esta historia") + 0.3, 0.16)
fx("brillo", C("s01", "promesa de plata") + 0.6, 0.18, -0.3)                        # las cuatro cartas del montaje
fx("forja", C("s01", "unas pistolas") + 0.2, 0.16, -0.1, dur=0.9, peak=0.03)
fx("grua", C("s01", "una grúa") - 0.6, 0.18, 0.2, dur=2.0)
fx("impacto", C("s01", "dos de los meteoritos") + 0.25, 0.22, 0.3, dur=1.6, peak=0.37)
a, _ = ins("s01", 3); fx("resonancia", a - 0.4, 0.16)
fx("subida", HIT, 0.3, peak=3.31)
fx("meteoro_entrada", HIT - 0.12, 0.24, 0.4, skip=2.05)
fx("impacto", HIT, 0.5, peak=0.37); fx("resonancia", HIT + 0.25, 0.3)

# S02 — cuatro mil años atrás: la caída y la lluvia de hierro
fx("whoosh", ST["s02"] - 0.5, 0.18)
bed("drone", ST["s02"] - 0.3, 8.5, 0.07)
fx("meteoro_entrada", C("s02", "choca contra") - 0.05, 0.2, -0.3, skip=2.05)
fx("golpe", CE("s02", "cientos de toneladas.") + 0.05, 0.14)
fx("crujido", C("s02", "lo parte"), 0.28, 0.2); fx("explosion", C("s02", "lo parte") + 0.15, 0.16, -0.2, peak=0.54)
fx("lluvia_hierro", T_IMP, 0.22, peak=4.73)                                           # los primeros fragmentos y el golpe grande
fx("impacto", T_IMP, 0.72, peak=0.37); fx("boom", T_IMP, 0.32); fx("explosion", T_IMP + 0.1, 0.28, 0.25, peak=0.54)
bed("viento_noche", T_IMP + 1.5, 15.0, 0.08)
fx("whoosh", C("s02", "Deja una franja") - 0.2, 0.14)
for k in range(26): fx("pop", C("s02", "llena de cráteres") - 1.6 + k * 0.075, 0.035, ((k % 5) - 2) / 3)
fx("golpe", C("s02", "más de cien metros") + 0.6, 0.16)
fx("resonancia", C("s02", "había caído del cielo") + 0.5, 0.16)
fx("subida", C("s02", "Campo del Cielo"), 0.2, peak=3.31); fx("golpe", C("s02", "Campo del Cielo"), 0.18)

# S03 — 1576 y 1774: el capitán que no pudo volver y la promesa de plata
fx("mapa", ST["s03"] - 0.25, 0.4, peak=0.3); fx("pluma", C("s03", "Mil quinientos") - 0.1, 0.26)
fx("caballos", C("s03", "a buscar el metal") - 0.2, 0.14, -0.3)
fx("resonancia", C("s03", "un grandísimo pedazo") + 0.2, 0.2); fx("pluma", C("s03", "un grandísimo pedazo"), 0.2, 0.3)
bed("monte", C("s03", "Pero marca el camino") - 0.3, 4.4, 0.07)
fx("caballos", C("s03", "otra expedición") - 0.1, 0.08, 0.3, dur=3.0); fx("barco", C("s03", "manda muestras") + 0.2, 0.16, 0.3, dur=2.6)
fx("paginas", C("s03", "Y ahí llega") + 0.2, 0.16, dur=1.2)
fx("stamp", C("s03", "parte de plata") + 0.15, 0.36)
fx("brillo", C("s03", "¿Plata?") + 0.05, 0.26); fx("brillo", C("s03", "¿Plata?") + 0.25, 0.12, 0.4)
fx("drone", C("s03", "abajo podía haber") - 0.4, 0.12, dur=3.0)
fx("subida", C("s03", "una mina") + 0.4, 0.14, peak=3.31)
fx("stamp", C("s03", "el virrey") + 0.2, 0.36)

# S04 — 1783: Rubín de Celis, los setenta cinceles y la voladura
fx("golpe", ST["s04"] - 0.05, 0.2); fx("pluma", ST["s04"] + 0.1, 0.18, -0.3)
fx("caballos", C("s04", "El teniente de fragata") + 0.2, 0.1, 0.3)
bed("monte", C("s04", "los meleros") - 1.0, 6.5, 0.07)
fx("resonancia", C("s04", "una inmensa mesa") + 0.3, 0.2)
a, _ = ins("s04", 0); fx("subida", a, 0.22, peak=3.31)                               # la revelación, en el respiro después del nombre
fx("golpe", a + 0.02, 0.36); fx("resonancia", a + 0.1, 0.28)
fx("cincel", C("s04", "Para sacarle") - 0.25, 0.3, -0.2)                            # golpes y el cincel que se parte en «cinceles»
fx("cincel", C("s04", "y consigue") - 0.1, 0.12, 0.35, dur=1.0, rate=1.15)
fx("pop", C("s04", "doce kilos"), 0.16)
fx("brillo_bajo", C("s04", "pisadas de aves"), 0.07, -0.3); fx("brillo_bajo", C("s04", "manos humanas"), 0.07, 0.3)
fx("crujido", C("s04", "la da vuelta") + 0.1, 0.26)
fx("pluma", C("s04", "y anota") + 0.1, 0.32)
fx("polvora", T_BLAST, 0.66, peak=0.2); fx("explosion", T_BLAST, 0.36, peak=0.54); fx("boom", T_BLAST, 0.32)
fx("drone", C("s04", "Abajo no hay") - 0.2, 0.09, dur=3.0)
fx("pluma", C("s04", "Su conclusión"), 0.16); fx("explosion", C("s04", "algún volcán"), 0.07, 0.3, peak=0.54)
fx("golpe", C("s04", "Se equivocaba") + 0.15, 0.3)
fx("barco", C("s04", "Sus muestras viajan") - 0.2, 0.12, -0.3, dur=2.8); fx("whoosh", C("s04", "Londres") - 0.2, 0.12)
fx("paginas", C("s04", "Ernst Chladni") - 0.1, 0.16, dur=1.2)
fx("lluvia_hierro", C("s04", "que del cielo caen piedras") - 0.6, 0.12, 0.2, dur=4.6)
bed("viento_noche", C("s04", "se queda en el monte") - 1.2, 5.6, 0.1)
fx("resonancia", C("s04", "Es la última vez"), 0.2)

# S05 — 1803-1825: el otro bloque, la imagen, las pistolas y Londres
fx("whoosh", ST["s05"] - 0.25, 0.14); fx("golpe", C("s05", "estaba sola"), 0.2)
fx("caballos", C("s05", "buscándola") - 0.1, 0.1, -0.3, dur=3.0)
fx("resonancia", C("s05", "otro bloque") + 0.2, 0.2); fx("golpe", C("s05", "una tonelada"), 0.18)
fx("forja", C("s05", "manda hacer") + 0.2, 0.18, 0.2, dur=2.4, peak=0.03); fx("brillo", C("s05", "apóstol Santiago") + 0.3, 0.14)
a, s = ins("s05", 0); fx("drone", a - 0.3, 0.1, dur=2.0)
fx("whoosh", C("s05", "El bloque llega") + 0.2, 0.12); fx("pop", C("s05", "Buenos Aires") + 0.1, 0.14)
fx("forja", C("s05", "se forjan") + 0.05, 0.3, peak=0.03)
fx("paginas", C("s05", "Según las crónicas") - 0.1, 0.12, dur=1.0); fx("barco", C("s05", "viaja como regalo"), 0.12, 0.3, dur=2.4)
fx("pop", C("s05", "James Madison"), 0.14)
fx("pop", C("s05", "un museo de Virginia"), 0.12); fx("golpe", C("s05", "mil ochocientos dieciséis"), 0.16)
fx("resonancia", C("s05", "¿Están hechas"), 0.14); fx("brillo", C("s05", "de cielo?") + 0.1, 0.18)
fx("stamp", C("s05", "pudo comprobar") + 0.1, 0.36)
fx("barco", C("s05", "se lo regalaron") - 0.3, 0.1, -0.3, dur=2.4); fx("pop", C("s05", "un cónsul británico") + 0.2, 0.12)
fx("campanada", C("s05", "Hoy está en Londres") + 0.3, 0.16)

# S06 — el siglo XX devuelve gigantes; 21 de enero de 1990
fx("drone", ST["s06"] - 0.2, 0.1, dur=4.0); fx("golpe", C("s06", "gigantes"), 0.2)
fx("detector", C("s06", "con detectores"), 0.28, 0.2)
fx("pop", C("s06", "cinco metros"), 0.14)
fx("grua", C("s06", "la sacan") - 1.0, 0.24, 0.2, dur=2.6)
fx("golpe", C("s06", "El Chaco"), 0.22); fx("balanza", C("s06", "toneladas") + 0.1, 0.26, peak=2.58)
fx("latido", C("s06", "alguien la quiere") - 0.2, 0.2, dur=2.4)
fx("golpe", C("s06", "Veintiuno de enero"), 0.22); fx("tictac", C("s06", "Veintiuno de enero"), 0.08, dur=2.2)
fx("pop", C("s06", "Paraje La Tota") + 0.3, 0.14)
fx("sirena", C("s06", "frena"), 0.27, -0.2, peak=3.07)
fx("grua", C("s06", "una grúa") + 0.2, 0.14, 0.35, dur=3.0)
fx("golpe", T_CAMION, 0.3); fx("resonancia", T_CAMION + 0.1, 0.22)
for ph in ["un coleccionista", "un periodista", "un hombre de Buenos Aires"]: fx("pop", C("s06", ph), 0.13)
fx("grua", C("s06", "vuelve a su lugar") - 0.6, 0.12, 0.2, dur=2.2); fx("golpe", C("s06", "a su lugar") + 0.3, 0.16)
fx("stamp", C("s06", "queda procesado") + 0.2, 0.3); fx("stamp", C("s06", "en rebeldía") + 0.1, 0.26, 0.2)
fx("paginas", C("s06", "La causa quedó") + 0.2, 0.12, dur=1.4)

# S07 — la ley, la muestra de arte, la venta por internet y Gancedo
fx("paginas", ST["s07"] + 0.1, 0.14, dur=1.0); fx("stamp", C("s07", "por ley"), 0.3)
fx("whoosh", C("s07", "Pero las ganas"), 0.12)
fx("whoosh", C("s07", "llevarse El Chaco") - 0.1, 0.14); fx("pop", C("s07", "a Alemania") + 0.1, 0.14); fx("tictac", C("s07", "cien días"), 0.08, dur=1.4)
fx("stamp", C("s07", "lo aprobó"), 0.3)
fx("brillo", C("s07", "cosmovisión"), 0.09, -0.4); fx("brillo", C("s07", "cosmovisión") + 0.3, 0.07, 0.4)
fx("stamp", C("s07", "se canceló") - 0.1, 0.36)
fx("teclado", C("s07", "Hoy cualquiera"), 0.1, dur=1.6)
fx("compra", C("s07", "compra por internet"), 0.24, peak=1.27)
for k, pan in enumerate([-0.4, 0.4, -0.2, 0.3, 0.0]): fx("compra", CE("s07", "chaqueño:") - 0.1 + k * 0.2, 0.04, pan, peak=1.27)
fx("golpe", C("s07", "diez toneladas"), 0.2)
fx("drone", C("s07", "Y bajo la tierra") - 0.2, 0.1, dur=2.6)
fx("barro", C("s07", "cavando en el barro") - 0.4, 0.34, dur=4.2)
fx("golpe", T_GIG, 0.3); fx("resonancia", T_GIG + 0.2, 0.26)
fx("balanza", C("s07", "ochocientos kilos") + 0.4, 0.28, peak=2.58)
fx("pop", C("s07", "Gancedo") + 0.2, 0.14)
fx("balanza", C("s07", "misma balanza") + 0.5, 0.14, 0.2, peak=2.58, dur=3.0); fx("golpe", C("s07", "más grande que") + 0.2, 0.2)

# S08 — la búsqueda: mapas viejos, magnetómetros, detectores, la frontera y por qué es tan difícil
bed("viento_noche", ST["s08"] - 0.4, 15.0, 0.11); fx("resonancia", C("s08", "nada.") - 0.2, 0.12)
fx("caballos", C("s08", "La buscaron expediciones") + 0.2, 0.08, -0.3, dur=3.0); fx("mapa", C("s08", "los mapas viejos"), 0.3, peak=0.3)
fx("satelital", C("s08", "con magnetómetros"), 0.1, 0.3, dur=1.8)
fx("detector", C("s08", "con detectores") + 0.2, 0.22, -0.2)
fx("golpe", C("s08", "Y no aparece") + 0.3, 0.14)
fx("pluma", C("s08", "para marcar el límite") - 0.1, 0.2, dur=2.6)
fx("pop", C("s08", "un punto que nadie"), 0.16); fx("golpe", C("s08", "dónde estaba") + 0.2, 0.16)
fx("whoosh", CE("s08", "difícil?") + 0.1, 0.12)
bed("monte", C("s08", "las referencias del monte") - 0.4, 3.0, 0.07)
fx("whoosh", C("s08", "cambió de cauce") - 0.2, 0.12)
fx("tictac", C("s08", "medir la longitud") - 0.3, 0.12, dur=2.4)
bed("drone", C("s08", "Puede estar enterrada") - 0.3, 5.2, 0.08)
fx("polvora", C("s08", "la volaron") + 0.1, 0.07, peak=0.2); fx("resonancia", C("s08", "tierra y monte"), 0.2)

# S09 — cierre: de quién es
fx("resonancia", ST["s09"] + 0.3, 0.2); bed("viento_noche", ST["s09"] - 0.4, TOTAL - ST["s09"] + 0.4, 0.07)
fx("pop", C("s09", "una pregunta"), 0.16)
for ph in ["¿Del que lo encuentra", "del Estado", "o de los pueblos"]: fx("pop", C("s09", ph), 0.12)
fx("pop", C("s09", "Te leo"), 0.12)
fx("whoosh", END + 0.1, 0.16); fx("resonancia", END + 0.4, 0.14)

# ---------------- Suma y master (loudnorm lineal en dos pasadas) ----------------
act = env[: N] > 0.5
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print("voz (hablando) dB:", round(db(voice[act]), 1), "| música bajo voz dB:", round(db(music[act].mean(axis=1)), 1),
      "| música en pausas dB:", round(db(music[~act].mean(axis=1)), 1), "| sfx pico:", round(float(np.abs(sfx).max()), 2))
mix = music + sfx * 0.9
# control: tramos de 0,5 s con voz donde el fondo queda a menos de 9 dB de la voz (puede tapar la locución)
hop = SR // 2; bg = mix.mean(axis=1)
for i in range(0, int(TOTAL * SR) - hop, hop):
    if act[i:i + hop].mean() < 0.6: continue
    v, b = db(voice[i:i + hop]), db(bg[i:i + hop])
    if b > v - 9: print(f"  fondo alto {i / SR:7.1f}s  voz {v:5.1f}  fondo {b:5.1f}")
mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]
peak = np.abs(mix).max(); print("pico previo", round(float(peak), 3))
mix = mix / max(peak, 1e-9) * 0.89
raw = os.path.join(OUT, "pre14.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep14.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
print("momentos:", {k: round(v, 2) for k, v in dict(TITLE=TITLE, HIT=HIT, T_IMP=T_IMP, T_BLAST=T_BLAST, T_ALG=T_ALG, T_CAMION=T_CAMION, T_GIG=T_GIG).items()})
