import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import AttackRoll from "../Attack Roll";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerAttackRoll implements ServerStackEffectInterface {



    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;
    rollingPlayerCardId: number
    numberRolled: number
    lable: string
    attackedMonsterCardId: number

    constructor(stackEffect: AttackRoll) {
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.numberRolled = stackEffect.numberRolled
        this.rollingPlayerCardId = stackEffect.rollingPlayer.character.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.attackedMonsterCardId = stackEffect.attackedMonster.node.getComponent(Card)._cardId
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let rollDice = new AttackRoll(this.creatorCardId, PlayerManager.getPlayerByCardId(this.rollingPlayerCardId).node, CardManager.getCardById(this.attackedMonsterCardId), this.entityId, this.lable)
        rollDice.numberRolled = this.numberRolled;
        return rollDice;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Attack Roll\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.attackedMonsterCardId) endString = endString + `Attacked Monster:${CardManager.getCardById(this.attackedMonsterCardId).name}\n`
        if (this.numberRolled) endString = endString + `Number Rolled:${this.numberRolled}\n`
        if (this.rollingPlayerCardId) endString = endString + `Rolling Player:${CardManager.getCardById(this.rollingPlayerCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
