"""Mezcla del episodio 3 (Argentina y el FMI): narración + 3 temas (explicación, historia, bronca) con ducking + efectos.
Salida: audio/mix/mezcla_ep03.wav (48 kHz estéreo, -14 LUFS)."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep03/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep03/words.json")))
ST, TOTAL = TL["starts"], TL["total"]
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
    a = load(os.path.join(PUB, f"ep03/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música ----------------
TRACKS = ["m1_groove", "m2_tango", "m3_bronca"]
M = {m: load(os.path.join(PUB, f"ep03/music/{m}.mp3")) for m in TRACKS}
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

t_title = C("s01", "volvemos?", 0, "e") + 0.3
card5 = ST["s05"] - 0.95
bronca = ST["s09"] - 0.35
place("m1_groove", 0.0, card5 + 0.25, 0.0, fin=0.4, fout=0.6)
place("m2_tango", card5 - 0.05, bronca - 0.5, 0.0, fin=0.15, fout=0.9)
place("m3_bronca", bronca, TOTAL, 0.0, fin=0.02, fout=3.5, gain=1.05)

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
dip(t_title, ST["s02"] - 0.2, 1.5, ramp=0.15)                         # el título respira
dip(C("s09", "Incluso") - 0.2, C("s09", "vio.", 0, "e") + 0.3, 0.7)   # el bebé: más íntimo
dip(C("s10", "Si te") - 0.2, TOTAL, 1.35, ramp=0.8)                   # pantalla final
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        a = load(os.path.join(PUB, d, f))
        SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
def fx(name, t, gain=0.5, pan=0.0):
    a = SF[name]; i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41
    sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41

# barridos y tarjetas de capítulo
for k in ["s02", "s03", "s04"]: fx("whoosh", ST[k] - 0.55, 0.4)
for k in ["s05", "s06", "s07", "s08"]: fx("whoosh", ST[k] - 1.2, 0.45); fx("boom", ST[k] - 0.8, 0.55)

# S01
fx("pop", ST["s01"] - 0.2, 0.45)
fx("billetes", C("s01", "pagó") + 0.1, 0.45); fx("cashregister", C("s01", "ochocientos"), 0.45)
fx("stamp", C("s01", "Internacional.") + 0.1, 0.6)
fx("whoosh", C("s01", "Esa misma") - 0.2, 0.3); fx("typewriter", C("s01", "revisaba") - 0.3, 0.3)
fx("pop", C("s01", "casi mil"), 0.5); fx("glitch", C("s01", "Sí,", 1), 0.3)
fx("billetes", C("s01", "Para pagarle") + 0.2, 0.4, -0.3); fx("billetes", C("s01", "pedimos") + 0.2, 0.4, 0.3)
ty, tt = C("s01", "Y no"), C("s01", "treinta.")
for i in range(10): fx("pop", ty + i * (tt - ty) / 10, 0.28, ((i % 5) - 2) * 0.3)
fx("boom", C("s01", "Van"), 0.5)
fx("riser", t_title - 2.0, 0.45); fx("boom", t_title, 0.9); fx("whoosh", t_title - 0.1, 0.35)
# S02
fx("pop", ST["s02"] - 0.15, 0.45); fx("cashregister", C("s02", "doscientos"), 0.4)
for i in range(4): fx("pop", C("s02", "Un país") + 0.3 + i * 0.2, 0.3, (i - 1.5) * 0.4)
fx("boom", C("s02", "mayor"), 0.55); fx("pop", C("s02", "planeta."), 0.35)
fx("whoosh", C("s02", "Los argentinos", 1) - 0.2, 0.3); fx("pop", C("s02", "ahorran"), 0.35)
fx("glitch", C("s02", "El Estado...", 1), 0.3); fx("pop", C("s02", "pide"), 0.45)
# S03
fx("pop", C("s03", "billetera"), 0.45); fx("billetes", C("s03", "reservas,"), 0.4)
fx("glitch", C("s03", "Pero"), 0.25); fx("stamp", C("s03", "trampa.") + 0.2, 0.6)
fx("pop", C("s03", "brutas"), 0.4); fx("pop", C("s03", "netas,"), 0.4); fx("whoosh", C("s03", "prestado.") + 0.1, 0.4)
fx("whoosh", C("s03", "según") - 0.2, 0.3); fx("boom", C("s03", "bajo"), 0.5); fx("glitch", C("s03", "siete"), 0.3)
fx("pop", C("s03", "La billetera", 2), 0.4); fx("stamp", C("s03", "ajena.") - 0.2, 0.55)
# S04
fx("pop", C("s04", "prestamista"), 0.4)
fx("telefono", C("s04", "prestamista") + 0.6, 0.4, -0.4); fx("telefono", C("s04", "atiende") - 0.6, 0.35, 0.4)
fx("pop", C("s04", "atiende"), 0.5, 0.5); fx("glitch", C("s04", "nadie"), 0.3, -0.5); fx("glitch", C("s04", "nadie") + 0.35, 0.3)
fx("boom", C("s04", "nueve"), 0.6)
for i in range(4): fx("stamp", C("s04", "nueve") + 0.1 + i * 0.3, 0.35, ((i % 3) - 1) * 0.5)
fx("whoosh", C("s04", "círculo") - 0.2, 0.3)
for p, n in [("desconfiamos", 0), ("compramos", 0), ("Banco", 0), ("llamamos", 0), ("El Fondo presta,", 0), ("ajuste", 1)]:
    fx("pop", C("s04", p, n) - 0.1, 0.42)
fx("cacerolazo", C("s04", "pide"), 0.25); fx("whoosh", C("s04", "Y la crisis"), 0.4)
# S05
fx("pop", C("s05", "Frondizi"), 0.4); fx("cashregister", C("s05", "setenta"), 0.4)
for i in range(5): fx("pop", C("s05", "Hoy,") + 0.2 + i * 0.2, 0.25)
for i in range(6): fx("stamp", C("s05", "Desde") + 0.1 + i * 0.27, 0.25, ((i % 3) - 1) * 0.5)
fx("pop", C("s05", "Néstor"), 0.4); fx("cashregister", C("s05", "casi diez"), 0.45); fx("billetes", C("s05", "sola"), 0.4)
fx("whoosh", C("s05", "chau") - 0.2, 0.35); fx("pop", C("s05", "chau"), 0.5)
fx("glitch", C("s05", "duró"), 0.3); fx("boom", C("s05", "doce"), 0.5)
# S06
fx("riser", C("s06", "dólar") - 0.2, 0.3); fx("knock", C("s06", "golpea") - 0.05, 0.8)
fx("pop", C("s06", "Christine"), 0.35); fx("stamp", C("s06", "más grande") + 0.4, 0.6)
fx("cashregister", C("s06", "cincuenta"), 0.45); fx("pop", C("s06", "Llegan"), 0.4)
fx("whoosh", C("s06", "Entró...") - 0.2, 0.35); fx("whoosh", C("s06", "se fue.") - 0.1, 0.4)
fx("typewriter", C("s06", "propio"), 0.3); fx("pop", C("s06", "no cumplió"), 0.4); fx("pop", C("s06", "fuga"), 0.4)
fx("billetes", C("s06", "La plata se") + 0.1, 0.4); fx("boom", C("s06", "La deuda") + 0.4, 0.7)
# S07
fx("pop", C("s07", "Alberto"), 0.35); fx("stamp", C("s07", "no podía") + 0.1, 0.6)
fx("pop", C("s07", "Un acuerdo"), 0.35); fx("whoosh", C("s07", "Es como") - 0.1, 0.3)
fx("whoosh", C("s07", "otra"), 0.35); fx("cashregister", C("s07", "otra") + 0.9, 0.4)
fx("pop", C("s07", "Javier"), 0.35); fx("cashregister", C("s07", "veinte"), 0.4)
for i in range(3): fx("pop", C("s07", "Tres gobiernos.") + i * 0.2, 0.35, (i - 1) * 0.5)
fx("boom", C("s07", "mismo"), 0.5)
# S08
fx("typewriter", C("s08", "controla"), 0.3); fx("pop", C("s08", "cumplió") + 0.2, 0.4)
fx("glitch", C("s08", "cumplió") + 0.7, 0.3); fx("glitch", C("s08", "meta"), 0.3)
fx("stamp", C("s08", "perdón.") - 0.1, 0.65); fx("whoosh", C("s08", "¿Y por qué") - 0.1, 0.3)
fx("cashregister", C("s08", "cincuenta"), 0.4); fx("pop", C("s08", "mayor"), 0.45)
fx("boom", C("s08", "Si a"), 0.35); fx("pop", C("s08", "también."), 0.4)
# S09 — la bronca
fx("boom", ST["s09"] - 0.35, 0.9); fx("glitch", C("s09", "bronca."), 0.4)
fx("stamp", C("s09", "archivó"), 0.7); fx("pop", C("s09", "decisión"), 0.35); fx("pop", C("s09", "delito."), 0.35)
fx("boom", C("s09", "nadie"), 0.55); fx("boom", C("s09", "deuda") + 0.4, 0.8)
ti, td = C("s09", "intereses,"), C("s09", "dólares.")
for i in range(int((td - ti) / 0.35)): fx("typewriter", ti + i * 0.35, 0.12)
fx("cashregister", td, 0.5)
for i in range(6): fx("pop", C("s09", "trescientos") + 0.4 + i * 0.12, 0.22, ((i % 3) - 1) * 0.6)
fx("whoosh", C("s09", "Incluso") - 0.2, 0.3); fx("pop", C("s09", "debe"), 0.5)
# S10
fx("pop", C("s10", "pocos."), 0.4); fx("cacerolazo", C("s10", "La cuenta") - 0.1, 0.35); fx("boom", C("s10", "todos."), 0.6)
fx("whoosh", C("s10", "¿Por qué") - 0.1, 0.3); fx("stamp", C("s10", "nunca") + 0.2, 0.6)
a0, a1 = C("s10", "acordate:") - 0.3, C("s10", "últimas") + 0.3
for i in range(0, 28, 2):
    fx("stamp", a0 + (a1 - a0) * (i / 27) ** 1.6, 0.22 + 0.01 * i, ((i % 5) - 2) * 0.3)
fx("boom", C("s10", "treinta"), 0.6)
fx("whoosh", C("s10", "Si te") - 0.2, 0.3); fx("pop", C("s10", "Suscribite") + 0.3, 0.6); fx("pop", C("s10", "¿alguna"), 0.35)

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
raw = os.path.join(OUT, "pre3.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep03.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
