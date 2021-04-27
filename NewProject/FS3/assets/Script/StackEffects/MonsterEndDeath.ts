import { Node } from 'cc';
import { CARD_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { ServerMonsterEndDeath } from "./ServerSideStackEffects/ServerMonsterEndDeath";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { MonsterDeathVis } from "./StackEffectVisualRepresentation/MonsterDeathVis";

export class MonsterEndDeath extends StackEffectConcrete {
    visualRepesentation: MonsterDeathVis;
    name = `MonsterDeath`
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect = false;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect = false;
    hasLockingStackEffectResolved = false;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_END_DEATH;
    _lable!: string;

    isToBeFizzled = false;

    creationTurnId!: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal = false;

    monsterWhoDied: Monster;

    constructor(creatorCardId: number, monsterWhoDied: Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)
        this.monsterWhoDied = monsterWhoDied.getComponent(Monster)!
        this.visualRepesentation = new MonsterDeathVis(this.monsterWhoDied)
        this.visualRepesentation.stackEffectType = this.stackEffectType;
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`${monsterWhoDied.name} Has Been Killed`, false)
        }

    }

    async putOnStack() {
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)

    }

    async resolve() {
        const turnPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId)!
        if (this.monsterWhoDied.node.getComponent(Card)!.souls > 0) {
            await turnPlayer.receiveSoulCard(this.monsterWhoDied.node, true)
        } else {
            await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, this.monsterWhoDied.node, true)
        }
    }

    convertToServerStackEffect() {
        const serverMonsterReward = new ServerMonsterEndDeath(this)
        return serverMonsterReward
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: MonsterEndDeath\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.monsterWhoDied) { endString = endString + `Monster Who Died:${this.monsterWhoDied.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
