import { STACK_EFFECT_TYPE } from '../../Constants';
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { MonsterEndDeath } from "../MonsterEndDeath";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerMonsterEndDeath extends BaseServerStackEffect {
    stackEffectType: STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean = false;
    hasLockingStackEffectResolved: boolean = false;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string

    monsterWhoDiedCardId: number;

    constructor(stackEffect: MonsterEndDeath) {
        super()
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.monsterWhoDiedCardId = stackEffect.monsterWhoDied.node.getComponent(Card)!._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let monsterEndDeath = new MonsterEndDeath(this.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(this.monsterWhoDiedCardId), this.entityId, this.lable)
        return monsterEndDeath;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: MonsterEndDeath\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.monsterWhoDiedCardId) endString = endString + `Monster Who Died:${WrapperProvider.cardManagerWrapper.out.getCardById(this.monsterWhoDiedCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
