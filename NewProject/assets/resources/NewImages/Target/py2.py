from PIL import Image
from PIL import ImageDraw
import os


def getFilesFromLocation(path):
    files = []
    for r, d, f in os.walk(path):
        for file in f:
            if '.png' in file and '.meta' not in file:
                files.append(file)
    return files


def add_corners(im, rad):
    circle = Image.new('L', (rad * 2, rad * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, rad * 2, rad * 2), fill=255)
    alpha = Image.new('L', im.size, 255)
    w, h = im.size
    alpha.paste(circle.crop((0, 0, rad, rad)), (0, 0))
    alpha.paste(circle.crop((0, rad, rad, rad * 2)), (0, h - rad))
    alpha.paste(circle.crop((rad, 0, rad * 2, rad)), (w - rad, 0))
    alpha.paste(circle.crop((rad, rad, rad * 2, rad * 2)), (w - rad, h - rad))
    im.putalpha(alpha)
    return im


def changeImg(imgLocation, radius):
    im = Image.open(imgLocation)
    im = add_corners(im, radius)
    im = im.resize((440, 613), Image.ANTIALIAS)
    im.save(imgLocation)


paths = ['D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Target\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Tapeworm\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Promo(Other)\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\chars\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\eternals\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\loot\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\monsters\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\treasure\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\chars\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\eternals\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\loot\\',
         'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\monsters\\',
         'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\treasure\\',
         'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\bonus\\',
         'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\chars\\',
         'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\loot\\',
         'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\eternals\\',
         'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\monsters\\',
         'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\treasure\\',
         'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\backs\\']

for path in paths:
    files = getFilesFromLocation(path)
    i = 1
    for fileName in files:
        print(fileName+' : '+str(i)+' from '+str(len(files)))
        changeImg(path+fileName, 100)
