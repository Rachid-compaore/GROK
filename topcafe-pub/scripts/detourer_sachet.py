from PIL import Image, ImageFilter
import numpy as np, sys
from scipy import ndimage
src=Image.open(sys.argv[1]).convert('RGB')
a=np.asarray(src).astype(int); H,W=a.shape[:2]
lum=a.mean(2); sat=a.max(2)-a.min(2)
cream=ndimage.binary_closing((lum>150)&(sat<75),iterations=2)
lab,n=ndimage.label(cream); s=ndimage.sum(cream,lab,range(1,n+1)); m=lab==(np.argmax(s)+1)
m=ndimage.binary_opening(ndimage.binary_fill_holes(m),iterations=2)
L=np.full(H,W);R=np.full(H,-1)
for y in range(H):
    xs=np.where(m[y])[0]
    if len(xs): L[y]=xs.min();R[y]=xs.max()
k=200;Rf=R.copy();Lf=L.copy()
for y in range(H):
    Rf[y]=max(R[y],min(R[max(0,y-k):y+1].max(),R[y:y+k].max()))
    Lf[y]=min(L[y],max(L[max(0,y-k):y+1].min(),L[y:y+k].min()))
xx=np.arange(W)[None,:]
rows=np.zeros(H,bool);rows[70:1285]=True
m2=m|(((xx>=Lf[:,None])&(xx<=Rf[:,None]))&rows[:,None])
alpha=Image.fromarray((m2*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.0))
out=src.copy();out.putalpha(alpha);out=out.crop(out.getbbox());out.save('sachet2.png');print(out.size)
p=Image.new('RGB',out.size,(30,170,80));p.paste(out,(0,0),out);p.resize((out.width//2,out.height//2)).save('prev2.png')
