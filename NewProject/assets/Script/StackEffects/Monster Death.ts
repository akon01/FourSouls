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
import StackEffectInterface from "./StackEffectInterface";
import { MonsterDeathVis } from "./StackEffectVisualRepresentation/Monster Death Vis";

export default class MonsterDeath implements StackEffectInterface {
    visualRepesentation: MonsterDeathVis;

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

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) { whevent.emit(GAME_EVENTS.LABLE_CHANGE) }
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) { return true }
        return false;
    }

    nonOriginal: boolean = false;

    monsterToDie: Monster;
    killer: cc.Node

    constructor(creatorCardId: number, monsterToDieCard: cc.Node, killerCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }
        this.killer = killerCard
        this.creatorCardId = creatorCardId;
        this.creationTurnId = TurnsManager.currentTurn.turnId;
        this.monsterToDie = monsterToDieCard.getComponent(Monster)
        this.visualRepesentation = new MonsterDeathVis(this.monsterToDie.name)
        this.lable = `${this.monsterToDie} killed by ${killerCard.name}`
    }

    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        if (BattleManager.currentlyAttackedMonster != null && this.monsterToDie.node == BattleManager.currentlyAttackedMonster.node) {
            BattleManager.endBattle()
        }
        this.monsterToDie._thisTurnKiller = this.killer
        const turnPlayerCard = PlayerManager.getPlayerById(TurnsManager.currentTurn.PlayerId).character
        const monsterReward = new MonsterRewardStackEffect(this.creatorCardId, this.monsterToDie.node, turnPlayerCard)

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
