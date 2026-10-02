"""Mezcla del episodio 9 (Vaca Muerta): narración + dos temas con ducking + efectos
(ElevenLabs, librería del canal y sintetizados). Salida: audio/mix/mezcla_ep09.wav (48 kHz estéreo, -14 LUFS)."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep09/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep09/words.json")))
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
    a = load(os.path.join(PUB, f"ep09/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música ----------------
M = {"tesoro": load(os.path.join(PUB, "ep09/music/m1_tesoro.mp3")), "trampas": load(os.path.join(PUB, "ep09/music/m2_trampas.mp3"))}
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
cut6 = ST["s06"] - 0.3
place("tesoro", 0.0, cut6 + 0.5, 0.0, fin=0.6, fout=1.2)
m2_len = len(M["trampas"]) / SR
place("trampas", cut6 - 0.3, TOTAL, max(0.0, m2_len - (TOTAL - (cut6 - 0.3))), fin=0.5, fout=1.5)

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
dip(C("s10", "Si te") - 0.2, TOTAL, 1.35, ramp=0.8)                       # pantalla final
dip(TITLE - 0.2, ST["s02"] - 0.3, 1.45, ramp=0.4)                           # placa de título
dip(C("s10", "El petróleo no") - 0.3, C("s10", "Contanos") - 0.2, 1.2, ramp=0.3)   # remate
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx", "ep05/sfx", "ep06/sfx", "ep09/sfx"]:
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
def pops(t0, n, step, gain=0.12, spread=True):
    for i in range(n): fx("pop", t0 + i * step, gain, ((i % 5) - 2) * 0.3 if spread else 0.0)

def knocks(t0, n, dur, gain=0.12):
    for i in range(n): fx("knock", t0 + i * dur / max(1, n), gain * (0.8 + 0.4 * ((i * 7) % 5) / 4), ((i % 5) - 2) * 0.25)

# transiciones de crudo (en el centro de cada corte)
CUTS = [ST["s02"] - 0.3, ST["s03"] - 0.3, ST["s04"] - 0.25, ST["s05"] - 0.25, ST["s06"] - 0.3, ST["s07"] - 0.35, ST["s08"] - 0.35, ST["s09"] - 0.4, ST["s10"] - 0.4]
for a in CUTS:
    fx("whoosh", a - 0.35, 0.3); fx("boom", a - 0.05, 0.12)

# S01 — gancho
fx("boom", 0.35, 0.35); fx("helicoptero", 0.0, 0.1, 0.3)
put(wind(5.0, 0.4, 0.6), C("s01", "en el desierto") - 0.3, 0.12)
fx("bombeo", C("s01", "En agosto,") - 0.1, 0.16)
pops(C("s01", "novecientos"), 13, 0.2, 0.05)
fx("stamp", C("s01", "Récord"), 0.55); fx("boom", C("s01", "Récord"), 0.35)
fx("whoosh", C("s01", "El petróleo ya") - 0.3, 0.25); fx("pop", C("s01", "le ganó") + 0.3, 0.3); fx("whoosh", C("s01", "le ganó"), 0.18)
fx("surtidor", C("s01", "subió") - 0.1, 0.4); fx("cashregister", C("s01", "veinte"), 0.28)
fx("glitch", C("s01", "¿Cómo") - 0.05, 0.25); fx("boom", C("s01", "¿Cómo") - 0.05, 0.3)
fx("whoosh", C("s01", "¿Nos") - 0.3, 0.25); fx("whoosh", C("s01", "o en Venezuela?") - 0.3, 0.25, 0.4)
fx("perforacion", C("s01", "bajar") - 0.2, 0.45)
fx("riser", TITLE - 2.6, 0.4); fx("mar", C("s01", "Y viajar") + 2.4, 0.2)
fx("boom", TITLE, 0.9); fx("whoosh", TITLE - 0.3, 0.3)

# S02 — el mar jurásico
fx("mar", ST["s02"] - 0.2, 0.22); fx("mar", ST["s02"] + 9.3, 0.2); fx("mar", C("s02", "Capa") - 0.6, 0.12)
pops(C("s02", "caían"), 9, 0.3, 0.05)
knocks(C("s02", "Capa"), 6, 2.4, 0.12)
fx("boom", C("s02", "El barro se") + 0.4, 0.3); put(swell(2.6), C("s02", "El barro se"), 0.2)
put(fire(4.0), C("s02", "calor") - 0.1, 0.1)
pops(C("s02", "esa vida") + 0.4, 12, 0.14, 0.06)
fx("whoosh", C("s02", "Esa roca") - 0.3, 0.25); fx("pop", C("s02", "treinta"), 0.3)
put(flyby(2.2), C("s02", "más que toda") - 0.4, 0.28); fx("knock", C("s02", "más que toda") + 1.6, 0.3)
put(wind(4.0, 0.5, 0.6), C("s02", "Y se llama") - 0.3, 0.12); fx("boom", C("s02", "Vaca"), 0.35)

# S03 — atrapado en la roca, el fracking
fx("mar", C("s03", "lago") - 0.5, 0.14); fx("scratch", C("s03", "subterráneo.") + 0.05, 0.3); fx("glitch", C("s03", "subterráneo.") + 0.05, 0.18)
fx("pop", C("s03", "poros") + 0.2, 0.3); fx("pop", C("s03", "pelo.") + 0.1, 0.35)
fx("boom", C("s03", "el fracking.") - 0.05, 0.45)
fx("perforacion", C("s03", "Se perfora"), 0.5); fx("perforacion", C("s03", "dobla") - 0.1, 0.35)
tI = C("s03", "inyecta"); tG = C("s03", "grietas,") + 0.6
for i in range(5): fx("fractura", tI + i * (tG - tI) / 5, 0.32, (i - 2) * 0.3)
put(swell(2.4), C("s03", "petróleo empieza") - 0.3, 0.25); fx("mar", C("s03", "petróleo empieza"), 0.14)
put(wind(3.5, 0.5, 0.6), C("s03", "El primer") - 0.3, 0.12); fx("stamp", C("s03", "El primer") + 0.3, 0.35)
pops(C("s03", "Hoy hay"), 22, 0.1, 0.04); fx("boom", C("s03", "cuatro"), 0.35)

# S04 — ¿cuánto hay?
fx("boom", ST["s04"] + 0.05, 0.3)
pops(C("s04", "Vaca Muerta es") + 0.1, 5, 0.1, 0.12); fx("stamp", C("s04", "segunda"), 0.45)
pops(C("s04", "cuarta") - 0.3, 5, 0.1, 0.12); fx("stamp", C("s04", "cuarta"), 0.45)
knocks(C("s04", "dieciséis"), 14, 1.8, 0.12); fx("cashregister", C("s04", "dieciséis") + 1.6, 0.3)
knocks(C("s04", "casi el doble:"), 12, 1.8, 0.12); fx("boom", C("s04", "treinta"), 0.4)
fx("tictac", C("s04", "Al ritmo"), 0.25); fx("boom", C("s04", "cien"), 0.45)

# S05 — el boom
fx("stamp", ST["s05"] + 0.3, 0.4)
fx("tictac", C("s05", "y desde"), 0.2); pops(C("s05", "y desde"), 20, 0.15, 0.04)
for i in range(7): fx("knock", C("s05", "siete") + 0.5 + i * 0.12, 0.2, (i - 3) * 0.2)
fx("bocina", C("s05", "Entre enero") - 0.2, 0.3); fx("cashregister", C("s05", "seis mil") + 0.8, 0.35); fx("boom", C("s05", "un cincuenta"), 0.4)
put(wind(5.0, 0.5, 0.6), C("s05", "Y Añelo,") - 0.3, 0.12)
pops(C("s05", "doce mil"), 7, 0.12, 0.1)

# S06 — TRAMPA 1: los caños
fx("stamp", ST["s06"] + 0.1, 0.6); fx("boom", ST["s06"] + 0.1, 0.45); fx("glitch", ST["s06"] + 0.12, 0.15)
knocks(C("s06", "el petróleo hay"), 10, 2.0, 0.1)
fx("squeak", C("s06", "Y los caños"), 0.25); fx("boom", C("s06", "no alcanzan.") - 0.05, 0.45)
fx("whoosh", C("s06", "Por eso") - 0.3, 0.25); put(swell(3.0), C("s06", "oleoducto") - 0.2, 0.2)
fx("typewriter", C("s06", "Cuatrocientos") - 0.2, 0.12); fx("pop", C("s06", "Punta Colorada,"), 0.3)
fx("bocina", C("s06", "donde van"), 0.4)
fx("mar", C("s06", "Arranca") - 0.2, 0.12); fx("riser", C("s06", "setecientos") - 1.2, 0.3); fx("boom", C("s06", "setecientos") + 0.6, 0.4)
fx("whoosh", C("s06", "Sin caños,") - 0.3, 0.25); fx("fractura", C("s06", "techo.") - 0.3, 0.4); fx("boom", C("s06", "techo.") - 0.3, 0.45)

# S07 — TRAMPA 2: la nafta
fx("stamp", ST["s07"] + 0.1, 0.6); fx("boom", ST["s07"] + 0.1, 0.45)
fx("surtidor", C("s07", "¿por qué") - 0.2, 0.3)
fx("whoosh", C("s07", "Porque") - 0.3, 0.25); fx("pop", C("s07", "Si afuera") + 0.3, 0.3); fx("cashregister", C("s07", "cien dólares,"), 0.28)
fx("whoosh", C("s07", "lo exporta.") - 0.2, 0.3); fx("bocina", C("s07", "lo exporta.") + 0.2, 0.25)
fx("boom", C("s07", "Y desde que"), 0.5); fx("helicoptero", C("s07", "Y desde que"), 0.12)
fx("whoosh", C("s07", "cerró") + 0.6, 0.3)
for i in range(5): fx("pop", C("s07", "una de cada") + i * 0.1, 0.22)
fx("glitch", C("s07", "una de cada") + 0.7, 0.2)
fx("cashregister", C("s07", "ciento veintiséis"), 0.3); fx("boom", C("s07", "ciento veintiséis") + 0.4, 0.5)
fx("surtidor", C("s07", "pasó de") - 0.1, 0.42); fx("cashregister", C("s07", "más de dos mil."), 0.35)
fx("mar", C("s07", "Y más de un tercio") - 0.2, 0.16); fx("stamp", C("s07", "impuestos.") - 0.1, 0.5); fx("boom", C("s07", "impuestos.") - 0.1, 0.4)

# S08 — Arabia Saudita y Venezuela
put(wind(4.0, 0.4, 0.6), ST["s08"], 0.1); fx("stamp", C("s08", "Ni cerca."), 0.6); fx("boom", C("s08", "Ni cerca."), 0.3)
knocks(C("s08", "Aun golpeada"), 9, 1.0, 0.12)
pops(C("s08", "seis millones") - 0.2, 30, 0.073, 0.05); fx("riser", C("s08", "seis millones") - 0.4, 0.3); fx("boom", C("s08", "Casi siete"), 0.5)
fx("whoosh", C("s08", "Pero hay otro") - 0.2, 0.25); fx("boom", C("s08", "Venezuela."), 0.35)
knocks(C("s08", "un millón") - 0.3, 11, 1.0, 0.12); fx("pop", C("s08", "Apenas"), 0.3)
fx("riser", C("s08", "Venezuela llegó") - 0.2, 0.35); fx("boom", C("s08", "tres millones.") + 0.2, 0.45)
fx("boom", C("s08", "Tuvo") - 0.1, 0.5); fx("glitch", C("s08", "lo perdió.") - 0.1, 0.25); fx("motor", C("s08", "Tuvo"), 0.12)

# S09 — TRAMPA 3: la enfermedad holandesa y Noruega
fx("stamp", ST["s09"] + 0.15, 0.6); fx("boom", ST["s09"] + 0.15, 0.45)
fx("whoosh", C("s09", "Tiene nombre:") - 0.3, 0.25); fx("boom", C("s09", "enfermedad holandesa,"), 0.35)
pops(C("s09", "Cuando un país"), 3, 0.15, 0.2); fx("billetes", C("s09", "entran"), 0.4)
fx("squeak", C("s09", "se abarata.") - 0.4, 0.25); fx("glitch", C("s09", "se abarata."), 0.18)
fx("whoosh", C("s09", "Y con el dólar barato,") - 0.3, 0.25); fx("boom", C("s09", "fábricas") + 0.6, 0.35); fx("boom", C("s09", "imposible") + 0.4, 0.25)
fx("whoosh", C("s09", "El Fondo") - 0.3, 0.25); fx("stamp", C("s09", "advirtió"), 0.6)
fx("mar", C("s09", "Noruega") - 0.3, 0.16); put(wind(4.0, 0.5, 0.6), C("s09", "Noruega") - 0.3, 0.1)
fx("cashregister", C("s09", "dos coma"), 0.35); fx("boom", C("s09", "billones"), 0.45); fx("billetes", C("s09", "más de cuatrocientos"), 0.3)

# S10 — cierre
put(wind(7.0, 0.5, 0.6), ST["s10"] - 0.4, 0.12); fx("bombeo", ST["s10"] - 0.2, 0.1)
put(swell(3.0), C("s10", "Y la Argentina") - 0.2, 0.22); fx("mar", C("s10", "el tesoro") - 0.4, 0.12)
fx("boom", C("s10", "El petróleo no") - 0.05, 0.45); fx("boom", C("s10", "Lo que hacés") - 0.05, 0.6)
fx("typewriter", C("s10", "Contanos"), 0.12); fx("whoosh", C("s10", "Venezuela?") - 0.3, 0.25)
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
raw = os.path.join(OUT, "pre9.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep09.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
