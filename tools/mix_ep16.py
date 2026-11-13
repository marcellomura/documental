"""Mezcla del ep16 (EL PUNTO DÉBIL): narración + banda sonora compuesta por código sobre la línea de tiempo (tools/synth16.py)
+ sonidos de la magnetósfera y diseño sonoro atado a las frases (los mismos cortes que video/src/ep16).
Uso: EP=ep16 python3 tools/mix_ep16.py   → audio/mix/mezcla_ep16.wav  (largo)
     EP=ep16v python3 tools/mix_ep16.py  → audio/mix/mezcla_ep16v.wav (vertical)
48 kHz estéreo, −14 LUFS integrados, pico −1,5 dBTP. Tonalidad: re menor; el motivo (re-la-fa-mi) suena en el título,
al nombrar la anomalía, en el Chaco y al final. Nada viene de ElevenLabs salvo la voz."""
import json, os, re, subprocess, sys, unicodedata
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth16 import SR, bell, boom, chorus, env, geiger, glitch, hum, kick, lp, hp, note, noise, pad, pluck, reverb, riser, shimmer, static, stereo, sub, tick, tt, whistler, whoosh, beep

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.environ.get("EP", "ep16")
TL = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/timeline.json")))
W = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/words.json")))
ST, TOTAL, END = TL["starts"], TL["total"], TL["end"]
DUR = TL["durations"]
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
N = int((TOTAL + 1) * SR)
voice = np.zeros(N, np.float32)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def C(seg, phrase, n=0, which="s"):
    ws = W[seg]; tg = norm(phrase); found = -1
    for i in range(len(ws)):
        acc = ""
        for j in range(i, len(ws)):
            acc += norm(ws[j]["w"])
            if acc == tg or (j == i and acc.startswith(tg)):
                found += 1
                if found == n: return ST[seg] + (ws[i]["s"] if which == "s" else ws[j]["e"])
                break
            if not tg.startswith(acc): break
    raise KeyError(f"{seg} {phrase} #{n}")
def CE(seg, phrase, n=0): return C(seg, phrase, n, "e")
def S(seg): return ST[seg]
def E(seg): return ST[seg] + DUR[seg]
def has(seg): return seg in ST


def add(buf, x, t, gain=1.0):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), N - i)
    if n > 0: buf[i:i + n] += x[:n] * gain


# ---------------- voz ----------------
for k in ST:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, f"video/public/ep16/narracion/{k}.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32)
    i = int(ST[k] * SR); voice[i:i + len(a)] += a[: N - i]

# ---------------- vocabulario musical ----------------
CH = {"Dm": ["D3", "F3", "A3", "D4"], "Dm9": ["D3", "A3", "E4", "F4"], "Bb": ["Bb2", "D3", "F3", "Bb3"], "F": ["F2", "A2", "C3", "F3"], "C": ["C3", "E3", "G3", "C4"],
      "Gm": ["G2", "Bb2", "D3", "G3"], "A": ["A2", "C#3", "E3", "A3"], "D": ["D3", "F#3", "A3", "D4"], "Am": ["A2", "C3", "E3", "A3"], "Dlow": ["D2", "A2", "D3"],
      "Dmhi": ["A3", "D4", "E4", "A4"], "cold": ["D3", "Eb3", "A3"], "Fmaj7": ["F2", "A2", "C3", "E3"], "Bbmaj7": ["Bb2", "D3", "F3", "A3"], "Dsus": ["D3", "G3", "A3", "D4"]}


def chord(name, t0, d, a=1.2, r=1.8, bright=900, amp=0.11, det=6):
    if d <= 0.05: return
    add(music, pad([note(n) for n in CH[name]], d + r * 0.5, a=a, r=r, bright=bright, det=det, amp=amp), t0)


def prog(names, t0, step, a=0.8, r=1.6, bright=900, amp=0.11):
    for i, nm in enumerate(names): chord(nm, t0 + i * step, step + 0.6, a=a, r=r, bright=bright, amp=amp)


def motif(t0, step=0.55, octv=5, amp=0.16, pan=0.0):
    for i, n in enumerate(["D", "A", "F", "E"]):
        o = octv if n != "A" else octv - 1
        add(music, reverb(bell(note(f"{n}{o}"), 4.5, ratio=3.5, idx=1.8, decay=2.4, amp=amp, pan=pan + (i - 1.5) * 0.2), 3.5, 0.45), t0 + i * step)


def arp(names, t0, t1, rate, amp=0.05, octv_up=1, bright=1.0, seed=1):
    r = np.random.default_rng(seed); i = 0; t = t0
    while t < t1:
        ch = CH[names[int((t - t0) / max((t1 - t0) / len(names), 0.01)) % len(names)]]
        n = ch[i % len(ch)]; f = note(n) * 2 ** octv_up
        add(music, pluck(f, 1.2, decay=0.45, amp=amp * r.uniform(0.75, 1.0), pan=r.uniform(-0.5, 0.5), bright=bright), t)
        t += 1 / rate; i += 1


def pulse(t0, t1, bpm0, bpm1=None, amp=0.18, f0=80, f1=40):
    bpm1 = bpm1 or bpm0; t = t0
    while t < t1:
        k = (t - t0) / max(t1 - t0, 1e-3)
        add(music, kick(0.7, f0, f1, amp), t)
        t += 60 / (bpm0 + (bpm1 - bpm0) * k)


def drone(t0, d, f="D1", amp=0.18, am=0.3):
    if d > 0.2: add(music, sub(note(f), d, amp=amp, a=min(2.0, d / 3), r=min(2.5, d / 3), am=am, amf=0.13), t0)


def bells(t0, t1, every=2.4, notes=("D6", "A5", "F6", "E6", "C6"), amp=0.045, seed=3):
    r = np.random.default_rng(seed); t = t0
    while t < t1:
        add(music, reverb(bell(note(notes[r.integers(len(notes))]), 3.5, ratio=2.8, idx=1.0, decay=1.6, amp=amp, pan=r.uniform(-0.7, 0.7)), 3.0, 0.5), t)
        t += every * r.uniform(0.7, 1.3)


def fx(x, t, gain=1.0): add(sfx, x, t, gain)


dips = []   # (desde, hasta, nivel) para la música: <1 baja, >1 sube

# ================================================================== s01: la Estación, las fallas, el triángulo, el Chaco, el título
if has("s01"):
    s0 = S("s01")
    lead = max(0.0, s0 - 3.2)
    tAhi, tSens, tHub, tObs, tAst, tLe, tPero, tSA, tPunto, tMonte = C("s01", "Ahí"), C("s01", "Los sensores"), C("s01", "El telescopio"), C("s01", "observar"), C("s01", "Y los astronautas"), C("s01", "Le dicen"), C("s01", "Pero no está"), C("s01", "Está sobre Sudamérica"), C("s01", "Y su punto"), C("s01", "el monte")
    TITLE = CE("s01", "argentino") + (0.45 if EP == "ep16" else 0.25)
    drone(lead, tAhi + 0.4 - lead, "D1", 0.16)
    chord("Dm9", lead, tAhi - lead, a=3.5, r=1.2, bright=650, amp=0.09)
    bells(lead + 1.0, tAhi - 0.6, every=2.3)
    pulse(C("s01", "Y varias"), tAhi - 0.1, 66, 104, amp=0.16)
    # fallas: dron que tiembla, crepitar, error
    drone(tAhi - 0.2, tHub - tAhi + 0.2, "D1", 0.10, am=0.9)
    fx(glitch(0.5, 0.32, 11), C("s01", "las computadoras") + 0.1); fx(glitch(0.35, 0.28, 12), CE("s01", "cuelgan") - 0.1)
    for k in range(5): fx(beep(1975, 0.08, 0.05, (k % 2 - 0.5)), C("s01", "las computadoras") + 0.25 + k * 0.32)
    fx(static(tHub - tSens + 0.3, 0.07, 900), tSens - 0.2)
    # el Hubble: un tono que se corta
    tn = tt(tObs + 0.35 - tHub); add(music, stereo((np.sin(2 * np.pi * note("A5") * tn) * env(len(tn), 0.4, 0.02) * 0.05).astype(np.float32)), tHub)
    fx(tick(0.03, 2500, 0.25), tObs + 0.35); fx(whoosh(1.0, 0.18, up=False), tObs + 0.35)
    # ojos cerrados: casi silencio, destellos
    chord("Dmhi", tAst, tLe - tAst, a=2.0, r=1.0, bright=1600, amp=0.025)
    for k, dt in enumerate([0.4, 1.3, 2.2, 2.9, 3.6, 4.4]): fx(shimmer(2.0, note("C7") * (1 + 0.12 * (k % 3)), 0.07, (k % 3 - 1) * 0.5), C("s01", "ojos") + dt - 0.2)
    # el triángulo y Sudamérica
    fx(whoosh(1.4, 0.22), tLe - 0.6)
    prog(["Dm", "Bb", "F", "C"], tLe, 2.1, bright=1000, amp=0.10)
    arp(["Dm", "Bb", "F", "C"], tLe + 0.4, tPunto, 4, amp=0.045)
    fx(boom(4.5, 0.5), tSA + 0.6); drone(tSA + 0.6, TITLE - tSA, "D1", 0.16)
    prog(["Gm", "Bb", "C", "A"], tPunto, (TITLE - tPunto) / 4, a=0.6, bright=1500, amp=0.11)
    pulse(tPunto + 0.5, TITLE - 0.1, 96, 132, amp=0.14)
    fx(riser(TITLE - tPunto, 0.22), tPunto + 0.2)
    fx(whoosh(2.2, 0.2, up=False), C("s01", "cae en"))
    # el título
    fx(boom(6.0, 0.75), TITLE)
    add(music, pad([note(n) for n in ["D2", "A2", "D3", "F3", "A3", "D4"]], (S("s02") if has("s02") else S("s04")) - TITLE + 1.5, a=0.04, r=4.5, bright=1300, amp=0.17), TITLE)
    motif(TITLE + 0.35, step=0.62, amp=0.16)

# ================================================================== s02: el núcleo, el dínamo, el escudo, el viento solar, Marte
if has("s02"):
    tB, tTres, tGira, tCorr, tCampo, tDin, tSale, tInv, tPero, tChorro, tMarte, tCon = C("s02", "bajar"), C("s02", "Casi tres"), C("s02", "Ese hierro gira"), C("s02", "genera corrientes"), C("s02", "Las corrientes generan"), C("s02", "Es un dínamo"), C("s02", "Ese campo sale"), C("s02", "Es invisible"), C("s02", "Pero alcanza"), C("s02", "un chorro"), C("s02", "Marte perdió"), C("s02", "Y con él")
    fx(whoosh(1.6, 0.3, up=False), tB - 0.4)
    add(music, hum(tCampo + 1.5 - tB, 36.7, 0.2), tB)
    chord("Dlow", tB + 0.3, tGira - tB, a=2.5, r=2.0, bright=420, amp=0.10)
    # convección: pulsaciones graves y resonancias metálicas
    t = tGira; i = 0
    while t < tCampo:
        add(music, pluck(note(["D2", "A2", "F2", "A2"][i % 4]), 1.4, decay=0.6, amp=0.12), t)
        if i % 2 == 0: add(music, reverb(bell(note("D4") * (1.0 + 0.137 * (i % 3)), 2.5, ratio=2.76, idx=3.0, decay=1.2, amp=0.035, pan=(i % 3 - 1) * 0.6), 2.5, 0.5), t + 0.25)
        t += 0.5; i += 1
    fx(riser(tCampo - tCorr + 0.2, 0.16, 120, 900), tCorr - 0.2)
    prog(["F", "C", "Dm", "Bb"], tCampo, 2.3, bright=1500, amp=0.12)
    motif(tDin + 0.2, amp=0.13)
    chord("Dmhi", tSale, tPero - tSale, a=2.0, r=2.0, bright=1800, amp=0.08)
    for k, dt in enumerate([0.8, 3.4, 6.2]): fx(whistler(1.9, 7000 - k * 500, 550, 0.13, (k - 1) * 0.6), tSale + dt)
    # imán de heladera: dos notas, una grave
    fx(beep(note("A5"), 0.5, 0.06), C("s02", "cien veces")); fx(beep(note("A3"), 0.5, 0.05), C("s02", "cien veces") + 0.45)
    # viento solar: trémolo y soplo
    tn = tt(tMarte - tPero); wnd = hp(noise(tMarte - tPero, "pink"), 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * tn)) * env(len(tn), 1.2, 1.0)
    fx(stereo(wnd.astype(np.float32)) * 0.10, tPero)
    arp(["Dm", "C"], tPero + 0.2, tMarte - 0.3, 8, amp=0.035, octv_up=2, bright=1.6)
    chord("Dm", tPero, tMarte - tPero, a=1.0, r=1.0, bright=2000, amp=0.07)
    # Marte: frío
    chord("cold", tMarte - 0.2, E("s02") - tMarte + 1.2, a=1.5, r=2.0, bright=520, amp=0.08)
    tn = tt(E("s02") - tMarte + 1.5); fx(stereo((lp(noise(len(tn) / SR, "pink"), 700) * env(len(tn), 1.0, 1.5)).astype(np.float32)) * 0.06, tMarte)
    fx(whoosh(2.5, 0.16, up=False), tCon + 0.3)

# ================================================================== s03: atrapa · Explorer 1 · contador · cinturones
if has("s03"):
    tTam, tEn, tLlev, tCuanto, tSat, tFis, tDos, tCint, tAd, tSalvo = C("s03", "También atrapa"), C("s03", "En mil"), C("s03", "llevaba"), C("s03", "Cuanto más"), C("s03", "se saturó"), C("s03", "El físico"), C("s03", "dos anillos"), C("s03", "los cinturones"), C("s03", "El de adentro"), C("s03", "Salvo")
    arp(["Dm", "Dm", "Bb", "C"], S("s03") - 0.5, tEn - 0.2, 3, amp=0.05)
    chord("Dm", S("s03") - 0.5, tEn - S("s03"), a=1.5, r=1.5, bright=800, amp=0.08)
    fx(whoosh(1.2, 0.18), tTam - 0.4)
    # archivo de 1958: campanas «de cinta» y un acorde cálido
    chord("F", tEn, tCuanto - tEn, a=1.2, r=1.2, bright=700, amp=0.07, det=14)
    bells(tEn + 0.4, tCuanto - 0.5, every=1.8, notes=("F5", "A5", "C6", "E5"), amp=0.035, seed=8)
    fx(stereo(hp(noise(tCuanto - tEn, "white"), 4000) * 0.02), tEn)   # siseo de archivo
    # el contador: cuentas que suben hasta saturarse (cero)
    dGe = tSat - tCuanto + 0.25
    fx(geiger(lambda x: 2 + 260 * (x / dGe) ** 2.2, dGe, 0.38), tCuanto)
    dips.append((tCuanto - 0.2, tSat + 0.9, 0.35))
    fx(tick(0.02, 3000, 0.3), tSat + 0.25)
    # los cinturones: majestuoso
    fx(boom(4.0, 0.45), tDos - 0.1)
    prog(["Bb", "F", "C", "Dm"], tFis + 0.5, 2.3, bright=1300, amp=0.12)
    arp(["Bb", "F", "C", "Dm"], tDos, tAd, 4, amp=0.045, octv_up=1)
    motif(tCint + 0.1, amp=0.12)
    chord("Dsus", tAd, tSalvo - tAd, a=1.5, r=1.0, bright=700, amp=0.07)
    pulse(tAd + 0.3, tSalvo, 60, 60, amp=0.10)
    fx(boom(3.5, 0.45), tSalvo + 0.05); drone(tSalvo, E("s03") - tSalvo + 2.0, "D1", 0.16, am=0.5)
    tn = tt(3.2); add(music, stereo((np.sin(2 * np.pi * note("Eb5") * tn) * env(len(tn), 1.5, 1.2) * 0.03).astype(np.float32)), tSalvo + 0.4)

# ================================================================== s04: el imán corrido · la abolladura · la anomalía
if has("s04"):
    s0 = S("s04")
    tIncl, tCorr, tDel, tNuestro, tSobre, tDos, tEst, tHub, tMiles, tEs = C("s04", "Está inclinado"), C("s04", "Y está corrido"), C("s04", "Del lado opuesto"), C("s04", "Ese lado es"), C("s04", "Sobre Sudamérica"), C("s04", "doscientos"), C("s04", "Por debajo de la Estación"), C("s04", "Por debajo del Hubble"), C("s04", "Por debajo de miles"), C("s04", "Es la Anomalía")
    chord("Dlow", s0 - 0.6, tDel - s0 + 0.6, a=1.5, r=1.5, bright=500, amp=0.09)
    pulse(s0, tDel, 72, 72, amp=0.12)
    fx(beep(note("A5"), 0.25, 0.06), tIncl + 0.5); fx(beep(note("D6"), 0.25, 0.06), CE("s04", "Pacífico") - 0.3)
    fx(whoosh(1.8, 0.2), tDel - 0.5)
    prog(["Dm", "Bb", "Gm", "A"], tDel, (tSobre - tDel) / 4, bright=1000, amp=0.10)
    # la abolladura: tensión que sube; cada «por debajo», un golpe
    chord("Dm", tSobre, tEs - tSobre, a=1.0, r=0.6, bright=900, amp=0.08)
    pulse(tSobre, tEs - 0.3, 96, 128, amp=0.13)
    fx(riser(tEs - tSobre, 0.18, 150, 1200), tSobre)
    for tt_ in (tDos, tEst, tHub, tMiles):
        fx(kick(0.8, 70, 32, 0.35), tt_ - 0.05); fx(reverb(bell(note("D3"), 2.5, ratio=2.0, idx=2.0, decay=1.4, amp=0.06), 2.5, 0.4), tt_)
    fx(boom(5.0, 0.7), tEs - 0.05)
    add(music, pad([note(n) for n in ["D2", "A2", "D3", "F3", "A3", "E4"]], E("s04") - tEs + 3.0, a=0.05, r=3.0, bright=1100, amp=0.15), tEs)
    motif(tEs + 0.5, amp=0.14)

# ================================================================== s05: el chip, los equipos que se apagan, el Hubble, GEDI
if has("s05"):
    s0 = S("s05")
    tAtr, tCero, tPor, tApag, tHub, tLaser = C("s05", "atravesar"), C("s05", "cero"), C("s05", "Por eso"), C("s05", "apagan"), C("s05", "El Hubble"), C("s05", "Y un instrumento")
    t = s0 - 0.3
    while t < E("s05"):
        fx(tick(0.02, 7000, 0.06, 0.3 * np.sin(t * 3)), t); t += 0.25
    chord("Am", s0 - 0.5, tHub - s0, a=1.0, r=1.0, bright=900, amp=0.07)
    pulse(s0, tHub, 120, 120, amp=0.08, f0=70, f1=45)
    fx(whoosh(0.5, 0.2), tAtr + 0.1); fx(glitch(0.4, 0.3, 21), (tCero + C("s05", "un uno")) / 2)
    for k in range(4): fx(beep(880 - k * 110, 0.12, 0.06), tApag + 0.05 + k * 0.25)
    arp(["Dm", "C", "Bb", "A"], tHub - 0.2, tLaser - 0.3, 6, amp=0.04, octv_up=1)
    chord("Dm", tHub - 0.2, tLaser - tHub, a=0.8, r=0.8, bright=1100, amp=0.07)
    chord("F", tLaser - 0.2, E("s05") - tLaser + 1.2, a=0.8, r=1.2, bright=800, amp=0.06)
    t = tLaser + 0.6; k = 0
    while t < E("s05"): fx(beep(1320, 0.06, 0.035), t); t += 0.55; k += 1

# ================================================================== s06: Don Pettit, las cámaras, las hadas danzantes
if has("s06"):
    s0 = S("s06")
    tNote, tCam, tNev, tY, tDest, tEl, tSon, tSobre, tVar = C("s06", "las notebooks"), C("s06", "Que las cámaras"), C("s06", "nevara"), C("s06", "Y que"), C("s06", "destellos"), C("s06", "Él los"), C("s06", "Son partículas"), C("s06", "Sobre esta zona"), C("s06", "a varias")
    chord("Bbmaj7", s0 - 0.6, tY - s0 + 0.6, a=1.8, r=1.5, bright=1300, amp=0.07)
    bells(s0, tY, every=2.6, notes=("D6", "F6", "A6", "C7"), amp=0.03, seed=13)
    fx(glitch(0.45, 0.28, 31), CE("s06", "cuelgan") - 0.3)
    fx(static(tY - tCam + 0.2, 0.08, 1400), tCam)
    chord("Dmhi", tY - 0.2, tSon - tY + 0.6, a=2.0, r=1.5, bright=2200, amp=0.05)
    for k, dt in enumerate([0.1, 0.9, 1.6, 2.5, 3.3, 4.2, 5.0, 5.6]): fx(shimmer(2.2, note("A6") * (1 + 0.09 * (k % 4)), 0.08, ((k * 37) % 7 / 3.5) - 1), tDest - 0.3 + dt)
    fx(whoosh(1.0, 0.15, up=False), tSon - 0.3)
    chord("Dlow", tSon, tSobre - tSon + 0.4, a=0.8, r=0.8, bright=500, amp=0.08)
    pulse(tSon, tSobre, 70, 70, amp=0.1)
    # destellos por minuto: ticks espaciados que se vuelven densos
    t = tSobre
    while t < E("s06") + 0.5:
        dense = t > tVar - 0.3
        fx(tick(0.02, 4200, 0.12 if dense else 0.16, np.sin(t * 7) * 0.5), t)
        t += 0.12 if dense else 0.9
    chord("Dm", tSobre, E("s06") - tSobre + 1.5, a=1.0, r=1.5, bright=800, amp=0.06)

# ================================================================== s07: los protones medidos · «Y acá… esto.»
if has("s07"):
    s0 = S("s07")
    tCada, tCasi, tAca, tEsto = C("s07", "Cada punto"), C("s07", "Casi todo"), C("s07", "acá"), C("s07", "esto")
    fx(chorus(tAca - s0 + 1.0, 0.12, rate=5), s0 - 0.5)
    drone(s0 - 0.5, tEsto - s0 + 0.8, "D1", 0.10, am=0.2)
    t = tCada; k = 0
    while t < tCasi: fx(beep(2093 if k % 3 else 2637, 0.05, 0.03, (k % 5 - 2) * 0.3), t); t += 0.22; k += 1
    chord("Dmhi", tCasi - 0.3, tAca - tCasi + 0.3, a=1.0, r=0.4, bright=2000, amp=0.04)
    dips.append((tCasi, tAca - 0.1, 0.6))
    fx(riser(tEsto - tAca + 0.1, 0.24, 120, 1500), tAca - 0.1)
    fx(boom(6.0, 0.85), tEsto - 0.05)
    add(music, pad([note(n) for n in ["D2", "Ab2", "D3", "F3", "Ab3"]], E("s07") - tEsto + 4.0, a=0.03, r=3.0, bright=1600, amp=0.16), tEsto - 0.05)
    tn = tt(4.0); fx(stereo((np.tanh(hp(noise(4.0, "pink"), 400) * 3) * np.exp(-tn * 0.9) * 0.18).astype(np.float32)), tEsto - 0.05)

# ================================================================== s08: el mínimo en la superficie
if has("s08"):
    s0 = S("s08")
    tSup, tPolos, tAca, tTercio, tModelo, tHoy, tEs, tVeinte = C("s08", "En la superficie"), C("s08", "Cerca de los polos"), C("s08", "Acá,"), C("s08", "Un tercio"), C("s08", "El modelo"), C("s08", "Hoy da"), C("s08", "Es el Chaco"), C("s08", "A veinte")
    fx(whoosh(1.6, 0.22, up=False), s0 - 0.6)
    prog(["Dm", "C", "Bb", "C", "Dm", "F", "Gm", "A"], s0, (tEs - s0) / 8, bright=900, amp=0.085)
    arp(["Dm", "C", "Bb", "C"], tSup, tModelo, 3.2, amp=0.04)
    fx(beep(note("E6"), 0.3, 0.05), tPolos + 0.6); fx(beep(note("D4"), 0.4, 0.06), tAca + 0.4)
    fx(kick(0.9, 60, 30, 0.3), tTercio)
    for k in range(3): fx(tick(0.02, 5000, 0.1), tHoy + 0.4 + k * 0.5)
    fx(boom(4.0, 0.4), tEs - 0.05)
    chord("Dm9", tEs - 0.1, E("s08") - tEs + 1.8, a=0.4, r=2.0, bright=1200, amp=0.11)
    motif(tEs + 0.3, amp=0.13)

# ================================================================== s09: el camino del mínimo
if has("s09"):
    s0 = S("s09")
    marks = [C("s09", "En mil"), C("s09", "En los años sesenta"), C("s09", "En los noventa"), C("s09", "cruzó"), C("s09", "pasó por"), C("s09", "y sigue")]
    t = s0 - 0.3; bl = ["D2", "F2", "G2", "A2", "C3", "A2", "G2", "F2"]; i = 0
    while t < E("s09") + 0.5:
        add(music, pluck(note(bl[i % 8]), 1.0, decay=0.5, amp=0.11), t); t += 0.48; i += 1
    chord("Dm", s0 - 0.3, E("s09") - s0 + 1.2, a=1.0, r=1.5, bright=900, amp=0.07)
    for k, mt in enumerate(marks): fx(reverb(bell(note(["A5", "C6", "D6", "E6", "F6", "A6"][k]), 3.0, ratio=3.5, idx=1.5, decay=1.6, amp=0.07), 3.0, 0.45), mt + 0.15)

# ================================================================== s10: Pilar, la zona que crece, Swarm, se parte en dos
if has("s10"):
    s0 = S("s10")
    tEnt, tUn, tZona, tEn1900, tQuinta, tSw, tCerca, tLa = C("s10", "Entonces"), C("s10", "Un veintidós"), C("s10", "Y la zona"), C("s10", "En mil"), C("s10", "Una quinta"), C("s10", "Los satélites"), C("s10", "cerca de África"), C("s10", "La anomalía")
    chord("Dm", s0 - 0.4, tEnt - s0, a=1.0, r=1.0, bright=800, amp=0.08)
    pulse(tEnt - 0.2, tZona - 0.3, 88, 88, amp=0.09, f0=60, f1=40)
    t = tEnt
    while t < tUn: fx(tick(0.015, 6000, 0.05), t); t += 0.34
    prog(["Dm", "C", "Bb", "A"], tEnt - 0.2, (tZona - tEnt) / 4, bright=900, amp=0.08)
    fx(kick(0.9, 60, 30, 0.35), tUn)
    fx(riser(tQuinta - tEn1900 + 0.5, 0.15, 100, 700), tEn1900)
    prog(["Bb", "C", "Dm", "F", "Gm", "A"], tZona - 0.2, (tSw - tZona) / 6, bright=1200, amp=0.10)
    for k in range(3): fx(beep(1568 + 200 * k, 0.1, 0.04, (k - 1) * 0.6), tSw + 0.4 + k * 0.3)
    chord("Dmhi", tSw, tLa - tSw, a=1.0, r=1.0, bright=1600, amp=0.07)
    # se parte en dos: dos notas que se separan
    tn = tt(4.0); ph1 = 2 * np.pi * np.cumsum(note("D5") * 2 ** (-tn * 0.06)) / SR; ph2 = 2 * np.pi * np.cumsum(note("D5") * 2 ** (tn * 0.06)) / SR
    sp = np.stack([np.sin(ph1), np.sin(ph2)], 1).astype(np.float32) * env(len(tn), 0.3, 1.5)[:, None] * 0.06
    add(music, reverb(sp, 3.0, 0.4), tLa)
    fx(boom(4.0, 0.4), CE("s10", "dos") - 0.1)

# ================================================================== s11: el borde del núcleo
if has("s11"):
    s0 = S("s11")
    tBorde, tPero, tEntra, tSon, tUna, tMasa = C("s11", "en el borde"), C("s11", "Pero debajo"), C("s11", "entra"), C("s11", "Son parches"), C("s11", "Una de las"), C("s11", "una masa")
    fx(whoosh(2.0, 0.25, up=False), s0 - 0.4)
    add(music, hum(E("s11") - s0 + 2.0, 36.7, 0.22), s0)
    chord("Dlow", s0, tPero - s0 + 0.5, a=2.0, r=1.5, bright=600, amp=0.10)
    chord("cold", tPero, tSon - tPero + 0.5, a=1.0, r=1.0, bright=700, amp=0.08)
    fx(kick(1.0, 55, 28, 0.4), tEntra - 0.05); fx(reverb(bell(note("D3"), 3, ratio=1.4, idx=2.5, decay=2.0, amp=0.07), 3, 0.5), tEntra)
    prog(["Dm", "Bb", "Gm", "A"], tSon, (tUna - tSon) / 4, bright=800, amp=0.09)
    # la masa: un bronce grave
    tn = tt(E("s11") - tMasa + 1.5)
    brass = lp(np.sum([np.sin(2 * np.pi * note("D2") * k * tn) / k for k in range(1, 9)], 0), 380) * env(len(tn), 1.2, 1.5)
    add(music, stereo(brass.astype(np.float32)) * 0.10, tMasa)

# ================================================================== s12: ¿se da vuelta?
if has("s12"):
    s0 = S("s12")
    tPorque, tNorte, tPaso, tUlt, tY, tPero, tApar, tSu = C("s12", "Porque"), C("s12", "el norte"), C("s12", "Pasó cientos"), C("s12", "La última"), C("s12", "Y en los últimos"), C("s12", "Pero un estudio"), C("s12", "Aparecieron"), C("s12", "Su pronóstico")
    chord("Dm", s0 - 0.5, tNorte - s0, a=2.0, r=1.0, bright=600, amp=0.08)
    drone(s0 - 0.5, tPero - s0, "D1", 0.14, am=0.4)
    # la inversión: el acorde al revés y una caída grave
    rev = pad([note(n) for n in CH["Dm"]], 2.6, a=2.2, r=0.05, bright=1500, amp=0.14)
    add(music, rev, tNorte - 1.6); fx(boom(4.0, 0.5), tNorte + 0.9)
    fx(whoosh(1.4, 0.2), tPaso - 0.5)
    # franjas del fondo del mar: tics como un código de barras
    for k, st_ in enumerate([0, 0.2, 0.5, 0.62, 0.9, 1.2, 1.32, 1.7, 1.85, 2.2, 2.5]): fx(tick(0.02, 2600 + 300 * (k % 3), 0.12, (k % 2 - 0.5) * 0.8), tPaso + 0.3 + st_)
    fx(kick(1.0, 60, 30, 0.35), tUlt + 0.9)
    chord("Gm", tPaso, tY - tPaso, a=1.0, r=1.0, bright=700, amp=0.07)
    t = tY; k = 0
    while t < tPero - 0.3: fx(reverb(bell(note(["A5", "G5", "F5", "E5", "D5"][k % 5]), 2.5, ratio=3.5, idx=1.2, decay=1.3, amp=0.05), 2.5, 0.45), t); t += 0.9; k += 1
    # el giro: anomalías que aparecen y se van
    prog(["F", "C", "Dm", "Bb"], tPero - 0.2, (tApar - tPero) / 4, bright=1000, amp=0.09)
    chord("D", tApar, tSu - tApar + 0.5, a=1.2, r=1.2, bright=1200, amp=0.09)
    prog(["Bbmaj7", "F", "C", "D"], tSu - 0.2, (E("s12") - tSu + 1.0) / 4, bright=1200, amp=0.10)

# ================================================================== s13: ¿y a vos?
if has("s13"):
    s0 = S("s13")
    tNada, tAtm, tNasa, tBr = C("s13", "Nada"), C("s13", "La atmósfera"), C("s13", "La NASA"), C("s13", "Las brújulas")
    monte = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "video/public/ep14/sfx/monte.mp3"), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    mo = np.frombuffer(monte, dtype=np.float32).reshape(-1, 2).copy(); mo /= (np.abs(mo).max() + 1e-9)
    d = min(len(mo) / SR, tAtm - s0 + 2.5); m2 = mo[: int(d * SR)] * env(int(d * SR), 1.0, 1.5)[:, None]
    fx(m2, s0 - 0.8, 0.10)
    dips.append((tNada - 0.2, tAtm - 0.2, 0.15))
    chord("D", tAtm - 0.3, tNasa - tAtm + 0.4, a=1.0, r=1.0, bright=1000, amp=0.07)
    for k in range(6): fx(tick(0.02, 3800, 0.06, (k % 3 - 1) * 0.5), tAtm + 0.2 + k * 0.18)
    chord("Fmaj7", tNasa - 0.2, E("s13") - tNasa + 1.2, a=1.2, r=1.5, bright=1100, amp=0.08)
    fx(beep(note("A5"), 0.15, 0.05), tBr + 0.5); fx(beep(note("D6"), 0.15, 0.05), C("s13", "Tu celular") + 0.4)

# ================================================================== s14: lo que vive arriba · SAOCOM
if has("s14"):
    s0 = S("s14")
    tArg = C("s14", "y los satélites")
    pulse(s0, tArg, 80, 80, amp=0.08, f0=60, f1=40)
    prog(["Dm", "C", "Bb", "C"], s0 - 0.3, (tArg - s0) / 4, bright=1000, amp=0.08)
    t = s0; k = 0
    while t < tArg: fx(beep([1568, 1760, 2093][k % 3], 0.05, 0.03, (k % 5 - 2) * 0.35), t); t += 0.31; k += 1
    chord("Dm9", tArg - 0.2, E("s14") - tArg + 1.0, a=0.6, r=1.2, bright=1200, amp=0.09)
    motif(tArg + 0.4, step=0.5, amp=0.11)

# ================================================================== s15: la abolladura · el centro · alguien que ve luces · fin
if has("s15"):
    s0 = S("s15")
    tMueve, tDeb, tTiene, tY, tNadie, tMientras, tOjos, tVe, tLuces = C("s15", "Se mueve"), C("s15", "Se debilita"), C("s15", "Tiene una"), C("s15", "Y esa"), C("s15", "nadie"), C("s15", "Mientras"), C("s15", "ojos"), C("s15", "y ve"), C("s15", "luces")
    prog(["Dm", "Bb", "F", "C"], s0 - 0.5, (tTiene - s0 + 0.5) / 4, bright=1100, amp=0.10)
    for tt_ in (tMueve, tDeb, tTiene): fx(kick(0.9, 70, 32, 0.32), tt_ - 0.03)
    fx(boom(4.0, 0.45), tTiene - 0.03)
    chord("Dm", tTiene, tY - tTiene + 0.4, a=0.2, r=1.0, bright=1400, amp=0.11)
    chord("Bbmaj7", tY, tMientras - tY + 0.4, a=1.0, r=1.2, bright=900, amp=0.08)
    motif(C("s15", "un punto") + 0.2, step=0.7, amp=0.10)
    # arriba otra vez: la Estación de noche, los pings del principio
    drone(tMientras - 0.3, tOjos - tMientras + 0.8, "D1", 0.14)
    chord("Dm9", tMientras - 0.3, tOjos - tMientras + 0.5, a=1.5, r=0.6, bright=650, amp=0.08)
    bells(tMientras, tOjos - 0.3, every=1.2)
    dips.append((tOjos + 0.1, tVe, 0.2))
    fx(shimmer(3.0, note("D7"), 0.12, 0.0), tLuces - 0.1); fx(shimmer(3.0, note("A6"), 0.08, -0.5), tLuces + 0.25); fx(shimmer(3.0, note("F7"), 0.07, 0.5), tLuces + 0.6)
    add(music, pad([note(n) for n in ["D2", "A2", "D3", "E3", "F3", "A3", "D4"]], TOTAL - tLuces + 1.0, a=0.6, r=5.0, bright=1100, amp=0.14), tLuces)
    motif(END + 0.8, step=0.75, amp=0.12)
    fx(boom(6.0, 0.5), END + 0.6)

# ================================================================== v01 (vertical): la invitación
if has("v01"):
    t0 = S("v01") - 0.4
    fx(whoosh(1.4, 0.2), t0 - 0.6)
    add(music, pad([note(n) for n in ["D2", "A2", "D3", "F3", "A3", "D4"]], TOTAL - t0 + 0.5, a=0.3, r=3.0, bright=1200, amp=0.13), t0)
    motif(t0 + 0.4, step=0.55, amp=0.12)

# ================================================================== mezcla
music = reverb(music, 3.4, 0.22)[:N]
# compresión suave de la voz por envolvente (sidechain): la música baja ~8 dB bajo la palabra
win = int(0.05 * SR)
v2 = np.convolve(voice ** 2, np.ones(win) / win, mode="same")
venv = np.sqrt(v2); venv /= venv.max() + 1e-9
act = np.clip(venv / 0.12, 0, 1)
# suavizado: ataque 60 ms, relajación 450 ms
g = np.empty_like(act); a_up, a_dn = np.exp(-1 / (0.06 * SR)), np.exp(-1 / (0.45 * SR)); y = 0.0
for i in range(0, len(act), 64):
    x = act[i:i + 64].max()
    y = a_up * y + (1 - a_up) * x if x > y else a_dn * y + (1 - a_dn) * x
    g[i:i + 64] = y
duck_m = 1 - 0.62 * g
duck_s = 1 - 0.30 * g
lev = np.ones(N, np.float32)
for a, b, k in dips:
    i0, i1 = int(a * SR), int(b * SR); r = int(0.3 * SR)
    seg = np.full(max(i1 - i0, 1), k, np.float32)
    seg[:r] = np.linspace(1, k, len(seg[:r])); seg[-r:] = np.linspace(k, 1, len(seg[-r:]))
    lev[i0:i0 + len(seg)] *= seg[: N - i0]
mixd = stereo(voice) * 0.5 ** 0.5 * 1.0 + music * (duck_m * lev)[:, None] * 0.95 + sfx * duck_s[:, None] * 0.85
if os.environ.get("STEMS"):
    for nm, x in (("voz", stereo(voice) * 0.5 ** 0.5), ("musica", music * (duck_m * lev)[:, None] * 0.95), ("efectos", sfx * duck_s[:, None] * 0.85)):
        x[: int(TOTAL * SR)].astype(np.float32).tofile(os.path.join(OUT, f"_{EP}_{nm}.f32"))
mixd = mixd[: int(TOTAL * SR)]
fade = int(1.5 * SR); mixd[-fade:] *= np.linspace(1, 0, fade)[:, None]
tmp = os.path.join(OUT, f"_{EP}_pre.f32")
mixd.astype(np.float32).tofile(tmp)
out = os.path.join(OUT, f"mezcla_{EP}.wav")
# normalización de sonoridad en dos pasadas
st = subprocess.run(["ffmpeg", "-hide_banner", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(st[st.rindex("{"):st.rindex("}") + 1])
af = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", tmp, "-af", af, "-ar", str(SR), "-c:a", "pcm_s24le", out], check=True)
os.remove(tmp)
st = subprocess.run(["ffmpeg", "-hide_banner", "-i", out, "-af", "loudnorm=I=-14:TP=-1.5:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m2 = json.loads(st[st.rindex("{"):st.rindex("}") + 1])
print(out, f"{TOTAL:.1f} s · {m2['input_i']} LUFS · pico {m2['input_tp']} dBTP · música/voz/efectos mezclados")
