"""Mezcla del episodio 11 (El Sol de Perón): narración + tres temas con ducking + efectos
(ElevenLabs, librería del canal y sintetizados). Salida: audio/mix/mezcla_ep11.wav (48 kHz estéreo, -14 LUFS)."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep11/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep11/words.json")))
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
    a = load(os.path.join(PUB, f"ep11/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música: era atómica (S01–S04), la duda (S05–S07), el legado (S08–S11) ----------------
M = {k: load(os.path.join(PUB, f"ep11/music/{f}.mp3")) for k, f in [("atomico", "m1_atomico"), ("tension", "m2_tension"), ("legado", "m3_legado")]}
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
cut5 = ST["s05"] - 0.3
cut8 = ST["s08"] - 0.45
place("atomico", 0.0, cut5 + 0.8, 0.0, fin=1.0, fout=1.4)
m2_len = len(M["tension"]) / SR
span2 = (cut8 - 0.2) - (cut5 - 0.4)
place("tension", cut5 - 0.4, cut8 - 0.2, max(0.0, m2_len - span2), fin=0.8, fout=0.6)
m3_len = len(M["legado"]) / SR
span3 = TOTAL - (cut8 - 0.1)
place("legado", cut8 - 0.1, TOTAL, max(0.0, m3_len - span3 - 2.0), fin=0.4, fout=1.5)

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
dip(C("s11", "Si te") - 0.2, TOTAL, 1.35, ramp=0.8)                 # pantalla final
dip(TITLE - 0.2, ST["s02"] - 0.3, 1.5, ramp=0.4)                      # placa de título
dip(C("s01", "Era todo") - 0.1, C("s01", "Pero lo") - 0.1, 0.35, ramp=0.15)   # "era todo mentira"
dip(C("s04", "La fusión") + 0.2, C("s04", "Controlarla,") - 0.2, 0.55, ramp=0.3)  # la bomba suena sola
dip(C("s07", "Fin") - 0.2, ST["s08"] - 0.5, 0.25, ramp=0.3)              # "fin de la historia… o eso parecía"
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx", "ep05/sfx", "ep06/sfx", "ep09/sfx", "ep10/sfx", "ep11/sfx"]:
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

from sfx_synth import swell, wind, powerdown, flick, ticks
# transiciones: destello solar (whoosh + flash) en cada corte
CUTS = [ST["s02"] - 0.3, ST["s03"] - 0.3, ST["s04"] - 0.3, ST["s05"] - 0.3, ST["s06"] - 0.3, ST["s07"] - 0.4, ST["s08"] - 0.45, ST["s09"] - 0.4, ST["s10"] - 0.4, ST["s11"] - 0.4]
for a in CUTS[1:]:
    fx("whoosh", a - 0.4, 0.24); fx("flash", a - 0.05, 0.2)

# S01 — el anuncio
fx("proyector", 0.0, 0.22, dur=9.0)
for k in range(3): put(flick(0.09), 0.02 + k * 0.43, 0.6)
fx("prensa", C("s01", "reúne") - 0.2, 0.42)
for d in [0, 0.35, 0.8, 1.3, 1.7]: fx("flash", C("s01", "prensa") + d, 0.18, (d - 0.8))
fx("teletipo", C("s01", "anuncio") - 0.1, 0.32)
fx("whoosh", C("s01", "en una isla") - 0.5, 0.3); put(wind(4.0, 0.4, 0.7), C("s01", "en una isla") - 0.2, 0.1)
fx("stamp", C("s01", "secreta"), 0.5)
fx("pop", C("s01", "la Argentina") + 0.1, 0.3); fx("pop", C("s01", "Estados"), 0.28, -0.5); fx("pop", C("s01", "Unión"), 0.28)
fx("knock", C("s01", "Estados") + 0.5, 0.25, -0.5); fx("knock", C("s01", "Unión") + 0.5, 0.25)
fx("campanada", C("s01", "conseguido.") - 0.1, 0.18, 0.5, dur=2.0)
put(swell(2.6), C("s01", "Encender,") - 0.4, 0.22); fx("zumbido", C("s01", "máquina,") - 0.2, 0.12, dur=3.0)
fx("whoosh", C("s01", "máquina,") - 0.3, 0.25)
for k in range(3): fx("pop", C("s01", "Energía") + 0.2 + k * 0.35, 0.25, (k - 1) * 0.5)
fx("chisporroteo", C("s01", "Energía") + 0.4, 0.08, dur=6.0)
fx("fractura", C("s01", "Era todo") + 0.1, 0.5); fx("boom", C("s01", "mentira."), 0.55); fx("stamp", C("s01", "mentira."), 0.6); fx("glitch", C("s01", "mentira.") + 0.05, 0.2)
fx("riser", C("s01", "Es lo que") - 1.2, 0.3)
for k in range(4): fx("pop", C("s01", "Es lo que") + 0.1 + k * 0.42, 0.25, (k - 1.5) * 0.4)
fx("riser", TITLE - 2.4, 0.32)
fx("explosion", TITLE - 0.05, 0.55); fx("boom", TITLE, 0.7); fx("whoosh", TITLE - 0.3, 0.3)

# S02 — Richter
fx("flash", ST["s02"], 0.28); typing(C("s02", "Ronald") - 0.1, 1.1, 0.12)
fx("stamp", C("s02", "casi nadie"), 0.45)
fx("whoosh", C("s02", "En mil") + 0.2, 0.3); pops(C("s02", "En mil"), 4, 0.25, 0.1)
fx("barco", C("s02", "llegó") - 0.3, 0.12, dur=3.0)
fx("jet", C("s02", "recomendado") - 0.3, 0.42); fx("proyector", C("s02", "recomendado") - 0.2, 0.15, dur=5.4)
fx("flash", C("s02", "Kurt") - 0.1, 0.25)
fx("prensa", C("s02", "Y le prometió") - 0.2, 0.18, dur=4.0)
fx("boom", C("s02", "potencia"), 0.4)
fx("tictac", C("s02", "media hora,") - 0.1, 0.3, dur=1.8); fx("pop", C("s02", "media hora,") + 1.6, 0.35)
fx("cashregister", C("s02", "plata,"), 0.35); fx("martillo", C("s02", "obreros,"), 0.35); fx("stamp", C("s02", "secreto"), 0.6)
fx("whoosh", C("s02", "y una isla") - 0.3, 0.25); fx("pop", C("s02", "Bariloche.") - 0.6, 0.3)
put(swell(2.4), C("s02", "La isla") - 0.6, 0.2); put(wind(3.5, 0.3, 0.6), C("s02", "La isla") - 0.2, 0.1)

# S03 — la ciudad científica y el reactor
fx("mar", ST["s03"] - 0.3, 0.16, dur=3.5); put(wind(3.0, 0.4, 0.4), ST["s03"], 0.08)
for k in range(6): fx("martillo", C("s03", "se levantó") + 0.3 + k * 0.4, 0.14, ((k % 3) - 1) * 0.6)
fx("boom", C("s03", "reactor") + 0.1, 0.4); fx("zumbido", C("s03", "un cilindro") - 0.2, 0.08, dur=4.0)
fx("pop", C("s03", "doce") - 0.1, 0.3); fx("pop", C("s03", "paredes") - 0.1, 0.3)
fx("fractura", C("s03", "Antes") + 0.4, 0.35); fx("fractura", C("s03", "grieta") - 0.1, 0.4)
fx("stamp", C("s03", "grieta"), 0.35)
fx("demolicion", C("s03", "mandó") + 0.1, 0.7); fx("boom", C("s03", "demoler."), 0.45)
typing(C("s03", "es que") - 0.1, 1.9, 0.14)
fx("cashregister", C("s03", "unos quince") + 0.9, 0.3); fx("billetes", C("s03", "Hoy") + 0.2, 0.3); fx("boom", C("s03", "quinientos"), 0.35)

# S04 — qué es la fusión
fx("boom", C("s04", "Fusión"), 0.5); fx("whoosh", C("s04", "Fusión") - 0.3, 0.25)
put(swell(3.0), C("s04", "En el centro") - 0.5, 0.25); fx("zumbido", C("s04", "En el centro"), 0.1, dur=6.0)
fx("pop", C("s04", "quince") - 0.1, 0.25)
for k in range(8): fx("whoosh", C("s04", "gravedad") + k * 0.05, 0.05, ((k % 4) - 1.5) * 0.5)
fx("riser", C("s04", "los núcleos") - 0.2, 0.3)
fx("boom", C("s04", "se pegan.") + 0.05, 0.4); fx("flash", C("s04", "liberan") - 0.65, 0.4)
fx("explosion", C("s04", "liberan") - 0.6, 0.35); put(swell(2.0), C("s04", "muchísima") - 0.6, 0.2)
fx("pop", C("s04", "En la Tierra,") + 0.6, 0.25); fx("riser", C("s04", "decenas") - 0.9, 0.22)
fx("explosion", C("s04", "La fusión") - 0.1, 0.95); fx("boom", C("s04", "La fusión"), 0.5)
fx("proyector", C("s04", "La fusión"), 0.12, dur=6.0)
fx("whoosh", C("s04", "Controlarla,") - 0.3, 0.25); put(swell(2.4), C("s04", "sueño") - 0.6, 0.18)

# S05 — "lo conseguí"
fx("proyector", ST["s05"] - 0.2, 0.12, dur=4.0); fx("pop", C("s05", "dieciséis"), 0.3)
fx("arco", C("s05", "conseguido,") - 0.05, 0.45); fx("geiger", C("s05", "conseguido,"), 0.12, dur=2.0)
fx("teletipo", C("s05", "y la noticia") - 0.1, 0.3)
for k in range(3): fx("whoosh", C("s05", "y la noticia") + k * 0.45, 0.2, (k - 1) * 0.6); fx("paginas", C("s05", "y la noticia") + 0.5 + k * 0.45, 0.22, (k - 1) * 0.6, dur=0.8)
for k in range(3): fx("stamp", C("s05", "Pero los") + 0.3 + k * 0.25, 0.3, (k - 1) * 0.6)
fx("flash", C("s05", "el padre") - 1.4, 0.25); typing(C("s05", "el padre") - 1.0, 0.8, 0.08)
fx("pop", C("s05", "uno piensa"), 0.22); fx("knock", C("s05", "se da"), 0.3); fx("boom", C("s05", "loco."), 0.35)
fx("boom", C("s05", "ni un") + 0.05, 0.5)
fx("pop", C("s05", "¿vos") - 0.3, 0.35); fx("celular", C("s05", "Dejámelo"), 0.2)

# S06 — la comisión
fx("boom", ST["s06"], 0.3); put(swell(2.2), C("s06", "dudar.") - 0.8, 0.15)
fx("mar", C("s06", "En septiembre") - 0.3, 0.18, dur=6.0); fx("motor", C("s06", "En septiembre"), 0.08, dur=6.0)
fx("flash", C("s06", "Entre sus") - 0.1, 0.28); fx("pop", C("s06", "treinta"), 0.3); typing(C("s06", "José") - 0.1, 1.3, 0.1)
fx("paginas", C("s06", "Y su informe") - 0.1, 0.35); fx("stamp", C("s06", "demoledor."), 0.6); fx("boom", C("s06", "demoledor."), 0.35)
fx("riser", C("s06", "cuarenta") - 0.6, 0.3); fx("boom", C("s06", "grados.") , 0.35)
fx("arco", C("s06", "Su máquina,"), 0.45); fx("zumbido", C("s06", "Su máquina,"), 0.1, dur=4.0)
fx("pop", C("s06", "unos pocos"), 0.3)
fx("mar", C("s06", "Como querer") - 0.2, 0.2, dur=3.0); fx("chisporroteo", C("s06", "fósforo.") - 0.4, 0.2, dur=1.5)
for ph in ["marcaban", "combustible:", "chispa"]: fx("arco", C("s06", ph) - 0.05, 0.18); fx("geiger", C("s06", ph), 0.18, dur=1.4)
fx("arco", C("s06", "marcaban") + 1.35, 0.15)
fx("knock", C("s06", "medían"), 0.3)
typing(C("s06", "las afirmaciones") - 0.1, 4.9, 0.11)
fx("scratch", C("s06", "criterio") - 0.1, 0.1); fx("boom", C("s06", "científico."), 0.3)

# S07 — el final de Richter
fx("botas", ST["s07"] - 0.2, 0.3, dur=3.6); fx("radio", ST["s07"] + 0.3, 0.12, dur=2.8); fx("zumbido", ST["s07"], 0.1, dur=3.6)
fx("stamp", ST["s07"] + 0.2, 0.3)
fx("knock", C("s07", "conectados.") - 0.4, 0.35); fx("chisporroteo", C("s07", "conectados.") - 0.3, 0.12, dur=0.8)
fx("stamp", C("s07", "fraude,") - 0.1, 0.65); fx("boom", C("s07", "fraude,") - 0.05, 0.5)
put(powerdown(1.6), C("s07", "apaga") - 0.2, 0.35)
fx("boom", C("s07", "golpe"), 0.4); fx("martillo", C("s07", "detenido.") - 0.4, 0.4); fx("stamp", C("s07", "detenido."), 0.55)
fx("gallinas", C("s07", "criando") - 0.2, 0.35)
pops(C("s07", "pequeños") - 0.6, 7, 0.22, 0.12)
fx("campanada", C("s07", "Murió") - 0.1, 0.3, dur=3.0)
fx("proyector", C("s07", "Fin") - 0.2, 0.25, dur=2.4)
fx("glitch", C("s07", "O eso"), 0.35); fx("riser", C("s07", "O eso") - 0.4, 0.35)

# S08 — Spitzer y el stellarator
put(wind(9.5, 0.3, 0.6), ST["s08"] - 0.3, 0.12)
fx("paginas", C("s08", "leyó") - 0.2, 0.35); fx("whoosh", C("s08", "leyó") - 0.4, 0.2)
fx("flash", C("s08", "Lyman") - 0.2, 0.22)
fx("scratch", C("s08", "esto") - 0.1, 0.12); fx("knock", C("s08", "funcionar.") - 0.2, 0.25)
fx("pop", C("s08", "¿qué haría") - 0.1, 0.25)
fx("squeak", C("s08", "Y arriba") - 0.2, 0.12, dur=1.6); put(wind(1.8, 0.6, 0.6), C("s08", "Y arriba") - 0.1, 0.12)
fx("pop", C("s08", "aerosilla") + 0.9, 0.35)
fx("riser", C("s08", "imaginó") - 0.2, 0.3)

for k in range(10): fx("pop", C("s08", "imaginó") + 0.3 + k * 0.24, 0.08, ((k % 5) - 2) * 0.4)
fx("arco", C("s08", "un gas") - 0.2, 0.3); fx("zumbido", C("s08", "un gas") - 0.1, 0.14, dur=3.0)
fx("boom", C("s08", "el stellarator.") - 0.05, 0.5)
fx("pop", C("s08", "Dos meses") + 0.1, 0.25); fx("cashregister", C("s08", "plata") + 0.3, 0.35)
fx("whoosh", C("s08", "Así") - 0.2, 0.25); fx("pop", C("s08", "todavía") - 0.2, 0.25)
fx("whoosh", C("s08", "Hasta en") - 0.3, 0.3); fx("pop", C("s08", "Soviética,") + 0.6, 0.3)
fx("riser", C("s08", "La mentira") - 1.2, 0.28); fx("boom", C("s08", "despertó"), 0.55)

# S09 — el legado
put(swell(2.6), ST["s09"] - 0.3, 0.2)
fx("pop", C("s09", "no tirar") - 0.1, 0.3); fx("pop", C("s09", "los equipos") - 0.1, 0.3)
fx("whoosh", C("s09", "El Instituto") - 0.3, 0.22)
fx("geiger", C("s09", "En mil") + 0.3, 0.1, dur=3.0); put(swell(3.0), C("s09", "encendió") - 0.6, 0.2); fx("boom", C("s09", "primer"), 0.4)
fx("whoosh", C("s09", "Y en mil") - 0.3, 0.22); fx("pop", C("s09", "INVAP,"), 0.3)
fx("boom", C("s09", "tecnología"), 0.35)
for ph in ["Perú,", "Argelia,", "Egipto", "Australia,", "Países"]: fx("whoosh", C("s09", ph) - 0.5, 0.14); fx("pop", C("s09", ph) + 0.3, 0.26)
fx("stamp", C("s09", "licitación"), 0.4)
for ph in ["Alemania,", "Francia", "Canadá."]: fx("knock", C("s09", ph), 0.3)
fx("riser", C("s09", "Y de esa") - 0.4, 0.28); fx("boom", C("s09", "satélites"), 0.4)

# S10 — la fusión hoy
fx("chisporroteo", C("s10", "encendió"), 0.25, dur=1.0)
pops(C("s10", "Setenta") - 0.2, 6, 0.25, 0.06)
fx("laser", C("s10", "California") - 0.4, 0.55); fx("boom", C("s10", "logró"), 0.35)
fx("pop", C("s10", "más energía") - 0.3, 0.3); fx("pop", C("s10", "más energía") + 0.2, 0.3)
fx("riser", C("s10", "muchísima") - 0.9, 0.3); fx("boom", C("s10", "muchísima") + 0.4, 0.5)
fx("whoosh", C("s10", "Y el gran") - 0.3, 0.22); fx("stamp", C("s10", "dos mil treinta") , 0.4)
put(wind(7.0, 0.4, 0.6), C("s10", "Mientras") - 0.3, 0.12)
fx("pop", C("s10", "ruinas") - 0.1, 0.25); fx("pop", C("s10", "ruinas") + 0.4, 0.22)
fx("pop", C("s10", "Bariloche") - 0.1, 0.35)

# S11 — cierre
put(swell(2.6), ST["s11"] - 0.3, 0.2); fx("knock", C("s11", "no entregó"), 0.3)
fx("pop", C("s11", "quién") - 0.2, 0.3)
fx("flash", C("s11", "Y la respuesta") - 0.1, 0.2); typing(C("s11", "Y la respuesta") + 0.1, 1.2, 0.07)
fx("riser", C("s11", "A veces,") - 1.0, 0.3); put(swell(3.4), C("s11", "A veces,") - 0.2, 0.25); fx("boom", C("s11", "verdadero."), 0.4)
fx("pop", C("s11", "Contanos"), 0.35); fx("celular", C("s11", "¿sabías"), 0.2)
fx("pop", C("s11", "suscribite,") - 0.2, 0.35)

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
raw = os.path.join(OUT, "pre11.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep11.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
