"""Prepara datos reales del episodio 4 (Súper Niño):
- anomalías de temperatura del mar (NOAA OISST v2.1 vía ERDDAP) -> PNG de calor + grilla para contornos
- mapas Natural Earth simplificados (países, provincias argentinas, ríos del Litoral)
- series ONI y semanales Niño 3.4 / 1+2 (NOAA CPC)"""
import csv, json, os, re
import numpy as np
from PIL import Image
from shapely.geometry import shape, mapping
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "data_ep04"); PUB = os.path.join(ROOT, "video/public/ep04/maps"); DATA = os.path.join(ROOT, "video/src/data/ep04")

def grid(name):
    lat, lon, v = [], [], []
    with open(os.path.join(D, name)) as f:
        r = csv.reader(f); next(r); next(r)
        for row in r:
            lat.append(float(row[2])); lon.append(float(row[3])); v.append(float(row[4]) if row[4] not in ("NaN", "") else np.nan)
    lats = sorted(set(lat)); lons = sorted(set(lon))
    G = np.full((len(lats), len(lons)), np.nan, np.float32)
    li = {x: i for i, x in enumerate(lats)}; lo = {x: i for i, x in enumerate(lons)}
    for a, b, c in zip(lat, lon, v): G[li[a], lo[b]] = c
    return np.array(lats), np.array(lons), G

# paleta divergente: azul profundo -> blanco -> ámbar -> rojo -> magenta
STOPS = [(-3.0, (20, 60, 150)), (-1.5, (60, 140, 220)), (-0.4, (200, 225, 245)), (0.0, (245, 245, 240)), (0.5, (255, 222, 140)),
         (1.2, (255, 170, 60)), (2.0, (240, 90, 40)), (3.0, (200, 25, 45)), (4.5, (140, 0, 90))]
def cmap(v):
    xs = [s[0] for s in STOPS]; cs = np.array([s[1] for s in STOPS], np.float32)
    v = np.clip(v, xs[0], xs[-1])
    out = np.zeros(v.shape + (3,), np.float32)
    for k in range(3): out[..., k] = np.interp(v, xs, cs[:, k])
    return out

for yr in ["2026", "2015", "1997"]:
    lats, lons, G = grid(f"sst{yr}.csv")
    # imagen equirectangular (lon 0..360, lat -60..60), norte arriba
    img = cmap(np.nan_to_num(G, nan=0.0))
    alpha = np.where(np.isnan(G), 0, 255).astype(np.uint8)
    rgba = np.dstack([img.astype(np.uint8), alpha])[::-1]
    im = Image.fromarray(rgba, "RGBA").resize((lons.size * 4, lats.size * 4), Image.BICUBIC)
    im.save(os.path.join(PUB, f"sst_{yr}.png"), optimize=True)
    # grilla 2° para contornos en el globo (tierra = 0)
    G2 = np.nan_to_num(G, nan=0.0)[::4, ::4]
    json.dump({"lat0": float(lats[0]), "lon0": float(lons[0]), "d": float((lats[4] - lats[0])), "w": int(G2.shape[1]), "h": int(G2.shape[0]),
               "v": [round(float(x), 2) for x in G2.ravel()]}, open(os.path.join(DATA, f"sst_{yr}_grid.json"), "w"))
    print(yr, G.shape, "max", np.nanmax(G), "img", im.size)

def rnd(geom, tol, prec=3):
    g = shape(geom).simplify(tol, preserve_topology=True)
    def r(c):
        if isinstance(c, (list, tuple)) and c and isinstance(c[0], (int, float)): return [round(c[0], prec), round(c[1], prec)]
        return [r(x) for x in c]
    m = mapping(g); return {"type": m["type"], "coordinates": r(m["coordinates"])}

# países (50m) simplificados
C = json.load(open(os.path.join(D, "ne50_countries.geojson")))
feats = [{"type": "Feature", "properties": {"n": f["properties"]["NAME_ES"] or f["properties"]["NAME"], "a3": f["properties"]["ADM0_A3"], "c": f["properties"]["CONTINENT"]},
          "geometry": rnd(f["geometry"], 0.08, 2)} for f in C["features"]]
json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(DATA, "countries50.json"), "w"), separators=(",", ":"))
C = json.load(open(os.path.join(D, "ne110.geojson")))
feats = [{"type": "Feature", "properties": {"a3": f["properties"]["ADM0_A3"]}, "geometry": rnd(f["geometry"], 0.2, 2)} for f in C["features"]]
json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(DATA, "countries110.json"), "w"), separators=(",", ":"))

# provincias argentinas
A = json.load(open(os.path.join(D, "ne10_admin1.geojson")))
prov = [f for f in A["features"] if f["properties"].get("adm0_a3") == "ARG"]
feats = [{"type": "Feature", "properties": {"n": f["properties"]["name"]}, "geometry": rnd(f["geometry"], 0.02, 3)} for f in prov]
json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(DATA, "arg_provincias.json"), "w"), separators=(",", ":"))
print("provincias", sorted(f["properties"]["n"] for f in feats))

# ríos del Litoral
R = json.load(open(os.path.join(D, "ne10_rivers.geojson")))
want = {"Paraná": "Paraná", "Parana": "Paraná", "Uruguay": "Uruguay", "Paraguay": "Paraguay", "Iguazú": "Iguazú", "Iguaçu": "Iguazú", "Río de la Plata": "Río de la Plata"}
rv = []
for f in R["features"]:
    n = f["properties"].get("name") or ""
    if n in want: rv.append({"type": "Feature", "properties": {"n": want[n]}, "geometry": rnd(f["geometry"], 0.01, 3)})
json.dump({"type": "FeatureCollection", "features": rv}, open(os.path.join(DATA, "rios.json"), "w"), separators=(",", ":"))
print("ríos", sorted(set(f["properties"]["n"] for f in rv)))

# ONI
rows = [l.split() for l in open(os.path.join(D, "oni.txt")).read().splitlines()[1:]]
json.dump([[r[0], int(r[1]), float(r[3])] for r in rows], open(os.path.join(DATA, "oni.json"), "w"))
json.dump(json.load(open(os.path.join(D, "weekly.json"))), open(os.path.join(DATA, "weekly.json"), "w"))
for f in os.listdir(DATA): print(f, os.path.getsize(os.path.join(DATA, f)))
