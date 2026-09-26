"""Short "El dólar está barato": mezcla (audio/mix/mezcla_sdb.wav) a partir de la narración procesada,
la línea de tiempo video/src/data/sdb/timeline.json y las palabras de video/src/data/sdb/words.json."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "video/src/data/sdb/timeline.json")))
W = json.load(open(os.path.join(ROOT, "video/src/data/sdb/words.json")))
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
SEGS, E, TOTAL = TL["segs"], TL["endCard"], TL["total"]

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

def c(seg, phrase, n=0, which="s"):
    ws = W[seg]; tg = [norm(x) for x in phrase.split()]; found = -1
    for i in range(len(ws) - len(tg) + 1):
        if all(norm(ws[i + k]["w"]) == t for k, t in enumerate(tg)):
            found += 1
            if found == n:
                return SEGS[seg]["at"] + (ws[i]["s"] if which == "s" else ws[i + len(tg) - 1]["e"])
    raise KeyError(f"{seg} {phrase}")

def load(path, stereo=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

N = int((TOTAL + 0.5) * SR)
voice = np.zeros(N, np.float32); music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)

for sid, s in SEGS.items():
    a = load(os.path.join(ROOT, f"audio/sdb/final/{sid}.wav"), stereo=False)
    i = int(s["at"] * SR); voice[i:i + len(a)] += a[: N - i]

# música: m1 hasta la historia, m2 en historia y la otra mirada, m3 para el cierre
def place(name, t0, t1, fin=0.8, fout=1.2, offset=0.0):
    m = load(os.path.join(ROOT, f"video/public/music/{name}.mp3"))
    i0, n = int(t0 * SR), int((t1 - t0) * SR)
    m = m[int(offset * SR): int(offset * SR) + n]
    if len(m) < n:  # loop si hace falta
        m = np.concatenate([m] * (n // len(m) + 1))[:n]
    env = np.ones(n); a, b = int(fin * SR), int(fout * SR)
    env[:a] = np.linspace(0, 1, a); env[-b:] = np.linspace(1, 0, b)
    music[i0:i0 + n] += m * env[:, None]

t_hist = SEGS["s04"]["at"]; t_close = SEGS["s06"]["at"]
place("m1_intro", 0, t_hist + 0.6, fin=0.05)
place("m2_tension", t_hist - 0.4, t_close + 0.6)
place("m3_cierre", t_close - 0.4, TOTAL, fout=2.0)

def follower(x, att=0.015, rel=0.35):
    hop = SR // 100; n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    act = np.clip((20 * np.log10(r) + 42) / 14, 0, 1)
    out = np.zeros(n); e = 0; aa, ar = np.exp(-0.01 / att), np.exp(-0.01 / rel)
    for i in range(n):
        k = aa if act[i] > e else ar; e = k * e + (1 - k) * act[i]; out[i] = e
    return np.repeat(out, hop)
env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
g = 0.50 - (0.50 - 0.17) * env
music *= g[:, None].astype(np.float32)

SF = {}
for f in os.listdir(os.path.join(ROOT, "video/public/sfx")):
    a = load(os.path.join(ROOT, "video/public/sfx", f)); SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
def fx(name, t, gain=0.5):
    a = SF[name]; i = int(max(t, 0) * SR); n = min(len(a), N - i)
    sfx[i:i + n] += a[:n] * gain

# s01
fx("pop", c("s01", "barato.") + 0.15, 0.5); fx("cashregister", c("s01", "barato.") + 0.1, 0.3)
fx("boom", c("s01", "¿es malo?"), 0.55)
fx("whoosh", c("s01", "En lo que va") - 0.2, 0.3); fx("pop", c("s01", "cuatro") + 0.1, 0.45); fx("riser", c("s01", "La inflación,"), 0.25)
fx("pop", c("s01", "veintitrés.") + 0.1, 0.55)
for i in range(4): fx("pop", c("s01", "Y todos") + 0.1 + i * 0.24, 0.22)
fx("boom", c("s01", "atraso"), 0.45)
# s02
fx("whoosh", SEGS["s02"]["at"] - 0.2, 0.3); fx("typewriter", c("s02", "cien") - 0.1, 0.25); fx("pop", c("s02", "cien") - 0.2, 0.4)
fx("pop", c("s02", "ciento") - 0.2, 0.45); fx("cashregister", c("s02", "ciento") + 0.5, 0.35)
fx("billetes", c("s02", "Pero el dólar"), 0.35)
fx("whoosh", c("s02", "Entonces,") - 0.2, 0.3); fx("riser", c("s02", "sesenta") - 0.3, 0.3); fx("boom", c("s02", "más cara"), 0.55)
fx("whoosh", c("s02", "Eso es el") - 0.2, 0.3); fx("whoosh", c("s02", "corren,") - 0.2, 0.35)
# s03
fx("whoosh", SEGS["s03"]["at"] - 0.2, 0.3)
for p in ["viaja", "importado,", "compra dólares", "campo,", "industria,", "turismo."]: fx("pop", c("s03", p) - 0.1, 0.45)
fx("glitch", c("s03", "¿Quién pierde?"), 0.25)
fx("whoosh", c("s03", "Cobran") - 0.2, 0.3); fx("pop", c("s03", "rinden") - 0.1, 0.4); fx("riser", c("s03", "costos") - 0.2, 0.25)
# s04
fx("whoosh", SEGS["s04"]["at"] - 0.2, 0.35); fx("boom", c("s04", "Sí."), 0.5); fx("pop", c("s04", "uno a uno") - 0.2, 0.45)
fx("pop", c("s04", "diecisiete.") - 0.5, 0.45); fx("riser", c("s04", "Las dos veces,"), 0.35); fx("boom", c("s04", "salto") + 0.1, 0.7)
fx("glitch", c("s04", "triplicó.") - 0.2, 0.3); fx("cashregister", c("s04", "triplicó."), 0.3); fx("glitch", c("s04", "duplicó.") - 0.2, 0.3)
# s05
fx("whoosh", SEGS["s05"]["at"] - 0.2, 0.3); fx("pop", c("s05", "El Gobierno") - 0.1, 0.4)
fx("pop", c("s05", "Vaca") - 0.15, 0.45); fx("pop", c("s05", "minería") - 0.15, 0.45); fx("billetes", c("s05", "entrar") - 0.1, 0.45)
fx("whoosh", c("s05", "Otros advierten") - 0.2, 0.3)
for p in ["dieciocho", "diecinueve.", "muy por debajo"]: fx("pop", c("s05", p) - 0.1, 0.35)
# s06
fx("whoosh", SEGS["s06"]["at"] - 0.2, 0.3); fx("pop", c("s06", "sostiene") - 0.15, 0.4); fx("riser", c("s06", "acumulando") - 0.2, 0.3)
fx("pop", c("s06", "regalo") - 0.1, 0.5); fx("boom", c("s06", "bomba?") - 0.1, 0.55); fx("pop", c("s06", "Contame") - 0.1, 0.4)
fx("typewriter", c("s06", "Y si querés") + 0.3, 0.2)
fx("riser", E - 1.8, 0.4); fx("boom", E, 0.85); fx("pop", E + 1.1, 0.5)

mix = music + sfx * 0.9; mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]; mix = mix / max(np.abs(mix).max(), 1e-9) * 0.89
raw = os.path.join(OUT, "pre_sdb.f32"); mix.astype(np.float32).tofile(raw)
mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", os.path.join(OUT, "mezcla_sdb.wav")], check=True)
os.remove(raw); print("ok -> audio/mix/mezcla_sdb.wav")
