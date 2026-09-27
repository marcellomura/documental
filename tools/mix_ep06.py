"""Mezcla del episodio 6 (La paradoja de la carne): narración + dos temas con ducking + efectos
(ElevenLabs, librería del canal y sintetizados). Salida: audio/mix/mezcla_ep06.wav (48 kHz estéreo, -14 LUFS)."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep06/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep06/words.json")))
ST, TOTAL, D = TL["starts"], TL["total"], TL["durations"]
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
    a = load(os.path.join(PUB, f"ep06/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música ----------------
M = {"cadena": load(os.path.join(PUB, "ep06/music/m1_cadena.mp3")), "bronca": load(os.path.join(PUB, "ep06/music/m2_bronca.mp3"))}
TARGET_RMS = 10 ** (-16 / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
REF = {k: rms(v[int(15 * SR): int(75 * SR)]) for k, v in M.items()}
def place(name, g0, g1, off, fin=0.05, fout=0.35, gain=1.0):
    src = M[name]; i0, i1 = int(g0 * SR), int(g1 * SR); o = int(off * SR)
    seg = src[o:o + (i1 - i0)].copy(); n = len(seg)
    seg *= TARGET_RMS / REF[name]
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain

TITLE = ST["s01"] + D["s01"] + 0.1           # corte al título
m1_len = len(M["cadena"]) / SR
cut6 = ST["s06"] - 0.3
place("cadena", 0.0, TITLE + 0.05, 0.0, fin=0.8, fout=0.25)
restart = ST["s02"] - 0.5
place("cadena", restart, cut6 + 0.4, m1_len - (cut6 + 0.4 - restart), fin=0.5, fout=1.0)
m2_len = len(M["bronca"]) / SR
place("bronca", cut6 - 0.2, TOTAL, m2_len - (TOTAL - (cut6 - 0.2)), fin=0.4, fout=1.5)

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
LOW, HIGH = 0.2, 0.58
g = HIGH - (HIGH - LOW) * env
def dip(a, b, level, ramp=0.4):
    global g
    i0, i1, r = int(a * SR), int(b * SR), int(ramp * SR)
    d = np.ones(N); d[i0:i1] = level
    d[max(0, i0 - r):i0] = np.linspace(1, level, i0 - max(0, i0 - r)); d[i1:i1 + r] = np.linspace(level, 1, len(d[i1:i1 + r]))
    g = g * d
dip(C("s10", "Si te") - 0.2, TOTAL, 1.35, ramp=0.8)                   # pantalla final
dip(C("s10", "de cada cien", 1) - 0.3, C("s10", "Contanos") - 0.2, 1.25, ramp=0.3)   # remate
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx", "ep05/sfx", "ep06/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        a = load(os.path.join(PUB, d, f))
        SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
SF["whoosh_rev"] = SF["whoosh"][::-1].copy()

from sfx_synth import swell, wind, fire, flyby
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
def grill(t0, t1, gain=0.22):
    """fuego sintetizado + chisporroteos sueltos"""
    if t1 <= t0: return
    put(fire(t1 - t0), t0, gain)
    k = 0
    tt = t0 + 0.2
    while tt < t1 - 0.5:
        fx("chisporroteo", tt, gain * 0.9, ((k * 37) % 7 - 3) / 4)
        tt += 0.55 + ((k * 13) % 5) * 0.17; k += 1
def pops(t0, n, step, gain=0.12, spread=True):
    for i in range(n): fx("pop", t0 + i * step, gain, ((i % 5) - 2) * 0.3 if spread else 0.0)

# transiciones de cuchilla (en el centro de cada corte)
CUTS = [ST["s02"] - 0.3, ST["s03"] - 0.3, ST["s04"] - 0.2, ST["s05"] - 0.2, ST["s06"] - 0.3, ST["s07"] - 0.5, ST["s08"] - 0.4, ST["s09"] - 0.4, ST["s10"] - 0.4]
for a in CUTS:
    fx("whoosh", a - 0.3, 0.32); fx("cuchilla", a - 0.02, 0.16)

# S01 — gancho
fx("mugido", 0.25, 0.3, -0.3); put(wind(8.0, 0.4, 0.6), 0.0, 0.08)
t = C("s01", "Cincuenta"); fx("whoosh", t - 0.3, 0.25); pops(t, 17, 0.028 * 3, 0.07)
t = C("s01", "cuarenta"); pops(t, 16, 0.03 * 3, 0.07)
fx("pop", C("s01", "argentinos.") + 0.2, 0.35)
grill(C("s01", "Somos") - 0.1, C("s01", "Y sin embargo") + 0.3, 0.2)
fx("whoosh", C("s01", "Y sin embargo") - 0.3, 0.25)
fx("knock", C("s01", "kilo de asado"), 0.35)
for p in ["tres kilos", "kilos y medio", "medio de pollo", "pollo."]: fx("knock", C("s01", p), 0.22)
fx("pop", C("s01", "medio de pollo") + 0.3, 0.3)
fx("whoosh", C("s01", "Y los argentinos") - 0.3, 0.25); fx("pop", C("s01", "pollo", 1), 0.3); fx("pop", C("s01", "carne de vaca"), 0.3)
fx("glitch", C("s01", "¿Cómo") - 0.05, 0.25); fx("boom", C("s01", "¿Quién") - 0.05, 0.4)
fx("whoosh", C("s01", "Vamos") - 0.5, 0.35); put(flyby(3.0), C("s01", "Vamos") - 0.6, 0.25)
pops(C("s01", "Vamos") - 0.1, 5, 0.28, 0.14)
fx("riser", TITLE - 2.2, 0.45); fx("boom", TITLE, 0.9); fx("cuchilla", TITLE - 0.02, 0.5); fx("mugido", TITLE + 0.9, 0.12, 0.4)

# S02
fx("scratch", ST["s02"] - 0.1, 0.25); fx("typewriter", C("s02", "hay") , 0.12)
pops(C("s02", "En mil") + 0.3, 26, 0.12, 0.06)
pops(C("s02", "Hoy") + 0.1, 12, 0.13, 0.06)
fx("whoosh", C("s02", "Menos") - 0.2, 0.25); fx("stamp", C("s02", "Es el"), 0.5)
fx("whoosh", C("s02", "En el") - 0.35, 0.3); fx("boom", C("s02", "un cincuenta") - 0.1, 0.35); fx("pop", C("s02", "treinta.") - 0.3, 0.3)

# S03 — el criador
put(wind(6.0, 0.5, 0.7), C("s03", "Todo") - 0.2, 0.12); fx("mugido", C("s03", "Ahí") + 0.3, 0.22, 0.3)
pops(C("s03", "Tarda") + 0.2, 9, 0.14, 0.07); pops(C("s03", "otros") + 0.1, 7, 0.2, 0.07)
fx("squeak", C("s03", "ciento") - 0.1, 0.18)
fx("whoosh", C("s03", "Ese") - 0.3, 0.3); pops(C("s03", "Ese") + 0.1, 10, 0.1, 0.06)
fx("cashregister", C("s03", "treinta") + 0.1, 0.35)

# S04 — el invernador
fx("mugido", C("s04", "El ternero") + 0.4, 0.2, -0.4)
for p in ["pasto,", "maíz", "balanceado"]: fx("pop", C("s04", p), 0.3)
fx("squeak", C("s04", "cuatrocientos") - 0.2, 0.18)
fx("cashregister", C("s04", "dieciséis") + 0.1, 0.35)
fx("boom", C("s04", "Y acá") + 0.05, 0.55); fx("glitch", C("s04", "trampa:") - 0.1, 0.25)
fx("cuchilla", C("s04", "El resto") + 0.05, 0.45)
for p in ["hueso,", "grasa,", "cuero", "vísceras."]: fx("pop", C("s04", p), 0.3)
fx("typewriter", C("s04", "kilo de novillo") - 0.2, 0.12); fx("pop", C("s04", "cuatro"), 0.3)
fx("whoosh", C("s04", "Así") - 0.3, 0.25); fx("cashregister", C("s04", "nueve"), 0.4)

# S05 — frigorífico y carnicería
for p in ["Faena,", "corta"]: fx("cuchilla", C("s05", p), 0.28)
fx("pop", C("s05", "enfría,"), 0.25); fx("motor", C("s05", "manda") - 0.1, 0.25)
fx("riser", C("s05", "Y acá") - 1.0, 0.25); fx("boom", C("s05", "sorpresa.") - 0.05, 0.45)
fx("pop", C("s05", "un peso"), 0.4); fx("boom", C("s05", "Uno.") - 0.05, 0.4); fx("knock", C("s05", "Uno."), 0.3)
for p in ["cuero,", "subproductos", "exportación."]: fx("pop", C("s05", p), 0.3)
fx("motor", C("s05", "Cuarto") - 0.3, 0.2)
for p in ["Desposta", "alquiler,", "luz", "sueldos,", "lo que"]: fx("pop", C("s05", p), 0.26)
fx("cuchilla", C("s05", "Desposta") + 0.1, 0.2)
fx("cashregister", C("s05", "veinte") + 0.1, 0.35)

# S06 — el Estado
fx("boom", ST["s06"] + 0.05, 0.35)
for p in ["cría,", "engorda,", "faena", "corta,"]: fx("knock", C("s06", p), 0.3)
for i in range(4): fx("knock", C("s06", "pero cobra") + 0.3 + i * 0.22, 0.35, (i - 1.5) / 2); fx("boom", C("s06", "pero cobra") + 0.35 + i * 0.22, 0.12)
fx("boom", C("s06", "Estado.") - 0.05, 0.6); fx("glitch", C("s06", "Estado."), 0.2)
for p in ["IVA,", "Ganancias,", "Ingresos", "tasas"]: fx("stamp", C("s06", p), 0.45)
fx("riser", C("s06", "veintiocho") - 1.2, 0.3); fx("boom", C("s06", "veintiocho") + 0.3, 0.7); fx("cuchilla", C("s06", "veintiocho") + 0.3, 0.3)
fx("whoosh", C("s06", "Y es") - 0.3, 0.3); fx("stamp", C("s06", "veintiuno.") + 0.6, 0.45)

# S07 — el ticket
fx("ticket", ST["s07"] + 0.05, 0.35)
fx("cashregister", C("s07", "dieciocho"), 0.3)
for p, n in [("Seis", 0), ("Tres", 0), ("Menos", 0), ("Tres", 1), ("Y más", 0)]:
    fx("ticket", C("s07", p, n) - 0.1, 0.18); fx("pop", C("s07", p, n) + 0.1, 0.2)
fx("scratch", C("s07", "impuestos.") - 0.1, 0.18); fx("cashregister", C("s07", "impuestos.") + 0.7, 0.45)

# S08 — exportación, dólares y menos vacas
fx("whoosh", C("s08", "Porque") - 0.3, 0.3); put(swell(2.4), C("s08", "Porque") - 0.2, 0.25)
pops(C("s08", "Casi") + 0.2, 10, 0.07, 0.1); fx("whoosh", C("s08", "Casi") + 1.4, 0.2)
fx("whoosh", C("s08", "China,") - 0.6, 0.3); fx("pop", C("s08", "China,") + 0.3, 0.3); fx("pop", C("s08", "Estados Unidos.") + 0.3, 0.3)
fx("boom", C("s08", "Y el mundo") - 0.05, 0.35)
put(flyby(2.4), C("s08", "Estados", 1) - 0.6, 0.3); put(flyby(2.6), C("s08", "Australia") - 0.8, 0.35)
for p in [("Estados", 1), ("Brasil", 0), ("Australia", 0)]: fx("pop", C("s08", *p) + 0.15, 0.3)
fx("whoosh", C("s08", "y el precio") - 0.3, 0.25); fx("boom", C("s08", "treinta") - 0.05, 0.45)
fx("whoosh", C("s08", "adentro"), 0.2); fx("cashregister", C("s08", "dólares.") - 0.1, 0.35)
put(wind(7.0, 0.8, 0.5), C("s08", "Y encima") - 0.2, 0.14); fx("mugido", C("s08", "terneros,"), 0.16, 0.5)
fx("whoosh", C("s08", "y en agosto") - 0.3, 0.25); fx("boom", C("s08", "trece") - 0.05, 0.5)

# S09 — el pollo
fx("pop", C("s09", "El pollo juega"), 0.3)
fx("whoosh", C("s09", "Un pollo") - 0.3, 0.25); fx("pop", C("s09", "siete"), 0.3); fx("whoosh", C("s09", "Una vaca,"), 0.35)
fx("knock", C("s09", "Con menos") + 0.3, 0.3); fx("knock", C("s09", "Con menos") + 0.5, 0.3); fx("pop", C("s09", "kilo de pollo"), 0.35)
fx("knock", C("s09", "kilo de asado"), 0.35)
for p, n in [("tres kilos", 0), ("kilos y medio", 0), ("medio de pollo", 0), ("pollo.", 4)]: fx("knock", C("s09", p, n), 0.22)
fx("whoosh", C("s09", "Y por eso") - 0.3, 0.25); fx("pop", C("s09", "come"), 0.3); fx("pop", C("s09", "que vaca."), 0.3)

# S10 — la bronca
for p in ["La mitad", "Un quinto", "El frigorífico,"]: fx("pop", C("s10", p), 0.35)
fx("pop", C("s10", "veintiún"), 0.35); fx("boom", C("s10", "veintiocho.") - 0.05, 0.6)
pops(C("s10", "come menos"), 12, 0.08, 0.06)
put(wind(5.0, 0.4, 0.5), C("s10", "Las vacas") - 0.3, 0.14); fx("mugido", C("s10", "Las vacas") + 0.6, 0.14, -0.5)
grill(C("s10", "La próxima") - 0.2, C("s10", "Contanos") + 0.3, 0.24)
fx("boom", C("s10", "veintiocho", 1) - 0.05, 0.5)
fx("boom", C("s10", "Son impuestos.") - 0.05, 0.9); fx("cuchilla", C("s10", "Son impuestos.") - 0.07, 0.45)
fx("typewriter", C("s10", "pagaste") + 0.3, 0.15)
fx("pop", C("s10", "suscribite") - 0.2, 0.35)

# ---------------- Suma y master (loudnorm lineal en dos pasadas, como el Ep5) ----------------
act = env[: N] > 0.5
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print("voz (hablando) dB:", round(db(voice[act]), 1), "| música bajo voz dB:", round(db(music[act].mean(axis=1)), 1),
      "| música en pausas dB:", round(db(music[~act].mean(axis=1)), 1), "| sfx pico:", round(float(np.abs(sfx).max()), 2))
mix = music + sfx * 0.9
mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]
peak = np.abs(mix).max(); print("pico previo", round(float(peak), 3))
mix = mix / max(peak, 1e-9) * 0.89
raw = os.path.join(OUT, "pre6.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep06.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
