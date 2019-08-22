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
            // stackEffect.effectToDo.effectData.effectCardPlayer.getComponent(Card)._cardId,
            // stackEffect.effectToDo.effectData.effectCard.getComponent(Card)._cardId,
            this.effectToDo = serverEffect;
        }

        this.hasDataBeenCollectedYet = stackEffect.hasDataBeenCollectedYet;
        this.stackEffectType = stackEffect.stackEffectType;
    }


    convertToStackEffect() {
        let lootToPlay = CardManager.getCardById(this.lootToPlayCardId, true)
        const playerCharacterCard = PlayerManager.getPlayerById(this.lootPlayerId).getComponent(Player).character;
        let playLoot = new PlayLootCardStackEffect(this.creatorCardId, this.hasLockingStackEffect, lootToPlay, playerCharacterCard, this.hasDataBeenCollectedYet, this.hasLockingStackEffectResolved)
        playLoot.LockingResolve = this.LockingResolve;
        if (this.effectToDo != null) {
            playLoot.effectToDo = lootToPlay.getComponent(CardEffect).getEffectByNumAndType(this.effectToDo.cardEffectNum, this.effectToDo.effctType)
        }
        playLoot.hasLockingStackEffectResolved = this.hasLockingStackEffectResolved
        return playLoot
    }

}
