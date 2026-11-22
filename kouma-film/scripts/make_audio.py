"""Bande-son « Kouma — Le goût qui rassemble » (40 s), calée sur src/KoumaFilm.tsx.

Musique africaine instrumentale moderne et douce (synthèse) : kora (cordes pincées, Karplus-Strong),
balafon, nappe chaude, djembé et shaker légers, basse ronde. Tonalité de ré majeur pentatonique.
Ambiance : oiseaux du matin, cour (murmure lointain), eau versée, verres qui se touchent,
whoosh doux vers le packshot, accents sur le logo et le slogan.
Laisse de la place à une voix off : si public/media/voix-off.wav existe, elle est mixée (à 1,2 s)
et la musique baisse automatiquement sous la voix.
"""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR, DUR = 48000, 40.0
N = int(SR * DUR)
rng = np.random.default_rng(57)
B = 60 / 92
PACK = 25.0
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

def kora(n, d=1.8):
    f = midi(n); L = max(2, int(SR / f)); out = np.zeros(int(d * SR))
    buf = rng.uniform(-1, 1, L) * np.hanning(L) * 1.3
    for i in range(len(out)):
        v = buf[i % L]; out[i] = v; buf[i % L] = 0.5 * (v + buf[(i + 1) % L]) * 0.9965
    return bp(out, 120, 6000) * np.minimum(1, tt(d) / 0.002)
def balafon(n, d=0.7):
    t = tt(d); f = midi(n)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 3.9 * f * t) * np.exp(-t * 25) + 0.15 * bp(rng.normal(size=len(t)), f, min(f * 3, 9000)) * np.exp(-t * 40)) * np.exp(-t * 6.5) * np.minimum(1, t / 0.002)
def pad(notes, d, cut=1400):
    t = tt(d); s = sum(sum(2 * ((midi(n) * 2 ** (k / 12) * t + rng.random()) % 1) - 1 for k in (-0.1, 0, 0.1)) / 3 for n in notes) / len(notes)
    return lp(s, cut) * env(t, 1.2, 1.5, d)
def djembe_bass(): t = tt(0.45); f = 75 + 55 * np.exp(-t * 18); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
def djembe_tone(): t = tt(0.18); return (np.sin(2 * np.pi * 330 * t) * 0.6 + bp(rng.normal(size=len(t)), 300, 2500) * 0.5) * np.exp(-t * 22)
def shaker(): t = tt(0.1); return hp(rng.normal(size=len(t)), 6000) * np.exp(-t * 40) * np.minimum(1, t / 0.015)
def bass(n, d): t = tt(d); return lp(np.sin(2 * np.pi * midi(n) * t), 260) * np.minimum(1, t / 0.01) * np.exp(-t * 1.4)

mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))
penta = [62, 64, 66, 69, 71, 74, 76, 78, 81]
phrase = [4, 3, 2, 3, 5, 4, 3, 1, 2, 3, 4, 6, 5, 4, 2, 3]
chords = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 59, 62], [45, 52, 57, 61]]
# nappe tout du long (douce au début)
for k in range(12):
    t0 = k * 4 * B
    if t0 >= DUR - 1: break
    add(mus, pad(chords[k % 4], 4 * B + 1.5), t0, 0.09 if t0 < 6 else 0.11)
# kora : rare à l'aube, plus présente ensuite
for k in range(80):
    t0 = 0.8 + k * B / 2
    if t0 > PACK + 13: break
    if t0 < 6.6 and k % 2: continue
    if 6.6 <= t0 < 14.0 and k % 4 == 3: continue
    add(mus, kora(penta[phrase[k % 16]] + (0 if t0 < 14 else 0)), t0, 0.11, 0.35 * np.sin(k * 1.3))
# balafon + percussions à partir du partage (14 s) jusqu'au packshot
t0 = 14.0; m = 0
while t0 < PACK + 9:
    root = [38, 35, 31, 33][m % 4]
    add(mus, bass(root, 4 * B * 0.95), t0, 0.26)
    for st in range(8):
        tb = t0 + st * B / 2
        if st in (0, 3, 4): add(mus, djembe_bass(), tb, 0.32)
        if st in (2, 6): add(mus, djembe_tone(), tb, 0.13, 0.2)
        add(mus, shaker(), tb, 0.03 if st % 2 else 0.045, 0.3)
        if st % 2 == 0 and t0 >= 17.9: add(mus, balafon(penta[(phrase[(m * 4 + st) % 16]) % 9] + 12), tb + B / 4, 0.07, -0.3)
    t0 += 4 * B; m += 1
# accord final
add(mus, pad([50, 57, 62, 66, 69, 74], 6.5, 2000), PACK + 8.5, 0.15)
for j, n in enumerate([74, 78, 81, 86]): add(mus, kora(n, 3.0), PACK + 6.6 + j * 0.2, 0.1, 0.3 * (j - 1.5))

# ---------------------------------------------------------------- ambiance et bruitages
def birds(d):
    out = np.zeros(int(d * SR))
    for _ in range(int(d * 3)):
        st = rng.uniform(0, d - 0.6); n = int(rng.uniform(0.06, 0.18) * SR); t = np.arange(n) / SR
        f0 = rng.uniform(2800, 5200); f = f0 * (1 + 0.25 * np.sin(2 * np.pi * rng.uniform(15, 35) * t))
        chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / t[-1]) ** 2
        for r in range(rng.integers(1, 4)):
            i = int((st + r * 0.12) * SR); out[i:i + n] += chirp[: len(out) - i] * rng.uniform(0.3, 1)
    return out
def murmur(d):
    t = tt(d); return bp(rng.normal(size=len(t)), 200, 1400) * (0.5 + 0.5 * np.abs(lp(rng.normal(size=len(t)), 3)) * 8) * env(t, 1.0, 1.0, d)
def pour(d):
    t = tt(d); body = bp(rng.normal(size=len(t)), 400, 3000)
    gurgle = np.clip(1 + lp(rng.normal(size=len(t)), 14) * 35, 0.3, 2.0)
    s = body * gurgle * env(t, 0.2, 0.6, d)
    for _ in range(int(d * 12)):
        st = rng.uniform(0.1, d - 0.2); n = int(0.04 * SR); bt = np.arange(n) / SR
        fq = rng.uniform(600, 1300) * (1 + 3 * bt); i = int(st * SR)
        s[i:i + n] += np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-bt * 70) * 0.5
    return s
def fizz(d):
    t = tt(d); out = np.zeros(len(t))
    for _ in range(int(d * 220)):
        i = int(rng.uniform(0, d - 0.01) * SR); k = int(0.004 * SR); out[i:i + k] += hp(rng.normal(size=k), 5000) * rng.uniform(0.2, 1)
    return out * env(t, 0.3, 0.5, d)
def clink():
    t = tt(1.0); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((3100, 7), (4700, 11), (6900, 16))) / 3
def whoosh(d=1.0):
    t = tt(d); x = t / d; n = rng.normal(size=len(t)); return (lp(n, 600) * (1 - x) + bp(n, 1500, 7000) * x * 0.6) * np.sin(np.pi * x) ** 2
def soft_impact(d=1.6):
    t = tt(d); f = 45 + 50 * np.exp(-t * 14); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) + lp(rng.normal(size=len(t)), 400) * np.exp(-t * 12) * 0.3
def shimmer(d=1.6):
    out = np.zeros(int(d * SR))
    for j, n in enumerate((86, 90, 93, 98)):
        t = tt(1.1); x = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 4.5); i = int(j * 0.07 * SR); out[i:i + len(x)] += x[: len(out) - i]
    return out

add(sfx, birds(14.0), 0.0, 0.05, -0.3); add(sfx, birds(14.0), 0.4, 0.04, 0.4)
add(sfx, lp(rng.normal(size=int(25 * SR)), 500) * 0.25, 0.0, 0.04)           # air du matin
add(sfx, pour(3.4), 6.8, 0.14, 0.1)                                          # le thé est versé
add(sfx, fizz(3.0), 10.5, 0.07)                                              # la mousse
add(sfx, murmur(11.0), 14.0, 0.07)                                           # la cour, les amis
add(sfx, clink(), 15.2, 0.045, 0.3); add(sfx, clink(), 20.9, 0.055, -0.2); add(sfx, clink(), 23.4, 0.035, 0.4)
add(sfx, whoosh(1.1), PACK - 0.4, 0.14)
add(sfx, soft_impact(), PACK + 0.6, 0.18)                                    # les boîtes se posent
add(sfx, soft_impact(), PACK + 3.2, 0.2); add(sfx, shimmer(), PACK + 3.25, 0.06)   # logo
add(sfx, shimmer(1.8), PACK + 6.6, 0.07)                                     # slogan

ir_t = tt(2.0); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 3.2)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
mix = mus + sfx
mix = mix + np.stack([fftconvolve(mix[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.18

vo_path = "public/media/voix-off.wav"
if os.path.exists(vo_path):
    sr, vo = wavfile.read(vo_path); vo = vo.astype(float) / (32768 if vo.dtype == np.int16 else 1)
    if vo.ndim == 2: vo = vo.mean(1)
    if sr != SR: vo = np.interp(np.arange(int(len(vo) * SR / sr)) * sr / SR, np.arange(len(vo)), vo)
    st = int(1.2 * SR); vo = vo[: N - st]
    vb = np.zeros(N); vb[st:st + len(vo)] = vo
    duck = 1 - 0.5 * np.clip(lp(np.abs(vb), 4) * 12, 0, 1)
    mix = mix * duck[:, None] + np.stack([vb, vb], 1) * 0.9
    print("voix off mixée")

t = tt(DUR); mix *= (np.clip(t / 1.0, 0, 1) * np.clip((DUR - t) / 1.6, 0, 1))[:, None]
mix = np.tanh(mix * 1.15) / np.tanh(1.15); mix *= 0.9 / np.abs(mix).max()
wavfile.write("public/music_raw.wav", SR, (mix * 32767).astype(np.int16))
print("public/music_raw.wav écrit")
