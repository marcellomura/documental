"""Evalúa las tomas de la locución del ep15: transcribe con whisper y compara con el guion (palabras faltantes, cambiadas o
agregadas), mide silencios internos largos y picos. Elige por segmento la toma con menos errores (desempate: más expresiva).
Salida: audio/ep15/takes/evaluacion.json y elegidas.json."""
import json, os, re, sys, subprocess, difflib, unicodedata
import numpy as np
os.environ.setdefault("HF_HUB_OFFLINE", "1")
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = json.load(open(os.path.join(ROOT, "guion", "ep15_menocchio.json")))
DISP = G.get("display", {})
TXT = {s["id"]: s["texto"] for s in G["segmentos"] + G["vertical"]}
D = os.path.join(ROOT, "audio", "ep15", "takes")
man = json.load(open(os.path.join(D, "manifest.json")))
def norm_words(t):
    t = re.sub(r"\[[^\]]+\]", " ", t)
    for k, v in DISP.items(): t = t.replace(k, v)
    t = t.replace("250.000", "250000").replace("128.000", "128000")
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"(\d)[.,](\d{3})", r"\1\2", t)
    return [w for w in re.sub(r"[^a-z0-9 ]", " ", t).split() if w]
def f0_range(x, sr=16000):
    hop, win, f0 = 160, 640, []
    for i in range(0, len(x) - win, hop):
        fr = x[i:i + win] * np.hanning(win)
        if np.sqrt((fr ** 2).mean()) < 0.01: continue
        ac = np.correlate(fr, fr, "full")[win - 1:]; ac /= ac[0] + 1e-9
        lo, hi = sr // 300, sr // 60; k = lo + np.argmax(ac[lo:hi])
        if ac[k] > 0.45: f0.append(sr / k)
    st = 12 * np.log2(np.array(f0) / np.median(f0))
    return float(np.percentile(st, 95) - np.percentile(st, 5))
model = WhisperModel(os.environ.get("WHISPER", "medium"), device="cpu", compute_type="int8")
ev = {}
for gid, info in sorted(man.items(), key=lambda kv: kv[1]["seg"]):
    p = os.path.join(D, info["archivo"]); seg = info["seg"]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    segs, _ = model.transcribe(p, language="es", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    words = [w for s in segs for w in s.words]
    hyp = norm_words(" ".join(w.word for w in words)); ref = norm_words(TXT[seg])
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
    errs = []
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op != "equal": errs.append(f"{op}: {' '.join(ref[a1:a2])} -> {' '.join(hyp[b1:b2])}")
    nerr = sum(max(a2 - a1, b2 - b1) for op, a1, a2, b1, b2 in sm.get_opcodes() if op != "equal")
    gaps = [round(b.start - a.end, 2) for a, b in zip(words, words[1:]) if b.start - a.end > 1.3]
    ev[gid] = dict(seg=seg, archivo=info["archivo"], dur=round(len(x) / 16000, 2), errores=nerr, wer=round(nerr / max(len(ref), 1), 3),
                   detalle=errs[:12], silencios_largos=gaps, pico_db=round(float(20 * np.log10(np.abs(x).max() + 1e-9)), 1), f0_rango=round(f0_range(x), 1))
    print(seg, gid, ev[gid]["dur"], "err", nerr, "gaps", gaps, "f0", ev[gid]["f0_rango"], "|", "; ".join(errs[:6]))
json.dump(ev, open(os.path.join(D, "evaluacion.json"), "w"), indent=1, ensure_ascii=False)
best = {}
for gid, e in ev.items():
    cur = best.get(e["seg"])
    key = (e["errores"] + 2 * len(e["silencios_largos"]), -e["f0_rango"])
    if cur is None or key < cur[0]: best[e["seg"]] = (key, gid)
eleg = {s: g for s, (k, g) in sorted(best.items())}
json.dump(eleg, open(os.path.join(D, "elegidas.json"), "w"), indent=1)
print("elegidas:", eleg)
