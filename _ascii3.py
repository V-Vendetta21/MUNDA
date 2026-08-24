from PIL import Image

def ascii_render(path, width, title, y0=0.0, y1=1.0):
    im = Image.open(path).convert('L')
    w, h = im.size
    im = im.crop((0, int(h*y0), w, int(h*y1)))
    ch = im.size[1]
    H = max(1, int(ch / w * width * 0.45))
    im = im.resize((width, H))
    px = list(im.getdata())
    print('=== ' + title + ' ===')
    ramp = " .:-=+*#%@"
    for y in range(H):
        row = ''
        for x in range(width):
            v = px[y * width + x]
            if v < 12: c = ' '
            else:
                idx = max(0, min(9, int((v-12)/243*9)))
                c = ramp[9-idx]
            row += c
        print(row)
    print()

# full image, higher detail
ascii_render(r'C:/Users/Student/AppData/Roaming/Hermes/composer-images/composer_2026-08-24_13-40-49-078_1e63f5.png', 200, 'IMAGE2 FULL')
