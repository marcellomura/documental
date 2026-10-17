"""Short vertical del episodio 14 (CAMPO DEL CIELO) para YouTube Shorts y TikTok: el gancho de 1783 (la mesa de hierro,
la pólvora y la desaparición), la caída de hace 4.000 años hasta el impacto, la grúa de 1990 y el cierre que manda al
video completo. Arma la línea de tiempo (video/src/data/ep14/short.json + words_short.json) y la mezcla
(audio/mix/mezcla_short14.wav, -14 LUFS, pico -1,5 dBTP)."""
import json, os, re, shutil, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
W = json.load(open(os.path.join(ROOT, "video/src/data/ep14/words.json")))
W.update(json.load(open(os.path.join(ROOT, "audio/ep14/short/final/words.json"))))
TLm = json.load(open(os.path.join(ROOT, "video/src/data/ep14/timeline.json")))
D, INS = TLm["durations"], TLm["inserts"]
PUB = os.path.join(ROOT, "video/public")
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
shutil.copy(os.path.join(ROOT, "audio/ep14/short/final/x01.wav"), os.path.join(PUB, "ep14/narracion/x01.wav"))
D["x01"] = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(PUB, "ep14/narracion/x01.wav")],
                                capture_output=True, text=True).stdout)

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

def word(seg, phrase, n=0, which="s"):
    """tiempo de una frase dentro de su segmento; compara sin espacios (igual que cue() en video/src/ep14/lib.ts)"""
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
def ins_end(seg, k): a, s = INS[seg][k]; return a + s

# (id, segmento, inicio, fin): los silencios internos ya están en la locución procesada
PLAN = [("gancho", "s01", 0.0, ins_end("s01", 2)),                                   # hasta «nadie la volvió a ver» + silencio
        ("caida", "s02", word("s02", "Un bloque") - 0.06, ins_end("s02", 1)),          # hasta el impacto (silencio de 2,6 s)
        ("grua", "s06", word("s06", "Y alguien") - 0.06, ins_end("s06", 1)),           # hasta «En el camión va el meteorito» + silencio
        ("cta", "x01", 0.0, D["x01"])]
GAP, LEAD, END = 0.35, 0.15, 3.0
parts, at = [], LEAD
for pid, seg, fr, to in PLAN:
    parts.append({"id": pid, "seg": seg, "from": round(fr, 3), "to": round(to, 3), "at": round(at, 3)})
    at += to - fr + GAP
TL = {"fps": 30, "parts": parts, "cta": round(parts[-1]["at"], 3), "total": round(at - GAP + END, 3)}
json.dump(TL, open(os.path.join(ROOT, "video/src/data/ep14/short.json"), "w"), indent=1)
json.dump({"x01": W["x01"]}, open(os.path.join(ROOT, "video/src/data/ep14/words_short.json"), "w"), ensure_ascii=False, indent=0)
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
def rel(pid, x):
    """un tiempo relativo al segmento original, llevado al short"""
    p = P[pid]; return p["at"] + x - p["from"]
def end(pid):
    p = P[pid]; return p["at"] + p["to"] - p["from"]
for p in parts:
    a = load(os.path.join(PUB, f"ep14/narracion/{p['seg']}.wav"), stereo=False)
    seg = a[int(p["from"] * SR): int(p["to"] * SR)].copy()
    f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(p["at"] * SR); voice[i:i + len(seg)] += seg

# ---------------- música: los mismos temas del episodio, con sus golpes en los mismos lugares ----------------
TARGET = 10 ** (-16 / 20)
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
def place(name, g0, g1, off=0.0, fin=0.05, fout=0.5, gain=1.0):
    src = load(os.path.join(PUB, f"ep14/music/{name}.mp3"))
    ref = rms(src[int(3 * SR): int(min(len(src) / SR - 6, 60) * SR)])
    i0, i1, o = int(g0 * SR), int(g1 * SR), int(off * SR)
    seg = src[o:o + (i1 - i0)].copy() * (TARGET / ref); n = len(seg)
    env = np.ones(n, np.float32)
    fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
    if fi: env[:fi] = np.linspace(0, 1, fi)
    if fo: env[-fo:] *= np.linspace(1, 0, fo)
    music[i0:i0 + n] += seg * env[:, None] * gain
T_IMP = rel("caida", INS["s02"][1][0] + 0.1)
T_CAM = rel("grua", INS["s06"][1][0] + 0.05)
place("tema", 0.0, P["caida"]["at"] + 0.2, 0.0, fin=0.05, fout=0.4)
t0 = P["caida"]["at"] - 0.3
place("impacto", t0, P["grua"]["at"] + 0.1, 53.32 - (T_IMP - t0), fin=0.8, fout=0.8)
t0 = P["grua"]["at"] + 0.5
place("robo", t0, TL["cta"] + 0.2, 32.78 - (T_CAM - t0), fin=0.05, fout=1.2)
place("tema", TL["cta"] - 0.3, total, 74.5, fin=0.05, fout=2.2)

env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
g = 0.6 - (0.6 - 0.18) * env
def dip(a, b, level, ramp=0.3):
    global g
    i0, i1, r = int(a * SR), int(b * SR), int(ramp * SR)
    d = np.ones(N); d[i0:i1] = level
    d[max(0, i0 - r):i0] = np.linspace(1, level, i0 - max(0, i0 - r)); d[i1:i1 + r] = np.linspace(level, 1, len(d[i1:i1 + r]))
    g = g * d
a, s = INS["s01"][1]; dip(rel("gancho", a) - 0.1, rel("gancho", a + s), 0.3, 0.15)     # la pólvora
dip(T_IMP - 0.05, end("caida"), 1.6, 0.2)                                               # el impacto
dip(st("caida", "Pesa cientos") - 0.2, st("caida", "lo calienta", 0, "e") + 0.2, 0.65)
music *= g[:, None].astype(np.float32)

# ---------------- efectos ----------------
SRC = {**{f[:-4]: f"ep14/sfx/{f}" for f in os.listdir(os.path.join(PUB, "ep14/sfx")) if f.endswith(".mp3")},
       "golpe": "ep13/sfx/impacto.mp3", "subida": "ep13/sfx/subida.mp3", "whoosh": "ep12/sfx/whoosh.mp3", "crujido": "ep12/sfx/crujido.mp3",
       "explosion": "ep11/sfx/explosion.mp3", "boom": "sfx/boom.mp3", "pop": "sfx/pop.mp3", "latido": "ep13/sfx/latido.mp3", "tictac": "ep05/sfx/tictac.mp3"}
SF = {}
for k, r in SRC.items():
    a = load(os.path.join(PUB, r)); SF[k] = a / (np.abs(a).max() + 1e-9) * 0.5
def fx(name, t, gain=0.5, pan=0.0, dur=None, peak=None, skip=0.0):
    a = SF[name][int(skip * SR):]
    if dur:
        a = a[: int(dur * SR)].copy(); f = min(len(a), int(0.3 * SR)); a[-f:] *= np.linspace(1, 0, f)[:, None]
    if peak is not None: t -= peak
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41; sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41
def bed(name, t, sec, gain=0.1, xf=0.6):
    src = SF[name]; L = len(src) / SR; left = sec; tt = t; first = True
    while left > 0.05:
        d = min(left, L); a = src[: int(d * SR)].copy(); n = len(a)
        fi, fo = (min(n, int(0.8 * SR)) if first else min(n, int(xf * SR))), min(n, int(xf * SR))
        a[:fi] *= np.linspace(0, 1, fi)[:, None]; a[-fo:] *= np.linspace(1, 0, fo)[:, None]
        i = int(tt * SR); m = min(n, N - i); sfx[i:i + m] += a[:m] * gain
        if d >= left: break
        tt += d - xf; left -= d - xf; first = False
for p in parts[1:]: fx("whoosh", p["at"] - 0.35, 0.24)
# gancho
fx("resonancia", 0.2, 0.26); bed("monte", 0.6, 18.0, 0.07); bed("viento_noche", 17.0, end("gancho") - 17.0, 0.11)
fx("caballos", st("gancho", "en el medio del monte") - 0.4, 0.12, -0.3)
fx("resonancia", st("gancho", "una mesa de hierro") + 0.2, 0.24)
fx("golpe", st("gancho", "catorce toneladas") + 0.1, 0.2)
a, _ = INS["s01"][0]; fx("meteoro_entrada", rel("gancho", a) + 0.3, 0.34, -0.2, skip=2.05)
fx("crujido", st("gancho", "la dio vuelta") + 0.1, 0.22)
a, _ = INS["s01"][1]; fx("polvora", rel("gancho", a) + 0.08, 0.55, peak=0.2); fx("boom", rel("gancho", a) + 0.08, 0.2)
fx("resonancia", st("gancho", "nadie la volvió") + 0.2, 0.18)
# la caída
fx("meteoro_entrada", st("caida", "choca contra") - 0.05, 0.2, -0.3, skip=2.05)
fx("crujido", st("caida", "lo parte"), 0.28, 0.2); fx("explosion", st("caida", "lo parte") + 0.15, 0.16, -0.2, peak=0.54)
fx("lluvia_hierro", T_IMP, 0.22, peak=4.73)
fx("impacto", T_IMP, 0.72, peak=0.37); fx("boom", T_IMP, 0.32); fx("explosion", T_IMP + 0.1, 0.28, 0.25, peak=0.54)
# la grúa
fx("latido", st("grua", "alguien la quiere") - 0.2, 0.2, dur=2.4)
fx("golpe", st("grua", "Veintiuno de enero"), 0.22); fx("tictac", st("grua", "Veintiuno de enero"), 0.08, dur=2.2)
fx("pop", st("grua", "Paraje La Tota") + 0.3, 0.14)
fx("sirena", st("grua", "frena"), 0.27, -0.2, peak=3.07); fx("grua", st("grua", "una grúa") + 0.2, 0.14, 0.35, dur=3.0)
fx("golpe", T_CAM, 0.3); fx("resonancia", T_CAM + 0.1, 0.22)
# cierre
fx("subida", TL["cta"], 0.3, peak=3.31); fx("meteoro_entrada", TL["cta"] - 0.12, 0.22, 0.3, skip=2.05)
fx("impacto", TL["cta"] + 0.02, 0.5, peak=0.37); fx("resonancia", TL["cta"] + 0.3, 0.26)
fx("pop", TL["cta"] + word("x01", "Tocá") - 0.05, 0.35)

out = music + sfx * 0.9; out[:, 0] += voice; out[:, 1] += voice
out = out[: int(total * SR)]; out = out / max(np.abs(out).max(), 1e-9) * 0.89
raw = os.path.join(OUT, "pre_short14.f32"); out.astype(np.float32).tofile(raw)
mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_short14.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw); print("->", dst, js["input_i"], "LUFS medidos")
