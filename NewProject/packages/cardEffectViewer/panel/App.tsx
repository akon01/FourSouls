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
      multiEffectCollectorIdFinal: typeValuePair<number>,
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
   cardEffectComp: cardEffectCompType | null,
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

export function App(props: allPropType) {

   const { EffectCompSingle, EffectCompArray } = props.requires

   const [allProp, setAllProp]: [allPropType, (a: allPropType) => void] = React.useState(props)

   const [isLoaded, setLoaded]: [boolean, (e: boolean) => void] = React.useState(false)


   const dataCollectorType = '934deiBNWNK0IL0stJPLtlB'
   const costType = '28d7fAwgutAbJv3JqFDotZ2'
   const preConditionType = '5f885/+i49NwKzsdXqJ+hnq'
   const conditionType = '3c7bd9tmzlFNbJ3nD3RwVOA'
   const dataConcucrencyType = '7496eJlecdMfpCUk/s/ol2S'
   const dataIdsNames = ['DataCollectorId', 'PreConditionId', 'ConditionId', 'EffectId', 'CostId', 'ConcurencyId']

   var cardEffectComp = null
   var nodeId = ""
   var selectedCardNode = null
   var activeEffects = []
   var passiveEffects = []
   var toAddPassiveEffects = []
   var paidEffects = []
   var preConditions = []
   var conditions = []
   var dataCollectors = []
   var costs = []
   var dataConcurencies = []
   var availavleEffects: IdNameAndCompType[] = []

   const getEffectsList = (effectIdsName, effectsArray, cardName) => {
      const regex = new RegExp(`${cardName}\<([\\s\\S]+?)\>`)
      const comps = selectedCardNode.value["__comps__"]
      const activeEffectsIdAndNames = cardEffectComp['value'][effectIdsName]['value']
      for (const idAndName of activeEffectsIdAndNames) {
         const name = idAndName['value']['name']['value']
         const id = idAndName['value']['id']['value']
         for (const comp of comps) {
            if (comp['value']['name']['value'].includes(name) && comp['value']['EffectId']['value'].toString() == id.toString()) {
               effectsArray.push({
                  name: name.replace(regex, `$1`),
                  id,
                  comp: comp.value
               })
            }
         }

      }
   }

   const getListByExtendsString = (string, list, cardName) => {
      const regex = new RegExp(`${cardName}\<([\\s\\S]+?)\>`)
      const types = selectedCardNode.types
      const comps = selectedCardNode.value["__comps__"]
      for (const type in types) {
         if (types.hasOwnProperty(type)) {
            const typeData = types[type];
            if (typeData.extends != undefined && typeData.extends.includes(string)) {

               const aComps = comps.filter(comp => comp.type == type)
               for (const aComp of aComps) {
                  if (aComp) {
                     const cardName = aComp.value.node.value.name;
                     let compName = aComp.value.name.value.replace(cardName + "<", "")
                     compName = compName.slice(0, -1)
                     let id = ""
                     for (const idName of dataIdsNames) {
                        if (aComp.value[idName] != undefined) {
                           id = aComp.value[idName].value
                        }
                     }
                     list.push({
                        name: compName.replace(regex, `$1`),
                        comp: aComp.value,
                        id: id
                     })
                  } else {
                     //@ts-ignore
                     Editor.log(`tring to get type:${type} named ${typeData.name}, but not found a component with that type`)
                  }
               }
            }
         }
      }
   }

   const getAvailableEffects = (cardName) => {
      const regex = new RegExp(`${cardName}\<([\\s\\S]+?)\>`)
      const types = selectedCardNode.types
      let effectType = ""
      for (const key in types) {
         if (types.hasOwnProperty(key)) {
            const type = types[key];
            if (type.name == "Effect") {
               effectType = key;
            }
         }
      }
      const foundTypes = []
      const avalEffects = []
      for (const key in types) {
         if (types.hasOwnProperty(key)) {
            const type = types[key];
            if (type.extends != undefined && type.extends.includes(effectType)) {
               foundTypes.push(key)
            }
         }
      }
      const comps = selectedCardNode.value["__comps__"]
      for (const comp of comps) {
         if (foundTypes.includes(comp.type)) {
            avalEffects.push(comp.value)
         }
      }
      availavleEffects = avalEffects.map(ef => {
         const newName = ef.name.value.replace(regex, `$1`)
         return {
            name: newName,
            id: ef.EffectId.value,
            comp: ef
         }
      });
   }

   const getFinalEffectsList = (effectsIdsName, effectsArray) => {
      const comps = selectedCardNode.value["__comps__"]
      cardEffectComp = comps.find(comp => comp["type"] == "bd535UKRTNDu7iLPx8/+FlC");
      const activeEffectsIdAndNames = cardEffectComp['value'][effectsIdsName + 'Final']['value'] as { type: string, value: number }[]
      for (const activeEffectId of activeEffectsIdAndNames) {
         effectsArray.push(availavleEffects.find(as => as.id == activeEffectId.value))
      }
   }

   const ReloadData = (isUsingFinal) => {
      //@ts-ignore
      Editor.Ipc.sendToPanel('scene', 'scene:query-nodes-by-comp-name', 'CardEffect', (error, nodes) => {
         if (error)
            //@ts-ignore
            return Editor.error(error);
         nodeId = nodes[0];
         //@ts-ignore
         Editor.Ipc.sendToPanel('scene', 'scene:query-node', nodeId, (error, dump) => {
            if (error)
               //@ts-ignore
               return Editor.error(error);
            selectedCardNode = JSON.parse(dump);
            const comps = selectedCardNode.value["__comps__"];
            cardEffectComp = comps.find(comp => comp["type"] == "bd535UKRTNDu7iLPx8/+FlC");
            const cardName = cardEffectComp.value.node.value.name;
            const allTypes = [{
               type: dataConcucrencyType,
               list: dataConcurencies
            }, {
               type: dataCollectorType,
               list: dataCollectors
            }, {
               type: costType,
               list: costs
            }, {
               type: preConditionType,
               list: preConditions
            }, {
               type: conditionType,
               list: conditions
            }];
            for (const type of allTypes) {
               getListByExtendsString(type.type, type.list, cardName);
            }
            getAvailableEffects(cardName);
            if (!isUsingFinal) {
               getEffectsList('activeEffectsIds', activeEffects, cardName);
               getEffectsList('passiveEffectsIds', passiveEffects, cardName);
               getEffectsList('toAddPassiveEffectsIds', toAddPassiveEffects, cardName);
               getEffectsList('paidEffectsIds', paidEffects, cardName);
            } else {
               getFinalEffectsList('activeEffectsIds', activeEffects);
               getFinalEffectsList('passiveEffectsIds', passiveEffects);
               getFinalEffectsList('toAddPassiveEffectsIds', toAddPassiveEffects);
               getFinalEffectsList('paidEffectsIds', paidEffects);
            }

            const newAllProps = {
               activeEffects, availavleEffects, cardEffectComp, conditions, costs, dataCollectors, dataConcurencies, nodeId, paidEffects, passiveEffects, preConditions, requires: props.requires, selectedCardNode, toAddPassiveEffects, isUsingFinal: isUsingFinal
            }
            setAllProp(newAllProps)

            setLoaded(true)

            //  renderReact()
            // e(true)
         });
      });
   }


   const updateAllProps = (keyword: string, arrayToSet: IdNameAndCompType[]) => {
      let newAllProp: any = {};
      switch (keyword) {
         case "Active Effects":
            Object.assign(newAllProp, allProp)
            newAllProp.activeEffects = arrayToSet
            setAllProp(newAllProp)
            break;
         default:
            break;
      }
   }
   const convertIdNameAndCompToIdAndNameTypeValuePair = (orig: IdNameAndCompType): idAndNameTypeValuePair => {
      return {
         type: "IdAndName",
         value: { id: { type: "Integer", value: orig.id }, name: { type: "String", value: orig.name } }
      }
   }

   const cardEffectCompIdAndName: IdNameAndCompType = React.useMemo(() => {
      return {
         id: 0,
         name: "CardEffect",
         comp: allProp.cardEffectComp?.value ?? null
      }
   }, [allProp])
   const saveToPrefab = (uuid, key, type, value) => {
      debugger
      if (!allProp.isUsingFinal) {
         key = key + "Final";
      }
      //@ts-ignore
      Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
         id: uuid,
         path: key,
         type: "Integer",
         //   value: newVal,
         value: value,
         isSubProp: false,
      });
   }

   ///inside IdAndNameCompToUpdate - .comp needs to be updated with new values
   const saveChange = (IdAndNameCompToUpdate: IdNameAndCompType, key: string) => {
      const prop = IdAndNameCompToUpdate.comp[key]
      if (prop.type == "IdAndName") {
         if (Array.isArray(prop.value)) {
            saveToPrefab(IdAndNameCompToUpdate.comp.uuid.value, key, prop.type, prop.value.map(val => {
               return val.value.id.value
            }))
         } else {
            saveToPrefab(IdAndNameCompToUpdate.comp.uuid.value, key, prop.type, prop.value.id.value)
         }
      } else if (prop.type == "Integer") {
         if (Array.isArray(prop.value)) {
            saveToPrefab(IdAndNameCompToUpdate.comp.uuid.value, key, prop.type, prop.value.map(val => {
               return val.value
            }))
         } else {
            saveToPrefab(IdAndNameCompToUpdate.comp.uuid.value, key, prop.type, prop.value.value)
         }
      }
      ReloadData(allProp.isUsingFinal)
   }
   console.log(allProp)

   const getLowestComp = (start) => {
      if (start['comp'] != undefined) {
         return getLowestComp(start['comp'])
      }
      return start
   }
   const notIntrestingCompValues = ['_name', 'uuid', 'cost', 'conditions', 'dataConcurencyComponent', '_effectCard', 'preCondition', 'passiveEffectToAdd', 'dataCollector', '_objFlags', 'node', '__scriptAsset', '_enabled', 'enabled', 'enabledInHierarchy', '_isOnLoadCalled', '_id']


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

   const hasIdInName = (valueName) => {
      return /Id$/g.test(valueName) || /Ids$/g.test(valueName)
   }

   const saveToPrefab2 = (uuid, key, type, value) => {
      debugger
      //@ts-ignore
      Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
         id: uuid,
         path: key,
         type: "Object",
         //   value: newVal,
         value: {},
         isSubProp: false,
      });
   }

   ///inside IdAndNameCompToUpdate - .comp needs to be updated with new values
   const saveChange2 = (IdAndNameCompToUpdate: IdNameAndCompType, key: string) => {
      const prop = IdAndNameCompToUpdate.comp[key]
      if (prop.type == "IdAndName") {
         if (Array.isArray(prop.value)) {
            saveToPrefab2(IdAndNameCompToUpdate.comp.uuid.value, key, prop.type, prop.value.map(val => {
               return val.value.id.value
            }))
         } else {
            saveToPrefab2(IdAndNameCompToUpdate.comp.uuid.value, key, prop.type, prop.value.id.value)
         }
      }
   }

   const handleMakeFirstChange = () => {

      const { isUsingFinal, nodeId, requires, selectedCardNode, cardEffectComp, ...allCardEffectComponents } = allProp
      for (const key in allCardEffectComponents) {
         if (Object.prototype.hasOwnProperty.call(allCardEffectComponents, key)) {
            const cardEffectComponentArray = allCardEffectComponents[key] as IdNameAndCompType[];
            for (const cardEffectComponent of cardEffectComponentArray) {
               const compToRunOn = getLowestComp(cardEffectComponent.comp)
               for (const key in compToRunOn) {
                  if (compToRunOn.hasOwnProperty(key) && !notIntrestingCompValues.includes(key)) {
                     const value: idAndNameTypeValuePair = compToRunOn[key];
                     if (value.type == "IdAndName") {
                        if (Array.isArray(value.value)) {
                           saveChange(cardEffectComponent, key)
                           saveChange2(cardEffectComponent, key)
                           // values.push({ key: key, compDesc: value.value.map(tvp => convertFromidAndNameTypeValuePairToIdNameAndCompType(tvp)) })
                        } else {
                           saveChange(cardEffectComponent, key)
                           saveChange2(cardEffectComponent, key)
                           // values.push({ key: key, compDesc: convertFromidAndNameTypeValuePairToIdNameAndCompType(value) })
                        }
                        // values.push({
                        //     id:
                        //     name:
                        // })
                     } else if (hasIdInName(key) && value.type == 'Object') {
                        //TODO: id and name from value if not null
                        saveChange(cardEffectComponent, key)
                        saveChange2(cardEffectComponent, key)
                        // values.push({
                        //    key: key, compDesc: { id: -1, name: "", comp: (value.value != null) ? convertFromidAndNameTypeValuePairToIdNameAndCompType(value) : null }
                        // })
                     }
                  }
               }

            }
         }
      }
      saveToPrefab(cardEffectComp.value.uuid.value, "activeEffectsIds", "", (cardEffectComp.value.activeEffectsIds.value as typeValuePair<IdNameValuePair>[]).map(p => p.value.id.value))
      saveToPrefab(cardEffectComp.value.uuid.value, "paidEffectsIds", "", (cardEffectComp.value.paidEffectsIds.value as typeValuePair<IdNameValuePair>[]).map(p => p.value.id.value))
      saveToPrefab(cardEffectComp.value.uuid.value, "multiEffectCollectorId", "", (cardEffectComp.value.multiEffectCollectorId.value as IdNameValuePair).id.value)
      saveToPrefab(cardEffectComp.value.uuid.value, "passiveEffectsIds", "", (cardEffectComp.value.passiveEffectsIds.value as typeValuePair<IdNameValuePair>[]).map(p => p.value.id.value))
      saveToPrefab(cardEffectComp.value.uuid.value, "toAddPassiveEffectsIds", "", (cardEffectComp.value.toAddPassiveEffectsIds.value as typeValuePair<IdNameValuePair>[]).map(p => p.value.id.value))
      saveToPrefab2(cardEffectComp.value.uuid.value, "activeEffectsIds", "", (cardEffectComp.value.activeEffectsIds.value as typeValuePair<IdNameValuePair>[]).map(p => p.value.id.value))
      saveToPrefab2(cardEffectComp.value.uuid.value, "paidEffectsIds", "", (cardEffectComp.value.paidEffectsIds.value as typeValuePair<IdNameValuePair>[]).map(p => p.value.id.value))
      saveToPrefab2(cardEffectComp.value.uuid.value, "multiEffectCollectorId", "", (cardEffectComp.value.multiEffectCollectorId.value as IdNameValuePair).id.value)
      saveToPrefab2(cardEffectComp.value.uuid.value, "passiveEffectsIds", "", (cardEffectComp.value.passiveEffectsIds.value as typeValuePair<IdNameValuePair>[]).map(p => p.value.id.value))
      saveToPrefab2(cardEffectComp.value.uuid.value, "toAddPassiveEffectsIds", "", (cardEffectComp.value.toAddPassiveEffectsIds.value as typeValuePair<IdNameValuePair>[]).map(p => p.value.id.value))

   }


   const handleReloadData = () => {
      ReloadData(allProp.isUsingFinal)

   }

   const warnAboutComponentsWithStartId = () => {
      const { isUsingFinal, nodeId, requires, selectedCardNode, cardEffectComp, ...allCardEffectComponents } = allProp
      var toWarnAbout: IdNameAndCompType[] = []
      for (const key in allCardEffectComponents) {
         if (Object.prototype.hasOwnProperty.call(allCardEffectComponents, key)) {
            const cardEffectComponentsArray = allCardEffectComponents[key] as IdNameAndCompType[];
            for (const cardEffectComp of cardEffectComponentsArray) {
               if (cardEffectComp.id == -1 && cardEffectComp.name != "")
                  toWarnAbout.push(cardEffectComp)
            }
         }
      }
      //@ts-ignore
      Editor.error("Components With Start Id (-1)")
      var names = ""
      for (const warnMe of toWarnAbout) {
         names += warnMe.name + ", "
      }
      //@ts-ignore
      Editor.error(names)
   }

   React.useEffect(() => {
      if (isLoaded) {
         warnAboutComponentsWithStartId()
      }
   }, [allProp])

   const handleSwitchToFinalView = () => {
      const newAllProp: allPropType | {} = {}
      //Object.assign(newAllProp!, allProp)
      // newAllProp!.isUsingFinal = !newAllProp!.isUsingFinal
      //setAllProp(newAllProp!)
      ReloadData(!allProp.isUsingFinal)
   }

   const multiEffectChoser = (isLoaded) ? (allProp.isUsingFinal) ? allProp.dataCollectors.find(dc => { return dc.id == allProp.cardEffectComp.value.multiEffectCollectorIdFinal.value }) : convertFromidAndNameTypeValuePairToIdNameAndCompType(allProp.cardEffectComp.value.multiEffectCollectorId) : null
   const activeEffectsIdsName = (isLoaded) ? (allProp.isUsingFinal) ? "activeEffectsIdsFinal" : "activeEffectsIds" : ""
   const passiveEffectsIdsName = (isLoaded) ? (allProp.isUsingFinal) ? "passiveEffectsIdsFinal" : "passiveEffectsIds" : ""
   const paidEffectsIdsName = (isLoaded) ? (allProp.isUsingFinal) ? "paidEffectsIdsFinal" : "paidEffectsIds" : ""
   const toAddPassiveEffectsIdsName = (isLoaded) ? (allProp.isUsingFinal) ? "toAddPassiveEffectsIdsFinal" : "toAddPassiveEffectsIds" : ""
   return (
      <div>
         <h2>Panel</h2>
         {allProp.isUsingFinal && <div>Final Ids View </div>}
         {/* @ts-ignore */}
         <ui-button onClick={handleMakeFirstChange}>Move From Ids To Final</ui-button>
         {/* @ts-ignore */}
         <ui-button onClick={handleReloadData}>Reload Data</ui-button>
         {/* @ts-ignore */}
         <ui-button onClick={handleSwitchToFinalView}>Switch To Final View</ui-button>
         <hr />
         { isLoaded && <div style={{ height: "80%" }}>
            <div style={{ overflowY: "scroll", height: "100%" }}>
               <div>
                  <h2>Active Effects</h2>
                  {allProp.activeEffects.length == 0 && <div style={{ color: "red" }}>No Active Effects Set</div>}
                  <ul>
                     <EffectCompArray saveChange={saveChange} IdNameCompTuple={cardEffectCompIdAndName} allProps={allProp} keyWordProp={activeEffectsIdsName} array={allProp.activeEffects} updateAllProps={updateAllProps} />
                     {/*allProp.activeEffects.map((effect, idx) => <EffectView allProps={allProp} key={idx} effect={effect}/>)*/}
                  </ul>
                  <h2>Passive Effects</h2>
                  {allProp.passiveEffects.length == 0 && <div style={{ color: "red" }}>No Passive Effects Set</div>}
                  <ul>
                     <EffectCompArray saveChange={saveChange} IdNameCompTuple={cardEffectCompIdAndName} allProps={allProp} keyWordProp={passiveEffectsIdsName} array={allProp.passiveEffects} updateAllProps={updateAllProps} />
                     {/*allProp.activeEffects.map((effect, idx) => <EffectView allProps={allProp} key={idx} effect={effect}/>)*/}
                  </ul>
                  <h2>Paid Effects</h2>
                  {allProp.paidEffects.length == 0 && <div style={{ color: "red" }}>No Paid Effects Set</div>}
                  <ul>
                     <EffectCompArray saveChange={saveChange} IdNameCompTuple={cardEffectCompIdAndName} allProps={allProp} keyWordProp={paidEffectsIdsName} array={allProp.paidEffects} updateAllProps={updateAllProps} />
                     {/*allProp.activeEffects.map((effect, idx) => <EffectView allProps={allProp} key={idx} effect={effect}/>)*/}
                  </ul>
                  <h2>To Add Passive Effects</h2>
                  {allProp.toAddPassiveEffects.length == 0 && <div style={{ color: "red" }}>No To Add Passive Effects Set</div>}
                  <ul>
                     <EffectCompArray saveChange={saveChange} IdNameCompTuple={cardEffectCompIdAndName} allProps={allProp} keyWordProp={toAddPassiveEffectsIdsName} array={allProp.toAddPassiveEffects} updateAllProps={updateAllProps} />
                     {/*allProp.activeEffects.map((effect, idx) => <EffectView allProps={allProp} key={idx} effect={effect}/>)*/}
                  </ul>
                  <h2>MultiEffect Chooser</h2>
                  <EffectCompSingle saveChange={saveChange} IdNameCompTuple={cardEffectCompIdAndName} allProps={allProp} keyWordProp="MultiEffectChooser" single={multiEffectChoser} />
               </div>
            </div>
         </div>}
      </div>
   )
}

