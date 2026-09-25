"""Short vertical: arma la línea de tiempo (video/src/data/short.json) y la mezcla (audio/mix/mezcla_short.wav).
Usa el gancho del documental (s01 recortado + s02) y termina con una placa que manda al video completo."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
W = json.load(open(os.path.join(ROOT, "video/src/data/words.json")))
D = json.load(open(os.path.join(ROOT, "video/src/data/durations.json")))
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

def word(seg, phrase, n=0, which="s"):
    ws = W[seg]; tg = [norm(x) for x in phrase.split()]; found = -1
    for i in range(len(ws) - len(tg) + 1):
        if all(norm(ws[i + k]["w"]) == t for k, t in enumerate(tg)):
            found += 1
            if found == n:
                return ws[i]["s"] if which == "s" else ws[i + len(tg) - 1]["e"]
    raise KeyError(f"{seg} {phrase}")

# ---------------- Partes de narración ----------------
a_end = word("s01", "reservas.", 0, "e") + 0.12
b_start = word("s01", "Pero la verdadera") - 0.08
PARTS = [{"id": "A", "seg": "s01", "from": 0.0, "to": round(a_end, 3), "wordsTo": word("s01", "Hace"), "at": 0.25}]
PARTS.append({"id": "B", "seg": "s01", "from": round(b_start, 3), "to": D["s01"], "at": round(PARTS[0]["at"] + a_end - 0 + 0.25, 3)})
PARTS.append({"id": "C", "seg": "s02", "from": 0.0, "to": D["s02"], "at": round(PARTS[1]["at"] + D["s01"] - b_start + 0.4, 3)})
END_CARD = round(PARTS[2]["at"] + D["s02"] + 0.2, 3)
TOTAL = round(END_CARD + 4.3, 3)
json.dump({"fps": 30, "parts": PARTS, "endCard": END_CARD, "total": TOTAL}, open(os.path.join(ROOT, "video/src/data/short.json"), "w"), indent=1)
print("partes:", PARTS, "\nplaca final:", END_CARD, "total:", TOTAL)

def sc(seg, phrase, n=0, which="s"):
    t = word(seg, phrase, n, which)
    for p in PARTS:
        if p["seg"] == seg and p["from"] - 0.01 <= t <= p["to"] + 0.01:
            return p["at"] + t - p["from"]
    raise KeyError(f"fuera del short: {seg} {phrase}")

def load(path, stereo=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

N = int((TOTAL + 0.5) * SR)
voice = np.zeros(N, np.float32); music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)

# narración (con micro-fundidos en los cortes)
for p in PARTS:
    a = load(os.path.join(ROOT, f"video/public/narracion/{p['seg']}.wav"), stereo=False)
    seg = a[int(p["from"] * SR): int(p["to"] * SR)].copy()
    f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(p["at"] * SR); voice[i:i + len(seg)] += seg

# música: gancho de m1, sube en la placa final
m = load(os.path.join(ROOT, "video/public/music/m1_intro.mp3"))[: N]
fo = int(1.6 * SR); env_m = np.ones(len(m)); env_m[-fo:] = np.linspace(1, 0, fo)
music[: len(m)] = m * env_m[:, None]

def follower(x, att=0.015, rel=0.35):
    hop = SR // 100; n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    act = np.clip((20 * np.log10(r) + 42) / 14, 0, 1)
    out = np.zeros(n); e = 0; aa, ar = np.exp(-0.01 / att), np.exp(-0.01 / rel)
    for i in range(n):
        c = aa if act[i] > e else ar; e = c * e + (1 - c) * act[i]; out[i] = e
    return np.repeat(out, hop)
env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
g = 0.52 - (0.52 - 0.20) * env
music *= g[:, None].astype(np.float32)

SF = {}
for f in os.listdir(os.path.join(ROOT, "video/public/sfx")):
    a = load(os.path.join(ROOT, "video/public/sfx", f)); SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
def fx(name, t, gain=0.5):
    a = SF[name]; i = int(t * SR); n = min(len(a), N - i)
    sfx[i:i + n] += a[:n] * gain

fx("billetes", sc("s01", "dólares"), 0.45)
for p in ["Adentro", "lata", "En el freezer", "Debajo"]: fx("pop", sc("s01", p), 0.5)
fx("typewriter", sc("s01", "INDEC,") - 0.05, 0.35)
fx("billetes", sc("s01", "doscientos") - 0.1, 0.5); fx("cashregister", sc("s01", "sistema.", 0, "e") - 0.2, 0.42)
fx("whoosh", sc("s01", "Es más de cinco") - 0.2, 0.35); fx("pop", sc("s01", "veces"), 0.5)
fx("whoosh", sc("s01", "Pero la verdadera") - 0.25, 0.35); fx("boom", sc("s01", "¿por qué"), 0.55); fx("glitch", sc("s01", "no sirve"), 0.28)
for i in range(4): fx("pop", sc("s02", "contar") - 0.2 + i * 0.25, 0.3)
fx("glitch", sc("s02", "trece"), 0.2); fx("whoosh", sc("s02", "desaparecieron."), 0.3); fx("boom", sc("s02", "rota."), 0.55)
fx("riser", END_CARD - 2.0, 0.45); fx("boom", END_CARD, 0.9); fx("pop", END_CARD + 1.2, 0.5)

mix = music + sfx * 0.9; mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]; mix = mix / max(np.abs(mix).max(), 1e-9) * 0.89
raw = os.path.join(OUT, "pre_short.f32"); mix.astype(np.float32).tofile(raw)
mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", os.path.join(OUT, "mezcla_short.wav")], check=True)
os.remove(raw); print("ok -> audio/mix/mezcla_short.wav")
