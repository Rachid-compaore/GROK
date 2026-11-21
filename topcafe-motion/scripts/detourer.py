"""Détoure les sachets 3 IN 1 et Cappuccino (fond blanc) sans retoucher l'emballage.
Le sachet Café Latte reprend le détourage déjà validé (scripts/detourer_sachet.py du projet topcafe-pub)."""
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage
import shutil

def cut(src, out):
    im = Image.open(src).convert("RGB"); a = np.asarray(im).astype(int)
    lum = a.mean(2); sat = a.max(2) - a.min(2)
    bg = (lum > 236) & (sat < 18)
    lab, n = ndimage.label(bg)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    m = ~np.isin(lab, list(edge))
    m = ndimage.binary_opening(m, iterations=2)
    lab2, n2 = ndimage.label(m); s = ndimage.sum(m, lab2, range(1, n2 + 1)); m = lab2 == (np.argmax(s) + 1)
    m = ndimage.binary_fill_holes(m)
    al = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.9))
    im.putalpha(al); im = im.crop(im.getbbox()); im.save(out); print(out, im.size)

cut("public/products/original-3in1.png", "public/products/3in1.png")
cut("public/products/original-cappuccino.png", "public/products/cappuccino.png")
shutil.copy("../topcafe-pub/public/sachet.png", "public/products/latte.png")
print("latte", Image.open("public/products/latte.png").size)
