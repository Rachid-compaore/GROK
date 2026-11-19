"""Bande-son de la pub LIPTON BLACK TEA (30 s, 120 BPM, 1 temps = 0,5 s).

Électro moderne et lumineuse, légèrement cinématique :
0–4 s intro (nappe chaude + montée), 4–7 s thé (piano doux, ambiance chaude),
7 s drop (groove complet), un accent par saveur, final 26–30 s.
Bruitages : whoosh aux transitions, impact à chaque produit, petits « pops »
de fruits, accents sur la typographie. Tout est synthétisé (libre de droits).
Pour mettre une autre musique : remplacez public/music.wav (30 s).
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR, DUR, BPM = 48000, 30.0, 120
B = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(11)
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def add(buf, s, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    s = s[: N - i]
    buf[i:i + len(s), 0] += s * g * np.cos((pan + 1) * np.pi / 4)
    buf[i:i + len(s), 1] += s * g * np.sin((pan + 1) * np.pi / 4)
def saw(f, t, v=3, det=0.1):
    return sum(2 * ((f * 2 ** ((k - (v - 1) / 2) * det / 12) * t + rng.random()) % 1) - 1 for k in range(v)) / v

# ------------------------------------------------------------------ instruments
def pad(notes, d, cut=1600):
    t = tt(d); s = sum(saw(midi(n), t) for n in notes) / len(notes)
    return lp(s, cut) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)
def epiano(n, d=1.6):
    t = tt(d); f = midi(n)
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3)) * np.exp(-t * 2.2) * np.minimum(1, t / 0.003)
def pluck(n, d=0.4):
    t = tt(d); f = midi(n)
    return lp(saw(f, t, 2, 0.08), 3000) * np.exp(-t * 10) * np.minimum(1, t / 0.002)
def kick():
    t = tt(0.4); f = 46 + 100 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
def clap():
    t = tt(0.25); return bp(rng.normal(size=len(t)), 900, 4500) * np.exp(-t * 20)
def hat(o=False):
    t = tt(0.2 if o else 0.05); return hp(rng.normal(size=len(t)), 8000) * np.exp(-t * (14 if o else 70))
def bass(n, d):
    t = tt(d); f = midi(n)
    return lp(saw(f, t, 2, 0.05) + np.sin(2 * np.pi * f * t), 420) * np.minimum(1, t / 0.005) * np.exp(-t * 2.2)

mus = np.zeros((N, 2))
# Fa majeur lumineux : Fmaj9 – Am7 – Dm9 – Bbmaj9 (une mesure = 2 s)
prog = [(41, [57, 60, 64, 67]), (45, [57, 60, 64, 67]), (38, [57, 60, 62, 65]), (46, [57, 62, 65, 69])]
# intro + scène thé : nappe chaude, montée
add(mus, pad([53, 57, 60, 64], 7.2, 900), 0.0, 0.22)
t = tt(3.0); x = t / 3.0
add(mus, bp(rng.normal(size=len(t)), 300, 8000) * x ** 2.5, 1.0, 0.10)       # montée vers le logo
for k, n in enumerate([72, 76, 79, 81, 84, 81]):                               # piano doux (thé)
    add(mus, epiano(n), 4.0 + k * 0.5, 0.10, 0.3 * (-1) ** k)
t = tt(1.0); x = t / 1.0
add(mus, bp(rng.normal(size=len(t)), 500, 9000) * x ** 3, 6.0, 0.14)         # montée vers le drop
# groove principal 7 s → 26 s
bar = 4 * B
m = 0
t0 = 7.0
while t0 < 26.0:
    root, notes = prog[m % 4]
    add(mus, pad(notes, bar + 0.3, 2200), t0, 0.12)
    for st in range(4):
        tb = t0 + st * B
        add(mus, kick(), tb, 0.55)
        if st % 2 == 1: add(mus, clap(), tb, 0.22)
        add(mus, hat(True), tb + B / 2, 0.06, 0.3)
        add(mus, hat(), tb + B / 4, 0.03, -0.3); add(mus, hat(), tb + 3 * B / 4, 0.03, -0.3)
    for st, ln in ((0, 0.75), (0.75, 0.5), (1.5, 0.5), (2, 0.75), (3, 0.5), (3.5, 0.4)):
        add(mus, bass(root, ln * B), t0 + st * B, 0.38)
    for k in range(8):
        add(mus, pluck(notes[(k * 3) % 4] + 12 + (12 if k % 4 == 3 else 0)), t0 + k * B / 2, 0.07, 0.4 * (-1) ** k)
    t0 += bar; m += 1
# final : accord large, plus de batterie
add(mus, kick() * 1.2, 26.0, 0.7)
add(mus, pad([53, 57, 60, 64, 67, 72], 4.0, 2600), 26.0, 0.22)
for k, n in enumerate([77, 81, 84, 88]):
    add(mus, epiano(n, 3.0), 26.2 + k * 0.25, 0.09)

# ------------------------------------------------------------------ bruitages
sfx = np.zeros((N, 2))
def whoosh(d=0.6, up=True):
    t = tt(d); x = t / d; n = rng.normal(size=len(t)); mm = x if up else 1 - x
    return (lp(n, 800) * (1 - mm) + bp(n, 2000, 8000) * mm * 0.7) * np.sin(np.pi * x) ** 2
def impact():
    t = tt(1.2); f = 42 + 70 * np.exp(-t * 20)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) + lp(rng.normal(size=len(t)), 700) * np.exp(-t * 12) * 0.4
def fruit_pop():
    t = tt(0.12); f = rng.uniform(500, 900) * (1 + 1.5 * (1 - np.exp(-t * 40)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)
def tick():
    t = tt(0.04); return bp(rng.normal(size=len(t)), 3000, 9000) * np.exp(-t * 160)
def shimmer():
    out = np.zeros(int(1.5 * SR))
    for k, n in enumerate((84, 88, 91, 96, 100)):
        t = tt(0.8); s = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 6)
        i = int(k * 0.07 * SR); out[i:i + len(s)] += s
    return out
def splash():
    t = tt(0.7); return bp(rng.normal(size=len(t)), 400, 3000) * np.exp(-t * 7) * np.minimum(1, t / 0.01)

add(sfx, shimmer(), 2.4, 0.08); add(sfx, impact(), 2.4, 0.25)      # logo
add(sfx, whoosh(0.8), 3.6, 0.2)                                       # vers le thé
for k in range(5): add(sfx, tick(), 4.7 + k * 0.08, 0.06)            # texte
for t0, up in ((6.7, True), (11.7, True), (16.7, False), (21.7, True), (25.7, True)):
    add(sfx, whoosh(0.8, up), t0, 0.24)
add(sfx, splash(), 12.0, 0.12)                                        # éclaboussure fraise
for t0 in (7.5, 12.5, 17.5, 22.4, 26.3):
    add(sfx, impact(), t0, 0.32)                                      # apparition des produits
    for k in range(4): add(sfx, fruit_pop(), t0 - 0.3 + k * 0.11, 0.06, rng.uniform(-0.6, 0.6))
    for k in range(4): add(sfx, tick(), t0 + 0.55 + k * 0.05, 0.05)
add(sfx, shimmer(), 26.8, 0.08)
ir_t = tt(1.5); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 4)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
mix = mus + sfx
mix = mix + np.stack([fftconvolve(mix[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.15
t = tt(DUR); mix *= (np.clip(t / 0.3, 0, 1) * np.clip((DUR - t) / 1.5, 0, 1))[:, None]
mix = np.tanh(mix * 1.3) / np.tanh(1.3); mix *= 0.9 / np.abs(mix).max()
wavfile.write("public/music_raw.wav", SR, (mix * 32767).astype(np.int16))
print("public/music_raw.wav écrit")
