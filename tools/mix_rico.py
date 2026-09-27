"""Mezcla de "¿Argentina fue el país más rico del mundo?": python3 tools/mix_rico.py -> audio/mix/mezcla_rico.wav
Narración + 4 temas con ducking y cruces por capítulo + efectos sincronizados a las palabras y a cada corte. Sale a -14 LUFS."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = "rico"
SR = 48000
TL = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/timeline.json")))
W = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/words.json")))
GAPS = json.load(open(os.path.join(ROOT, "guion/rico_gaps.json")))
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
SEGS, TOTAL = TL["segs"], TL["total"]

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

def c(seg, phrase, n=0):
    ws = W[seg]; tg = [norm(x) for x in phrase.split()]; found = -1
    for i in range(len(ws) - len(tg) + 1):
        if all(norm(ws[i + k]["w"]) == t for k, t in enumerate(tg)):
            found += 1
            if found == n: return SEGS[seg]["at"] + ws[i]["s"]
    raise KeyError(f"{seg} {phrase}")
at = lambda s: SEGS[s]["at"]
end = lambda s: SEGS[s]["at"] + SEGS[s]["dur"]
prev = lambda s: "s%02d" % (int(s[1:]) - 1)
gap = lambda s: end(prev(s)) + 0.15

def load(path, stereo=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

N = int((TOTAL + 0.5) * SR)
voice = np.zeros(N, np.float32); music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)
for sid, s in SEGS.items():
    a = load(os.path.join(ROOT, f"audio/{EP}/final/{sid}.wav"), stereo=False)
    i = int(s["at"] * SR); voice[i:i + len(a)] += a[: N - i]

MUS = os.path.join(ROOT, "video/public/rico/music")
def place(name, t0, t1, fin=0.8, fout=1.2, offset=0.0, gain=1.0):
    m = load(os.path.join(MUS, f"{name}.mp3"))
    i0, n = int(t0 * SR), int((t1 - t0) * SR)
    m = m[int(offset * SR):]
    if len(m) < n: m = np.concatenate([m] * (n // len(m) + 1))
    m = m[:n]
    env = np.ones(n); a, b = int(fin * SR), int(fout * SR)
    env[:a] = np.linspace(0, 1, a); env[-b:] = np.linspace(1, 0, b)
    music[i0:i0 + n] += m * env[:, None] * gain

SF = {}
for d in ["video/public/sfx", "video/public/ep05/sfx"]:
    for f in os.listdir(os.path.join(ROOT, d)):
        a = load(os.path.join(ROOT, d, f)); SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
def fx(name, t, gain=0.5):
    a = SF[name]; i = int(max(t, 0) * SR); n = min(len(a), N - i)
    sfx[i:i + n] += a[:n] * gain

# ---------- música: un color por bloque ----------
place("m2_tension", 0, gap("s02") + 0.3, fin=0.05, fout=0.4)                 # frase y pregunta
place("m1_belle", gap("s02") + 0.1, at("s04") + 0.4, fin=0.1, fout=0.8)       # título, Maddison, número uno
place("m2_tension", at("s04") - 0.5, gap("s05") + 0.3, offset=40, fout=0.5)   # la revisión
place("m1_belle", gap("s05") + 0.1, end("s06") + 0.5, fin=0.2, offset=30)     # la máquina de 1900
place("m3_caida", at("s07") - 0.4, end("s08") + 0.8, fin=1.2, offset=0)       # ¿qué nos pasó? + la caída
place("m2_tension", at("s09") - 0.5, end("s10") + 0.8, offset=70)             # por qué + Kuznets
place("m3_caida", gap("s11"), at("s12") + 0.6, offset=50, fin=0.6)            # veredicto
place("m4_final", at("s12") - 0.4, TOTAL, fin=0.6, fout=2.5, offset=10)       # esperanza y cierre

# ---------- cortes (mismos que Rico.tsx) ----------
k = lambda s, p, pre=0.12: c(s, p) - pre
cuts = [k("s01", "Y no es"), k("s01", "Pero hay"), gap("s02"), at("s02") + 0.2, k("s02", "Pero en"), at("s03") - 0.3, k("s03", "El dato recorrió"),
        at("s04") - 0.3, k("s04", "Y hay otro"), gap("s05"), at("s05") + 0.2, k("s05", "llenos de"), k("s05", "Los capitales"), k("s05", "Con los"),
        k("s05", "En mil novecientos trece,"), at("s06") - 0.3, k("s06", "Mientras las"), at("s07") - 0.35, gap("s08"), at("s08") + 0.2, k("s08", "En mil"),
        k("s08", "Y en el ranking"), at("s09") - 0.3, at("s10") - 0.4, gap("s11"), at("s11") + 0.2, at("s12") - 0.35,
        k("s01", "la misma base"), k("s02", "Groningen,", 0.3), k("s04", "O sea,", 0.2), k("s04", "Entonces, ¿es"), k("s05", "casi uno", 0.3),
        k("s05", "Somos el"), k("s05", "Y en París"), k("s06", "El PBI"), k("s06", "En mil novecientos siete,"), k("s06", "Uno de"), k("s06", "Y en mil"),
        k("s07", "Y acá"), k("s09", "Uno:"), k("s09", "Dos:"), k("s09", "Tres:"), k("s09", "Y cuatro:"), k("s09", "Ningún factor"), k("s11", "El mito"),
        k("s12", "La historia"), k("s12", "Si este")]
for t in cuts: fx("whoosh", t - 0.22, 0.3)

# capítulos y título: subida + golpe + campanada
for s in ["s02", "s05", "s08", "s11"]:
    fx("riser", gap(s) - 1.4, 0.3); fx("boom", gap(s) + 0.05, 0.6); fx("campanada", gap(s) + 0.3, 0.18)

# ---------- efectos puntuales ----------
fx("typewriter", at("s01") + 0.1, 0.18)
for p in ["tu tío", "el taxista", "en redes:"]: fx("pop", c("s01", p) - 0.05, 0.45)
for j in range(14): fx("pop", c("s01", "en redes:") + 0.35 + j * 0.07, 0.12)
fx("boom", c("s01", "dogma"), 0.5)
fx("boom", c("s01", "¿Es verdad?"), 0.55); fx("glitch", c("s01", "también dice"), 0.3)
fx("typewriter", c("s01", "Fuimos a buscar"), 0.2)
fx("pop", c("s02", "PBI per"), 0.45); fx("billetes", c("s02", "todo lo"), 0.3); fx("pop", c("s02", "dividido"), 0.4)
fx("typewriter", c("s02", "Pero en") + 0.2, 0.22); fx("pop", c("s02", "Angus"), 0.45)
for j, p in enumerate(["Historiadores,", "periodistas…", "presidentes."]):
    try: fx("pop", c("s02", p) - 0.05, 0.45)
    except KeyError: pass
fx("pop", at("s03") + 0.1, 0.4); fx("pop", c("s03", "En mil ochocientos"), 0.45)
for j in range(6): fx("pop", c("s03", "la Argentina tenía") + j * 0.12, 0.2)
fx("riser", c("s03", "Número uno.") - 1.2, 0.3); fx("boom", c("s03", "Número uno."), 0.7); fx("cashregister", c("s03", "Número uno.") + 0.1, 0.3)
for p in ["El dato recorrió", "discursos", "redes,"]: fx("pop", c("s03", p), 0.45)
fx("glitch", c("s03", "Pero dos"), 0.35)
fx("typewriter", c("s04", "corrigió"), 0.25); fx("whoosh", c("s04", "se reacomodó."), 0.35); fx("boom", c("s04", "al sexto."), 0.6)
fx("pop", c("s04", "cuarenta y un"), 0.45); fx("pop", c("s04", "entre los que"), 0.4); fx("boom", c("s04", "una locura."), 0.45)
fx("typewriter", at("s05") + 0.1, 0.25)
fx("tren", c("s05", "Los capitales") + 0.2, 0.25)
for p in ["el trigo,", "el maíz", "la carne."]: fx("pop", c("s05", p), 0.4)
fx("pop", c("s05", "En mil novecientos trece,"), 0.4)
fx("pop", c("s06", "El PBI"), 0.35); fx("boom", c("s06", "escobas."), 0.45); fx("pop", c("s06", "Uno de") + 0.3, 0.4)
fx("boom", c("s06", "estado de sitio."), 0.55)
fx("pop", c("s07", "En mil"), 0.4)
for j in range(4): fx("pop", c("s07", "por delante") + j * 0.28, 0.35)
fx("riser", c("s07", "Y acá") - 0.2, 0.3); fx("boom", c("s07", "¿qué nos"), 0.7)
for p in ["Mil novecientos treinta:", "Mil novecientos cincuenta:", "Mil novecientos setenta", "Dos mil uno:"]: fx("pop", c("s08", p), 0.4)
fx("boom", c("s08", "Mil novecientos treinta:") + 0.1, 0.35); fx("boom", c("s08", "Hoy,"), 0.45)
for j in range(6): fx("pop", c("s08", "Y en el ranking") + 0.2 + j * 0.62, 0.3)
fx("boom", c("s09", "¿Por qué?"), 0.55)
for p in ["Uno:", "Dos:", "Tres:", "Y cuatro:"]: fx("pop", c("s09", p), 0.4)
for j in range(6): fx("boom" if j == 0 else "pop", c("s09", "hubo seis") + j * 0.22, 0.25)
fx("cashregister", c("s09", "de más"), 0.3)
for j in range(9): fx("typewriter", c("s09", "Nueve") + j * 0.1, 0.1)
for j in range(4): fx("pop", c("s09", "Ningún factor") + j * 0.18, 0.35)
for p in ["los desarrollados,", "los subdesarrollados,", "Japón…", "y Argentina."]: fx("pop", c("s10", p), 0.45)
fx("boom", c("s10", "Nadie"), 0.4)
fx("pop", c("s11", "Según una"), 0.4); fx("glitch", c("s11", "Según las"), 0.3); fx("pop", c("s11", "Lo indiscutible"), 0.4)
fx("boom", c("s11", "Y que") + 1.2, 0.55)
fx("pop", c("s12", "En mil"), 0.4); fx("pop", c("s12", "Hoy produce"), 0.45)
fx("pop", c("s12", "se puede subir…"), 0.45); fx("pop", c("s12", "también se"), 0.45)
fx("boom", c("s12", "Si este"), 0.5); fx("pop", c("s12", "dejanos"), 0.45)

def follower(x, att=0.015, rel=0.35):
    hop = SR // 100; n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    act = np.clip((20 * np.log10(r) + 42) / 14, 0, 1)
    out = np.zeros(n); e = 0; aa, ar = np.exp(-0.01 / att), np.exp(-0.01 / rel)
    for i in range(n):
        kk = aa if act[i] > e else ar; e = kk * e + (1 - kk) * act[i]; out[i] = e
    return np.repeat(out, hop)
env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
music *= (0.55 - (0.55 - 0.15) * env)[:, None].astype(np.float32)

mix = music + sfx * 0.85; mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]; mix = mix / max(np.abs(mix).max(), 1e-9) * 0.89
raw = os.path.join(OUT, f"pre_{EP}.f32"); mix.astype(np.float32).tofile(raw)
mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", os.path.join(OUT, f"mezcla_{EP}.wav")], check=True)
os.remove(raw); print(f"ok -> audio/mix/mezcla_{EP}.wav")
