"""Mezcla de los reels verticales v2: EP=rpb | EP=ocd python3 tools/mix_reel.py -> audio/mix/mezcla_<EP>.wav
Narración procesada + música con ducking + efectos sincronizados a las palabras + transiciones (whoosh en cada cambio de escena)."""
import json, os, re, subprocess, unicodedata
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.environ["EP"]
SR = 48000
TL = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/timeline.json")))
W = json.load(open(os.path.join(ROOT, f"video/src/data/{EP}/words.json")))
OUT = os.path.join(ROOT, "audio/mix"); os.makedirs(OUT, exist_ok=True)
SEGS, E, TOTAL = TL["segs"], TL["endCard"], TL["total"]

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

def c(seg, phrase, n=0):
    ws = W[seg]; tg = [norm(x) for x in phrase.split()]; found = -1
    for i in range(len(ws) - len(tg) + 1):
        if all(norm(ws[i + k]["w"]) == t for k, t in enumerate(tg)):
            found += 1
            if found == n: return SEGS[seg]["at"] + ws[i]["s"]
    raise KeyError(f"{seg} {phrase}")
at = lambda s: SEGS[s]["at"]

def load(path, stereo=True):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2" if stereo else "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, 2) if stereo else a

N = int((TOTAL + 0.5) * SR)
voice = np.zeros(N, np.float32); music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)
for sid, s in SEGS.items():
    a = load(os.path.join(ROOT, f"audio/{EP}/final/{sid}.wav"), stereo=False)
    i = int(s["at"] * SR); voice[i:i + len(a)] += a[: N - i]

def place(name, t0, t1, fin=0.8, fout=1.2, offset=0.0, gain=1.0):
    m = load(os.path.join(ROOT, f"video/public/music/{name}.mp3"))
    i0, n = int(t0 * SR), int((t1 - t0) * SR)
    m = m[int(offset * SR):]
    if len(m) < n: m = np.concatenate([m] * (n // len(m) + 1))
    m = m[:n]
    env = np.ones(n); a, b = int(fin * SR), int(fout * SR)
    env[:a] = np.linspace(0, 1, a); env[-b:] = np.linspace(1, 0, b)
    music[i0:i0 + n] += m * env[:, None] * gain

SF = {}
for f in os.listdir(os.path.join(ROOT, "video/public/sfx")):
    a = load(os.path.join(ROOT, "video/public/sfx", f)); SF[f[:-4]] = a / (np.abs(a).max() + 1e-9) * 0.5
def fx(name, t, gain=0.5):
    a = SF[name]; i = int(max(t, 0) * SR); n = min(len(a), N - i)
    sfx[i:i + n] += a[:n] * gain

if EP == "rpb":
    place("m2_tension", 0, at("s03") + 0.6, fin=0.05, offset=6)
    place("m1_intro", at("s03") - 0.4, at("s06") + 0.6, offset=20)
    place("m3_cierre", at("s06") - 0.4, TOTAL, fout=2.0)
    scenes = [c("s01", "Pero esta semana,"), c("s01", "¿No era"), at("s02"), c("s02", "En diciembre"), c("s02", "El auto"), at("s03"), c("s03", "Lo que importa"),
              at("s04"), c("s04", "Un hogar"), at("s05"), c("s05", "Los críticos"), at("s06"), c("s06", "¿Vos sentís")]
    fx("pop", c("s01", "La inflación"), 0.45); fx("riser", c("s01", "la pobreza sube."), 0.25); fx("pop", c("s01", "la pobreza sube."), 0.45)
    fx("boom", c("s01", "¿Cómo puede ser?"), 0.6)
    fx("pop", c("s01", "uno coma"), 0.5); fx("typewriter", c("s01", "uno de los datos"), 0.2)
    fx("riser", c("s01", "treinta y dos") - 1.0, 0.3); fx("boom", c("s01", "treinta y dos"), 0.55)
    for k in range(10): fx("pop", c("s01", "Quince millones") + 0.1 + k * 0.12, 0.16)
    fx("pop", c("s01", "baja la pobreza?") + 0.3, 0.45)
    fx("pop", c("s02", "no quiere decir"), 0.45); fx("glitch", c("s02", "los precios bajen."), 0.3)
    for k in range(7): fx("pop", c("s02", "Quiere decir") + k * 0.4, 0.2)
    fx("riser", c("s02", "En diciembre"), 0.3); fx("boom", c("s02", "veinticinco"), 0.5); fx("pop", c("s02", "Ahora suben"), 0.45)
    fx("whoosh", c("s02", "El auto") + 0.1, 0.4)
    for p in ["comida,", "ropa,", "transporte,", "salud."]: fx("pop", c("s03", p) - 0.1, 0.45)
    fx("pop", c("s03", "alcanza para") + 0.3, 0.4); fx("glitch", c("s03", "Si no alcanza,"), 0.3); fx("boom", c("s03", "sos pobre."), 0.5)
    fx("typewriter", c("s03", "Lo que importa") + 1.0, 0.2); fx("riser", c("s03", "es la carrera"), 0.3)
    fx("boom", c("s04", "ganó la canasta."), 0.5); fx("cashregister", c("s04", "ganó la canasta.") + 0.1, 0.25)
    for p in ["los ingresos", "La canasta,", "Y la comida,"]: fx("pop", c("s04", p), 0.45)
    fx("cashregister", c("s04", "necesita"), 0.3); fx("billetes", c("s04", "Le entran"), 0.35); fx("boom", c("s04", "Le falta"), 0.6)
    fx("pop", c("s05", "cuatro puntos."), 0.45); fx("pop", c("s05", "menos de uno."), 0.45); fx("pop", c("s05", "El Gobierno"), 0.4)
    fx("pop", c("s05", "Los críticos") + 0.4, 0.45); fx("riser", c("s05", "entre los chicos") - 0.5, 0.3); fx("boom", c("s05", "cuarenta y cuatro"), 0.5)
    fx("pop", c("s06", "la inflación te dice"), 0.4); fx("pop", c("s06", "La pobreza te dice"), 0.4); fx("pop", c("s06", "ayuda,"), 0.45); fx("glitch", c("s06", "pero no alcanza"), 0.3)
    for k in range(3): fx("pop", c("s06", "Contame") + k * 0.35, 0.35)
else:
    place("m3_cierre", 0, at("s03") + 0.6, fin=0.05, offset=30)
    place("m2_tension", at("s03") - 0.4, at("s06") + 0.6, offset=0)
    place("m1_intro", at("s06") - 0.4, TOTAL, fout=2.0, offset=50)
    scenes = [c("s01", "catorce"), c("s01", "¿El destino?"), at("s02"), c("s02", "Nació"), c("s02", "Sí:"), at("s03"), c("s03", "Lo que hace"), c("s03", "Entrar es"),
              at("s04"), c("s04", "La Argentina fue invitada"), c("s04", "Y al final,"), c("s04", "Colombia tardó"), at("s05"), c("s05", "Los que están a favor"),
              c("s05", "Los que dudan"), at("s06"), c("s06", "Milei va a París"), c("s06", "¿Vos qué pensás:")]
    fx("riser", c("s01", "Esta semana,") + 0.3, 0.3); fx("helicoptero", c("s01", "París.") - 0.6, 0.0); fx("boom", c("s01", "París."), 0.45)
    fx("pop", c("s01", "catorce"), 0.45); fx("pop", c("s01", "varios ministros"), 0.4); fx("pop", c("s01", "cuatrocientos"), 0.45)
    fx("boom", c("s01", "Un castillo."), 0.5); fx("whoosh", c("s01", "Ahí adentro"), 0.3); fx("pop", c("s01", "el club de los países ricos.") - 0.2, 0.5)
    fx("glitch", c("s01", "¿Qué es,"), 0.25); fx("pop", c("s01", "para qué sirve?"), 0.4)
    for k in range(4): fx("boom" if k == 3 else "pop", at("s02") + 0.3 + k * 0.12, 0.35)
    for k in range(4): fx("typewriter", c("s02", "la Organización") + k * 0.45, 0.12)
    fx("boom", c("s02", "Nació") + 0.2, 0.45); fx("riser", c("s02", "y hoy tiene"), 0.3)
    for k in range(12): fx("pop", c("s02", "treinta y ocho") + k * 0.075, 0.14)
    for p in ["Estados Unidos,", "Alemania,", "Japón…"]: fx("whoosh", c("s02", p) - 0.3, 0.25)
    for p in ["México,", "Chile,", "Colombia", "Costa Rica."]: fx("pop", c("s02", p) - 0.1, 0.4)
    fx("typewriter", c("s02", "Sí:") + 0.2, 0.25); fx("boom", c("s02", "pruebas PISA."), 0.45)
    fx("pop", at("s03") + 0.5, 0.4); fx("cashregister", c("s03", "como el FMI."), 0.3)
    for p in ["impuestos,", "corrupción,", "inversores,", "estadísticas."]: fx("pop", c("s03", p) - 0.2, 0.45)
    fx("riser", c("s03", "Entrar es"), 0.35); fx("boom", c("s03", "sello de calidad:"), 0.55)
    fx("glitch", c("s04", "Despacio."), 0.3); fx("boom", c("s04", "Despacio."), 0.4)
    for p in ["La Argentina fue invitada", "Su hoja de ruta", "En noviembre", "Ahora la revisan"]: fx("pop", c("s04", p), 0.45)
    fx("typewriter", c("s04", "autoevaluaciones.") - 0.6, 0.25)
    for k in range(14): fx("pop", c("s04", "Y al final,") + 0.4 + k * 0.12, 0.13)
    fx("boom", c("s04", "Todos."), 0.65)
    fx("pop", c("s04", "Colombia tardó"), 0.4); fx("pop", c("s04", "Costa Rica,"), 0.4)
    fx("boom", at("s05") + 0.1, 0.45); fx("pop", c("s05", "baja el riesgo"), 0.4); fx("billetes", c("s05", "atrae inversiones."), 0.4)
    for p in ["la minería,", "la energía", "la tecnología."]: fx("pop", c("s05", p) - 0.1, 0.4)
    fx("glitch", c("s05", "no te hace rico:"), 0.3); fx("pop", c("s05", "México está"), 0.4); fx("boom", c("s05", "todavía no"), 0.45)
    fx("riser", c("s05", "Y que las reformas"), 0.25)
    fx("glitch", c("s06", "no te da plata."), 0.3); fx("pop", c("s06", "Te da reglas"), 0.45)
    fx("riser", c("s06", "va a llevar años.") - 1.2, 0.3); fx("boom", c("s06", "va a llevar años."), 0.5)
    fx("pop", c("s06", "club de ricos,"), 0.4); fx("pop", c("s06", "club de reglas?"), 0.4)

for t in scenes: fx("whoosh", t - 0.25, 0.32)
fx("riser", E - 1.8, 0.4); fx("boom", E, 0.8); fx("pop", E + 1.0, 0.5)

def follower(x, att=0.015, rel=0.35):
    hop = SR // 100; n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    act = np.clip((20 * np.log10(r) + 42) / 14, 0, 1)
    out = np.zeros(n); e = 0; aa, ar = np.exp(-0.01 / att), np.exp(-0.01 / rel)
    for i in range(n):
        k = aa if act[i] > e else ar; e = k * e + (1 - k) * act[i]; out[i] = e
    return np.repeat(out, hop)
env = follower(voice); env = np.concatenate([env, np.zeros(N - len(env))])[:N]
music *= (0.50 - (0.50 - 0.16) * env)[:, None].astype(np.float32)

mix = music + sfx * 0.9; mix[:, 0] += voice; mix[:, 1] += voice
mix = mix[: int(TOTAL * SR)]; mix = mix / max(np.abs(mix).max(), 1e-9) * 0.89
raw = os.path.join(OUT, f"pre_{EP}.f32"); mix.astype(np.float32).tofile(raw)
mm = subprocess.run(["ffmpeg", "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(mm[mm.rindex("{"): mm.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", flt, "-c:a", "pcm_s16le", os.path.join(OUT, f"mezcla_{EP}.wav")], check=True)
os.remove(raw); print(f"ok -> audio/mix/mezcla_{EP}.wav")
