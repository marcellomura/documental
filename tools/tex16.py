"""Texturas de la Tierra del ep16 a partir de imágenes de la NASA (dominio público), en video/public/ep16/tex:

  day.jpg      8192×4096  Blue Marble Next Generation, noviembre (NASA Earth Observatory)
  night.jpg    8192×4096  Black Marble 2016 (NASA Earth Observatory / Suomi NPP VIIRS)
  clouds.jpg   8192×4096  nubes reales del 1/11/2025: mosaicos VIIRS (Suomi NPP, NOAA-20, NOAA-21) de NASA GIBS
  water.png    4096×2048  máscara de agua (para el brillo especular del sol sobre el océano)
  sa.jpg       detalle de Sudamérica (82° O – 34° O, 0° – 56° S) del Blue Marble a 240 px/grado, reducido

Las descargas van en raw/ep16/tex_src (ver los comandos en el README). Uso: python3 -I tools/tex16.py"""
import os
import numpy as np
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "raw/ep16/tex_src")
OUT = os.path.join(ROOT, "video/public/ep16/tex"); os.makedirs(OUT, exist_ok=True)
W, H = 8192, 4096


def load(name, size=None):
    im = Image.open(os.path.join(SRC, name)).convert("RGB")
    return im.resize(size, Image.LANCZOS) if size else im


# --- día: Blue Marble de noviembre, con un poco de nitidez para el aumento de 5400 a 8192
day = load("bmng_nov_5400.jpg", (W, H)).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
day.save(os.path.join(OUT, "day.jpg"), quality=90, optimize=True)
d = np.asarray(day).astype(np.float32) / 255.0
print("día listo")

# --- noche: Black Marble, curva suave para que las ciudades brillen sin quemar
night = load("blackmarble_3km.jpg", (W, H))
n = np.asarray(night).astype(np.float32) / 255.0
n = np.clip(n ** 1.15 * 1.1, 0, 1)
Image.fromarray((n * 255).astype(np.uint8)).save(os.path.join(OUT, "night.jpg"), quality=90, optimize=True)
print("noche lista")

# --- agua: el océano del Blue Marble es azul oscuro y poco luminoso
r, g, b = d[..., 0], d[..., 1], d[..., 2]
lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
water = ((b > r * 1.05) & (b > g * 0.95) & (lum < 0.32)).astype(np.float32)
wm = Image.fromarray((water * 255).astype(np.uint8)).resize((4096, 2048), Image.BILINEAR).filter(ImageFilter.GaussianBlur(1.2))
wm.save(os.path.join(OUT, "water.png"), optimize=True)
print("agua lista", round(float(water.mean()) * 100, 1), "% de la superficie")

# --- nubes: lo que el satélite ve más claro que la superficie sin nubes, y gris (las nubes no tienen color).
# Tres satélites del mismo día (Suomi NPP, NOAA-20 y NOAA-21, separados por 25 a 50 minutos): el reflejo del sol sobre
# el mar cae en franjas distintas en cada uno, así que la mediana de los tres lo borra y deja las nubes.
def ss(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


clear = water * 0.16 + (1 - water) * (0.2 + 0.85 * lum)     # brillo de la superficie sin nubes en la escala de VIIRS
A = []
for name in ("viirs_20251101_8192.jpg", "VIIRS_NOAA20_CorrectedReflectance_TrueColor_20251101_8192.jpg",
             "VIIRS_NOAA21_CorrectedReflectance_TrueColor_20251101_8192.jpg"):
    vv = np.asarray(load(name, (W, H))).astype(np.float32) / 255.0
    vl = 0.2126 * vv[..., 0] + 0.7152 * vv[..., 1] + 0.0722 * vv[..., 2]
    sat = vv.max(-1) - vv.min(-1)
    a = ss(clear + 0.05, clear + 0.62, vl) * (1 - ss(0.10, 0.30, sat))
    A.append(np.where(vv.max(-1) > 0.02, a, np.nan).astype(np.float32))   # sin datos: la noche polar y alguna cuña
    del vv, vl, sat
with np.errstate(all="ignore"):
    cloud = np.nan_to_num(np.nanmedian(np.stack(A), 0))
del A
c8 = Image.fromarray((np.clip(cloud, 0, 1) ** 0.85 * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
c8.save(os.path.join(OUT, "clouds.jpg"), quality=88, optimize=True)
print("nubes listas, cobertura media", round(float(cloud.mean()) * 100, 1), "%")

# --- detalle de Sudamérica: el cuadro B2 del Blue Marble cubre 90° O – 0°, 0° – 90° S a 240 px/grado
LON0, LON1, LAT0, LAT1 = -82.0, -34.0, 0.0, -56.0
b2 = Image.open(os.path.join(SRC, "bmng_nov_21600_B2.jpg"))
px = lambda lon: int(round((lon + 90.0) * 240)); py = lambda lat: int(round(-lat * 240))
crop = b2.crop((px(LON0), py(LAT0), px(LON1), py(LAT1))).convert("RGB")
crop = crop.resize((int((LON1 - LON0) * 90), int((LAT0 - LAT1) * 90)), Image.LANCZOS)   # 90 px/grado: 4320×5040
crop.save(os.path.join(OUT, "sa.jpg"), quality=90, optimize=True)
print("Sudamérica", crop.size)
for f in sorted(os.listdir(OUT)):
    print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, "KB")
