"""Détoure les éléments du visuel Warda fourni, sans retouche :
sachet de couscous 1 kg, logo Warda (médaillon), plat de couscous, bol de semoule."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy import ndimage
from scipy.spatial import ConvexHull
from matplotlib.path import Path

SRC = Image.open("public/media/original-warda.png").convert("RGB")
A = np.asarray(SRC).astype(int); r, g, b = A[..., 0], A[..., 1], A[..., 2]
sat = A.max(2) - A.min(2)
H, W = r.shape
yy, xx = np.mgrid[0:H, 0:W]

def save(mask, name, feather=0.9):
    al = Image.fromarray((mask * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(feather))
    out = SRC.copy(); out.putalpha(al); box = out.getbbox(); out = out.crop(box)
    out.save(f"public/media/{name}.png"); print(name, out.size, box)
    return box

def hull_mask(m):
    ys, xs = np.where(m); pts = np.c_[xs, ys]; hp = pts[ConvexHull(pts).vertices]
    return Path(hp).contains_points(np.c_[xx.ravel(), yy.ravel()], radius=0.5).reshape(H, W)

# ---- sachet : contour mesuré sur l'image (bords verticaux du sachet, haut plissé).
# Le bol de semoule cache le coin bas-gauche du sachet : ce coin n'existe pas sur la photo,
# il n'est pas inventé (la mise en scène le couvre par un tas de semoule au premier plan).
P = [(78, 398), (92, 388), (300, 383), (536, 390), (542, 405), (541, 1228), (532, 1244), (172, 1247),
     (166, 1160), (160, 1086), (120, 1080), (78, 1083)]
S = 4
mk = Image.new("L", (W * S, H * S), 0); ImageDraw.Draw(mk).polygon([(x * S, y * S) for x, y in P], fill=255)
bag = np.asarray(mk.resize((W, H), Image.LANCZOS)) > 127
BAG_BOX = save(bag, "sachet", 0.8)

# ---- logo Warda : médaillon circulaire (anneau doré inclus)
cx, cy, R = 229, 199, 170
logo = (xx - cx) ** 2 + (yy - cy) ** 2 <= R ** 2
save(logo, "logo-warda", 0.7)

# ---- plat de couscous (coupé par le bord droit de l'image)
plate = (xx > 530) & (yy > 855) & (yy < 1225)
ell = ((xx - 790) / 270.0) ** 2 + ((yy - 1050) / 175.0) ** 2 <= 1
dome = (yy < 1060) & (((xx - 800) / 250.0) ** 2 + ((yy - 1000) / 150.0) ** 2 <= 1)
save(plate & (ell | dome), "plat", 1.2)

# ---- plat : remplacé par un cadre photo fondu (le plat est coupé par le bord de l'image source,
# un détourage serait forcément imparfait). Les bords sont fondus dans la mise en scène.
c = SRC.crop((550, 838, 1024, 1236))
c = c.resize((c.width * 2, c.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.4, 40, 2))
c.save("public/media/plat-photo.jpg", quality=94); print("plat-photo", c.size)
