import ServerStackEffectInterface from "./ServerStackEffectInterface";
import { STACK_EFFECT_TYPE } from "../../Constants";
import { PassiveMeta } from "../../Managers/PassiveManager";
import { ServerEffect } from "../../Entites/ServerCardEffect";
import ActivatePassiveEffect from "../Activate Passive Effect";
import Card from "../../Entites/GameEntities/Card";
import CardEffect from "../../Entites/CardEffect";
import CardManager from "../../Managers/CardManager";


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
    effectPassiveMeta: PassiveMeta

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
            let effectData = stackEffect.cardWithEffect.getComponent(CardEffect).getEffectIndexAndType(stackEffect.effectToDo)
            let serverEffect = new ServerEffect(
                stackEffect.effectToDo.effectName, effectData.index,
                this.cardActivatorId,
                this.cardWithEffectId,
                effectData.type
            )
            this.effectToDo = serverEffect;
        }
        this.hasDataBeenCollectedYet = stackEffect.hasDataBeenCollectedYet;
        this.stackEffectType = stackEffect.stackEffectType;
    }


    convertToStackEffect() {
        let cardWithEffect = CardManager.getCardById(this.cardWithEffectId, true)
        let effect = cardWithEffect.getComponent(CardEffect).getEffectByNumAndType(this.effectToDo.cardEffectNum, this.effectToDo.effctType)
        let activatePassiveEffect = new ActivatePassiveEffect(this.creatorCardId, this.hasLockingStackEffect, this.cardActivatorId, cardWithEffect, effect, this.hasDataBeenCollectedYet)
        activatePassiveEffect.LockingResolve = this.LockingResolve;
        activatePassiveEffect.hasLockingStackEffectResolved = this.hasLockingStackEffectResolved
        return activatePassiveEffect
    }

}
