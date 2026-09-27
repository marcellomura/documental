"""Narración del episodio rico: procesa los sXX_raw.mp3 que existan (recorte de pausas + tempo) y,
para los que todavía no se grabaron, genera tiempos provisorios por palabra (a ~2,75 palabras/s)
para poder animar antes de tener la voz. Después: EP=rico GUION=rico.json python3 tools/align.py (solo con todos los audios)."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "audio/rico"); OUT = os.path.join(A, "final"); os.makedirs(OUT, exist_ok=True)
G = json.load(open(os.path.join(ROOT, "guion/rico.json")))
TEMPO = os.environ.get("TEMPO", "1.15")
have = [s["id"] for s in G["segmentos"] if os.path.exists(os.path.join(A, s["id"] + "_raw.mp3"))]
# procesar los reales con proc_audio (mismo tratamiento que el resto del canal)
env = dict(os.environ, EP="rico", TEMPO=TEMPO, NSEG=str(len(have)))
if have:
    # proc_audio recorre s01..sNSEG: requiere que los reales sean los primeros consecutivos
    subprocess.run([sys.executable, os.path.join(ROOT, "tools/proc_audio.py")], env=env, check=True)
dur = json.load(open(os.path.join(OUT, "durations.json"))) if have else {}
words = json.load(open(os.path.join(OUT, "words.json"))) if os.path.exists(os.path.join(OUT, "words.json")) else {}
RATE = float(os.environ.get("RATE", "2.75"))
for s in G["segmentos"]:
    sid = s["id"]
    if sid in dur and sid in words and os.environ.get("FAKE_ALL") != "1":
        continue
    ws = s["texto"].split()
    if sid not in dur or os.environ.get("FAKE_ALL") == "1":
        dur[sid] = round(len(ws) / RATE + 0.3, 3)
    tot = sum(len(w) + 3 for w in ws); t = 0.1; lst = []
    for w in ws:
        d = (len(w) + 3) / tot * (dur[sid] - 0.3)
        lst.append({"w": w, "s": round(t, 3), "e": round(t + d * 0.9, 3)}); t += d
    words[sid] = lst
json.dump(dur, open(os.path.join(OUT, "durations.json"), "w"), indent=1)
json.dump(words, open(os.path.join(OUT, "words.json"), "w"), ensure_ascii=False, indent=0)
print("reales:", have, "| total voz", round(sum(dur.values()), 1))
