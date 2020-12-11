import React from 'C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/react/index'
const thisUrl = 'C:/Users/sagi.ofir/Documents/FourSouls/NewProject/packages/cardEffectViewer/panel'


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
    isUsingFinal: boolean,
    ReloadData: (isUsingFinal: boolean) => void
}

type propsType = {
    allProps: allPropType,
    effect: IdNameAndCompType,
    setArray: (keyword: string, arrayToSet: IdNameAndCompType[]) => void,
    saveChange: (IdAndNameCompToUpdate: IdNameAndCompType, key: string, doNotReload?: boolean) => void,
}


function CheckBoxView({ isChecked, saveChange, IdNameCompTuple, keyWordProp, allProps }) {
    const [checked, setChecked] = React.useState(isChecked)

    React.useEffect(() => {
        setChecked(isChecked)
    }, [isChecked])

    const handleSetChecked = () => {
        //@ts-ignore
        Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
            id: (IdNameCompTuple as IdNameAndCompType).comp.uuid.value,
            path: keyWordProp,
            type: "Boolean",
            //   value: newVal,
            value: !checked,
            isSubProp: false,
        });
        allProps.ReloadData(allProps.isUsingFinal)
    }

    return (
        <div>
            {/* @ts-ignore */}
            <input type="checkbox" checked={checked} onClick={handleSetChecked}></input>
        </div>
    )
}

const notIntrestingCompValues = ['_name', 'uuid', 'cost', 'conditions', 'dataConcurencyComponent', '_effectCard', 'preCondition', 'passiveEffectToAdd', 'dataCollector', '_objFlags', 'node', '__scriptAsset', '_enabled', 'enabled', 'enabledInHierarchy', '_isOnLoadCalled', '_id']

export function EffectView({ allProps, effect, setArray, saveChange }: propsType) {

    const [expanded, setExpanded] = React.useState(false)
    const { EffectCompArray, EffectCompSingle } = allProps.requires

    const removeCardName = (name: string) => {
        const cardName = allProps.cardEffectComp.value.node.value.name
        const regex = new RegExp(`${cardName}\<([\\s\\S]+?)\>`)
        return name.replace(regex, "$1")
    }

    const getLowestComp = (start) => {
        if (start['comp'] != undefined) {
            return getLowestComp(start['comp'])
        }
        return start
    }

    enum compTypes {
        EffectCompArray, EffectCompSingle, Boolean,
    }

    type bigType = {
        key: string,
        compDesc: IdNameAndCompType | IdNameAndCompType[],
        type: compTypes
    }

    const getCompByIdAndName = (id: number, key: string): IdNameAndCompType | null => {

        const toCheckArr = [...allProps.availavleEffects, ...allProps.conditions, ...allProps.costs, ...allProps.dataCollectors, ...allProps.dataConcurencies, ...allProps.preConditions]
        var toreturn = toCheckArr.find(toCheck => toCheck.id == id && key.toLowerCase().includes(toCheck.name.toLowerCase()))
        if (toreturn == null) {
            if (id != -1) {
                debugger
            }
            return null
        }
        return getLowestComp(toreturn)
    }


    const convertFromidAndNameTypeValuePairToIdNameAndCompType = (orig: idAndNameTypeValuePair): IdNameAndCompType => {
        try {
            const converted = {
                id: (orig.value as IdNameValuePair).id.value,
                name: removeCardName((orig.value as IdNameValuePair).name.value),
                comp: getCompByIdAndName((orig.value as IdNameValuePair).id.value, (orig.value as IdNameValuePair).name.value)
            }
            return converted
        } catch (error) {
            return null
        }
    }

    const getCompByIdAndKey = (id: number, key: string) => {
        var arr: IdNameAndCompType[] = []
        if (key.match(/[cC]ost/g)) {
            arr = allProps.costs
        } else
            if (key.match(/[pP]re[Cc]ondition/g)) {
                arr = allProps.preConditions
            } else
                if (key.match(/[Cc]ondition/g)) {
                    arr = allProps.conditions
                } else
                    if (key.match(/[cC]ollector/g) || key.match(/[cC]hooseCard/g)) {
                        arr = allProps.dataCollectors
                    } else
                        if (key.match(/[dD]ata[cC]oncurency[Cc]omponent/g)) {
                            arr = allProps.dataConcurencies
                        } else
                            if (key.match(/[Ee]ffect/g)) {
                                arr = allProps.availavleEffects
                            }
        /// const toCheckArr = [...allProps.availavleEffects, ...allProps.conditions, ...allProps.costs, ...allProps.dataCollectors, ...allProps.dataConcurencies, ...allProps.preConditions]
        var toreturn = arr.find(toCheck => toCheck.id == id)
        if (toreturn == null) {
            return null
        }
        return getLowestComp(toreturn)
    }

    const getEffectProperties = (effect: IdNameAndCompType) => {
        const values: bigType[] = []
        //  const values: { key: string, type: string, inValue: idAndNameTypeValuePair | null | typeValuePair<string> }[] = []
        const hasIdInName = (valueName) => {
            if (allProps.isUsingFinal) {
                const hasID = /IdFinal$/g.test(valueName) || /IdsFinal$/g.test(valueName)

                return hasID
            } else {
                const hasId = /Id$/g.test(valueName) || /Ids$/g.test(valueName)

                return hasId
            }
        }
        if (effect != undefined) {
            if (effect.comp == undefined) {
            }
        } else {
            return []
        }

        const getCardName = () => {
            return allProps.cardEffectComp.value.node.value.name;
        }

        const compToRunOn = getLowestComp(effect.comp)
        for (const key in compToRunOn) {
            if (key == "playerChooseCardIdFinal") {
                debugger
            }
            if (compToRunOn.hasOwnProperty(key) && !notIntrestingCompValues.includes(key)) {
                const value: idAndNameTypeValuePair = compToRunOn[key];

                if (value['visible'] != undefined && value['visible'] == false) {
                    continue
                }
                if (value.type == "Boolean") {
                    values.push({ key: key, compDesc: value.value as any, type: compTypes.Boolean })
                } else if (!hasIdInName(key)) {
                    continue
                } else
                    if (value.type == "IdAndName") {
                        if (Array.isArray(value.value)) {

                            values.push({ key: key, compDesc: value.value.map(tvp => convertFromidAndNameTypeValuePairToIdNameAndCompType(tvp)), type: compTypes.EffectCompArray })
                        } else {
                            values.push({ key: key, compDesc: convertFromidAndNameTypeValuePairToIdNameAndCompType(value), type: compTypes.EffectCompSingle })
                        }
                        // values.push({
                        //     id:
                        //     name:
                        // })
                    } else if ((value.type == 'Object')) {
                        //TODO: id and name from value if not null

                        if (value.value == null) {
                            values.push({
                                key: key, compDesc: { id: -1, name: "", comp: null, }, type: compTypes.EffectCompSingle
                            })
                        } else {
                            values.push({ key, compDesc: { id: (value.value as IdNameValuePair).id.value, name: (value.value as IdNameValuePair).name.value, comp: convertFromidAndNameTypeValuePairToIdNameAndCompType(value) }, type: compTypes.EffectCompSingle })
                        }
                    } else if (value.type == "Integer" || value.type == "Float") {
                        const cardName = getCardName()
                        if (Array.isArray(value.value)) {
                            values.push({
                                key: key,
                                compDesc: (value.value as unknown as typeValuePair<number>[]).map(val => {
                                    const comp = getCompByIdAndKey(val.value, key)
                                    var name: string = (comp != null && comp['name'] != undefined) ? comp.name.value : ""
                                    const regex = new RegExp(`${cardName}\<([\\s\\S]+?)\>`)
                                    name = name.replace(regex, "$1")
                                    return { id: val.value, name: name, comp: comp }
                                }),
                                type: compTypes.EffectCompArray
                            })

                        } else
                            if ((value as unknown as typeValuePair<number>).value != -1) {
                                const comp = getCompByIdAndKey((value as unknown as typeValuePair<number>).value, key)
                                var name: string = (comp != null && comp['name'] != undefined) ? comp.name.value : ""
                                const regex = new RegExp(`${cardName}\<([\\s\\S]+?)\>`)
                                name = name.replace(regex, "$1")
                                values.push({
                                    key: key, compDesc: { id: (value as unknown as typeValuePair<number>).value, name: name, comp: comp }, type: compTypes.EffectCompSingle
                                })
                            } else {
                                values.push({
                                    key: key, compDesc: null, type: compTypes.EffectCompSingle
                                })
                            }
                    }

            }
        }
        var didChange = false
        for (const value of values) {
            if (value.type != compTypes.Boolean) {
                try {
                    if (Array.isArray(value.compDesc)) {
                        for (const incomp of value.compDesc) {
                            if (
                                incomp.comp == null && incomp.id == -1) {
                                didChange = true
                                var toChange: typeValuePair<typeValuePair<number>[]> = compToRunOn[value.key]
                                toChange.value = toChange.value.filter(a => a.value != incomp.id)
                                saveChange(effect, value.key, true)
                            }
                        }
                    } else {
                        if (value.compDesc != null && value.compDesc.comp == null && value.compDesc.id != -1) {
                            didChange = true
                            var toChange2: typeValuePair<number> = compToRunOn[value.key]
                            toChange2.value = -1
                            saveChange(effect, value.key, true)
                        }
                    }
                } catch (error) {
                    debugger
                }

            }
        }
        if (didChange) {
            //@ts-ignore
            Editor.log(`after setting out of bounds values , reload`)
            allProps.ReloadData(allProps.isUsingFinal)
        }
        return values
    }

    const [effectCompProperties, setEffectCompProperties]: [bigType[], (a: bigType[]) => void] = React.useState(getEffectProperties(effect))

    React.useEffect(() => {
        setEffectCompProperties(getEffectProperties(effect))
    }, [effect])

    const expandClick = (e) => {
        setExpanded(!expanded)
    }

    const removeMe = () => {

    }

    const handleSetArray = (keyword: string, arrayToSet: IdNameAndCompType[]) => {
        const compToRunOn = getLowestComp(effect.comp)
        setArray(keyword, arrayToSet)
    }

    //Save inside a component change, not cardEffect
    const handleSetSingle = (signalToSet: IdNameAndCompType, key: string) => {
        var newEffectCompProperties = {}
        Object.assign(newEffectCompProperties, effectCompProperties)
        newEffectCompProperties[key] = signalToSet;
        const compToRunOn = getLowestComp(effect.comp)
        debugger
        compToRunOn[key] = signalToSet;

        //TODO: Propagte to parent
    }

    const hasIdInName = (valueName) => {
        return /Id$/g.test(valueName) || /Ids$/g.test(valueName)
    }


    const notExpandedNameView = <div style={{ color: "black" }}>Name: {(effect != null) ? effect.name + " " + effect.id : " No Effect In Props"}</div>


    const propertiesView = effectCompProperties.map((ef, idx) => {
        var propView = null

        switch (ef.type) {
            case compTypes.EffectCompArray:
                propView = <EffectCompArray allProps={allProps} saveChange={saveChange} IdNameCompTuple={effect} keyWordProp={ef.key} array={ef.compDesc} updateAllProps={handleSetArray} />
                break;
            case compTypes.EffectCompSingle:
                propView = <EffectCompSingle allProps={allProps} saveChange={saveChange} IdNameCompTuple={effect} keyWordProp={ef.key} setSingle={handleSetSingle} single={ef.compDesc} />
                break;
            case compTypes.Boolean:
                propView = <CheckBoxView allProps={allProps} saveChange={saveChange} IdNameCompTuple={effect} keyWordProp={ef.key} isChecked={ef.compDesc}></CheckBoxView>
                break;
            default:
                break;
        }
        //const showArray = <EffectCompArray allProps={allProps} saveChange={saveChange} IdNameCompTuple={effect} keyWordProp={ef.key} array={ef.compDesc} updateAllProps={handleSetArray} />
        // const showSingle = <EffectCompSingle allProps={allProps} saveChange={saveChange} IdNameCompTuple={effect} keyWordProp={ef.key} setSingle={handleSetSingle} single={ef.compDesc} />
        const IdAndNameView = <div style={{ backgroundColor: "lightgray", color: "black" }}>
            <h3>
                {ef.key}:
            </h3>
            {propView}
        </div>
        return <li key={idx}>
            {IdAndNameView}
        </li>
    })

    if (expanded && effect == null) {
        debugger
    }

    const expandedView = (<div>
        <ul>
            {[<li><div style={{ color: "black" }}>Name: {(effect != null) ? effect.name + " " + effect.id : "No Effect "}</div></li>, ...propertiesView]}

        </ul>
    </div>)


    return <li>
        <div className="layout horizontal" style={{ backgroundColor: "grey" }}>
            {/* @ts-ignore */}
            <ui-button onClick={expandClick}>{(expanded) ? "-" : "+"}</ui-button>
            {/* @ts-ignore */}
            {(expanded) ? expandedView : notExpandedNameView}
        </div>
    </li>
}
