import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from "../../Managers/WrapperProvider";
import { MonsterRewardStackEffect } from "../MonsterReward";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerMonsterReward extends BaseServerStackEffect {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string

    monsterCardWithRewardId: number;
    playerCardIdToReward: number
    numberRolled: number | undefined


    constructor(stackEffect: MonsterRewardStackEffect) {
        super()
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        //TODO: After checking and reworking all monster cards ,remove first part of if
        if (stackEffect.monsterReward.attachedToCardId == 0) {
            this.monsterCardWithRewardId = stackEffect.monsterReward.node.parent!.getComponent(Card)!._cardId
        } else {
            this.monsterCardWithRewardId = stackEffect.monsterReward.attachedToCardId
        }
        this.playerCardIdToReward = stackEffect.playerToReward.character!.getComponent(Card)!._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.numberRolled = stackEffect.numberRolled
        this.lable = stackEffect._lable
    }


    convertToStackEffect() {
        let playerToReward = WrapperProvider.cardManagerWrapper.out.getCardById(this.playerCardIdToReward, true)
        const monster = WrapperProvider.cardManagerWrapper.out.getCardById(this.monsterCardWithRewardId)
        let monsterReward = new MonsterRewardStackEffect(this.creatorCardId, monster, playerToReward, this.numberRolled, this.entityId, this.lable)
        monsterReward.LockingResolve = this.LockingResolve;
        monsterReward.hasLockingStackEffectResolved = this.hasLockingStackEffectResolved
        return monsterReward
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: MonsterReward\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.monsterCardWithRewardId) endString = endString + `Monster With Reward:${WrapperProvider.cardManagerWrapper.out.getCardById(this.monsterCardWithRewardId).name}\n`
        if (this.playerCardIdToReward) endString = endString + `Player To Reward:${WrapperProvider.cardManagerWrapper.out.getCardById(this.playerCardIdToReward).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }


}
