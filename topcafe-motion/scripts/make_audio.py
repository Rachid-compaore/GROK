"""Bande-son TOPCAFÉ « CRÉMEUX ET DÉLICIEUX » — 30 s, 120 BPM (1 temps = 0,5 s).

0–4 s   : ouverture cinématique (boom grave, nappe sombre, montée), grain qui passe, éclat du logo.
4 s     : la vague de lait (liquide), puis le groove démarre : électro soul chaleureuse.
10 s    : mousse (pétillement) puis explosion de cacao (souffle), univers Cappuccino.
17 s    : tourbillon caramel (liquide), univers Café Latte.
24 s    : packshot final, montée, impact sur le slogan, accord final.
Chaque « CRÉMEUX ET DÉLICIEUX » reçoit un impact discret. Tout est synthétisé (libre de droits).
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR, DUR = 48000, 30.0
B = 0.5
N = int(SR * DUR)
rng = np.random.default_rng(5)
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
def pad(notes, d, cut=1500):
    t = tt(d); s = sum(saw(midi(n), t) for n in notes) / len(notes)
    return lp(s, cut) * np.minimum(1, t / 0.7) * np.minimum(1, (d - t) / 0.7)
def rhodes(n, d=1.4):
    t = tt(d); f = midi(n)
    return (np.sin(2 * np.pi * f * t + 0.8 * np.exp(-t * 6) * np.sin(2 * np.pi * f * t)) ) * np.exp(-t * 2.4) * np.minimum(1, t / 0.003)
def kick():
    t = tt(0.4); f = 45 + 95 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
def snap():
    t = tt(0.2); return bp(rng.normal(size=len(t)), 1200, 6000) * np.exp(-t * 28)
def hat(o=False):
    t = tt(0.18 if o else 0.05); return hp(rng.normal(size=len(t)), 8000) * np.exp(-t * (15 if o else 70))
def bass(n, d):
    t = tt(d); f = midi(n)
    return lp(np.sin(2 * np.pi * f * t) + 0.4 * saw(f, t, 1), 380) * np.minimum(1, t / 0.006) * np.exp(-t * 2)
def boom(d=3.0):
    t = tt(d); f = 32 + 40 * np.exp(-t * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.3) + lp(rng.normal(size=len(t)), 160) * np.exp(-t * 2) * 0.6

mus = np.zeros((N, 2))
# ouverture sombre : boom + nappe grave + montée
add(mus, boom(), 0.0, 0.55)
add(mus, pad([38, 45, 50, 53], 4.2, 700), 0.0, 0.3)
t = tt(1.6); add(mus, bp(rng.normal(size=len(t)), 300, 8000) * (t / 1.6) ** 3, 1.5, 0.18)
# groove 4 s → 24 s : Dm9 – Bbmaj7 – Gm9 – A7sus
prog = [(38, [57, 60, 64, 65]), (34, [57, 62, 65, 69]), (31, [58, 62, 65, 69]), (33, [55, 60, 62, 67])]
bar = 4 * B; m = 0; t0 = 4.0
while t0 < 22.7:
    root, notes = prog[m % 4]
    add(mus, pad(notes, bar + 0.3, 1900), t0, 0.12)
    for st in range(4):
        tb = t0 + st * B
        add(mus, kick(), tb, 0.5)
        if st % 2: add(mus, snap(), tb, 0.2)
        add(mus, hat(True), tb + B / 2, 0.05, 0.3); add(mus, hat(), tb + B / 4, 0.025, -0.3); add(mus, hat(), tb + 3 * B / 4, 0.025, -0.3)
    for st, ln in ((0, 0.7), (0.75, 0.25), (1.5, 0.5), (2, 0.7), (3, 0.5), (3.5, 0.4)):
        add(mus, bass(root + (12 if st == 0.75 else 0), ln * B), t0 + st * B, 0.36)
    for k, st in enumerate((0, 1.25, 2.5, 3.25)):
        add(mus, rhodes(notes[k % 4] + 12), t0 + st * B, 0.08, 0.3 * (-1) ** k)
    t0 += bar; m += 1
# montée vers le packshot puis accord final
t = tt(1.0); add(mus, bp(rng.normal(size=len(t)), 400, 9000) * (t / 1.0) ** 3, 21.7, 0.16)
add(mus, boom(3.0) * 0.8, 22.7, 0.5)
add(mus, pad([50, 57, 62, 65, 69, 72], 7.3, 2400), 22.7, 0.2)
for k, n in enumerate([74, 77, 81, 84]): add(mus, rhodes(n, 2.5), 25.2 + k * 0.2, 0.08)
t0 = 23.0
while t0 < 28.8:  # pulsation douce sous le packshot
    add(mus, kick(), t0, 0.32); add(mus, hat(True), t0 + B / 2, 0.035, 0.3); t0 += 2 * B

# ------------------------------------------------------------------ bruitages
sfx = np.zeros((N, 2))
def whoosh(d=0.7, up=True):
    t = tt(d); x = t / d; n = rng.normal(size=len(t)); mm = x if up else 1 - x
    return (lp(n, 700) * (1 - mm) + bp(n, 1800, 8000) * mm * 0.7) * np.sin(np.pi * x) ** 2
def impact(d=1.4):
    t = tt(d); f = 40 + 70 * np.exp(-t * 18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.5) + lp(rng.normal(size=len(t)), 800) * np.exp(-t * 12) * 0.4
def shimmer(d=1.4):
    out = np.zeros(int(d * SR))
    for k, n in enumerate((86, 89, 93, 98, 101)):
        t = tt(0.9); s = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 5)
        i = int(k * 0.06 * SR); out[i:i + len(s)] += s[: len(out) - i]
    return out
def liquid(d=1.4):
    t = tt(d); body = bp(rng.normal(size=len(t)), 200, 1600)
    mod = np.clip(1 + lp(rng.normal(size=len(t)), 10) * 30, 0.2, 2.5)
    s = body * mod * np.sin(np.pi * t / d) ** 1.5
    for _ in range(18):
        st = rng.uniform(0.05, d - 0.15); bn = int(0.05 * SR); bt = np.arange(bn) / SR
        fq = rng.uniform(400, 1000) * (1 + 3 * bt)
        i = int(st * SR); s[i:i + bn] += np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-bt * 60) * 0.6
    return s
def fizz(d=0.8):
    t = tt(d); out = np.zeros(len(t))
    for _ in range(140):
        i = int(rng.uniform(0, d - 0.01) * SR); n = int(0.004 * SR)
        out[i:i + n] += hp(rng.normal(size=n), 5000) * rng.uniform(0.2, 1)
    return out * np.sin(np.pi * t / d)
def puff(d=0.9):
    t = tt(d); return lp(rng.normal(size=len(t)), 1500) * np.exp(-t * 5) * np.minimum(1, t / 0.01)
def bean_tick():
    t = tt(0.05); return bp(rng.normal(size=len(t)), 1800, 5000) * np.exp(-t * 110)

for k in range(5): add(sfx, bean_tick(), 0.5 + k * 0.1, 0.05, rng.uniform(-0.6, 0.6))   # grains posés, lumière qui monte
add(sfx, whoosh(0.8), 0.95, 0.34, -0.5)                                                   # le grain traverse l'objectif
add(sfx, impact(), 1.65, 0.36); add(sfx, shimmer(), 1.75, 0.09)                            # éclat doré, TOPCAFÉ
add(sfx, liquid(1.0), 3.65, 0.32); add(sfx, whoosh(0.8), 3.65, 0.14)                       # vague de lait
add(sfx, impact(1.0), 4.15, 0.24)                                                           # sachet 3 IN 1
add(sfx, fizz(), 9.65, 0.16); add(sfx, whoosh(0.8, False), 9.65, 0.16)                      # front de mousse
add(sfx, puff(), 9.85, 0.4); add(sfx, impact(1.0), 10.25, 0.3)                              # cacao + sachet Cappuccino
add(sfx, liquid(1.0), 16.15, 0.28); add(sfx, whoosh(0.8), 16.15, 0.14)                      # anneau caramel
add(sfx, impact(1.0), 16.75, 0.22)                                                          # sachet Café Latte
add(sfx, whoosh(0.9), 22.65, 0.26); add(sfx, liquid(0.9), 22.7, 0.16)                       # vague dorée vers le packshot
for t0 in (23.25, 23.4, 23.55): add(sfx, impact(0.6), t0, 0.12)                             # arrivée des 3 sachets
add(sfx, shimmer(), 24.4, 0.08)                                                             # TOPCAFÉ
for t0 in (6.7, 12.7, 19.2): add(sfx, impact(1.0), t0, 0.22); add(sfx, shimmer(1.0), t0 + 0.05, 0.06)  # slogans
add(sfx, impact(2.0), 25.2, 0.42); add(sfx, shimmer(1.6), 25.25, 0.12)                     # slogan final

ir_t = tt(1.6); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 4)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
mix = mus + sfx
mix = mix + np.stack([fftconvolve(mix[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.16
t = tt(DUR); mix *= (np.clip(t / 0.05, 0, 1) * np.clip((DUR - t) / 1.6, 0, 1))[:, None]
mix = np.tanh(mix * 1.25) / np.tanh(1.25); mix *= 0.9 / np.abs(mix).max()
wavfile.write("public/music_raw.wav", SR, (mix * 32767).astype(np.int16))
print("public/music_raw.wav écrit")
