"""Datos geográficos del episodio 14 (CAMPO DEL CIELO) para los mapas: provincias del norte (de ep04/arg_provincias),
ríos Salado, Dulce, Bermejo y Paraná (Natural Earth 10 m, dominio público) y los puntos de la historia.
Uso: python3 tools/geo_ep14.py ruta/a/ne_10m_rivers_lake_centerlines.geojson  ->  video/src/data/ep14/geo.json"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOX = (-67.5, -56.5, -34.8, -21.5)   # lon min, lon max, lat min, lat max
def inbox(c): return BOX[0] <= c[0] <= BOX[1] and BOX[2] <= c[1] <= BOX[3]
def rnd(cs): return [[round(c[0], 3), round(c[1], 3)] for c in cs]
prov = json.load(open(os.path.join(ROOT, "video/src/data/ep04/arg_provincias.json")))
KEEP = ["Chaco", "Santiago del Estero", "Tucumán", "Salta", "Formosa", "Santa Fe", "Corrientes", "Catamarca", "Córdoba", "Jujuy", "Misiones", "Entre Ríos", "Buenos Aires", "La Rioja"]
P = {}
for f in prov["features"]:
    n = f["properties"]["n"]
    if n in KEEP:
        g = f["geometry"]
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        P[n] = [[rnd(r) for r in poly] for poly in polys]
riv = json.load(open(sys.argv[1]))
R = {}
for f in riv["features"]:
    n = f["properties"].get("name")
    if n not in ("Salado", "Dulce", "Bermejo", "Paraná", "Paraguay"): continue
    g = f["geometry"]; lines = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
    for ln in lines:
        if any(inbox(c) for c in ln):
            if n == "Salado" and min(c[1] for c in ln) < -33: continue   # el Salado del Norte, no el bonaerense
            R.setdefault(n, []).append(rnd(ln))
# puntos (lon, lat): ciudades de referencia y lugares de la historia
PTS = {
    "Gancedo": [-61.67, -27.49], "Campo del Cielo": [-61.62, -27.55], "La Tota": [-61.725, -27.60],
    "Santiago del Estero": [-64.26, -27.79], "San Miguel de Tucumán": [-65.22, -26.82], "Resistencia": [-58.99, -27.46],
    "Buenos Aires": [-58.38, -34.60], "Santa Fe": [-60.70, -31.63], "Córdoba": [-64.18, -31.42], "Añatuya": [-62.83, -28.46],
}
out = {"provincias": P, "rios": R, "puntos": PTS}
dst = os.path.join(ROOT, "video/src/data/ep14/geo.json")
json.dump(out, open(dst, "w"), ensure_ascii=False, separators=(",", ":"))
print("provincias", list(P), "| ríos", {k: sum(len(l) for l in v) for k, v in R.items()}, "|", os.path.getsize(dst) // 1024, "KB")
