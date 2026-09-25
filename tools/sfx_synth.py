"""Efectos sintetizados (lluvia, viento, trueno, fuego, oleaje, apagado) para las mezclas del episodio 4 y sus shorts."""
import numpy as np
from numpy.fft import rfft, irfft
SR = 48000
rng = np.random.default_rng(4)

def shaped_noise(sec, lo, hi, tilt=0.0):
    n = int(sec * SR); X = rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    band = ((f >= lo) & (f <= hi)).astype(float) * (np.maximum(f, 20) / 1000.0) ** tilt
    y = irfft(X * band, n); return (y / (np.abs(y).max() + 1e-9)).astype(np.float32)
def fade(y, fi=0.3, fo=0.5):
    n = len(y); e = np.ones(n, np.float32); a, b = int(fi * SR), int(fo * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] *= np.linspace(1, 0, b)
    return y * e
def stereo(y, width=0.0):
    if width <= 0: return np.stack([y, y], 1)
    d = int(0.012 * SR); z = np.concatenate([np.zeros(d, np.float32), y[:-d]])
    return np.stack([y, (1 - width) * y + width * z], 1)
def rain(sec):
    y = shaped_noise(sec, 900, 12000, -0.3) * 0.55
    drops = np.zeros(int(sec * SR), np.float32)
    for _ in range(int(sec * 70)):
        i = rng.integers(0, len(drops) - 400); dd = rng.standard_normal(300).astype(np.float32) * np.exp(-np.arange(300) / 40)
        drops[i:i + 300] += dd * rng.uniform(0.2, 0.8)
    return stereo(fade(y + drops * 0.5, 0.4, 0.8), 0.8)
def wind(sec, k0=1.0, k1=1.0):
    n = int(sec * SR); y = shaped_noise(sec, 150, 2200, -0.6)
    t = np.arange(n) / SR; lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t + 1.3) * np.sin(2 * np.pi * 0.13 * t)
    amp = np.linspace(k0, k1, n); return stereo(fade(y * lfo * amp, 0.6, 0.8), 0.9)
def thunder(sec=4.0):
    n = int(sec * SR); y = shaped_noise(sec, 25, 380, -1.0); t = np.arange(n) / SR
    env = np.exp(-t / 1.4) * (1 - np.exp(-t / 0.03)); crack = shaped_noise(sec, 800, 6000) * np.exp(-t / 0.12) * 0.35
    return stereo((y * env * 1.1 + crack).astype(np.float32), 0.6)
def fire(sec):
    n = int(sec * SR); y = shaped_noise(sec, 200, 1500, -0.8) * 0.35
    for _ in range(int(sec * 45)):
        i = rng.integers(0, n - 200); y[i:i + 120] += rng.standard_normal(120).astype(np.float32) * np.exp(-np.arange(120) / 12) * rng.uniform(0.3, 1)
    return stereo(fade(y, 0.3, 0.6), 0.7)
def swell(sec=2.5):
    y = shaped_noise(sec, 60, 900, -1.2); t = np.arange(len(y)) / SR
    return stereo(y * np.sin(np.pi * t / sec) ** 2, 0.8)
def powerdown(sec=1.4):
    t = np.arange(int(sec * SR)) / SR; f = 220 * np.exp(-t * 1.6)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.2) * 0.6 + shaped_noise(sec, 100, 800) * 0.1 * np.exp(-t * 2)
    return stereo(y.astype(np.float32))
