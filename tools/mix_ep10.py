"""Mezcla del episodio 10 (El cuadro del nazi): narración + tres temas con ducking + efectos
(ElevenLabs, librería del canal y sintetizados). Salida: audio/mix/mezcla_ep10.wav (48 kHz estéreo, -14 LUFS)."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep10/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep10/words.json")))
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
    a = load(os.path.join(PUB, f"ep10/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música: misterio (S01–S03), huida (S04–S06), cierre (S07–S10) ----------------
M = {k: load(os.path.join(PUB, f"ep10/music/{f}.mp3")) for k, f in [("misterio", "m1_misterio"), ("huida", "m3_huida"), ("cierre", "m2_cierre")]}
TARGET_RMS = 10 ** (-16 / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
REF = {k: rms(v[int(10 * SR): int(100 * SR)]) for k, v in M.items()}
def place(name, g0, g1, off, fin=0.05, fout=0.35, gain=1.0):
    src = M[name]; i0, i1 = int(g0 * SR), int(g1 * SR); o = int(off * SR)
    seg = src[o:o + (i1 - i0)].copy(); n = len(seg)
    seg *= TARGET_RMS / REF[name]
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain

TITLE = ST["s01"] + D["s01"] + 0.1
cut4 = ST["s04"] - 0.3
cut7 = ST["s07"] - 0.4
place("misterio", 0.0, cut4 + 0.8, 0.0, fin=1.2, fout=1.4)
place("huida", cut4 - 0.4, cut7 + 1.0, 0.0, fin=0.8, fout=1.6)
m3_len = len(M["cierre"]) / SR
place("cierre", cut7 - 0.5, TOTAL, max(0.0, m3_len - (TOTAL - (cut7 - 0.5))), fin=1.2, fout=1.5)

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
LOW, HIGH = 0.2, 0.56
g = HIGH - (HIGH - LOW) * env
def dip(a, b, level, ramp=0.4):
    global g
    i0, i1, r = int(a * SR), int(b * SR), int(ramp * SR)
    d = np.ones(N); d[i0:i1] = level
    d[max(0, i0 - r):i0] = np.linspace(1, level, i0 - max(0, i0 - r)); d[i1:i1 + r] = np.linspace(level, 1, len(d[i1:i1 + r]))
    g = g * d
dip(C("s10", "Si te") - 0.2, TOTAL, 1.35, ramp=0.8)                 # pantalla final
dip(TITLE - 0.2, ST["s02"] - 0.3, 1.5, ramp=0.4)                      # placa de título
dip(C("s02", "cae") + 0.4, C("s02", "Tenía cuarenta") + 0.3, 0.35, ramp=0.2)   # el silencio después de la caída
dip(C("s07", "no estaba.") + 0.3, ST["s08"] - 0.3, 0.6, ramp=0.3)     # el tapiz
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx", "ep05/sfx", "ep06/sfx", "ep09/sfx", "ep10/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        a = load(os.path.join(PUB, d, f))
        SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
SF["whoosh_rev"] = SF["whoosh"][::-1].copy()

from sfx_synth import swell, wind
def put(a, t, gain=0.5):
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
def pops(t0, n, step, gain=0.12, spread=True):
    for i in range(n): fx("pop", t0 + i * step, gain, ((i % 5) - 2) * 0.3 if spread else 0.0)
def typing(t0, sec, gain=0.12):
    fx("typewriter", t0, gain, dur=sec)

# transiciones: diafragma de cámara (whoosh + flash) en cada corte
CUTS = [ST["s02"] - 0.3, ST["s03"] - 0.3, ST["s04"] - 0.3, ST["s05"] - 0.3, ST["s06"] - 0.3, ST["s07"] - 0.4, ST["s08"] - 0.45, ST["s09"] - 0.4, ST["s10"] - 0.4]
for a in CUTS[1:]:
    fx("whoosh", a - 0.4, 0.26); fx("flash", a - 0.05, 0.22)

# S01 — gancho
fx("mar", 0.0, 0.12); put(wind(9.0, 0.3, 0.5), 0.2, 0.08)
fx("timbre", C("s01", "timbre") + 0.25, 0.6, 0.2)
fx("knock", C("s01", "alguien") + 0.3, 0.12, -0.4)
fx("pop", C("s01", "se vende.") + 0.1, 0.3)
fx("whoosh", C("s01", "Esa noche,") - 0.4, 0.22)
tP = C("s01", "pasa")
for k, d in enumerate([0.25, 0.95]): fx("celular", tP + d, 0.35, 0.2)
fx("celular", C("s01", "Hasta que") + 0.45, 0.35, 0.2)
fx("whoosh", C("s01", "al living,") + 0.1, 0.3)
put(swell(2.4), C("s01", "lo frena:") - 0.5, 0.2)
fx("flash", C("s01", "¿ese") - 0.05, 0.4); fx("boom", C("s01", "¿ese"), 0.3)
fx("stamp", C("s01", "robaron"), 0.55); fx("boom", C("s01", "robaron"), 0.35)
fx("tictac", C("s01", "y que") - 0.1, 0.25, dur=2.2)
fx("boom", C("s01", "¿Cómo"), 0.4)
fx("whoosh_rev", C("s01", "Para entenderlo,") - 0.6, 0.3); fx("radio", C("s01", "volver") - 0.2, 0.16, dur=2.5)
fx("riser", TITLE - 2.6, 0.35)
fx("boom", TITLE, 0.9); fx("whoosh", TITLE - 0.3, 0.3); typing(TITLE + 0.45, 1.1, 0.14); fx("stamp", TITLE + 0.9, 0.4)

# S02 — Goudstikker, la invasión, el barco, el cuaderno
fx("flash", ST["s02"] + 0.0, 0.3); typing(C("s02", "galerista") - 0.2, 1.4, 0.12)
fx("whoosh", C("s02", "Era judío,") + 0.3, 0.25); put(swell(3.0), C("s02", "Era judío,") + 0.4, 0.15)
pops(C("s02", "mil cien") - 0.3, 10, 0.1, 0.06)
fx("aviones", C("s02", "El diez") - 0.4, 0.3); fx("botas", C("s02", "El diez") + 0.6, 0.32)
fx("boom", C("s02", "Alemania invade"), 0.5); fx("stamp", C("s02", "El diez") + 0.1, 0.3)
fx("mar", C("s02", "Cuatro días") - 0.2, 0.18); fx("bocina", C("s02", "últimos barcos"), 0.28)
fx("flash", C("s02", "su mujer") - 0.2, 0.25)
fx("barco", C("s02", "La segunda") - 0.4, 0.42); fx("barco", C("s02", "La segunda") + 3.6, 0.3)
fx("caida", C("s02", "cae") + 0.05, 0.75); fx("boom", C("s02", "cae") + 0.1, 0.35)
fx("tictac", C("s02", "Tenía cuarenta") - 0.2, 0.12, dur=1.8)
fx("paginas", C("s02", "cuadernito") + 0.1, 0.5)
for k in range(3): fx("paginas", C("s02", "cuadro por") + k * 0.6, 0.35, (k - 1) * 0.3, dur=1.0)
pops(C("s02", "la lista,"), 12, 0.13, 0.04)

# S03 — Göring
fx("proyector", ST["s03"] - 0.2, 0.18, dur=6.0); fx("boom", C("s03", "apareció"), 0.35)
fx("boom", C("s03", "Hermann"), 0.5); fx("stamp", C("s03", "el número"), 0.3)
fx("flash", C("s03", "obsesionado") - 0.1, 0.35); typing(C("s03", "colecciones") - 0.1, 1.5, 0.1)
fx("stamp", C("s03", "En julio") + 0.1, 0.3)
tI = C("s03", "intermediarios")
for k in range(7): fx("whoosh", tI + k * 0.75, 0.13, ((k % 3) - 1) * 0.5)
fx("cashregister", C("s03", "dos millones") + 0.6, 0.3); fx("stamp", C("s03", "una fracción") + 0.1, 0.55); fx("boom", C("s03", "una fracción") + 0.1, 0.3)
fx("boom", C("s03", "nadie"), 0.4)
fx("paginas", C("s03", "papeles,") - 0.2, 0.45); fx("paginas", C("s03", "papeles,") + 0.2, 0.35)
fx("scratch", C("s03", "firmas"), 0.15)
fx("stamp", C("s03", "amenazas."), 0.65); fx("boom", C("s03", "amenazas."), 0.45)
fx("riser", C("s03", "Les robaron") - 0.6, 0.3); pops(C("s03", "Les robaron"), 18, 0.12, 0.04)
fx("boom", C("s03", "seiscientas") + 0.3, 0.45)
fx("glitch", C("s03", "Cien mil"), 0.25); fx("whoosh_rev", C("s03", "Cien mil") + 0.3, 0.25)

# S04 — Kadgien
typing(C("s04", "Friedrich") + 0.5, 2.6, 0.12)
fx("boom", C("s04", "Friedrich"), 0.4)
fx("knock", C("s04", "oro,"), 0.3); fx("knock", C("s04", "oro,") + 0.15, 0.22)
fx("pop", C("s04", "diamantes"), 0.3); fx("pop", C("s04", "diamantes") + 0.12, 0.2, 0.4)
fx("billetes", C("s04", "divisas"), 0.4)
fx("whoosh", C("s04", "la Serpiente.") - 0.4, 0.3); typing(C("s04", "la Serpiente.") - 0.2, 0.9, 0.12)
typing(C("s04", "el retrato") - 0.1, 1.2, 0.12)
fx("proyector", C("s04", "Y cuando") - 0.2, 0.16, dur=4.0)
fx("boom", C("s04", "escapó."), 0.6); fx("whoosh", C("s04", "escapó.") - 0.3, 0.3)
fx("radio", C("s04", "Primero") - 0.3, 0.14, dur=2.5)
for ph in ["Suiza,", "Brasil,", "Argentina."]: fx("pop", C("s04", ph), 0.3)
fx("boom", C("s04", "Argentina."), 0.3)
for ph in ["Con diamantes,", "joyas,", "dos cuadros"]: fx("pop", C("s04", ph), 0.28)

# S05 — rutas de las ratas
fx("boom", C("s05", "rutas de las ratas:"), 0.55); fx("stamp", C("s05", "rutas de las ratas:") + 0.2, 0.3)
put(wind(5.0, 0.4, 0.7), C("s05", "cruzaban") - 0.2, 0.14)
fx("tren", C("s05", "cruzaban"), 0.12, dur=4.0)
fx("flash", C("s05", "pasaportes") - 0.1, 0.35); fx("stamp", C("s05", "nombres falsos,"), 0.55)
fx("bocina", C("s05", "se embarcaban"), 0.3); fx("mar", C("s05", "Génova.") - 0.2, 0.16)
fx("barco", C("s05", "Del otro lado") - 0.3, 0.25)
fx("flash", C("s05", "la Argentina de Perón,") - 0.1, 0.3)
fx("stamp", C("s05", "no hacía"), 0.4)
typing(C("s05", "Una comisión"), 1.6, 0.1)
pops(C("s05", "ciento ochenta") - 0.3, 18, 0.06, 0.05)
fx("riser", C("s05", "Otras") - 0.3, 0.3); fx("boom", C("s05", "hablan de miles."), 0.5)

# S06 — los peores
fx("boom", ST["s06"] + 0.1, 0.45)
for ph in ["Adolf", "como Ricardo", "Josef", "Erich"]: fx("flash", C("s06", ph) - 0.1, 0.32)
fx("motor", C("s06", "Mercedes"), 0.08, dur=2.0)
fx("radio", C("s06", "A Eichmann") - 0.2, 0.2, dur=3.0)
fx("riser", C("s06", "comando") - 0.4, 0.3); fx("stamp", C("s06", "sesenta,") - 0.4, 0.3)
fx("boom", C("s06", "San Fernando."), 0.45)
fx("knock", C("s06", "Pero la mayoría"), 0.3); fx("boom", C("s06", "Y lo que"), 0.35)

# S07 — la investigación y el allanamiento
fx("stamp", C("s07", "setenta") + 0.2, 0.55)
put(wind(5.0, 0.3, 0.5), C("s07", "Sus dos hijas") - 0.2, 0.08)
typing(C("s07", "Unos periodistas"), 1.2, 0.1); fx("tictac", C("s07", "casi diez") - 0.3, 0.22, dur=2.6)
fx("glitch", C("s07", "compararon"), 0.18); fx("flash", C("s07", "fotos de archivo") - 0.3, 0.3)
put(swell(2.4), C("s07", "Era el mismo.") - 1.6, 0.2)
fx("stamp", C("s07", "Era el mismo."), 0.7); fx("boom", C("s07", "Era el mismo."), 0.6)
fx("whoosh", C("s07", "Lo publicaron") - 0.3, 0.25); fx("paginas", C("s07", "veinticinco") - 0.3, 0.3, dur=1.2)
fx("patrulleros", C("s07", "Dos días") + 0.2, 0.5); fx("sirena", C("s07", "allanó") - 0.6, 0.18, dur=2.5)
fx("boom", C("s07", "allanó"), 0.4)
fx("boom", C("s07", "no estaba."), 0.5)
put(swell(2.6), C("s07", "tapiz") - 0.8, 0.22)

# S08 — la devolución
fx("whoosh", ST["s08"], 0.3); pops(ST["s08"] + 0.15, 5, 0.25, 0.14)
fx("stamp", C("s08", "arresto") - 0.1, 0.35); fx("whoosh", C("s08", "y el tres") - 0.2, 0.25)
fx("stamp", C("s08", "Era auténtico:") + 0.1, 0.6); fx("boom", C("s08", "Era auténtico:") + 0.1, 0.35)
typing(C("s08", "Giacomo") - 0.2, 1.4, 0.08)
fx("cashregister", C("s08", "doscientos") + 1.0, 0.3)
fx("stamp", C("s08", "Y el cuatro"), 0.3)
fx("martillo", C("s08", "cerró") - 0.05, 0.75); fx("boom", C("s08", "cerró"), 0.3)
typing(C("s08", "renunció") - 0.2, 1.6, 0.1)
put(swell(3.0), C("s08", "y el retrato") - 0.3, 0.18)
fx("boom", C("s08", "Es la primera"), 0.5)

# S09 — el segundo cuadro
fx("boom", ST["s09"] + 0.05, 0.35); fx("riser", C("s09", "un segundo") - 1.0, 0.3)
fx("flash", C("s09", "una naturaleza") - 0.2, 0.35)
fx("stamp", C("s09", "Hasta hoy,"), 0.55); fx("stamp", C("s09", "entregó."), 0.5)
fx("paginas", C("s09", "Y del cuaderno") - 0.1, 0.4); fx("knock", C("s09", "faltan"), 0.3)
fx("boom", C("s09", "cien mil"), 0.45)
fx("pop", C("s09", "En un museo,"), 0.3); fx("martillo", C("s09", "remate,"), 0.4); fx("boom", C("s09", "arriba de un") + 0.2, 0.3)

# S10 — cierre
fx("celular", ST["s10"] + 0.2, 0.25); fx("tictac", ST["s10"] + 0.1, 0.2, dur=1.9)
pops(C("s10", "escondites") - 0.6, 3, 0.4, 0.22)
put(wind(6.0, 0.3, 0.5), C("s10", "Algunos") - 0.3, 0.08)
typing(C("s10", "Contanos"), 0.9, 0.1); fx("pop", C("s10", "Contanos"), 0.3)
fx("pop", C("s10", "suscribite") - 0.2, 0.35)

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
raw = os.path.join(OUT, "pre10.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep10.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
