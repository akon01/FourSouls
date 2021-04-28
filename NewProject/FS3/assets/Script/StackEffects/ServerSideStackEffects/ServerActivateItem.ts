import { STACK_EFFECT_TYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from "../../Managers/WrapperProvider";
import { ActivateItem } from "../ActivateItem";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerActivateItem extends BaseServerStackEffect {


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE;
    lable: string


    itemPlayerId: number;
    itemToPlayCardId: number;
    effectToDoData: any;
    hasDataBeenCollectedYet: boolean;


    constructor(stackEffect: ActivateItem) {
        super()
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        this.itemToPlayCardId = stackEffect.itemToActivate.getComponent(Card)!._cardId;
        this.itemPlayerId = stackEffect.itemPlayer.playerId
        if (stackEffect.effectToDo != null) {
            const effectData = stackEffect.itemToActivate.getComponent(CardEffect)!.getEffectIndexAndType(stackEffect.effectToDo)
            this.effectToDoData = effectData;
        }
        this.hasDataBeenCollectedYet = stackEffect.hasDataBeenCollectedYet;
        this.stackEffectType = stackEffect.stackEffectType;
        this.lable = stackEffect._lable
    }


    convertToStackEffect() {
        const itemToActivate = WrapperProvider.cardManagerWrapper.out.getCardById(this.itemToPlayCardId, true)
        const playerCharacterCard = WrapperProvider.playerManagerWrapper.out.getPlayerById(this.itemPlayerId)!.character!;
        const activateItem = new ActivateItem(this.creatorCardId, this.hasLockingStackEffect, itemToActivate, playerCharacterCard, this.hasDataBeenCollectedYet, this.entityId, this.lable)
        activateItem.LockingResolve = this.LockingResolve;
        if (this.effectToDoData != null) {
            activateItem.effectToDo = itemToActivate.getComponent(CardEffect)!.getEffectByNumAndType(this.effectToDoData.index, this.effectToDoData.type)
        }
        activateItem.hasLockingStackEffectResolved = this.hasLockingStackEffectResolved
        return activateItem
    }

    toString() {
        const itemToActivate = WrapperProvider.cardManagerWrapper.out.getCardById(this.itemToPlayCardId, true)
        let endString = `id:${this.entityId}\ntype: ActivateItem\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.effectToDoData) endString = endString + `Effect To Do:${itemToActivate.getComponent(CardEffect)!.getEffectByNumAndType(this.effectToDoData.index, this.effectToDoData.type)!.name}\n`
        if (this.itemPlayerId) endString = endString + `Player:${WrapperProvider.playerManagerWrapper.out.getPlayerById(this.itemPlayerId)!.name}\n`
        if (this.itemToPlayCardId) endString = endString + `Item:${WrapperProvider.cardManagerWrapper.out.getCardById(this.itemToPlayCardId).name}\n`
        return endString
    }

}
