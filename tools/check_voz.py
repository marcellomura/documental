"""Verifica la locución: transcribe cada segmento con whisper y lo compara con el guion (EP=ep10 GUION=... SEGS=s01,s02 PROMPT=0).
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
UNI = "cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciseis diecisiete dieciocho diecinueve veinte veintiuno veintidos veintitres veinticuatro veinticinco veintiseis veintisiete veintiocho veintinueve".split()
DEC = {3: "treinta", 4: "cuarenta", 5: "cincuenta", 6: "sesenta", 7: "setenta", 8: "ochenta", 9: "noventa"}
CEN = {1: "ciento", 2: "doscientos", 3: "trescientos", 4: "cuatrocientos", 5: "quinientos", 6: "seiscientos", 7: "setecientos", 8: "ochocientos", 9: "novecientos"}
def palabras(n):
    """Número entero a palabras en castellano (lo justo para comparar con el guion)."""
    if n < 30: return UNI[n]
    if n < 100: return DEC[n // 10] + ("" if n % 10 == 0 else " y " + UNI[n % 10])
    if n == 100: return "cien"
    if n < 1000: return CEN[n // 100] + ("" if n % 100 == 0 else " " + palabras(n % 100))
    if n < 1000000:
        m, r = divmod(n, 1000)
        return ("mil" if m == 1 else apocope(palabras(m)) + " mil") + ("" if r == 0 else " " + palabras(r))
    m, r = divmod(n, 1000000)
    return ("un millon" if m == 1 else apocope(palabras(m)) + " millones") + ("" if r == 0 else " " + palabras(r))
def apocope(t):
    return t[:-1] if t.endswith("uno") else t   # treinta y un mil, veintiun mil
def cifras(txt):
    # whisper escribe a veces las cifras con dígitos ("31.202", "2024", "120.000"): pasarlas a palabras
    return re.sub(r"\d+(?:[.,]\d{3})*", lambda mm: " " + palabras(int(re.sub(r"[.,]", "", mm.group()))) + " ", txt)
PROMPT = os.environ.get("PROMPT", "1") != "0"   # PROMPT=0: sin el guion como pista, para que whisper no "oiga" lo que espera
m = WhisperModel("small", device="cpu", compute_type="int8")
bad = 0
for sid in ids:
    f = os.path.join(ROOT, "audio", EP, f"{sid}_raw.mp3")
    if not os.path.exists(f): continue
    exp = segs[sid]
    for k, v in DISP.items(): exp = exp.replace(k, v)
    a = [norm(w) for w in exp.split() if norm(w)]
    segs_w, _ = m.transcribe(f, language="es", beam_size=5, initial_prompt=exp if PROMPT else None)
    txt = " ".join(s.text for s in segs_w)
    txt = cifras(txt)
    b = [norm(w) for w in txt.split() if norm(w)]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    diffs = [(tag, " ".join(a[i1:i2]), " ".join(b[j1:j2])) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal"]
    print(f"{sid}: {len(a)} palabras, ratio {sm.ratio():.3f}, diferencias {len(diffs)}")
    for d in diffs: print("    ", d)
    bad += len(diffs)
print("TOTAL diferencias", bad)
