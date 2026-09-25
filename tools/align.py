"""Timestamps por palabra (faster-whisper) alineados al texto del guion."""
import json, os, re, difflib, unicodedata
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.environ.get("EP", "")
G = json.load(open(os.path.join(ROOT, "guion", os.environ.get("GUION", "segmentos.json"))))
AUD = os.path.join(ROOT, "audio", EP, "final") if EP else os.path.join(ROOT, "audio", "final")
model = WhisperModel("small", device="cpu", compute_type="int8")

def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)

out = {}
for s in G["segmentos"]:
    sid = s["id"]
    wav = os.path.join(AUD, f"{sid}.wav")
    script = s["texto"].split()
    a = [norm(w) for w in script]
    best = None
    for prompt in (s["texto"], None):
        # con el guion como prompt whisper a veces se saltea tramos: probar sin prompt y quedarse con el mejor
        segs, _ = model.transcribe(wav, language="es", word_timestamps=True, initial_prompt=prompt, beam_size=5)
        rec_try = [w for seg in segs for w in seg.words]
        sm_try = difflib.SequenceMatcher(a=a, b=[norm(w.word) for w in rec_try], autojunk=False)
        ops = sm_try.get_opcodes()
        # palabras del guion sin audio (delete) pesan el doble que las que whisper escribió distinto (p. ej. cifras)
        miss_try = sum(i2 - i1 for tag, i1, i2, _, _ in ops if tag != "equal") + sum(i2 - i1 for tag, i1, i2, _, _ in ops if tag == "delete")
        if best is None or miss_try < best[0]: best = (miss_try, rec_try, sm_try)
        if miss_try <= 1: break
    _, rec, sm = best
    b = [norm(w.word) for w in rec]
    times = [None]*len(script)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2-i1): times[i1+k] = (rec[j1+k].start, rec[j1+k].end)
        elif tag == "replace" and j2 > j1:
            # repartir linealmente el tramo reconocido entre las palabras del guion
            t0, t1 = rec[j1].start, rec[j2-1].end
            n = i2-i1
            for k in range(n): times[i1+k] = (t0+(t1-t0)*k/n, t0+(t1-t0)*(k+1)/n)
    # interpolar huecos
    for i in range(len(times)):
        if times[i] is None:
            prev = next((times[j][1] for j in range(i-1,-1,-1) if times[j]), 0.0)
            nxt = next((times[j][0] for j in range(i+1,len(times)) if times[j]), prev+0.3)
            times[i] = (prev, max(prev+0.05, nxt))
    out[sid] = [{"w": w, "s": round(t[0],3), "e": round(t[1],3)} for w, t in zip(script, times)]
    miss = sum(1 for tag,i1,i2,_,_ in sm.get_opcodes() if tag!="equal" for _ in range(i2-i1))
    print(sid, len(script), "palabras,", miss, "no exactas | rec:", " ".join(w.word for w in rec)[:120])
json.dump(out, open(os.path.join(AUD, "words.json"), "w"), ensure_ascii=False, indent=0)
