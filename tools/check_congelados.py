"""Busca tramos congelados en un video: muestrea a 2 cuadros por segundo y reporta los lapsos sin cambios.
Uso: python3 tools/check_congelados.py video.mp4 [segundos_minimos=6]
Sale con código 1 si encuentra un tramo quieto más largo que el mínimo (por defecto 6 s)."""
import subprocess, sys
import numpy as np
f = sys.argv[1]; MIN = float(sys.argv[2]) if len(sys.argv) > 2 else 6.0; FPS = 2
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-vf", f"fps={FPS},scale=64:36,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.uint8).reshape(-1, 36, 64).astype(float)
d = np.abs(np.diff(a, axis=0)).mean(axis=(1, 2))
runs, s = [], None
for i, v in enumerate(list(d) + [99]):
    if v < 0.25:
        s = i if s is None else s
    else:
        if s is not None and (i - s) / FPS >= 2: runs.append((s / FPS, i / FPS))
        s = None
largos = [r for r in runs if r[1] - r[0] >= MIN]
fmt = lambda x: f"{int(x // 60)}:{x % 60:04.1f}"
print(f"{f}: {len(a) / FPS:.1f} s analizados")
for r in runs: print(f"  quieto {fmt(r[0])} – {fmt(r[1])} ({r[1] - r[0]:.1f} s){'  <-- LARGO' if r in largos else ''}")
sys.exit(1 if largos else 0)
