"""Campo magnético principal de la Tierra según el IGRF-14 (IAGA/NOAA), implementado acá para el ep16.
Síntesis de armónicos esféricos (Schmidt semi-normalizados, grado 13) con numpy, vectorizada.

  from igrf16 import IGRF
  m = IGRF()                       # lee data/ep16/igrf_src/igrf14coeffs.txt
  F = m.F(lat, lon, 2025.0)        # intensidad total en nT sobre el elipsoide WGS84 (lat geodésica)
  Br, Bt, Bp = m.B(r_km, colat_rad, lon_rad, 2025.0)   # componentes geocéntricas a cualquier radio

Uso directo: python3 tools/igrf16.py  → imprime los números que usa el guion (mínimo, deriva, área, ciudades)."""
import os, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 6371.2          # radio de referencia del IGRF (km)
NMAX = 13


class IGRF:
    def __init__(self, path=None):
        path = path or os.path.join(ROOT, "data/ep16/igrf_src/igrf14coeffs.txt")
        years, rows = None, []
        for line in open(path, encoding="utf-8", errors="replace"):
            p = line.split()
            if not p or p[0].startswith("#") or p[0] == "c/s":
                continue
            if p[0] == "g/h":
                years = [float(x) for x in p[3:-1]]
                continue
            if p[0] in ("g", "h"):
                rows.append((p[0], int(p[1]), int(p[2]), [float(x) for x in p[3:]]))
        self.years = np.array(years)                      # 1900 … 2025
        ny = len(years)
        self.g = np.zeros((ny + 1, NMAX + 1, NMAX + 1)); self.h = np.zeros_like(self.g)
        for kind, n, m, vals in rows:
            arr = self.g if kind == "g" else self.h
            arr[:ny, n, m] = vals[:ny]
            arr[ny, n, m] = vals[ny] if len(vals) > ny else 0.0   # variación secular (nT/año) del último lustro
        self.last = float(self.years[-1])

    def coeffs(self, year):
        """g, h interpolados linealmente (y extrapolados con la variación secular después de la última época)"""
        y = float(year); ys = self.years; ny = len(ys)
        if y >= self.last:
            dt = y - self.last
            return self.g[ny - 1] + dt * self.g[ny], self.h[ny - 1] + dt * self.h[ny]
        i = int(np.clip(np.searchsorted(ys, y, side="right") - 1, 0, ny - 2))
        k = (y - ys[i]) / (ys[i + 1] - ys[i])
        return self.g[i] * (1 - k) + self.g[i + 1] * k, self.h[i] * (1 - k) + self.h[i + 1] * k

    def B(self, r, theta, phi, year, nmax=NMAX):
        """Br (hacia afuera), Btheta (hacia el sur), Bphi (hacia el este) en nT. r en km, theta = colatitud geocéntrica."""
        g, h = self.coeffs(year)
        r, theta, phi = np.broadcast_arrays(np.asarray(r, float), np.asarray(theta, float), np.asarray(phi, float))
        ct, st = np.cos(theta), np.sin(theta)
        st = np.where(np.abs(st) < 1e-10, 1e-10, st)
        # Legendre asociados, Schmidt semi-normalizados, y su derivada respecto de theta
        P = np.zeros((nmax + 2, nmax + 2) + theta.shape); dP = np.zeros_like(P)
        P[0, 0] = 1.0
        for n in range(1, nmax + 1):
            for m in range(0, n + 1):
                if n == m:
                    k = np.sqrt(1 - 1 / (2 * m)) if m > 1 else 1.0
                    P[n, m] = k * st * P[n - 1, m - 1]
                    dP[n, m] = k * (st * dP[n - 1, m - 1] + ct * P[n - 1, m - 1])
                else:
                    den = np.sqrt(n * n - m * m)
                    k1 = (2 * n - 1) / den
                    k2 = np.sqrt((n - 1) ** 2 - m * m) / den if n > 1 else 0.0
                    P[n, m] = k1 * ct * P[n - 1, m] - (k2 * P[n - 2, m] if n > 1 else 0)
                    dP[n, m] = k1 * (ct * dP[n - 1, m] - st * P[n - 1, m]) - (k2 * dP[n - 2, m] if n > 1 else 0)
        Br = np.zeros(theta.shape); Bt = np.zeros(theta.shape); Bp = np.zeros(theta.shape)
        ar = A / r
        for n in range(1, nmax + 1):
            f = ar ** (n + 2)
            for m in range(0, n + 1):
                cm, sm = np.cos(m * phi), np.sin(m * phi)
                gc = g[n, m] * cm + h[n, m] * sm
                Br += (n + 1) * f * gc * P[n, m]
                Bt -= f * gc * dP[n, m]
                Bp -= f * m * (-g[n, m] * sm + h[n, m] * cm) * P[n, m] / st
        return Br, Bt, Bp

    @staticmethod
    def geodetic(lat, lon, alt_km=0.0):
        """lat geodésica (grados) → r (km), colatitud geocéntrica (rad), longitud (rad). WGS84."""
        a, b = 6378.137, 6356.7523142
        la = np.radians(lat); s, c = np.sin(la), np.cos(la)
        N = a * a / np.sqrt(a * a * c * c + b * b * s * s)
        x = (N + alt_km) * c; z = (b * b / (a * a) * N + alt_km) * s
        return np.hypot(x, z), np.pi / 2 - np.arctan2(z, x), np.radians(lon) + 0 * la

    def F(self, lat, lon, year, alt_km=0.0, nmax=NMAX):
        r, th, ph = self.geodetic(np.asarray(lat, float), np.asarray(lon, float), alt_km)
        Br, Bt, Bp = self.B(r, th, ph, year, nmax)
        return np.sqrt(Br * Br + Bt * Bt + Bp * Bp)

    def grid(self, year, step=1.0, alt_km=0.0):
        lat = np.arange(90 - step / 2, -90, -step); lon = np.arange(-180 + step / 2, 180, step)
        LO, LA = np.meshgrid(lon, lat)
        return lat, lon, self.F(LA, LO, year, alt_km)

    def minimum(self, year, alt_km=0.0):
        """mínimo global de F: búsqueda gruesa y refinamiento alrededor"""
        lat, lon, F = self.grid(year, 1.0, alt_km)
        i, j = np.unravel_index(np.argmin(F), F.shape)
        la0, lo0 = lat[i], lon[j]
        la = np.linspace(la0 - 1.5, la0 + 1.5, 121); lo = np.linspace(lo0 - 1.5, lo0 + 1.5, 121)
        LO, LA = np.meshgrid(lo, la)
        F2 = self.F(LA, LO, year, alt_km)
        i, j = np.unravel_index(np.argmin(F2), F2.shape)
        return float(la[i]), float(lo[j]), float(F2[i, j])

    def area_below(self, year, thr=32000.0, step=0.5, alt_km=0.0):
        """superficie (millones de km²) con F < thr"""
        lat, lon, F = self.grid(year, step, alt_km)
        cell = (np.radians(step) * 6371.0) ** 2 * np.cos(np.radians(lat))[:, None]
        return float((cell * (F < thr)).sum() / 1e6)


def haversine(la1, lo1, la2, lo2):
    p1, p2 = np.radians(la1), np.radians(la2)
    d = np.sin((p2 - p1) / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(np.radians(lo2 - lo1) / 2) ** 2
    return 2 * 6371.0 * np.arcsin(np.sqrt(d))


if __name__ == "__main__":
    m = IGRF()
    # control contra valores conocidos: el dipolo y el máximo/mínimo globales de 2025
    print("épocas", m.years[0], "…", m.years[-1])
    print("año   mínimo (lat, lon)   F mín (nT)   área F<32.000 nT (M km²)   F máx")
    for y in list(range(1900, 2026, 25)) + [2030]:
        la, lo, f = m.minimum(y)
        _, _, G = m.grid(y, 2.0)
        print(f"{y}  {la:7.2f} {lo:8.2f}   {f:8.0f}   {m.area_below(y):6.2f}   {G.max():8.0f}")
    CITIES = {"Asunción": (-25.28, -57.63), "Posadas": (-27.37, -55.90), "Cataratas del Iguazú": (-25.69, -54.44), "Corrientes": (-27.47, -58.83),
              "Resistencia": (-27.45, -58.99), "Formosa": (-26.18, -58.18), "Buenos Aires": (-34.60, -58.38), "Córdoba": (-31.42, -64.18),
              "Pilar (obs.)": (-31.67, -63.88), "Ushuaia": (-54.80, -68.30), "São Paulo": (-23.55, -46.63), "Madrid": (40.42, -3.70),
              "Nueva York": (40.71, -74.01), "Yakutsk": (62.03, 129.73)}
    la0, lo0, f0 = m.minimum(2025)
    print("\n2025: mínimo en", round(la0, 2), round(lo0, 2), round(f0), "nT")
    for c, (la, lo) in CITIES.items():
        print(f"  {c:22s} F={float(m.F(la, lo, 2025)):7.0f} nT   a {float(haversine(la, lo, la0, lo0)):6.0f} km del mínimo   (1900: {float(m.F(la, lo, 1900)):7.0f})")
