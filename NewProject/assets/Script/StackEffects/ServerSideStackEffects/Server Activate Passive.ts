import { STACK_EFFECT_TYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import { ServerEffect } from "../../Entites/ServerCardEffect";
import CardManager from "../../Managers/CardManager";
import { ServerEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta, ServerPassiveMeta } from "../../Managers/PassiveManager";
import ActivatePassiveEffect from "../Activate Passive Effect";
import ServerStackEffectInterface from "./ServerStackEffectInterface";

export default class ServerActivatePassive implements ServerStackEffectInterface {

    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE;

    cardActivatorId: number
    cardWithEffectId: number;
    effectPassiveMeta: ServerPassiveMeta
    isAfterActivation: boolean
    index: number
    effectCollectedData: ServerEffectData = null;
    effectToDo: ServerEffect;
    hasDataBeenCollectedYet: boolean;

    constructor(stackEffect: ActivatePassiveEffect) {
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        this.cardActivatorId = stackEffect.cardActivatorId
        this.cardWithEffectId = stackEffect.cardWithEffect.getComponent(Card)._cardId
        if (stackEffect.effectToDo != null) {
            const effectData = stackEffect.cardWithEffect.getComponent(CardEffect).getEffectIndexAndType(stackEffect.effectToDo)
            const serverEffect = new ServerEffect(
                stackEffect.effectToDo.effectName, effectData.index,
                this.cardActivatorId,
                this.cardWithEffectId,
                effectData.type
            )
            this.effectToDo = serverEffect;
        }
        if (stackEffect.effectPassiveMeta != null) {
            this.effectPassiveMeta = stackEffect.effectPassiveMeta.convertToServerPassiveMeta()
        }
        this.isAfterActivation = stackEffect.isAfterActivation;
        this.index = stackEffect.index
        this.hasDataBeenCollectedYet = stackEffect.hasDataBeenCollectedYet;
        if (this.hasDataBeenCollectedYet) {
            this.effectCollectedData = stackEffect.effectCollectedData
        }
        this.stackEffectType = stackEffect.stackEffectType;
    }

    convertToStackEffect() {
        const cardWithEffect = CardManager.getCardById(this.cardWithEffectId, true)
        const effect = cardWithEffect.getComponent(CardEffect).getEffectByNumAndType(this.effectToDo.cardEffectNum, this.effectToDo.effctType)
        const activatePassiveEffect = new ActivatePassiveEffect(this.creatorCardId, this.hasLockingStackEffect, this.cardActivatorId, cardWithEffect, effect, this.hasDataBeenCollectedYet, this.isAfterActivation, this.index)
        activatePassiveEffect.LockingResolve = this.LockingResolve;
        if (this.hasDataBeenCollectedYet) { activatePassiveEffect.effectCollectedData = this.effectCollectedData }
        activatePassiveEffect.hasLockingStackEffectResolved = this.hasLockingStackEffectResolved
        return activatePassiveEffect
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Activate Passive Effect\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.effectToDo) { endString = endString + `Effect:${this.effectToDo.effectName}\n` }
        if (this.cardActivatorId) { endString = endString + `Effect Played By:${CardManager.getCardById(this.cardActivatorId).name}\n` }
        if (this.cardWithEffectId) { endString = endString + `Card With Effect:${CardManager.getCardById(this.cardWithEffectId).name}\n` }
        if (this.index) { endString = endString + endString + `Index:${this.index}\n` }
        if (this.isAfterActivation) { endString = endString + endString + `Is An After Passive Effect:${this.isAfterActivation}\n` }
        if (this.effectPassiveMeta) { endString = endString + endString + `Effect Passive Meta:${this.effectPassiveMeta}\n` }
        return endString
    }

}
