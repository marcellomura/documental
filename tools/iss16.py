"""Pasadas reales de la Estación Espacial (fotos originales de la tripulación, base Gateway to Astronaut Photography of
Earth, NASA JSC; dominio público) convertidas en clips y en datos para el indicador en pantalla.

  python3 -I tools/iss16.py

Lee raw/ep16/iss/<pasada>/*.jpg (4256×2832) y raw/ep16/iss/meta/meta.json (posición bajo la nave y hora de cada foto),
y escribe:
  video/public/ep16/iss/<pasada>.mp4     2560×1704 (cuadro 3:2 completo), 30 cuadros/s, con fundido entre fotos
  video/src/data/ep16/iss.json           por cuadro del clip: lat, lon, altura, hora UTC y |B| del IGRF-14 a esa altura

Descarga (una vez): las fotos se bajan de https://eol.jsc.nasa.gov/DatabaseImages/ESC/large/<misión>/<misión>-E-<n>.JPG
y la posición de https://eol.jsc.nasa.gov/SearchPhotos/photo.pl?mission=<misión>&roll=E&frame=<n>"""
import json, os, subprocess, sys, tempfile
from datetime import datetime, timezone
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from igrf16 import IGRF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw/ep16/iss")
OUT = os.path.join(ROOT, "video/public/ep16/iss"); os.makedirs(OUT, exist_ok=True)
# pasada: (misión, primera foto, última, fotos por segundo de entrada; el clip sale a 30 con fundidos)
SEQ = {
    "boreal": ("ISS030", 271717, 271798, 10),     # 23/4/2012: de San Francisco al sudeste de Buenos Aires, Vía Láctea y luz del aire
    "namerica": ("ISS030", 260394, 260709, 15),   # 22/4/2012: de Idaho al Atlántico Sur, aurora, tormentas y la anomalía
    "carib": ("ISS031", 169858, 170189, 15),      # 29/6/2012: de la Amazonia al Atlántico Sur de noche, relámpagos
    "term": ("ISS030", 140634, 141048, 15),       # 10/3/2012: amanecer sobre Brasil con la Soyuz y la Progress
}
meta = json.load(open(os.path.join(RAW, "meta", "meta.json")))
M = IGRF()
info = {}
for name, (mis, a, b, fin) in SEQ.items():
    frames = list(range(a, b + 1))
    files = [os.path.join(RAW, name, f"{f}.jpg") for f in frames]
    ok = [os.path.getsize(p) > 50000 if os.path.exists(p) else False for p in files]
    frames = [f for f, k in zip(frames, ok) if k]; files = [p for p, k in zip(files, ok) if k]
    # posición y hora por foto (interpolando entre las fotos con metadatos; la longitud se desenrolla)
    m = [r for r in meta[name] if "lat" in r]
    mf = np.array([r["f"] for r in m], float)
    tt = np.array([datetime.strptime(r["fecha"] + " " + r["hora"], "%Y.%m.%d %H:%M:%S").replace(tzinfo=timezone.utc).timestamp() for r in m])
    lon_u = np.degrees(np.unwrap(np.radians([r["lon"] for r in m])))
    f = np.array(frames, float)
    lat = np.interp(f, mf, [r["lat"] for r in m]); lon = (np.interp(f, mf, lon_u) + 540) % 360 - 180
    alt = np.interp(f, mf, [r.get("alt", 400) for r in m]); t = np.interp(f, mf, tt)
    year = 2012 + (t[0] - datetime(2012, 1, 1, tzinfo=timezone.utc).timestamp()) / (366 * 86400)
    F = M.F(lat, lon, year, alt)
    # clip: entrada a fin fps, salida a 30 con fundido lineal entre fotos vecinas
    with tempfile.TemporaryDirectory() as td:
        lst = os.path.join(td, "lista.txt")
        with open(lst, "w") as fh:
            for p in files:
                fh.write(f"file '{p}'\nduration {1 / fin:.6f}\n")
            fh.write(f"file '{files[-1]}'\n")
        mp4 = os.path.join(OUT, f"{name}.mp4")
        cmd = ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
               "-vf", f"fps={fin},scale=2560:1704:flags=lanczos,framerate=fps=30:interp_start=0:interp_end=255:scene=100,format=yuv420p",
               "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-tune", "film", "-movflags", "+faststart", mp4]
        subprocess.run(cmd, check=True)
    nout = int(round(len(files) * 30 / fin))
    k = np.linspace(0, len(files) - 1, nout)                    # foto (fraccionaria) que corresponde a cada cuadro del clip
    i0 = np.floor(k).astype(int); i1 = np.minimum(i0 + 1, len(files) - 1); w = k - i0
    lerp = lambda v: v[i0] * (1 - w) + v[i1] * w
    lon_c = (np.degrees(np.unwrap(np.radians(lon)))[i0] * (1 - w) + np.degrees(np.unwrap(np.radians(lon)))[i1] * w + 540) % 360 - 180
    info[name] = {"mision": mis, "fotos": [frames[0], frames[-1]], "n": nout, "fps": 30,
                  "lat": np.round(lerp(lat), 2).tolist(), "lon": np.round(lon_c, 2).tolist(), "alt": np.round(lerp(alt)).astype(int).tolist(),
                  "t": np.round(lerp(t)).astype(int).tolist(), "F": np.round(lerp(F)).astype(int).tolist()}
    sz = os.path.getsize(mp4) / 1e6
    j = int(np.argmin(F))
    print(f"{name}: {len(files)} fotos → {nout} cuadros ({nout / 30:.1f} s), {sz:.1f} MB · |B| de {F.max():.0f} a {F.min():.0f} nT "
          f"(mínimo en la foto {frames[j]}: {lat[j]:.1f}, {lon[j]:.1f}, {datetime.fromtimestamp(t[j], timezone.utc):%H:%M:%S} UTC)")
json.dump(info, open(os.path.join(ROOT, "video/src/data/ep16/iss.json"), "w"), separators=(",", ":"))
