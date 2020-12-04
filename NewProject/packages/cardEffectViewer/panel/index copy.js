Editor.Panel.extend({
    style: `
      :host { margin: 5px; }
      h2 { color: #f90; }
    `,

    //  <li v-for="effect in activeEffects" key="effect.id">Name: {{effect.name}} Id:{{effect.id}}</li>
    $: {
        btn: '#btn',
        activeEffectsUl: "#activeEffectsUl",
        passiveEffectsUl: "#passiveEffectsUl",
        paidEffectsUl: "#paidEffectsUl",
        toAddPassiveUl: "#toAddPassiveUl",
        allDiv: "#allDiv"
    },

    ready() {
        const notIntrestingCompValues = ['_name', 'uuid', 'cost', 'conditions', 'dataConcurencyComponent', '_effectCard', 'preCondition', 'passiveEffectToAdd', 'dataCollector', '_objFlags', 'node', '__scriptAsset', '_enabled', 'enabled', 'enabledInHierarchy', '_isOnLoadCalled', '_id']

        const dataCollectorType = '934deiBNWNK0IL0stJPLtlB'
        const costType = '28d7fAwgutAbJv3JqFDotZ2'
        const preConditionType = '5f885/+i49NwKzsdXqJ+hnq'
        const conditionType = '3c7bd9tmzlFNbJ3nD3RwVOA'
        const dataConcucrencyType = '7496eJlecdMfpCUk/s/ol2S'

        const react = require('C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/react/index')
        const reactDom = require('C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/react-dom/index')

        const dataIdsNames = ['DataCollectorId', 'PreConditionId', 'ConditionId', 'EffectId', 'CostId', 'ConcurencyId']

        const compNames = ['costId', 'preConditionId']
        Editor.log(JSON.stringify(this.$))

        const cardEffectcomp = Vue.component('effect-view', {

            props: {
                effect: Object,
                allComp: [Object],
                componentsObject: Object,
                origin: [Object]
            },
            computed: {
                effectValues: function () {
                    const getLowestComp = (start) => {
                        if (start['comp'] != undefined) {
                            return getLowestComp(start['comp'])
                        }
                        return start
                    }
                    const values = []
                    const hasIdInName = (valueName) => {
                        return /Id$/g.test(valueName) || /Ids$/g.test(valueName)
                    }
                    if (this.oldEffect != undefined) {
                        Editor.log(`calculating effect Values for ${this.oldEffect.name}`)
                        Editor.log(JSON.stringify(this.oldEffect.comp))
                    } else {
                        Editor.log(`effect view has no old effect`)
                        return []
                    }

                    const compToRunOn = getLowestComp(this.oldEffect.comp)
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
                    Editor.log("values " + JSON.stringify(values))
                    return values
                },
            },
            data: function () {
                return {
                    oldEffect: this.effect,
                    values: [],
                    isExpanded: false,
                    originData: this.origin,
                    allCompData: this.allComp
                }
            },
            created: function () {
                this.values = this.effectValues
                Editor.log("this origin: " + JSON.stringify(this.origin))
            },
            methods: {
                isArray: function (isArr) {
                    return Array.isArray(isArr)
                },
                onExpand: function () {
                    this.isExpanded = !this.isExpanded
                },
                getByIdAndName: function (inValue) {
                    const {
                        name,
                        id
                    } = inValue
                    let compByIdAndName = 1
                    let compName = ""
                    compByIdAndName = this.allComp.find(comp => {
                        if (comp.name['value'] != undefined) {
                            compName = comp.name['value']
                        } else {
                            compName = comp.name
                        }
                        if (compName.includes(name.value)) {
                            Editor.log(`${compName} includes ${name.value}`)
                            for (const idName of dataIdsNames) {
                                if (comp.comp[idName] != undefined) {
                                    Editor.log(`comp ${idName} is defined check to see if ${comp.comp[idName].value.toString()} is like ${id.value.toString()}`)
                                    if (comp.comp[idName].value.toString() == id.value.toString()) {
                                        return true
                                    }
                                }
                            }
                        }
                        return false
                    })
                    Editor.log(`get by id and Name for ${inValue.name.value} with id ${inValue.id.value}`)
                    Editor.log(`found comp ${compName}`)
                    return {
                        name: compName,
                        comp: compByIdAndName,
                        id: id.value
                    }
                },
                getComponentByType: function (type) {
                    switch (type) {
                        case 'String':
                            return "input-text"
                        case 'Float':
                        case 'Enum':
                            return 'input-num'
                        case "Boolean":
                            return 'input-bool'
                        default:
                            break;
                    }
                },
                getString(value) {
                    return JSON.stringify(value)
                },
                addToArray(array, valueToAdd) {
                    array.push(valueToAdd)
                },
                hasIdInName(valueName) {
                    return /Id$/g.test(valueName) || /Ids$/g.test(valueName)
                },
                removeMe() {

                },
                addSingle(origValue, singleToAdd) {
                    origValue.inValue = singleToAdd.$arguments[0]
                }

            },
            template: `
              <li >
              <div class="layout horizontal" style="background-color:grey">
                <button @click="onExpand">+</button> 
                <button v-if="origin!=null" @click="removeMe">remove me</button>
                <div v-if="!isExpanded && effect!=null">name: {{effect.name}} </div>
                <div v-if="isExpanded">
                    <ul>
                        <li v-for="value in values" key="value.key">
                            <div v-if="value.type=='IdAndName'">
                            {{value.key}}:
                                <div v-if="isArray(value.inValue) && value.inValue[0]!=undefined">
                                    <array-change  :components="componentsObject" :key="value.key" :array="value.inValue"></array-change>
                                    <ul>
                                    <effect-view v-for="inCompData in value.inValue" :origin="value.inValue" :components-object="componentsObject" :all-comp="allComp" :effect="getByIdAndName(inCompData.value)" />
                                    </ul>
                                </div>
                                <div v-else>
                                <array-change :components="componentsObject" :key="value.key" :array="value.inValue"></array-change>
                                </div>
                                <div v-if="!isArray(value.inValue)">
                                    <effect-view :origin="value.inValue" :components-object="componentsObject" v-bind:effect="getByIdAndName(value.inValue.value)"/>
                                </div>
                            </div>
                            <div v-else> 
                                <div v-if="hasIdInName(value.key) && value.type=='Object'">
                                {{value.key}}:
                                    <single-change v-on:add-singl="addSingle(value,...arguments)" :all-comp="allComp" :single="value.inValue" :components="componentsObject" :key="value.key"/>
                                </div>
                                <div v-else>
                                    name: {{value.inValue}}
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
              </div>
          
            </li>
              `
        })

        new window.Vue({
            el: this.shadowRoot,
            data: {
                cardEffectComp: null,
                nodeId: "",
                selectedCardNode: null,
                activeEffects: [],
                passiveEffects: [],
                toAddPassiveEffects: [],
                paidEffects: [],
                preConditions: [],
                conditions: [],
                dataCollectors: [],
                costs: [],
                dataConcurencies: [],
                availavleEffects: [],
            },
            components: {
                "single-change": Vue.component('single-change', {
                    props: {
                        single: {
                            Object
                        },
                        key: String,
                        components: [Object],
                        allComp: [Object]
                    }, //['single', 'key', 'components', 'allComp'],
                    data: function () {
                        return {
                            thisOptions: [],
                            keyword: "",
                            selectedValue: {
                                name: "Nothing"
                            },
                            singleData: this.single
                        }
                    },
                    methods: {
                        addToArrayEmit: function () {
                            const toEmit = this.selectedValue.value
                            Editor.log("set as selected " + this.selectedValue.name)
                            this.singleData = {
                                type: "IdAndName",
                                value: {
                                    id: {
                                        type: "Integer",
                                        value: toEmit.id
                                    },
                                    name: {
                                        type: "String",
                                        value: toEmit.name
                                    }
                                }
                            }
                            this.$emit('add-singl', this.singleData)
                        },
                        runOnChange: function (event) {
                            this.selectedValue = this.thisOptions.find(option => option.name == event.target.value)
                        }
                    },
                    components: {
                        "effect-view": cardEffectcomp
                    },
                    created: function () {
                        Editor.log(`on created of single change`)
                        Editor.log(JSON.stringify(this.key))
                        Editor.log(JSON.stringify(this.components))
                        Editor.log(JSON.stringify(this.allComp))
                        Editor.log(JSON.stringify(this.single))
                        debugger

                        var options = ['no component found for key']
                        if (this.key.includes('cost')) {
                            options = this.components.costs.map(cost => {
                                return {
                                    name: cost.name,
                                    value: cost
                                }
                            })
                            this.keyword = "Costs"
                        }
                        if (this.key.includes('preCondition')) {
                            options = this.components.preConditions.map(collector => {
                                return {
                                    name: collector.name,
                                    value: collector
                                }
                            })
                            this.keyword = "PreConditions"
                        } else
                        if (this.key.includes('condition')) {
                            options = this.components.conditions.map(cond => {
                                return {
                                    name: cond.name,
                                    value: cond
                                }
                            })
                            this.keyword = "Conditions"
                        }
                        if (this.key.includes('dataCollector')) {
                            options = this.components.dataCollectors.map(collector => {
                                return {
                                    name: collector.name,
                                    value: collector
                                }
                            })
                            this.keyword = "Data Collectors"
                        }
                        if (this.key.includes('dataConcurencyComponent')) {
                            options = this.components.dataConcurencies.map(collector => {
                                return {
                                    name: collector.name,
                                    value: collector
                                }
                            })
                            this.keyword = "Data Concurencies"
                        }
                        this.thisOptions = options
                        Editor.log(JSON.stringify(this.thisOptions))
                    },
                    template: `
                    <div>
                        <div v-if="singleData!=null" class="layout horizontal">
                        <button @click="removeMe">remove me</button>
                        <effect-view :effect="singleData" :components-object="components" :all-comp="allComp" ></effect-view>
                        </div>
                        <div v-else>          
                            <div v-if="thisOptions.length>0">
                                <p>Available {{keyword}} on Card:
                                <ui-button @click="addToArrayEmit">
                                Set {{selectedValue.name}} As {{keyword}}
                            </ui-button>
                                <ui-select value="selectedValue" v-on:change="runOnChange($event)">
                                <option v-for="optn in thisOptions" value={{optn.name}}>{{optn.name}}</option>
                                </ui-select">        
                                </p>
                            </div>
                            <div v-else>
                            <p>No Available {{keyword}} on Card </p>
                            </div>
                        </div>
                    </div>
                    `
                }),
                "array-change": Vue.component('array-change', {
                    props: ['array', 'key', 'components'],
                    data: function () {
                        return {
                            thisOptions: [],
                            keyword: "",
                            selectedValue: {
                                name: "not set yet"
                            }
                        }
                    },
                    methods: {
                        addToArrayEmit: function () {
                            debugger
                            const toEmit = this.selectedValue.value
                            this.array.push({
                                type: "IdAndName",
                                value: {
                                    id: {
                                        type: "Integer",
                                        value: toEmit.id
                                    },
                                    name: {
                                        type: "String",
                                        value: toEmit.name
                                    }
                                }
                            })
                            // this.$emit('addarr',toEmit)
                        },
                        runOnChange: function (event) {
                            this.selectedValue = this.thisOptions.find(option => option.name == event.target.value)
                        }
                    },
                    created: function () {
                        var options = ['no component found for key']
                        if (this.key.includes('effect')) {
                            options = this.components.availableEffects.map(cost => {
                                return {
                                    name: cost.name,
                                    value: cost
                                }
                            })
                            this.keyword = "Effects"
                        }
                        if (this.key.includes('cost')) {
                            options = this.components.costs.map(cost => {
                                return {
                                    name: cost.name,
                                    value: cost
                                }
                            })
                            this.keyword = "Costs"
                        }
                        if (this.key.includes('preCondition')) {
                            options = this.components.preConditions.map(collector => {
                                return {
                                    name: collector.name,
                                    value: collector
                                }
                            })
                            this.keyword = "PreConditions"
                        } else
                        if (this.key.includes('condition')) {
                            options = this.components.conditions.map(cond => {
                                return {
                                    name: cond.name,
                                    value: cond
                                }
                            })
                            this.keyword = "Conditions"
                        }
                        if (this.key.includes('dataCollector')) {
                            options = this.components.dataCollectors.map(collector => {
                                return {
                                    name: collector.name,
                                    value: collector
                                }
                            })
                            this.keyword = "Data Collectors"
                        }
                        if (this.key.includes('dataConcurencyComponent')) {
                            options = this.components.dataConcurencies.map(collector => {
                                return {
                                    name: collector.name,
                                    value: collector
                                }
                            })
                            this.keyword = "Data Concurencies"
                        }
                        this.thisOptions = options
                        Editor.log(JSON.stringify(this.thisOptions))
                    },
                    template: `
                    <div v-if="thisOptions.length>0">
                        <p>Available {{keyword}} on Card:
                        <ui-button @click="addToArrayEmit">
                        Add {{selectedValue.name}} To {{keyword}} array
                    </ui-button>
                        <ui-select value="selectedValue" v-on:change="runOnChange($event)">
                        <option v-for="optn in thisOptions" value={{optn.name}}>{{optn.name}}</option>
                        </ui-select">        
                        </p>
                    </div>
                    <div v-else>
                    <p>No Available {{keyword}} on Card </p>
                    </div>
                    `
                }),
                "input-text": Vue.component('input-text', {
                    props: ['value', 'newVal'],
                    methods: {
                        change: function () {
                            this.$emit('change', newVal)
                        }
                    },
                    template: `
                   <ui-input :value="value" v-on:change="newVal = $event.target.value"></ui-input>
                    `
                }),
                "input-num": Vue.component('input-num', {
                    props: ['value', 'newVal'],
                    methods: {
                        change: function () {
                            this.$emit('change', newVal)
                        }
                    },
                    template: `
                   <ui-num-input :value="value" v-on:change="newVal = $event.target.value"></ui-num-input>
                    `
                }),
                "input-bool": Vue.component('input-bool', {
                    props: ['value', 'newVal'],
                    methods: {
                        change: function () {
                            this.$emit('change', newVal)
                        }
                    },
                    template: `
                   <ui-checkbox :checked="value" v-on:change="newVal = $event.target.value"></ui-checkbox>
                    `
                }),
                "effect-view": cardEffectcomp
            },
            computed: {

            },
            methods: {
                allCardEffectComponents: function () {
                    return [...this.dataConcurencies, ...this.activeEffects, ...this.passiveEffects, ...this.toAddPassiveEffects, ...this.paidEffects, ...this.preConditions, ...this.conditions, ...this.dataCollectors, ...this.costs]
                },
                getComponentsObject: function () {
                    return {
                        effects: [...this.activeEffects, ...this.paidEffects, ...this.passiveEffects, ...this.toAddPassiveEffects],
                        dataConcurencies: this.dataConcurencies,
                        activeEffects: this.activeEffects,
                        passiveEffects: this.passiveEffects,
                        paidEffects: this.paidEffects,
                        toAddPassiveEffects: this.toAddPassiveEffects,
                        preConditions: this.preConditions,
                        conditions: this.conditions,
                        dataCollectors: this.dataCollectors,
                        costs: this.costs,
                        availableEffects: this.availableEffects
                    }
                },
                saveBtnClick: function () {
                    const saveToPrefab = (uuid, key, type, value) => {
                        debugger
                        Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                            id: uuid,
                            path: key + "Final",
                            type: "Integer",
                            //   value: newVal,
                            value: value,
                            isSubProp: false,
                        });
                    }
                    //}

                    console.log(this.getComponentsObject());
                    console.log(this.cardEffectComp)
                    const cardEffectUUid = this.cardEffectComp.value.uuid.value;

                    const activeEffects = this.getComponentsObject().activeEffects;
                    //map effects to cardEffect list, should then set the array of this.cardEffectComp.activeEffects as this
                    const mappedActives = activeEffects.map(effect => {
                        return {
                            type: "IdAndName",
                            value: {
                                name: {
                                    value: effect.name,
                                    type: "String"
                                },
                                id: {
                                    type: "Integer",
                                    value: effect.comp.EffectId.value
                                }
                            }
                        }
                    })

                    //For each effect, go and change props which are IdAndName.
                    for (const effect of activeEffects) {
                        for (const key in effect.comp) {
                            if (effect.comp.hasOwnProperty(key)) {
                                const prop = effect.comp[key];
                                if (prop.type == "IdAndName") {
                                    if (Array.isArray(prop.value)) {
                                        saveToPrefab(effect.comp.uuid.value, key, prop.type, prop.value.map(val => {
                                            return val.value.id.value
                                        }))
                                    } else {
                                        debugger
                                        saveToPrefab(effect.comp.uuid.value, key, prop.type, prop.value.id.value)
                                    }
                                } else if (prop.type == "Object" && prop.value == null) {

                                }
                            }
                        }
                    }

                    console.log(mappedActives);
                    // const comps = this.selectedCardNode.value["__comps__"]
                    // comps['469baVqArxNIJpM2pHjkHeJ'].cardName.value = "The Bone 2"
                    // const compUUid = comps['469baVqArxNIJpM2pHjkHeJ'].uuid.value;
                    // Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                    //     id: 'e0pKiQ/yhNXLd0vj/ZgoxB',
                    //     path: "cardName",
                    //     type: "String",
                    //     value: "The Bone 2",
                    //     isSubProp: true,
                    // });
                },
            },

            created() {
                const getEffectsList = (effectIdsName, effectsArray) => {
                    const comps = this.selectedCardNode.value["__comps__"]
                    const activeEffectsIdAndNames = this.cardEffectComp['value'][effectIdsName]['value']
                    for (const idAndName of activeEffectsIdAndNames) {
                        const name = idAndName['value']['name']['value']
                        const id = idAndName['value']['id']['value']
                        for (const comp of comps) {
                            if (comp['value']['name']['value'].includes(name) && comp['value']['EffectId']['value'].toString() == id.toString()) {
                                effectsArray.push({
                                    name,
                                    id,
                                    comp: comp.value
                                })
                            }
                        }

                    }
                }

                const getListByExtendsString = (string, list) => {
                    const types = this.selectedCardNode.types
                    const comps = this.selectedCardNode.value["__comps__"]
                    for (const type in types) {
                        if (types.hasOwnProperty(type)) {
                            const typeData = types[type];
                            if (typeData.extends != undefined && typeData.extends.includes(string)) {

                                const aComp = comps.find(comp => comp.type == type)
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
                                        name: compName,
                                        comp: aComp.value,
                                        id: id
                                    })
                                } else {
                                    Editor.log(`tring to get type:${type} named ${typeData.name}, but not found a component with that type`)
                                }
                            }
                        }
                    }
                }

                const getAvailableEffects = () => {
                    const types = this.selectedCardNode.types
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
                    const comps = this.selectedCardNode.value["__comps__"]
                    for (const comp of comps) {
                        if (foundTypes.includes(comp.type)) {
                            avalEffects.push(comp.value)
                        }
                    }
                    this.availableEffects = avalEffects.map(ef => {
                        return {
                            name: ef.name.value,
                            id: ef.EffectId.value,
                            comp: ef
                        }
                    });
                }
                Editor.Ipc.sendToPanel('scene', 'scene:query-nodes-by-comp-name', 'CardEffect', (error, nodes) => {
                    if (error)
                        return Editor.error(error);
                    this.nodeId = nodes[0]
                    Editor.Ipc.sendToPanel('scene', 'scene:query-node', this.nodeId, (error, dump) => {
                        if (error)
                            return Editor.error(error);
                        this.selectedCardNode = JSON.parse(dump)
                        const comps = this.selectedCardNode.value["__comps__"]
                        this.cardEffectComp = comps.find(comp => comp["type"] == "bd535UKRTNDu7iLPx8/+FlC")
                        getEffectsList('activeEffectsIds', this.activeEffects)
                        getEffectsList('passiveEffectsIds', this.passiveEffects)
                        getEffectsList('toAddPassiveEffectsIds', this.toAddPassiveEffects)
                        getEffectsList('paidEffectsIds', this.paidEffects)
                        getAvailableEffects()
                        Editor.log(JSON.stringify(this.selectedCardNode))
                        // Editor.log(JSON.stringify(this.selectedCardNode.types))
                        const allTypes = [{
                            type: dataConcucrencyType,
                            list: this.dataConcurencies
                        }, {
                            type: dataCollectorType,
                            list: this.dataCollectors
                        }, {
                            type: costType,
                            list: this.costs
                        }, {
                            type: preConditionType,
                            list: this.preConditions
                        }, {
                            type: conditionType,
                            list: this.conditions
                        }]
                        for (const type of allTypes) {
                            getListByExtendsString(type.type, type.list)
                        }
                        //  Editor.log(JSON.stringify(this.allCardEffectComponents()))
                    });
                });
            }
        });
    },

    template: `
    <h2>Panel</h2>
    <ui-button id="btn" @click="saveBtnClick">כפתור</ui-button>
    <hr />  
    <div style="height:550px">
    <div id="allDiv" v-if="cardEffectComp!=null" style="overflow-y:scroll;height:100%" >
        <div>
        <h2>Active Effects: </h2>
        <array-change :components="getComponentsObject()" :key="'effect'" :array="activeEffects"> </array-change>
        <ul id="activeEffectsUl">     
        <effect-view v-for="effect in activeEffects" :components-object="getComponentsObject()" :all-comp="allCardEffectComponents()" :effect="effect"/>
        </ul>
        </div>
        <div>
        <h2>Passive Effects: </h2>
        <ul id="passiveEffectsUl">
        <effect-view v-for="effect in passiveEffects" v-bind:effect-name="effect.name" v-bind:effect-id="effect.id"/>
        </ul>
        </div>
        <div>
        <h2>Paid Effects: </h2>
        <ul id="paidEffectsUl">
        <effect-view v-for="effect in paidEffects" v-bind:effect-name="effect.name" v-bind:effect-id="effect.id"/>
        </ul>
        </div>
        <div>
        <h2>To Add Passive Effects: </h2>
        <ul id="toAddPassiveUl">
        <effect-view v-for="effect in toAddPassiveEffects" v-bind:effect-name="effect.name" v-bind:effect-id="effect.id"/>
        </ul>
        </div>
    </div>
    </div>
  `,



});