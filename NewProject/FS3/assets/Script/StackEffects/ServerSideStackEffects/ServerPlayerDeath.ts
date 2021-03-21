import { STACK_EFFECT_TYPE } from '../../Constants';
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { PlayerDeath } from "../PlayerDeath";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerPlayerDeath extends BaseServerStackEffect {
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

    playerToDieCardId: number;
    killerId: number

    constructor(stackEffect: PlayerDeath) {
        super()
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.playerToDieCardId = stackEffect.playerToDie.character!.getComponent(Card)!._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.killerId = stackEffect.killer.getComponent(Card)!._cardId
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let playerDeath = new PlayerDeath(this.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(this.playerToDieCardId), WrapperProvider.cardManagerWrapper.out.getCardById(this.killerId, true), this.entityId, this.lable)
        return playerDeath;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: PlayerDeath\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.playerToDieCardId) endString = endString + `Player To DIe:${WrapperProvider.cardManagerWrapper.out.getCardById(this.playerToDieCardId).name}\n`
        if (this.killerId) endString = endString + `Killer:${WrapperProvider.cardManagerWrapper.out.getCardById(this.killerId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
