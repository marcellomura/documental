"""Mezcla del episodio 5 (Tu reloj está mal): narración + música con ducking + efectos (librería, ElevenLabs y tic-tac sintetizado).
Salida: audio/mix/mezcla_ep05.wav (48 kHz estéreo, -14 LUFS)."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep05/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep05/words.json")))
ST, TOTAL = TL["starts"], TL["total"]
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

def cue(seg, phrase, n=0, which="s"):
    ws = W[seg]; tg = [norm(x) for x in phrase.split()]; found = -1
    for i in range(len(ws) - len(tg) + 1):
        if all(norm(ws[i + k]["w"]) == t for k, t in enumerate(tg)):
            found += 1
            if found == n:
                return ST[seg] + (ws[i]["s"] if which == "s" else ws[i + len(tg) - 1]["e"])
    raise KeyError(f"{seg} {phrase} #{n}")
C = cue

N = int((TOTAL + 1) * SR)
voice = np.zeros(N, np.float32)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)

# ---------------- Narración ----------------
for k in sorted(ST):
    a = load(os.path.join(PUB, f"ep05/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música ----------------
M = {k: load(os.path.join(PUB, f"ep05/music/{f}.mp3")) for k, f in [("tictac", "m1_tictac"), ("archivo", "m2_archivo"), ("luz", "m3_luz")]}
TARGET_RMS = 10 ** (-16 / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
def place(name, g0, g1, off, fin=0.05, fout=0.35, gain=1.0):
    src = M[name]; i0, i1 = int(g0 * SR), int(g1 * SR); o = int(off * SR)
    seg = src[o:o + (i1 - i0)].copy(); n = len(seg)
    seg *= TARGET_RMS / rms(seg[: min(n, 30 * SR)])
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain

c5, c7 = ST["s05"] - 0.5, ST["s07"] - 0.4
t_title = C("s01", "Tu reloj está") - 0.15
place("tictac", 0.0, c5 + 0.4, 0.0, fin=0.6, fout=0.9)
place("archivo", c5 - 0.1, c7 + 0.6, 0.0, fin=0.3, fout=1.2, gain=0.95)
luz_len = len(M["luz"]) / SR
place("luz", c7 - 0.2, TOTAL, max(0.0, luz_len - (TOTAL - (c7 - 0.2)) - 0.3), fin=1.2, fout=2.5)

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
LOW, HIGH = 0.21, 0.60
g = HIGH - (HIGH - LOW) * env
def dip(a, b, level, ramp=0.4):
    global g
    i0, i1, r = int(a * SR), int(b * SR), int(ramp * SR)
    d = np.ones(N); d[i0:i1] = level
    d[max(0, i0 - r):i0] = np.linspace(1, level, i0 - max(0, i0 - r)); d[i1:i1 + r] = np.linspace(level, 1, len(d[i1:i1 + r]))
    g = g * d
dip(ST["s01"] + D["s01"] + 0.1, ST["s02"] - 0.4, 1.5, ramp=0.2)      # el título respira
dip(C("s10", "Si te") - 0.2, TOTAL, 1.35, ramp=0.8)                   # pantalla final
music *= g[:, None].astype(np.float32)
# ---------------- Efectos ----------------
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx", "ep05/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        a = load(os.path.join(PUB, d, f))
        SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
SF["whoosh_rev"] = SF["whoosh"][::-1].copy()

from sfx_synth import swell, powerdown, wind, ticks, flick, flyby
def put(a, t, gain=0.5):
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
def fx(name, t, gain=0.5, pan=0.0):
    a = SF[name]; i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41
    sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41
def tk(t0, t1, rate=1.0, gain=0.15, accel=1.0):
    if t1 > t0: put(ticks(t1 - t0, rate, accel), t0, gain)

# transiciones: la aguja barre la pantalla (tic-tac que acelera + whoosh); iris = whoosh + golpe
for k, pre in [("s02", 0.3), ("s03", 0.4), ("s05", 0.5), ("s06", 0.5), ("s08", 0.5), ("s09", 0.5)]:
    a = ST[k] - pre
    tk(a - 0.55, a + 0.5, 6, 0.16, 2.5); fx("whoosh", a - 0.3, 0.35)
for k, pre in [("s07", 0.4), ("s10", 0.5)]:
    fx("whoosh", ST[k] - pre - 0.35, 0.4); fx("boom", ST[k] - pre, 0.4)

# S01 — gancho
fx("despertador", 0.05, 0.2)
tk(0.3, C("s01", "El sol") - 0.1, 1.0, 0.16)
tk(C("s01", "El sol"), C("s01", "hora.") + 0.4, 9, 0.1)
fx("whoosh", C("s01", "Miles") - 0.4, 0.3)
fx("whoosh", C("s01", "En Ushuaia") - 0.4, 0.35); tk(C("s01", "En Ushuaia") - 0.2, C("s01", "diez.") + 0.2, 12, 0.1)
fx("gallo", C("s01", "amanece") + 0.1, 0.16)
fx("whoosh", C("s01", "Y no,") - 0.3, 0.3); fx("pop", C("s01", "culpa del") + 0.2, 0.3)
fx("boom", C("s01", "Es culpa", 1) - 0.1, 0.5); fx("glitch", C("s01", "reloj.") - 0.1, 0.3); fx("stamp", C("s01", "reloj.") - 0.05, 0.3)
fx("whoosh", C("s01", "Porque") - 0.35, 0.35); fx("pop", C("s01", "zona"), 0.35); fx("pop", C("s01", "sola") , 0.3)
fx("riser", t_title - 2.0, 0.45); fx("boom", t_title, 0.9); fx("campanada", t_title + 0.02, 0.6); fx("glitch", t_title, 0.18)
# S02
fx("scratch", ST["s02"] - 0.12, 0.45); fx("stamp", ST["s02"] - 0.02, 0.35)
put(swell(2.6), C("s02", "Durante") - 0.5, 0.35); fx("pop", C("s02", "mediodía") , 0.35)
for i in range(8): fx("pop", C("s02", "cada") - 0.3 + i * 0.12, 0.2, (i % 3 - 1) * 0.4)
fx("whoosh", C("s02", "Cuando en") - 0.3, 0.3); fx("pop", C("s02", "Mendoza"), 0.35); fx("pop", C("s02", "once"), 0.4)
fx("tren", C("s02", "Y con") - 0.4, 0.4); fx("stamp", C("s02", "caos.") - 0.1, 0.6)
tk(C("s02", "trenes,"), C("s02", "caos.") + 0.3, 7, 0.08)
# S03
fx("boom", C("s03", "mil ochocientos") - 0.1, 0.5); fx("typewriter", C("s03", "unificó"), 0.2); fx("pop", C("s03", "Observatorio") - 0.4, 0.35)
fx("whoosh", C("s03", "mil novecientos") - 0.3, 0.35); fx("boom", C("s03", "mil novecientos") - 0.05, 0.35)
for i in range(24): fx("pop", C("s03", "veinticuatro") - 0.6 + i * 0.05, 0.07, (i / 12 - 1))
fx("pop", C("s03", "quince") - 0.2, 0.45); fx("whoosh", C("s03", "Según") - 0.4, 0.3)
fx("pop", C("s03", "menos cuatro") - 0.3, 0.4); fx("pop", C("s03", "cinco.") - 0.3, 0.4)
# S04
fx("boom", C("s04", "Menos") - 0.2, 0.6); fx("glitch", C("s04", "Menos"), 0.2)
fx("pop", C("s04", "Brasilia,") - 0.2, 0.4); fx("whoosh", C("s04", "diez") - 0.2, 0.3)
fx("pop", C("s04", "vivimos") - 0.2, 0.45); fx("pop", C("s04", "cordillera,") - 0.2, 0.45)
fx("whoosh", C("s04", "En Buenos") - 0.5, 0.4)
for p in ["En Buenos", "En Mendoza,", "El Calafate,"]: fx("riser", C("s04", p) - 0.4, 0.12); fx("pop", C("s04", p) + 0.3, 0.35)
fx("pop", C("s04", "febrero...") , 0.35)
# S05
tk(ST["s05"] - 0.4, C("s05", "mil novecientos") - 0.3, 14, 0.12); fx("whoosh_rev", ST["s05"] - 0.2, 0.35)
fx("boom", C("s05", "mil novecientos") - 0.2, 0.45); fx("pop", C("s05", "adelantar"), 0.4)
fx("boom", C("s05", "mil novecientos", 1) - 0.4, 0.35); put(wind(3.5, 0.6, 0.9), C("s05", "mil novecientos", 1) - 0.3, 0.2)
fx("stamp", C("s05", "no lo"), 0.6)
fx("whoosh", C("s05", "mil novecientos", 2) - 0.3, 0.4); fx("typewriter", C("s05", "decreto") + 0.3, 0.2)
fx("boom", C("s05", "menos") - 0.2, 0.5); fx("pop", C("s05", "energía.") - 0.6, 0.4)
# S06
for r, pan in [(3.1, -0.6), (4.4, 0.5), (5.9, 0.0)]:
    a = ticks(C("s06", "setenta") - ST["s06"] + 0.2, r, 1.5); l, rr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    put(a * np.array([l, rr], np.float32) * 1.41, ST["s06"] - 0.3, 0.08)
fx("boom", C("s06", "caos.") - 0.1, 0.7); fx("glitch", C("s06", "caos.") - 0.1, 0.25)
fx("boom", C("s06", "setenta") - 0.2, 0.45)
for i in range(3): fx("pop", C("s06", "petróleo,") - 0.5 + i * 0.12, 0.3, i - 1)
fx("riser", C("s06", "adelantamos") - 0.9, 0.25); fx("pop", C("s06", "adelantamos") + 0.1, 0.45)
fx("boom", C("s06", "dos mil ocho") - 0.3, 0.45); put(swell(2.0), C("s06", "media") - 0.3, 0.4); fx("pop", C("s06", "otra mitad"), 0.35)
fx("motor", C("s06", "viajabas") - 0.1, 0.25); fx("glitch", C("s06", "atrasar") - 0.05, 0.25); fx("pop", C("s06", "atrasar"), 0.45)
fx("boom", C("s06", "dos mil nueve") - 0.3, 0.45); put(powerdown(1.4), C("s06", "San Luis") + 0.1, 0.4)
fx("pop", C("s06", "propia") - 0.2, 0.45); fx("pop", C("s06", "una hora menos") - 0.2, 0.4)
# S07
fx("pop", ST["s07"] - 0.05, 0.4); fx("whoosh", C("s07", "Importa,", 1) - 0.2, 0.3)
fx("stamp", C("s07", "no lee") + 0.3, 0.35); put(swell(2.2), C("s07", "lee la luz") - 0.5, 0.45)
tk(C("s07", "Tenés"), C("s07", "Si") - 0.3, 1.0, 0.14); fx("pop", C("s07", "pone en hora") + 0.2, 0.4)
fx("whoosh", C("s07", "Si") - 0.3, 0.3); fx("glitch", C("s07", "adelantada,") + 0.2, 0.2); tk(C("s07", "adelantada,"), C("s07", "adelantada,") + 1.1, 8, 0.1)
fx("boom", C("s07", "jet lag permanente") - 0.1, 0.55)
put(flyby(3.2), C("s07", "sin haberte") - 0.5, 0.55); fx("pop", C("s07", "avión.") - 0.1, 0.4)
fx("boom", C("s07", "jet lag social") - 0.1, 0.7); fx("glitch", C("s07", "jet lag social"), 0.25)
fx("whoosh", C("s07", "estudio") - 0.4, 0.35); fx("pop", C("s07", "CONICET") - 0.2, 0.4)
for i in range(26): fx("pop", C("s07", "setecientos") - 0.2 + i * 0.047, 0.05, (i % 5 - 2) * 0.3)
for i in range(3): fx("pop", C("s07", "mañana") - 0.3 + i * 0.12, 0.3)
fx("pop", C("s07", "nocturnos") - 0.2, 0.4); fx("boom", C("s07", "rinden") - 0.2, 0.5); fx("pop", C("s07", "matemática.") - 0.3, 0.35)
# S08
fx("whoosh", ST["s08"] - 0.2, 0.3); fx("pop", C("s08", "fans."), 0.45)
put(swell(2.2), C("s08", "Más luz") - 0.5, 0.35)
for p in ["salir,", "comprar,", "turismo."]: fx("pop", C("s08", p) - 0.25, 0.45)
put(swell(2.6), C("s08", "En verano,") - 0.6, 0.4); put(wind(4.0, 0.5, 0.4), C("s08", "En verano,") - 0.2, 0.14)
tk(C("s08", "Ushuaia"), C("s08", "diez") + 0.2, 6, 0.09); fx("pop", C("s08", "diez") , 0.4)
fx("whoosh", C("s08", "Y hay") - 0.35, 0.3); fx("pop", C("s08", "cenamos"), 0.4)
fx("whoosh", C("s08", "Igual") - 0.4, 0.35); fx("pop", C("s08", "España,") - 0.2, 0.4)
fx("boom", C("s08", "mil novecientos cuarenta") - 0.1, 0.45); fx("whoosh", C("s08", "Alemania.") - 0.3, 0.3); fx("pop", C("s08", "Alemania."), 0.4)
# S09
fx("pop", C("s09", "Diputados") - 0.1, 0.35)
for i in range(3): fx("typewriter", C("s09", "aprobó") + i * 0.15, 0.14)
for i in range(5): fx("pop", C("s09", "menos cuatro") - 0.2 + i * 0.08, 0.2)
for i in range(7): fx("pop", C("s09", "menos tres") - 0.2 + i * 0.05, 0.15)
r0, r1 = C("s09", "Los relojes"), C("s09", "primero") + 0.3
for i in range(8): put(flick(), r0 + (r1 - r0) * (i + 0.5) / 8, 0.5)
tk(C("s09", "atrasar"), C("s09", "veintiséis.") + 0.2, 10, 0.1)
fx("stamp", C("s09", "No pasó:") - 0.05, 0.7); fx("boom", C("s09", "No pasó:") - 0.05, 0.4)
fx("whoosh", C("s09", "Senado") - 0.4, 0.25)
fx("whoosh", C("s09", "científicos") - 0.4, 0.35); fx("pop", C("s09", "Diego Golombek,") - 0.1, 0.35)
fx("pop", C("s09", "dos veces") - 0.2, 0.35); fx("pop", C("s09", "dos veces") + 0.15, 0.35); fx("boom", C("s09", "costo.") - 0.1, 0.5)
# S10
fx("despertador", ST["s10"] - 0.1, 0.4)
fx("glitch", C("s10", "fiaca:") + 0.3, 0.2); fx("boom", C("s10", "geografía.") - 0.2, 0.55); fx("campanada", C("s10", "geografía.") - 0.15, 0.35)
fx("riser", C("s10", "Vivimos") - 0.6, 0.3); fx("pop", C("s10", "cordillera,") - 0.2, 0.35); fx("pop", C("s10", "dos.") - 0.1, 0.45)
fx("whoosh", C("s10", "La pregunta") - 0.3, 0.4); fx("gallo", C("s10", "luz a la mañana") + 0.1, 0.13); fx("pop", C("s10", "luz a la tarde") - 0.3, 0.45)
fx("pop", C("s10", "Dejalo") - 0.2, 0.5)
fx("whoosh", C("s10", "Si te") - 0.5, 0.35); fx("pop", C("s10", "Si te") - 0.1, 0.55)
fx("pop", C("s10", "suscribite") - 0.2, 0.55); fx("pop", C("s10", "compartilo") - 0.2, 0.3)
fx("whoosh", C("s10", "Nos vemos") - 1.6, 0.35)

# ---------------- Balance ----------------
act = env[: len(voice)] > 0.6
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print("voz (hablando) dB:", round(db(voice[act]), 1), "| música bajo voz dB:", round(db(music[act].mean(axis=1)), 1),
      "| música en pausas dB:", round(db(music[~act].mean(axis=1)), 1), "| sfx pico:", round(float(np.abs(sfx).max()), 2))

# ---------------- Suma y master ----------------
mix = music + sfx * 0.9
mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]
peak = np.abs(mix).max(); print("pico previo", round(float(peak), 3))
mix = mix / max(peak, 1e-9) * 0.89
raw = os.path.join(OUT, "pre5.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep05.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
