import { STACK_EFFECT_TYPE } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";
import StartTurnLoot from "../Start Turn Loot";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerStartTurnLoot implements ServerStackEffectInterface {
    stackEffectType: STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;



    turnPlayerCardId: number


    constructor(purchaseItemStackEffect: StartTurnLoot) {
        this.entityId = purchaseItemStackEffect.entityId;
        this.creatorCardId = purchaseItemStackEffect.creatorCardId;
        this.turnPlayerCardId = purchaseItemStackEffect.turnPlayer.character.getComponent(Card)._cardId
        this.stackEffectType = purchaseItemStackEffect.stackEffectType;
    }

    convertToStackEffect() {
        let startLootTurn = new StartTurnLoot(this.creatorCardId, CardManager.getCardById(this.turnPlayerCardId, true))
        return startLootTurn;
    }


    toString() {
        let endString = `id:${this.entityId}\ntype: Start Turn Loot\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.turnPlayerCardId) endString = endString + `Turn Player: ${CardManager.getCardById(this.turnPlayerCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }



}
