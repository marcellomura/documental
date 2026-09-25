"""Shorts verticales del episodio 4 (Súper Niño): uno para YouTube Shorts y otro para TikTok.
Recorta frases de la narración ya generada, arma la línea de tiempo de cada uno (video/src/data/ep04/shorts.json)
y su mezcla (audio/mix/mezcla_short4_yt.wav, audio/mix/mezcla_short4_tt.wav) a -14 LUFS."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx_synth import rain, wind, thunder, swell, powerdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
W = json.load(open(os.path.join(ROOT, "video/src/data/ep04/words.json")))
D = json.load(open(os.path.join(ROOT, "video/src/data/ep04/durations.json")))
PUB = os.path.join(ROOT, "video/public")
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
    raise KeyError(f"{seg} {phrase} #{n}")

# (id, segmento, frase inicial o None = desde el principio, frase final o None = hasta el final)
PLANS = {
    "yt": [("dato", "s01", None, "año."), ("ciudad", "s01", "Y lo que", "verano."), ("titulo", "s01", "Esto es", None),
           ("mapa", "s07", "Lluvias", "vigilancia."), ("dengue", "s08", "Pero", None), ("cierre", "s10", "La pregunta", "preparados.")],
    "tt": [("dato", "s01", None, "normal."), ("titulo", "s01", "Esto es", None), ("normal", "s03", None, "gigante."),
           ("pileta", "s03", "Empujan", "alto."), ("nino", "s04", None, "mudan."), ("lluvias", "s04", "Y las", None),
           ("inundacion", "s06", "En mil", "Fe."), ("cierre", "s10", "La pregunta", "preparados.")],
}
GAP, LEAD = 0.3, 0.2
END = {"yt": 2.9, "tt": 3.6}  # el de YouTube queda por debajo de 60 s

def build(plan, end):
    parts, at = [], LEAD
    for pid, seg, a, b in plan:
        fr = 0.0 if a is None else max(0.0, word(seg, a) - 0.06)
        to = D[seg] if b is None else min(D[seg], word(seg, b, 0, "e") + 0.14)
        parts.append({"id": pid, "seg": seg, "from": round(fr, 3), "to": round(to, 3), "at": round(at, 3)})
        at += to - fr + GAP
    end_card = round(at - GAP + 0.25, 3)
    return {"fps": 30, "parts": parts, "endCard": end_card, "total": round(end_card + end, 3)}

TLS = {k: build(v, END[k]) for k, v in PLANS.items()}
json.dump(TLS, open(os.path.join(ROOT, "video/src/data/ep04/shorts.json"), "w"), indent=1)
for k, v in TLS.items():
    print(k, "total", v["total"], "placa", v["endCard"], [(p["id"], round(p["to"] - p["from"], 1)) for p in v["parts"]])

def load(path, stereo=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

MUSIC = load(os.path.join(PUB, "ep04/music/m1_oceano.mp3"))
SF = {}
for f in os.listdir(os.path.join(PUB, "sfx")):
    a = load(os.path.join(PUB, "sfx", f)); SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5

def follower(x, att=0.015, rel=0.35):
    hop = SR // 100; n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    act = np.clip((20 * np.log10(r) + 42) / 14, 0, 1)
    out = np.zeros(n); e = 0; aa, ar = np.exp(-0.01 / att), np.exp(-0.01 / rel)
    for i in range(n):
        c = aa if act[i] > e else ar; e = c * e + (1 - c) * act[i]; out[i] = e
    return np.repeat(out, hop)

def mix(key, music_off):
    tl = TLS[key]; parts = tl["parts"]; total = tl["total"]; N = int((total + 0.5) * SR)
    voice = np.zeros(N, np.float32); sfx = np.zeros((N, 2), np.float32)
    P = {p["id"]: p for p in parts}
    def st(pid, phrase, n=0, which="s"):
        p = P[pid]; return p["at"] + word(p["seg"], phrase, n, which) - p["from"]
    for p in parts:
        a = load(os.path.join(PUB, f"ep04/narracion/{p['seg']}.wav"), stereo=False)
        seg = a[int(p["from"] * SR): int(p["to"] * SR)].copy()
        f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        i = int(p["at"] * SR); voice[i:i + len(seg)] += seg
    m = MUSIC[int(music_off * SR):][:N].copy()
    m *= 10 ** (-16 / 20) / (np.sqrt(np.mean(m ** 2)) + 1e-12)
    fo = int(1.8 * SR); e = np.ones(len(m)); e[:int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR)); e[-fo:] = np.linspace(1, 0, fo)
    music = np.zeros((N, 2), np.float32); music[: len(m)] = m * e[:, None]
    env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
    g = 0.62 - (0.62 - 0.22) * env
    i0 = int(tl["endCard"] * SR); g[i0:] *= np.linspace(1, 1.4, N - i0)
    music *= g[:, None].astype(np.float32)
    def fx(name, t, gain=0.5):
        a = SF[name]; i = int(t * SR); n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
    def put(a, t, gain=0.5):
        i = int(t * SR); n = min(len(a), N - i); sfx[i:i + n] += a[:n] * gain
    # cortes entre partes
    for p in parts[1:]: fx("whoosh", p["at"] - 0.3, 0.3)
    # comunes
    fx("pop", st("dato", "cuatro") - 0.3, 0.45)
    fx("riser", st("titulo", "Esto es") - 0.6, 0.35); fx("boom", st("titulo", "Súper") - 0.05, 0.8); put(thunder(3.5), st("titulo", "Súper"), 0.45)
    fx("pop", st("cierre", "preparados."), 0.35)
    fx("riser", tl["endCard"] - 1.6, 0.4); fx("boom", tl["endCard"], 0.7); fx("pop", tl["endCard"] + 0.9, 0.45)
    if key == "yt":
        fx("pop", st("dato", "tres grados") - 0.2, 0.4)
        b0, b1 = st("dato", "En más") + 0.5, st("dato", "tan caliente") - 0.2
        for i in range(0, 44, 3): fx("pop", b0 + (b1 - b0 - 0.5) * i / 44, 0.12)
        fx("boom", st("dato", "tan caliente") - 0.05, 0.6)
        put(rain(2.4), st("ciudad", "llueve") - 0.4, 0.3); fx("pop", st("ciudad", "tu ciudad") - 0.2, 0.45)
        put(rain(8.0), st("mapa", "Misiones,") - 0.5, 0.25)
        for w in ["Misiones,", "Corrientes,", "Chaco,", "Formosa,", "Santa Fe", "Entre Ríos."]: fx("pop", st("mapa", w) - 0.15, 0.35)
        fx("pop", st("dengue", "más lluvia") - 0.2, 0.35); fx("pop", st("dengue", "más calor") - 0.2, 0.35)
        fx("boom", st("dengue", "mosquitos.") - 0.3, 0.5); fx("glitch", st("dengue", "dengue.") - 0.6, 0.3)
    else:
        put(wind(5.0, 0.6, 1.0), st("normal", "vientos") - 0.3, 0.3); fx("pop", st("normal", "ventilador") - 0.3, 0.4)
        fx("pop", st("pileta", "allá"), 0.4)
        put(wind(3.0, 0.8, 0.0), P["nino"]["at"], 0.28); put(powerdown(1.5), st("nino", "apaga.") - 0.2, 0.35)
        put(swell(3.0), st("nino", "vuelve") - 0.8, 0.45)
        put(rain(3.0), st("lluvias", "nuestro") - 0.6, 0.35)
        put(thunder(4.0), st("inundacion", "mil novecientos") - 0.1, 0.7)
        for w in ["ciento", "diecisiete", "cuatro millones"]: fx("pop", st("inundacion", w) - 0.2, 0.4)
    out = music + sfx * 0.9; out[:, 0] += voice; out[:, 1] += voice
    out = out[: int(total * SR)]; out = out / max(np.abs(out).max(), 1e-9) * 0.89
    raw = os.path.join(OUT, f"pre_short4_{key}.f32"); out.astype(np.float32).tofile(raw)
    mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
    flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
           f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    dst = os.path.join(OUT, f"mezcla_short4_{key}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", dst], check=True)
    os.remove(raw); print(key, "->", dst, js["input_i"], "LUFS medidos")

if "--solo-tiempos" not in sys.argv:
    mix("yt", 0.0)
    mix("tt", 30.0)
