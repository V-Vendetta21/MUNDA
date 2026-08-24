from PIL import Image
import os

ROOT = r'C:/Users/Student/Desktop/Final-Project'
LOGO = r'C:/Users/Student/AppData/Roaming/Hermes/composer-images/composer_2026-08-24_13-37-33-966_c16de7.png'
NEW  = r'C:/Users/Student/AppData/Roaming/Hermes/composer-images/composer_2026-08-24_13-43-40-358_ad3275.png'

# --- inspect new image ---
im = Image.open(NEW).convert('RGB')
print('NEW image:', im.size, 'mode', im.mode)
im2 = im.convert('L')
print('NEW bbox (non-uniform):', im.convert('L').getbbox())

# --- extract official logo -> white on transparent ---
lg = Image.open(LOGO).convert('L')
print('LOGO:', lg.size)
w, h = lg.size
src = lg.load()
out = Image.new('RGBA', (w, h), (0,0,0,0))
opx = out.load()
for y in range(h):
    for x in range(w):
        g = src[x, y]
        # white bg ~247, dark text ~34-60 -> map to white text, transparent bg
        a = int(255 - (g - 34) * 1.5)
        a = max(0, min(255, a))
        opx[x, y] = (255, 255, 255, a)
bbox = out.getbbox()
out = out.crop(bbox)
os.makedirs(ROOT + '/assets', exist_ok=True)
os.makedirs(ROOT + '/game/assets', exist_ok=True)
out.save(ROOT + '/assets/logo.png')
out.save(ROOT + '/game/assets/logo.png')
print('LOGO white-on-transparent:', out.size, 'bbox', bbox)
