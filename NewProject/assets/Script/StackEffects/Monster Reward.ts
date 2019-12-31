import MonsterReward from "../CardEffectComponents/MonsterRewards/MonsterReward";
import { GAME_EVENTS, PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
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
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { MonsterRewardVis } from "./StackEffectVisualRepresentation/Monster Reward Vis";

export default class MonsterRewardStackEffect extends StackEffectConcrete {
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
    _lable: string;

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) { whevent.emit(GAME_EVENTS.LABLE_CHANGE) }
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal: boolean = false;
    monsterWithReward: Monster
    monsterReward: MonsterReward;
    playerToReward: Player

    constructor(creatorCardId: number, monsterToGetRewardFrom: cc.Node, playerToRewardCard: cc.Node, entityId?: number) {
        super(creatorCardId, entityId)



        this.monsterWithReward = monsterToGetRewardFrom.getComponent(Monster)
        this.monsterReward = this.monsterWithReward.reward;
        if (!this.monsterReward) { throw new Error(`No Monster Reward on ${this.monsterWithReward.name}`) }
        this.playerToReward = PlayerManager.getPlayerByCard(playerToRewardCard)
        if (this.monsterReward.hasRoll) {
            this.hasLockingStackEffect = true;
            this.lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
            this.hasLockingStackEffectResolved = false
        }
        this.visualRepesentation = new MonsterRewardVis(monsterToGetRewardFrom.getComponent(Monster))
        this.lable = `Player ${this.playerToReward.playerId} get ${this.monsterWithReward.name} reward`
    }

    async putOnStack() {
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_IS_KILLED, [], null, this.monsterWithReward.node, this.entityId)
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)

        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

        //add passive check for every time a monster dies.

    }

    async resolve() {
        if (this.hasLockingStackEffect) {
            await Stack.addToStack(this.lockingStackEffect, true)
            this.monsterReward.rollNumber = this.LockingResolve;
        }
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        await this.monsterReward.rewardPlayer(this.playerToReward.node, true)
        const cardComp = this.monsterWithReward.node.getComponent(Card)
        this.monsterWithReward._isDead = true
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_IS_KILLED, [], null, this.monsterWithReward.node, this.entityId)
        await PassiveManager.testForPassiveAfter(passiveMeta)
        await Stack.fizzleStackEffect(this, true)
        if (cardComp.souls == 0) {
            await this.monsterWithReward.monsterPlace.discardTopMonster(true)
            //await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.monsterWithReward.node, true);
        } else {
            await turnPlayer.getSoulCard(this.monsterWithReward.node, true)
        }
    }

    convertToServerStackEffect() {
        const serverMonsterReward = new ServerMonsterReward(this)
        return serverMonsterReward
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Monster Reward\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.monsterWithReward) { endString = endString + `Monster With Reward:${this.monsterWithReward.name}\n` }
        if (this.monsterReward) { endString = endString + `Reward:${this.monsterReward.name}\n` }
        if (this.playerToReward) { endString = endString + `Player To Reward:${this.playerToReward.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
