import { Component, _decorator } from 'cc';
const { ccclass, property } = _decorator;

// export function handleEffect(newComp: Effect, oldComp: Effect, node: cc.Node, effectType: ITEM_TYPE, addToEffectList: boolean) {
//     const cardEffectComp = node.getComponent(CardEffect);
//     copyEffect(oldComp, newComp)
//     if (addToEffectList) {
//         switch (effectType) {
//             case ITEM_TYPE.ACTIVE:
//                 cardEffectComp.activeEffectsIdsFinal.push(newComp.EffectId)
//                 break;
//             case ITEM_TYPE.PASSIVE:
//                 cardEffectComp.passiveEffectsIdsFinal.push(newComp.EffectId)
//                 break;
//             case ITEM_TYPE.PAID:
//                 cardEffectComp.paidEffectsIdsFinal.push(newComp.EffectId)
//                 break;
//             case ITEM_TYPE.TO_ADD_PASSIVE:
//                 cardEffectComp.toAddPassiveEffectsIdsFinal.push(newComp.EffectId)
//                 break;
//             default:
//                 break;
//         }
//     }
//     handleEffectConditions(newComp, node);
//     handleEffectPreConditions(newComp, node);
//     handleEffectDataCollectors(newComp, node);
//     handleEffectDataConcurrencyComp(newComp, node)
//     handleEffectPassiveToAdd(newComp, node);
//     handleEffectCosts(newComp, node)
//     newComp.effectPosition = new EffectPosition()
//     newComp.effectPosition.x = oldComp.node.x
//     newComp.effectPosition.y = oldComp.node.y
//     newComp.effectPosition.height = oldComp.node.height
//     newComp.effectPosition.width = oldComp.node.width
//     oldComp.hasBeenHandled = true
//     oldComp.EffectId = newComp.EffectId
//     newComp.hasBeenHandled = true
//     return newComp.EffectId
// }
// export function handleEffectCosts(newComp: Effect, node: cc.Node) {
//     if (newComp.cost) {
//         const newCost: Cost = node.addComponent(newComp.cost.constructor.name);
//         // copyEffect(newComp.passiveEffectToAdd, newEffect);
//         newCost.setCostId()
//         newComp.costId = newCost.CostId
//         copyEffect(newComp.cost, newCost);
//         newComp.cost = null
//     }
// }
// export function handleEffectDataConcurrencyComp(newComp: Effect, node: cc.Node) {
//     if (newComp.dataConcurencyComponent) {
//         const newConcurrency: EffectDataConcurencyBase = node.addComponent(newComp.dataConcurencyComponent.constructor.name);
//         // copyEffect(newComp.passiveEffectToAdd, newEffect);
//         newConcurrency.setDataConcurencyId()
//         newComp.dataConcurencyComponentId = newConcurrency.ConcurencyId
//         copyEffect(newComp.dataConcurencyComponent, newConcurrency);
//         newComp.dataConcurencyComponent = null
//     }
// }
// export function handleEffectConditions(newComp: Effect, node: cc.Node) {
//     const condIds = [];
//     newComp.conditions.forEach(condition => {
//         const newCond: Condition = createNewCondition(node, condition);
//         condIds.push(newCond.ConditionId);
//     });
//     newComp.conditionsIdsFinal = condIds;
//     newComp.conditions = []
// }
// export function createNewCondition(node: cc.Node, condition: Condition) {
//     const newCond: Condition = node.addComponent(condition.constructor.name);
//     newCond.setConditionId();
//     copyEffect(condition, newCond);
//     newCond.setWithOld(condition)
//     if (newCond.dataCollector) {
//         handleConditionDataCollectors(newCond, node);
//     }
//     condition.newCompCondition = newCond
//     return newCond;
// }
// export function handleConditionDataCollectors(condition: Condition, node: cc.Node) {
//     if (condition.dataCollector) {
//         const newId = createNewDataCollector(node, condition.dataCollector)
//         condition.dataCollectorId = newId
//         condition.dataCollector = null
//     }
// }
// export function handleDataCollectorCost(dataCollector: DataCollector, node: cc.Node) {
//     if (dataCollector.cost) {
//         const newCost: Cost = node.addComponent(dataCollector.cost.constructor.name);
//         newCost.setCostId()
//         dataCollector.costId = newCost.CostId
//         copyEffect(dataCollector.cost, newCost);
//         if (newCost.preCondition) {
//             handleCostPreCondition(newCost, node)
//         }
//         dataCollector.cost = null
//     }
// }
// export function handleCostPreCondition(cost: Cost, node: cc.Node) {
//     if (cost.preCondition) {
//         const newId = createNewPreCondition(node, cost.preCondition)
//         cost.preConditionId = newId
//         cost.preCondition = null
//     }
// }
// export function handleEffectDataCollectors(newComp: Effect, node: cc.Node) {
//     const dataCollectorIds = Array.isArray(newComp.conditionsIdsFinal) ? newComp.conditionsIdsFinal : [];
//     if (newComp.dataCollector) {
//         if (Array.isArray(newComp.dataCollector)) {
//             newComp.dataCollector.forEach(dataCollector => {
//                 if (!(dataCollector instanceof ChainCollector)) {
//                     const id = createNewDataCollector(node, dataCollector);
//                     dataCollectorIds.push(id)
//                 }
//             });
//         } else {
//             const dataCollector = newComp.dataCollector as DataCollector
//             if (!(dataCollector instanceof ChainCollector)) {
//                 const id = createNewDataCollector(node, dataCollector);
//                 dataCollectorIds.push(id)
//             }
//         }
//         newComp.conditionsIdsFinal = dataCollectorIds;
//         newComp.dataCollector = []
//     }
// }
// export function createNewDataCollector(node: cc.Node, dataCollector: DataCollector) {
//     const newDataCollector: DataCollector = node.addComponent(dataCollector.constructor.name);
//     newDataCollector.setDataCollectorId();
//     copyEffect(dataCollector, newDataCollector);
//     newDataCollector.setWithOld(dataCollector)
//     dataCollector.hasBeenHandled = true
//     dataCollector.DataCollectorId = newDataCollector.DataCollectorId;
//     handleDataCollectorCost(newDataCollector, node)
//     return newDataCollector.DataCollectorId
// }
// export function handleEffectPassiveToAdd(newComp: Effect, node: cc.Node) {
//     if (newComp.passiveEffectToAdd) {
//         if (!newComp.passiveEffectToAdd.hasBeenHandled) {
//             const newEffect: Effect = node.addComponent(newComp.passiveEffectToAdd.constructor.name);
//             // copyEffect(newComp.passiveEffectToAdd, newEffect);
//             newEffect.setEffectId()
//             newComp.passiveEffectToAddId = newEffect.EffectId
//             handleEffect(newEffect, newComp.passiveEffectToAdd, node, ITEM_TYPE.TO_ADD_PASSIVE, true)
//         }
//         newComp.passiveEffectToAdd = null
//     }
// }
// export function createNewPreCondition(node: cc.Node, preCondition: PreCondition) {
//     const newCond: PreCondition = node.addComponent(preCondition.constructor.name);
//     newCond.setPreConditionId()
//     copyEffect(preCondition, newCond);
//     newCond.setWithOld(preCondition)
//     if (preCondition.dataCollector) {
//         handlePreConditionDataCollectors(preCondition, node)
//     }
//     return newCond.PreConditionId
// }
// export function handleEffectPreConditions(newComp: Effect, node: cc.Node) {
//     if (newComp.preCondition) {
//         const newId = createNewPreCondition(node, newComp.preCondition)
//         newComp.preConditionId = newId
//         newComp.preCondition = null
//     }
// }
// export function handlePreConditionDataCollectors(preCondition: PreCondition, node: cc.Node) {
//     if (preCondition.dataCollector) {
//         const newId = createNewDataCollector(node, preCondition.dataCollector)
//         preCondition.dataCollectorId = newId
//         preCondition.dataCollector = null
//     }
// }
// export function copyEffect(oldEffect: cc.Component, newEffect: cc.Component) {
//     let keys = Object.keys(oldEffect);
//     const ccKeys = ["_super", "_name", "_objFlags", "node", "_enabled", "_watcherHandle", "_id", "__eventTargets"]
//     keys = keys.filter(key => !ccKeys.includes(key))
//     for (let i = 0; i < keys.length; i++) {
//         const key = keys[i];
//         const oldVal = oldEffect[key]
//         if (key.includes('Id') && newEffect[key] > oldVal) {
//         } else {
//             newEffect[key] = oldVal
//         }
//     }
// }
// export function getEffectType(node: cc.Node, effect: Effect) {
//     const cardEffectComp = node.getComponent(CardEffect);
//     // if (cardEffectComp.activeEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
//     //     return ITEM_TYPE.ACTIVE
//     // }
//     // if (cardEffectComp.passiveEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
//     //     return ITEM_TYPE.PASSIVE
//     // }
//     // if (cardEffectComp.paidEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
//     //     return ITEM_TYPE.PAID
//     // }
//     // if (cardEffectComp.toAddPassiveEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
//     //     return ITEM_TYPE.TO_ADD_PASSIVE
//     // }
//     throw new Error("should not get here")
//     return ITEM_TYPE.ACTIVE
// }
// export function createNewEffect(oldComp: Effect, node: cc.Node, addToEffectList: boolean) {
//     const newComp: Effect = node.addComponent(oldComp.constructor.name);
//     newComp.resetInEditor();
//     newComp.setEffectId();
//     copyEffect(oldComp, newComp);
//     newComp.setWithOld(oldComp);
//     return handleEffect(newComp, oldComp, node, getEffectType(node, oldComp), addToEffectList);
// }
//     @property(cc.Boolean)
//     isFirstTime = true
//     resetInEditor() {
//         return
//         // if (this.node && this.isFirstTime) {
//         //     const effects = this.node.children.filter(child => child.getComponent(Effect) != null)
//         //     const cardEffectComp = this.node.getComponent(CardEffect)
//         //     try {
//         //         if (cardEffectComp.multiEffectCollector && !cardEffectComp.isHandlingMultiEffectCollector) {
//         //             cardEffectComp.isHandlingMultiEffectCollector = true
//         //             const newDataCollector: DataCollector = this.node.addComponent(cardEffectComp.multiEffectCollector.constructor.name);
//         //             newDataCollector.setDataCollectorId()
//         //             cardEffectComp.multiEffectCollectorId = newDataCollector.DataCollectorId
//         //             copyEffect(cardEffectComp.multiEffectCollector, newDataCollector);
//         //             newDataCollector.hasBeenHandled = true
//         //             cardEffectComp.multiEffectCollector.hasBeenHandled = true
//         //             newDataCollector.setWithOld(cardEffectComp.multiEffectCollector)
//         //             if (cardEffectComp.multiEffectCollector.cost) {
//         //                 handleDataCollectorCost(newDataCollector, this.node)
//         //             }
//         //             cardEffectComp.multiEffectCollector = null
//         //         }
//         //         for (let i = 0; i < effects.length; i++) {
//         //             const effectNode = effects[i];
//         //             const oldComp = effectNode.getComponent(Effect)
//         //             if (!oldComp.hasBeenHandled) {
//         //                 createNewEffect(oldComp, this.node, true);
//         //             }
//         //         }
//         //         const cardEffect = this.node.getComponent(CardEffect);
//         //         cardEffect.activeEffects = []
//         //         cardEffect.passiveEffects = []
//         //         cardEffect.paidEffects = []
//         //         cardEffect.toAddPassiveEffects = []
//         //         this.node.removeAllChildren()
//         //         this.isFirstTime = false
//         //     } catch (error) {
//         //         throw error
//         //     }
//         // }
//     }
//     // LIFE-CYCLE CALLBACKS:
//     // onLoad () {}
//     start() {
//     }
//     // update (dt) {}
// }

@ccclass('Reset')
export class Reset extends Component {
}

/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// import { Card } from "../../Server/src/entities/Card";
// import Condition from "./CardEffectComponents/CardConditions/Condition";
// import Effect from "./CardEffectComponents/CardEffects/Effect";
// import  {Cost} from "./CardEffectComponents/Costs/Cost";
// import  {ChainCollector} from "./CardEffectComponents/DataCollector/ChainCollector";
// import  {DataCollector} from "./CardEffectComponents/DataCollector/DataCollector";
// import  {EffectDataConcurencyBase} from "./CardEffectComponents/EffectDataConcurency/EffectDataConcurencyBase";
// import{ IEffectDataConcurency } from "./CardEffectComponents/EffectDataConcurency/IEffectDataConcurency";
// import IdAndName from "./CardEffectComponents/IdAndNameComponent";
// import  {PreCondition} from "./CardEffectComponents/PreConditions/PreCondition";
// import { ITEM_TYPE } from "./Constants";
// import EffectPosition from "./EffectPosition";
// import CardEffect from "./Entites/CardEffect";
// 
// const { ccclass, property } = cc._decorator;
// 
// // export function handleEffect(newComp: Effect, oldComp: Effect, node: cc.Node, effectType: ITEM_TYPE, addToEffectList: boolean) {
// //     const cardEffectComp = node.getComponent(CardEffect);
// //     copyEffect(oldComp, newComp)
// //     if (addToEffectList) {
// //         switch (effectType) {
// //             case ITEM_TYPE.ACTIVE:
// //                 cardEffectComp.activeEffectsIdsFinal.push(newComp.EffectId)
// //                 break;
// //             case ITEM_TYPE.PASSIVE:
// //                 cardEffectComp.passiveEffectsIdsFinal.push(newComp.EffectId)
// //                 break;
// //             case ITEM_TYPE.PAID:
// //                 cardEffectComp.paidEffectsIdsFinal.push(newComp.EffectId)
// //                 break;
// //             case ITEM_TYPE.TO_ADD_PASSIVE:
// //                 cardEffectComp.toAddPassiveEffectsIdsFinal.push(newComp.EffectId)
// //                 break;
// //             default:
// //                 break;
// //         }
// //     }
// //     handleEffectConditions(newComp, node);
// //     handleEffectPreConditions(newComp, node);
// //     handleEffectDataCollectors(newComp, node);
// //     handleEffectDataConcurrencyComp(newComp, node)
// //     handleEffectPassiveToAdd(newComp, node);
// //     handleEffectCosts(newComp, node)
// 
// 
// //     newComp.effectPosition = new EffectPosition()
// //     newComp.effectPosition.x = oldComp.node.x
// //     newComp.effectPosition.y = oldComp.node.y
// //     newComp.effectPosition.height = oldComp.node.height
// //     newComp.effectPosition.width = oldComp.node.width
// //     oldComp.hasBeenHandled = true
// //     oldComp.EffectId = newComp.EffectId
// //     newComp.hasBeenHandled = true
// //     return newComp.EffectId
// // }
// 
// // export function handleEffectCosts(newComp: Effect, node: cc.Node) {
// //     if (newComp.cost) {
// //         const newCost: Cost = node.addComponent(newComp.cost.constructor.name);
// //         // copyEffect(newComp.passiveEffectToAdd, newEffect);
// //         newCost.setCostId()
// //         newComp.costId = newCost.CostId
// //         copyEffect(newComp.cost, newCost);
// //         newComp.cost = null
// //     }
// // }
// 
// 
// // export function handleEffectDataConcurrencyComp(newComp: Effect, node: cc.Node) {
// //     if (newComp.dataConcurencyComponent) {
// //         const newConcurrency: EffectDataConcurencyBase = node.addComponent(newComp.dataConcurencyComponent.constructor.name);
// //         // copyEffect(newComp.passiveEffectToAdd, newEffect);
// //         newConcurrency.setDataConcurencyId()
// //         newComp.dataConcurencyComponentId = newConcurrency.ConcurencyId
// //         copyEffect(newComp.dataConcurencyComponent, newConcurrency);
// //         newComp.dataConcurencyComponent = null
// //     }
// // }
// 
// 
// 
// // export function handleEffectConditions(newComp: Effect, node: cc.Node) {
// //     const condIds = [];
// //     newComp.conditions.forEach(condition => {
// //         const newCond: Condition = createNewCondition(node, condition);
// //         condIds.push(newCond.ConditionId);
// //     });
// //     newComp.conditionsIdsFinal = condIds;
// //     newComp.conditions = []
// // }
// 
// 
// // export function createNewCondition(node: cc.Node, condition: Condition) {
// //     const newCond: Condition = node.addComponent(condition.constructor.name);
// //     newCond.setConditionId();
// //     copyEffect(condition, newCond);
// //     newCond.setWithOld(condition)
// //     if (newCond.dataCollector) {
// //         handleConditionDataCollectors(newCond, node);
// //     }
// //     condition.newCompCondition = newCond
// //     return newCond;
// // }
// 
// // export function handleConditionDataCollectors(condition: Condition, node: cc.Node) {
// //     if (condition.dataCollector) {
// //         const newId = createNewDataCollector(node, condition.dataCollector)
// //         condition.dataCollectorId = newId
// //         condition.dataCollector = null
// //     }
// // }
// 
// 
// // export function handleDataCollectorCost(dataCollector: DataCollector, node: cc.Node) {
// //     if (dataCollector.cost) {
// //         const newCost: Cost = node.addComponent(dataCollector.cost.constructor.name);
// //         newCost.setCostId()
// //         dataCollector.costId = newCost.CostId
// //         copyEffect(dataCollector.cost, newCost);
// //         if (newCost.preCondition) {
// //             handleCostPreCondition(newCost, node)
// //         }
// //         dataCollector.cost = null
// //     }
// // }
// 
// // export function handleCostPreCondition(cost: Cost, node: cc.Node) {
// //     if (cost.preCondition) {
// //         const newId = createNewPreCondition(node, cost.preCondition)
// //         cost.preConditionId = newId
// //         cost.preCondition = null
// //     }
// // }
// 
// // export function handleEffectDataCollectors(newComp: Effect, node: cc.Node) {
// //     const dataCollectorIds = Array.isArray(newComp.conditionsIdsFinal) ? newComp.conditionsIdsFinal : [];
// //     if (newComp.dataCollector) {
// //         if (Array.isArray(newComp.dataCollector)) {
// //             newComp.dataCollector.forEach(dataCollector => {
// //                 if (!(dataCollector instanceof ChainCollector)) {
// //                     const id = createNewDataCollector(node, dataCollector);
// //                     dataCollectorIds.push(id)
// //                 }
// //             });
// //         } else {
// //             const dataCollector = newComp.dataCollector as DataCollector
// //             if (!(dataCollector instanceof ChainCollector)) {
// //                 const id = createNewDataCollector(node, dataCollector);
// //                 dataCollectorIds.push(id)
// //             }
// //         }
// //         newComp.conditionsIdsFinal = dataCollectorIds;
// //         newComp.dataCollector = []
// //     }
// // }
// 
// // export function createNewDataCollector(node: cc.Node, dataCollector: DataCollector) {
// //     const newDataCollector: DataCollector = node.addComponent(dataCollector.constructor.name);
// //     newDataCollector.setDataCollectorId();
// //     copyEffect(dataCollector, newDataCollector);
// //     newDataCollector.setWithOld(dataCollector)
// //     dataCollector.hasBeenHandled = true
// //     dataCollector.DataCollectorId = newDataCollector.DataCollectorId;
// //     handleDataCollectorCost(newDataCollector, node)
// //     return newDataCollector.DataCollectorId
// // }
// 
// // export function handleEffectPassiveToAdd(newComp: Effect, node: cc.Node) {
// //     if (newComp.passiveEffectToAdd) {
// //         if (!newComp.passiveEffectToAdd.hasBeenHandled) {
// //             const newEffect: Effect = node.addComponent(newComp.passiveEffectToAdd.constructor.name);
// //             // copyEffect(newComp.passiveEffectToAdd, newEffect);
// //             newEffect.setEffectId()
// //             newComp.passiveEffectToAddId = newEffect.EffectId
// //             handleEffect(newEffect, newComp.passiveEffectToAdd, node, ITEM_TYPE.TO_ADD_PASSIVE, true)
// //         }
// //         newComp.passiveEffectToAdd = null
// //     }
// // }
// 
// // export function createNewPreCondition(node: cc.Node, preCondition: PreCondition) {
// //     const newCond: PreCondition = node.addComponent(preCondition.constructor.name);
// //     newCond.setPreConditionId()
// //     copyEffect(preCondition, newCond);
// //     newCond.setWithOld(preCondition)
// //     if (preCondition.dataCollector) {
// //         handlePreConditionDataCollectors(preCondition, node)
// //     }
// //     return newCond.PreConditionId
// // }
// 
// // export function handleEffectPreConditions(newComp: Effect, node: cc.Node) {
// //     if (newComp.preCondition) {
// //         const newId = createNewPreCondition(node, newComp.preCondition)
// //         newComp.preConditionId = newId
// //         newComp.preCondition = null
// //     }
// // }
// 
// // export function handlePreConditionDataCollectors(preCondition: PreCondition, node: cc.Node) {
// //     if (preCondition.dataCollector) {
// //         const newId = createNewDataCollector(node, preCondition.dataCollector)
// //         preCondition.dataCollectorId = newId
// //         preCondition.dataCollector = null
// //     }
// // }
// 
// // export function copyEffect(oldEffect: cc.Component, newEffect: cc.Component) {
// //     let keys = Object.keys(oldEffect);
// //     const ccKeys = ["_super", "_name", "_objFlags", "node", "_enabled", "_watcherHandle", "_id", "__eventTargets"]
// //     keys = keys.filter(key => !ccKeys.includes(key))
// //     for (let i = 0; i < keys.length; i++) {
// //         const key = keys[i];
// //         const oldVal = oldEffect[key]
// //         if (key.includes('Id') && newEffect[key] > oldVal) {
// 
// //         } else {
// //             newEffect[key] = oldVal
// //         }
// //     }
// // }
// 
// // export function getEffectType(node: cc.Node, effect: Effect) {
// //     const cardEffectComp = node.getComponent(CardEffect);
// //     // if (cardEffectComp.activeEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
// //     //     return ITEM_TYPE.ACTIVE
// //     // }
// //     // if (cardEffectComp.passiveEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
// //     //     return ITEM_TYPE.PASSIVE
// //     // }
// //     // if (cardEffectComp.paidEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
// //     //     return ITEM_TYPE.PAID
// //     // }
// //     // if (cardEffectComp.toAddPassiveEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
// //     //     return ITEM_TYPE.TO_ADD_PASSIVE
// //     // }
// //     throw new Error("should not get here")
// //     return ITEM_TYPE.ACTIVE
// // }
// 
// // export function createNewEffect(oldComp: Effect, node: cc.Node, addToEffectList: boolean) {
// //     const newComp: Effect = node.addComponent(oldComp.constructor.name);
// //     newComp.resetInEditor();
// //     newComp.setEffectId();
// //     copyEffect(oldComp, newComp);
// //     newComp.setWithOld(oldComp);
// //     return handleEffect(newComp, oldComp, node, getEffectType(node, oldComp), addToEffectList);
// // }
// 
// @ccclass
// export class Reset extends cc.Component {
// }
// //     @property(cc.Boolean)
// //     isFirstTime = true
// 
// //     resetInEditor() {
// //         return
// //         // if (this.node && this.isFirstTime) {
// //         //     const effects = this.node.children.filter(child => child.getComponent(Effect) != null)
// //         //     const cardEffectComp = this.node.getComponent(CardEffect)
// //         //     try {
// //         //         if (cardEffectComp.multiEffectCollector && !cardEffectComp.isHandlingMultiEffectCollector) {
// //         //             cardEffectComp.isHandlingMultiEffectCollector = true
// //         //             const newDataCollector: DataCollector = this.node.addComponent(cardEffectComp.multiEffectCollector.constructor.name);
// //         //             newDataCollector.setDataCollectorId()
// //         //             cardEffectComp.multiEffectCollectorId = newDataCollector.DataCollectorId
// //         //             copyEffect(cardEffectComp.multiEffectCollector, newDataCollector);
// //         //             newDataCollector.hasBeenHandled = true
// //         //             cardEffectComp.multiEffectCollector.hasBeenHandled = true
// //         //             newDataCollector.setWithOld(cardEffectComp.multiEffectCollector)
// //         //             if (cardEffectComp.multiEffectCollector.cost) {
// //         //                 handleDataCollectorCost(newDataCollector, this.node)
// //         //             }
// //         //             cardEffectComp.multiEffectCollector = null
// //         //         }
// 
// //         //         for (let i = 0; i < effects.length; i++) {
// //         //             const effectNode = effects[i];
// //         //             const oldComp = effectNode.getComponent(Effect)
// //         //             if (!oldComp.hasBeenHandled) {
// //         //                 createNewEffect(oldComp, this.node, true);
// //         //             }
// //         //         }
// //         //         const cardEffect = this.node.getComponent(CardEffect);
// //         //         cardEffect.activeEffects = []
// //         //         cardEffect.passiveEffects = []
// //         //         cardEffect.paidEffects = []
// //         //         cardEffect.toAddPassiveEffects = []
// //         //         this.node.removeAllChildren()
// //         //         this.isFirstTime = false
// //         //     } catch (error) {
// //         //         throw error
// //         //     }
// //         // }
// //     }
// 
// 
// //     // LIFE-CYCLE CALLBACKS:
// 
// //     // onLoad () {}
// 
// //     start() {
// 
// //     }
// 
// //     // update (dt) {}
// // }
