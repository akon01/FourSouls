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
import { whevent } from "../../ServerClient/whevent";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

export default class MonsterRewardStackEffect extends StackEffectConcrete {
    visualRepesentation: MonsterRewardVis;
    name = `Monster Death Reward`
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

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    numberRolled: number
    nonOriginal: boolean = false;
    monsterWithReward: Monster
    monsterReward: MonsterReward;
    playerToReward: Player

    constructor(creatorCardId: number, monsterToGetRewardFrom: cc.Node, playerToRewardCard: cc.Node, numberRolled?: number, entityId?: number, lable?: string) {
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
        this.numberRolled = numberRolled
        this.visualRepesentation = new MonsterRewardVis(monsterToGetRewardFrom.getComponent(Monster))
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.playerToReward.playerId} Is Going To Get ${this.monsterWithReward.name}'s Reward`, false)
        }

    }

    async putOnStack() {
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_IS_KILLED, [this.numberRolled, this.monsterWithReward.killer], null, this.monsterWithReward.node, this.entityId)
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)

        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

        //add passive check for every time a monster dies.

    }

    async resolve(true) {
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
        await Stack.fizzleStackEffect(this, true, true)
        cc.error(`after passive check, discard top monster or give souls card`)
        if (cardComp.souls == 0) {
            await this.monsterWithReward.monsterPlace.discardTopMonster(true)
            //await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.monsterWithReward.node, true);
        } else {
            await turnPlayer.getSoulCard(this.monsterWithReward.node, true)
        }
        // await Stack.fizzleStackEffect(this, true)
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
