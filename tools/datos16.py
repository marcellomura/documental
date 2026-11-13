"""Capas de datos del ep16, todas calculadas con el IGRF-14 de tools/igrf16.py:

  video/public/ep16/data/F_AAAA.png     intensidad total en superficie, 720×360, 16 bits en R (alto) y G (bajo):
                                        F = 15.000 + v·55.000 nT, v = (R·256 + G) / 65535. Años 1900…2025 cada 5 y 2030.
  video/public/ep16/data/br_cmb_2025.png  campo radial en el borde del núcleo (r = 3.485 km), mismo formato:
                                        Br = (v·2 − 1)·1.000.000 nT (positivo = sale). Grado 13.
  video/public/ep16/data/br_cmb10_AAAA.png  lo mismo truncado al grado 10 (comparable entre 1900, 1960 y 2025).
  video/public/ep16/data/belt_h.png     altura (km) de la superficie de campo constante donde rebotan las partículas del
                                        cinturón interior: h = v·4.000 km. B elegido para que el punto más bajo quede a 200 km.
  video/src/data/ep16/campo.json        series y geometría: áreas débiles por año, dipolo excéntrico por año, mínimo,
                                        órbita del Hubble en 24 horas con los tramos dentro de la anomalía, líneas de campo
                                        y cinturón interior (polilíneas en radios terrestres, x hacia 0° de longitud, z al norte).

Uso: python3 tools/datos16.py"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from igrf16 import IGRF, A, NMAX

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "video/public/ep16/data"); os.makedirs(PUB, exist_ok=True)
DATA = os.path.join(ROOT, "video/src/data/ep16"); os.makedirs(DATA, exist_ok=True)
M = IGRF()
RE = 6371.2


def legendre(theta, nmax=NMAX):
    """P y dP/dθ de Schmidt para un vector de colatitudes (rad): arrays (nmax+1, nmax+1, len(theta))"""
    ct, st = np.cos(theta), np.maximum(np.sin(theta), 1e-10)
    P = np.zeros((nmax + 2, nmax + 2, len(theta))); dP = np.zeros_like(P); P[0, 0] = 1
    for n in range(1, nmax + 1):
        for m in range(n + 1):
            if n == m:
                k = np.sqrt(1 - 1 / (2 * m)) if m > 1 else 1.0
                P[n, m] = k * st * P[n - 1, m - 1]; dP[n, m] = k * (st * dP[n - 1, m - 1] + ct * P[n - 1, m - 1])
            else:
                den = np.sqrt(n * n - m * m); k1 = (2 * n - 1) / den
                k2 = np.sqrt((n - 1) ** 2 - m * m) / den if n > 1 else 0.0
                P[n, m] = k1 * ct * P[n - 1, m] - (k2 * P[n - 2, m] if n > 1 else 0)
                dP[n, m] = k1 * (ct * dP[n - 1, m] - st * P[n - 1, m]) - (k2 * dP[n - 2, m] if n > 1 else 0)
    return P[:nmax + 1, :nmax + 1], dP[:nmax + 1, :nmax + 1], st


def grid_B(year, r, theta, phi, nmax=NMAX):
    """B en una grilla separable: r y theta por fila (vectores de igual largo), phi por columna. Devuelve Br, Bt, Bp (filas × columnas)."""
    g, h = M.coeffs(year)
    P, dP, st = legendre(theta, nmax)
    mm = np.arange(nmax + 1)
    C, S = np.cos(np.outer(mm, phi)), np.sin(np.outer(mm, phi))
    f = np.array([(A / r) ** (n + 2) for n in range(nmax + 1)])            # (n, filas)
    nn = np.arange(nmax + 1)[:, None, None]
    w = f[:, None, :]                                                        # (n, 1, filas)
    Gr = ((nn + 1) * w * P * g[:nmax + 1, :nmax + 1, None]).sum(0); Hr = ((nn + 1) * w * P * h[:nmax + 1, :nmax + 1, None]).sum(0)
    Gt = (w * dP * g[:nmax + 1, :nmax + 1, None]).sum(0); Ht = (w * dP * h[:nmax + 1, :nmax + 1, None]).sum(0)
    Gp = (w * P * mm[None, :, None] * g[:nmax + 1, :nmax + 1, None]).sum(0); Hp = (w * P * mm[None, :, None] * h[:nmax + 1, :nmax + 1, None]).sum(0)
    Br = Gr.T @ C + Hr.T @ S
    Bt = -(Gt.T @ C + Ht.T @ S)
    Bp = -(-(Gp.T @ S) + Hp.T @ C) / st[:, None]
    return Br, Bt, Bp


def surface_F(year, step=0.5, alt=0.0):
    lat = np.arange(90 - step / 2, -90, -step); lon = np.arange(-180 + step / 2, 180, step)
    r, th, _ = M.geodetic(lat, 0 * lat, alt)
    Br, Bt, Bp = grid_B(year, r, th, np.radians(lon))
    return lat, lon, np.sqrt(Br ** 2 + Bt ** 2 + Bp ** 2)


def save16(v, path):
    """v en [0,1] → PNG RGB con 16 bits repartidos en R (alto) y G (bajo)"""
    q = np.round(np.clip(v, 0, 1) * 65535).astype(np.uint32)
    rgb = np.stack([(q >> 8).astype(np.uint8), (q & 255).astype(np.uint8), np.zeros_like(q, dtype=np.uint8)], -1)
    Image.fromarray(rgb).save(path, optimize=True)


out = {"fuente": "IGRF-14 (IAGA, coeficientes de NOAA/NCEI), calculado con tools/igrf16.py"}

# --- 1. intensidad en superficie por año + áreas débiles
YEARS = list(range(1900, 2026, 5)) + [2030]
areas = []
for y in YEARS:
    lat, lon, F = surface_F(y)
    save16((F - 15000) / 55000, os.path.join(PUB, f"F_{y}.png"))
    cell = (np.radians(0.5) * 6371.0) ** 2 * np.cos(np.radians(lat))[:, None]
    areas.append({"y": y, "a32": round(float((cell * (F < 32000)).sum() / 1e6), 2), "a26": round(float((cell * (F < 26000)).sum() / 1e6), 2),
                  "fmin": round(float(F.min())), "fmax": round(float(F.max()))})
    print("F", y, areas[-1])
out["areas"] = areas

# --- 2. campo radial en el borde del núcleo
# (hasta 1995 el IGRF llega al grado 10; para comparar años se guarda también la versión truncada en 10: br_cmb10_AAAA)
for y, nm, tag in ((1900, 10, "br_cmb10"), (1960, 10, "br_cmb10"), (2025, 10, "br_cmb10"), (2025, NMAX, "br_cmb")):
    lat = np.arange(89.75, -90, -0.5); lon = np.arange(-179.75, 180, 0.5)
    Br, _, _ = grid_B(y, np.full(len(lat), 3485.0), np.radians(90 - lat), np.radians(lon), nm)
    save16((Br / 1e6 + 1) / 2, os.path.join(PUB, f"{tag}_{y}.png"))
    sur = lat < -10
    print(tag, y, "rango", round(float(Br.min())), round(float(Br.max())), "· parches invertidos en el sur (Br<0, lat<-10°):",
          round(float((Br[sur] < 0).mean() * 100), 1), "% de la superficie del sur")

# --- 3. dipolo excéntrico por año (Fraser-Smith)
dip = []
for y in range(1900, 2026, 5):
    g, h = M.coeffs(y)
    g10, g11, h11 = g[1, 0], g[1, 1], h[1, 1]
    g20, g21, h21, g22, h22 = g[2, 0], g[2, 1], h[2, 1], g[2, 2], h[2, 2]
    B0 = np.sqrt(g10 ** 2 + g11 ** 2 + h11 ** 2)
    L0 = 2 * g10 * g20 + np.sqrt(3) * (g11 * g21 + h11 * h21)
    L1 = -g11 * g20 + np.sqrt(3) * (g10 * g21 + g11 * g22 + h11 * h22)
    L2 = -h11 * g20 + np.sqrt(3) * (g10 * h21 - h11 * g22 + g11 * h22)
    E = (L0 * g10 + L1 * g11 + L2 * h11) / (4 * B0 ** 2)
    xi = (L0 - g10 * E) / (3 * B0 ** 2); eta = (L1 - g11 * E) / (3 * B0 ** 2); zeta = (L2 - h11 * E) / (3 * B0 ** 2)
    # eta → x (0° E), zeta → y (90° E), xi → z (norte), en radios de referencia
    off = np.array([eta, zeta, xi]) * A
    d = np.linalg.norm(off)
    tilt = np.degrees(np.arccos(-g10 / B0))
    pole_lat = 90 - tilt; pole_lon = np.degrees(np.arctan2(-h11, -g11))   # polo boreal geomagnético
    dip.append({"y": y, "tilt": round(float(tilt), 2), "polo": [round(float(pole_lat), 2), round(float(pole_lon), 2)],
                "off_km": round(float(d)), "off": [round(float(v / RE), 4) for v in off],
                "off_dir": [round(float(np.degrees(np.arcsin(off[2] / d))), 1), round(float(np.degrees(np.arctan2(off[1], off[0]))), 1)],
                "momento": round(float(B0))})
print("dipolo 1900", dip[0]); print("dipolo 2025", dip[-1])
out["dipolo"] = dip


# --- trazado de líneas de campo (RK4 en cartesianas, en km)
def B_cart(p, year):
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    r = np.sqrt(x * x + y * y + z * z); th = np.arccos(np.clip(z / r, -1, 1)); ph = np.arctan2(y, x)
    Br, Bt, Bp = M.B(r, th, ph, year)
    st, ct, sp, cp = np.sin(th), np.cos(th), np.sin(ph), np.cos(ph)
    bx = Br * st * cp + Bt * ct * cp - Bp * sp
    by = Br * st * sp + Bt * ct * sp + Bp * cp
    bz = Br * ct - Bt * st
    return np.stack([bx, by, bz], 1), np.sqrt(Br * Br + Bt * Bt + Bp * Bp)


def trace(p0, year, sign, rmin=RE, rmax=12 * RE, nmax=900):
    """sigue B (sign=+1) o −B desde p0 (N×3, km) hasta volver a la superficie; devuelve lista de polilíneas y |B| por punto"""
    paths = [[q.copy()] for q in p0]; Bs = [[] for _ in p0]
    p = p0.copy(); alive = np.ones(len(p), bool)
    for _ in range(nmax):
        if not alive.any(): break
        idx = np.where(alive)[0]; q = p[idx]
        r = np.linalg.norm(q, axis=1); ds = np.clip(0.012 * r, 15, 600)[:, None]

        def d(qq):
            b, _ = B_cart(qq, year); return sign * b / np.linalg.norm(b, axis=1)[:, None]
        k1 = d(q); k2 = d(q + ds * k1 / 2); k3 = d(q + ds * k2 / 2); k4 = d(q + ds * k3)
        q2 = q + ds * (k1 + 2 * k2 + 2 * k3 + k4) / 6
        _, F = B_cart(q2, year)
        r2 = np.linalg.norm(q2, axis=1)
        for j, i in enumerate(idx):
            paths[i].append(q2[j].copy()); Bs[i].append(float(F[j]))
        p[idx] = q2
        alive[idx] = (r2 > rmin) & (r2 < rmax)
    return paths, Bs


def foot(lat, lon, alt=0.0):
    r, th, ph = M.geodetic(np.asarray(lat, float), np.asarray(lon, float), alt)
    return np.stack([r * np.sin(th) * np.cos(ph), r * np.sin(th) * np.sin(ph), r * np.cos(th)], 1)


# --- 4. líneas de campo del "escudo": salen del hemisferio sur (geomagnético) y vuelven por el norte
pole = dip[-1]["polo"]
pl, po = np.radians(pole)
zg = np.array([np.cos(pl) * np.cos(po), np.cos(pl) * np.sin(po), np.sin(pl)])   # eje geomagnético (norte)
xg = np.cross([0, 0, 1], zg); xg /= np.linalg.norm(xg); yg = np.cross(zg, xg)
starts = []
for mlat in (-28, -40, -50, -58, -64):
    for k in range(24):
        mlon = np.radians(k * 15 + (7.5 if mlat in (-40, -58) else 0))
        v = np.cos(np.radians(mlat)) * (np.cos(mlon) * xg + np.sin(mlon) * yg) + np.sin(np.radians(mlat)) * zg
        la = np.degrees(np.arcsin(v[2])); lo = np.degrees(np.arctan2(v[1], v[0]))
        starts.append((la, lo, mlat))
P0 = foot([s[0] for s in starts], [s[1] for s in starts], 30.0)
paths, _ = trace(P0, 2025.0, +1)       # en el sur B apunta hacia afuera: seguir B sube y vuelve al norte
lines = []
for (la, lo, ml), pth in zip(starts, paths):
    a = np.array(pth) / RE
    if len(a) < 4: continue
    step = max(1, len(a) // 70)
    a = a[::step]
    lines.append({"m": ml, "p": np.round(a, 3).ravel().tolist()})
print("líneas de campo", len(lines), "puntos medios", int(np.mean([len(l['p']) // 3 for l in lines])))
out["lineas"] = lines

# --- 5. cinturón interior: líneas desde el ecuador magnético (L 1,15–2,0); se guarda el tramo con |B| < Bm
# Bm = |B| a 200 km de altura en el punto más débil (la AAS a esa altura): las partículas que rebotan con campo
# mayor que ese tocan la atmósfera en la AAS y se pierden, así que el cinturón estable empieza ahí.
lat_h, lon_h, F200 = surface_F(2025.0, 0.5, 200.0)
Bm = float(F200.min()); print("Bm (mínimo de |B| a 200 km):", round(Bm), "nT")
starts = []
for L in (1.15, 1.25, 1.35, 1.5, 1.7, 2.0):
    for k in range(48):
        mlon = np.radians(k * 7.5)
        v = np.cos(mlon) * xg + np.sin(mlon) * yg
        starts.append((L, v * L * RE))
eq = np.array([s[1] for s in starts])
up, Bu = trace(eq, 2025.0, +1, rmin=RE - 50); dn, Bd = trace(eq, 2025.0, -1, rmin=RE - 50)
belt = []
for (L, _), a, ba, b, bb in zip(starts, up, Bu, dn, Bd):
    # trace() guarda |B| desde el segundo punto: la línea completa es b invertida + a sin su primer punto (el ecuador)
    pts = np.concatenate([np.array(b[::-1]), np.array(a[1:])]) if len(a) > 1 else np.array(b[::-1])
    F_eq = float(B_cart(np.array([a[0]]), 2025.0)[1][0])
    Bp_all = np.concatenate([np.array(bb[::-1]), [F_eq], np.array(ba)])
    n = min(len(pts), len(Bp_all))
    pts, Bp_all = pts[:n], Bp_all[:n]
    keep = Bp_all < Bm
    if keep.sum() < 3: continue
    seg = pts[keep] / RE
    step = max(1, len(seg) // 40)
    alt_min = float((np.linalg.norm(pts[keep], axis=1) - RE).min())
    belt.append({"L": L, "hmin": round(alt_min), "p": np.round(seg[::step], 3).ravel().tolist()})
hm = sorted(b["hmin"] for b in belt)
print("cinturón:", len(belt), "líneas · altura mínima del borde inferior:", hm[:3], "…", hm[-3:])
out["cinturon"] = {"Bm": round(Bm), "lineas": belt}

# --- 6. superficie de campo constante Bm: altura sobre cada punto (para el borde del cinturón en el globo)
alts = np.array([0, 100, 200, 300, 400, 600, 800, 1000, 1300, 1600, 2000, 2500, 3000, 3600, 4200], float)
Fs = []
for a in alts:
    _, _, Fa = surface_F(2025.0, 1.0, a); Fs.append(Fa)
Fs = np.array(Fs)                                                   # (alturas, lat, lon), decrece con la altura
H = np.full(Fs.shape[1:], alts[-1])
for i in range(len(alts) - 1):
    a, b = Fs[i], Fs[i + 1]
    hit = (a >= Bm) & (b < Bm) & (H == alts[-1])
    t = (a - Bm) / np.maximum(a - b, 1e-9)
    H = np.where(hit, alts[i] + t * (alts[i + 1] - alts[i]), H)
H = np.where(Fs[0] < Bm, 0, H)
save16(H / 4000.0, os.path.join(PUB, "belt_h.png"))
lat1 = np.arange(89.5, -90, -1.0); lon1 = np.arange(-179.5, 180, 1.0)
i, j = np.unravel_index(np.argmin(H), H.shape)
print("superficie Bm: altura mínima", round(float(H.min())), "km en", lat1[i], lon1[j], "· en el ecuador del lado opuesto (0°, 120° E):",
      round(float(H[90, 300])), "km")
out["belt_h"] = {"min_km": round(float(H.min())), "lat": float(lat1[i]), "lon": float(lon1[j])}

# --- 7. Hubble: órbita circular de 28,47° y 525 km durante 24 horas, con el campo a esa altura
MU = 398600.4418; a_orb = 6378.137 + 525.0; T = 2 * np.pi * np.sqrt(a_orb ** 3 / MU)
t = np.arange(0, 86400, 20.0)
inc = np.radians(28.47); u = 2 * np.pi * t / T
xo, yo, zo = np.cos(u), np.sin(u) * np.cos(inc), np.sin(u) * np.sin(inc)
lat_t = np.degrees(np.arcsin(zo)); lon_t = (np.degrees(np.arctan2(yo, xo)) - 360 * t / 86164.1 - 40.0 + 540) % 360 - 180
Fh = M.F(lat_t, lon_t, 2025.0, 525.0)
lat5, lon5, F525 = surface_F(2025.0, 1.0, 525.0)
res = {}
for thr in (20800, 21000, 21500, 22000, 23000):
    inside = Fh < thr
    orb = (t // T).astype(int)
    res[thr] = int(len(set(orb[inside])))
print("Hubble: período", round(T / 60, 1), "min ·", round(86400 / T, 2), "órbitas/día · órbitas que cruzan según el umbral:", res)
THR = 20800      # con este contorno el Hubble cruza la anomalía en 8 o 9 de sus 15 órbitas diarias (STScI: de 7 a 9)
inside = Fh < THR
out["hubble"] = {"periodo_min": round(T / 60, 2), "umbral_nT": THR, "orbitas_cruzan": res[THR], "orbitas": round(86400 / T, 2),
                 "track": np.round(np.stack([lon_t, lat_t, inside.astype(float)], 1), 2).ravel().tolist()}

json.dump(out, open(os.path.join(DATA, "campo.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print("campo.json", os.path.getsize(os.path.join(DATA, "campo.json")) // 1024, "KB")

# --- 8. grillas de 2° para contornos en 2D (d3-contour): |B| a la altura de cada nave
grids = {}
for key, (alt, y) in {"0_2025": (0, 2025.0), "400_2012": (400, 2012.3), "525_2025": (525, 2025.0), "620_2025": (620, 2025.0)}.items():
    lat_g, lon_g, Fg = surface_F(y, 2.0, alt)
    grids[key] = np.round(Fg).astype(int).ravel().tolist()
out["grillas"] = {"paso": 2, "nx": 180, "ny": 90, "lat0": 89, "lon0": -179, "datos": grids}
# segundo mínimo (AAS que se parte): mínimos locales en superficie por año
from numpy.lib.stride_tricks import sliding_window_view as _sw
lat_s = np.arange(10, -70, -0.25); lon_s = np.arange(-110, 60, 0.25)
r_s, th_s, _ = M.geodetic(lat_s, 0 * lat_s, 0.0)
seg = []
for y in range(2000, 2031):
    Br, Bt, Bp = grid_B(float(y), r_s, th_s, np.radians(lon_s)); Fm = np.sqrt(Br ** 2 + Bt ** 2 + Bp ** 2)
    P_ = np.pad(Fm, 1, constant_values=1e9); loc = Fm == _sw(P_, (3, 3)).min(axis=(2, 3))
    pts = sorted([(float(Fm[i, j]), float(lat_s[i]), float(lon_s[j])) for i, j in np.argwhere(loc)])
    seg.append({"y": y, "min": [[round(f), la, lo] for f, la, lo in pts[:2]]})
out["minimos_locales"] = seg
print("segundo mínimo: primer año", next((s["y"] for s in seg if len(s["min"]) > 1), None))
json.dump(out, open(os.path.join(DATA, "campo.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print("campo.json con grillas", os.path.getsize(os.path.join(DATA, "campo.json")) // 1024, "KB")
