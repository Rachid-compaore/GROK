"""Bande-son Warda Couscous — 25 s, 96 BPM (1 temps = 0,625 s).

Couleur maghrébine : luth pincé (synthèse Karplus-Strong) en mode hijaz, darbouka (doum / tek / ka),
nappe chaude, basse ronde. Bruitages : semoule qui coule (sable), whooshes, impacts, scintillements.
Tout est synthétisé (libre de droits). Instants calés sur src/Warda.tsx (EV).
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR, DUR = 48000, 25.0
N = int(SR * DUR)
rng = np.random.default_rng(41)
B = 60 / 96
EV = {"pour": 0.3, "logo": 2.2, "bag": 4.6, "title": 6.0, "cards": [9.6, 11.0, 12.4, 13.8], "dish": 16.0, "dishTitle": 17.0,
      "final": 21.0, "slogan": 22.0, "badge": 22.9}

def midi(n): return 440 * 2 ** ((n - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
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

def oud(n, d=1.4):
    """Corde pincée, attaque claire, léger glissé (Karplus-Strong)."""
    f = midi(n); L = max(2, int(SR / f)); out = np.zeros(int(d * SR))
    buf = rng.uniform(-1, 1, L) * 1.2
    for i in range(len(out)):
        v = buf[i % L]; out[i] = v; buf[i % L] = 0.5 * (v + buf[(i + 1) % L]) * 0.994
    return bp(out, 90, 4500) * np.minimum(1, tt(d) / 0.002)
def doum():
    t = tt(0.5); f = 70 + 60 * np.exp(-t * 20); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6)
def tek():
    t = tt(0.12); return (bp(rng.normal(size=len(t)), 2000, 7000) * 0.6 + np.sin(2 * np.pi * 900 * t) * 0.5) * np.exp(-t * 45)
def ka():
    t = tt(0.08); return bp(rng.normal(size=len(t)), 1500, 5000) * np.exp(-t * 60) * 0.6
def pad(notes, d, cut=1500):
    t = tt(d); s = sum(sum(2 * ((midi(n) * 2 ** (dt / 12) * t + rng.random()) % 1) - 1 for dt in (-0.1, 0, 0.1)) / 3 for n in notes) / len(notes)
    return lp(s, cut) * env(t, 0.8, 1.0, d)
def bass(n, d): t = tt(d); return lp(np.sin(2 * np.pi * midi(n) * t), 280) * np.minimum(1, t / 0.01) * np.exp(-t * 1.5)

mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))
# mode hijaz sur ré : D Eb F# G A Bb C D
hij = [62, 63, 66, 67, 69, 70, 72, 74, 75, 78]
phrase = [0, 1, 2, 1, 3, 2, 4, 3, 5, 4, 3, 2, 3, 1, 2, 0]
# intro : nappe + luth épars
add(mus, pad([50, 57, 62, 66], 4.8, 900), 0.0, 0.18)
for k, st in enumerate([0.4, 1.3, 1.9, 2.6, 3.4]):
    add(mus, oud(hij[phrase[k]] + 12, 1.6), st, 0.12, 0.3 * (-1) ** k)
# groove dès le sachet (4,6 s) jusqu'au final
t0 = 4.6; m = 0
rhythm = [("doum", 0), ("tek", 1), ("ka", 1.5), ("doum", 2), ("doum", 2.5), ("tek", 3), ("ka", 3.5)]
while t0 < 21.0:
    bar = 4 * B
    roots = [38, 38, 43, 45]
    add(mus, pad([50, 57, 62, 66] if m % 4 != 2 else [55, 58, 62, 67], bar + 0.4, 1500), t0, 0.1)
    add(mus, bass(roots[m % 4], bar * 0.9), t0, 0.32)
    for name, st in rhythm:
        tb = t0 + st * B
        if tb >= 21.0: break
        add(mus, {"doum": doum, "tek": tek, "ka": ka}[name](), tb, {"doum": 0.5, "tek": 0.22, "ka": 0.15}[name], 0.15 if name != "doum" else 0)
    for k in range(8):
        tb = t0 + k * B / 2
        if tb >= 21.0 or (k % 3 == 2): continue
        add(mus, oud(hij[phrase[(m * 8 + k) % 16]] + 12, 1.0), tb, 0.1, 0.35 * np.sin(k))
    t0 += bar; m += 1
# final : accord ouvert, phrase de luth, sans percussions
add(mus, pad([38, 50, 57, 62, 66, 69], 4.0, 2200), 21.0, 0.2)
for k, n in enumerate([62, 66, 69, 74, 78]): add(mus, oud(n + 12, 2.4), 21.2 + k * 0.18, 0.12, 0.3 * (k - 2))

# ---- bruitages
def sand(d):  # semoule qui coule
    t = tt(d); g = hp(rng.normal(size=len(t)), 2500) * (0.6 + 0.4 * np.abs(lp(rng.normal(size=len(t)), 30)) * 4)
    return g * env(t, 0.3, 0.6, d)
def whoosh(d=0.8):
    t = tt(d); x = t / d; n = rng.normal(size=len(t)); return (lp(n, 700) * (1 - x) + bp(n, 1800, 8000) * x * 0.7) * np.sin(np.pi * x) ** 2
def impact(d=1.6):
    t = tt(d); f = 42 + 60 * np.exp(-t * 16); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) + lp(rng.normal(size=len(t)), 500) * np.exp(-t * 12) * 0.35
def shimmer(d=1.6):
    out = np.zeros(int(d * SR))
    for j, n in enumerate((86, 89, 93, 98, 101)):
        t = tt(1.0); x = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 5); i = int(j * 0.06 * SR); out[i:i + len(x)] += x[: len(out) - i]
    return out
def tick(): t = tt(0.05); return bp(rng.normal(size=len(t)), 2500, 8000) * np.exp(-t * 120)

add(sfx, sand(3.6), EV["pour"], 0.16)
add(sfx, impact(), EV["logo"], 0.28); add(sfx, shimmer(), EV["logo"] + 0.05, 0.07)
add(sfx, whoosh(), EV["bag"] - 0.4, 0.22); add(sfx, impact(1.2), EV["bag"] + 0.2, 0.26); add(sfx, sand(1.6), EV["bag"] + 0.1, 0.1)
for t0 in EV["cards"]: add(sfx, whoosh(0.5), t0 - 0.1, 0.1, 0.3); add(sfx, tick(), t0 + 0.25, 0.1)
add(sfx, whoosh(0.9), EV["dish"] - 0.45, 0.22)
add(sfx, whoosh(0.9), EV["final"] - 0.45, 0.2)
add(sfx, impact(2.0), EV["slogan"], 0.32); add(sfx, shimmer(1.8), EV["slogan"] + 0.05, 0.1)
add(sfx, impact(1.0), EV["badge"], 0.16)

ir_t = tt(1.8); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 3.4)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
mix = mus + sfx
mix = mix + np.stack([fftconvolve(mix[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.18
t = tt(DUR); mix *= (np.clip(t / 0.4, 0, 1) * np.clip((DUR - t) / 1.5, 0, 1))[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2); mix *= 0.9 / np.abs(mix).max()
wavfile.write("public/music_raw.wav", SR, (mix * 32767).astype(np.int16))
print("public/music_raw.wav écrit")
