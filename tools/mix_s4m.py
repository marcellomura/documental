"""Mezcla del short "¿4 millones se van del conurbano?" (s4m) -> audio/mix/mezcla_s4m.wav a -14 LUFS.
Voz de Sturzenegger (del clip original de Bloomberg Línea), narración, música original de ElevenLabs con ducking bajo
la voz y efectos sincronizados con las palabras (video/src/data/s4m/timeline.json, generado por tools/timeline_s4m.py)."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx_synth import flick, ticks

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DATA = os.path.join(ROOT, "video/src/data/s4m")
TL = json.load(open(os.path.join(DATA, "timeline.json")))
W = json.load(open(os.path.join(DATA, "words.json")))
PUB = os.path.join(ROOT, "video/public")
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
S = TL["starts"]; TOTAL = TL["total"]; N = int((TOTAL + 0.5) * SR)

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

def cue(seg, phrase, n=0, which="s"):
    """tiempo GLOBAL en que se dice una frase del segmento"""
    ws = W[seg]; tg = [norm(x) for x in phrase.split()]; found = -1
    for i in range(len(ws) - len(tg) + 1):
        if all(norm(ws[i + k]["w"]) == t for k, t in enumerate(tg)):
            found += 1
            if found == n:
                return S[seg] + (ws[i]["s"] if which == "s" else ws[i + len(tg) - 1]["e"])
    raise KeyError(f"{seg} {phrase} #{n}")

def load(path, stereo=True, ss=None, t=None):
    cmd = ["ffmpeg", "-v", "error"]
    if ss is not None: cmd += ["-ss", str(ss)]
    cmd += ["-i", path]
    if t is not None: cmd += ["-t", str(t)]
    raw = subprocess.run(cmd + ["-vn", "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

def rms(x):
    return float(np.sqrt(np.mean(x ** 2) + 1e-12))

def follower(x, att=0.015, rel=0.35):
    hop = SR // 100; n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    act = np.clip((20 * np.log10(r) + 42) / 14, 0, 1)
    out = np.zeros(n); e = 0; aa, ar = np.exp(-0.01 / att), np.exp(-0.01 / rel)
    for i in range(n):
        c = aa if act[i] > e else ar; e = c * e + (1 - c) * act[i]; out[i] = e
    return np.repeat(out, hop)

# ---------------- voces ----------------
voice = np.zeros(N, np.float32)
narr = []
for k in sorted(S):
    a = load(os.path.join(ROOT, f"audio/s4m/final/{k}.wav"), stereo=False)
    i = int(S[k] * SR); voice[i:i + len(a)] += a[: N - i]; narr.append(a)
ref = rms(np.concatenate(narr)[np.abs(np.concatenate(narr)) > 0.02])

clip = load(os.path.join(ROOT, "raw/s4m/clip_bloomberg.mp4"), stereo=False, ss=TL["clip"]["src"], t=TL["clip"]["dur"])
# corte seco al congelar el cuadro ("Pará") con un fundido de 60 ms
fz = int(TL["clip"]["freeze"] * SR); clip = clip[:fz].copy(); f = int(0.06 * SR); clip[-f:] *= np.linspace(1, 0, f)
f = int(0.03 * SR); clip[:f] *= np.linspace(0, 1, f)
clip *= ref / rms(clip[np.abs(clip) > 0.02]) * 0.95
voice[: len(clip)] += clip

# ---------------- música ----------------
MUS_AT = cue("s01", "Cuatro") - 0.15; MUS_OFF = 2.5
m = load(os.path.join(PUB, "s4m/music/m1_exodo.mp3"))[int(MUS_OFF * SR):]
m *= 10 ** (-16 / 20) / (rms(m) + 1e-12)
i0 = int(MUS_AT * SR); m = m[: N - i0]
e = np.ones(len(m)); a = int(0.25 * SR); e[:a] = np.linspace(0, 1, a)
fo = int(1.6 * SR); e[-fo:] *= np.linspace(1, 0, fo)
music = np.zeros((N, 2), np.float32); music[i0:i0 + len(m)] = m * e[:, None]
env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
g = 0.62 - (0.62 - 0.22) * env
ie = int(TL["endCard"] * SR); g[ie:] *= np.linspace(1, 1.35, N - ie)
music *= g[:, None].astype(np.float32)

# ---------------- efectos ----------------
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx", "ep05/sfx"]:
    for fn in os.listdir(os.path.join(PUB, d)):
        a = load(os.path.join(PUB, d, fn)); SF[fn[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
sfx = np.zeros((N, 2), np.float32)
def put(a, t, gain=0.5):
    i = int(t * SR)
    if i < 0: a = a[-i:]; i = 0
    n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
def fx(name, t, gain=0.5): put(SF[name], t, gain)

# gancho
fx("scratch", TL["clip"]["freeze"] - 0.05, 0.55)
for n in range(3): fx("knock", cue("s01", "pará", n) - 0.02, 0.5)
fx("riser", cue("s01", "Cuatro") - 1.2, 0.3); fx("boom", cue("s01", "Cuatro") - 0.08, 0.75)
b0, b1 = cue("s01", "Cuatro", 1), cue("s01", "van")
for k in range(24): fx("pop", b0 + (b1 - b0) * k / 24, 0.09)
fx("whoosh", cue("s01", "van") + 0.1, 0.35); fx("pop", cue("s01", "conurbano?") - 0.3, 0.4)
fx("pop", cue("s01", "provincia") - 0.1, 0.4); fx("pop", cue("s01", "Córdoba.") - 0.1, 0.35)
fx("boom", cue("s01", "De dónde") - 0.22, 0.6); fx("pop", cue("s01", "De dónde"), 0.35); fx("pop", cue("s01", "puede") - 0.1, 0.35)
# cortes entre segmentos
for k in ["s02", "s04", "s05", "s06", "s07"]: fx("whoosh", S[k] - 0.45, 0.32)
# s02
fx("typewriter", cue("s02", "Federico") - 0.1, 0.18); fx("pop", cue("s02", "entrevista") - 0.1, 0.35)
fx("whoosh", cue("s02", "Y esta") - 0.35, 0.3); fx("pop", cue("s02", "Córdoba:") - 0.1, 0.35)
fx("pop", cue("s02", "cuatro millones") - 0.2, 0.4); fx("pop", cue("s02", "AMBA") - 0.15, 0.4)
for w in ["Dos", "Uno", "otro"]: fx("whoosh", cue("s02", w) - 0.15, 0.3); fx("pop", cue("s02", w), 0.35)
fx("motor", cue("s02", "Vaca") - 0.3, 0.2); fx("knock", cue("s02", "minería.") - 0.35, 0.3); fx("knock", cue("s02", "minería.") - 0.2, 0.25)
# s03
fx("pop", cue("s03", "Según") - 0.1, 0.35); fx("pop", cue("s03", "diez") - 0.2, 0.3)
fx("motor", cue("s03", "energía") - 0.3, 0.2); fx("knock", cue("s03", "minería") - 0.3, 0.3)
fx("cashregister", cue("s03", "noventa") - 0.2, 0.3); fx("boom", cue("s03", "por año.") - 0.2, 0.4)
fx("whoosh", cue("s03", "Sería") - 0.4, 0.3); fx("boom", cue("s03", "siglo") - 0.2, 0.45)
put(SF["tren"], cue("s03", "miles") - 0.6, 0.32); fx("pop", cue("s03", "fábricas") - 0.2, 0.35)
# s04
fx("pop", cue("s04", "Cuatro") - 0.2, 0.3); fx("pop", cue("s04", "treinta") - 0.2, 0.3)
fx("boom", cue("s04", "trescientas") - 0.3, 0.55)
b0, b1 = cue("s04", "trescientas"), cue("s04", "día.") + 0.2
for k in range(30): fx("pop", b0 + (b1 - b0) * k / 30, 0.07)
tt, t1 = cue("s04", "Todos"), cue("s04", "Neuquén") - 0.3
while tt < t1: put(flick(), tt, 0.4); tt += 0.12
fx("pop", cue("s04", "millón") - 0.2, 0.35); fx("whoosh", cue("s04", "dos millones") - 0.3, 0.3)
fx("boom", cue("s04", "multiplicaría") - 0.25, 0.5); fx("stamp", cue("s04", "multiplicaría") - 0.2, 0.4)
# s05
fx("pop", S["s05"] + 0.05, 0.35); fx("stamp", cue("s05", "no se") - 0.1, 0.3)
fx("pop", cue("s05", "dos mil diez") - 0.2, 0.3); fx("pop", cue("s05", "dos mil veintidós,") - 0.2, 0.3)
fx("stamp", cue("s05", "sumó") - 0.2, 0.45)
for w in ["Neuquén", "San Luis,", "Ciudad,", "conurbano,"]: fx("whoosh", cue("s05", w) - 0.25, 0.18); fx("pop", cue("s05", w), 0.3)
# s06
put(ticks(1.2, 12, 1.3), cue("s06", "treinta") - 0.2, 0.18)
fx("pop", cue("s06", "Para") - 0.1, 0.3); fx("pop", cue("s06", "doble,") - 0.7, 0.3)
fx("stamp", cue("s06", "doble,") - 0.2, 0.5); fx("whoosh", cue("s06", "Y no") - 0.3, 0.3)
fx("pop", cue("s06", "Añelo,") - 0.1, 0.4); fx("motor", cue("s06", "Vaca") - 0.3, 0.22)
fx("typewriter", cue("s06", "intendente") - 0.1, 0.16)
fx("pop", cue("s06", "escuelas") - 0.3, 0.35); fx("pop", cue("s06", "hospitales") - 0.3, 0.35)
fx("stamp", cue("s06", "no daban") - 0.1, 0.55)
# s07
fx("pop", cue("s07", "proyección") - 0.2, 0.35); fx("scratch", cue("s07", "hecho.") - 0.05, 0.3)
fx("pop", cue("s07", "tendencia") - 0.3, 0.3); fx("whoosh", cue("s07", "pero") - 0.2, 0.2)
fx("whoosh", cue("s07", "Y vos,") - 0.35, 0.3)
for w in ["Neuquén,", "San Juan", "Salta,"]: fx("pop", cue("s07", w) - 0.1, 0.35)
fx("boom", cue("s07", "mudarías?") - 0.2, 0.45); fx("pop", cue("s07", "Contame") - 0.2, 0.4)
# placa final
fx("riser", TL["endCard"] - 1.5, 0.3); fx("boom", TL["endCard"], 0.6); fx("pop", TL["endCard"] + 0.95, 0.4)

out = music + sfx * 0.9; out[:, 0] += voice; out[:, 1] += voice
out = out[: int(TOTAL * SR)]; out = out / max(np.abs(out).max(), 1e-9) * 0.89
raw = os.path.join(OUT, "pre_s4m.f32"); out.astype(np.float32).tofile(raw)
mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                    capture_output=True, text=True).stderr
js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
dst = os.path.join(OUT, "mezcla_s4m.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", dst], check=True)
os.remove(raw); print("->", dst, js["input_i"], "LUFS medidos", "| total", TOTAL)
