from PIL import Image
import os

ROOT = r'C:/Users/Student/Desktop/Final-Project'
LOGO = r'C:/Users/Student/AppData/Roaming/Hermes/composer-images/composer_2026-08-24_13-37-33-966_c16de7.png'
NEW  = r'C:/Users/Student/AppData/Roaming/Hermes/composer-images/composer_2026-08-24_13-43-40-358_ad3275.png'

# --- logo: tight crop, alpha > 30 ---
lg = Image.open(LOGO).convert('L')
w, h = lg.size
src = lg.load()
out = Image.new('RGBA', (w, h), (0,0,0,0))
opx = out.load()
for y in range(h):
    for x in range(w):
        g = src[x, y]
        a = int(255 - (g - 34) * 1.5)
        opx[x, y] = (255,255,255, max(0, min(255, a)))
# tight bbox using threshold
a = out.getchannel('A')
aW, aH = a.size
amin_x, amin_y, amax_x, amax_y = aW, aH, 0, 0
for y in range(aH):
    for x in range(aW):
        if a.getpixel((x,y)) > 30:
            amin_x = min(amin_x, x); amax_x = max(amax_x, x)
            amin_y = min(amin_y, y); amax_y = max(amax_y, y)
print('tight bbox:', (amin_x, amin_y, amax_x, amax_y), 'size', (amax_x-amin_x+1, amax_y-amin_y+1))
out = out.crop((amin_x, amin_y, amax_x+1, amax_y+1))
out.save(ROOT + '/assets/logo.png')
out.save(ROOT + '/game/assets/logo.png')
print('final logo:', out.size)

# --- banner: inspect + save monochrome-ish ---
b = Image.open(NEW).convert('RGB')
print('banner:', b.size)
b.save(ROOT + '/assets/banner.jpg', quality=85, optimize=True, progressive=True)
print('saved banner')
