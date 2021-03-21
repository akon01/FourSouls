import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from "../../Managers/WrapperProvider";
import { MonsterDeath } from "../MonsterDeath";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerMonsterDeath extends BaseServerStackEffect {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;

    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean = false;
    hasLockingStackEffectResolved: boolean = false;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string

    monsterToDieCardId: number;
    numberRolled: number | undefined
    killerId: number

    constructor(stackEffect: MonsterDeath) {
        super()
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.monsterToDieCardId = stackEffect.monsterToDie.node.getComponent(Card)!._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.numberRolled = stackEffect.numberRolled
        this.killerId = stackEffect.killer.getComponent(Card)!._cardId
        this.lable = stackEffect._lable
    }

    convertToStackEffect() {
        const monsterDeath = new MonsterDeath(this.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(this.monsterToDieCardId), WrapperProvider.cardManagerWrapper.out.getCardById(this.killerId, true), this.numberRolled, this.entityId, this.lable)
        return monsterDeath;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: MonsterDeath\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.monsterToDieCardId) { endString = endString + `Monster To Die:${WrapperProvider.cardManagerWrapper.out.getCardById(this.monsterToDieCardId).name}\n` }
        if (this.killerId) { endString = endString + `Killer:${WrapperProvider.cardManagerWrapper.out.getCardById(this.killerId).name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
