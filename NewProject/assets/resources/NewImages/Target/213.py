import os

mezinim = []
allSites = {"0000"}
allSites.remove("0000")
with open("mezinim.txt", "r") as f:
    for x in f:
        mezinim.append(x)
        allSites.add(x)

print(mezinim)
mezinMuzanLines = []
with open("C:\\transmission.txt", "r") as f:
    for x in f:
        mezinMuzanLines.append(x)

for line in mezinMuzanLines:
    line.replace('\n', '')
    mezin = line[0:3]
    muzanimLine = line[8:len(line)-1]
    if mezin in mezinim:
        muzanim = muzanimLine.split(",")
        for x in muzanim:
            allSites.add(x)

print(x)
