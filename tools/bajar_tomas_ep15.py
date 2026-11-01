"""Descarga las tomas de la locución del ep15 desde los estados de ElevenLabs (JSON de creative_get_flow_run_status).
Identifica el segmento de cada toma por el texto del guion y guarda audio/ep15/takes/<id>_<generation_id>.mp3 + manifest.json.
Uso: python3 tools/bajar_tomas_ep15.py estado1.json [estado2.json ...]"""
import json, os, sys, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = json.load(open(os.path.join(ROOT, "guion", "ep15_menocchio.json")))
SEGS = {s["texto"]: s["id"] for s in G["segmentos"] + G["vertical"]}
OUT = os.path.join(ROOT, "audio", "ep15", "takes")
MAN = os.path.join(OUT, "manifest.json")
man = json.load(open(MAN)) if os.path.exists(MAN) else {}
for f in sys.argv[1:]:
    d = json.load(open(f))
    for m in d.get("media", []):
        sid = SEGS.get(m["prompt"])
        if not sid:
            print("sin segmento:", m["prompt"][:50]); continue
        gid = m["generation_id"]
        dest = os.path.join(OUT, f"{sid}_{gid}.mp3")
        if not os.path.exists(dest):
            subprocess.run(["curl", "-sS", "-o", dest, m.get("master_url") or m["url"]], check=True)
        man[gid] = {"seg": sid, "dur": m.get("duration_secs"), "archivo": os.path.basename(dest)}
json.dump(man, open(MAN, "w"), indent=1, ensure_ascii=False)
por = {}
for g, v in man.items(): por.setdefault(v["seg"], []).append(g)
print(len(man), "tomas;", {k: len(v) for k, v in sorted(por.items())})
