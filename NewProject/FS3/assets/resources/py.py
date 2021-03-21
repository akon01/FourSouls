import json
import re
from os import walk


def changeIdsFinalToNoIds(isItemList, item, compList, keyword, valueToInsertTo):
    if isItemList:
        if len(item) <= 0:
            return []
        newCompIds = []
        for oldId in item:
            for comp in compList:
                if comp[0][keyword] == oldId:
                    newCompIds.append(comp[1])
                    break
        return list(map(
            lambda newId: {'__id__': newId}, newCompIds))
    else:
        for comp in compList:
            if item == -1:
                return None
            if comp[0][keyword] == item:
                return {
                    '__id__': comp[1]}
                break


componentsIdDescriptors = ['EffectId', 'DataCollectorId',
                           'CostId', 'PreConditionId', 'ConditionId', 'DataConcurrencyId']

url = "assets/resources/Prefabs/Complete Monster Cards/Krampus.prefab"


def updateFilePrefabToHoldComponents(url, i):
    file = open(url, "r", encoding="utf8")
    fileStr = file.read()
    fileObj = json.loads(fileStr)
    file.close()
    file = open(url, 'w', encoding="utf8")
    fileName = fileObj[1]['_name']
    print("Makeing "+str(i)+" "+fileName)
    effects = []
    dataCollectors = []
    costs = []
    preConditions = []
    conditions = []
    dataConcurrencys = []
    componentDict = {}
    for idx, compInfo in enumerate(fileObj):
        for idDescriptor in componentsIdDescriptors:
            if idDescriptor in compInfo:
                if 'Effect' in idDescriptor:
                    effects.append((compInfo, idx))
                elif 'DataCollector' in idDescriptor:
                    dataCollectors.append((compInfo, idx))
                elif 'Cost' in idDescriptor:
                    costs.append((compInfo, idx))
                elif 'DataConcurrency' in idDescriptor:
                    dataConcurrencys.append((compInfo, idx))
                elif 'PreCondition' in idDescriptor:
                    preConditions.append((compInfo, idx))
                elif 'Condition' in idDescriptor:
                    conditions.append((compInfo, idx))

    newFileObj = {}

    for compInfo in fileObj:
        for key, item in compInfo.items():
            isItemList = isinstance(item, list)
            if key.endswith('Final'):
                keyWithoutIdFinal = re.sub('Ids*Final', '', key)
                if keyWithoutIdFinal not in compInfo:
                    print('No Key:'+keyWithoutIdFinal+' found in '+fileName)
                if keyWithoutIdFinal in compInfo:
                    valueToInsertTo = compInfo[keyWithoutIdFinal]
                    # if 'Collector' in keyWithoutIdFinal:
                    #     compInfo[keyWithoutIdFinal] = changeIdsFinalToNoIds(
                    #         isItemList, item, dataCollectors, "DataCollectorId", valueToInsertTo)
                    if 'effectsTo' in keyWithoutIdFinal:
                        compInfo[keyWithoutIdFinal] = changeIdsFinalToNoIds(
                            isItemList, item, effects, "EffectId", valueToInsertTo)
                    # elif 'cost' in keyWithoutIdFinal:
                    #     compInfo[keyWithoutIdFinal] = changeIdsFinalToNoIds(
                    #         isItemList, item, costs, "CostId", valueToInsertTo)
                    # elif 'dataConcurrency' in keyWithoutIdFinal:
                    #     compInfo[keyWithoutIdFinal] = changeIdsFinalToNoIds(
                    #         isItemList, item, dataConcurrencys, "DataConcurrencyId", valueToInsertTo)
                    # elif 'preCondition' in keyWithoutIdFinal:
                    #     compInfo[keyWithoutIdFinal] = changeIdsFinalToNoIds(
                    #         isItemList, item, preConditions, "PreConditionId", valueToInsertTo)
                    # elif 'condition' in keyWithoutIdFinal:
                    #     compInfo[keyWithoutIdFinal] = changeIdsFinalToNoIds(
                    #         isItemList, item, conditions, "ConditionId", valueToInsertTo)
    file.write(json.dumps(fileObj))


f = []
for (dirpath, dirnames, filenames) in walk("C:/Users/sagi.ofir/FS3/assets/resources/Prefabs"):
    for fileName in filenames:
        if ".meta" not in fileName:
            f.append(dirpath+"/"+fileName)

print("found "+str(len(f)) + 'files')
i = 0
for foundFile in f:
    updateFilePrefabToHoldComponents(foundFile, i)

    i = i+1

# updateFilePrefabToHoldComponents(url, 1)
