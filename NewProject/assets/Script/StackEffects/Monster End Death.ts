import { CARD_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import CardManager from "../Managers/CardManager";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerMonsterEndDeath from "./ServerSideStackEffects/Server Monster End Death ";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { MonsterDeathVis } from "./StackEffectVisualRepresentation/Monster Death Vis";

export default class MonsterEndDeath extends StackEffectConcrete {
    visualRepesentation: MonsterDeathVis;
    name = `Monster Death`
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_END_DEATH;
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

    nonOriginal: boolean = false;

    monsterWhoDied: Monster;

    constructor(creatorCardId: number, monsterWhoDied: cc.Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)
        this.monsterWhoDied = monsterWhoDied.getComponent(Monster)
        this.visualRepesentation = new MonsterDeathVis(this.monsterWhoDied)
        this.visualRepesentation.stackEffectType = this.stackEffectType;
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`${monsterWhoDied.name} Has Been Killed`, false)
        }

    }

    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

    }

    async resolve() {
        const turnPlayer = PlayerManager.getPlayerById(TurnsManager.currentTurn.PlayerId)
        if (this.monsterWhoDied.node.getComponent(Card).souls > 0) {
            await turnPlayer.receiveSoulCard(this.monsterWhoDied.node, true)
        } else {
            await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.monsterWhoDied.node, true)
        }
    }

    convertToServerStackEffect() {
        const serverMonsterReward = new ServerMonsterEndDeath(this)
        return serverMonsterReward
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Monster End Death\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.monsterWhoDied) { endString = endString + `Monster Who Died:${this.monsterWhoDied.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
