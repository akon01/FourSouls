import MonsterReward from "../CardEffectComponents/MonsterRewards/MonsterReward";
import { STACK_EFFECT_TYPE, CARD_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import RollDiceStackEffect from "./Roll DIce";
import ServerMonsterReward from "./ServerSideStackEffects/Server Monster Reward";
import StackEffectInterface from "./StackEffectInterface";
import { MonsterRewardVis } from "./StackEffectVisualRepresentation/Monster Reward Vis";
import Card from "../Entites/GameEntities/Card";
import PileManager from "../Managers/PileManager";


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
            await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.monsterWithReward.node, true);
        } else {
            await turnPlayer.getSoulCard(this.monsterWithReward.node, true)
        }
    }

    convertToServerStackEffect() {
        let serverMonsterReward = new ServerMonsterReward(this)
        return serverMonsterReward
    }

}
