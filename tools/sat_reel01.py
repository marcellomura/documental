"""Imágenes satelitales del reel 01: Copernicus Sentinel-2 L2A del 19 de octubre de 2026 (sin nubes, en plena búsqueda),
leídas por ventanas del COG público de Earth Search (Element 84). Escribe dos recortes en video/public/reel01/sat/:
region.jpg (de Esquina al paraje El Malezal, 20 m por píxel) y zona.jpg (alrededor de El Malezal, 10 m por píxel),
más sat.json con la posición en píxeles de los lugares, para rotularlos en Remotion.
Requiere rasterio, pyproj y Pillow. Crédito: «Contiene datos modificados de Copernicus Sentinel (2026)»."""
import json, os
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from rasterio.warp import transform_bounds
from rasterio.enums import Resampling
from pyproj import Transformer
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "video", "public", "reel01", "sat"); os.makedirs(OUT, exist_ok=True)
SCENE = "S2A_T21JTG_20261019T140304_L2A"
URL = f"https://e84-earth-search-sentinel-data.s3.us-west-2.amazonaws.com/sentinel-2-c1-l2a/21/J/TG/2026/10/{SCENE}/TCI.tif"
# lugares (OpenStreetMap). La escuela y el casco se cargaron el 29/10 y no coinciden con las distancias de la Policía:
# en el reel solo se marca la zona del paraje.
PLACES = {"esquina": (-59.534, -30.017), "malezal": (-59.1500, -30.0202), "curupi": (-59.14846, -30.02015)}
CROPS = {"region": ((-59.62, -30.16, -59.02, -29.88), 2), "zona": ((-59.26, -30.12, -59.04, -29.92), 1)}

def grade(a):
    """estira los tres canales juntos entre los percentiles 0,5 y 99,7 (así no se corre el balance de color) y levanta
    un poco las medias: el TCI viene oscuro y plano"""
    a = a.astype(np.float32)
    lo, hi = np.percentile(a, [0.5, 99.7])
    a = np.clip((a - lo) / max(hi - lo, 1), 0, 1) ** 0.82
    return (a * 255).round().astype(np.uint8)

meta = {"scene": SCENE, "date": "2026-10-19", "credit": "Contiene datos modificados de Copernicus Sentinel (2026)", "crops": {}}
with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
    with rasterio.open("/vsicurl/" + URL) as src:
        to_utm = Transformer.from_crs("EPSG:4326", src.crs, always_xy=True)
        for name, ((w, s, e, n), f) in CROPS.items():
            b = transform_bounds("EPSG:4326", src.crs, w, s, e, n)
            win = from_bounds(*b, transform=src.transform).round_offsets().round_lengths()
            h, wd = int(win.height) // f, int(win.width) // f
            a = src.read(window=win, out_shape=(3, h, wd), resampling=Resampling.average)
            img = Image.fromarray(grade(np.transpose(a, (1, 2, 0))))
            img = ImageEnhance.Color(img).enhance(1.08)
            img.save(os.path.join(OUT, f"{name}.jpg"), quality=90)
            t = src.window_transform(win)
            pts = {}
            for k, (lon, lat) in PLACES.items():
                x, y = to_utm.transform(lon, lat)
                col, row = ~t * (x, y)
                pts[k] = [round(col / f, 1), round(row / f, 1)]
            meta["crops"][name] = {"w": wd, "h": h, "m_per_px": 10 * f, "points": pts}
            print(name, wd, h, pts)
json.dump(meta, open(os.path.join(OUT, "sat.json"), "w"), indent=1)
