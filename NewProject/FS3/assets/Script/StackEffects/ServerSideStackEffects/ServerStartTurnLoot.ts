import { STACK_EFFECT_TYPE } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from "../../Managers/WrapperProvider";
import { StartTurnLoot } from "../StartTurnLoot";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerStartTurnLoot extends BaseServerStackEffect {
    stackEffectType: STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean = false;
    hasLockingStackEffectResolved: boolean = false;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string;



    turnPlayerCardId: number


    constructor(purchaseItemStackEffect: StartTurnLoot) {
        super()
        this.entityId = purchaseItemStackEffect.entityId;
        this.creatorCardId = purchaseItemStackEffect.creatorCardId;
        this.turnPlayerCardId = purchaseItemStackEffect.turnPlayer.character!.getComponent(Card)!._cardId
        this.stackEffectType = purchaseItemStackEffect.stackEffectType;
        this.lable = purchaseItemStackEffect._lable;
    }

    convertToStackEffect() {
        let startLootTurn = new StartTurnLoot(this.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(this.turnPlayerCardId, true), this.entityId, this.lable)
        return startLootTurn;
    }


    toString() {
        let endString = `id:${this.entityId}\ntype: StartTurnLoot\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.turnPlayerCardId) endString = endString + `Turn Player: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.turnPlayerCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }



}
