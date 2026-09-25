"""Mezcla del episodio 2 (El robo del siglo): narración + música por capítulo (con ducking) + efectos.
Cada capítulo es un "track": la música cambia en las tarjetas de vinilo, con un scratch de púa.
Salida: audio/mix/mezcla_ep02.wav (48 kHz estéreo, -14 LUFS)."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/ep02/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/ep02/words.json")))
ST, TOTAL = TL["starts"], TL["total"]
PUB = os.path.join(ROOT, "video/public")
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
CARD_IN = 1.3  # igual que RoboDelSiglo.tsx

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
    a = load(os.path.join(PUB, f"ep02/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música: un tema por capítulo ----------------
TRACKS = ["r2_tension", "km_surf_inspector", "km_dead_drop", "km_hotrock", "km_welcome_to_the_show", "km_cold_funk", "km_raw", "km_sax_rock_and_roll"]
M = {m: load(os.path.join(PUB, f"ep02/music/{m}.mp3")) for m in TRACKS}
TARGET_RMS = 10 ** (-16 / 20)

def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)

def place(name, g0, g1, off, fin=0.05, fout=0.35, gain=1.0):
    """coloca el tema entre g0 y g1 (segundos globales), desde 'off' en el archivo, nivelado a -16 dBFS RMS"""
    src = M[name]; i0, i1 = int(g0 * SR), int(g1 * SR); o = int(off * SR)
    seg = src[o:o + (i1 - i0)].copy(); n = len(seg)
    seg *= TARGET_RMS / rms(seg[: min(n, 30 * SR)])
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain

card = {k: ST[k] - CARD_IN for k in ST}
t_title = C("s01", "siglo.", 0, "e") + 0.15
DROP = 0.28  # la púa cae: el tema nuevo entra un instante después del scratch
place("r2_tension", 0.0, t_title + 0.05, 0.0, fin=0.6, fout=0.05)
place("km_surf_inspector", t_title, card["s04"] + 0.1, 0.0, fin=0.02, fout=0.15, gain=1.05)
place("km_dead_drop", card["s04"] + DROP, card["s05"] + 0.1, 0.0, fout=0.15)
place("km_hotrock", card["s05"] + DROP, card["s06"] + 0.1, 0.0, fout=0.15)
place("km_welcome_to_the_show", card["s06"] + DROP, card["s07"] + 0.1, 0.0, fout=0.15)
place("r2_tension", card["s07"] + DROP, card["s08"] + 0.1, 28.0, fout=0.15, gain=1.05)
place("km_cold_funk", card["s08"] + DROP, card["s09"] + 0.1, 0.0, fout=0.15)
place("km_raw", card["s09"] + DROP, card["s10"] + 0.1, 0.0, fout=0.15, gain=0.9)
place("km_sax_rock_and_roll", card["s10"] + DROP, TOTAL, 0.0, fout=3.2)

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

# "Silencio." antes de que entre el Halcón
dip(C("s08", "Pasaron") - 0.2, C("s08", "entró.") - 0.25, 0.45, ramp=0.6)
# "del otro lado": la gente que perdió sus ahorros
dip(C("s11", "Pero del") - 0.3, C("s11", "Porque") - 0.1, 0.3, ramp=0.7)
# el título y el final respiran más fuerte
dip(t_title, card["s02"] - 0.1, 1.45, ramp=0.15)
dip(C("s11", "video.", 0, "e") + 0.3, TOTAL, 1.4, ramp=0.8)
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SF = {}
for d in ["sfx", "ep02/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        a = load(os.path.join(PUB, d, f))
        SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5  # pico -6 dBFS
def fx(name, t, gain=0.5, pan=0.0):
    a = SF[name]; i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41
    sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41

# tarjetas de vinilo: púa + scratch
for k in ["s02", "s03", "s04", "s05", "s06", "s07", "s08", "s09", "s10"]:
    fx("scratch", card[k] - 0.05, 0.5)
fx("whoosh", ST["s11"] - 0.55, 0.45)

# S01 — cold open
fx("pop", C("s01", "trece"), 0.45); fx("pop", C("s01", "Mediodía."), 0.4)
fx("whoosh", C("s01", "Acassuso,") - 0.2, 0.3); fx("pop", C("s01", "banco."), 0.5)
fx("sirena", C("s01", "trescientos") - 0.3, 0.3, -0.3); fx("sirena", C("s01", "trescientos") + 0.5, 0.22, 0.4)
fx("glitch", C("s01", "francotiradores"), 0.25); fx("pop", C("s01", "cámaras"), 0.35)
fx("boom", C("s01", "nadie."), 0.45)
fx("whoosh", C("s01", "Porque") - 0.1, 0.3); fx("drill", C("s01", "piso.") - 0.2, 0.3)
fx("boom", C("s01", "tiro."), 0.4)
fx("typewriter", C("s01", "Esta es"), 0.35)
fx("riser", t_title - 2.0, 0.45); fx("powerchord", t_title - 0.02, 0.85); fx("boom", t_title, 0.7)
# S02 — la idea
fx("pop", C("s02", "pregunta."), 0.4); fx("whoosh", C("s02", "humo."), 0.3)
for i, p in enumerate(["artista", "profesor", "cultivaba"]): fx("pop", C("s02", p), 0.42, (i - 1) * 0.3)
fx("glitch", C("s02", "pleno viaje,"), 0.3); fx("whoosh", C("s02", "¿cómo") - 0.2, 0.3)
fx("typewriter", C("s02", "La respuesta:"), 0.3)
for p in ["sin armas", "sin violencia...", "salida"]: fx("pop", C("s02", p), 0.45)
fx("boom", C("s02", "abajo."), 0.6)
# S03 — la banda
fx("boom", C("s03", "banda."), 0.45)
for p in ["Beto", "Sebastián", "Mario", "El Paisa,", "Y un par"]: fx("pop", C("s03", p), 0.5)
fx("boom", C("s03", "nunca") + 0.1, 0.55)
# S04 — el túnel
fx("whoosh", C("s04", "desagüe") - 0.3, 0.3)
fx("drill", C("s04", "Durante"), 0.35); fx("drill", C("s04", "cavando"), 0.4, 0.3)
fx("boom", C("s04", "bóveda."), 0.45); fx("pop", C("s04", "cajas"), 0.45)
fx("glitch", C("s04", "video"), 0.3)
fx("cashregister", C("s04", "Dólares."), 0.4); fx("pop", C("s04", "Joyas."), 0.45); fx("pop", C("s04", "Ahorros"), 0.4)
# S05 — el golpe
fx("squeak", C("s05", "Entra"), 0.35, -0.4); fx("squeak", C("s05", "Entra otro"), 0.35, 0.4)
fx("boom", C("s05", "Sacan"), 0.55); fx("pop", C("s05", "veintitrés"), 0.4)
fx("squeak", C("s05", "juguete."), 0.5); fx("pop", C("s05", "juguete.") + 0.35, 0.45)
fx("sirena", C("s05", "patrulleros.") - 0.4, 0.4, -0.3); fx("sirena", C("s05", "patrulleros.") + 0.4, 0.3, 0.3)
fx("helicoptero", C("s05", "Llega") - 0.2, 0.5); fx("glitch", C("s05", "Francotiradores"), 0.3)
fx("boom", C("s05", "Trescientos"), 0.5)
fx("riser", C("s05", "el hombre") - 2.0, 0.4); fx("powerchord", C("s05", "el hombre") - 0.1, 0.7)
# S06 — el show del traje gris
fx("telefono", C("s06", "teléfono") - 0.1, 0.45)
for i, p in enumerate(["Tranquilo.", "Amable.", "Sin apuro."]): fx("pop", C("s06", p), 0.45, (i - 1) * 0.35)
for i in range(5): fx("pop", C("s06", "Pidió") + 0.35 + i * 0.12, 0.3, (i - 2) * 0.2)
fx("pop", C("s06", "Y hasta"), 0.45)
fx("sirena", C("s06", "Afuera,") - 0.1, 0.25)
fx("whoosh", C("s06", "Pero en") + 0.1, 0.4); fx("powerchord", C("s06", "show."), 0.55)
fx("whoosh", C("s06", "abajo,") - 0.3, 0.35)
fx("squeak", C("s06", "Una. Tras"), 0.4); fx("squeak", C("s06", "Tras"), 0.4, -0.3); fx("squeak", C("s06", "Tras", 1), 0.4, 0.3)
fx("cashregister", C("s06", "Ciento"), 0.45); fx("billetes", C("s06", "Ciento") + 0.2, 0.45)
# S07 — la fuga
fx("billetes", C("s07", "cargaron"), 0.4); fx("whoosh", C("s07", "bajaron"), 0.3)
fx("motor", C("s07", "motor") - 0.1, 0.45); fx("pop", C("s07", "Ingeniero."), 0.4)
fx("motor", C("s07", "Y así,"), 0.4); fx("motor", C("s07", "Y así,") + 1.0, 0.35, 0.3)
fx("sirena", C("s07", "trescientos"), 0.2)
fx("whoosh", C("s07", "salieron"), 0.35); fx("pop", C("s07", "camioneta"), 0.45)
fx("pop", C("s07", "Subieron."), 0.5); fx("motor", C("s07", "Arrancaron."), 0.6)
fx("powerchord", C("s07", "Chau."), 0.75)
# S08 — el cartel
fx("boom", C("s08", "entró.") - 0.3, 0.8); fx("glitch", C("s08", "entró.") - 0.3, 0.3)
for i in range(3): fx("pop", C("s08", "Encontró", i) + 0.2, 0.45)
fx("typewriter", C("s08", "cartel:"), 0.35)
fx("boom", C("s08", "rastro."), 0.6)
# S09 — los celos
fx("billetes", C("s09", "diecinueve") - 0.5, 0.45); fx("cashregister", C("s09", "diecinueve") + 0.9, 0.4)
fx("boom", C("s09", "perfecto."), 0.5); fx("scratch", C("s09", "Casi."), 0.7); fx("glitch", C("s09", "Casi."), 0.3)
fx("pop", C("s09", "atrapó"), 0.4); fx("pop", C("s09", "atraparon..."), 0.35); fx("boom", C("s09", "celos."), 0.6)
fx("pop", C("s09", "convencida"), 0.35); fx("pop", C("s09", "contó"), 0.45)
for p, n in [("Nombres.", 0), ("Direcciones.", 0), ("Todo.", 1)]: fx("typewriter", C("s09", p, n), 0.3)
fx("boom", C("s09", "cayeron"), 0.45)
for i in range(5): fx("pop", C("s09", "cayeron") + i * 0.14, 0.3, (i - 2) * 0.3)
# S10 — bonus track
fx("boom", ST["s10"] + 0.3, 0.55); fx("pop", C("s10", "entre"), 0.35)
fx("boom", C("s10", "veintiuno."), 0.5)
fx("powerchord", C("s10", "libres."), 0.6)
fx("pop", C("s10", "acá:"), 0.45); fx("pop", C("s10", "veinte"), 0.4)
fx("boom", C("s10", "estrenó"), 0.45); fx("pop", C("s10", "Guillermo"), 0.4, 0.2); fx("pop", C("s10", "Diego"), 0.4, 0.5)
fx("cashregister", C("s10", "dos millones") - 0.3, 0.4)
fx("typewriter", C("s10", "¿Y quién"), 0.35)
fx("riser", C("s10", "mismísimo") - 1.6, 0.4); fx("powerchord", C("s10", "mismísimo") - 0.1, 0.6); fx("boom", C("s10", "Araujo.") + 0.35, 0.55)
# S11 — cierre
for p in ["Sin tiros.", "Sin heridos.", "Con un"]: fx("pop", C("s11", p), 0.45)
fx("pop", C("s11", "banco..."), 0.45); fx("boom", C("s11", "ni abajo"), 0.5)
fx("whoosh", C("s11", "Si te") - 0.2, 0.3); fx("pop", C("s11", "suscribite,") + 0.3, 0.6)
fx("powerchord", C("s11", "video.", 0, "e") + 0.3, 0.6)

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
raw = os.path.join(OUT, "pre2.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_ep02.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
