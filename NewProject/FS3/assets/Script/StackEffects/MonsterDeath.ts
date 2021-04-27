import { Node } from 'cc';
import { STACK_EFFECT_TYPE } from "../Constants";
import { Monster } from "../Entites/CardTypes/Monster";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { MonsterRewardStackEffect } from "./MonsterReward";
import { ServerMonsterDeath } from "./ServerSideStackEffects/ServerMonsterDeath";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { MonsterDeathVis } from "./StackEffectVisualRepresentation/MonsterDeathVis";


export class MonsterDeath extends StackEffectConcrete {
    visualRepesentation: MonsterDeathVis;
    name = `Monster Is Going To Die`
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_DEATH;
    _lable!: string;

    isToBeFizzled = false;

    creationTurnId!: number;

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false;
    }

    nonOriginal = false;

    numberRolled: number | undefined
    monsterToDie: Monster;
    killer: Node

    constructor(creatorCardId: number, monsterToDieCard: Node, killerCard: Node, numberRolled?: number, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)
        this.killer = killerCard
        this.monsterToDie = monsterToDieCard.getComponent(Monster)!
        this.visualRepesentation = new MonsterDeathVis(this.monsterToDie)
        this.numberRolled = numberRolled
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`${this.monsterToDie} Is Going To Be Killed by ${killerCard.name}`, false)
        }
    }

    async putOnStack() {
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        if (WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity != null && this.monsterToDie.node == WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity.node) {
            await WrapperProvider.battleManagerWrapper.out.cancelAttack(true)
        }
        this.monsterToDie._thisTurnKiller = this.killer
        const turnPlayerCard = WrapperProvider.playerManagerWrapper.out.getPlayerById(WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId)!.character!
        const monsterReward = new MonsterRewardStackEffect(this.creatorCardId, this.monsterToDie.node, turnPlayerCard, this.numberRolled)

        await WrapperProvider.stackWrapper.out.addToStackBelow(monsterReward, this, true)

    }

    convertToServerStackEffect() {
        const serverCombatDamage = new ServerMonsterDeath(this)
        return serverCombatDamage
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: MonsterDeath\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.monsterToDie) { endString = endString + `Monster To Die:${this.monsterToDie.name}\n` }
        if (this.killer) { endString = endString + `Killer:${this.killer.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
