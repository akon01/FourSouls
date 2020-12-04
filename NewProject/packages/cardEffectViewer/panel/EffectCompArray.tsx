import React from 'C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/react/index'

type IdNameValuePair = {
    id: typeValuePair<number>
    name: typeValuePair<string>
}

type idAndNameTypeValuePair = {
    type: string,
    value: IdNameValuePair | typeValuePair<IdNameValuePair>[]
}

type typeValuePair<T extends unknown> = {
    type: string,
    value: T
}

type cardEffectCompType = {
    type: string,
    value: {
        activeEffectsIds: idAndNameTypeValuePair,
        activeEffectsIdsFinal: typeValuePair<number[]>,
        cardPlayerId: typeValuePair<number>,
        concurentEffectData: typeValuePair<Object>,
        data: typeValuePair<Object>,
        effectData: typeValuePair<Object>,
        enabled: typeValuePair<boolean>
        enabledInHierarchy: typeValuePair<boolean>
        hasDestroySelfEffect: typeValuePair<boolean>
        _name: typeValuePair<string>
        _objFlags: typeValuePair<number>
        node: typeValuePair<{ name: string, uuid: string }>
        name: typeValuePair<string>
        uuid: typeValuePair<string>
        __scriptAsset: typeValuePair<{ uuid: string }>
        _enabled: typeValuePair<boolean>
        _isOnLoadCalled: typeValuePair<number>
        passiveEffectsIds: idAndNameTypeValuePair
        passiveEffectsIdsFinal: typeValuePair<number[]>,
        toAddPassiveEffectsIds: idAndNameTypeValuePair
        toAddPassiveEffectsIdsFinal: typeValuePair<number[]>,
        paidEffectsIds: idAndNameTypeValuePair
        hasMultipleEffects: typeValuePair<boolean>
        multiEffectCollectorId: idAndNameTypeValuePair
        multiEffectCollectorIdFinal: typeValuePair<number[]>,
        serverEffectStack: { value: any[] }
        _id: typeValuePair<string>
    }
}

type IdNameAndCompType = {
    id: number,
    name: string,
    comp: any
}

type allPropType = {
    cardEffectComp: cardEffectCompType,
    nodeId: string,
    selectedCardNode: { types: any, value: any },
    activeEffects: IdNameAndCompType[],
    passiveEffects: IdNameAndCompType[],
    toAddPassiveEffects: IdNameAndCompType[],
    paidEffects: IdNameAndCompType[],
    preConditions: IdNameAndCompType[],
    conditions: IdNameAndCompType[],
    dataCollectors: IdNameAndCompType[],
    costs: IdNameAndCompType[],
    dataConcurencies: IdNameAndCompType[],
    availavleEffects: IdNameAndCompType[],
    requires: { EffectView: any, EffectCompSingle: any, EffectCompArray: any },
    isUsingFinal: boolean
}

type propType = {
    allProps: allPropType,
    keyWordProp: string,
    updateAllProps: (keyword: string, arrayToSet: IdNameAndCompType[]) => void
    array: idAndNameTypeValuePair[],
    ///inside IdAndNameCompToUpdate - .comp needs to be updated with new values
    saveChange: (IdAndNameCompToUpdate: IdNameAndCompType, key: string) => void,
    IdNameCompTuple: IdNameAndCompType
}

const notIntrestingCompValues = ['_name', 'uuid', 'cost', 'conditions', 'dataConcurencyComponent', '_effectCard', 'preCondition', 'passiveEffectToAdd', 'dataCollector', '_objFlags', 'node', '__scriptAsset', '_enabled', 'enabled', 'enabledInHierarchy', '_isOnLoadCalled', '_id']

export function EffectCompArray({ allProps, keyWordProp, updateAllProps, array, saveChange, IdNameCompTuple }: propType) {

    const [allProp, setAllProp]: [allPropType, (a: allPropType) => void] = React.useState(allProps)

    React.useEffect(() => {
        setAllProp(allProps)
    }, [allProps])

    const getCompByIdAndName = (id: number, name: string): IdNameAndCompType | null => {
        const toCheckArr = [...allProp.availavleEffects, ...allProp.conditions, ...allProp.costs, ...allProp.dataCollectors, ...allProp.dataConcurencies, ...allProp.preConditions]
        return toCheckArr.find(toCheck => toCheck.id == id && toCheck.name == name)
    }

    const { EffectView } = allProps.requires

    const [options, setOptions]: [{
        name: string;
        value: IdNameAndCompType;
    }[], (a: {
        name: string;
        value: IdNameAndCompType;
    }[]) => void] = React.useState([])
    const [keyWord, setKeyWord]: [string, (s: string) => void] = React.useState("")


    const getOptions = () => {
        //@ts-ignore
        var availableOptions: { name: string, value: IdNameAndCompType }[] = []
        let word = ""
        if (keyWordProp.match(/[cC]ost/g)) {
            availableOptions = allProp.costs.map(cost => {
                return {
                    name: cost.name + " " + cost.id,
                    value: cost
                }
            })
            word = "Costs"
        }
        if (keyWordProp.match(/[pP]re[Cc]ondition/g)) {
            availableOptions = allProp.preConditions.map(collector => {
                return {
                    name: collector.name + " " + collector.id,
                    value: collector
                }
            })
            word = "PreConditions"
        } else
            if (keyWordProp.match(/[Cc]ondition/g)) {
                availableOptions = allProp.conditions.map(cond => {
                    return {
                        name: cond.name + " " + cond.id,
                        value: cond
                    }
                })
                word = "Conditions"
            }
        if (keyWordProp.match(/[cC]ollector/g)) {
            availableOptions = allProp.dataCollectors.map(collector => {
                return {
                    name: collector.name + " " + collector.id,
                    value: collector
                }
            })
            word = "Data Collectors"
        }
        if (keyWordProp.match(/[dD]ata[cC]oncurency[Cc]omponent/g)) {
            availableOptions = allProp.dataConcurencies.map(collector => {
                return {
                    name: collector.name + " " + collector.id,
                    value: collector
                }
            })
            word = "Data Concurencies"
        }
        if (keyWordProp.match(/[Ee]ffect/g)) {
            availableOptions = allProp.availavleEffects.map(effect => {
                return {
                    name: effect.name + " " + effect.id,
                    value: effect
                }
            })
            word = "Effects"
        }
        if (word == "") {
            word = "No Found For WordProp :" + keyWordProp
        }
        return { availableOptions, word }
    }

    const getLowestComp = (start) => {
        if (start['comp'] != undefined) {
            return getLowestComp(start['comp'])
        }
        return start
    }


    const getEffectProperties = (effect: IdNameAndCompType) => {

        const values: { key: string, type: string, inValue: idAndNameTypeValuePair | null | typeValuePair<string> }[] = []
        const hasIdInName = (valueName) => {
            if (allProp.isUsingFinal) {
                return /IdFinal$/g.test(valueName) || /IdsFinal$/g.test(valueName)
            } else {
                return /Id$/g.test(valueName) || /Ids$/g.test(valueName)
            }
        }
        if (effect != undefined) {
        } else {
            return []
        }

        const compToRunOn = getLowestComp(effect.comp)
        for (const key in compToRunOn) {
            if (compToRunOn.hasOwnProperty(key) && !notIntrestingCompValues.includes(key)) {
                const value = compToRunOn[key];
                if (value.type == 'IdAndName' || key == "name" || hasIdInName(key) && value.type == 'Object' && value.value == null) {
                    values.push({
                        key,
                        type: value.type,
                        inValue: value.value
                    })
                }
            }
        }
        //@ts-ignore
        return values
    }

    const [effectCompProperties, setEffectCompProperties]: [{
        key: string;
        type: string;
        inValue: idAndNameTypeValuePair | null | typeValuePair<string>;
    }[], (a: {
        key: string;
        type: string;
        inValue: idAndNameTypeValuePair | null | typeValuePair<string>;
    }[]
        ) => void] = React.useState(getEffectProperties(IdNameCompTuple))

    React.useEffect(() => {
        const { availableOptions, word } = getOptions()
        setOptions(availableOptions)
        if (availableOptions.length > 0) {
            setSelectedOptionIndex(0)
        }
        setKeyWord(word)
    }, [keyWordProp])

    const [selectedOptionIndex, setSelectedOptionIndex] = React.useState(-1)

    const getSelectedOption = (): {
        name: string;
        value: IdNameAndCompType;
    } | null => {
        if (selectedOptionIndex != -1) {
            return options[selectedOptionIndex]
        } else {
            return null
        }
    }

    const selectedOption = getSelectedOption()


    const clickToAddToArray = () => {
        // let newArr:IdNameAndCompType[] = []
        // Object.assign(newArr,array)
        // newArr.push(selectedOption.value)
        // updateAllProps(keyWordProp, newArr)
        debugger
        const compToRunOn = getLowestComp(IdNameCompTuple.comp)
        if (!allProp.isUsingFinal) {
            const newArr = compToRunOn[keyWordProp] as idAndNameTypeValuePair
            const newValue = {
                type: "IdAndName",
                value: {
                    id: { type: "Integer", value: selectedOption.value.id },
                    name: { value: selectedOption.name, type: "String" }
                }
            };
            (newArr.value as typeValuePair<IdNameValuePair>[]).push(newValue)
            array.push(newArr)
            compToRunOn[keyWordProp] = newArr
        } else {
            const newArr = compToRunOn[keyWordProp] as typeValuePair<typeValuePair<number>[]>
            newArr.value.push({ type: "Integer", value: selectedOption.value.id })
            compToRunOn[keyWordProp] = newArr
        }

        saveChange(IdNameCompTuple, keyWordProp)
    }

    const handleSetArray = (keyword: string, arrayToSet: IdNameAndCompType[]) => {
        updateAllProps(keyword, arrayToSet)
    }

    const convertFromidAndNameTypeValuePairToIdNameAndCompType = (orig: idAndNameTypeValuePair): IdNameAndCompType => {
        const converted = {
            id: (orig.value as IdNameValuePair).id.value,
            name: (orig.value as IdNameValuePair).name.value,
            comp: getCompByIdAndName((orig.value as IdNameValuePair).id.value, (orig.value as IdNameValuePair).name.value)
        }

        return converted
    }

    const addName = (selectedOption != null) ? selectedOption.name : "Nothing"

    const withOptions = <div>
        <p>Available {keyWord} on Card:
            <select value={selectedOptionIndex} onChange={(e) => setSelectedOptionIndex(e.target.value)}>
                {options.map((option, idx) => {
                    return <option value={idx}>{option.name}</option>
                })}
            </select>
            {/*@ts-ignore*/}
            <ui-button onClick={clickToAddToArray}>+ {addName}</ui-button>
        </p>
    </div>

    const withoutOptions = <div>
        <p>No Avaialble {keyWord} on Card </p>
    </div>

    const removeMe = (effectToRemove: idAndNameTypeValuePair) => {
        const compToRunOn = getLowestComp(IdNameCompTuple.comp)
        if (!allProp.isUsingFinal) {
            const newArr = compToRunOn[keyWordProp] as idAndNameTypeValuePair
            const newValue = {
                type: "IdAndName",
                value: {
                    id: { type: "Integer", value: selectedOption.value.id },
                    name: { value: selectedOption.name, type: "String" }
                }
            };
            newArr.value = (newArr.value as typeValuePair<IdNameValuePair>[]).filter(val => val.value.id.value != (effectToRemove.value as IdNameValuePair).id.value)
            compToRunOn[keyWordProp] = newArr
        } else {
            const newArr = compToRunOn[keyWordProp] as typeValuePair<typeValuePair<number>[]>
            newArr.value = newArr.value.filter(val => val.value == selectedOption.value.id)
            compToRunOn[keyWordProp] = newArr
        }

        saveChange(IdNameCompTuple, keyWordProp)
    }


    return <p>
        {(options.length > 0) ? withOptions : withoutOptions}
        {array.map((effect, idx) => <div>
            {/* @ts-ignore */}
            <ui-button onClick={() => removeMe(effect)}>Remove Me</ui-button>
            <EffectView saveChange={saveChange} setArray={handleSetArray} allProps={allProp} key={idx} effect={effect} />
        </div>)}
        {(array.length == 0) && <div style={{ color: "red" }}>0 {keyWord} Set</div>}
    </p>
}
