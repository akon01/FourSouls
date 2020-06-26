import os
import json


def getMetaFilesFromLocation(path):
    files = []
    for r, d, f in os.walk(path):
        for file in f:
            if '.meta' in file and '.py' not in file and '.png' in file:
                files.append(file)
    return files


def getPrefabFilesFromLocation(path):
    files = []
    for r, d, f in os.walk(path):
        for file in f:
            if '.prefab' in file and '.meta' not in file:
                files.append(file)
    return files


def getImgUuidFromName(fileName, imgMetaJsonDict):
    capFileName = str.replace(fileName, ' ', '').replace(
        '.prefab', '').capitalize()
    for img in imgMetaJsonDict:
        imgCapName = str.replace(img['name'], ' ', '').replace(
            '.png.meta', '').capitalize()
        if(imgCapName == capFileName):
            sub = img['file'].get('subMetas')
            subMeta = sub.get(
                img['name'].replace('.png.meta', ''))
            return subMeta.get('uuid')
    raise Exception('No Img Was Found for file Name '+fileName)


def changeFile(path, fileName, imgMetaJsonDict):
    with open(path+fileName) as f:
        prefab = json.load(f)
    for component in prefab:
        if(component.get('__type__', 'false') == 'cc.Sprite'):
            spriteComp = component
            break
    matProp = spriteComp.get('_spriteFrame')
    uuid = matProp.get('__uuid__')
    try:
        newUuid = str(getImgUuidFromName(
            fileName, imgMetaJsonDict))
    except Exception as x:
        raise x
    matProp['__uuid__'] = matProp['__uuid__'].replace(
        str(matProp['__uuid__']), newUuid)
    spriteComp['_atlas'] = None

    with open(path+fileName, 'w') as f:
        json.dump(prefab, f)


imgPaths = ['D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Target\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Tapeworm\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Promo(Other)\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\chars\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\eternals\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\loot\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\monsters\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\KickStarter\\treasure\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\chars\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\eternals\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\loot\\',
            'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\monsters\\',
            'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\Four Souls+\\treasure\\',
            'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\bonus\\',
            'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\chars\\',
            'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\loot\\',
            'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\eternals\\',
            'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\monsters\\',
            'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\base\\treasure\\',
            'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\NewImages\\backs\\']

imgMetaJson = []
for path in imgPaths:
    print('get img meta files from '+path)
    imgMetaFiles = getMetaFilesFromLocation(path)
    for imgMeta in imgMetaFiles:
        with open(path+imgMeta) as f:
            imgMetaJson.append({"name": imgMeta, "file": json.load(f)})


prefabsPaths = [
    'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\Prefabs\\CharacterCards\\CharItemCards\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\Prefabs\\Complete Monster Cards\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\Prefabs\\LootCards\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\Prefabs\\MonsterCards\\', 'D:\\Coding\\CocosProjects\\NewProject\\assets\\resources\\Prefabs\\TreasureCards\\']

nonSuccseful = []
for path in prefabsPaths:
    cardsPrefabs = getPrefabFilesFromLocation(path)
    i = 1
    for prefab in cardsPrefabs:
        print('Changing File '+prefab+' ' + str(i)+' From ' +
              str(len(cardsPrefabs))+' In '+path)
        try:
            changeFile(path, prefab, imgMetaJson)
            i += 1
        except Exception as e:
            nonSuccseful.append(prefab)


print('non sucssesfull:')
print(nonSuccseful)


