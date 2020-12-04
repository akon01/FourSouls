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
    isUsingFinal: boolean
}

type propsType = {
    allProps: allPropType,
    effect: IdNameAndCompType,
    setArray: (keyword: string, arrayToSet: IdNameAndCompType[]) => void,
    saveChange: (IdAndNameCompToUpdate: IdNameAndCompType, key: string) => void,
}

const notIntrestingCompValues = ['_name', 'uuid', 'cost', 'conditions', 'dataConcurencyComponent', '_effectCard', 'preCondition', 'passiveEffectToAdd', 'dataCollector', '_objFlags', 'node', '__scriptAsset', '_enabled', 'enabled', 'enabledInHierarchy', '_isOnLoadCalled', '_id']

export function EffectView({ allProps, effect, setArray, saveChange }: propsType) {
    const [allProp, setAllProp] = React.useState(allProps)

    React.useEffect(() => {
        setAllProp(allProps)
    }, [allProps])
    const [expanded, setExpanded] = React.useState(false)
    const { EffectCompArray, EffectCompSingle } = allProps.requires

    const getLowestComp = (start) => {
        if (start['comp'] != undefined) {
            return getLowestComp(start['comp'])
        }
        return start
    }

    type bigType = {
        key: string,
        compDesc: IdNameAndCompType | IdNameAndCompType[]
    }

    const getCompByIdAndName = (id: number, name: string): IdNameAndCompType | null => {
        const toCheckArr = [...allProp.availavleEffects, ...allProp.conditions, ...allProp.costs, ...allProp.dataCollectors, ...allProp.dataConcurencies, ...allProp.preConditions]
        var toreturn = toCheckArr.find(toCheck => toCheck.id == id && toCheck.name == name)
        if (toreturn == null) {
            return null
        }
        return getLowestComp(toreturn)
    }


    const convertFromidAndNameTypeValuePairToIdNameAndCompType = (orig: idAndNameTypeValuePair): IdNameAndCompType => {
        const converted = {
            id: (orig.value as IdNameValuePair).id.value,
            name: (orig.value as IdNameValuePair).name.value,
            comp: getCompByIdAndName((orig.value as IdNameValuePair).id.value, (orig.value as IdNameValuePair).name.value)
        }

        return converted
    }

    const getEffectProperties = (effect: IdNameAndCompType) => {
        const values: bigType[] = []
        //  const values: { key: string, type: string, inValue: idAndNameTypeValuePair | null | typeValuePair<string> }[] = []
        const hasIdInName = (valueName) => {
            if (allProp.isUsingFinal) {
                return /IdFinal$/g.test(valueName) || /IdsFinal$/g.test(valueName)
            } else {
                return /Id$/g.test(valueName) || /Ids$/g.test(valueName)
            }
        }
        if (effect != undefined) {
            if (effect.comp == undefined) {
            }
        } else {
            return []
        }

        const compToRunOn = getLowestComp(effect.comp)
        for (const key in compToRunOn) {
            if (compToRunOn.hasOwnProperty(key) && !notIntrestingCompValues.includes(key)) {
                const value: idAndNameTypeValuePair = compToRunOn[key];
                if (value.type == "IdAndName") {
                    if (Array.isArray(value.value)) {
                        values.push({ key: key, compDesc: value.value.map(tvp => convertFromidAndNameTypeValuePairToIdNameAndCompType(tvp)) })
                    } else {
                        values.push({ key: key, compDesc: convertFromidAndNameTypeValuePairToIdNameAndCompType(value) })
                    }
                    // values.push({
                    //     id:
                    //     name:
                    // })
                } else if (hasIdInName(key) && value.type == 'Object') {
                    //TODO: id and name from value if not null
                    values.push({
                        key: key, compDesc: { id: -1, name: "", comp: (value.value != null) ? convertFromidAndNameTypeValuePairToIdNameAndCompType(value) : null }
                    })
                }
            }
        }
        return values
    }

    const [effectCompProperties, setEffectCompProperties]: [bigType[], (a: bigType[]) => void] = React.useState(getEffectProperties(effect))

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
        const showArray = <EffectCompArray allProps={allProp} saveChange={saveChange} IdNameCompTuple={effect} keyWordProp={ef.key} array={ef.compDesc} updateAllProps={handleSetArray} />
        const showSingle = <EffectCompSingle allProps={allProp} saveChange={saveChange} IdNameCompTuple={effect} keyWordProp={ef.key} setSingle={handleSetSingle} single={ef.compDesc} />
        const IdAndNameView = <div style={{ backgroundColor: "lightgray", color: "black" }}>
            <h3>
                {ef.key}:
            </h3>
            {Array.isArray(ef.compDesc) ? showArray : showSingle}
        </div>
        return <li key={idx}>
            {IdAndNameView}
        </li>
    })
    const expandedView = (<div>
        <ul>
            {[<li><div style={{ color: "black" }}>Name: {effect.name + " " + effect.id}</div></li>, ...propertiesView]}

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
