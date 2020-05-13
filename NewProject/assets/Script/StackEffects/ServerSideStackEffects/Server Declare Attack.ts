import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DeclareAttack from "../Declare Attack";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerDeclareAttack implements ServerStackEffectInterface {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;
    lable: string


    attackingPlayerCardId: number
    idOfCardBeingAttacked: number


    constructor(declareAttack: DeclareAttack) {
        this.entityId = declareAttack.entityId
        this.creatorCardId = declareAttack.creatorCardId;
        this.attackingPlayerCardId = declareAttack.attackingPlayer.character.getComponent(Card)._cardId;
        this.idOfCardBeingAttacked = declareAttack.cardBeingAttacked.getComponent(Card)._cardId;
        this.stackEffectType = declareAttack.stackEffectType;
        this.lable = declareAttack._lable
    }


    convertToStackEffect() {
        let declareAttack = new DeclareAttack(this.creatorCardId, PlayerManager.getPlayerByCardId(this.attackingPlayerCardId).getComponent(Player), CardManager.getCardById(this.idOfCardBeingAttacked), this.entityId, this.lable)
        return declareAttack;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Declare Attack\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.attackingPlayerCardId) endString = endString + `Attacking Player:${CardManager.getCardById(this.attackingPlayerCardId).name}\n`
        if (this.idOfCardBeingAttacked) endString = endString + `Monster Being Attacked:${CardManager.getCardById(this.idOfCardBeingAttacked).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }


}
