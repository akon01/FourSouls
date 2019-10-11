import MonsterReward from "../CardEffectComponents/MonsterRewards/MonsterReward";
import { PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import RollDiceStackEffect from "./Roll DIce";
import ServerMonsterReward from "./ServerSideStackEffects/Server Monster Reward";
import StackEffectInterface from "./StackEffectInterface";
import { MonsterRewardVis } from "./StackEffectVisualRepresentation/Monster Reward Vis";


export default class MonsterRewardStackEffect implements StackEffectInterface {
    visualRepesentation: MonsterRewardVis;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_REWARD;

    monsterWithReward: Monster
    monsterReward: MonsterReward;
    playerToReward: Player

    constructor(creatorCardId: number, monsterToGetRewardFrom: cc.Node, playerToRewardCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;

        cc.log(monsterToGetRewardFrom)
        this.monsterWithReward = monsterToGetRewardFrom.getComponent(Monster)
        this.monsterReward = this.monsterWithReward.reward;
        this.playerToReward = PlayerManager.getPlayerByCard(playerToRewardCard)
        if (this.monsterReward.hasRoll) {
            this.hasLockingStackEffect = true;
            this.lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
            this.hasLockingStackEffectResolved = false
        }
        this.visualRepesentation = new MonsterRewardVis(monsterToGetRewardFrom.getComponent(Monster))
    }

    async putOnStack() {
        cc.log(`put monster reward on the stack`)
        let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_IS_KILLED, [], null, this.monsterWithReward.node)
        let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)

        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

        //add passive check for every time a monster dies.

    }

    async resolve() {
        cc.log('resolve monster reward')
        if (this.hasLockingStackEffect) {
            await Stack.addToStack(this.lockingStackEffect, true)
            this.monsterReward.rollNumber = this.LockingResolve;
        }
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        await this.monsterReward.rewardPlayer(this.playerToReward.node, true)
        let cardComp = this.monsterWithReward.node.getComponent(Card)
        if (cardComp.souls == 0) {
            await this.monsterWithReward.monsterPlace.discardTopMonster(true)
            //await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.monsterWithReward.node, true);
        } else {
            await turnPlayer.getSoulCard(this.monsterWithReward.node, true)
        }
    }

    convertToServerStackEffect() {
        let serverMonsterReward = new ServerMonsterReward(this)
        return serverMonsterReward
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Monster Reward\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.monsterWithReward) endString = endString + `Monster With Reward:${this.monsterWithReward.name}\n`
        if (this.monsterReward) endString = endString + `Reward:${this.monsterReward.name}\n`
        if (this.playerToReward) endString = endString + `Player To Reward:${this.playerToReward.name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
