"""Imagen satelital del ep15 (EL HOMBRE DE LAS MIL CARAS): Copernicus Sentinel-2 L2A sobre el Parque Nacional El
Impenetrable (las tierras de la ex estancia La Fidelidad) y el río Bermejo. Mosaico de dos cuadrículas de mayo de 2026,
sin nubes (20JPT del 23/5 y 20JQT del 13/5, las dos en UTM 20S), leídas por ventanas del COG público de Earth Search.
Escribe en video/public/ep15/sat/: region.jpg (20 m por píxel), rio.jpg (10 m por píxel, el Bermejo de cerca) y sat.json
con el contorno del parque (OpenStreetMap, relación 10701339) y los lugares en píxeles.
Requiere rasterio, pyproj y Pillow. Uso: python3 -I tools/sat_ep15.py parque_osm.json
Crédito: «Contiene datos modificados de Copernicus Sentinel (2026)» y «© colaboradores de OpenStreetMap»."""
import json, os, sys
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from rasterio.enums import Resampling
from rasterio.warp import transform_bounds
from pyproj import Transformer
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "video", "public", "ep15", "sat"); os.makedirs(OUT, exist_ok=True)
BASE = "https://e84-earth-search-sentinel-data.s3.us-west-2.amazonaws.com/sentinel-2-c1-l2a/20/J"
SCENES = [f"{BASE}/PT/2026/5/S2C_T20JPT_20260523T141113_L2A/TCI.tif", f"{BASE}/QT/2026/5/S2C_T20JQT_20260513T140934_L2A/TCI.tif"]
PLACES = {"parque": (-61.0991, -25.003), "pompeya": (-61.4832, -24.933)}
CROPS = {"region": ((-61.50, -25.32, -60.72, -24.70), 20), "rio": ((-61.15, -24.99, -60.91, -24.81), 10)}
park = json.load(open(sys.argv[1]))["geojson"]["coordinates"][0] if len(sys.argv) > 1 else []

def grade(a):
    """estira los tres canales juntos entre los percentiles 0,5 y 99,7 y levanta un poco las medias (el TCI viene oscuro)"""
    a = a.astype(np.float32)
    v = a[a.sum(axis=2) > 0]
    lo, hi = np.percentile(v, [0.5, 99.7])
    a = np.clip((a - lo) / max(hi - lo, 1), 0, 1) ** 0.85
    return (a * 255).round().astype(np.uint8)

meta = {"scenes": [s.split("/")[-2] for s in SCENES], "date": "mayo de 2026",
        "credit": "Contiene datos modificados de Copernicus Sentinel (2026) · contorno del parque: © colaboradores de OpenStreetMap", "crops": {}}
with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
    srcs = [rasterio.open("/vsicurl/" + u) for u in SCENES]
    crs = srcs[0].crs
    to_utm = Transformer.from_crs("EPSG:4326", crs, always_xy=True)
    for name, ((w, s, e, n), res) in CROPS.items():
        x0, y0, x1, y1 = transform_bounds("EPSG:4326", crs, w, s, e, n)
        W, H = int((x1 - x0) / res), int((y1 - y0) / res)
        tiles = []
        for src in srcs:
            win = from_bounds(x0, y0, x1, y1, transform=src.transform)
            a = src.read(window=win, out_shape=(3, H, W), boundless=True, fill_value=0, resampling=Resampling.average)
            tiles.append(np.transpose(a, (1, 2, 0)).astype(np.float32))
        A, B = tiles
        hasA, hasB = A.sum(axis=2) > 0, B.sum(axis=2) > 0
        both = hasA & hasB
        if both.sum() > 1000:   # la segunda cuadrícula se ajusta a la primera (media y desvío por canal en la franja común)
            for c in range(3):
                ma, sa, mb, sb = A[..., c][both].mean(), A[..., c][both].std(), B[..., c][both].mean(), B[..., c][both].std()
                B[..., c] = np.where(hasB, (B[..., c] - mb) * (sa / max(sb, 1e-3)) + ma, 0)
            # fundido a lo ancho de la franja común: el peso de A baja de 1 a 0 de oeste a este
            cols = np.where(both.any(axis=0))[0]
            c0, c1 = cols.min(), cols.max()
            wa = np.clip((c1 - np.arange(W)) / max(c1 - c0, 1), 0, 1)[None, :]
            wa = np.where(hasA & ~hasB, 1.0, np.where(hasB & ~hasA, 0.0, wa))
            mosaic = A * wa[..., None] + B * (1 - wa[..., None])
        else:
            mosaic = np.where(hasA[..., None], A, B)
        mosaic = np.clip(mosaic, 0, 255).astype(np.uint8)
        img = Image.fromarray(grade(mosaic))
        img = ImageEnhance.Color(img).enhance(1.1)
        img.save(os.path.join(OUT, f"{name}.jpg"), quality=90)
        px = lambda lon, lat: [round((to_utm.transform(lon, lat)[0] - x0) / res, 1), round((y1 - to_utm.transform(lon, lat)[1]) / res, 1)]
        meta["crops"][name] = {"w": W, "h": H, "m_per_px": res, "points": {k: px(*v) for k, v in PLACES.items()},
                               "parque": [px(lon, lat) for lon, lat in park]}
        print(name, W, H, meta["crops"][name]["points"], "huecos:", int((mosaic.sum(axis=2) == 0).sum()))
json.dump(meta, open(os.path.join(OUT, "sat.json"), "w"))
