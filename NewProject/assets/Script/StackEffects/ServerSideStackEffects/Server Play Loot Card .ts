import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import { ServerEffect } from "../../Entites/ServerCardEffect";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import PlayLootCardStackEffect from "../Play Loot Card";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerPlayLootCard implements ServerStackEffectInterface {
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

    lootPlayerId: number;
    lootToPlayCardId: number;
    effectToDo: ServerEffect;
    hasDataBeenCollectedYet: boolean;


    constructor(stackEffect: PlayLootCardStackEffect) {
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        this.lootToPlayCardId = stackEffect.lootToPlay.getComponent(Card)._cardId;
        this.lootPlayerId = stackEffect.lootPlayer.getComponent(Player).playerId
        if (stackEffect.effectToDo != null) {

            let effectData = stackEffect.lootToPlay.getComponent(CardEffect).getEffectIndexAndType(stackEffect.effectToDo)
            let serverEffect = new ServerEffect(
                stackEffect.effectToDo.effectName, effectData.index,
                this.lootPlayerId,
                this.lootToPlayCardId,
                effectData.type
            )
            this.effectToDo = serverEffect;
        }
        this.lable = stackEffect._lable
        this.hasDataBeenCollectedYet = stackEffect.hasDataBeenCollectedYet;
        this.stackEffectType = stackEffect.stackEffectType;
    }


    convertToStackEffect() {
        let lootToPlay = CardManager.getCardById(this.lootToPlayCardId, true)
        const playerCharacterCard = PlayerManager.getPlayerById(this.lootPlayerId).character;
        let playLoot = new PlayLootCardStackEffect(this.creatorCardId, this.hasLockingStackEffect, lootToPlay, playerCharacterCard, this.hasDataBeenCollectedYet, this.hasLockingStackEffectResolved, this.entityId, this.lable)
        playLoot.LockingResolve = this.LockingResolve;
        if (this.effectToDo != null) {
            playLoot.effectToDo = lootToPlay.getComponent(CardEffect).getEffectByNumAndType(this.effectToDo.cardEffectNum, this.effectToDo.effctType)
        }
        playLoot.hasLockingStackEffectResolved = this.hasLockingStackEffectResolved
        return playLoot
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Play Loot Card\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.effectToDo) endString = endString + `Effect:${this.effectToDo.effectName}\n`
        if (this.lootPlayerId) endString = endString + `Player:${CardManager.getCardById(this.lootPlayerId).name}\n`
        if (this.lootToPlayCardId) endString = endString + `Loot To Play:${CardManager.getCardById(this.lootToPlayCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
