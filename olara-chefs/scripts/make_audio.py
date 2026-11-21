"""Bande-son de « OLARA — Le secret des chefs » (16,5 s).

0–10 s  : piste d'origine de la vidéo Gemini (voix + musique), traitée comme en studio par ffmpeg
          (public/media/gemini-voix-traitee.wav : passe-haut, chaleur, présence, de-esser, compression).
          On y ajoute seulement une fine couche d'ambiance (pas de seconde musique par-dessus la voix).
9,6 s   : whoosh de transition, montée lumineuse.
10,3 s  : apparition du pot : impact doux, scintillement.
11,7 s  : « LE SECRET DES CHEFS » : impact, accord final chaleureux, notes de piano.
Tout ce qui est ajouté est synthétisé (libre de droits).
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR, DUR = 48000, 16.5
N = int(SR * DUR)
rng = np.random.default_rng(23)
def tt(d): return np.arange(int(d * SR)) / SR
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, f): return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], "band", fs=SR, output="sos"), x)
def add(buf, s, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    s = s[: N - i]
    buf[i:i + len(s), 0] += s * g * np.cos((pan + 1) * np.pi / 4)
    buf[i:i + len(s), 1] += s * g * np.sin((pan + 1) * np.pi / 4)
def env(t, a, r, d): return np.minimum(1, t / a) * np.minimum(1, np.maximum(0, d - t) / r)

# ---------------------------------------------------------------- piste d'origine traitée
sr0, base = wavfile.read("public/media/gemini-voix-traitee.wav")
base = base.astype(float) / 32768
if base.ndim == 1: base = np.stack([base, base], 1)
mix = np.zeros((N, 2))
L = min(len(base), N)
fade = np.ones(L); k = int(0.45 * SR); fade[-k:] = np.linspace(1, 0, k)
mix[:L] += base[:L] * fade[:, None]

# ---------------------------------------------------------------- ajouts
add_ = np.zeros((N, 2))
def whoosh(d=0.9):
    t = tt(d); x = t / d; n = rng.normal(size=len(t))
    return (lp(n, 700) * (1 - x) + bp(n, 1800, 8000) * x * 0.7) * np.sin(np.pi * x) ** 2
def impact(d=1.8):
    t = tt(d); f = 40 + 60 * np.exp(-t * 16)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.8) + lp(rng.normal(size=len(t)), 500) * np.exp(-t * 12) * 0.35
def shimmer(d=1.8):
    out = np.zeros(int(d * SR))
    for j, n in enumerate((86, 90, 93, 98, 102)):
        t = tt(1.2); s = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 4); i = int(j * 0.07 * SR); out[i:i + len(s)] += s[: len(out) - i]
    return out
def pad(notes, d, cut=1800):
    t = tt(d)
    s = sum(sum(2 * ((midi(n) * 2 ** (dt / 12) * t + rng.random()) % 1) - 1 for dt in (-0.1, 0, 0.1)) / 3 for n in notes) / len(notes)
    return lp(s, cut) * env(t, 0.8, 2.0, d)
def piano(n, d=3.0):
    t = tt(d); f = midi(n)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) + 0.1 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 5)) * np.exp(-t * 1.4) * np.minimum(1, t / 0.004)

t = tt(1.4); add(add_, bp(rng.normal(size=len(t)), 400, 8000) * (t / 1.4) ** 3 * 0.6, 8.6, 0.10)   # montée discrète
add(add_, whoosh(), 9.55, 0.22)
add(add_, impact(), 10.3, 0.34); add(add_, shimmer(), 10.35, 0.07)
add(add_, pad([50, 57, 62, 66, 69], 6.4, 1600), 10.1, 0.17)                                       # nappe chaude (ré majeur)
for j, n in enumerate([62, 66, 69, 74]): add(add_, piano(n, 2.6), 10.45 + j * 0.32, 0.08, 0.25 * (j - 1.5))
add(add_, impact(2.2), 11.7, 0.38); add(add_, shimmer(2.0), 11.75, 0.10)                           # slogan
add(add_, pad([38, 50, 57, 62, 66, 69, 74], 4.8, 2400), 11.7, 0.16)
for j, n in enumerate([74, 78, 81, 86]): add(add_, piano(n, 3.5), 12.0 + j * 0.22, 0.07, 0.3 * (j - 1.5))
ir_t = tt(2.2); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 3)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
add_ = add_ + np.stack([fftconvolve(add_[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.25

mix = mix + add_
t = tt(DUR); mix *= np.clip((DUR - t) / 1.2, 0, 1)[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix *= 0.9 / np.abs(mix).max()
wavfile.write("public/music_raw.wav", SR, (mix * 32767).astype(np.int16))
print("public/music_raw.wav écrit")
