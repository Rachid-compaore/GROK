"""Bande-son OLARA « LE GOÛT QUI RÉVEILLE » — 30 s.

Architecture sonore (tous les instants dans EVENTS, alignés sur l'image) :
  0–4 s   silence habité : souffle d'air, nappe grave à peine audible, matière qui s'étire
  4,45 s  impact de la goutte (grave + éclaboussure), ondes
  5–7,6 s vague de moutarde (liquide), passage de caméra à travers la matière
  7,6 s   le groove s'éveille (électro organique, 112 BPM)
  9–16 s  univers gastronomique : filet de sauce, grésillement du grill, couteau, assiette
  16,6–17,4 s allumage des trois projecteurs (clac + bourdonnement)
  24,8 s  signature : accord + impact doux ; fin en suspens
Tout est synthétisé (libre de droits). Pour une autre musique : remplacer public/music.wav.
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR, DUR = 48000, 30.0
N = int(SR * DUR)
rng = np.random.default_rng(17)
BPM = 112; B = 60 / BPM
EVENTS = {"impact": 4.45, "wave": 5.0, "through": 6.9, "groove": 7.6, "drizzle": 9.3, "sizzle": 11.0, "plate": 12.2,
          "pan": 13.2, "dive": 15.6, "lights": [16.6, 17.05, 17.5], "signature": 24.8, "underline": 25.7}

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
def env(t, a, r, d): return np.minimum(1, t / a) * np.minimum(1, (d - t) / r)

mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))
# ---------------------------------------------------------------- silence habité (0–7,6 s)
t = tt(8.0)
add(sfx, lp(rng.normal(size=len(t)), 300) * env(t, 1.5, 1.0, 8.0) * 0.5, 0.0, 0.10)                  # souffle d'air
add(mus, lp(sum(saw(midi(n), t, 2, 0.2) for n in (38, 45)) / 2, 260) * env(t, 2.0, 1.0, 8.0), 0.0, 0.16)  # nappe grave
def stretch(d=1.8):  # matière qui s'étire (grave modulé, très doux)
    t = tt(d); f = 70 + 30 * np.sin(2 * np.pi * 0.6 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.6, 0.6, d) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t))
add(sfx, stretch(), 1.2, 0.10); add(sfx, stretch(1.4), 3.0, 0.12)
def thud(d=1.6):
    t = tt(d); f = 38 + 70 * np.exp(-t * 16)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) + lp(rng.normal(size=len(t)), 500) * np.exp(-t * 14) * 0.5
def splash(d=1.0):
    t = tt(d); s = bp(rng.normal(size=len(t)), 300, 2500) * np.exp(-t * 5) * np.minimum(1, t / 0.005)
    for _ in range(16):
        st = rng.uniform(0.02, d * 0.6); n = int(0.05 * SR); bt = np.arange(n) / SR
        fq = rng.uniform(350, 900) * (1 + 2.5 * bt); i = int(st * SR)
        s[i:i + n] += np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-bt * 60) * 0.5
    return s
def liquid(d=2.0):
    t = tt(d); body = bp(rng.normal(size=len(t)), 150, 1200)
    mod = np.clip(1 + lp(rng.normal(size=len(t)), 6) * 25, 0.2, 2.2)
    return body * mod * np.sin(np.pi * t / d) ** 1.2
def whoosh(d=0.8, up=True):
    t = tt(d); x = t / d; n = rng.normal(size=len(t)); m = x if up else 1 - x
    return (lp(n, 600) * (1 - m) + bp(n, 1500, 7000) * m * 0.7) * np.sin(np.pi * x) ** 2
add(sfx, whoosh(0.5), EVENTS["impact"] - 0.45, 0.08)
add(sfx, thud(), EVENTS["impact"], 0.5); add(sfx, splash(), EVENTS["impact"], 0.28)
add(sfx, liquid(2.2), EVENTS["wave"], 0.28)
add(sfx, whoosh(1.0), EVENTS["through"], 0.3); add(sfx, liquid(0.9), EVENTS["through"] + 0.1, 0.18)
# ---------------------------------------------------------------- groove (7,6 → 16 s, puis 17,5 → 24,8 s)
def kick():
    t = tt(0.4); f = 44 + 90 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
def rim():
    t = tt(0.07); return bp(rng.normal(size=len(t)), 1500, 5000) * np.exp(-t * 80)
def shaker():
    t = tt(0.09); return hp(rng.normal(size=len(t)), 6000) * np.exp(-t * 45) * np.minimum(1, t / 0.012)
def bass(n, d):
    t = tt(d); return lp(np.sin(2 * np.pi * midi(n) * t) + 0.35 * saw(midi(n), t, 1), 340) * np.minimum(1, t / 0.006) * np.exp(-t * 2.2)
def keys(n, d=1.2):
    t = tt(d); f = midi(n)
    return np.sin(2 * np.pi * f * t + 0.7 * np.exp(-t * 5) * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 2.6) * np.minimum(1, t / 0.003)
prog = [(38, [57, 60, 64, 65]), (41, [57, 60, 64, 67]), (36, [55, 60, 64, 67]), (43, [55, 59, 62, 65])]  # Dm9 F C G
def groove(t0, t1, g=1.0):
    m = 0
    while t0 < t1 - 0.01:
        root, notes = prog[m % 4]
        bar = 4 * B
        tp = tt(bar + 0.3); add(mus, lp(sum(saw(midi(n), tp) for n in notes) / 4, 1700) * env(tp, 0.3, 0.3, bar + 0.3), t0, 0.10 * g)
        for st in range(4):
            tb = t0 + st * B
            if tb >= t1: break
            add(mus, kick(), tb, 0.45 * g)
            if st % 2: add(mus, rim(), tb, 0.18 * g)
            add(mus, shaker(), tb + B / 2, 0.05 * g, 0.3)
        for st, ln in ((0, 0.75), (1.5, 0.5), (2.5, 0.75), (3.5, 0.4)):
            if t0 + st * B < t1: add(mus, bass(root, ln * B), t0 + st * B, 0.34 * g)
        for k, st in enumerate((0.5, 1.75, 2.5, 3.25)):
            if t0 + st * B < t1: add(mus, keys(notes[k % 4] + 12), t0 + st * B, 0.075 * g, 0.3 * (-1) ** k)
        t0 += bar; m += 1
groove(EVENTS["groove"], 16.2)
groove(17.6, 24.7, 0.85)
# ---------------------------------------------------------------- univers gastronomique
def drizzle(d=1.4):
    t = tt(d); return bp(rng.normal(size=len(t)), 600, 3000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 3 * t))) * env(t, 0.1, 0.3, d)
def sizzle(d=2.2):
    t = tt(d); n = hp(rng.normal(size=len(t)), 3500)
    crack = np.zeros(len(t))
    for _ in range(90):
        i = int(rng.uniform(0, d - 0.01) * SR); k = int(0.003 * SR); crack[i:i + k] += rng.uniform(0.3, 1)
    return (n * 0.35 + hp(rng.normal(size=len(t)), 2000) * crack) * env(t, 0.4, 0.8, d)
def clink():
    t = tt(1.0); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((2300, 6), (3550, 9), (5100, 14))) / 3
def knife():
    t = tt(0.35); return bp(rng.normal(size=len(t)), 2500, 8000) * np.sin(np.pi * t / 0.35) ** 2
add(sfx, whoosh(0.7), 8.9, 0.18); add(sfx, drizzle(), EVENTS["drizzle"], 0.16)
add(sfx, drizzle(1.6), 11.3, 0.14, 0.2)
add(sfx, sizzle(), EVENTS["sizzle"], 0.12)
add(sfx, clink(), EVENTS["plate"], 0.07)
add(sfx, whoosh(0.9, False), EVENTS["pan"], 0.16); add(sfx, knife(), 13.9, 0.08, -0.3)
add(sfx, whoosh(0.8), EVENTS["dive"], 0.24); add(sfx, liquid(0.8), EVENTS["dive"] + 0.2, 0.18)
# ---------------------------------------------------------------- reveal studio
def light_on():
    t = tt(1.4); c = bp(rng.normal(size=len(t)), 800, 4000) * np.exp(-t * 60)
    hum = np.sin(2 * np.pi * 100 * t) * 0.15 * env(t, 0.05, 0.8, 1.4)
    return c + hum + thud(1.4) * 0.35
for k, t0 in enumerate(EVENTS["lights"]): add(sfx, light_on(), t0, 0.28, (k - 1) * 0.5)
def shimmer(d=1.6):
    out = np.zeros(int(d * SR))
    for k, n in enumerate((86, 90, 93, 98)):
        t = tt(1.0); s = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 5); i = int(k * 0.07 * SR); out[i:i + len(s)] += s
    return out
add(sfx, shimmer(), 19.5, 0.05); add(sfx, shimmer(), 21.8, 0.05)
# ---------------------------------------------------------------- signature
tp = tt(5.2); add(mus, lp(sum(saw(midi(n), tp) for n in (50, 57, 62, 65, 69, 74)) / 6, 2200) * env(tp, 0.4, 2.0, 5.2), EVENTS["signature"], 0.2)
add(sfx, thud(2.0), EVENTS["signature"], 0.32); add(sfx, shimmer(), EVENTS["signature"] + 0.05, 0.1)
for k, n in enumerate((74, 77, 81, 86)): add(mus, keys(n, 2.5), EVENTS["signature"] + 0.4 + k * 0.18, 0.07)
add(sfx, drizzle(0.9), EVENTS["underline"], 0.12)

ir_t = tt(2.0); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 3.2)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
mix = mus + sfx
mix = mix + np.stack([fftconvolve(mix[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.2
t = tt(DUR); mix *= (np.clip(t / 0.5, 0, 1) * np.clip((DUR - t) / 2.0, 0, 1))[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2); mix *= 0.9 / np.abs(mix).max()
wavfile.write("public/music_raw.wav", SR, (mix * 32767).astype(np.int16))
print("public/music_raw.wav écrit")
