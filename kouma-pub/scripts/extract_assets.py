"""Extrait du visuel Kouma fourni (sans retouche) : le logo, les deux boîtes,
les deux verres de thé et le logo du distributeur. Seul le fond est retiré."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy import ndimage

SRC = Image.open("public/img/original-kouma.jpg").convert("RGB")
A = np.asarray(SRC).astype(int)

def save_poly(points, name, feather=1.2, scale=2):
    """Découpe le polygone, l'agrandit x2 (Lanczos) et l'enregistre en PNG transparent."""
    S = 4
    m = Image.new("L", (SRC.width * S, SRC.height * S), 0)
    ImageDraw.Draw(m).polygon([(x * S, y * S) for x, y in points], fill=255)
    m = m.resize(SRC.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(feather))
    out = SRC.copy(); out.putalpha(m); out = out.crop(out.getbbox())
    out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.5, 40, 2))
    out.save(f"public/img/{name}.png"); print(name, out.size)

def ellipse_pts(cx, cy, rx, ry, a0, a1, n=40):
    return [(cx + rx * np.cos(a), cy + ry * np.sin(a)) for a in np.linspace(a0, a1, n)]

# les deux boîtes (contour mesuré sur le visuel)
save_poly([(41, 814), (82, 806), (285, 800), (285, 776), (330, 772), (566, 770), (566, 1212),
           (330, 1232), (322, 1254), (82, 1272), (47, 1236)], "boites")

# les deux verres de thé
g1 = ellipse_pts(762, 925, 112, 38, np.pi, 2 * np.pi) + [(838, 1205)] + ellipse_pts(755, 1205, 80, 14, 0, np.pi) + [(654, 940)]
g2 = ellipse_pts(947, 1008, 122, 48, np.pi, 2 * np.pi) + [(1036, 1305)] + ellipse_pts(938, 1305, 98, 20, 0, np.pi) + [(826, 1015)]
m = Image.new("L", SRC.size, 0); d = ImageDraw.Draw(m); d.polygon(g1, fill=255); d.polygon(g2, fill=255)
m = m.filter(ImageFilter.GaussianBlur(1.2))
out = SRC.copy(); out.putalpha(m); out = out.crop(out.getbbox())
out = out.resize((out.width * 2, out.height * 2), Image.LANCZOS); out.save("public/img/verres.png"); print("verres", out.size)

# logo Kouma : bandeau rouge (+ texte blanc), liseré jaune, feuilles
x0, y0, x1, y1 = 250, 100, 965, 460
c = A[y0:y1, x0:x1]; r, g, b = c[..., 0], c[..., 1], c[..., 2]
red = (r > 215) & (g < 45) & (b < 45)
red = ndimage.binary_closing(red, iterations=3); red = ndimage.binary_fill_holes(red)
lab, n = ndimage.label(red); s = ndimage.sum(red, lab, range(1, n + 1)); red = lab == (np.argmax(s) + 1)
red = ndimage.binary_fill_holes(red)
ring = ndimage.binary_dilation(red, iterations=9) & ~red
yellow = ring & (r > 180) & (g > 120) & (b < 120) & (r > g)
leaf = (g > r + 50) & (g > b + 40)
yy, xx = np.mgrid[0:c.shape[0], 0:c.shape[1]]
leaf &= (xx > 520) & (yy < 180)
leaf = ndimage.binary_closing(leaf, iterations=2); leaf = ndimage.binary_fill_holes(leaf)
lab, n = ndimage.label(leaf); s = ndimage.sum(leaf, lab, range(1, n + 1))
leaf = np.isin(lab, [k + 1 for k, v in enumerate(s) if v > 300])
leaf = ndimage.binary_dilation(leaf, iterations=2)  # liseré blanc des feuilles
m = red | ndimage.binary_closing(yellow, iterations=2) | leaf
m = ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=2))
al = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))
L = SRC.crop((x0, y0, x1, y1)); L.putalpha(al); L = L.crop(L.getbbox())
L = L.resize((L.width * 2, L.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.5, 40, 2))
L.save("public/img/logo-kouma.png"); print("logo", L.size)

# logo du distributeur (carré blanc arrondi en haut à droite)
k = SRC.crop((1020, 22, 1126, 142)); ka = np.asarray(k).astype(int)
white = ka.mean(2) > 200
lab, n = ndimage.label(white); s = ndimage.sum(white, lab, range(1, n + 1)); wm = ndimage.binary_fill_holes(lab == (np.argmax(s) + 1))
k.putalpha(Image.fromarray((wm * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.6))); k = k.crop(k.getbbox())
k.resize((k.width * 2, k.height * 2), Image.LANCZOS).save("public/img/logo-distributeur.png"); print("distributeur", k.size)
