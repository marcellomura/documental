"""Mezcla del episodio 4 (Súper Niño): narración + música con ducking + efectos (librería + lluvia/viento/trueno sintetizados).
Salida: audio/mix/mezcla_ep04.wav (48 kHz estéreo, -14 LUFS)."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep04/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep04/words.json")))
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
    a = load(os.path.join(PUB, f"ep04/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música ----------------
M = {"oceano": load(os.path.join(PUB, "ep04/music/m1_oceano.mp3")), "tension": load(os.path.join(PUB, "ep03/music/m3_bronca.mp3"))}
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

c5, c7 = ST["s05"] - 0.6, ST["s07"]
t_title = C("s01", "Súper") - 0.05
place("oceano", 0.0, c5 + 0.3, 0.0, fin=0.8, fout=0.7)
place("tension", c5 - 0.05, c7 + 1.0, 0.0, fin=0.1, fout=1.6, gain=0.9)
place("oceano", c7 - 0.4, TOTAL, 14.0, fin=1.4, fout=3.5)

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

# ---------------- Efectos: librería ----------------
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        a = load(os.path.join(PUB, d, f))
        SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
rng = np.random.default_rng(4)

# ---------------- Efectos: síntesis (lluvia, viento, trueno, fuego, agua) ----------------
from numpy.fft import rfft, irfft
def shaped_noise(sec, lo, hi, tilt=0.0):
    n = int(sec * SR); X = rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    band = ((f >= lo) & (f <= hi)).astype(float) * (np.maximum(f, 20) / 1000.0) ** tilt
    y = irfft(X * band, n); return (y / (np.abs(y).max() + 1e-9)).astype(np.float32)
def fade(y, fi=0.3, fo=0.5):
    n = len(y); e = np.ones(n, np.float32); a, b = int(fi * SR), int(fo * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] *= np.linspace(1, 0, b)
    return y * e
def stereo(y, width=0.0):
    if width <= 0: return np.stack([y, y], 1)
    d = int(0.012 * SR); z = np.concatenate([np.zeros(d, np.float32), y[:-d]])
    return np.stack([y, (1 - width) * y + width * z], 1)
def rain(sec):
    y = shaped_noise(sec, 900, 12000, -0.3) * 0.55
    drops = np.zeros(int(sec * SR), np.float32)
    for _ in range(int(sec * 70)):
        i = rng.integers(0, len(drops) - 400); dd = rng.standard_normal(300).astype(np.float32) * np.exp(-np.arange(300) / 40)
        drops[i:i + 300] += dd * rng.uniform(0.2, 0.8)
    return stereo(fade(y + drops * 0.5, 0.4, 0.8), 0.8)
def wind(sec, k0=1.0, k1=1.0):
    n = int(sec * SR); y = shaped_noise(sec, 150, 2200, -0.6)
    t = np.arange(n) / SR; lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t + 1.3) * np.sin(2 * np.pi * 0.13 * t)
    amp = np.linspace(k0, k1, n); return stereo(fade(y * lfo * amp, 0.6, 0.8), 0.9)
def thunder(sec=4.0):
    n = int(sec * SR); y = shaped_noise(sec, 25, 380, -1.0); t = np.arange(n) / SR
    env = np.exp(-t / 1.4) * (1 - np.exp(-t / 0.03)); crack = shaped_noise(sec, 800, 6000) * np.exp(-t / 0.12) * 0.35
    return stereo((y * env * 1.1 + crack).astype(np.float32), 0.6)
def fire(sec):
    n = int(sec * SR); y = shaped_noise(sec, 200, 1500, -0.8) * 0.35
    for _ in range(int(sec * 45)):
        i = rng.integers(0, n - 200); y[i:i + 120] += rng.standard_normal(120).astype(np.float32) * np.exp(-np.arange(120) / 12) * rng.uniform(0.3, 1)
    return stereo(fade(y, 0.3, 0.6), 0.7)
def swell(sec=2.5):
    y = shaped_noise(sec, 60, 900, -1.2); t = np.arange(len(y)) / SR
    return stereo(y * np.sin(np.pi * t / sec) ** 2, 0.8)
def powerdown(sec=1.4):
    t = np.arange(int(sec * SR)) / SR; f = 220 * np.exp(-t * 1.6)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.2) * 0.6 + shaped_noise(sec, 100, 800) * 0.1 * np.exp(-t * 2)
    return stereo(y.astype(np.float32))
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

# transiciones (olas e iris)
for k, pre in [("s02", 0.3), ("s03", 0.3), ("s05", 0.6), ("s08", 0.45), ("s09", 0.6)]:
    put(swell(1.6), ST[k] - pre - 0.8, 0.5); fx("whoosh", ST[k] - pre - 0.3, 0.35)
for k, pre in [("s06", 0.5), ("s10", 0.5)]:
    fx("whoosh", ST[k] - pre - 0.35, 0.4); fx("boom", ST[k] - pre, 0.45)

# S01
put(swell(3.0), -0.3, 0.45)
fx("pop", C("s01", "cuatro") - 0.3, 0.4); fx("typewriter", C("s01", "cuatro"), 0.15)
fx("whoosh", C("s01", "En el medio") - 0.1, 0.35); fx("pop", C("s01", "tres grados") - 0.2, 0.4)
fx("whoosh", C("s01", "En más") - 0.3, 0.35)
b0, b1 = C("s01", "En más") + 0.5, C("s01", "tan caliente") - 0.2
for i in range(0, 44, 3): fx("pop", b0 + (b1 - b0 - 0.5) * i / 44, 0.12, ((i % 5) - 2) * 0.3)
fx("boom", C("s01", "tan caliente") - 0.05, 0.7)
fx("whoosh", C("s01", "Y lo que") - 0.3, 0.4)
put(rain(2.6), C("s01", "llueve") - 0.4, 0.3); fx("pop", C("s01", "tu ciudad") - 0.2, 0.45)
fx("riser", t_title - 2.0, 0.5); fx("boom", t_title, 0.95); put(thunder(4.0), t_title + 0.05, 0.55)
# S02
fx("pop", C("s02", "Navidad,") - 0.3, 0.45); put(swell(2.4), C("s02", "llegaba") - 0.3, 0.4)
fx("whoosh", C("s02", "desaparecían.") - 0.2, 0.35)
fx("typewriter", C("s02", "«la corriente") - 0.1, 0.25); fx("stamp", C("s02", "corriente:", 1) + 0.1, 0.6)
fx("whoosh", C("s02", "cambio") - 0.5, 0.4); fx("pop", C("s02", "humor"), 0.35)
# S03
put(wind(5.5, 0.6, 1.0), C("s03", "vientos") - 0.3, 0.32); put(wind(16, 1.0, 0.7), C("s03", "vientos") + 4.9, 0.18)
fx("pop", C("s03", "ventilador") - 0.3, 0.4); fx("whoosh", C("s03", "Empujan") - 0.1, 0.3)
fx("pop", C("s03", "allá"), 0.4); put(swell(2.2), C("s03", "sube") - 0.5, 0.35)
for p, n in [("Agua fría,", 1), ("nutrientes,", 0), ("peces.", 0)]: fx("pop", C("s03", p, n), 0.4)
fx("pop", C("s03", "equilibrio.") - 0.3, 0.35)
# S04
put(wind(3.5, 0.8, 0.0), ST["s04"] - 0.2, 0.3)
put(powerdown(1.6), C("s04", "apaga.") - 0.2, 0.35); fx("glitch", C("s04", "apaga."), 0.2)
put(swell(3.0), C("s04", "vuelve") - 0.8, 0.45); fx("whoosh", C("s04", "vuelve") - 0.2, 0.3)
fx("whoosh", C("s04", "En Perú") - 0.7, 0.4)
put(rain(2.4), C("s04", "En Perú") + 0.1, 0.3); put(fire(3.0), C("s04", "incendios.") - 0.5, 0.35)
put(rain(3.2), C("s04", "nuestro") - 0.6, 0.35); put(thunder(3.0), C("s04", "mapa.") - 0.1, 0.35)
# S05
fx("pop", C("s05", "grado y medio") - 0.1, 0.4); fx("pop", C("s05", "súper,") - 0.1, 0.45)
fx("riser", C("s05", "setenta") - 0.6, 0.3)
for p in ["mil novecientos", "noventa", "dos mil quince."]: fx("boom", C("s05", p) - 0.1, 0.4)
fx("pop", C("s05", "tres:") - 0.1, 0.45); fx("whoosh", C("s05", "Este año,") - 0.5, 0.35)
fx("boom", C("s05", "tres grados,"), 0.55); fx("pop", C("s05", "todavía"), 0.35)
fx("whoosh", C("s05", "Según") - 0.4, 0.35); fx("pop", C("s05", "argentina,") - 0.2, 0.4)
q0, q1 = C("s05", "podría"), C("s05", "observado.")
for i in range(int((q1 - q0) / 0.16)): fx("typewriter", q0 + i * 0.16, 0.1)
# S06
put(thunder(4.5), C("s06", "mil novecientos") - 0.1, 0.8); fx("boom", C("s06", "mil novecientos") - 0.1, 0.6)
put(swell(3.0), C("s06", "Litoral") - 0.3, 0.5); put(rain(5.0), C("s06", "inundó:") - 0.4, 0.22)
fx("pop", C("s06", "ciento") - 0.2, 0.4); fx("pop", C("s06", "diecisiete") - 0.2, 0.4); fx("pop", C("s06", "cuatro millones") - 0.2, 0.4)
fx("boom", C("s06", "dos mil quince,") - 0.1, 0.55); fx("whoosh", C("s06", "dos mil quince,") - 0.4, 0.3)
put(swell(2.2), C("s06", "tapó") - 0.2, 0.5)
v0 = C("s06", "Veinte mil personas") + 0.1
for i in range(20): fx("pop", v0 + i * 0.05, 0.1, ((i % 7) - 3) * 0.25)
# S07
fx("whoosh", ST["s07"] - 0.1, 0.35); fx("pop", C("s07", "pronósticos") - 0.2, 0.3)
put(rain(7.0), C("s07", "Misiones,") - 0.5, 0.25)
for p in ["Misiones,", "Corrientes,", "Chaco,", "Formosa,", "Santa Fe", "Entre Ríos."]: fx("pop", C("s07", p) - 0.15, 0.38)
fx("whoosh", C("s07", "Paraná") - 0.3, 0.3); fx("pop", C("s07", "vigilancia."), 0.35)
fx("pop", C("s07", "noroeste") - 0.1, 0.35); fx("pop", C("s07", "extremo") - 0.1, 0.35)
# S08
fx("pop", C("s08", "veintitrés,") - 0.2, 0.4); fx("pop", C("s08", "el agua") - 0.2, 0.4)
fx("whoosh", C("s08", "Cuyo,") - 0.6, 0.45); put(wind(4.5, 0.5, 0.5), C("s08", "Cuyo,") - 0.3, 0.2)
fx("whoosh", C("s08", "Pero") - 0.5, 0.45)
fx("pop", C("s08", "más lluvia") - 0.2, 0.35); fx("pop", C("s08", "más calor") - 0.2, 0.35); fx("boom", C("s08", "mosquitos.") - 0.3, 0.5)
fx("glitch", C("s08", "dengue.") - 0.6, 0.3); fx("boom", C("s08", "dengue.") - 0.6, 0.45)
# S09
fx("riser", ST["s09"] - 0.3, 0.4); fx("whoosh", C("s09", "temperatura") - 0.4, 0.35)
fx("stamp", C("s09", "récord:") - 0.1, 0.55); fx("boom", C("s09", "décimo.") - 0.1, 0.5)
fx("pop", C("s09", "Súper Niño") - 0.3, 0.4); fx("boom", C("s09", "nuevos") - 0.2, 0.6)
# S10
fx("pop", C("s10", "techo,"), 0.45); put(rain(1.6), C("s10", "techo,"), 0.25)
fx("pop", C("s10", "cosecha"), 0.45); fx("pop", C("s10", "factura"), 0.45)
fx("boom", C("s10", "El Súper Niño") - 0.2, 0.6); fx("whoosh", C("s10", "La pregunta") - 0.3, 0.3)
fx("whoosh", C("s10", "Si te") - 0.5, 0.35); fx("pop", C("s10", "Si te") - 0.1, 0.6)
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
raw = os.path.join(OUT, "pre4.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep04.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
