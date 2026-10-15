"""Short vertical del episodio 13 (EL LOTE 31.202) para YouTube Shorts y TikTok: el aviso de la inspección y las nueve
barreras que atravesó el lote, «Sí, lo sé», «hoy quemamos todo», el equipo de hospital que se dio cuenta y el cierre que
manda al video completo. Arma la línea de tiempo (video/src/data/ep13/short.json + words_short.json) y la mezcla
(audio/mix/mezcla_short13.wav, -14 LUFS, pico -1,5 dBTP)."""
import json, os, re, shutil, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
W = json.load(open(os.path.join(ROOT, "video/src/data/ep13/words.json")))
W.update(json.load(open(os.path.join(ROOT, "audio/ep13/short/final/words.json"))))
TLm = json.load(open(os.path.join(ROOT, "video/src/data/ep13/timeline.json")))
D, INS = TLm["durations"], TLm["inserts"]
PUB = os.path.join(ROOT, "video/public")
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
shutil.copy(os.path.join(ROOT, "audio/ep13/short/final/x01.wav"), os.path.join(PUB, "ep13/narracion/x01.wav"))
D["x01"] = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(PUB, "ep13/narracion/x01.wav")],
                                capture_output=True, text=True).stdout)

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

def word(seg, phrase, n=0, which="s"):
    """tiempo de una frase dentro de su segmento; compara sin espacios (igual que cue() en video/src/ep13/lib.ts)"""
    ws = W[seg]; tg = norm(phrase); found = -1
    for i in range(len(ws)):
        acc = ""
        for j in range(i, len(ws)):
            acc += norm(ws[j]["w"])
            if acc == tg:
                found += 1
                if found == n:
                    return ws[i]["s"] if which == "s" else ws[j]["e"]
                break
            if not tg.startswith(acc): break
    raise KeyError(f"{seg} {phrase} #{n}")

# (id, segmento, frase inicial o None, frase final o None, segundos extra al final: los silencios ya están en la locución)
PLAN = [("gancho", "s01", None, "Las atravesó todas.", 0.9), ("silose", "s08", "El veintiséis de febrero", "sí, lo sé.", 1.2),
        ("quemamos", "s11", "El catorce de mayo", "hoy quemamos todo.", 1.0), ("hospital", "s10", "La barrera que funcionó", "se dio cuenta.", 0.3),
        ("cta", "x01", None, None, 0.0)]
GAP, LEAD, END = 0.35, 0.15, 3.0

parts, at = [], LEAD
for pid, seg, a, b, extra in PLAN:
    fr = 0.0 if a is None else max(0.0, word(seg, a) - 0.06)
    to = D[seg] if b is None else min(D[seg], word(seg, b, 0, "e") + 0.14 + extra)
    parts.append({"id": pid, "seg": seg, "from": round(fr, 3), "to": round(to, 3), "at": round(at, 3)})
    at += to - fr + GAP
TL = {"fps": 30, "parts": parts, "cta": round(parts[-1]["at"], 3), "total": round(at - GAP + END, 3)}
json.dump(TL, open(os.path.join(ROOT, "video/src/data/ep13/short.json"), "w"), indent=1)
json.dump({"x01": W["x01"]}, open(os.path.join(ROOT, "video/src/data/ep13/words_short.json"), "w"), ensure_ascii=False, indent=0)
print("total", TL["total"], [(p["id"], round(p["to"] - p["from"], 1), p["at"]) for p in parts])

def load(path, stereo=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

def follower(x, att=0.015, rel=0.35):
    hop = SR // 100; n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    act = np.clip((20 * np.log10(r) + 42) / 14, 0, 1)
    out = np.zeros(n); e = 0; aa, ar = np.exp(-0.01 / att), np.exp(-0.01 / rel)
    for i in range(n):
        c = aa if act[i] > e else ar; e = c * e + (1 - c) * act[i]; out[i] = e
    return np.repeat(out, hop)

total = TL["total"]; N = int((total + 0.5) * SR)
voice = np.zeros(N, np.float32); music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)
P = {p["id"]: p for p in parts}
def st(pid, phrase, n=0, which="s"):
    p = P[pid]; return p["at"] + word(p["seg"], phrase, n, which) - p["from"]
def end(pid):
    p = P[pid]; return p["at"] + p["to"] - p["from"]
for p in parts:
    a = load(os.path.join(PUB, f"ep13/narracion/{p['seg']}.wav"), stereo=False)
    seg = a[int(p["from"] * SR): int(p["to"] * SR)].copy()
    f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(p["at"] * SR); voice[i:i + len(seg)] += seg

# ---------------- música: los mismos temas del episodio, uno por bloque ----------------
TARGET = 10 ** (-16 / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
def place(name, g0, g1, off=0.0, fin=0.05, fout=0.5, gain=1.0):
    src = load(os.path.join(PUB, f"ep13/music/{name}.mp3"))
    ref = rms(src[int(3 * SR): int(min(len(src) / SR - 6, 60) * SR)])
    i0, i1, o = int(g0 * SR), int(g1 * SR), int(off * SR)
    seg = src[o:o + (i1 - i0)].copy() * (TARGET / ref); n = len(seg)
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain
place("pulso", 0.0, P["silose"]["at"] + 0.1, 0.0, fin=0.8, fout=0.45, gain=1.05)
place("alarma", P["silose"]["at"] - 0.25, P["quemamos"]["at"] + 0.1, 0.0, fin=0.3, fout=0.4)
place("encubrimiento", P["quemamos"]["at"] - 0.2, P["hospital"]["at"] + 0.1, 10.0, fin=0.2, fout=0.4, gain=0.8)
place("hospital", P["hospital"]["at"] - 0.25, TL["cta"] + 0.15, 20.0, fin=0.4, fout=0.4)
place("tema", TL["cta"] - 0.3, total, 56.0, fin=0.3, fout=2.0)

env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
g = 0.6 - (0.6 - 0.2) * env
def dip(a, b, level, ramp=0.3):
    global g
    i0, i1, r = int(a * SR), int(b * SR), int(ramp * SR)
    d = np.ones(N); d[i0:i1] = level
    d[max(0, i0 - r):i0] = np.linspace(1, level, i0 - max(0, i0 - r)); d[i1:i1 + r] = np.linspace(level, 1, len(d[i1:i1 + r]))
    g = g * d
dip(st("silose", "sí, lo sé.", 0, "e") + 0.05, end("silose"), 0.3, 0.12)            # el silencio después de «Sí, lo sé»
dip(st("quemamos", "hoy quemamos todo.", 0, "e") + 0.05, end("quemamos"), 0.55, 0.15)
music *= g[:, None].astype(np.float32)

# ---------------- efectos ----------------
SF = {}
for d in ["sfx", "ep03/sfx", "ep05/sfx", "ep10/sfx", "ep12/sfx", "ep13/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        if not f.endswith((".mp3", ".wav")) or f.startswith("titan"): continue
        a = load(os.path.join(PUB, d, f)); SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
def fx(name, t, gain=0.5, pan=0.0, dur=None, peak=None):
    a = SF[name]
    if dur:
        a = a[: int(dur * SR)].copy(); f = min(len(a), int(0.3 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    if peak is not None: t -= peak
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41; sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41
for p in parts[1:]: fx("whoosh", p["at"] - 0.35, 0.26)
# gancho
fx("tipeo", st("gancho", "es cierto") - 0.75, 0.16, -0.2, dur=0.8); fx("notif", st("gancho", "es cierto"), 0.32, -0.2)
fx("notif", st("gancho", "Ella le contesta") + 0.1, 0.3, 0.25)
for k in range(7): fx("pop", st("gancho", "dieciocho tareas") + k * 0.22, 0.05, ((k % 2) - 0.5) * 0.8)
fx("ampolla", st("gancho", "Tres semanas") + 0.2, 0.3)
fx("latido", st("gancho", "noventa muertes") - 0.2, 0.3); fx("impacto", st("gancho", "noventa muertes") + 0.05, 0.3, peak=0.15)
tV = st("gancho", "Para llegar")
for i in range(9): fx("feta", tV + 0.25 + i * 0.12, 0.07, (i - 4) / 6, peak=0.19)
tA = st("gancho", "Las atravesó todas")
fx("whoosh", tA, 0.3)
for i in range(9): fx("agujero", tA + 0.05 + (i + 0.5) / 9 * 1.6, 0.09, (i - 4) / 8)
fx("impacto", tA + 1.7, 0.3, peak=0.15)
# «Sí, lo sé»
fx("tipeo", st("silose", "es peligroso") - 0.7, 0.12, 0.2, dur=0.7)
for ph, pan in [("es peligroso", 0.25), ("Una persona que reporte", 0.25), ("es un montón de guita", -0.25), ("sí, lo sé", -0.25)]:
    fx("notif", st("silose", ph), 0.28, pan)
fx("latido", st("silose", "sí, lo sé") + 0.3, 0.3, dur=2.0); fx("impacto", st("silose", "sí, lo sé") + 0.9, 0.28, peak=0.15)
# hoy quemamos todo
fx("tipeo", st("quemamos", "hoy quemamos todo") - 0.8, 0.12, dur=0.8); fx("notif", st("quemamos", "hoy quemamos todo"), 0.26)
fx("fuego", st("quemamos", "hoy quemamos todo", 0, "e") + 0.08, 0.55, peak=0.74)
# el equipo del hospital
fx("monitor", st("hospital", "La barrera") - 0.1, 0.1, 0.3, dur=4.5)
fx("frenada", st("hospital", "Fue un equipo") - 0.05, 0.3, peak=0.71)
# cierre
fx("subida", TL["cta"], 0.3, peak=3.31); fx("impacto", TL["cta"] + 0.02, 0.5, peak=0.15)
fx("pop", TL["cta"] + word("x01", "Tocá") - 0.05, 0.35)

out = music + sfx * 0.9; out[:, 0] += voice; out[:, 1] += voice
out = out[: int(total * SR)]; out = out / max(np.abs(out).max(), 1e-9) * 0.89
raw = os.path.join(OUT, "pre_short13.f32"); out.astype(np.float32).tofile(raw)
mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_short13.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw); print("->", dst, js["input_i"], "LUFS medidos")
