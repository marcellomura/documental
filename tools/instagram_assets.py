"""Piezas gráficas para el Instagram @contexto.ar: foto de perfil, portadas de historias destacadas y portadas de reels.
Salida: entrega/instagram/*.png"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "entrega", "instagram"); os.makedirs(OUT, exist_ok=True)
FONTS = os.path.join(ROOT, "video", "public", "fonts")
ANTON = os.path.join(FONTS, "Anton-Regular.ttf")
INTER = os.path.join(FONTS, "Inter-VF.ttf")
YEL, INK, BG, TXT, RED = (255, 204, 51), (22, 21, 19), (4, 10, 17), (238, 244, 248), (226, 59, 46)

def anton(sz): return ImageFont.truetype(ANTON, sz)
def inter(sz, w="Bold"):
    f = ImageFont.truetype(INTER, sz)
    try: f.set_variation_by_name(w)
    except Exception: pass
    return f
def ctext(d, y, text, font, fill, W=1080, spacing=0):
    """texto centrado horizontalmente (con espaciado entre letras opcional)"""
    if spacing:
        widths = [d.textlength(ch, font=font) for ch in text]
        total = sum(widths) + spacing * (len(text) - 1); x = (W - total) / 2
        for ch, w in zip(text, widths): d.text((x, y), ch, font=font, fill=fill); x += w + spacing
    else:
        d.text(((W - d.textlength(text, font=font)) / 2, y), text, font=font, fill=fill)

# 1) foto de perfil: el logo sobre fondo oscuro (entra entero en el círculo)
logo = Image.open(os.path.join(ROOT, "video/public/brand/logo_fondo.png")).convert("RGB").resize((1080, 1080), Image.LANCZOS)
logo.save(os.path.join(OUT, "foto_perfil.png"))

# 2) portadas de historias destacadas (1080x1920; Instagram muestra un círculo del centro)
def yellow_tile(size):
    t = Image.new("RGBA", (size + 40, size + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(t)
    d.rounded_rectangle([34, 34, size + 34, size + 34], radius=size // 22, fill=(8, 8, 8, 255))   # sombra dura, como el logo
    d.rounded_rectangle([0, 0, size, size], radius=size // 22, fill=YEL + (255,))
    return t
def highlight(name, draw_icon):
    im = Image.new("RGB", (1080, 1920), BG)
    g = Image.new("RGB", (1080, 1920), (0, 0, 0)); gd = ImageDraw.Draw(g)
    gd.ellipse([140, 560, 940, 1360], fill=(60, 50, 12)); g = g.filter(ImageFilter.GaussianBlur(120))
    im = Image.blend(im, g, 0.35)
    S = 560; tile = yellow_tile(S); x0, y0 = (1080 - S) // 2, (1920 - S) // 2
    im.paste(tile, (x0, y0), tile)
    d = ImageDraw.Draw(im); draw_icon(d, x0, y0, S)
    im.save(os.path.join(OUT, f"destacada_{name}.png"))
def ic_play(d, x, y, S):
    d.polygon([(x + S * 0.36, y + S * 0.26), (x + S * 0.36, y + S * 0.74), (x + S * 0.76, y + S * 0.5)], fill=INK)
def ic_text(txt, sz):
    def f(d, x, y, S):
        font = anton(sz); w = d.textlength(txt, font=font); bb = d.textbbox((0, 0), txt, font=font)
        d.text((x + (S - w) / 2, y + (S - (bb[3] - bb[1])) / 2 - bb[1]), txt, font=font, fill=INK)
    return f
def ic_hourglass(d, x, y, S):
    a, b = x + S * 0.3, x + S * 0.7; t, m, u = y + S * 0.22, y + S * 0.5, y + S * 0.78
    d.rectangle([a - 14, t - 16, b + 14, t + 4], fill=INK); d.rectangle([a - 14, u - 4, b + 14, u + 16], fill=INK)
    d.polygon([(a, t), (b, t), (x + S * 0.5 + 10, m), (x + S * 0.5 - 10, m)], fill=INK)
    d.polygon([(x + S * 0.5 - 10, m), (x + S * 0.5 + 10, m), (b, u), (a, u)], fill=INK)
def ic_globe(d, x, y, S):
    c, r = (x + S / 2, y + S / 2), S * 0.3
    d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], outline=INK, width=22)
    d.ellipse([c[0] - r * 0.45, c[1] - r, c[0] + r * 0.45, c[1] + r], outline=INK, width=16)
    d.line([c[0] - r, c[1], c[0] + r, c[1]], fill=INK, width=16)
highlight("1_episodios", ic_play)
highlight("2_economia", ic_text("$", 400))
highlight("3_historia", ic_hourglass)
highlight("4_clima_y_ciencia", ic_globe)

# 3) portadas de reels (9:16; lo importante dentro de la franja central 3:4, y de 240 a 1680)
def frame(video, t):
    p = os.path.join(OUT, "_tmp.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", video, "-frames:v", "1", p], check=True)
    im = Image.open(p).convert("RGB"); os.remove(p); return im
def shade(im, y0, y1, a0, a1):
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for y in range(y0, y1):
        k = (y - y0) / max(1, y1 - y0); d.line([(0, y), (1080, y)], fill=(4, 10, 17, int(255 * (a0 + (a1 - a0) * k))))
    return Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB")
def tag(d, y, text):
    ctext(d, y, text, inter(34, "ExtraBold"), YEL, spacing=10)

# 13 ceros: portada propia, estilo del episodio (tinta + amarillo)
im = Image.new("RGB", (1080, 1920), (11, 11, 12)); d = ImageDraw.Draw(im)
tag(d, 330, "CONTEXTO · EPISODIO 1")
for i, (t, c) in enumerate([("¿POR QUÉ", TXT), ("ESCONDEMOS", TXT), ("DÓLARES?", YEL)]):
    ctext(d, 420 + i * 205, t, anton(190), c)
d.rounded_rectangle([250, 1100, 830, 1250], radius=18, fill=RED)
ctext(d, 1112, "13 CEROS", anton(110), (255, 255, 255))
ctext(d, 1330, "US$ 220.000 millones bajo el colchón", inter(40, "SemiBold"), (200, 210, 220))
im.save(os.path.join(OUT, "portada_reel_13_ceros.png"))

# Súper Niño: el cuadro del título del short + remate
im = frame(os.path.join(ROOT, "entrega/super_nino_short_tiktok.mp4"), 9.0)
im = shade(im, 1250, 1700, 0.0, 0.95); d = ImageDraw.Draw(im)
d.rectangle([0, 1290, 1080, 1480], fill=(4, 10, 17))
ctext(d, 1318, "¿QUÉ LE PUEDE PASAR", anton(92), TXT)
ctext(d, 1420, "A LA ARGENTINA?", anton(92), YEL)
im.save(os.path.join(OUT, "portada_reel_super_nino.png"))
print("listo:", sorted(os.listdir(OUT)))
