"""Short vertical del episodio 12 (ARA San Juan) para YouTube Shorts: el micrófono que escuchó al submarino, la presión
y el colapso, la grabación real de la implosión del Titan, el hallazgo a 907 metros y el cierre al video completo.
Arma la línea de tiempo (video/src/data/ep12/short.json + words_short.json) y la mezcla (audio/mix/mezcla_short12.wav, -14 LUFS)."""
import json, os, re, shutil, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
W = json.load(open(os.path.join(ROOT, "video/src/data/ep12/words.json")))
W.update(json.load(open(os.path.join(ROOT, "audio/ep12/short/final/words.json"))))
TLm = json.load(open(os.path.join(ROOT, "video/src/data/ep12/timeline.json")))
D, INS = TLm["durations"], TLm["inserts"]
PUB = os.path.join(ROOT, "video/public")
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
shutil.copy(os.path.join(ROOT, "audio/ep12/short/final/x01.wav"), os.path.join(PUB, "ep12/narracion/x01.wav"))
D["x01"] = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(PUB, "ep12/narracion/x01.wav")], capture_output=True, text=True).stdout)

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
    raise KeyError(f"{seg} {phrase} #{n}")

# (id, segmento, frase inicial o None, frase final o None, segundos extra al final)
TITAN_END = INS["s06"][1][0] + INS["s06"][1][1] - word("s06", "Titanic.", 0, "e") - 0.15   # incluye el silencio con la grabación real
PLAN = [("gancho", "s01", None, "adentro.", 0.0), ("presion", "s06", "El casco", "parpadeo.", 0.0), ("titan", "s06", "En dos", "Titanic.", TITAN_END),
        ("hallazgo", "s08", "A las doce", "profundidad.", 0.0), ("cta", "x01", None, None, 0.0)]
GAP, LEAD, END = 0.35, 0.15, 3.0

parts, at = [], LEAD
for pid, seg, a, b, extra in PLAN:
    fr = 0.0 if a is None else max(0.0, word(seg, a) - 0.06)
    to = D[seg] if b is None else min(D[seg], word(seg, b, 0, "e") + 0.14 + extra)
    parts.append({"id": pid, "seg": seg, "from": round(fr, 3), "to": round(to, 3), "at": round(at, 3)})
    at += to - fr + GAP
TL = {"fps": 30, "parts": parts, "cta": round(parts[-1]["at"], 3), "total": round(at - GAP + END, 3),
      "titan": round(parts[2]["at"] + (INS["s06"][1][0] - 2.5) - parts[2]["from"], 3)}
json.dump(TL, open(os.path.join(ROOT, "video/src/data/ep12/short.json"), "w"), indent=1)
json.dump({"x01": W["x01"]}, open(os.path.join(ROOT, "video/src/data/ep12/words_short.json"), "w"), ensure_ascii=False, indent=0)
print("total", TL["total"], [(p["id"], round(p["to"] - p["from"], 1), p["at"]) for p in parts])

def load(path, stereo=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

SF = {}
for d in ["sfx", "ep03/sfx", "ep05/sfx", "ep11/sfx", "ep12/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        a = load(os.path.join(PUB, d, f)); SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5

def follower(x, att=0.015, rel=0.35):
    hop = SR // 100; n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    act = np.clip((20 * np.log10(r) + 42) / 14, 0, 1)
    out = np.zeros(n); e = 0; aa, ar = np.exp(-0.01 / att), np.exp(-0.01 / rel)
    for i in range(n):
        c = aa if act[i] > e else ar; e = c * e + (1 - c) * act[i]; out[i] = e
    return np.repeat(out, hop)

total = TL["total"]; N = int((total + 0.5) * SR)
voice = np.zeros(N, np.float32); sfx = np.zeros((N, 2), np.float32)
P = {p["id"]: p for p in parts}
def st(pid, phrase, n=0, which="s"):
    p = P[pid]; return p["at"] + word(p["seg"], phrase, n, which) - p["from"]
for p in parts:
    a = load(os.path.join(PUB, f"ep12/narracion/{p['seg']}.wav"), stereo=False)
    seg = a[int(p["from"] * SR): int(p["to"] * SR)].copy()
    f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(p["at"] * SR); voice[i:i + len(seg)] += seg
# música: el tema de la señal (pulso), con un hueco para la grabación del Titan
M = load(os.path.join(PUB, "ep12/music/senal.mp3"))
m = M[: N].copy(); m *= 10 ** (-16 / 20) / (np.sqrt(np.mean(m[: int(40 * SR)] ** 2)) + 1e-12)
fo = int(2.0 * SR); e = np.ones(len(m)); e[: int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR)); e[-fo:] = np.linspace(1, 0, fo)
music = np.zeros((N, 2), np.float32); music[: len(m)] = m * e[:, None]
env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
g = 0.6 - (0.6 - 0.2) * env
t_titan = st("titan", "Titanic.", 0, "e")
i0, i1 = int((t_titan - 1.2) * SR), int((P["titan"]["at"] + P["titan"]["to"] - P["titan"]["from"] + 0.2) * SR)
r = int(0.5 * SR); d = np.ones(N); d[i0:i1] = 0.0; d[i0 - r:i0] = np.linspace(1, 0, r); d[i1:i1 + r] = np.linspace(0, 1, len(d[i1:i1 + r]))
g *= d
music *= g[:, None].astype(np.float32)
def fx(name, t, gain=0.5, dur=None):
    a = SF[name]
    if dur:
        a = a[: int(dur * SR)].copy(); f = min(len(a), int(0.3 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(t * SR); n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
for p in parts[1:]: fx("whoosh", p["at"] - 0.35, 0.3)
fx("sonar", 0.1, 0.4); fx("sonar", st("gancho", "micrófono.") - 0.1, 0.3)
fx("explosion", st("gancho", "escuchar") - 0.25, 0.4); fx("impacto", st("gancho", "registró") + 1.0, 0.4)
fx("whoosh", st("gancho", "Era un") - 0.3, 0.25); fx("impacto", st("gancho", "cuarenta") - 0.1, 0.25)
fx("crujido", st("presion", "El casco") - 0.2, 0.3); fx("crujido", st("presion", "Según") + 0.5, 0.36)
fx("implosion", st("presion", "cedió.") + 0.3, 0.6); fx("impacto", st("presion", "cedió.") + 0.35, 0.45)
fx("rov", st("titan", "En dos") - 0.1, 0.1, dur=6.0)
tt = TL["titan"]; a = SF["titan_real"]; i = int(tt * SR); n = min(len(a), N - i); sfx[i:i + n] += a[:n] * 0.95
fx("riser", st("hallazgo", "lo vieron.") - 2.0, 0.3); fx("impacto", st("hallazgo", "lo vieron.") - 0.05, 0.55)
fx("crujido", st("hallazgo", "El ARA") , 0.2, dur=3.0)
fx("riser", TL["cta"] - 1.4, 0.3); fx("impacto", TL["cta"], 0.5); fx("pop", TL["cta"] + 7.8, 0.4)
out = music + sfx * 0.9; out[:, 0] += voice; out[:, 1] += voice
out = out[: int(total * SR)]; out = out / max(np.abs(out).max(), 1e-9) * 0.89
raw = os.path.join(OUT, "pre_short12.f32"); out.astype(np.float32).tofile(raw)
mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_short12.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw); print("->", dst, js["input_i"], "LUFS medidos")
