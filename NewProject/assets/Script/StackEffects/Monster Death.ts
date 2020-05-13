import { GAME_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import MonsterRewardStackEffect from "./Monster Reward";
import ServerMonsterDeath from "./ServerSideStackEffects/Server Monster Death";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { MonsterDeathVis } from "./StackEffectVisualRepresentation/Monster Death Vis";
import { whevent } from "../../ServerClient/whevent";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

export default class MonsterDeath extends StackEffectConcrete {
    visualRepesentation: MonsterDeathVis;
    name = `Monster Is Going To Die`
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_DEATH;
    _lable: string;

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false;
    }

    nonOriginal: boolean = false;

    numberRolled: number
    monsterToDie: Monster;
    killer: cc.Node

    constructor(creatorCardId: number, monsterToDieCard: cc.Node, killerCard: cc.Node, numberRolled?: number, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)
        this.killer = killerCard
        this.monsterToDie = monsterToDieCard.getComponent(Monster)
        this.visualRepesentation = new MonsterDeathVis(this.monsterToDie)
        this.numberRolled = numberRolled
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`${this.monsterToDie} Is Going To Be Killed by ${killerCard.name}`, false)
        }
    }

    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        if (BattleManager.currentlyAttackedMonster != null && this.monsterToDie.node == BattleManager.currentlyAttackedMonster.node) {
            await BattleManager.cancelAttack(true)
        }
        this.monsterToDie._thisTurnKiller = this.killer
        const turnPlayerCard = PlayerManager.getPlayerById(TurnsManager.currentTurn.PlayerId).character
        const monsterReward = new MonsterRewardStackEffect(this.creatorCardId, this.monsterToDie.node, turnPlayerCard, this.numberRolled)

        await Stack.addToStackBelow(monsterReward, this, true)

    }

    convertToServerStackEffect() {
        const serverCombatDamage = new ServerMonsterDeath(this)
        return serverCombatDamage
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Monster Death\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.monsterToDie) { endString = endString + `Monster To Die:${this.monsterToDie.name}\n` }
        if (this.killer) { endString = endString + `Killer:${this.killer.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
