"""Détoure le pot OLARA de la photo fournie (contour mesuré sur l'image, coins arrondis),
sans retouche du pot. Agrandi x1 (photo déjà nette) : proportions identiques à l'original."""
from PIL import Image, ImageDraw, ImageFilter

SRC = Image.open("public/media/original-pot.jpg").convert("RGB")
# contour : couvercle, col, épaules, corps, fond arrondi (coordonnées de la photo)
P = [(118, 78), (130, 52), (150, 43), (865, 43), (888, 52), (898, 78), (898, 148), (884, 158),
     (886, 198), (902, 232), (910, 290), (911, 1380), (892, 1430), (855, 1472), (790, 1494), (540, 1503),
     (290, 1497), (210, 1484), (155, 1458), (118, 1410), (97, 1300), (97, 300), (104, 238), (124, 200),
     (134, 158), (120, 148)]
S = 4
m = Image.new("L", (SRC.width * S, SRC.height * S), 0)
ImageDraw.Draw(m).polygon([(x * S, y * S) for x, y in P], fill=255)
m = m.resize(SRC.size, Image.LANCZOS)
# retire le fond bleu vu à travers le verre (col et épaules) : pixels bleus reliés au bord du masque
import numpy as np
from scipy import ndimage
a = np.asarray(SRC).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
inside = np.asarray(m) > 127
blue = inside & (b > r + 25) & (b > g)
edge = ndimage.binary_dilation(~inside, iterations=2)
lab, n = ndimage.label(blue); touch = set(np.unique(lab[edge & blue])) - {0}
keep = inside & ~ndimage.binary_dilation(np.isin(lab, list(touch)), iterations=1)
m = Image.fromarray((keep * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.9))
out = SRC.copy(); out.putalpha(m); out = out.crop(out.getbbox())
out.save("public/media/pot-olara.png"); print("pot-olara.png", out.size)
# logo ovale OLARA (pour l'écran d'ouverture), découpé en ellipse
cx, cy, rx, ry = 600, 652, 148, 62
L = SRC.crop((cx - rx - 3, cy - ry - 3, cx + rx + 3, cy + ry + 3))
mk = Image.new("L", (L.width * S, L.height * S), 0)
ImageDraw.Draw(mk).ellipse((3 * S, 3 * S, (L.width - 3) * S, (L.height - 3) * S), fill=255)
L.putalpha(mk.resize(L.size, Image.LANCZOS)); L.save("public/media/logo-olara.png"); print("logo", L.size)
