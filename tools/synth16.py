"""Instrumentos sintetizados del ep16 (EL PUNTO DÉBIL): todo hecho con numpy y scipy, sin muestras ni créditos externos.
Pad de sierras desafinadas, campanas FM, pulsaciones, sub, ruido de colores, reverb por convolución y los sonidos de la
magnetósfera: silbidos (whistlers, frecuencia ∝ 1/t² al dispersarse en el plasma), coro del amanecer (chirridos que
suben), contador Geiger (clics de Poisson con tasa variable) y el zumbido del núcleo."""
import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(16)


def tt(d):
    return np.arange(int(d * SR)) / SR


def note(n):
    """nombre (p. ej. 'D3', 'Bb4', 'F#2') → Hz"""
    names = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    s = n[0]; k = names[s]; i = 1
    while i < len(n) and n[i] in '#b':
        k += 1 if n[i] == '#' else -1; i += 1
    o = int(n[i:])
    return 440.0 * 2 ** ((k + 12 * (o + 1) - 69) / 12)


def env(n, a=0.01, r=0.3, shape=1.0):
    e = np.ones(n, np.float32)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na) ** shape
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** shape
    return e


def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def hp(x, fc, order=2):
    sos = signal.butter(order, fc, 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def bp(x, f0, f1, order=2):
    sos = signal.butter(order, [f0, min(f1, SR * 0.45)], 'band', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def stereo(x, pan=0.0):
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.41, np.sin((pan + 1) * np.pi / 4) * 1.41
    return np.stack([x * l, x * r], 1).astype(np.float32)


def saw(f, d, nh=18, phase=0.0):
    t = tt(d); x = np.zeros_like(t)
    for k in range(1, nh + 1):
        if f * k > SR * 0.42: break
        x += np.sin(2 * np.pi * f * k * t + phase * k) / k
    return x.astype(np.float32)


def pad(freqs, d, a=2.0, r=3.0, bright=900.0, det=6.0, voices=3, amp=0.12, wobble=0.15):
    """acorde de sierras desafinadas con filtro que respira, en estéreo ancho"""
    n = int(d * SR); out = np.zeros((n, 2), np.float32)
    t = tt(d)
    for fi, f in enumerate(freqs):
        for v in range(voices):
            c = (v - (voices - 1) / 2) * det
            x = saw(f * 2 ** (c / 1200), d, nh=14, phase=RNG.random() * 6.28)
            out += stereo(x, (v / max(voices - 1, 1) - 0.5) * 1.2) * (amp / (len(freqs) * voices) ** 0.5)
    cut = bright * (1 + wobble * np.sin(2 * np.pi * t / 7.3))
    # filtro variable aproximado: mezcla de dos pasabajos
    lo, hi = lp(out, bright * 0.6), lp(out, bright * 1.6)
    k = ((cut - bright * 0.6) / (bright * 1.0)).clip(0, 1)[:, None]
    y = lo * (1 - k) + hi * k
    return y * env(n, a, r)[:, None]


def bell(f, d=4.0, ratio=3.5, idx=2.5, decay=2.2, amp=0.2, pan=0.0):
    t = tt(d); e = np.exp(-t / decay)
    x = np.sin(2 * np.pi * f * t + idx * e * np.sin(2 * np.pi * f * ratio * t))
    x += 0.25 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / (decay * 0.5))
    return stereo((x * e * env(len(t), 0.002, 0.05)).astype(np.float32), pan) * amp


def pluck(f, d=1.6, decay=0.5, amp=0.18, nh=10, pan=0.0, bright=1.0):
    t = tt(d); x = np.zeros_like(t)
    for k in range(1, nh + 1):
        if f * k > SR * 0.42: break
        x += np.sin(2 * np.pi * f * k * t) * np.exp(-t * k * (1.3 / bright) / decay) / k ** 1.2
    return stereo((x * env(len(t), 0.003, 0.08)).astype(np.float32), pan) * amp


def sub(f, d, amp=0.25, a=1.0, r=1.5, am=0.0, amf=0.1):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)
    if am: x *= 1 - am * (0.5 + 0.5 * np.sin(2 * np.pi * amf * t))
    return stereo((x * env(len(t), a, r)).astype(np.float32)) * amp


def noise(d, color='pink'):
    n = int(d * SR)
    w = RNG.standard_normal(n).astype(np.float32)
    if color == 'white': return w
    W = np.fft.rfft(w); fr = np.fft.rfftfreq(n, 1 / SR); fr[0] = 1
    W /= fr ** (0.5 if color == 'pink' else 1.0)
    x = np.fft.irfft(W, n).astype(np.float32)
    return x / (np.abs(x).max() + 1e-9)


def reverb(x, rt=3.2, mix=0.3, pre=0.02, bright=6000):
    """convolución con una respuesta sintética (ruido estéreo decorrelacionado con caída exponencial)"""
    n = int(rt * SR * 1.2); t = np.arange(n) / SR
    ir = RNG.standard_normal((n, 2)).astype(np.float32) * np.exp(-6.9 * t / rt)[:, None]
    ir = lp(ir, bright); ir[: int(pre * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(0)) + 1e-9
    if x.ndim == 1: x = stereo(x)
    wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x) + n] for c in (0, 1)], 1).astype(np.float32)
    dry = np.zeros_like(wet); dry[: len(x)] = x
    return dry * (1 - mix) + wet * mix


def kick(d=0.7, f0=90, f1=38, amp=0.6):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 5.5)
    return stereo(np.tanh(x * 1.6).astype(np.float32)) * amp


def boom(d=4.0, amp=0.7):
    """golpe grave con cola: barrido de 70 a 28 Hz más ruido grave"""
    t = tt(d); f = 28 + 42 * np.exp(-t * 4)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.1)
    x += lp(noise(d, 'brown'), 180) * np.exp(-t * 2.5) * 0.6
    return reverb(stereo(np.tanh(x * 1.4).astype(np.float32)) * amp, 2.5, 0.25)


def tick(d=0.03, f=5000, amp=0.15, pan=0.0):
    x = bp(noise(d, 'white'), f * 0.7, f * 1.4) * env(int(d * SR), 0.0005, d * 0.8)
    return stereo(x, pan) * amp


def whoosh(d=1.6, amp=0.35, up=True):
    t = tt(d); x = noise(d, 'pink')
    fc = (300 + 5000 * (t / d) ** 2) if up else (5300 - 5000 * (t / d) ** 0.5)
    # filtro que barre: tramos con pasabanda distinto
    y = np.zeros_like(x); seg = int(0.05 * SR)
    for i in range(0, len(x), seg):
        c = fc[min(i, len(fc) - 1)]
        y[i:i + seg] = bp(x[max(0, i - 2048):i + seg], c * 0.6, c * 1.5)[-len(x[i:i + seg]):]
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return reverb(stereo(y * e) * amp, 1.6, 0.25)


def riser(d=3.0, amp=0.3, f0=200, f1=1600):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + saw(1, d) * 0  # tono
    x += hp(noise(d, 'pink'), 800) * (t / d) ** 2 * 0.8
    return reverb(stereo((x * (t / d) ** 1.6).astype(np.float32)) * amp, 2.0, 0.3)


def glitch(d=0.35, amp=0.3, seed=1):
    r = np.random.default_rng(seed); n = int(d * SR)
    x = np.zeros(n, np.float32); i = 0
    while i < n:
        L = int(r.uniform(0.004, 0.04) * SR); kind = r.random()
        if kind < 0.4: seg = r.choice([-1, 1], L) * r.uniform(0.3, 1)                                  # bits
        elif kind < 0.7: seg = np.sin(2 * np.pi * r.uniform(200, 3000) * np.arange(L) / SR)         # tono
        else: seg = r.standard_normal(L) * 0.6
        x[i:i + L] = seg[: n - i]; i += L + int(r.uniform(0, 0.02) * SR)
    x = np.round(x * 6) / 6   # reducción de bits
    return stereo(x * env(n, 0.002, 0.03), r.uniform(-0.6, 0.6)) * amp


def static(d, amp=0.08, density=600):
    """crepitar del sensor (nieve): chasquidos cortos y ruido fino"""
    n = int(d * SR); x = hp(noise(d, 'white'), 3000) * 0.15
    k = RNG.poisson(density * d)
    for _ in range(k):
        i = RNG.integers(0, n - 200); x[i:i + 60] += RNG.standard_normal(60) * np.exp(-np.arange(60) / 12)
    return stereo(x * env(n, 0.1, 0.2)) * amp


def whistler(d=1.8, f0=7000, f1=600, amp=0.25, pan=0.0):
    """silbido de rayo que viajó por la magnetósfera: la frecuencia baja como 1/t² (dispersión)"""
    t = tt(d); t0 = 0.08
    f = f1 + (f0 - f1) * (t0 / (t + t0)) ** 2
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = x * np.exp(-t / (d * 0.55)) * env(len(t), 0.005, 0.2)
    x += bp(noise(d, 'white'), 800, 6000) * 0.05 * np.exp(-t * 3)
    return reverb(stereo(x.astype(np.float32), pan) * amp, 1.8, 0.35)


def chorus(d=6.0, amp=0.2, rate=7.0, f0=1200, f1=4200):
    """coro del amanecer: muchos chirridos cortos que suben, superpuestos (ondas de modo silbido en la magnetósfera)"""
    n = int(d * SR); out = np.zeros((n, 2), np.float32)
    k = RNG.poisson(rate * d)
    for _ in range(k):
        L = RNG.uniform(0.12, 0.45); a = RNG.uniform(f0, f0 * 1.8); b = a + RNG.uniform(600, f1 - f0)
        tt_ = tt(L); f = a + (b - a) * (tt_ / L) ** 1.3
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt_ / L) ** 2
        i = RNG.integers(0, max(1, n - len(x)))
        out[i:i + len(x)] += stereo(x.astype(np.float32), RNG.uniform(-0.8, 0.8)) * RNG.uniform(0.3, 1.0)
    out *= env(n, 1.0, 1.5)[:, None]
    return reverb(out * amp, 2.6, 0.45)


def geiger(rate_fn, d, amp=0.35, seed=7):
    """contador Geiger: clics de Poisson con tasa rate_fn(t) (cuentas/s); devuelve estéreo"""
    r = np.random.default_rng(seed); n = int(d * SR); out = np.zeros(n, np.float32)
    click = (np.sin(2 * np.pi * 3200 * np.arange(240) / SR) * np.exp(-np.arange(240) / 30)
             + r.standard_normal(240) * np.exp(-np.arange(240) / 8) * 0.8).astype(np.float32)
    t = 0.0
    while t < d:
        lam = max(rate_fn(t), 1e-3)
        t += r.exponential(1 / lam)
        i = int(t * SR)
        if i + 240 < n: out[i:i + 240] += click * r.uniform(0.6, 1.0)
    return stereo(np.tanh(out * 1.5)) * amp


def hum(d, f=36.7, amp=0.22):
    """zumbido del núcleo: fundamental grave, armónicos que respiran y un rumor de lava"""
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2 * t + 0.6 * np.sin(2 * np.pi * 0.07 * t))
    x += 0.25 * np.sin(2 * np.pi * f * 3.01 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t))
    x += lp(noise(d, 'brown'), 120) * 0.8
    return stereo((x * env(len(t), 2.0, 2.0)).astype(np.float32)) * amp


def shimmer(d=2.5, f=2093.0, amp=0.18, pan=0.0):
    """destello: campanas agudas en racimo con cola larga"""
    out = np.zeros((int(d * SR), 2), np.float32)
    for k, m in enumerate([1, 1.5, 2, 2.5, 3]):
        b = bell(f * m, d, ratio=1.41 + k * 0.3, idx=1.2, decay=0.4 + 0.15 * k, amp=0.5 / (k + 1), pan=pan + (k - 2) * 0.15)
        out[: len(b)] += b[: len(out)]
    return reverb(out * amp, 3.0, 0.5)


def beep(f=1760, d=0.12, amp=0.12, pan=0.0):
    t = tt(d)
    return stereo((np.sin(2 * np.pi * f * t) * env(len(t), 0.003, 0.03)).astype(np.float32), pan) * amp
