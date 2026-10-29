"""Mezcla del reel 01 (LA MAESTRA QUE IBA A CABALLO): narración + tres temas originales (ducking bajo la voz) + diseño
sonoro atado a las frases (el bañado, los cascos en el agua, el aula, la carta, el último audio, la tormenta, la búsqueda,
los detenidos, el galope del hallazgo, la marcha docente y la campana del final).
Salida: audio/mix/mezcla_reel01.wav (48 kHz estéreo, -14 LUFS integrados, pico -1,5 dBTP).
Música: «tema» del gancho a la carta (0 a 68 s); la noche del último audio queda sin música, solo el bañado; «búsqueda»
entra en el calendario y su pico cae en «tuvo que salir cabalgando», con el silencio después; «cierre» crece en la cita
del hijo y en la del gobernador, y se apaga con la campana de la escuela."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/reel01/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/reel01/words.json")))
ST, TOTAL, D, END = TL["starts"], TL["total"], TL["durations"], TL["end"]
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
    """tiempo absoluto de una frase (igual que at() en video/src/reel01/lib.ts)"""
    ws = W[seg]; tg = norm(phrase); found = -1
    for i in range(len(ws)):
        acc = ""
        for j in range(i, len(ws)):
            acc += norm(ws[j]["w"])
            if acc == tg or (j == i and acc.startswith(tg)):
                found += 1
                if found == n:
                    return ST[seg] + (ws[i]["s"] if which == "s" else ws[j]["e"])
                break
            if not tg.startswith(acc): break
    raise KeyError(f"{seg} {phrase} #{n}")
def CE(seg, phrase, n=0): return C(seg, phrase, n, "e")


N = int((TOTAL + 1) * SR)
voice = np.zeros(N, np.float32)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)

# ---------------- Narración ----------------
for k in sorted(ST):
    a = load(os.path.join(PUB, f"reel01/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Momentos (los mismos cortes que video/src/reel01/Reel.tsx) ----------------
TITLE = CE("r01", "país.") + 0.2
T_NOVOLVIO = C("r05", "No volvió.")
T_GALOPE = C("r07", "para avisar") - 0.1
T_QUIET = CE("r07", "cabalgando.") + 0.6
BOLTS = [C("r05", "tormentas") + 0.15, C("r05", "la falta de señal") + 0.2, C("r05", "el 15.") + 0.6]

# ---------------- Música ----------------
M = {k: load(os.path.join(PUB, f"reel01/music/{k}.mp3")) for k in ["tema", "busqueda", "cierre"]}
TARGET_RMS = 10 ** (-17 / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
REF = {k: rms(v[int(8 * SR): int(min(len(v) / SR - 6, 40) * SR)]) for k, v in M.items()}
def place(name, g0, g1, off=0.0, fin=0.05, fout=0.6, gain=1.0):
    src = M[name]; i0, i1 = int(g0 * SR), int(g1 * SR); o = int(off * SR)
    seg = src[o:o + (i1 - i0)].copy(); n = len(seg)
    seg *= TARGET_RMS / REF[name]
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain

B_START = 73.0   # el pico de «búsqueda» (41-42 s del tema) cae en «tuvo que salir cabalgando»
place("tema", 0.0, ST["r05"] + 0.3, 0.0, fin=0.02, fout=1.2)
place("busqueda", B_START, ST["r08"] + 2.5, 0.0, fin=1.5, fout=2.0)
place("cierre", ST["r08"] - 0.2, TOTAL, 0.0, fin=1.6, fout=2.5)

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
LOW, HIGH = 0.14, 0.6
g = HIGH - (HIGH - LOW) * env
def dip(a, b, level, ramp=0.4):
    global g
    i0, i1, r = int(a * SR), int(b * SR), int(ramp * SR)
    d = np.ones(N); d[i0:i1] = level
    d[max(0, i0 - r):i0] = np.linspace(1, level, i0 - max(0, i0 - r)); d[i1:i1 + r] = np.linspace(level, 1, len(d[i1:i1 + r]))
    g = g * d
dip(TITLE - 0.2, ST["r02"] - 0.3, 1.8, ramp=0.3)                              # el título
dip(C("r04", "«Una escuela fantasma, alumnos fantasmas».") - 0.3, ST["r05"], 0.55, 0.4)   # la cita: la música se retira
dip(T_QUIET - 0.4, ST["r08"] - 0.3, 1.6, ramp=0.4)                            # el silencio del hallazgo: queda la cola del tema
dip(C("r08", "«Que el Estado esté presente, hoy no lo está».") - 0.2, CE("r08", "«Que el Estado esté presente, hoy no lo está».") + 0.5, 1.25, 0.4)
dip(END - 0.2, TOTAL, 1.3, ramp=0.8)                                          # placa final
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SRC = {
    **{f[:-4]: f"reel01/sfx/{f}" for f in os.listdir(os.path.join(PUB, "reel01/sfx")) if f.endswith(".mp3")},
    "golpe": "ep13/sfx/impacto.mp3", "subida": "ep13/sfx/subida.mp3", "drone": "ep13/sfx/drone.mp3", "latido": "ep13/sfx/latido.mp3",
    "notif": "ep13/sfx/notif.mp3", "whoosh": "ep12/sfx/whoosh.mp3", "tormenta": "ep12/sfx/tormenta.mp3", "radio": "ep10/sfx/radio.mp3",
    "paginas": "ep10/sfx/paginas.mp3", "stamp": "ep03/sfx/stamp.mp3", "pop": "sfx/pop.mp3", "boom": "sfx/boom.mp3", "glitch": "sfx/glitch.mp3",
    "pluma": "ep14/sfx/pluma.mp3", "viento": "ep14/sfx/viento_noche.mp3", "resonancia": "ep14/sfx/resonancia.mp3", "crujido": "ep12/sfx/crujido.mp3",
}
SF = {}
for k, rel in SRC.items():
    a = load(os.path.join(PUB, rel)); SF[k] = a / (np.abs(a).max() + 1e-9) * 0.5
def put(a, t, gain=0.5):
    if a.ndim == 1: a = np.stack([a, a], axis=1)
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
def fx(name, t, gain=0.5, pan=0.0, dur=None, peak=None, rate=1.0, skip=0.0):
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
def bed(name, t, sec, gain=0.1, xf=0.6, fin=0.8):
    """cama en loop encadenada con fundidos"""
    src = SF[name]; L = len(src) / SR; left = sec; tt = t; first = True
    while left > 0.05:
        d = min(left, L); a = src[: int(d * SR)].copy(); n = len(a)
        fi, fo = (min(n, int(fin * SR)) if first else min(n, int(xf * SR))), min(n, int(xf * SR))
        a[:fi] *= np.linspace(0, 1, fi)[:, None]; a[-fo:] *= np.linspace(1, 0, fo)[:, None]
        put(a, tt, gain)
        if d >= left: break
        tt += d - xf; left -= d - xf; first = False

# 1-6 · el gancho, la búsqueda a caballo, los 2,5 km, la pregunta y el título
bed("banado", 0.0, TITLE + 0.3, 0.13, fin=0.05)
bed("cascos", 0.0, C("r01", "21 días") + 1.4, 0.24, fin=0.05)
fx("golpe", C("r01", "21 días") - 0.05, 0.22)
for k in range(6): fx("pop", C("r01", "21 días") + k * 0.15, 0.06, (k % 3 - 1) * 0.3)
fx("notif", C("r01", "21 días") + 0.9, 0.3)
bed("cascos", C("r01", "un policía") - 0.15, 2.4, 0.18, fin=0.2)
fx("radio", C("r01", "también") - 0.1, 0.1, 0.4, dur=1.2)
fx("whoosh", C("r01", "encontró") - 0.25, 0.2)
fx("resonancia", C("r01", "2,5 kilómetros") + 0.1, 0.16)
fx("whoosh", C("r01", "Y su muerte") - 0.2, 0.16)
fx("crujido", C("r01", "divide") + 0.05, 0.2, dur=1.6)
fx("subida", TITLE, 0.3, peak=3.31)
fx("golpe", TITLE + 0.02, 0.5); fx("boom", TITLE + 0.02, 0.35); fx("resonancia", TITLE + 0.2, 0.3)

# 7-11 · quién era, dónde, la única docente, la estancia y el recorrido
bed("banado", ST["r02"] - 0.2, 3.5, 0.1)
fx("whoosh", C("r02", "agosto") - 0.3, 0.16); fx("pop", C("r02", "agosto") + 0.2, 0.12)
fx("whoosh", C("r02", "Escuela Rural N.º 626") + 0.25, 0.14); fx("pop", C("r02", "Esquina"), 0.12)
fx("golpe", C("r02", "única") - 0.05, 0.16)
for ph in ["directora", "maestra", "cocinera"]: fx("stamp", C("r02", ph) - 0.02, 0.18)
for k in range(8): fx("pop", C("r02", "8 chicos") + k * 0.09, 0.07, (k / 3.5) - 1)
fx("whoosh", ST["r03"] - 0.35, 0.16); fx("pop", C("r03", "El Curupí"), 0.14)
fx("whoosh", C("r03", "Nanci viajaba") - 0.25, 0.14); fx("pop", C("r03", "campo"), 0.12)

# 12 · casi dos horas a caballo, con una baqueana, entre bañados y juncos; sin señal; la semana
T12 = C("r03", "y de ahí seguía") - 0.12
bed("banado", T12 - 0.2, ST["r04"] - T12, 0.12)
bed("cascos", T12, ST["r04"] - 0.4 - T12, 0.2)
bed("cascos", T12 + 0.37, ST["r04"] - 0.8 - T12, 0.12, fin=0.4)
fx("pop", C("r03", "dos horas") - 0.1, 0.1); fx("pop", C("r03", "con una baqueana"), 0.1)
fx("cascos", C("r03", "entre bañados") - 0.15, 0.18, 0.2, dur=2.0)                     # el plano bajo: los cascos cerca
fx("glitch", C("r03", "Sin señal.") + 0.02, 0.2, dur=0.6)
for k in range(5): fx("pop", C("r03", "Se quedaba") + 0.15 + k * 0.12, 0.08)

# 13-16 · el aula, la carta, el reclamo, el audio
bed("viento", ST["r04"] - 0.4, C("r04", "En una carta") - ST["r04"] + 0.3, 0.07)
fx("crujido", C("r04", "denunció") - 0.1, 0.12, dur=1.5)
fx("paginas", C("r04", "En una carta") - 0.2, 0.2, dur=1.4)
for ph in ["«totalmente abandonada»:", "sin agua potable", "con ratas", "y sin registros"]: fx("pluma", C("r04", ph) - 0.05, 0.16, dur=1.3)
fx("whoosh", C("r04", "El reclamo") - 0.3, 0.16); fx("paginas", C("r04", "El reclamo"), 0.12, dur=1.0)
fx("notif", C("r04", "Y en un audio") + 0.2, 0.22)
fx("drone", C("r04", "así:"), 0.12, dur=4.2)
fx("resonancia", C("r04", "«Una escuela fantasma, alumnos fantasmas».") - 0.05, 0.22)

# 17-19 · la noche del último audio, el calendario y la tormenta
bed("banado", ST["r05"] - 0.4, 4.6, 0.1)
bed("viento", ST["r05"] - 0.4, 7.5, 0.1)
fx("notif", C("r05", "mandó") + 0.05, 0.3)
for k in range(10): fx("pop", C("r05", "Tenía que volver") - 0.12 + k * 0.04, 0.05, (k / 4.5) - 1)
fx("pop", C("r05", "el 9.") + 0.05, 0.12)
fx("golpe", T_NOVOLVIO, 0.26); fx("stamp", T_NOVOLVIO + 0.05, 0.22)
fx("tormenta", C("r05", "tormentas") - 0.4, 0.3)
fx("tormenta", C("r05", "la falta de señal") - 0.2, 0.18, skip=3.0)
for b in BOLTS: fx("boom", b, 0.32); fx("crujido", b + 0.05, 0.08, dur=1.2)
fx("glitch", C("r05", "la falta de señal") + 0.4, 0.12, dur=0.5)
fx("golpe", C("r05", "el 15.") + 0.02, 0.2)

# 20-21 · la búsqueda y los detenidos
fx("helicoptero", ST["r06"] - 0.4, 0.26, -0.3)
fx("radio", C("r06", "unos 100 policías,") + 0.6, 0.1, 0.3, dur=1.3)
fx("cascos", C("r06", "caballos") - 0.1, 0.16, -0.4, dur=1.4)
fx("drone", C("r06", "drones") - 0.2, 0.14, 0.3, dur=1.6)
for ph in ["unos 100 policías,", "caballos", "perros", "drones", "helicópteros."]: fx("pop", C("r06", ph) + 0.15, 0.08)
bed("latido", C("r06", "Antes de encontrarla") - 0.2, C("r06", "Y la defensa") - C("r06", "Antes de encontrarla") + 2.6, 0.09)
fx("golpe", C("r06", "5 detenidos:") - 0.02, 0.26)
for ph in ["imputados por femicidio", "por homicidio simple", "por falso testimonio"]: fx("stamp", C("r06", ph) + 0.05, 0.16)
fx("stamp", C("r06", "presunción") - 0.05, 0.34); fx("golpe", C("r06", "presunción") - 0.05, 0.14)
fx("whoosh", C("r06", "Y la defensa") - 0.2, 0.1)

# 22-24 · el hallazgo: un bañado sin rastrillar, sin señal, el galope
bed("banado", ST["r07"] - 0.3, T_QUIET - ST["r07"] + 2.0, 0.1)
bed("viento", ST["r07"] - 0.3, ST["r08"] - ST["r07"] + 0.4, 0.1)
bed("cascos", ST["r07"] - 0.25, T_GALOPE - ST["r07"] + 0.2, 0.18, fin=0.3)
fx("radio", C("r07", "28 de octubre,") - 0.2, 0.1, 0.4, dur=1.4)
fx("glitch", C("r07", "Como no había señal") + 0.4, 0.18, dur=0.6)
fx("galope", T_GALOPE - 0.05, 0.36, 0.15)

# 25-31 · el debate y la pregunta
fx("golpe", C("r08", "femicidio.") - 0.02, 0.16)
fx("whoosh", C("r08", "Pero la discusión") - 0.15, 0.14)
fx("whoosh", C("r08", "Su familia y los gremios") - 0.25, 0.14); fx("golpe", C("r08", "dejó sola:") + 0.1, 0.18)
for ph in ["a horas de caballo", "sin señal,", "en una escuela"]: fx("pop", C("r08", ph), 0.1)
fx("resonancia", C("r08", "«Que el Estado esté presente, hoy no lo está».") - 0.1, 0.16)
fx("paginas", C("r08", "Su familia no descarta") - 0.15, 0.14, dur=1.0); fx("pop", C("r08", "Su familia no descarta") + 1.2, 0.12)
fx("marcha", C("r08", "Y los gremios hicieron paro") - 0.3, 0.24, dur=4.6)
for k in range(12): fx("pop", C("r08", "Y los gremios hicieron paro") + 0.3 + (k * 0.618 % 1) * 1.4, 0.05, ((k * 0.37) % 1) * 2 - 1)
fx("whoosh", ST["r09"] - 0.3, 0.14); fx("golpe", C("r09", "«un operativo muy fuerte».") - 0.02, 0.14)
fx("pop", C("r09", "¿Vos qué pensás?"), 0.14)
fx("pop", C("r09", "¿Fue un crimen") - 0.05, 0.14, -0.2); fx("pop", C("r09", "o el Estado") - 0.05, 0.14, 0.2)
fx("pop", C("r09", "Te leo") - 0.1, 0.12)

# 32 · la placa final: el bañado al atardecer y la campana de la escuela
bed("banado", END - 0.2, TOTAL - END + 0.2, 0.15)
fx("campana", END + 0.35, 0.34)

# ---------------- Suma y master (loudnorm lineal en dos pasadas) ----------------
act = env[: N] > 0.5
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print("voz (hablando) dB:", round(db(voice[act]), 1), "| música bajo voz dB:", round(db(music[act].mean(axis=1)), 1),
      "| música en pausas dB:", round(db(music[~act].mean(axis=1)), 1), "| sfx pico:", round(float(np.abs(sfx).max()), 2))
sfx *= (1 - 0.3 * env[:, None]).astype(np.float32)
mix = music + sfx * 0.9
hop = SR // 2; bg = mix.mean(axis=1)
for i in range(0, int(TOTAL * SR) - hop, hop):
    if act[i:i + hop].mean() < 0.6: continue
    v, b = db(voice[i:i + hop]), db(bg[i:i + hop])
    if b > v - 9: print(f"  fondo alto {i / SR:7.1f}s  voz {v:5.1f}  fondo {b:5.1f}  (música {db(music[i:i + hop].mean(axis=1)):5.1f}, efectos {db(sfx[i:i + hop].mean(axis=1) * 0.9):5.1f})")
mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]
peak = np.abs(mix).max(); print("pico previo", round(float(peak), 3))
mix = mix / max(peak, 1e-9) * 0.89
raw = os.path.join(OUT, "pre_reel01.f32"); mix.astype(np.float32).tofile(raw)
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_reel01.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
