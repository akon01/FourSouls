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

type allPropsType = {
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
    isUsingFinal: boolean,
    ReloadData: (isUsingFinal: boolean) => void
}

type propType = {
    allProps: allPropsType,
    keyWordProp: string
    setSingle: (signalToSet: IdNameAndCompType, key: string) => void,
    single: IdNameAndCompType | undefined,
    saveChange: (IdAndNameCompToUpdate: IdNameAndCompType, key: string, doNotReload?: boolean) => void,
    IdNameCompTuple: IdNameAndCompType
}




export function EffectCompSingle({
    allProps,
    keyWordProp,
    setSingle,
    single,
    saveChange,
    IdNameCompTuple
}: propType) {
    const { EffectView } = allProps.requires



    const [currentEffectComp, setCurrentEffectComp]: [IdNameAndCompType, (a: IdNameAndCompType) => void] = React.useState(single)
    const [selectedOption, setSelectedOption]: [number, (s: number) => void] = React.useState(-1)
    const [isEffectComponentSet, setIsEffectComponentSet]: [boolean, (a: boolean) => void] = React.useState(single != undefined && single.comp != null)

    React.useEffect(() => {
        if (single == undefined || single.comp == null) {
            setIsEffectComponentSet(false)
        } else {
            setCurrentEffectComp(single)
            setIsEffectComponentSet(true)
        }
    }, [single])

    const [options, setOptions]: [{
        name: string;
        value: IdNameAndCompType;
    }[], (a: {
        name: string;
        value: IdNameAndCompType;
    }[]) => void] = React.useState([])
    const [keyWord, setKeyWord]: [string, (s: string) => void] = React.useState("")

    const getOptions = () => {
        var availableOptions: { name: string, value: IdNameAndCompType }[] = []
        let word = ""
        if (keyWordProp.match(/[cC]ost/g)) {
            availableOptions = allProps.costs.map(cost => {
                return {
                    name: cost.name + " " + cost.id,
                    value: cost
                }
            })
            word = "Costs"
        } else
            if (keyWordProp.match(/[pP]re[Cc]ondition/g)) {
                availableOptions = allProps.preConditions.map(collector => {
                    return {
                        name: collector.name + " " + collector.id,
                        value: collector
                    }
                })
                word = "PreConditions"
            } else
                if (keyWordProp.match(/[Cc]ondition/g)) {
                    availableOptions = allProps.conditions.map(cond => {
                        return {
                            name: cond.name + " " + cond.id,
                            value: cond
                        }
                    })
                    word = "Conditions"
                } else
                    if (keyWordProp.match(/[cC]ollector/g) || keyWordProp.match(/[cC]hooseCard/g)) {
                        availableOptions = allProps.dataCollectors.map(collector => {
                            return {
                                name: collector.name + " " + collector.id,
                                value: collector
                            }
                        })
                        word = "Data Collectors"
                    } else
                        if (keyWordProp.match(/[dD]ata[cC]oncurency[Cc]omponent/g)) {
                            availableOptions = allProps.dataConcurencies.map(collector => {
                                return {
                                    name: collector.name + " " + collector.id,
                                    value: collector
                                }
                            })
                            word = "Data Concurencies"
                        } else
                            if (keyWordProp.match(/[Ee]ffect/g)) {
                                availableOptions = allProps.availavleEffects.map(effect => {
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

    const getCompByIdAndName = (id: number, name: string): IdNameAndCompType | null => {
        const toCheckArr = [...allProps.availavleEffects, ...allProps.conditions, ...allProps.costs, ...allProps.dataCollectors, ...allProps.dataConcurencies, ...allProps.preConditions]
        var toreturn = toCheckArr.find(toCheck => toCheck.id == id && toCheck.name == name)
        if (toreturn == null) {
            return null
        }
        return getLowestComp(toreturn)
    }


    const convertFromidAndNameTypeValuePairToIdNameAndCompType = (orig: idAndNameTypeValuePair): IdNameAndCompType => {
        if (orig.type == "Object" && orig.value == null) {
            return {
                id: -1, name: "", comp: null
            }
        }
        const converted = {
            id: (orig.value as IdNameValuePair).id.value,
            name: (orig.value as IdNameValuePair).name.value,
            comp: getCompByIdAndName((orig.value as IdNameValuePair).id.value, (orig.value as IdNameValuePair).name.value)
        }

        return converted
    }

    const getLowestComp = (start) => {
        if (start['comp'] != undefined) {
            return getLowestComp(start['comp'])
        }
        return start
    }

    const notIntrestingCompValues = ['_name', 'uuid', 'cost', 'conditions', 'dataConcurencyComponent', '_effectCard', 'preCondition', 'passiveEffectToAdd', 'dataCollector', '_objFlags', 'node', '__scriptAsset', '_enabled', 'enabled', 'enabledInHierarchy', '_isOnLoadCalled', '_id']
    const getEffectProperties = (effect: IdNameAndCompType) => {

        const values: { key: string, type: string, inValue: idAndNameTypeValuePair | null | typeValuePair<string> }[] = []
        const hasIdInName = (valueName) => {
            if (allProps.isUsingFinal) {
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
                if (value.type == 'IdAndName' || key == "name" || hasIdInName(key) && value.type == 'Object') {
                    values.push({
                        key,
                        type: value.type,
                        inValue: value.value
                    })
                }
            }
        }
        return values
    }




    const removeMe = () => {
        const compToRunOn = getLowestComp(IdNameCompTuple.comp)
        compToRunOn[keyWordProp] = { type: "Integer", value: -1 }
        saveChange(IdNameCompTuple, keyWordProp)
    }


    React.useEffect(() => {
        const { availableOptions, word } = getOptions()
        setOptions(availableOptions)
        if (availableOptions.length > 0) {
            setSelectedOption(0)
        }
        setKeyWord(word)
    }, [keyWordProp])



    const getSelectedEffect = (): IdNameAndCompType | null => {

        if (selectedOption != -1) {
            return options.find(opt => opt.value.id == selectedOption)?.value
        } else {
            return null
        }
    }


    const [selectedOptionEffect, setSelectedOptionEffect]: [IdNameAndCompType, (a: IdNameAndCompType) => void] = React.useState()

    React.useEffect(() => {
        if (selectedOption > -1) {
            const selectedEffect = getSelectedEffect()
            setSelectedOptionEffect(selectedEffect)
        }
    }, [selectedOption])

    if (isEffectComponentSet && currentEffectComp == null) {
        debugger
    }


    const selectedEffectCompView = (
        <div>
            {/* @ts-ignore */}
            <ui-button onClick={removeMe}>Remove Me</ui-button>
            <EffectView saveChange={saveChange} allProps={allProps} effect={currentEffectComp}></EffectView>
        </div>
    )

    const selectOption = () => {
        debugger
        const selected = getSelectedEffect()
        const compToRunOn = getLowestComp(IdNameCompTuple.comp)
        if (!allProps.isUsingFinal) {
            compToRunOn[keyWordProp] = {
                type: "IdAndName",
                value: {
                    id: { type: "Integer", value: selected.id },
                    name: { value: selected.name, type: "String" }
                }
            };
        } else {
            compToRunOn[keyWordProp] = { type: "Integer", value: selected.id }
        }

        saveChange(IdNameCompTuple, keyWordProp)
        //  setSetEffect(selected)

    }



    const hasOptionToSelect = (
        <div>
            <p>
                <div> Available {keyWord} on Card:</div>
                {/* @ts-ignore */}
                <ui-button onClick={selectOption}>Set {(selectedOption != -1) ? selectedOptionEffect?.name ?? "no selected effect" : `nothing`}</ui-button>
                {/* @ts-ignore */}
                <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                    {(options != undefined && options.length > 0) ? options.map((option, idx) => {
                        return <option value={option.value.id} >{option.name}</option>
                    }) : <option value={-1}>no options</option>}
                    {/* @ts-ignore */}
                </select>
            </p>
        </div>
    )

    if (options.length > 0) {
    }

    const noOptionsAvailable = <h4>No Avaialble {keyWord} on Card </h4>

    const nonSelectedView = (
        <div>
            <div style={{ color: "red" }}>No {keyWord} Set</div>
            {(options.length > 0) ? hasOptionToSelect : noOptionsAvailable}
        </div>
    )

    return (
        <div>
            { (isEffectComponentSet) ? selectedEffectCompView : nonSelectedView}
        </div>
    )
}
