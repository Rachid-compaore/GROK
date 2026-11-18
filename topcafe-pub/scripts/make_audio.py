"""Génère la bande-son de la pub TOPCAFÉ Café Latte (25 s, 48 kHz, stéréo).

Musique instrumentale douce (nappes, piano électrique, basse, percussions
légères) + bruitages discrets (grains de café, versement, transitions,
accents sur les textes). Tout est synthétisé : aucun fichier externe,
donc aucun problème de droits.

Usage : python3 scripts/make_audio.py  ->  public/music.wav
"""
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile
import os

SR = 48000
DUR = 25.0
N = int(SR * DUR)
rng = np.random.default_rng(42)
t_all = np.arange(N) / SR

def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)

def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    sus = max(n - a - d - r, 0)
    e = np.concatenate([np.linspace(0, 1, a, endpoint=False),
                        np.linspace(1, s, d, endpoint=False),
                        np.full(sus, s), np.linspace(s, 0, r)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]

def add(buf, sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l = np.cos((pan + 1) * np.pi / 4) * gain
    r = np.sin((pan + 1) * np.pi / 4) * gain
    buf[i:i + len(sig), 0] += sig * l
    buf[i:i + len(sig), 1] += sig * r

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)

def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)

def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)

# ---------------------------------------------------------------- musique
music = np.zeros((N, 2))
BPM = 84
beat = 60 / BPM
bar = 4 * beat
# Progression chaleureuse en Do majeur
chords = [
    [53, 57, 60, 64, 67],  # Fmaj9
    [52, 55, 59, 62],      # Em7
    [45, 57, 60, 64, 67],  # Am9
    [50, 57, 60, 64, 65],  # Dm9
    [53, 57, 60, 64, 67],  # Fmaj9
    [52, 55, 59, 62, 64],  # Em7
    [45, 57, 60, 64, 67],  # Am9
    [43, 55, 59, 62, 65],  # G9sus
    [48, 55, 59, 62, 64],  # Cmaj9 (final)
]

def pad_note(f, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.12, 0.0, 0.11):
        ff = f * 2 ** (det / 12)
        for h, g in ((1, 1.0), (2, 0.35), (3, 0.12), (4, 0.05)):
            s += g * np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28))
    trem = 1 + 0.08 * np.sin(2 * np.pi * 0.25 * t)
    return s * trem * env_adsr(n, 1.2, 0.5, 0.85, 1.6) / 6

def epiano(f, dur=2.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3)
         + 0.12 * np.sin(2 * np.pi * 7.02 * f * t) * np.exp(-t * 14))
    return s * np.exp(-t * 1.6) * env_adsr(n, 0.004, 0.1, 1, 0.3)

def bass(f, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 2 * f * t)
    return s * env_adsr(n, 0.03, 0.3, 0.7, 0.4)

for i, ch in enumerate(chords):
    start = i * bar * 0.85  # ~2.43 s par accord
    dur = bar * 0.85 + 1.2 if i < len(chords) - 1 else DUR - start
    for k, nnote in enumerate(ch[1:]):
        add(music, pad_note(midi(nnote), dur), start, 0.16, pan=(k - 2) * 0.3)
    if start >= 3.9:  # basse à partir de la scène 2
        add(music, bass(midi(ch[0] - 12 if ch[0] > 47 else ch[0]), min(dur, bar * 0.85)), start, 0.22)
    # arpège de piano électrique
    arp = ch[1:] + [ch[2] + 12]
    step = beat / 2 if 3.9 <= start < 20.5 else beat
    nsteps = int((bar * 0.85) / step)
    for j in range(nsteps):
        tt = start + j * step
        if tt > 23.2:
            break
        note = arp[(j * 2 + i) % len(arp)] + 12
        add(music, epiano(midi(note)), tt, 0.07 + 0.03 * (j % 2 == 0), pan=0.35 * np.sin(j))

# Percussions très douces (scènes 3 et 4)
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def shaker():
    n = int(0.09 * SR); t = np.arange(n) / SR
    return hp(rng.normal(size=n), 6000) * np.exp(-t * 45) * (1 - np.exp(-t * 400))

tt = 8.85
while tt < 20.6:
    add(music, kick(), tt, 0.20)
    add(music, shaker(), tt + beat / 2, 0.05, pan=0.3)
    add(music, shaker(), tt + beat, 0.03, pan=-0.3)
    add(music, shaker(), tt + 1.5 * beat, 0.05, pan=0.3)
    tt += 2 * beat

# Réverbération
ir_n = int(2.8 * SR)
ir_t = np.arange(ir_n) / SR
ir = rng.normal(size=(ir_n, 2)) * np.exp(-ir_t * 2.2)[:, None]
ir[:, 0] = lp(ir[:, 0], 5000); ir[:, 1] = lp(ir[:, 1], 5000)
ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1)
music = music * 0.75 + wet * 0.55

# ---------------------------------------------------------------- bruitages
sfx = np.zeros((N, 2))

def whoosh(dur=1.1, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = rng.normal(size=n)
    lo_s, hi_s = lp(noise, 600), bp(noise, 1500, 6000)
    x = t / dur
    mix = x if up else 1 - x
    e = np.sin(np.pi * x) ** 2
    return (lo_s * (1 - mix) + hi_s * mix * 0.6) * e

def bean_tap():
    n = int(0.06 * SR); t = np.arange(n) / SR
    s = bp(rng.normal(size=n), 1800, 5200) * np.exp(-t * 90)
    s += 0.5 * np.sin(2 * np.pi * rng.uniform(900, 1400) * t) * np.exp(-t * 120)
    return s

def chime(note, dur=2.6):
    n = int(dur * SR); t = np.arange(n) / SR
    f = midi(note)
    s = sum(g * np.sin(2 * np.pi * f * m * t) * np.exp(-t * d)
            for m, g, d in ((1, 1, 2.2), (2.756, 0.35, 4), (5.404, 0.12, 7)))
    return s * (1 - np.exp(-t * 300))

def pour(dur=2.6):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = rng.normal(size=n)
    body = bp(noise, 250, 1400)
    gurgle = 1 + 0.6 * lp(rng.normal(size=n), 12) * 40
    e = np.clip(t / 0.25, 0, 1) * np.clip((dur - t) / 0.8, 0, 1)
    s = body * np.clip(gurgle, 0.2, 2.2) * e
    for _ in range(26):  # petites bulles
        st = rng.uniform(0.1, dur - 0.3)
        bn = int(0.05 * SR); bt = np.arange(bn) / SR
        fq = rng.uniform(500, 1100) * (1 + 3 * bt)
        b = np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-bt * 70)
        i = int(st * SR); s[i:i + bn] += b * 0.6
    return s

def soft_boom(dur=2.5):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 55 * t) * 0.8 + lp(rng.normal(size=n), 200) * 0.6) * np.exp(-t * 2.2) * (1 - np.exp(-t * 60))

# transitions
for t0, up in ((3.45, True), (8.45, True), (14.35, False), (20.25, True)):
    add(sfx, whoosh(1.2, up), t0, 0.10, pan=-0.2 if up else 0.2)
# grains de café
for t0, p in ((0.55, -0.5), (1.05, 0.4), (1.7, -0.2), (2.6, 0.6), (4.6, 0.5), (5.15, -0.4), (6.1, 0.2), (15.4, -0.3), (15.62, 0.1), (15.8, 0.4)):
    add(sfx, bean_tap(), t0, 0.16, pan=p)
# versement du café (scène 3)
add(sfx, pour(2.8), 9.25, 0.10, pan=0.15)
# accents des textes (notes dans la tonalité)
for t0, note in ((0.95, 84), (10.0, 79), (12.15, 84), (16.3, 76), (17.25, 81), (21.9, 79), (22.6, 84)):
    add(sfx, chime(note), t0, 0.045, pan=0.0)
# révélation du packshot
add(sfx, soft_boom(), 20.75, 0.22)
sfx_wet = np.stack([fftconvolve(sfx[:, c], ir[:, c])[:N] for c in range(2)], 1)
sfx = sfx + sfx_wet * 0.35

# ---------------------------------------------------------------- mixage
mix = music + sfx
fade_in = np.clip(t_all / 0.6, 0, 1)
fade_out = np.clip((DUR - t_all) / 1.8, 0, 1)
mix *= (fade_in * fade_out)[:, None]
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 0.89 / np.abs(mix).max()

os.makedirs("public", exist_ok=True)
wavfile.write("public/music.wav", SR, (mix * 32767).astype(np.int16))
print("public/music.wav écrit,", DUR, "s")
