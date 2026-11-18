"""Beat map + bande-son du film de lancement TOPCAFÉ (15 s, 130 BPM, 32 temps).

1. Définit tous les instants clés (calés sur les temps) et les frappes de clavier.
2. Écrit `timeline.js` : le film HTML lit exactement les mêmes instants.
3. Synthétise la musique (drop au temps 12) et les bruitages, puis écrit
   `out/audio_raw.wav` (la normalisation à -14 LUFS est faite par ffmpeg).

Musique et bruitages sont générés par le code : aucun droit à payer.
"""
import json, os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
BPM = 130
B = 60 / BPM                      # 0,4615 s
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
def T(beat): return round(beat * B, 4)

# ------------------------------------------------------------------ beat map
REQUEST = [
    "J'ai envie d'un bon café, quelque",
    "chose de crémeux, doux et délicieux",
    "pour commencer ma journée.",
]
EV = {
    "B": B,
    "typeStart": 0.22, "typeEnd": T(5.55),
    "send": T(6),
    "toss": [T(8), T(9), T(10), T(11)],
    "drop": T(12),
    "burst": T(12.45),
    "slide": T(13.4),
    "lift": T(15),
    "chat": T(16),
    "reply1": T(17),
    "reply2": T(18.4),
    "pills": T(19),
    "click": T(20),
    "ordered": T(20.75),
    "outro": T(21),
    "line1": T(23),
    "line2": T(25),
    "textAway": T(27),
    "route": T(27.3),
    "pin": T(29),
    "mark": T(29.4),
    "wordmark": T(30),
    "end": T(32),
}

# frappes : rythme naturel (pauses après espaces et ponctuation)
chars = "\n".join(REQUEST)
w = []
for i, c in enumerate(chars):
    base = 1.0 + rng.normal(0, 0.25)
    if c == " ": base *= 1.5
    if c in ",.": base *= 2.2
    if c == "\n": base *= 2.6
    if i > 0 and chars[i - 1] in ",.": base *= 1.4
    w.append(max(0.35, base))
w = np.cumsum(w); w = (w - w[0]) / (w[-1] - w[0])
keys = [round(EV["typeStart"] + x * (EV["typeEnd"] - EV["typeStart"]), 4) for x in w]
EV["keys"] = keys
EV["request"] = REQUEST

os.makedirs("out", exist_ok=True)
with open("timeline.js", "w") as f:
    f.write("// Généré par scripts/build_audio.py — ne pas modifier à la main.\n")
    f.write("window.EV = " + json.dumps(EV, ensure_ascii=False) + ";\n")

# ------------------------------------------------------------------ outils
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], "band", fs=SR, output="sos"), x)
def tt(d): return np.arange(int(d * SR)) / SR

def add(buf, sig, t0, g=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig, i = sig[-i:], 0
    sig = sig[: N - i]
    buf[i:i + len(sig), 0] += sig * g * np.cos((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 1] += sig * g * np.sin((pan + 1) * np.pi / 4)

def saw(f, t, voices=3, det=0.12):
    s = 0
    for v in range(voices):
        ff = f * 2 ** ((v - (voices - 1) / 2) * det / 12)
        ph = (ff * t + rng.random()) % 1
        s = s + (2 * ph - 1)
    return s / voices

# ------------------------------------------------------------------ musique
mus = np.zeros((N, 2))
drop = EV["drop"]

def kick():
    t = tt(0.4); f = 48 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * 1.0 + bp(rng.normal(size=len(t)), 2000, 6000) * np.exp(-t * 200) * 0.15

def clap():
    t = tt(0.25); n = bp(rng.normal(size=len(t)), 900, 3500)
    e = np.exp(-t * 22) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0) * (t < 0.03))
    return n * e

def hat(open_=False):
    t = tt(0.22 if open_ else 0.05)
    return hp(rng.normal(size=len(t)), 7500) * np.exp(-t * (14 if open_ else 70))

def bass(note, d):
    t = tt(d); f = midi(note)
    s = saw(f, t, 2, 0.05) * 0.6 + np.sin(2 * np.pi * f * t)
    s = lp(s, 700)
    e = np.minimum(1, t / 0.005) * np.exp(-t * 3.0)
    return s * e

def stab(notes, d, cutoff=2600):
    t = tt(d)
    s = sum(saw(midi(n), t) for n in notes) / len(notes)
    s = lp(s, cutoff)
    return s * np.minimum(1, t / 0.004) * np.exp(-t * 6)

def pluck(note, d=0.35):
    t = tt(d); f = midi(note)
    s = np.sin(2 * np.pi * f * t + 1.5 * np.exp(-t * 18) * np.sin(2 * np.pi * 2 * f * t))
    return s * np.exp(-t * 9) * np.minimum(1, t / 0.002)

def pad(notes, d):
    t = tt(d); s = sum(saw(midi(n), t, 3, 0.18) for n in notes) / len(notes)
    return lp(s, 1400) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.3)

# Progression (la mineur funky) : Am9 – Fmaj9 – Cmaj7 – G6, deux temps... un accord par mesure
prog = [([57, 60, 64, 67, 71], 45), ([53, 57, 60, 64, 67], 41), ([48, 55, 59, 64, 67], 36), ([55, 59, 62, 64, 69], 43)]

# --- avant le drop (temps 0–12) : nappe filtrée, hats discrets, montée
for bar in range(3):
    notes, root = prog[bar % 4]
    add(mus, pad(notes, 4 * B + 0.2), bar * 4 * B, 0.20)
for b8 in range(0, 24):
    t0 = b8 * B / 2
    add(mus, hat(), t0 + B / 4 if b8 >= 8 else t0 + 99, 0.05, 0.3)
for k in range(8):  # pluck doux pendant la saisie
    add(mus, pluck(prog[0][0][k % 5] + 12), k * B * 0.75 + 0.1, 0.06, (-1) ** k * 0.3)
# montée : bruit filtré + roulement de caisse claire (temps 8 → 12)
t = tt(4 * B); x = t / (4 * B)
riser = bp(rng.normal(size=len(t)), 400, 9000) * x ** 2.2
add(mus, riser, T(8), 0.18)
for k in range(16):
    tk = T(8) + k * (4 * B) / 16 * (1 - 0.0 * k)
    add(mus, clap(), tk, 0.05 + 0.18 * (k / 16) ** 2, 0)
# coupure d'une demi-seconde avant le drop puis impact
add(mus, kick() * 1.3, drop, 0.9)

# --- drop (temps 12 → 29) : groove complet
beat = 12
while beat < 29:
    t0 = T(beat)
    add(mus, kick(), t0, 0.75)
    if beat % 2 == 1: add(mus, clap(), t0, 0.32)
    add(mus, hat(open_=True), t0 + B / 2, 0.08, 0.25)
    add(mus, hat(), t0 + B / 4, 0.04, -0.25)
    add(mus, hat(), t0 + 3 * B / 4, 0.04, -0.25)
    beat += 1
for bar in range(5):
    t0 = T(12 + bar * 4)
    if t0 >= T(29): break
    notes, root = prog[bar % 4]
    for step, length in ((0, 0.75), (1.5, 0.5), (2.5, 0.5), (3, 0.75)):  # basse syncopée
        if t0 + step * B < T(29): add(mus, bass(root, length * B), t0 + step * B, 0.42)
    for step in (0.5, 1.75, 2.5, 3.5):  # accords « stab »
        if t0 + step * B < T(29): add(mus, stab(notes[1:], 0.3), t0 + step * B, 0.13, 0.15 * (-1) ** int(step * 2))
    for k, step in enumerate((0, 0.75, 1.5, 2.25, 3)):
        if t0 + step * B < T(29): add(mus, pluck(notes[(k * 2) % 5] + 12), t0 + step * B, 0.07, 0.4 * (-1) ** k)
# --- final (temps 29 → 32) : accord tenu + dernier impact
add(mus, kick(), T(29), 0.8)
add(mus, pad([57, 60, 64, 67, 71, 76], DUR - T(29)), T(29), 0.26)
add(mus, stab([57, 64, 67, 71], 1.2, 3500), T(29), 0.16)
add(mus, bass(45, 2.2), T(29), 0.35)

# réverbération légère
ir_t = tt(1.6); ir = rng.normal(size=(len(ir_t), 2)) * np.exp(-ir_t * 4)[:, None]
ir = np.stack([lp(ir[:, 0], 6000), lp(ir[:, 1], 6000)], 1); ir /= np.sqrt((ir ** 2).sum(0))
mus = mus + np.stack([fftconvolve(mus[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.18

# ------------------------------------------------------------------ bruitages
sfx = np.zeros((N, 2))
def key_click():
    t = tt(0.035)
    return (bp(rng.normal(size=len(t)), 2500, 7000) * np.exp(-t * 180) + 0.4 * np.sin(2 * np.pi * rng.uniform(180, 260) * t) * np.exp(-t * 120))
def pop(f0=700, f1=1400, d=0.12):
    t = tt(d); f = f0 + (f1 - f0) * (1 - np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * np.minimum(1, t / 0.002)
def whoosh(d=0.5, lo=300, hi=5000, up=True):
    t = tt(d); x = t / d; n = rng.normal(size=len(t))
    a, b2 = lp(n, lo * 3), bp(n, hi / 4, hi)
    m = x if up else 1 - x
    return (a * (1 - m) + b2 * m) * np.sin(np.pi * x) ** 2
def impact():
    t = tt(1.0); f = 40 + 80 * np.exp(-t * 18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) + lp(rng.normal(size=len(t)), 900) * np.exp(-t * 10) * 0.5
def click():
    t = tt(0.04); return bp(rng.normal(size=len(t)), 1500, 6000) * np.exp(-t * 250) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 300) * 0.5
def success():
    out = np.zeros(int(0.9 * SR))
    for k, n in enumerate((76, 81, 88)):
        t = tt(0.9 - k * 0.08)
        s = (np.sin(2 * np.pi * midi(n) * t) + 0.3 * np.sin(2 * np.pi * 2 * midi(n) * t)) * np.exp(-t * 5)
        i = int(k * 0.08 * SR); out[i:i + len(s)] += s
    return out
def sparkle():
    out = np.zeros(int(1.2 * SR))
    for k in range(9):
        n = 88 + [0, 4, 7, 12, 16, 19, 24, 19, 16][k]; t = tt(0.5)
        s = np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * 12)
        i = int(k * 0.045 * SR); out[i:i + len(s)] += s * (1 - k / 12)
    return out
def toss():
    w = whoosh(0.22, 400, 4000) * 0.8
    p = pop(300, 500, 0.08) * 0.6
    w[: len(p)] += p
    return w
def spinner_tick():
    t = tt(0.02); return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 300)

for i, k in enumerate(keys):
    if chars[i] != "\n": add(sfx, key_click(), k, 0.16 + rng.uniform(-0.04, 0.04), rng.uniform(-0.2, 0.2))
add(sfx, pop(600, 1500), EV["send"], 0.45)
add(sfx, whoosh(0.5, 300, 6000, False), EV["send"] + 0.05, 0.12)
for k, t0 in enumerate(EV["toss"]):
    add(sfx, toss(), t0, 0.35, (-1) ** k * 0.3)
add(sfx, impact(), EV["drop"], 0.55)
add(sfx, whoosh(0.35, 500, 7000), EV["drop"] - 0.05, 0.25)
add(sfx, whoosh(0.4, 400, 6000), EV["burst"] - 0.05, 0.22)
add(sfx, whoosh(0.55, 300, 5000), EV["slide"] - 0.05, 0.25, 0.3)
add(sfx, pop(900, 1300, 0.1), EV["lift"], 0.25)
add(sfx, whoosh(0.4, 300, 5000, False), EV["chat"], 0.2, -0.2)
add(sfx, click(), EV["click"], 0.5)
for k in range(5): add(sfx, spinner_tick(), EV["click"] + 0.06 + k * 0.06, 0.08)
add(sfx, success(), EV["ordered"], 0.28)
add(sfx, whoosh(0.6, 200, 4000), EV["outro"], 0.32)
add(sfx, pop(500, 900, 0.12), EV["pin"], 0.3)
add(sfx, sparkle(), EV["mark"], 0.16)
add(sfx, whoosh(0.4, 600, 8000), EV["wordmark"], 0.12, 0.3)

mix = mus * 0.8 + sfx
mix *= np.clip((DUR - tt(DUR)) / 0.25, 0, 1)[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= 0.9 / np.abs(mix).max()
wavfile.write("out/audio_raw.wav", SR, (mix * 32767).astype(np.int16))
print("timeline.js + out/audio_raw.wav écrits")
for k in ("send", "drop", "chat", "outro", "end"): print(f"  {k:6s} {EV[k]:.3f} s")
