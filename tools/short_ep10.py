"""Short vertical del episodio 10 (El cuadro del nazi) para YouTube Shorts: el timbre, el aviso, el sillón verde y el cuadro
robado en 1940; la comparación, el allanamiento y el tapiz; Ceruti, la primera devolución y el cierre que manda al video completo.
Arma la línea de tiempo (video/src/data/ep10/short.json + words_short.json) y la mezcla (audio/mix/mezcla_short10.wav, -14 LUFS)."""
import json, os, re, shutil, subprocess, sys, unicodedata
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
W = json.load(open(os.path.join(ROOT, "video/src/data/ep10/words.json")))
W.update(json.load(open(os.path.join(ROOT, "audio/ep10/short/final/words.json"))))
D = json.load(open(os.path.join(ROOT, "video/src/data/ep10/timeline.json")))["durations"]
PUB = os.path.join(ROOT, "video/public")
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
shutil.copy(os.path.join(ROOT, "audio/ep10/short/final/x01.wav"), os.path.join(PUB, "ep10/narracion/x01.wav"))
D["x01"] = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(PUB, "ep10/narracion/x01.wav")], capture_output=True, text=True).stdout)

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

# (id, segmento, frase inicial o None = desde el principio, frase final o None = hasta el final)
PLAN = [("gancho", "s01", "Un periodista", "cuadro?"), ("robado", "s01", "Arriba", "años."), ("match", "s07", "Cuando vieron", "caballos."),
        ("autentico", "s08", "Era auténtico:", "euros."), ("primera", "s08", "Es la primera", None), ("cta", "x01", None, None)]
GAP, LEAD, END = 0.35, 0.2, 3.2

parts, at = [], LEAD
for pid, seg, a, b in PLAN:
    fr = 0.0 if a is None else max(0.0, word(seg, a) - 0.06)
    to = D[seg] if b is None else min(D[seg], word(seg, b, 0, "e") + 0.14)
    parts.append({"id": pid, "seg": seg, "from": round(fr, 3), "to": round(to, 3), "at": round(at, 3)})
    at += to - fr + GAP
TL = {"fps": 30, "parts": parts, "cta": round(parts[-1]["at"], 3), "total": round(at - GAP + END, 3)}
json.dump(TL, open(os.path.join(ROOT, "video/src/data/ep10/short.json"), "w"), indent=1)
json.dump({"x01": W["x01"]}, open(os.path.join(ROOT, "video/src/data/ep10/words_short.json"), "w"), ensure_ascii=False, indent=0)
print("total", TL["total"], [(p["id"], round(p["to"] - p["from"], 1), p["at"]) for p in parts])

def load(path, stereo=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx", "ep05/sfx", "ep09/sfx", "ep10/sfx"]:
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
    a = load(os.path.join(PUB, f"ep10/narracion/{p['seg']}.wav"), stereo=False)
    seg = a[int(p["from"] * SR): int(p["to"] * SR)].copy()
    f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(p["at"] * SR); voice[i:i + len(seg)] += seg
# música: el tema del misterio desde que empieza a crecer
M = load(os.path.join(PUB, "ep10/music/m1_misterio.mp3"))
off = 34.0
m = M[int(off * SR):][:N].copy()
m *= 10 ** (-16 / 20) / (np.sqrt(np.mean(m[: int(40 * SR)] ** 2)) + 1e-12)
fo = int(2.0 * SR); e = np.ones(len(m)); e[:int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR)); e[-fo:] = np.linspace(1, 0, fo)
music = np.zeros((N, 2), np.float32); music[: len(m)] = m * e[:, None]
env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
g = 0.6 - (0.6 - 0.2) * env
music *= g[:, None].astype(np.float32)
def fx(name, t, gain=0.5, dur=None):
    a = SF[name]
    if dur:
        a = a[: int(dur * SR)].copy(); f = min(len(a), int(0.3 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(t * SR); n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
for p in parts[1:]: fx("whoosh", p["at"] - 0.3, 0.26); fx("flash", p["at"] - 0.05, 0.18)
fx("mar", 0.0, 0.12)
fx("timbre", st("gancho", "timbre") + 0.25, 0.6)
fx("pop", st("gancho", "se vende.") + 0.1, 0.3)
fx("celular", st("gancho", "pasa") + 0.25, 0.35); fx("celular", st("gancho", "pasa") + 0.95, 0.35); fx("celular", st("gancho", "Hasta que") + 0.45, 0.35)
fx("whoosh", st("gancho", "al living,") + 0.1, 0.3)
fx("flash", st("gancho", "¿ese") - 0.05, 0.4); fx("boom", st("gancho", "¿ese"), 0.3)
fx("stamp", st("robado", "robaron"), 0.55); fx("boom", st("robado", "robaron"), 0.35); fx("tictac", st("robado", "y que") - 0.1, 0.25, dur=2.2)
fx("glitch", st("match", "compararon"), 0.18)
fx("stamp", st("match", "Era el mismo."), 0.7); fx("boom", st("match", "Era el mismo."), 0.6)
fx("patrulleros", st("match", "Dos días") + 0.2, 0.5); fx("boom", st("match", "allanó"), 0.4)
fx("boom", st("match", "no estaba."), 0.5)
fx("stamp", st("autentico", "Era auténtico:") + 0.1, 0.6); fx("cashregister", st("autentico", "doscientos") + 1.0, 0.3)
fx("boom", st("primera", "Es la primera"), 0.5)
fx("riser", TL["cta"] - 1.4, 0.35); fx("boom", TL["cta"], 0.6); fx("pop", st("cta", "Tocá"), 0.45)
out = music + sfx * 0.9; out[:, 0] += voice; out[:, 1] += voice
out = out[: int(total * SR)]; out = out / max(np.abs(out).max(), 1e-9) * 0.89
raw = os.path.join(OUT, "pre_short10.f32"); out.astype(np.float32).tofile(raw)
mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_short10.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw); print("->", dst, js["input_i"], "LUFS medidos")
