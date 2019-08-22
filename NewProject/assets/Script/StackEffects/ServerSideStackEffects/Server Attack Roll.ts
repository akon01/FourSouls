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
    attackedMonsterCardId: number

    constructor(stackEffect: AttackRoll) {
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.numberRolled = stackEffect.numberRolled
        this.rollingPlayerCardId = stackEffect.rollingPlayer.character.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.attackedMonsterCardId = stackEffect.attackedMonster.node.getComponent(Card)._cardId
    }



    convertToStackEffect() {
        let rollDice = new AttackRoll(this.creatorCardId, PlayerManager.getPlayerByCardId(this.rollingPlayerCardId).node, CardManager.getCardById(this.attackedMonsterCardId))
        rollDice.numberRolled = this.numberRolled;
        return rollDice;
    }

}
