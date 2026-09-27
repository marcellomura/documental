"""Mezcla del spot del MDF: jingle + golpe grave en "El futuro, no." + campanita del logo.
Salida: audio/mix/mezcla_spot.wav (48 kHz estéreo, -14 LUFS, pico real -1 dBTP)."""
import os, subprocess, numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TOTAL = 93.0
OUT = os.path.join(ROOT, "audio", "mix"); os.makedirs(OUT, exist_ok=True)

def dec(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

n = int(TOTAL * SR)
mix = np.zeros((n, 2), np.float32)
j = dec(os.path.join(ROOT, "campana", "audio", "jingle_a.mp3"))
mix[: min(n, len(j))] += j[:n]

def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); k = min(len(sig), n - i)
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    mix[i:i + k, 0] += sig[:k] * gain * l * 1.41
    mix[i:i + k, 1] += sig[:k] * gain * r * 1.41

t = np.arange(int(2.2 * SR)) / SR
# golpe grave: seno que cae de 62 a 36 Hz + clic de ataque
f = 36 + 26 * np.exp(-t * 6)
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
rng = np.random.default_rng(3)
click = rng.standard_normal(len(t)) * np.exp(-t * 60) * 0.25
add((boom + click).astype(np.float32), 89.2, gain=0.55)

# campanita del logo: dos parciales con caída suave
t2 = np.arange(int(2.5 * SR)) / SR
bell = sum(a * np.sin(2 * np.pi * fr * t2) * np.exp(-t2 * d) for a, fr, d in [(0.5, 659.3, 2.2), (0.35, 987.8, 2.8), (0.18, 1318.5, 3.5)])
bell *= np.minimum(1, t2 / 0.004)
add(bell.astype(np.float32), 90.6, gain=0.16, pan=-0.2)
add(bell.astype(np.float32), 90.62, gain=0.12, pan=0.25)

# subida de ruido filtrado hacia el golpe
t3 = np.arange(int(1.1 * SR)) / SR
nz = rng.standard_normal(len(t3))
nz = np.convolve(nz, np.ones(24) / 24, mode="same")
riser = nz * (t3 / t3[-1]) ** 2.5
add(riser.astype(np.float32), 88.1, gain=0.10)

# fundido final
fo = int(0.6 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None]

tmp = os.path.join(OUT, "spot_pre.f32")
mix.astype(np.float32).tofile(tmp)
dst = os.path.join(OUT, "mezcla_spot.wav")
# dos pasadas de loudnorm para -14 LUFS / -1 dBTP
first = subprocess.run(["ffmpeg", "-hide_banner", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
import json, re
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", first, re.S).group(0))
af = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", tmp, "-af", af, "-ar", str(SR), "-c:a", "pcm_s24le", dst], check=True)
os.remove(tmp)
chk = subprocess.run(["ffmpeg", "-hide_banner", "-i", dst, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print(dst)
print("\n".join(l.strip() for l in chk.splitlines()[-12:] if "I:" in l or "Peak:" in l or "LRA:" in l))
