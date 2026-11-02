"""Croquis mudo de B° Alta Córdoba (sector del caso), A4 apaisado, vectorial.

Trazado tomado del plano de fs. 40 del expediente (coordenadas en píxeles de esa
imagen, 1050 x 780, con y hacia abajo). No contiene marcas del hecho.
"""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrow
from matplotlib import font_manager

for f in font_manager.findSystemFonts():
    if "LiberationSans" in f:
        font_manager.fontManager.addfont(f)
plt.rcParams["font.family"] = "Liberation Sans"

W, H = 1050, 780
# Calles: (nombre, puntos, ancho, ¿principal?)
H_STREETS = [
    ("Luis de Góngora", [(0, 100), (W, 100)], 20, True),
    ("Bartolomé Argensola", [(0, 330), (W, 330)], 18, True),
    ("Lope de Vega", [(0, 560), (W, 560)], 20, True),
    ("Pje. Saturnino Zaraza", [(270, 675), (545, 675)], 10, False),
    ("Pje. Cordeiro", [(855, 210), (990, 210)], 9, False),
]
V_STREETS = [
    ("Huarte", [(30, 0), (30, H)], 14, True),
    ("Las Junturas", [(132, 0), (132, 330)], 11, False),
    ("Superí", [(262, 0), (182, H)], 18, True),
    ("Santa Fe", [(372, 0), (372, 560)], 14, True),
    ("Mendoza", [(537, 0), (537, H)], 16, True),
    ("Pje. Rodríguez Peña", [(642, 100), (642, 330)], 10, False),
    ("Pje. Guzmán Pacheco", [(655, 560), (655, H)], 10, False),
    ("N. Rodríguez Peña", [(765, 0), (765, H)], 16, True),
    ("Pje. Escobedo", [(828, 330), (828, 560)], 10, False),
    ("Nicolás Avellaneda", [(990, 0), (990, H)], 16, True),
]
RAIL = [(335, 0), (255, H)]  # vías del ferrocarril, paralelas a Superí

fig = plt.figure(figsize=(11.69, 8.27))  # A4 apaisado
ax = fig.add_axes([0.035, 0.17, 0.93, 0.79])
ax.set_xlim(0, W); ax.set_ylim(H, 0); ax.set_aspect("auto"); ax.axis("off")

# Manzanas: fondo gris tenue; las calles se dibujan encima en blanco.
ax.add_patch(Rectangle((0, 0), W, H, facecolor="#EFEFEF", edgecolor="none", zorder=0))

def street(pts, w, z=2):
    xs, ys = zip(*pts)
    ax.plot(xs, ys, color="#8A8A8A", lw=w * 0.95 + 1.4, solid_capstyle="butt", zorder=z)
for _, pts, w, _ in H_STREETS + V_STREETS:
    street(pts, w)
for _, pts, w, _ in H_STREETS + V_STREETS:
    xs, ys = zip(*pts)
    ax.plot(xs, ys, color="white", lw=w * 0.95, solid_capstyle="butt", zorder=3)

# Vías: doble riel con durmientes.
p0, p1 = np.array(RAIL[0], float), np.array(RAIL[1], float)
d = (p1 - p0) / np.linalg.norm(p1 - p0); nrm = np.array([-d[1], d[0]])
L = np.linalg.norm(p1 - p0)
ax.plot(*zip(p0 - nrm * 7, p1 - nrm * 7), color="#EFEFEF", lw=9, zorder=4)
for off in (-3.2, 3.2):
    a, b = p0 + nrm * off, p1 + nrm * off
    ax.plot([a[0], b[0]], [a[1], b[1]], color="black", lw=1.1, zorder=6)
for t in np.arange(6, L, 11):
    c = p0 + d * t
    a, b = c - nrm * 6, c + nrm * 6
    ax.plot([a[0], b[0]], [a[1], b[1]], color="black", lw=0.9, zorder=5)

# Rótulos de calles.
def label(text, x, y, rot=0, size=10, bold=True):
    ax.text(x, y, text, rotation=rot, ha="center", va="center", fontsize=size,
            fontweight="bold" if bold else "normal", color="#111111", zorder=8,
            bbox=dict(facecolor="white", edgecolor="none", pad=0.6))
label("LUIS DE GÓNGORA", 450, 100); label("LUIS DE GÓNGORA", 880, 100)
label("BARTOLOMÉ ARGENSOLA", 455, 330); label("BARTOLOMÉ ARGENSOLA", 905, 330)
label("LOPE DE VEGA", 450, 560); label("LOPE DE VEGA", 880, 560); label("LOPE DE VEGA", 95, 560, size=8.5)
label("Pje. Saturnino Zaraza", 420, 675, size=8, bold=False)
label("Pje. Cordeiro", 922, 210, size=7.5, bold=False)
label("HUARTE", 30, 450, 90, 8.5)
label("Las Junturas", 132, 215, 90, 7.5, False)
def along(pts, frac):
    (x0, y0), (x1, y1) = pts
    return x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac
ang = np.degrees(np.arctan2(-(V_STREETS[2][1][1][1] - V_STREETS[2][1][0][1]), V_STREETS[2][1][1][0] - V_STREETS[2][1][0][0]))
x, y = along(V_STREETS[2][1], 0.29); label("SUPERÍ", x, y, ang, 9.5)
x, y = along(V_STREETS[2][1], 0.88); label("SUPERÍ", x, y, ang, 9.5)
label("SANTA FE", 372, 215, 90, 9); label("SANTA FE", 372, 445, 90, 9)
label("MENDOZA", 537, 215, 90, 9.5); label("MENDOZA", 537, 445, 90, 9.5); label("MENDOZA", 537, 680, 90, 9.5)
label("Pje. Rodríguez Peña", 642, 215, 90, 7.5, False)
label("Pje. Guzmán Pacheco", 655, 680, 90, 7.5, False)
label("N. RODRÍGUEZ PEÑA", 765, 215, 90, 9); label("N. RODRÍGUEZ PEÑA", 765, 445, 90, 9); label("N. RODRÍGUEZ PEÑA", 765, 680, 90, 9)
label("Pje. Escobedo", 828, 445, 90, 7.5, False)
label("NICOLÁS AVELLANEDA", 990, 215, 90, 8.5); label("NICOLÁS AVELLANEDA", 990, 445, 90, 8.5)
ra = np.degrees(np.arctan2(-(RAIL[1][1] - RAIL[0][1]), RAIL[1][0] - RAIL[0][0]))
x, y = along(RAIL, 0.6)
ax.text(x + 14, y, "VÍAS DEL FERROCARRIL", rotation=ra, ha="center", va="center", fontsize=8.5,
        fontweight="bold", color="black", zorder=8, bbox=dict(facecolor="white", edgecolor="black", lw=0.6, pad=1.5))

# Marco.
ax.add_patch(Rectangle((0, 0), W, H, fill=False, edgecolor="black", lw=1.4, zorder=9))

# Norte.
nx, ny = 1012, 40
ax.add_patch(Rectangle((nx - 26, ny - 30), 52, 66, facecolor="white", edgecolor="black", lw=0.8, zorder=10))
ax.add_patch(FancyArrow(nx, ny + 12, 0, -34, width=4, head_width=16, head_length=16, color="black", zorder=11))
ax.text(nx, ny + 25, "N", ha="center", va="center", fontsize=12, fontweight="bold", zorder=11)

# Carátula.
cx = fig.add_axes([0.035, 0.025, 0.93, 0.125]); cx.set_xlim(0, 100); cx.set_ylim(0, 10); cx.axis("off")
cx.add_patch(Rectangle((0, 0), 100, 10, fill=False, lw=1.2))
cx.plot([45, 45], [0, 10], color="black", lw=0.8)
cx.text(1.2, 7.4, "CROQUIS PLANIMÉTRICO URBANO", fontsize=13, fontweight="bold", va="center")
cx.text(1.2, 4.9, "Sector: B° Alta Córdoba – Ciudad de Córdoba", fontsize=10, va="center")
cx.text(1.2, 2.6, "Croquis ilustrativo, sin escala. Trazado de calles según el plano de fs. 40.", fontsize=8.5, va="center", color="#333")
cx.text(1.2, 0.9, "Norte hacia arriba.", fontsize=8.5, va="center", color="#333")
cx.text(47, 6.6, "Testigo / Declarante:", fontsize=10, va="center"); cx.plot([62, 98.5], [6.1, 6.1], color="black", lw=0.7)
cx.text(47, 2.6, "Firma:", fontsize=10, va="center"); cx.plot([53, 74], [2.1, 2.1], color="black", lw=0.7)
cx.text(76, 2.6, "Fecha:", fontsize=10, va="center"); cx.plot([82, 98.5], [2.1, 2.1], color="black", lw=0.7)

import sys
out = sys.argv[1] if len(sys.argv) > 1 else "croquis_limpio_a4.pdf"
fig.savefig(out, format="pdf")
print("ok", out)
