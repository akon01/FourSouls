import { STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Stack from "../Entites/Stack";
import TurnsManager from "../Managers/TurnsManager";
import ServerMonsterDeath from "./ServerSideStackEffects/Server Monster Death";
import StackEffectInterface from "./StackEffectInterface";
import { MonsterDeathVis } from "./StackEffectVisualRepresentation/Monster Death Vis";
import PlayerManager from "../Managers/PlayerManager";
import Player from "../Entites/GameEntities/Player";
import MonsterRewardStackEffect from "./Monster Reward";
import BattleManager from "../Managers/BattleManager";


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

    monsterToDie: Monster;
    killer: cc.Node

    constructor(creatorCardId: number, monsterToDieCard: cc.Node, killerCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }
        this.killer = killerCard
        this.creatorCardId = creatorCardId;
        this.monsterToDie = monsterToDieCard.getComponent(Monster)
        this.visualRepesentation = new MonsterDeathVis(this.monsterToDie.name)
    }

    async putOnStack() {
        cc.log(`put ${this.monsterToDie.name} death on the stack`)
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        cc.log('resolve monster death')
        if (BattleManager.currentlyAttackedMonster != null && this.monsterToDie.node == BattleManager.currentlyAttackedMonster.node) {
            BattleManager.currentlyAttackedMonster = null;
            TurnsManager.currentTurn.battlePhase = false;
        }
        this.monsterToDie._thisTurnKiller = this.killer
        let turnPlayerCard = PlayerManager.getPlayerById(TurnsManager.currentTurn.PlayerId).getComponent(Player).character
        let monsterReward = new MonsterRewardStackEffect(this.creatorCardId, this.monsterToDie.node, turnPlayerCard)

        await Stack.addToStackBelow(monsterReward, this, true)

    }

    convertToServerStackEffect() {
        let serverCombatDamage = new ServerMonsterDeath(this)
        return serverCombatDamage
    }

}
