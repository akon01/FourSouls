
import Condition from "./CardEffectComponents/CardConditions/Condition";
import Effect from "./CardEffectComponents/CardEffects/Effect";
import DataCollector from "./CardEffectComponents/DataCollector/DataCollector";
import PreCondition from "./CardEffectComponents/PreConditions/PreCondition";
import { ITEM_TYPE } from "./Constants";
import CardEffect from "./Entites/CardEffect";

const { ccclass, property } = cc._decorator;

export function handleEffect(newComp: Effect, oldComp: Effect, node: cc.Node, effectType: ITEM_TYPE) {
    const cardEffectComp = node.getComponent(CardEffect);
    copyEffect(oldComp, newComp)
    switch (effectType) {
        case ITEM_TYPE.ACTIVE:
            cardEffectComp.activeEffectsIds.push(newComp.EffectId)
            break;
        case ITEM_TYPE.PASSIVE:
            cardEffectComp.passiveEffectsIds.push(newComp.EffectId)
            break;
        case ITEM_TYPE.PAID:
            cardEffectComp.paidEffectsIds.push(newComp.EffectId)
            break;
        case ITEM_TYPE.TO_ADD_PASSIVE:
            cardEffectComp.toAddPassiveEffectsIds.push(newComp.EffectId)
            break;
        default:
            break;
    }
    handleEffectConditions(newComp, node);
    handleEffectPreConditions(newComp, node);
    handleEffectDataCollectors(newComp, node);
    handleEffectPassiveToAdd(newComp, node);
}

export function handleEffectConditions(newComp: Effect, node: cc.Node) {
    const condIds = [];
    newComp.conditions.forEach(condition => {
        const newCond: Condition = node.addComponent(condition.constructor.name);
        newCond.setConditionId()
        condIds.push(newCond.conditionId);
        copyEffect(condition, newCond);
        if (newCond.dataCollector) {
            handleConditionDataCollectors(newCond, node)
        }
    });
    newComp.conditionsIds = condIds;
}


export function handleConditionDataCollectors(condition: Condition, node: cc.Node) {
    if (condition.dataCollector) {
        const newDataCollector: DataCollector = node.addComponent(condition.dataCollector.constructor.name);
        newDataCollector.setDataCollectorId()
        condition.dataCollectorId = newDataCollector.DataCollectorId
        copyEffect(condition.dataCollector, newDataCollector);

    }
}

export function handleEffectDataCollectors(newComp: Effect, node: cc.Node) {
    const dataCollectorIds = [];
    newComp.dataCollector.forEach(dataCollector => {
        const newDataCollector: DataCollector = node.addComponent(dataCollector.constructor.name);
        newDataCollector.setDataCollectorId()
        dataCollectorIds.push(newDataCollector.DataCollectorId);
        copyEffect(dataCollector, newDataCollector);
    });
    newComp.dataCollectorsIds = dataCollectorIds;
}

export function handleEffectPassiveToAdd(newComp: Effect, node: cc.Node) {
    if (newComp.passiveEffectToAdd) {
        const newEffect: Effect = node.addComponent(newComp.passiveEffectToAdd.constructor.name);
        // copyEffect(newComp.passiveEffectToAdd, newEffect);
        newEffect.setEffectId()
        newComp.passiveEffectToAddId = newEffect.EffectId

        handleEffect(newComp.passiveEffectToAdd, newComp.passiveEffectToAdd, node, ITEM_TYPE.TO_ADD_PASSIVE)

    }

}

export function handleEffectPreConditions(newComp: Effect, node: cc.Node) {
    if (newComp.preCondition) {
        const newCond: PreCondition = node.addComponent(newComp.preCondition.constructor.name);
        copyEffect(newComp.preCondition, newCond);
        newCond.setPreConditionId()
        if (newComp.preCondition.dataCollector) {
            handlePreConditionDataCollectors(newComp.preCondition, node)
        }
        newComp.preConditionId = newCond.preConditionId
    }
}

export function handlePreConditionDataCollectors(preCondition: PreCondition, node: cc.Node) {
    if (preCondition.dataCollector) {
        const newDataCollector: DataCollector = node.addComponent(preCondition.dataCollector.constructor.name);
        newDataCollector.setDataCollectorId()
        preCondition.dataCollectorId = newDataCollector.DataCollectorId
        copyEffect(preCondition.dataCollector, newDataCollector);
    }
}

export function copyEffect(oldEffect: cc.Component, newEffect: cc.Component) {
    let keys = Object.keys(oldEffect);
    const ccKeys = ["_super", "_name", "_objFlags", "node", "_enabled", "_watcherHandle", "_id", "__eventTargets"]
    keys = keys.filter(key => !ccKeys.includes(key))
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const oldVal = oldEffect[key]
        debugger
        if (key.includes('Id') && newEffect[key] > oldVal) {

        } else {
            newEffect[key] = oldVal
        }
    }
}

export function getEffectType(node: cc.Node, effect: Effect) {
    const cardEffectComp = node.getComponent(CardEffect);
    if (cardEffectComp.activeEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
        return ITEM_TYPE.ACTIVE
    }
    if (cardEffectComp.passiveEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
        return ITEM_TYPE.PASSIVE
    }
    if (cardEffectComp.paidEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
        return ITEM_TYPE.PAID
    }
    if (cardEffectComp.toAddPassiveEffects.map(ae => ae.getComponent(Effect)).includes(effect)) {
        return ITEM_TYPE.TO_ADD_PASSIVE
    }
}

@ccclass
export default class Reset extends cc.Component {
    resetInEditor() {
        if (this.node) {
            const effects = this.node.children.filter(child => child.getComponent(Effect) != null)
            for (let i = 0; i < effects.length; i++) {
                const effectNode = effects[i];
                const oldComp = effectNode.getComponent(Effect)
                const type = oldComp.constructor.name
                const newComp: Effect = this.node.addComponent(type)
                newComp.resetInEditor()
                newComp.setEffectId()
                copyEffect(oldComp, newComp)
                handleEffect(newComp, oldComp, this.node, getEffectType(this.node, oldComp));
            }
            this.node.removeAllChildren()
        }
    }




    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';






    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
