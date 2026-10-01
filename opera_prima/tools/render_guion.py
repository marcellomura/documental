#!/usr/bin/env python3
"""Renderiza un guion escrito en un Fountain simplificado a PDF con formato
profesional (Courier 12, A4, márgenes e indentaciones estándar de la industria).

Sintaxis soportada:
  INT. / EXT. / INT./EXT. ...      encabezado de escena
  .ENCABEZADO FORZADO              encabezado de escena forzado
  NOMBRE                           personaje (línea en mayúsculas seguida de diálogo)
  (acotación)                      dentro de un bloque de diálogo
  > TRANSICIÓN:                    transición alineada a la derecha
  >TEXTO CENTRADO<                 texto centrado
  ===                              salto de página
  *itálica*  **negrita**  _subrayado_
  [[nota]]                         se ignora
"""
import re
import sys

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

FONT = {
    "": "Courier",
    "b": "Courier-Bold",
    "i": "Courier-Oblique",
    "bi": "Courier-BoldOblique",
}
SIZE = 12
LH = 12  # interlineado: 6 líneas por pulgada
CW = 7.2  # ancho de carácter en Courier 12

PW, PH = A4
LEFT = 1.5 * inch
RIGHT = 1.0 * inch
TOP = 1.0 * inch
BOTTOM = 0.9 * inch
WIDTH_CH = int((PW - LEFT - RIGHT) / CW)  # ~57
LINES_PER_PAGE = int((PH - TOP - BOTTOM) / LH)

IND = {  # (sangría desde margen izquierdo en caracteres, ancho en caracteres)
    "action": (0, WIDTH_CH),
    "heading": (0, WIDTH_CH),
    "character": (22, 30),
    "paren": (16, 24),
    "dialogue": (10, 35),
    "transition": (0, WIDTH_CH),
    "centered": (0, WIDTH_CH),
}

HEADING_RE = re.compile(r"^(INT\.|EXT\.|INT\./EXT\.|EXT\./INT\.|I/E\.)\s", re.I)


def parse_inline(text):
    """Devuelve lista de (palabra, estilo, subrayado) separando por espacios."""
    tokens = []
    bold = ital = under = False
    word = []
    i = 0

    def flush():
        if word:
            tokens.append(list(word))
            word.clear()

    cur = []  # runs del token actual: (texto, estilo, sub)
    while i < len(text):
        if text.startswith("**", i):
            bold = not bold
            i += 2
            continue
        ch = text[i]
        if ch == "*":
            ital = not ital
            i += 1
            continue
        if ch == "_" and (i == 0 or not text[i - 1].isalnum() or under):
            # subrayado sólo si actúa como marcador (no dentro de palabras)
            nxt = text[i + 1] if i + 1 < len(text) else " "
            if under or nxt.strip():
                under = not under
                i += 1
                continue
        style = ("b" if bold else "") + ("i" if ital else "")
        if ch == " ":
            if cur:
                tokens.append(cur)
                cur = []
        else:
            if cur and cur[-1][1] == style and cur[-1][2] == under:
                cur[-1] = (cur[-1][0] + ch, style, under)
            else:
                cur.append((ch, style, under))
        i += 1
    if cur:
        tokens.append(cur)
    return tokens


def tok_len(tok):
    return sum(len(r[0]) for r in tok)


def wrap(text, width):
    """Envuelve texto con estilos. Devuelve lista de líneas; cada línea es una
    lista de runs (texto, estilo, sub)."""
    tokens = parse_inline(text)
    lines, cur, cur_len = [], [], 0
    for tok in tokens:
        L = tok_len(tok)
        add = L if cur_len == 0 else L + 1
        if cur_len + add > width and cur:
            lines.append(cur)
            cur, cur_len = [], 0
            add = L
        if cur:
            cur.append((" ", cur[-1][1] if cur[-1][2] else "", cur[-1][2] and tok[0][2]))
        cur.extend(tok)
        cur_len += add
    if cur or not lines:
        lines.append(cur)
    return lines


class Block:
    def __init__(self, kind, lines, space_before=1, char=None):
        self.kind = kind
        self.lines = lines  # lista de (indent_chars, runs, align)
        self.space_before = space_before
        self.char = char


def mk_lines(kind, text, align="left"):
    ind, width = IND[kind]
    out = []
    for para in text.split("\n"):
        for ln in wrap(para, width):
            out.append((ind, ln, align))
    return out


def parse(src):
    raw = src.replace("\r", "").split("\n")
    # quitar notas
    raw = [re.sub(r"\[\[.*?\]\]", "", l) for l in raw]
    blocks = []
    i = 0
    n = len(raw)

    def is_blank(k):
        return k >= n or raw[k].strip() == ""

    while i < n:
        line = raw[i].rstrip()
        s = line.strip()
        if not s:
            i += 1
            continue
        if s == "===":
            blocks.append(Block("pagebreak", [], 0))
            i += 1
            continue
        if s.startswith(">") and s.endswith("<"):
            txt = s[1:-1].strip()
            blocks.append(Block("centered", mk_lines("centered", txt, "center")))
            i += 1
            continue
        if s.startswith(">"):
            txt = s[1:].strip()
            blocks.append(Block("transition", mk_lines("transition", txt, "right")))
            i += 1
            continue
        if HEADING_RE.match(s) or (s.startswith(".") and not s.startswith("..")):
            txt = s[1:] if s.startswith(".") else s
            ln = mk_lines("heading", "**" + txt.upper() + "**")
            blocks.append(Block("heading", ln, 2))
            i += 1
            continue
        # personaje: mayúsculas, línea siguiente no vacía
        letters = re.sub(r"\(.*?\)", "", s).strip()
        is_char = (
            letters
            and letters == letters.upper()
            and any(ch.isalpha() for ch in letters)
            and not s.endswith(":")
            and (i == 0 or is_blank(i - 1))
            and not is_blank(i + 1)
        )
        if is_char:
            lines = [("character",) + l for l in mk_lines("character", s)]
            i += 1
            while i < n and raw[i].strip():
                d = raw[i].strip()
                kind = "paren" if d.startswith("(") else "dialogue"
                lines += [(kind,) + l for l in mk_lines(kind, d)]
                i += 1
            blocks.append(Block("dialogue", lines, 1, char=s))
            continue
        # transición clásica: MAYÚSCULAS terminando en ':'
        if s == s.upper() and s.endswith(":") and is_blank(i + 1):
            blocks.append(Block("transition", mk_lines("transition", s, "right")))
            i += 1
            continue
        # acción: acumula hasta línea vacía
        para = [s]
        i += 1
        while i < n and raw[i].strip():
            para.append(raw[i].strip())
            i += 1
        blocks.append(Block("action", mk_lines("action", "\n".join(para))))
    return blocks


def draw_runs(c, x, y, runs):
    for text, style, under in runs:
        font = FONT[style]
        c.setFont(font, SIZE)
        c.drawString(x, y, text)
        w = len(text) * CW
        if under and text.strip():
            c.setLineWidth(0.6)
            c.line(x, y - 1.5, x + w, y - 1.5)
        x += w
    return x


def runs_len(runs):
    return sum(len(r[0]) for r in runs)


def render(blocks, out, title_page):
    c = canvas.Canvas(out, pagesize=A4)
    c.setTitle(title_page.get("title", "Guion"))
    c.setAuthor(title_page.get("author", ""))
    c.setSubject("Guion cinematográfico")

    # ---------- portada ----------
    tp = title_page
    c.setFont("Courier-Bold", 14)
    y = PH * 0.60
    for t in tp["title_lines"]:
        c.drawCentredString(PW / 2, y, t)
        y -= 18
    c.setFont("Courier", 12)
    y -= 30
    for t in tp["byline"]:
        c.drawCentredString(PW / 2, y, t)
        y -= 14
    y = 1.6 * inch
    for t in tp["left_bottom"]:
        c.drawString(LEFT, y, t)
        y -= 14
    y = 1.6 * inch
    for t in tp["right_bottom"]:
        c.drawRightString(PW - RIGHT, y, t)
        y -= 14
    c.showPage()

    # ---------- epígrafe opcional ----------
    if tp.get("epigraph"):
        c.setFont("Courier", 12)
        y = PH * 0.58
        for t in tp["epigraph"]:
            c.drawCentredString(PW / 2, y, t)
            y -= 14
        c.showPage()

    page = 1
    used = 0
    first_on_page = True

    def new_page():
        nonlocal page, used, first_on_page
        c.showPage()
        page += 1
        used = 0
        first_on_page = True

    def header():
        if page > 1:
            c.setFont("Courier", SIZE)
            c.drawRightString(PW - RIGHT, PH - 0.5 * inch, f"{page}.")

    def put_line(line):
        nonlocal used
        kind, ind, runs, align = line
        y = PH - TOP - used * LH - SIZE
        if align == "right":
            x = PW - RIGHT - runs_len(runs) * CW
        elif align == "center":
            x = LEFT + (WIDTH_CH - runs_len(runs)) * CW / 2
        else:
            x = LEFT + ind * CW
        draw_runs(c, x, y, runs)
        used += 1

    header()
    k = 0
    while k < len(blocks):
        b = blocks[k]
        if b.kind == "pagebreak":
            if used > 0:
                new_page()
                header()
            k += 1
            continue
        lines = [l if len(l) == 4 else (b.kind,) + tuple(l) for l in b.lines]
        sb = 0 if used == 0 else b.space_before
        need = sb + len(lines)
        remaining = LINES_PER_PAGE - used

        # encabezado: debe quedar con al menos 2 líneas del bloque siguiente
        if b.kind == "heading":
            nxt = blocks[k + 1] if k + 1 < len(blocks) else None
            extra = min(2, len(nxt.lines)) + 1 if nxt and nxt.kind != "pagebreak" else 0
            if need + extra > remaining:
                new_page()
                header()
                sb = 0
        elif need > remaining:
            avail = remaining - sb
            if b.kind == "dialogue" and avail >= 4 and len(lines) - (avail - 1) >= 2:
                first = lines[: avail - 1]
                rest = lines[avail - 1 :]
                # no cortar justo tras el nombre o una acotación
                while first and first[-1][0] in ("character", "paren"):
                    rest.insert(0, first.pop())
                if len([l for l in first if l[0] == "dialogue"]) >= 1:
                    used += sb
                    for l in first:
                        put_line(l)
                    put_line(("character", IND["character"][0], [("(MÁS)", "", False)], "left"))
                    new_page()
                    header()
                    name = re.sub(r"\s*\(.*?\)\s*", " ", b.char).strip()
                    put_line(("character", IND["character"][0], [(name + " (CONT.)", "", False)], "left"))
                    for l in rest:
                        if l[0] != "character":
                            put_line(l)
                    first_on_page = False
                    k += 1
                    continue
            elif b.kind == "action" and avail >= 2 and len(lines) - avail >= 2:
                used += sb
                for l in lines[:avail]:
                    put_line(l)
                new_page()
                header()
                for l in lines[avail:]:
                    put_line(l)
                k += 1
                continue
            new_page()
            header()
            sb = 0
        used += sb
        for l in lines:
            put_line(l)
        k += 1
    c.save()
    return page


if __name__ == "__main__":
    import json

    src_files = sys.argv[1].split(",")
    out = sys.argv[2]
    tp = json.load(open(sys.argv[3], encoding="utf-8"))
    src = "\n\n".join(open(f, encoding="utf-8").read() for f in src_files)
    blocks = parse(src)
    pages = render(blocks, out, tp)
    print(f"{out}: {pages} páginas de guion ({LINES_PER_PAGE} líneas/página, {WIDTH_CH} car./línea)")
