Editor.Panel.extend({
  style: `
      :host { margin: 5px; }
      h2 { color: #f90; }
    `,

  //  <li v-for="effect in activeEffects" key="effect.id">Name: {{effect.name}} Id:{{effect.id}}</li>
  $: {
    reactId: "#reactId"
  },



  ready() {
    const notIntrestingCompValues = ['_name', 'uuid', 'cost', 'conditions', 'dataConcurencyComponent', '_effectCard', 'preCondition', 'passiveEffectToAdd', 'dataCollector', '_objFlags', 'node', '__scriptAsset', '_enabled', 'enabled', 'enabledInHierarchy', '_isOnLoadCalled', '_id']

    const thisUrl = 'C:/Users/sagi.ofir/Documents/FourSouls/NewProject/packages/cardEffectViewer/panel'
    const dataCollectorType = '934deiBNWNK0IL0stJPLtlB'
    const costType = '28d7fAwgutAbJv3JqFDotZ2'
    const preConditionType = '5f885/+i49NwKzsdXqJ+hnq'
    const conditionType = '3c7bd9tmzlFNbJ3nD3RwVOA'
    const dataConcucrencyType = '7496eJlecdMfpCUk/s/ol2S'
    // var babel = require("@babel/core");
    // var reactPreset = require('C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/@babel/preset-react')
    // const file= babel.transformFileSync(thisUrl+"cardEffectViewer/panel/test.jsx", {
    //   presets: [reactPreset]
    // })
    // const Test =eval(file.code)
    const babelRequire = require(thisUrl + '/babelReuire')
    const React = require('C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/react/index')
    const reactDom = require('C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/react-dom/index')
    const App = babelRequire('C:/Users/sagi.ofir/Documents/FourSouls/NewProject/packages/cardEffectViewer/panel/App.tsx')
    const EffectView = babelRequire(thisUrl + '/EffectViewReact.tsx')
    const EffectCompArray = babelRequire(thisUrl + '/EffectCompArray.tsx')
    const EffectCompSingle = babelRequire(thisUrl + '/EffectCompSingle.tsx')
    const e = React.createElement;

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
    var availavleEffects = []


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
                name: compName.replace(regex, `$1`),
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

    const renderReact = () => {
      reactDom.render(
        e(App, {
          cardEffectComp,
          nodeId,
          selectedCardNode,
          activeEffects,
          passiveEffects,
          toAddPassiveEffects,
          paidEffects,
          preConditions,
          conditions,
          dataCollectors,
          costs,
          dataConcurencies,
          availavleEffects,
          requires: {
            EffectView,
            EffectCompArray,
            EffectCompSingle,

          },
          isUsingFinal: false
        }), this.$reactId)

    }



    renderReact()
    const dataIdsNames = ['DataCollectorId', 'PreConditionId', 'ConditionId', 'EffectId', 'CostId', 'ConcurencyId']

    const compNames = ['costId', 'preConditionId']

  },

  template: `
  <div id='reactId'></div>
  `,





});