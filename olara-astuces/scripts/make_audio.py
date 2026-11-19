"""Bande-son « Astuces CUISINE » OLARA : 25 s, 120 BPM (1 temps = 0,5 s).

Musique joyeuse façon cuisine (marimba, basse ronde, percussions légères),
et bruitages calés sur l'image : whoosh, pop du logo, croustillant, coche,
salière, scintillement. Tout est synthétisé : libre de droits.
Usage : python3 scripts/make_audio.py  ->  public/music.wav
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR, DUR, BPM = 48000, 25.0, 120
B = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(3)

def midi(n): return 440 * 2 ** ((n - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def add(buf, s, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    s = s[: N - i]
    buf[i:i + len(s), 0] += s * g * np.cos((pan + 1) * np.pi / 4)
    buf[i:i + len(s), 1] += s * g * np.sin((pan + 1) * np.pi / 4)

# ---------------------------------------------------------------- instruments
def marimba(n, d=0.6):
    t = tt(d); f = midi(n)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 30)) * np.exp(-t * 7) * np.minimum(1, t / 0.002)
def bass(n, d):
    t = tt(d); f = midi(n)
    return lp(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t), 500) * np.minimum(1, t / 0.01) * np.exp(-t * 2.5)
def kick():
    t = tt(0.3); f = 50 + 90 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
def clap():
    t = tt(0.2); return bp(rng.normal(size=len(t)), 1000, 4000) * np.exp(-t * 25)
def shaker():
    t = tt(0.08); return hp(rng.normal(size=len(t)), 6000) * np.exp(-t * 50) * np.minimum(1, t / 0.01)
def pad(notes, d):
    t = tt(d); s = sum(np.sin(2 * np.pi * midi(n) * t) + 0.3 * np.sin(2 * np.pi * 2 * midi(n) * t) for n in notes) / len(notes)
    return s * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5)

mus = np.zeros((N, 2))
# progression en Sol majeur : G – Em – C – D (une mesure = 2 s)
prog = [(43, [55, 59, 62, 67]), (40, [52, 55, 59, 64]), (36, [52, 55, 60, 64]), (38, [54, 57, 62, 66])]
melody = [74, 71, 74, 76, 74, 71, 69, 71]
bar = 4 * B
for m in range(13):
    t0 = m * bar
    root, notes = prog[m % 4]
    in_transition = 11.0 <= t0 < 12.0
    add(mus, pad(notes, bar + 0.4), t0, 0.07)
    if t0 >= 2.9 and t0 < 24:
        for step in range(4):
            if not (11.0 <= t0 + step * B < 12.0):
                add(mus, kick(), t0 + step * B, 0.5)
                add(mus, shaker(), t0 + step * B + B / 2, 0.06, 0.3)
            if step in (1, 3) and not (11.0 <= t0 + step * B < 12.0):
                add(mus, clap(), t0 + step * B, 0.18)
        for step, length in ((0, 0.9), (1.5, 0.4), (2, 0.9), (3.5, 0.4)):
            add(mus, bass(root, length * B), t0 + step * B, 0.35)
    # marimba : arpège sur les croches
    for k in range(8):
        tk = t0 + k * B / 2
        if tk >= 24.2: break
        n = melody[(k + m * 3) % 8] if t0 >= 2.9 else notes[k % 4] + 12
        add(mus, marimba(n), tk, 0.11 if k % 2 == 0 else 0.07, 0.35 * (-1) ** k)
# accord final
add(mus, pad([55, 59, 62, 67, 71], 3.6), 21.0, 0.12)
add(mus, marimba(79, 2.0), 20.6, 0.12)
add(mus, marimba(83, 2.0), 20.75, 0.10)
add(mus, marimba(86, 2.5), 20.9, 0.10)

# ---------------------------------------------------------------- bruitages
sfx = np.zeros((N, 2))
def whoosh(d=0.5, up=True):
    t = tt(d); x = t / d; n = rng.normal(size=len(t))
    m = x if up else 1 - x
    return (lp(n, 900) * (1 - m) + bp(n, 2000, 7000) * m * 0.7) * np.sin(np.pi * x) ** 2
def pop(f0=500, f1=1200, d=0.12):
    t = tt(d); f = f0 + (f1 - f0) * (1 - np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * np.minimum(1, t / 0.002)
def tick():
    t = tt(0.03); return bp(rng.normal(size=len(t)), 3000, 8000) * np.exp(-t * 200)
def crunch(d=0.35):
    t = tt(d); out = np.zeros(len(t))
    for _ in range(26):  # petits craquements
        i = int(rng.uniform(0, d * 0.7) * SR); n = int(0.012 * SR)
        out[i:i + n] += bp(rng.normal(size=n), 1500, 7000) * np.exp(-np.arange(n) / SR * 300) * rng.uniform(0.3, 1)
    return out * np.exp(-t * 6)
def ding():
    t = tt(1.0); f = midi(88)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 6)) * np.exp(-t * 4)
def shake(d=0.5):
    t = tt(d); env = np.zeros(len(t))
    for k in range(4):
        c = k * d / 4; env += np.exp(-((t - c - 0.05) / 0.03) ** 2)
    return hp(rng.normal(size=len(t)), 4500) * env
def sparkle():
    out = np.zeros(int(1.2 * SR))
    for k, n in enumerate((88, 91, 95, 100, 103, 100)):
        t = tt(0.5); s = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 12)
        i = int(k * 0.05 * SR); out[i:i + len(s)] += s
    return out

add(sfx, whoosh(0.6), 0.0, 0.25)                  # formes de l'intro
add(sfx, pop(), 0.45, 0.35); add(sfx, sparkle(), 0.55, 0.08)  # logo
add(sfx, whoosh(0.35), 0.85, 0.12); add(sfx, whoosh(0.35), 1.2, 0.14)  # titre
add(sfx, ding() * 0.5, 1.7, 0.10)                 # ampoule
add(sfx, whoosh(0.6), 2.6, 0.22)                  # la carte monte
for k in range(6): add(sfx, tick(), 3.4 + k * 0.12, 0.12)       # mots du titre frites
add(sfx, whoosh(0.4), 4.0, 0.15, 0.3)             # entrée des frites
for t0 in (4.9, 7.0, 9.1): add(sfx, crunch(), t0, 0.32, 0.3)   # croustillant
add(sfx, ding(), 5.6, 0.12)                       # coche
add(sfx, whoosh(0.7), 10.95, 0.32); add(sfx, whoosh(0.5, False), 11.5, 0.22)  # transition
for k in range(3): add(sfx, tick(), 12.15 + k * 0.14, 0.12)
add(sfx, whoosh(0.4), 12.6, 0.15, 0.3)            # entrée du sel
for t0 in (13.2, 16.0, 18.4): add(sfx, shake(), t0, 0.2, 0.3)  # salière
add(sfx, ding(), 13.8, 0.12)                      # coche
add(sfx, whoosh(0.7), 19.95, 0.3)                 # vers l'outro
add(sfx, pop(400, 1000, 0.15), 20.6, 0.35); add(sfx, sparkle(), 20.7, 0.12)
add(sfx, ding() * 0.6, 21.8, 0.10)

ir_t = tt(1.2); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 5)[:, None]
ir /= np.sqrt((ir ** 2).sum(0))
mix = mus + sfx
mix = mix + np.stack([fftconvolve(mix[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.12
t = tt(DUR); mix *= (np.clip(t / 0.15, 0, 1) * np.clip((DUR - t) / 1.2, 0, 1))[:, None]
mix = np.tanh(mix * 1.3) / np.tanh(1.3); mix *= 0.9 / np.abs(mix).max()
wavfile.write("public/music_raw.wav", SR, (mix * 32767).astype(np.int16))
print("public/music_raw.wav écrit")
