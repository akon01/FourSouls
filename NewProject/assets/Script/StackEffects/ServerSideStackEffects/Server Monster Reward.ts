import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";
import MonsterRewardStackEffect from "../Monster Reward";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


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
    lable: string

    monsterCardWithRewardId: number;
    playerCardIdToReward: number
    numberRolled: number


    constructor(stackEffect: MonsterRewardStackEffect) {
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        this.monsterCardWithRewardId = stackEffect.monsterReward.node.parent.getComponent(Card)._cardId
        this.playerCardIdToReward = stackEffect.playerToReward.character.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.numberRolled = stackEffect.numberRolled
        this.lable = stackEffect._lable
    }


    convertToStackEffect() {
        let playerToReward = CardManager.getCardById(this.playerCardIdToReward, true)
        const monster = CardManager.getCardById(this.monsterCardWithRewardId)
        let monsterReward = new MonsterRewardStackEffect(this.creatorCardId, monster, playerToReward, this.numberRolled, this.entityId, this.lable)
        monsterReward.LockingResolve = this.LockingResolve;
        monsterReward.hasLockingStackEffectResolved = this.hasLockingStackEffectResolved
        return monsterReward
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Monster Reward\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.monsterCardWithRewardId) endString = endString + `Monster With Reward:${CardManager.getCardById(this.monsterCardWithRewardId).name}\n`
        if (this.playerCardIdToReward) endString = endString + `Player To Reward:${CardManager.getCardById(this.playerCardIdToReward).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }


}
