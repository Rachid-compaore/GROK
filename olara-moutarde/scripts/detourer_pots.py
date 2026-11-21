"""Détoure les trois pots OLARA de la photo fournie, un par un, sans retouche.
Les pots sont convexes : on prend l'enveloppe convexe des pixels du pot (moutarde,
étiquette, couvercle) et on complète le fond de verre par un arc mesuré sur l'image.
Tous les pots sont agrandis du même facteur : leurs tailles relatives restent exactes."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy import ndimage
from scipy.spatial import ConvexHull
import json

SRC = Image.open("public/products/original-olara.jpg").convert("RGB")
a = np.asarray(SRC).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
sat = a.max(2) - a.min(2)
colored = ((r > 120) & (b < 80) & (sat > 80)) | ((r > 150) & (g < 90) & (b < 90))
SCALE = 2
# (x0, x1, y_haut, y_fond, coins bas gauche/droite) mesurés sur l'image
JARS = {
    "pot-1kg": (35, 395, 145, 820, (80, 800), (362, 800)),
    "pot-850g": (400, 718, 195, 816, (445, 792), (672, 795)),
    "pot-370g": (735, 1005, 345, 808, (776, 791), (980, 791)),
}
meta = {}
for name, (x0, x1, yt, yb, bl, br) in JARS.items():
    m = np.zeros_like(colored); m[yt:yb, x0:x1] = colored[yt:yb, x0:x1]
    m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m); s = ndimage.sum(m, lab, range(1, n + 1)); m = np.isin(lab, [k + 1 for k, v in enumerate(s) if v > 1500])  # corps + couvercle
    ys, xs = np.where(m)
    pts = list(zip(xs, ys))
    cx = (bl[0] + br[0]) / 2
    for k in np.linspace(0, np.pi, 30):  # arc du fond de verre
        pts.append((cx - np.cos(k) * (br[0] - bl[0]) / 2, br[1] + np.sin(k) * (yb - br[1])))
    pts = np.array(pts, float)
    hull = pts[ConvexHull(pts).vertices]
    S = 4; mk = Image.new("L", (SRC.width * S, SRC.height * S), 0)
    ImageDraw.Draw(mk).polygon([(x * S, y * S) for x, y in hull], fill=255)
    mk = mk.resize(SRC.size, Image.LANCZOS)
    # retire le fond clair vu autour du col en verre (zones claires et grises reliées au bord)
    inside = np.asarray(mk) > 127
    lum = a.mean(2); bgl = inside & (lum > 135) & (sat < 50)
    ring = ndimage.binary_dilation(~inside, iterations=2)
    lab2, n2 = ndimage.label(bgl)
    touch = set(np.unique(lab2[ring & bgl])) - {0}
    cut = np.isin(lab2, list(touch))
    # uniquement dans la zone du col et de l'épaule (haut du pot), jamais sur l'étiquette
    neck = np.zeros_like(cut); neck[: yt + int((yb - yt) * 0.22), :] = True
    cut &= neck
    keep = inside & ~ndimage.binary_dilation(cut, iterations=1)
    mk = Image.fromarray((keep * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))
    out = SRC.copy(); out.putalpha(mk); box = out.getbbox(); out = out.crop(box)
    out = out.resize((out.width * SCALE, out.height * SCALE), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.4, 45, 2))
    out.save(f"public/products/{name}.png")
    meta[name] = {"w": out.width, "h": out.height, "x": box[0], "y": box[1]}
    print(name, out.size, "boîte d'origine", box)
json.dump(meta, open("public/products/pots.json", "w"), indent=2)
