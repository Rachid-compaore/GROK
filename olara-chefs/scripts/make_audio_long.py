"""Bande-son de la version longue (23,65 s) — synchronisée sur SHOTS (src/OlaraChefsLong.tsx).

Sans la voix Gemini (ses mots ne conviennent pas) : musique chaleureuse et bruitages réels de cuisine,
avec de la place laissée à une voix off (public/media/voix-off.wav, si présente, mixée automatiquement).
"""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR, DUR = 48000, 23.25
N = int(SR * DUR)
rng = np.random.default_rng(31)
def tt(d): return np.arange(int(d * SR)) / SR
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, f): return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def env(t, a, r, d): return np.minimum(1, t / a) * np.minimum(1, np.maximum(0, d - t) / r)
def add(buf, s, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    s = s[: N - i]
    buf[i:i + len(s), 0] += s * g * np.cos((pan + 1) * np.pi / 4)
    buf[i:i + len(s), 1] += s * g * np.sin((pan + 1) * np.pi / 4)
def saw(f, t): return sum(2 * ((f * 2 ** (d / 12) * t + rng.random()) % 1) - 1 for d in (-0.1, 0, 0.1)) / 3
def pad(notes, d, cut=1700): t = tt(d); return lp(sum(saw(midi(n), t) for n in notes) / len(notes), cut) * env(t, 0.9, 1.2, d)
def piano(n, d=2.6):
    t = tt(d); f = midi(n)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) + 0.08 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 6)) * np.exp(-t * 1.5) * np.minimum(1, t / 0.004)
def kick(): t = tt(0.4); f = 46 + 70 * np.exp(-t * 28); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
def shaker(): t = tt(0.09); return hp(rng.normal(size=len(t)), 6000) * np.exp(-t * 45) * np.minimum(1, t / 0.012)
def bass(n, d): t = tt(d); return lp(np.sin(2 * np.pi * midi(n) * t), 300) * np.minimum(1, t / 0.01) * np.exp(-t * 1.6)

mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))
B = 60 / 88  # 88 BPM, chaud et posé
# progression en ré majeur : D – Bm – G – A
prog = [(38, [62, 66, 69, 74]), (35, [62, 66, 71, 74]), (31, [62, 67, 71, 74]), (33, [61, 64, 69, 73])]
bar = 4 * B; t0 = 0.0; m = 0
mel = [74, 78, 76, 74, 81, 78, 76, 73]
while t0 < 16.8:
    root, notes = prog[m % 4]
    add(mus, pad(notes, bar + 0.6), t0, 0.13)
    for k in range(4):
        tb = t0 + k * B
        if tb >= 16.8: break
        add(mus, piano(mel[(m * 4 + k) % 8] - (12 if t0 < 2.7 else 0), 2.4), tb + (B / 2 if k % 2 else 0), 0.07 if t0 < 2.7 else 0.08, 0.3 * (-1) ** k)
        if t0 >= 10.2:  # la pulsation entre avec la poêle
            add(mus, kick(), tb, 0.3); add(mus, shaker(), tb + B / 2, 0.04, 0.3)
    if t0 >= 4.6: add(mus, bass(root, bar), t0, 0.26)
    t0 += bar; m += 1
# montée vers le packshot, puis accord final
t = tt(1.4); add(mus, bp(rng.normal(size=len(t)), 400, 8000) * (t / 1.4) ** 3, 15.5, 0.12)
add(mus, pad([50, 57, 62, 66, 69, 74], 6.4, 2300), 16.85, 0.18)
for j, n in enumerate([74, 78, 81, 86]): add(mus, piano(n, 3.4), 18.7 + j * 0.2, 0.07, 0.3 * (j - 1.5))

# ---- bruitages réels (synthétisés)
def whoosh(d=0.8):
    t = tt(d); x = t / d; n = rng.normal(size=len(t)); return (lp(n, 700) * (1 - x) + bp(n, 1800, 8000) * x * 0.7) * np.sin(np.pi * x) ** 2
def impact(d=1.8):
    t = tt(d); f = 40 + 60 * np.exp(-t * 16); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.8) + lp(rng.normal(size=len(t)), 500) * np.exp(-t * 12) * 0.35
def clink():
    t = tt(0.8); return sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * d) for fq, d in ((2600, 7), (4100, 10), (6300, 16))) / 3
def plop(d=0.5):
    t = tt(d); f = 180 + 260 * np.exp(-t * 18); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10) + bp(rng.normal(size=len(t)), 300, 1500) * np.exp(-t * 14) * 0.4
def sizzle(d):
    t = tt(d); n = hp(rng.normal(size=len(t)), 3500); cr = np.zeros(len(t))
    for _ in range(int(d * 60)):
        i = int(rng.uniform(0, d - 0.01) * SR); k = int(0.003 * SR); cr[i:i + k] += rng.uniform(0.3, 1)
    return (n * 0.3 + hp(rng.normal(size=len(t)), 2000) * cr) * env(t, 0.3, 0.6, d)
def room(d):
    t = tt(d); return lp(rng.normal(size=len(t)), 900) * 0.4 * env(t, 0.4, 0.6, d)
def shimmer(d=1.8):
    out = np.zeros(int(d * SR))
    for j, n in enumerate((86, 90, 93, 98, 102)):
        t = tt(1.2); x = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 4); i = int(j * 0.07 * SR); out[i:i + len(x)] += x[: len(out) - i]
    return out
add(sfx, room(22.6), 0.0, 0.05)                                   # ambiance de cuisine
add(sfx, clink(), 4.85, 0.06, 0.3)                                # la cuillère touche le pot
add(sfx, plop(), 7.3, 0.18)                                       # la moutarde tombe dans le saladier (ralenti)
add(sfx, whoosh(0.6), 8.2, 0.1)
add(sfx, sizzle(2.9), 10.2, 0.16, 0.1)                            # la poêle
add(sfx, clink(), 13.6, 0.05, -0.4); add(sfx, clink(), 14.4, 0.04, 0.4)   # couverts, assiettes
add(sfx, whoosh(0.8), 16.35, 0.2)
add(sfx, impact(), 17.15, 0.32); add(sfx, shimmer(), 17.2, 0.07)   # le pot apparaît
add(sfx, impact(2.2), 18.6, 0.36); add(sfx, shimmer(2.0), 18.65, 0.1)   # LE SECRET DES CHEFS
ir_t = tt(2.0); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 3)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
mix = mus + sfx
mix = mix + np.stack([fftconvolve(mix[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.18

# ---- voix off optionnelle (déposée par l'utilisateur), avec baisse automatique de la musique
vo_path = "public/media/voix-off.wav"
if os.path.exists(vo_path):
    sr, vo = wavfile.read(vo_path); vo = vo.astype(float) / (32768 if vo.dtype == np.int16 else 1)
    if vo.ndim == 2: vo = vo.mean(1)
    if sr != SR: vo = np.interp(np.arange(int(len(vo) * SR / sr)) * sr / SR, np.arange(len(vo)), vo)
    vo = vo[: N - int(2.9 * SR)]
    vbuf = np.zeros(N); vbuf[int(2.9 * SR): int(2.9 * SR) + len(vo)] = vo
    duck = 1 - 0.45 * np.clip(lp(np.abs(vbuf), 4) * 12, 0, 1)
    mix = mix * duck[:, None] + np.stack([vbuf, vbuf], 1) * 0.9
    print("voix off mixée")
t = tt(DUR); mix *= (np.clip(t / 0.4, 0, 1) * np.clip((DUR - t) / 1.2, 0, 1))[:, None]
mix = np.tanh(mix * 1.15) / np.tanh(1.15); mix *= 0.9 / np.abs(mix).max()
wavfile.write("public/music-long_raw.wav", SR, (mix * 32767).astype(np.int16))
print("public/music-long_raw.wav écrit")
