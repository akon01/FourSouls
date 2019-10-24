import os
import shutil

search = '"hasEffect": false,'
dirList = os.listdir()
path = os.path.dirname(os.path.abspath(__file__))
print(path)
x = list()
for name in dirList:
    if not str(name).endswith(".meta"):
        x.append(name)
y = list()
for fileName in x:
    with open(fileName, 'r') as file:
        fileData = file.read()
       # print(fileData)
        ans = str(fileData).find(search)
        # print(ans)
        if ans != -1:
            y.append(fileName)

print(y)
for monster in y:
    src = "D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\Prefabs\\MonsterCards\\" + monster
    print(src)
    dest = "D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\Prefabs\\Complete Monster Cards"
    shutil.copy(src, dest)
# print(x)
