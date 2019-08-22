import StackEffectInterface from "../StackEffectInterface";
import Stack from "../../Entites/Stack";
import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";
import PileManager from "../../Managers/PileManager";
import CardEffect from "../../Entites/CardEffect";
import MultiEffectChoose from "../../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import Player from "../../Entites/GameEntities/Player";
import Effect from "../../CardEffectComponents/CardEffects/Effect";
import MultiEffectRoll from "../../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import RollDiceStackEffect from "../Roll DIce";
import { ROLL_TYPE } from "../../Constants";
import ServerStackEffectInterface from "./ServerStackEffectInterface";
import { ServerEffect } from "../../Entites/ServerCardEffect";
import PlayLootCardStackEffect from "../Play Loot Card";
import PlayerManager from "../../Managers/PlayerManager";
import ActivateItem from "../Activate Item";
import MonsterRewardStackEffect from "../Monster Reward";
import MonsterReward from "../../CardEffectComponents/MonsterRewards/MonsterReward";


export default class ServerMonsterReward implements ServerStackEffectInterface {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;

    monsterCardWithRewardId: number;
    playerCardIdToReward: number


    constructor(stackEffect: MonsterRewardStackEffect) {
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        this.monsterCardWithRewardId = stackEffect.monsterReward.node.parent.getComponent(Card)._cardId
        this.playerCardIdToReward = stackEffect.playerToReward.character.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
    }


    convertToStackEffect() {
        let playerToReward = CardManager.getCardById(this.playerCardIdToReward, true)
        const monster = CardManager.getCardById(this.monsterCardWithRewardId)
        let monsterReward = new MonsterRewardStackEffect(this.creatorCardId, monster, playerToReward)
        monsterReward.LockingResolve = this.LockingResolve;
        monsterReward.hasLockingStackEffectResolved = this.hasLockingStackEffectResolved
        return monsterReward
    }

}
