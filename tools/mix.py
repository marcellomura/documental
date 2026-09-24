"""Mezcla final: narración + música (con ducking) + efectos, sincronizados con words.json.
Salida: audio/mix/mezcla.wav (48 kHz estéreo, normalizada a -14 LUFS)."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/words.json")))
ST, DUR, TOTAL = TL["starts"], TL["durations"], TL["total"]
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

N = int((TOTAL + 1) * SR)
voice = np.zeros(N, np.float32)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)

# ---------------- Narración ----------------
for k in sorted(ST):
    a = load(os.path.join(ROOT, f"video/public/narracion/{k}.wav"), stereo=False)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- Música ----------------
M = {m: load(os.path.join(ROOT, f"video/public/music/{m}.mp3")) for m in ["m1_intro", "m2_tension", "m3_cierre"]}
def place_music(name, g0, g1, off, fin=0.8, fout=1.0, gain=1.0):
    src = M[name]; i0, i1 = int(g0 * SR), int(g1 * SR); o = int(off * SR)
    seg = src[o:o + (i1 - i0)].copy(); n = len(seg)
    env = np.ones(n, np.float32)
    fi, fo = int(fin * SR), int(fout * SR)
    if fi: env[:fi] = np.linspace(0, 1, min(fi, n))[:min(fi, n)]
    if fo: env[-fo:] *= np.linspace(1, 0, min(fo, n))
    music[i0:i0 + n] += seg * env[:, None] * gain

s06_card = ST["s06"] - 0.9
spoiler = cue("s07", "Spoiler:")
place_music("m1_intro", 0.0, s06_card + 0.3, 0.0, fin=0.6, fout=1.4)
place_music("m2_tension", s06_card - 0.2, ST["s07"] - 0.5, 0.0, fin=0.3, fout=0.9, gain=1.15)
m2_used = (ST["s07"] - 0.5) - (s06_card - 0.2)
place_music("m3_cierre", ST["s07"] - 0.8, spoiler + 0.04, 107.0, fin=0.6, fout=0.04)
resume = cue("s07", "no terminó") - 0.1
place_music("m2_tension", resume, ST["s10"] - 0.2, m2_used + 1.0, fin=0.2, fout=1.2, gain=1.15)
place_music("m3_cierre", ST["s10"] - 0.5, TOTAL, 0.0, fin=1.0, fout=3.0)

# ---------------- Ducking ----------------
def follower(x, att=0.015, rel=0.35):
    # envolvente por bloques de 10 ms con ataque/relajación exponenciales
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
LOW, HIGH = 0.20, 0.52  # ganancia de música bajo la voz / en pausas
g = HIGH - (HIGH - LOW) * env
# pozo de silencio para "39 muertos"
a, b = cue("s08", "Treinta") - 0.3, cue("s08", "De la Rúa") - 0.2
i0, i1 = int(a * SR), int(b * SR)
dip = np.ones(N); ramp = int(0.4 * SR)
dip[i0:i1] = 0.25; dip[i0 - ramp:i0] = np.linspace(1, 0.25, ramp); dip[i1:i1 + ramp] = np.linspace(0.25, 1, ramp)
g = g * dip
music *= g[:, None].astype(np.float32)

# ---------------- Efectos ----------------
SF = {}
for f in os.listdir(os.path.join(ROOT, "video/public/sfx")):
    a = load(os.path.join(ROOT, "video/public/sfx", f))
    a = a / (np.abs(a).max() + 1e-9) * 0.5  # pico -6 dBFS
    SF[f[:-4]] = a
def fx(name, t, gain=0.5, pan=0.0):
    if t is None: return
    a = SF[name]; i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41
    sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41

C = cue
# transiciones de barrido (mismas ventanas que Documental.tsx)
for sid, pre in [("s02", .25), ("s03", .25), ("s04", .25), ("s09", .3), ("s10", .3), ("s11", .3), ("s12", .3)]:
    fx("whoosh", ST[sid] - pre - 0.3, 0.42)

# S01
fx("billetes", C("s01", "dólares"), 0.45)
for i, p in enumerate(["Adentro", "lata", "En el freezer", "Debajo"]): fx("pop", C("s01", p), 0.5, (i - 1.5) * 0.3)
fx("typewriter", C("s01", "INDEC,") - 0.05, 0.35)
fx("billetes", C("s01", "doscientos") - 0.1, 0.5); fx("billetes", C("s01", "millones"), 0.4)
fx("cashregister", C("s01", "sistema.", 0, "e") - 0.2, 0.42)
fx("whoosh", C("s01", "Es más de cinco") - 0.2, 0.35); fx("pop", C("s01", "veces"), 0.5)
fx("whoosh", C("s01", "Hace") - 0.2, 0.35); fx("boom", C("s01", "aprobó"), 0.45)
fx("whoosh", C("s01", "Pero la verdadera") - 0.2, 0.3); fx("boom", C("s01", "¿por qué"), 0.55)
fx("glitch", C("s01", "no sirve"), 0.28)
# S02
for i in range(4): fx("pop", C("s02", "contar") - 0.2 + i * 0.25, 0.3, (i % 2) * 0.6 - 0.3)
fx("glitch", C("s02", "trece"), 0.2); fx("whoosh", C("s02", "desaparecieron."), 0.3)
t_title = C("s02", "rota.", 0, "e") + 0.25
fx("riser", t_title - 2.05, 0.5); fx("boom", C("s02", "rota."), 0.55); fx("boom", t_title, 0.95)
# S03
fx("glitch", C("s03", "trece"), 0.22)
fx("whoosh", C("s03", "En mil novecientos") - 0.2, 0.3)
for p in ["mil novecientos setenta,", "ochenta y tres,", "ochenta y cinco,", "noventa y dos,"]: fx("pop", C("s03", p), 0.45)
for p in ["dos ceros:", "cuatro más:", "tres más:", "otros cuatro:"]: fx("glitch", C("s03", p), 0.18)
fx("boom", C("s03", "Cuatro monedas"), 0.4)
# S04
fx("pop", C("s04", "Versión"), 0.5)
fx("pop", C("s04", "gasta"), 0.35, -0.3); fx("pop", C("s04", "recauda,"), 0.35, 0.3)
fx("billetes", C("s04", "imprimiendo"), 0.55); fx("billetes", C("s04", "imprimiendo") + 0.7, 0.4)
fx("billetes", C("s04", "hay más"), 0.45)
fx("glitch", C("s04", "Y los precios"), 0.3); fx("cashregister", C("s04", "suben."), 0.4)
fx("boom", C("s04", "inflación."), 0.45)
fx("pop", C("s04", "gastar."), 0.4, -0.4); fx("pop", C("s04", "ahorrar."), 0.45, 0.4)
# S05
fx("riser", ST["s05"] - 0.85 - 1.9, 0.4); fx("boom", ST["s05"] - 0.8, 0.8)
fx("whoosh", C("s05", "El ministro") - 0.25, 0.35)
fx("typewriter", C("s05", "El que apuesta"), 0.35)
fx("glitch", C("s05", "Días"), 0.28); fx("boom", C("s05", "treinta"), 0.7)
fx("pop", C("s05", "perdieron."), 0.35); fx("pop", C("s05", "Ganaron."), 0.55)
fx("boom", C("s05", "aprendieron."), 0.35)
# S06
fx("riser", C("s06", "En mil") - 2.0, 0.45); fx("boom", C("s06", "En mil") - 0.05, 0.85)
fx("glitch", C("s06", "Solo"), 0.3); fx("boom", C("s06", "doscientos") - 0.3, 0.55)
fx("pop", C("s06", "cobrás"), 0.4); fx("glitch", C("s06", "vale"), 0.3)
fx("riser", C("s06", "ciento.", 1, "e") - 2.1, 0.45); fx("boom", C("s06", "ciento.", 1, "e") - 0.15, 0.95)
# S07
fx("whoosh", ST["s07"] - 0.8, 0.45)
fx("pop", C("s07", "Domingo"), 0.3)
fx("pop", C("s07", "un peso"), 0.45, -0.4); fx("pop", C("s07", "un dólar."), 0.45, 0.4); fx("boom", C("s07", "Uno a uno."), 0.45)
fx("whoosh", C("s07", "La inflación"), 0.3); fx("billetes", C("s07", "Depositaron"), 0.5)
fx("glitch", spoiler - 0.02, 0.95); fx("boom", spoiler, 0.55)
# S08
fx("riser", ST["s08"] - 0.85 - 1.9, 0.35); fx("boom", ST["s08"] - 0.8, 0.8)
for i, (p, n) in enumerate([("endeudó.", 0), ("endeudó.", 1), ("endeudó", 2), ("más.", 0)]): fx("pop", C("s08", p, n), 0.45 + i * 0.05)
fx("whoosh", C("s08", "A fines") - 0.2, 0.3)
fx("pop", C("s08", "Y el primero"), 0.5); fx("boom", C("s08", "corralito:"), 0.5); fx("cashregister", C("s08", "doscientos"), 0.35)
fx("whoosh", C("s08", "Tu plata") - 0.2, 0.3); fx("boom", C("s08", "ya no"), 0.35)
fx("glitch", C("s08", "Diecinueve"), 0.35); fx("boom", C("s08", "estalló."), 1.0)
fx("glitch", C("s08", "Saqueos,"), 0.3); fx("cacerolazo", C("s08", "cacerolazos,") - 0.1, 0.75); fx("boom", C("s08", "represión."), 0.5)
fx("helicoptero", C("s08", "helicóptero.") - 0.5, 0.9); fx("helicoptero", C("s08", "helicóptero.") + 0.45, 0.55, 0.5)
for i in range(5): fx("pop", C("s08", "En menos") + 0.2 + i * 0.3, 0.45, (i - 2) * 0.3)
fx("boom", C("s08", "cinco"), 0.45)
# S09
fx("typewriter", C("s09", "El que depositó"), 0.3)
fx("boom", C("s09", "No pasó."), 0.9)
fx("glitch", C("s09", "uno cuarenta,") - 0.3, 0.28); fx("glitch", C("s09", "casi cuatro.") - 0.3, 0.3)
fx("whoosh", C("s09", "Una generación") - 0.2, 0.3); fx("boom", C("s09", "decreto."), 0.7)
fx("boom", C("s09", "la confianza") + 0.2, 0.8); fx("glitch", C("s09", "la confianza") + 0.2, 0.35)
# S10
fx("typewriter", C("s10", "No confíes"), 0.32); fx("typewriter", C("s10", "No confíes", 1), 0.32)
fx("whoosh", C("s10", "¿Entonces?") - 0.2, 0.3); fx("billetes", C("s10", "Comprás"), 0.5); fx("pop", C("s10", "guardás"), 0.3)
fx("whoosh", C("s10", "En dos mil once,") - 0.2, 0.3); fx("boom", C("s10", "cepo."), 0.75)
fx("whoosh", C("s10", "Y con él,") - 0.2, 0.3); fx("pop", C("s10", "cueva"), 0.35); fx("pop", C("s10", "arbolito."), 0.35)
fx("whoosh", C("s10", "Para dos") - 0.2, 0.3)
zoo = ["oficial,", "blue,", "MEP,", "contado", "tarjeta,", "soja...", "Catar", "Coldplay."]
for i, p in enumerate(zoo): fx("pop", C("s10", p) - 0.1, 0.42, ((i % 5) - 2) * 0.3)
for i in range(7): fx("pop", C("s10", "Coldplay.") + 0.45 + i * 0.13, 0.3, ((i % 5) - 2) * 0.3)
fx("cashregister", C("s10", "quince"), 0.35); fx("whoosh", C("s10", "mismo") - 0.1, 0.4)
# S11
fx("boom", C("s11", "quinientos."), 0.45)
fx("whoosh", C("s11", "La inflación") - 0.2, 0.3)
fx("pop", C("s11", "doscientos") - 0.3, 0.4); fx("pop", C("s11", "treinta") - 0.2, 0.4)
fx("pop", C("s11", "levantó.") - 0.3, 0.55)
fx("whoosh", C("s11", "Y ahora,") - 0.2, 0.3); fx("billetes", C("s11", "vuelvan"), 0.4)
fx("pop", C("s11", "Pero mirá"), 0.55); fx("glitch", C("s11", "no bajaron."), 0.3); fx("boom", C("s11", "Subieron."), 0.9)
# S12
for p in ["Trece", "Cinco", "Un corralito."]: fx("boom", C("s12", p), 0.4)
fx("whoosh", C("s12", "La pregunta") - 0.2, 0.3); fx("glitch", C("s12", "La pregunta", 1), 0.25)
fx("pop", C("s12", "Contanos"), 0.5); fx("pop", C("s12", "suscribite.") + 0.2, 0.7)
fx("riser", C("s12", "Porque en el") - 2.0, 0.4); fx("boom", C("s12", "Porque en el"), 0.7)
fx("typewriter", C("s12", "nota"), 0.45); fx("typewriter", C("s12", "nota") + 1.6, 0.35)
fx("whoosh", C("s12", "gomón") - 0.5, 0.35)
fx("boom", C("s12", "alcantarillas.", 0, "e") + 0.4, 0.8)

# ---------------- Estadísticas de balance ----------------
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
raw = os.path.join(OUT, "pre.f32"); mix.astype(np.float32).tofile(raw)
# loudnorm en dos pasadas a -14 LUFS / -1.5 dBTP
m = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw)
print("medido:", js["input_i"], "LUFS ->", dst)
