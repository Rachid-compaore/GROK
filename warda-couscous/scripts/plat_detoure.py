"""Détoure le plat de couscous (photo fournie, public/media/original-plat.png).
Le plat touche le haut, la gauche et la droite de la photo : le contour est une super-ellipse
ajustée aux mesures du rebord (plus « carrée » en haut, plus ronde en bas à cause de la perspective),
légèrement à l'intérieur du rebord blanc pour rester entièrement dans la photo."""
from PIL import Image, ImageFilter
import numpy as np

src = Image.open("public/media/original-plat.png").convert("RGB")
W, H = src.size
CX, CY, RX, RY_TOP, RY_BOT = 768, 515, 758, 502, 499
S = 3
yy, xx = np.mgrid[0:H * S, 0:W * S] / S
u = np.abs(xx - CX) / RX
v = (yy - CY) / np.where(yy < CY, RY_TOP, RY_BOT)
n = np.where(yy < CY, 3.0, 2.15)
inside = (u ** n + np.abs(v) ** n) <= 1
# contour réel du rebord, mesuré ligne par ligne (le plat sort du cadre en haut, à gauche et à droite)
from PIL import ImageDraw
from scipy import ndimage
L = [(446, 0), (440, 10), (414, 20), (400, 30), (360, 40), (334, 50), (315, 60), (241, 90), (201, 110), (130, 150), (65, 200), (18, 250),
     (0, 272), (0, 699), (40, 750), (93, 800), (159, 850), (240, 900), (353, 950), (498, 990), (557, 1000), (632, 1010), (768, 1018)]
R = [(1002, 0), (1047, 10), (1084, 20), (1118, 30), (1148, 40), (1176, 50), (1200, 60), (1223, 70), (1243, 80), (1263, 90), (1282, 100),
     (1299, 110), (1362, 150), (1426, 200), (1473, 250), (1510, 300), (1535, 340), (1535, 660), (1519, 700), (1480, 750), (1430, 800),
     (1359, 850), (1275, 900), (1161, 950), (1024, 990), (969, 1000), (903, 1010), (768, 1018)]
poly = L + list(reversed(R))
pm = Image.new("L", (W * S, H * S), 0); ImageDraw.Draw(pm).polygon([(x * S, y * S) for x, y in poly], fill=255)
real = ndimage.binary_erosion(np.asarray(pm) > 127, iterations=3 * S)
inside &= real
m = Image.fromarray((inside * 255).astype("uint8")).resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.0))
out = src.copy(); out.putalpha(m); out = out.crop(out.getbbox())
out.save("public/media/plat-detoure.png"); print("plat-detoure", out.size)
