"""Bande-son de la pub Kouma Thé Vert de Chine (25 s, 100 BPM, 1 temps = 0,6 s).

Ambiance : vent doux et nappe chaude (intro), cordes pincées pentatoniques
façon guzheng (synthèse Karplus-Strong), percussions légères à partir du
reveal produit, accent final sur « DISPONIBLE ».
Bruitages : bruissements de feuilles, whoosh aux transitions, impact du reveal,
impact du slogan, accent de DISPONIBLE. Tout est synthétisé (libre de droits).
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR, DUR = 48000, 25.0
B = 0.6
N = int(SR * DUR)
rng = np.random.default_rng(21)
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

def guzheng(n, d=2.2):
    """Corde pincée (Karplus-Strong) avec léger vibrato de fin."""
    f = midi(n); L = int(SR / f); out = np.zeros(int(d * SR))
    buf = rng.uniform(-1, 1, L) * np.hanning(L) * 1.4
    for i in range(len(out)):
        v = buf[i % L]; out[i] = v
        buf[i % L] = 0.5 * (v + buf[(i + 1) % L]) * 0.9965
    t = tt(d)
    return lp(out, 5000) * (1 + 0.04 * np.sin(2 * np.pi * 5 * t) * np.clip(t - 0.4, 0, 1))
def pad(notes, d, cut=1400):
    t = tt(d); s = sum(np.sin(2 * np.pi * midi(n) * t) + 0.35 * np.sin(2 * np.pi * 2 * midi(n) * t + 1) + 0.15 * np.sin(2 * np.pi * 3 * midi(n) * t) for n in notes) / len(notes)
    return lp(s, cut) * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0)
def kick():
    t = tt(0.4); f = 48 + 80 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
def rim():
    t = tt(0.06); return bp(rng.normal(size=len(t)), 1500, 5000) * np.exp(-t * 90)
def shaker():
    t = tt(0.1); return hp(rng.normal(size=len(t)), 6000) * np.exp(-t * 40) * np.minimum(1, t / 0.015)
def bass(n, d):
    t = tt(d); return lp(np.sin(2 * np.pi * midi(n) * t), 300) * np.minimum(1, t / 0.01) * np.exp(-t * 1.8)

mus = np.zeros((N, 2))
# pentatonique de Ré (D E F# A B) — couleur « thé de Chine »
penta = [62, 64, 66, 69, 71, 74, 76, 78, 81]
chords = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 57, 62], [45, 52, 57, 61]]
for k, c in enumerate(chords * 3):
    t0 = k * 2.4
    if t0 >= DUR: break
    add(mus, pad(c, min(2.4 + 1.2, DUR - t0)), t0, 0.16 if t0 < 8 else 0.12)
# mélodie pincée : rare dans l'intro, plus présente ensuite
phr = [0, 2, 3, 5, 4, 3, 2, 1, 2, 4, 5, 7, 6, 5, 3, 4]
for k in range(40):
    t0 = 0.6 + k * B
    if t0 > 23.5: break
    if t0 < 8 and k % 2: continue
    add(mus, guzheng(penta[phr[k % len(phr)]]), t0, 0.16, 0.4 * np.sin(k))
# percussions à partir du reveal (8 s)
t0 = 8.0
while t0 < 22.0:
    for st in range(4):
        tb = t0 + st * B
        add(mus, kick(), tb, 0.38 if st in (0, 2) else 0.0)
        if st in (1, 3): add(mus, rim(), tb, 0.16)
        add(mus, shaker(), tb + B / 2, 0.05, 0.3)
    root = [38, 35, 31, 33][int((t0 - 8) / 2.4) % 4]
    add(mus, bass(root, 2.2), t0, 0.32)
    t0 += 4 * B
# final : accord ouvert
add(mus, pad([50, 57, 62, 66, 69, 74], 3.6, 2000), 21.4, 0.2)
for k, n in enumerate([74, 78, 81, 86]):
    add(mus, guzheng(n, 3.0), 21.6 + k * 0.12, 0.14, 0.2 * (k - 1.5))

# ------------------------------------------------------------------ bruitages
sfx = np.zeros((N, 2))
def wind(d):
    t = tt(d); n = lp(rng.normal(size=len(t)), 600) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * t))
    return n * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0)
def rustle(d=0.8):
    t = tt(d); n = bp(rng.normal(size=len(t)), 2500, 9000)
    env = np.abs(lp(rng.normal(size=len(t)), 25)) * 6
    return n * env * np.sin(np.pi * t / d) ** 2
def whoosh(d=0.8, up=True):
    t = tt(d); x = t / d; n = rng.normal(size=len(t)); m = x if up else 1 - x
    return (lp(n, 700) * (1 - m) + bp(n, 1500, 7000) * m * 0.7) * np.sin(np.pi * x) ** 2
def impact(d=1.6):
    t = tt(d); f = 40 + 60 * np.exp(-t * 15)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) + lp(rng.normal(size=len(t)), 600) * np.exp(-t * 9) * 0.35
def shimmer():
    out = np.zeros(int(1.6 * SR))
    for k, n in enumerate((86, 90, 93, 98, 102)):
        t = tt(1.0); s = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 5)
        i = int(k * 0.07 * SR); out[i:i + len(s)] += s
    return out

add(sfx, wind(8.5), 0.0, 0.10)
for t0 in (1.5, 4.4, 5.6, 6.9): add(sfx, rustle(), t0, 0.10, rng.uniform(-0.5, 0.5))
add(sfx, whoosh(1.0), 3.5, 0.24); add(sfx, rustle(1.0), 3.6, 0.14)          # transition feuilles
add(sfx, whoosh(0.9), 7.55, 0.26)                                             # vers le produit
add(sfx, impact(), 8.15, 0.30); add(sfx, shimmer(), 8.3, 0.07)                # reveal produit
add(sfx, whoosh(0.8, False), 13.6, 0.22)                                      # vers l'expérience
add(sfx, impact(1.2), 14.9, 0.20)                                             # slogan
add(sfx, whoosh(0.9), 18.6, 0.24)                                             # vers le final
for t0 in (19.4, 19.9, 20.4): add(sfx, shimmer()[: int(0.6 * SR)], t0, 0.04)  # textes du final
add(sfx, impact(2.0), 21.6, 0.38); add(sfx, shimmer(), 21.65, 0.10)           # DISPONIBLE

ir_t = tt(2.0); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 3)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
mix = mus + sfx
mix = mix + np.stack([fftconvolve(mix[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.2
t = tt(DUR); mix *= (np.clip(t / 0.8, 0, 1) * np.clip((DUR - t) / 1.5, 0, 1))[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2); mix *= 0.9 / np.abs(mix).max()
wavfile.write("public/music_raw.wav", SR, (mix * 32767).astype(np.int16))
print("public/music_raw.wav écrit")
