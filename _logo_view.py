from PIL import Image
# render extracted white-on-transparent logo: show alpha (text) as chars
im = Image.open(r'C:/Users/Student/Desktop/Final-Project/assets/logo.png')
print('logo size', im.size)
a = im.getchannel('A')
w, h = a.size
W = 90
H = max(1, int(h / w * W * 0.5))
a = a.resize((W, H))
px = list(a.getdata())
ramp = " .:-=+*#%@"
for y in range(H):
    row = ''
    for x in range(W):
        v = px[y*W+x]  # alpha 0=transparent, 255=text
        if v < 20: c = ' '
        else: c = ramp[min(9, int((v-20)/235*9))]
        row += c
    print(row)
