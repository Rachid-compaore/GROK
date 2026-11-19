"""Extrait les éléments des deux visuels OLARA fournis (sans les retoucher) :
logo, ampoule, photo des frites, photo du sel. Seul le fond blanc est retiré."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy import ndimage

A = Image.open("public/img/original-frites.jpg").convert("RGB")
B = Image.open("public/img/original-sel.jpg").convert("RGB")

def cutout_white(img, box, thr=232, out=None, grow=1):
    c = img.crop(box); a = np.asarray(c).astype(int)
    lum = a.mean(2); sat = a.max(2) - a.min(2)
    bg = (lum > thr) & (sat < 28)
    lab, n = ndimage.label(bg)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    m = ~np.isin(lab, list(edge))
    m = ndimage.binary_opening(m, iterations=1)
    lab2, n2 = ndimage.label(m); s = ndimage.sum(m, lab2, range(1, n2 + 1))
    keep = np.isin(lab2, [i + 1 for i, v in enumerate(s) if v > 400])
    keep = ndimage.binary_fill_holes(keep)
    # enveloppe convexe : garde les bords blancs du produit (bol, sel) sans les grignoter
    from scipy.spatial import ConvexHull
    from matplotlib.path import Path
    ys, xs = np.where(keep); pts = np.c_[xs, ys]
    hull = pts[ConvexHull(pts).vertices]
    yy, xx = np.mgrid[0:keep.shape[0], 0:keep.shape[1]]
    keep = Path(hull).contains_points(np.c_[xx.ravel(), yy.ravel()], radius=1).reshape(keep.shape)
    al = Image.fromarray((keep * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))
    c.putalpha(al); c = c.crop(c.getbbox()); c.save(out); print(out, c.size)

# logo : ovale vert, détouré par une ellipse ajustée
cx, cy, rx, ry = 1103, 124.5, 156, 83
L = A.crop((int(cx - rx - 2), int(cy - ry - 2), int(cx + rx + 2), int(cy + ry + 2)))
S = 4; m = Image.new("L", (L.width * S, L.height * S), 0)
ImageDraw.Draw(m).ellipse((2 * S, 2 * S, (L.width - 2) * S, (L.height - 2) * S), fill=255)
L.putalpha(m.resize(L.size, Image.LANCZOS)); L.save("public/img/logo-olara.png"); print("logo", L.size)

# ampoule : traits verts uniquement
c = A.crop((648, 84, 846, 294)); a = np.asarray(c).astype(float)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = a.mean(2)
alpha = np.clip((235 - lum) / 110, 0, 1) * (g >= r - 5)
rgba = np.zeros((c.height, c.width, 4), np.uint8); rgba[..., :3] = (22, 110, 52); rgba[..., 3] = (alpha * 255).astype(np.uint8)
Image.fromarray(rgba).save("public/img/ampoule.png"); print("ampoule", c.size)

cutout_white(A, (838, 578, 1228, 948), out="public/img/frites.png")
cutout_white(B, (878, 628, 1222, 1004), out="public/img/sel.png")

# couleurs de la marque, mesurées sur l'image
arr = np.asarray(A).astype(int)
print("vert", arr[1000, 30], "jaune", arr[20, 600], "vert titre", arr[490, 330])
