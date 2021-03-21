import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from "../../Managers/WrapperProvider";
import { PlayerDeathPenalties } from "../PlayerDeathPenalties";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerPlayerDeathPenalties extends BaseServerStackEffect {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean = false;
    hasLockingStackEffectResolved: boolean = false;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string;

    playerToPayCardId: number;

    constructor(stackEffect: PlayerDeathPenalties) {
        super()
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.playerToPayCardId = stackEffect.playerToPay.character!.getComponent(Card)!._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let playerDeathPenalties = new PlayerDeathPenalties(this.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(this.playerToPayCardId), this.entityId, this.lable)
        return playerDeathPenalties;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: PlayerDeathPenalties\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.playerToPayCardId) endString = endString + `Player To Pay:${WrapperProvider.cardManagerWrapper.out.getCardById(this.playerToPayCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }


}
