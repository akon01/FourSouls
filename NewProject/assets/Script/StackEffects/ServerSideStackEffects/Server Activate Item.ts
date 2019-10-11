import { STACK_EFFECT_TYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import ActivateItem from "../Activate Item";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerActivateItem implements ServerStackEffectInterface {


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE;


    itemPlayerId: number;
    itemToPlayCardId: number;
    effectToDoData: any;
    hasDataBeenCollectedYet: boolean;


    constructor(stackEffect: ActivateItem) {
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        this.itemToPlayCardId = stackEffect.itemToActivate.getComponent(Card)._cardId;
        this.itemPlayerId = stackEffect.itemPlayer.playerId
        if (stackEffect.effectToDo != null) {
            let effectData = stackEffect.itemToActivate.getComponent(CardEffect).getEffectIndexAndType(stackEffect.effectToDo)
            this.effectToDoData = effectData;
        }
        this.hasDataBeenCollectedYet = stackEffect.hasDataBeenCollectedYet;
        this.stackEffectType = stackEffect.stackEffectType;
    }


    convertToStackEffect() {
        let itemToActivate = CardManager.getCardById(this.itemToPlayCardId, true)
        const playerCharacterCard = PlayerManager.getPlayerById(this.itemPlayerId).getComponent(Player).character;
        let activateItem = new ActivateItem(this.creatorCardId, this.hasLockingStackEffect, itemToActivate, playerCharacterCard, this.hasDataBeenCollectedYet)
        activateItem.LockingResolve = this.LockingResolve;
        if (this.effectToDoData != null) {
            activateItem.effectToDo = itemToActivate.getComponent(CardEffect).getEffectByNumAndType(this.effectToDoData.index, this.effectToDoData.type)
        }
        activateItem.hasLockingStackEffectResolved = this.hasLockingStackEffectResolved
        return activateItem
    }

    toString() {
        let itemToActivate = CardManager.getCardById(this.itemToPlayCardId, true)
        let endString = `id:${this.entityId}\ntype: Activate Item\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.effectToDoData) endString = endString + `Effect To Do:${itemToActivate.getComponent(CardEffect).getEffectByNumAndType(this.effectToDoData.index, this.effectToDoData.type).name}\n`
        if (this.itemPlayerId) endString = endString + `Player:${PlayerManager.getPlayerById(this.itemPlayerId).name}\n`
        if (this.itemToPlayCardId) endString = endString + `Item:${CardManager.getCardById(this.itemToPlayCardId).name}\n`
        return endString
    }

}
