import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { WrapperProvider } from "../../Managers/WrapperProvider";
import { DeclareAttack } from "../DeclareAttack";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerDeclareAttack extends BaseServerStackEffect {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect = false;
    hasLockingStackEffectResolved = false;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string


    attackingPlayerCardId: number
    idOfCardBeingAttacked: number


    constructor(declareAttack: DeclareAttack) {
        super()
        this.entityId = declareAttack.entityId
        this.creatorCardId = declareAttack.creatorCardId;
        this.attackingPlayerCardId = declareAttack.attackingPlayer.character!.getComponent(Card)!._cardId;
        this.idOfCardBeingAttacked = declareAttack.cardBeingAttacked.getComponent(Card)!._cardId;
        this.stackEffectType = declareAttack.stackEffectType;
        this.lable = declareAttack._lable
    }


    convertToStackEffect() {
        const declareAttack = new DeclareAttack(this.creatorCardId, WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.attackingPlayerCardId)!.getComponent(Player)!, WrapperProvider.cardManagerWrapper.out.getCardById(this.idOfCardBeingAttacked), this.entityId, this.lable)
        return declareAttack;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: DeclareAttack\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.attackingPlayerCardId) endString = endString + `Attacking Player:${WrapperProvider.cardManagerWrapper.out.getCardById(this.attackingPlayerCardId).name}\n`
        if (this.idOfCardBeingAttacked) endString = endString + `Monster Being Attacked:${WrapperProvider.cardManagerWrapper.out.getCardById(this.idOfCardBeingAttacked).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }


}
