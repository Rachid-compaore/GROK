"""Prépare les emballages Lipton fournis : léger recadrage des bords (3 px),
agrandissement x2 (Lanczos) pour rester net à l'écran, et extraction du logo.
Aucun texte ni couleur de l'emballage n'est modifié."""
import shutil
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage

SRC = "/tmp/claude-0/-home-user-GROK/99e2ed27-c896-58ad-85a6-22c73c237621/images"
PACKS = {"strawberry": 3, "blackcurrant": 4, "forest-fruits": 5, "lemon": 6}
for name, i in PACKS.items():
    im = Image.open(f"{SRC}/{i}.jpg").convert("RGB")
    shutil.copy(f"{SRC}/{i}.jpg", f"public/packs/original-{name}.jpg")
    im = im.crop((3, 3, im.width - 3, im.height - 3))
    im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.6, 50, 2))
    im.save(f"public/packs/{name}.jpg", quality=95)
    print(name, im.size)

# logo LIPTON (bandeau rouge + feuille) depuis l'emballage citron
im = Image.open(f"{SRC}/6.jpg").convert("RGB")
box = (20, 30, 305, 185)
c = im.crop(box); a = np.asarray(c).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
red = (r > 140) & (g < 90) & (b < 90)
leaf = (g > r + 10) & (g > b + 30)
m = ndimage.binary_closing(red | leaf, iterations=2)
m = ndimage.binary_fill_holes(m)
lab, n = ndimage.label(m); s = ndimage.sum(m, lab, range(1, n + 1))
m = np.isin(lab, [k + 1 for k, v in enumerate(s) if v > 150])
m = ndimage.binary_opening(m, iterations=1)
al = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.6))
c.putalpha(al); c = c.crop(c.getbbox())
c = c.resize((c.width * 3, c.height * 3), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
c.save("public/logo-lipton.png"); print("logo", c.size)
