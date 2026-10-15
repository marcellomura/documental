"""Short vertical del episodio 5 (Tu reloj está mal) en tres versiones: YouTube Shorts, Reels de Instagram y TikTok.
El cuerpo es el mismo (Mendoza y Ushuaia de noche, la hora de Brasilia, el jet lag social y la pregunta); cambia el
cierre (x01: "tocá el enlace", x02: "el link está en la bio", x03: "buscá CONTEXTO en YouTube").
Arma la línea de tiempo (video/src/data/ep05/short.json + words_short.json) y las mezclas
(audio/mix/mezcla_short05_{yt,ig,tt}.wav, -14 LUFS, pico -1,5 dBTP)."""
import json, os, re, shutil, subprocess, sys, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
SR = 48000
W = json.load(open(os.path.join(ROOT, "video/src/data/ep05/words.json")))
WX = json.load(open(os.path.join(ROOT, "audio/ep05/short/final/words.json")))
W.update(WX)
D = dict(json.load(open(os.path.join(ROOT, "video/src/data/ep05/timeline.json")))["durations"])
PUB = os.path.join(ROOT, "video/public")
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
for x in ("x01", "x02", "x03"):
    shutil.copy(os.path.join(ROOT, f"audio/ep05/short/final/{x}.wav"), os.path.join(PUB, f"ep05/narracion/{x}.wav"))
    D[x] = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(PUB, f"ep05/narracion/{x}.wav")],
                                capture_output=True, text=True).stdout)

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

def word(seg, phrase, n=0, which="s"):
    """tiempo de una frase dentro de su segmento; compara sin espacios"""
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

# (id, segmento, frase inicial o None, frase final, segundos extra al final, pausa antes del tramo siguiente)
PLAN = [("gancho", "s01", None, "también.", 0.5, 0.35), ("adelantados", "s04", "¿Y cuál usamos?", "dos.", 0.1, 0.35),
        ("importa", "s07", "¿Y qué importa?", "luz.", 0.1, 0.25), ("jetlag", "s07", "Si la hora oficial", "social.", 0.3, 0.35),
        ("pregunta", "s10", "La pregunta es", "comentarios.", 0.2, 0.35)]
CTA = {"yt": "x01", "ig": "x02", "tt": "x03"}
LEAD, END = 0.15, 2.6

parts, at = [], LEAD
for pid, seg, a, b, extra, gap in PLAN:
    fr = 0.0 if a is None else max(0.0, word(seg, a) - 0.06)
    to = min(D[seg], word(seg, b, 0, "e") + 0.14 + extra)
    parts.append({"id": pid, "seg": seg, "from": round(fr, 3), "to": round(to, 3), "at": round(at, 3)})
    at += to - fr + gap
cta_at = round(at, 3)
TL = {"fps": 30, "parts": parts, "cta": cta_at,
      "variants": {v: {"seg": x, "dur": round(D[x], 3), "total": round(cta_at + D[x] + END, 3)} for v, x in CTA.items()}}
json.dump(TL, open(os.path.join(ROOT, "video/src/data/ep05/short.json"), "w"), indent=1)
json.dump(WX, open(os.path.join(ROOT, "video/src/data/ep05/words_short.json"), "w"), ensure_ascii=False, indent=0)
print("cta", cta_at, {v: TL["variants"][v]["total"] for v in CTA}, [(p["id"], round(p["to"] - p["from"], 1), p["at"]) for p in parts])

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

MUS = {k: load(os.path.join(PUB, f"ep05/music/{f}.mp3")) for k, f in [("tictac", "m1_tictac"), ("luz", "m3_luz")]}
SF = {}
for d in ["sfx", "ep02/sfx", "ep03/sfx", "ep05/sfx"]:
    for f in os.listdir(os.path.join(PUB, d)):
        if not f.endswith((".mp3", ".wav")) or f.startswith("titan"): continue
        a = load(os.path.join(PUB, d, f)); SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
from sfx_synth import swell, ticks, flyby

def build(variant):
    x = CTA[variant]; total = TL["variants"][variant]["total"]; N = int((total + 0.5) * SR)
    voice = np.zeros(N, np.float32); music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)
    allp = parts + [{"id": "cta", "seg": x, "from": 0.0, "to": D[x], "at": cta_at}]
    P = {p["id"]: p for p in allp}
    def st(pid, phrase, n=0, which="s"):
        p = P[pid]; return p["at"] + word(p["seg"], phrase, n, which) - p["from"]
    def end(pid):
        p = P[pid]; return p["at"] + p["to"] - p["from"]
    for p in allp:
        a = load(os.path.join(PUB, f"ep05/narracion/{p['seg']}.wav"), stereo=False)
        seg = a[int(p["from"] * SR): int(p["to"] * SR)].copy()
        f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        i = int(p["at"] * SR); voice[i:i + len(seg)] += seg[: N - i]
    # música: el tic-tac del episodio (el golpe del tema cae en el título) y la luz desde "¿y qué importa?"
    TARGET = 10 ** (-16 / 20)
    def place(name, g0, g1, off=0.0, fin=0.05, fout=0.5, gain=1.0):
        src = MUS[name]; ref = np.sqrt(np.mean(src[int(25 * SR): int(60 * SR)] ** 2)) + 1e-12
        i0, i1, o = int(g0 * SR), int(min(g1, total) * SR), int(off * SR)
        seg = src[o:o + (i1 - i0)].copy() * (TARGET / ref); n = len(seg)
        env = np.ones(n, np.float32)
        fi, fo = min(int(fin * SR), n), min(int(fout * SR), n)
        if fi: env[:fi] = np.linspace(0, 1, fi)
        if fo: env[-fo:] *= np.linspace(1, 0, fo)
        music[i0:i0 + n] += seg * env[:, None] * gain
    t_title = st("gancho", "Tu reloj está")
    place("tictac", max(0.0, t_title - 20.0), P["importa"]["at"] + 0.15, max(0.0, 20.0 - t_title), fin=0.8, fout=0.5)
    place("luz", P["importa"]["at"] - 0.25, total, 16.0, fin=0.4, fout=2.2)
    env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
    g = 0.6 - (0.6 - 0.2) * env
    music *= g[:, None].astype(np.float32)
    def put(a, t, gain=0.5):
        if a.ndim == 1: a = np.stack([a, a], axis=1)
        i = int(t * SR)
        if i < 0: a = a[-i:]; i = 0
        n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
    def fx(name, t, gain=0.5, pan=0.0):
        a = SF[name]; i = int(t * SR)
        if i < 0: a = a[-i:]; i = 0
        n = min(len(a), N - i)
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sfx[i:i + n, 0] += a[:n, 0] * gain * l * 1.41; sfx[i:i + n, 1] += a[:n, 1] * gain * r * 1.41
    def tk(t0, t1, rate=1.0, gain=0.15, accel=1.0):
        if t1 > t0: put(ticks(t1 - t0, rate, accel), t0, gain)
    for p in allp[1:]: fx("whoosh", p["at"] - 0.35, 0.3)
    # gancho (los mismos efectos del episodio)
    fx("despertador", 0.05, 0.22); tk(0.4, st("gancho", "Miles") - 0.3, 1.0, 0.13)
    fx("whoosh", st("gancho", "Miles") - 0.4, 0.3)
    fx("whoosh", st("gancho", "En Ushuaia") - 0.4, 0.35); tk(st("gancho", "En Ushuaia") - 0.2, st("gancho", "diez.") + 0.2, 12, 0.1)
    fx("gallo", st("gancho", "amanece") + 0.1, 0.16)
    fx("whoosh", st("gancho", "Y no,") - 0.3, 0.3); fx("pop", st("gancho", "culpa del") + 0.2, 0.3)
    fx("boom", st("gancho", "Es culpa", 1) - 0.1, 0.5); fx("glitch", st("gancho", "reloj.") - 0.1, 0.3); fx("stamp", st("gancho", "reloj.") - 0.05, 0.3)
    fx("whoosh", st("gancho", "Porque") - 0.35, 0.35); fx("pop", st("gancho", "zona"), 0.35); fx("pop", st("gancho", "sola"), 0.3)
    fx("riser", t_title - 2.0, 0.45); fx("boom", t_title, 0.9); fx("campanada", t_title + 0.02, 0.6); fx("glitch", t_title, 0.18)
    # la hora de Brasilia
    fx("boom", st("adelantados", "Menos") - 0.2, 0.6); fx("glitch", st("adelantados", "Menos"), 0.2)
    fx("pop", st("adelantados", "Brasilia,") - 0.2, 0.4); fx("whoosh", st("adelantados", "diez") - 0.2, 0.3)
    fx("pop", st("adelantados", "vivimos") - 0.2, 0.45); fx("pop", st("adelantados", "cordillera,") - 0.2, 0.45)
    # el cuerpo lee la luz y el jet lag social
    fx("pop", P["importa"]["at"] - 0.05, 0.4); fx("stamp", st("importa", "no lee") + 0.3, 0.35); put(swell(2.2), st("importa", "lee la luz") - 0.5, 0.45)
    fx("glitch", st("jetlag", "adelantada,") + 0.2, 0.2); tk(st("jetlag", "adelantada,"), st("jetlag", "adelantada,") + 1.1, 8, 0.1)
    fx("boom", st("jetlag", "jet lag permanente") - 0.1, 0.55)
    put(flyby(3.2), st("jetlag", "sin haberte") - 0.5, 0.55); fx("pop", st("jetlag", "avión.") - 0.1, 0.4)
    fx("boom", st("jetlag", "jet lag social") - 0.1, 0.7); fx("glitch", st("jetlag", "jet lag social"), 0.25)
    # la pregunta
    fx("gallo", st("pregunta", "luz a la mañana") + 0.1, 0.14); fx("campanada", st("pregunta", "luz a la tarde") - 0.05, 0.22)
    fx("pop", st("pregunta", "Dejalo") - 0.2, 0.5)
    # cierre
    fx("riser", cta_at - 1.6, 0.3); fx("boom", cta_at + 0.02, 0.45)
    fx("pop", st("cta", "Cómo") + 0.1, 0.3); fx("pop", st("cta", "proyecto") - 0.1, 0.3)
    last = {"yt": "Tocá", "ig": "El link", "tt": "buscá"}[variant]
    fx("pop", st("cta", last) - 0.05, 0.45); fx("despertador", end("cta") + 0.5, 0.12)
    out = music + sfx * 0.9; out[:, 0] += voice; out[:, 1] += voice
    out = out[: int(total * SR)]; out = out / max(np.abs(out).max(), 1e-9) * 0.89
    raw = os.path.join(OUT, f"pre_short05_{variant}.f32"); out.astype(np.float32).tofile(raw)
    mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
    flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
           f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    dst = os.path.join(OUT, f"mezcla_short05_{variant}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", dst], check=True)
    os.remove(raw); print("->", dst, js["input_i"], "LUFS medidos")

for v in sys.argv[1:] or list(CTA):
    build(v)
