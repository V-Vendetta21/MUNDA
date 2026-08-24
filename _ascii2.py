from PIL import Image

def ascii_render(path, width, title, invert=False):
    im = Image.open(path).convert('L')
    w, h = im.size
    H = max(1, int(h / w * width * 0.5))
    im = im.resize((width, H))
    px = list(im.getdata())
    print('=== ' + title + ' (' + str(w) + 'x' + str(h) + ') ===')
    # ramp: bright -> dense. ' ' for darkest
    ramp = " .:-=+*#%@"
    for y in range(H):
        row = ''
        for x in range(width):
            v = px[y * width + x]
            if invert:
                v = 255 - v
            if v < 12:
                c = ' '
            else:
                idx = int((v - 12) / 243 * 9)
                idx = max(0, min(9, idx))
                c = ramp[9 - idx] if not invert else ramp[idx]
            row += c
        print(row)
    print()

ascii_render(r'C:/Users/Student/AppData/Roaming/Hermes/composer-images/composer_2026-08-24_13-37-33-966_c16de7.png', 80, 'OFFICIAL LOGO (bright=text)')
ascii_render(r'C:/Users/Student/AppData/Roaming/Hermes/composer-images/composer_2026-08-24_13-40-49-078_1e63f5.png', 150, 'IMAGE2')
