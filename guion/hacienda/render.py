#!/usr/bin/env python3
"""Maqueta un guion en formato de industria (Courier 12, carta) a PDF.

Marcado:
  INT. / EXT. / INT./EXT.   encabezado de escena (se numera solo)
  @NOMBRE                   personaje; las líneas siguientes hasta un blanco son diálogo
  (texto)                   dentro de un diálogo: acotación
  > TEXTO                   transición, alineada a la derecha
  ^TEXTO                    texto centrado (títulos, placas)
  ===                       salto de página
  # comentario              se ignora
  lo demás                  acción
"""
import sys, textwrap
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FD = "/usr/share/fonts/truetype/liberation/"
pdfmetrics.registerFont(TTFont("Mono", FD + "LiberationMono-Regular.ttf"))
pdfmetrics.registerFont(TTFont("MonoB", FD + "LiberationMono-Bold.ttf"))
pdfmetrics.registerFont(TTFont("MonoI", FD + "LiberationMono-Italic.ttf"))

W, H = letter
IN = 72
LH = 12  # 6 líneas por pulgada
TOP = H - 1 * IN
BOTTOM = 1 * IN
LEFT = 1.5 * IN
ACTION_CH = 60
CHAR_X = 3.7 * IN
DLG_X = 2.5 * IN
DLG_CH = 35
PAR_X = 3.1 * IN
PAR_CH = 25
RIGHT_X = W - 1 * IN


def parse(src):
    blocks = []  # (kind, payload)
    lines = src.split("\n")
    i = 0
    while i < len(lines):
        ln = lines[i].rstrip()
        s = ln.strip()
        if not s or s.startswith("#"):
            i += 1
            continue
        if s == "===":
            blocks.append(("page", None)); i += 1; continue
        if s.startswith(("INT.", "EXT.", "INT./EXT.")):
            blocks.append(("scene", s.upper())); i += 1; continue
        if s.startswith(">"):
            blocks.append(("trans", s[1:].strip().upper())); i += 1; continue
        if s.startswith("^"):
            blocks.append(("center", s[1:].strip())); i += 1; continue
        if s.startswith("@"):
            name = s[1:].strip()
            parts = []
            i += 1
            while i < len(lines) and lines[i].strip():
                t = lines[i].strip()
                if t.startswith("("):
                    parts.append(("par", t))
                else:
                    if parts and parts[-1][0] == "dlg":
                        parts[-1] = ("dlg", parts[-1][1] + " " + t)
                    else:
                        parts.append(("dlg", t))
                i += 1
            blocks.append(("dialogue", (name, parts)))
            continue
        # acción: junta líneas hasta un blanco
        para = [s]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(("INT.", "EXT.", "@", ">", "^", "===")):
            para.append(lines[i].strip()); i += 1
        blocks.append(("action", " ".join(para)))
    return blocks


class Doc:
    def __init__(self, path, title_page):
        self.c = canvas.Canvas(path, pagesize=letter)
        self.c.setTitle(title_page["title"])
        self.c.setAuthor(title_page["author"])
        self.page = 0
        self.title_page(title_page)
        self.new_page()

    def title_page(self, tp):
        c = self.c
        c.setFont("Mono", 12)
        y = H - 3.6 * IN
        c.drawCentredString(W / 2, y, tp["title"].upper())
        c.drawCentredString(W / 2, y - 3 * LH, "Guion cinematográfico de")
        c.drawCentredString(W / 2, y - 5 * LH, tp["author"])
        y2 = y - 9 * LH
        for l in tp.get("extra", []):
            c.drawCentredString(W / 2, y2, l); y2 -= LH
        yb = BOTTOM + 5 * LH
        for l in tp.get("contact", []):
            c.drawString(LEFT, yb, l); yb -= LH
        c.drawRightString(RIGHT_X, BOTTOM + 5 * LH, tp.get("draft", ""))
        c.showPage()

    def new_page(self):
        if self.page:
            self.c.showPage()
        self.page += 1
        self.c.setFont("Mono", 12)
        if self.page > 1:
            self.c.drawRightString(RIGHT_X, H - 0.5 * IN, f"{self.page}.")
        self.y = TOP

    def room(self, n):
        return self.y - (n - 1) * LH >= BOTTOM

    def line(self, x, s, font="Mono"):
        self.c.setFont(font, 12)
        self.c.drawString(x, self.y, s)
        self.y -= LH

    def blank(self):
        if self.y != TOP:
            self.y -= LH


def wrap(s, n):
    return textwrap.wrap(s, n, break_long_words=False, break_on_hyphens=False) or [""]


def render(blocks, out, tp):
    d = Doc(out, tp)
    scene_no = 0
    prev = None
    for idx, (kind, p) in enumerate(blocks):
        if kind == "page":
            d.new_page(); prev = None; continue
        if kind == "scene":
            scene_no += 1
            need = 4  # encabezado + blanco + dos líneas de lo que sigue
            if not d.room(need):
                d.new_page()
            d.blank() if d.y != TOP else None
            d.c.setFont("MonoB", 12)
            d.c.drawString(LEFT - 0.6 * IN, d.y, str(scene_no))
            d.c.drawRightString(RIGHT_X + 0.5 * IN, d.y, str(scene_no))
            for ln in wrap(p, ACTION_CH - 4):
                d.line(LEFT, ln, "MonoB")
        elif kind == "action":
            ls = wrap(p, ACTION_CH)
            if not d.room(len(ls) + 1):
                if len(ls) > 3 and d.room(3):
                    d.blank()
                    k = int((d.y - BOTTOM) / LH) + 1
                    for ln in ls[:k]:
                        d.line(LEFT, ln)
                    ls = ls[k:]
                    d.new_page()
                else:
                    d.new_page()
            d.blank()
            for ln in ls:
                d.line(LEFT, ln)
        elif kind == "center":
            if not d.room(2): d.new_page()
            d.blank()
            for ln in wrap(p, ACTION_CH):
                d.c.setFont("Mono", 12)
                d.c.drawCentredString(LEFT + ACTION_CH * 7.2 / 2, d.y, ln); d.y -= LH
        elif kind == "trans":
            if not d.room(2): d.new_page()
            d.blank()
            d.c.setFont("Mono", 12)
            d.c.drawRightString(RIGHT_X, d.y, p); d.y -= LH
        elif kind == "dialogue":
            name, parts = p
            rows = []
            for k, t in parts:
                if k == "par":
                    rows += [(PAR_X, l) for l in wrap(t, PAR_CH)]
                else:
                    rows += [(DLG_X, l) for l in wrap(t, DLG_CH)]
            if not d.room(len(rows) + 2):
                avail = int((d.y - BOTTOM) / LH) + 1 - 3  # blanco + nombre + (MÁS)
                if avail >= 2 and len(rows) - avail >= 2:
                    d.blank()
                    d.line(CHAR_X, name.upper())
                    for x, l in rows[:avail]:
                        d.line(x, l)
                    d.line(CHAR_X, "(MÁS)")
                    rows = rows[avail:]
                    d.new_page()
                    d.line(CHAR_X, name.upper() + " (CONT.)")
                    for x, l in rows:
                        d.line(x, l)
                    prev = kind
                    continue
                d.new_page()
            d.blank()
            d.line(CHAR_X, name.upper())
            for x, l in rows:
                d.line(x, l)
        prev = kind
    d.c.showPage()
    d.c.save()
    return d.page, scene_no


if __name__ == "__main__":
    import json
    src = "\n".join(open(f, encoding="utf-8").read() for f in sys.argv[3:])
    tp = json.load(open(sys.argv[2], encoding="utf-8"))
    pages, scenes = render(parse(src), sys.argv[1], tp)
    print(f"páginas de guion: {pages}  escenas: {scenes}")
