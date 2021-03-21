import { STACK_EFFECT_TYPE } from '../../Constants';
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { AttackRoll } from "../AttackRoll";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerAttackRoll extends BaseServerStackEffect {


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean = false;
    hasLockingStackEffectResolved: boolean = false;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE;
    rollingPlayerCardId: number
    numberRolled: number
    lable: string
    attackedMonsterCardId: number

    constructor(stackEffect: AttackRoll) {
        super()
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.numberRolled = stackEffect.numberRolled
        this.rollingPlayerCardId = stackEffect.rollingPlayer.character!.getComponent(Card)!._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.attackedMonsterCardId = stackEffect.attackedMonster.node.getComponent(Card)!._cardId
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let rollDice = new AttackRoll(this.creatorCardId, WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.rollingPlayerCardId)!.node, WrapperProvider.cardManagerWrapper.out.getCardById(this.attackedMonsterCardId), this.entityId, this.lable)
        rollDice.numberRolled = this.numberRolled;
        return rollDice;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: AttackRoll\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.attackedMonsterCardId) endString = endString + `Attacked Monster:${WrapperProvider.cardManagerWrapper.out.getCardById(this.attackedMonsterCardId).name}\n`
        if (this.numberRolled) endString = endString + `Number Rolled:${this.numberRolled}\n`
        if (this.rollingPlayerCardId) endString = endString + `Rolling Player:${WrapperProvider.cardManagerWrapper.out.getCardById(this.rollingPlayerCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
