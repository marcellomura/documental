"""Verifica la locución: transcribe cada segmento con whisper y lo compara con el guion (EP=ep10 GUION=... SEGS=s01,s02).
Marca palabras faltantes, cambiadas o agregadas. Los nombres con grafía fonética se comparan contra su ortografía real (campo display)."""
import json, os, re, sys, difflib, unicodedata
os.environ.setdefault("HF_HUB_OFFLINE", "1")
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.environ["EP"]
G = json.load(open(os.path.join(ROOT, "guion", os.environ["GUION"])))
DISP = G.get("display", {})
segs = {s["id"]: s["texto"] for s in G["segmentos"] + G.get("extra_short", [])}
want = os.environ.get("SEGS")
ids = want.split(",") if want else list(segs)
def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)
NUM = {"1940": "mil novecientos cuarenta", "1944": "mil novecientos cuarenta y cuatro", "1950": "mil novecientos cincuenta", "1960": "mil novecientos sesenta",
       "1978": "mil novecientos setenta y ocho", "2025": "dos mil veinticinco", "2026": "dos mil veintiseis"}
m = WhisperModel("small", device="cpu", compute_type="int8")
bad = 0
for sid in ids:
    f = os.path.join(ROOT, "audio", EP, f"{sid}_raw.mp3")
    if not os.path.exists(f): continue
    exp = segs[sid]
    for k, v in DISP.items(): exp = exp.replace(k, v)
    a = [norm(w) for w in exp.split() if norm(w)]
    segs_w, _ = m.transcribe(f, language="es", beam_size=5, initial_prompt=exp)
    txt = " ".join(s.text for s in segs_w)
    for k, v in NUM.items(): txt = txt.replace(k, v)
    b = [norm(w) for w in txt.split() if norm(w)]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    diffs = [(tag, " ".join(a[i1:i2]), " ".join(b[j1:j2])) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal"]
    print(f"{sid}: {len(a)} palabras, ratio {sm.ratio():.3f}, diferencias {len(diffs)}")
    for d in diffs: print("    ", d)
    bad += len(diffs)
print("TOTAL diferencias", bad)
