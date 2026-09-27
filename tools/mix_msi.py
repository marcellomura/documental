"""Mezcla de "¿Por qué ver a Messi cuesta $3 millones?": python3 tools/mix_msi.py -> audio/mix/mezcla_msi.wav
Narración + 3 temas con ducking y cruces por capítulo + efectos sincronizados a las palabras y a los cortes de cortes.json. Sale a -14 LUFS."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = "msi"
SR = 48000
TL = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/timeline.json")))
W = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/words.json")))
GAPS = json.load(open(os.path.join(ROOT, "guion/msi_gaps.json")))
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

MUS = os.path.join(ROOT, "video/public/msi/music")
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
place("m1_tension", 0, gap("s04") + 0.3, fin=0.05, fout=0.6)                   # gancho, título, el partido y la fila
place("m2_explica", gap("s04") + 0.1, gap("s06") + 0.3, fin=0.2, fout=0.6)     # la cuenta y las palas para la nieve
place("m1_tension", gap("s06") + 0.1, at("s07") - 0.1, fin=0.2, fout=0.5, offset=60)  # los bots
place("m2_explica", at("s07") - 0.4, gap("s08") + 0.3, fin=0.5, fout=0.6, offset=66)  # precio dinámico
place("m1_tension", gap("s08") + 0.1, gap("s10") + 0.3, fin=0.2, fout=0.6, offset=24) # la trampa y la ley
place("m3_final", gap("s10") + 0.1, TOTAL, fin=0.4, fout=3.0)                   # veredicto y cierre

# ---------- cortes (los mismos de Msi.tsx, leídos de cortes.json) ----------
CJ = json.load(open(os.path.join(ROOT, "video/src/data/msi/cortes.json")))
def resolve(t):
    if "abs" in t: return t["abs"]
    if "gap" in t: return gap(t["gap"])
    if "at" in t: return at(t["at"]) + t.get("off", 0)
    return c(t["seg"], t["ph"], t.get("n", 0)) - t.get("pre", 0.12)
cuts = [(resolve(s["t"]), s.get("tr", ""), s["id"]) for s in CJ["shots"][1:]] + [(resolve(s["t"]), s["tr"], "") for s in CJ["inner"]]
for t, kind, sid in cuts:
    if kind == "tear":  # placa de capítulo
        fx("riser", t - 1.3, 0.28); fx("boom", t + 0.05, 0.55); fx("campanada", t + 0.25, 0.16)
    elif kind == "glitch":
        fx("glitch", t - 0.12, 0.3); fx("whoosh", t - 0.22, 0.18)
    else:
        fx("whoosh", t - 0.22, 0.3 if kind in ("whip", "stripes", "iris") else 0.22)

# ---------- efectos puntuales (mismos momentos que las escenas) ----------
# s01 · el gancho
fx("boom", 0.42, 0.6); fx("pop", c("s01", "Al día") - 0.05, 0.4); fx("cashregister", c("s01", "seiscientos") + 0.1, 0.35)
fx("boom", c("s01", "tres millones"), 0.5); fx("pop", c("s01", "¿Por") , 0.3)
fx("boom", c("s01", "no del") - 0.05, 0.5)
# título
fx("riser", gap("s02") - 1.2, 0.25); fx("boom", gap("s02") + 0.6, 0.7)
# s02 · el partido
fx("boom", at("s02"), 0.5); fx("pop", c("s02", "Monumental."), 0.4); fx("pop", c("s02", "Argentina"), 0.4); fx("pop", c("s02", "puesto") - 0.1, 0.4)
for j in range(8): fx("typewriter", c("s02", "número") + j * 0.12, 0.1)
fx("boom", c("s02", "último.") - 0.05, 0.5)
fx("boom", c("s02", "Veinte") - 0.1, 0.45); fx("glitch", c("s02", "echaron") - 0.1, 0.3)
# s03 · la fila
fx("tictac", at("s03") + 0.2, 0.25); fx("pop", c("s03", "Se abre"), 0.45); fx("pop", c("s03", "Máximo") - 0.05, 0.45)
fx("pop", c("s03", "en más") - 0.2, 0.4)
fx("tictac", c("s03", "Y en menos"), 0.3); fx("boom", c("s03", "no quedaba"), 0.6)
fx("boom", c("s03", "ochenta") - 0.1, 0.45); fx("pop", c("s03", "una parte"), 0.4)
for j in range(10): fx("pop", c("s03", "cuarenta") + 0.05 + j * 0.16, 0.12)
fx("boom", c("s03", "estar") - 0.05, 0.55)
# s04 · la cuenta
fx("pop", c("s04", "oferta"), 0.35); fx("pop", c("s04", "precio queda"), 0.35); fx("pop", c("s04", "fila"), 0.35)
fx("pop", c("s04", "compra"), 0.35); fx("cashregister", c("s04", "vender"), 0.3)
fx("pop", c("s04", "Son la"), 0.4)
fx("glitch", c("s04", "AFA.") + 0.25, 0.25); fx("glitch", c("s04", "Tampoco") + 0.25, 0.25)
fx("cashregister", c("s04", "La cobra") + 0.25, 0.35); fx("billetes", c("s04", "La cobra") + 0.2, 0.35)
# s05 · ¿por qué no la cobran más cara?
fx("cashregister", c("s05", "seiscientos"), 0.3)
fx("boom", c("s05", "En mil") - 0.05, 0.45); fx("pop", c("s05", "Daniel") - 0.15, 0.4); fx("pop", c("s05", "pregunta") - 0.1, 0.35)
fx("pop", c("s05", "quince") - 0.2, 0.4); fx("pop", c("s05", "veinte.") - 0.1, 0.45)
fx("boom", c("s05", "El ochenta"), 0.5)
fx("pop", c("s05", "Alan") - 0.1, 0.4); fx("pop", c("s05", "Bruce"), 0.4)
fx("pop", c("s05", "Una reventa") - 0.1, 0.4); fx("billetes", c("s05", "otro.") - 0.1, 0.35)
# s06 · los bots
fx("boom", at("s06"), 0.45); fx("pop", c("s06", "barata") - 0.1, 0.4); fx("pop", c("s06", "escasa,") - 0.1, 0.4)
fx("whoosh", c("s06", "la gana"), 0.3); fx("boom", c("s06", "persona.") - 0.05, 0.55)
fx("pop", c("s06", "cuatro") - 0.08, 0.45)
for j in range(4): fx("glitch", c("s06", "cuatro") + 0.15 + j * 0.1, 0.12)
fx("pop", c("s06", "bots") - 0.1, 0.4)
for j in range(3): fx("pop", c("s06", "tres") + j * 0.12, 0.35)
for j in range(8): fx("typewriter", c("s06", "ciento") + j * 0.12, 0.1)
fx("boom", c("s06", "usando") - 0.05, 0.5)
fx("riser", c("s06", "tres mil") - 1.1, 0.2); fx("boom", c("s06", "tres mil") - 0.1, 0.55)
fx("boom", c("s06", "No hay") - 0.03, 0.5)
for j in range(4): fx("pop", c("s06", "tope") + 0.2 + j * 0.1, 0.25)
# s07 · el precio dinámico
fx("pop", c("s07", "sube") - 0.05, 0.4)
fx("boom", c("s07", "Oasis") - 0.05, 0.5); fx("tictac", c("s07", "horas") - 0.1, 0.25)
fx("pop", c("s07", "ciento") - 0.2, 0.4); fx("cashregister", c("s07", "trescientas") - 0.1, 0.35)
fx("boom", c("s07", "cambiar") - 0.05, 0.5)
fx("pop", c("s07", "Argentina") - 0.1, 0.4); fx("pop", c("s07", "reventa oficial") - 0.1, 0.4)
fx("riser", c("s07", "dos millones") - 1.4, 0.3); fx("boom", c("s07", "dos millones") - 0.15, 0.6); fx("cashregister", c("s07", "dos millones") + 0.9, 0.3)
fx("boom", c("s07", "Cada") - 0.05, 0.55)
# s08 · la trampa
fx("boom", c("s08", "aparece") - 0.05, 0.55)
fx("pop", c("s08", "copia") - 0.1, 0.35); fx("pop", c("s08", "oficial:") - 0.35, 0.35)
fx("glitch", c("s08", "net"), 0.35); fx("pop", c("s08", "com"), 0.4); fx("pop", c("s08", "Mismo diseño") - 0.1, 0.4)
fx("boom", c("s08", "supuesta") + 0.9, 0.5)
fx("boom", c("s08", "¿Y Viagogo,") - 0.05, 0.5); fx("cashregister", c("s08", "precios millonarios?"), 0.3)
fx("boom", c("s08", "multaron"), 0.45); fx("pop", c("s08", "Italia") - 0.1, 0.4)
for j in range(5): fx("pop", c("s08", "lo que ves") + j * 0.12, 0.3)
for j in range(5): fx("pop", c("s08", "pedidos.") - 0.1 + j * 0.06, 0.15)
fx("glitch", c("s08", "Nadie") - 0.1, 0.3)
# s09 · ¿es legal?
fx("boom", c("s09", "¿Y es") - 0.05, 0.5); fx("typewriter", c("s09", "Ciudad") - 0.1, 0.25)
fx("boom", c("s09", "contravención:") - 0.05, 0.45); fx("pop", c("s09", "multar") - 0.1, 0.45); fx("boom", c("s09", "arrestar.") - 0.1, 0.45)
for p in ["compra", "turno", "entrada física,"]: fx("pop", c("s09", p) - 0.1, 0.4)
fx("pop", c("s09", "deja") - 0.15, 0.45)
fx("pop", c("s09", "alguien") - 0.2, 0.35); fx("glitch", c("s09", "PDF") + 0.25, 0.3); fx("glitch", c("s09", "captura") + 0.25, 0.3)
fx("boom", c("s09", "desconfiá.") - 0.05, 0.6)
# s10 · el veredicto
fx("boom", c("s10", "ochenta") - 0.1, 0.45); fx("boom", c("s10", "no alcanzan") - 0.05, 0.4)
for j in range(7): fx("pop", c("s10", "veinte") - 0.15 + j * 0.19, 0.18)
fx("pop", c("s10", "El precio") - 0.15, 0.35); fx("pop", c("s10", "La reventa") - 0.15, 0.35); fx("boom", c("s10", "gracias") - 0.1, 0.35)
fx("billetes", c("s10", "Y esa") + 0.45, 0.35); fx("boom", c("s10", "equivocado.") - 0.05, 0.6)
# s11 · cierre
fx("pop", c("s11", "Dejalo") - 0.1, 0.4)
for j in range(12): fx("typewriter", c("s11", "Dejalo") + 0.3 + j * 0.13, 0.08)
fx("pop", c("s11", "suscribite") + 0.45, 0.5); fx("campanada", c("s11", "Contexto:"), 0.2)
fx("whoosh", c("s11", "acá") + 2.2, 0.3)

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
