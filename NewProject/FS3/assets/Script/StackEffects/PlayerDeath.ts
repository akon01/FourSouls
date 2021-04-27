import { Node } from 'cc';
import { PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import { Card } from "../Entites/GameEntities/Card";
import { Player } from "../Entites/GameEntities/Player";
import { PassiveMeta } from "../Managers/PassiveMeta";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { PlayerDeathPenalties } from "./PlayerDeathPenalties";
import { ServerPlayerDeath } from "./ServerSideStackEffects/ServerPlayerDeath";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { PlayerDeathVis } from "./StackEffectVisualRepresentation/PlayerDeathVis";


export class PlayerDeath extends StackEffectConcrete {
    visualRepesentation: PlayerDeathVis;
    name = `PlayerDeath`
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAYER_DEATH;
    _lable!: string;

    isToBeFizzled = false;

    creationTurnId!: number;

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal = false;

    playerToDie: Player;
    killer: Node

    constructor(creatorCardId: number, playerToDieCard: Node, killer: Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)
        this.killer = killer

        this.playerToDie = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerToDieCard)!
        this.visualRepesentation = new PlayerDeathVis(this.playerToDie)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.playerToDie.playerId} Is About To Die`, false)
        }
    }

    async putOnStack() {
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)
    }

    async resolve() {

        let killer = this.killer
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_IS_KILLED, [killer], null, this.playerToDie.node, this.entityId)
        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
        if (!afterPassiveMeta.continue) {
            return
        }
        if (!afterPassiveMeta.args) { debugger; throw new Error("No Args Found!"); }

        killer = afterPassiveMeta.args[0]
        this.killer = killer
        this.playerToDie._thisTurnKiller = killer;
        this.setLable(`Player ${this.playerToDie.playerId} Has Died`, true)
        for (let i = 0; i < this.playerToDie._curses.length; i++) {
            const curse = this.playerToDie._curses[i];
            await this.playerToDie.removeCurse(curse, true)
        }
        const wasPlayerAttackedInBattle = this.playerToDie == WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity;
        if (WrapperProvider.battleManagerWrapper.out.inBattle && this.playerToDie == WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()! || wasPlayerAttackedInBattle) {
            await WrapperProvider.battleManagerWrapper.out.cancelAttack(true)
            if (wasPlayerAttackedInBattle) {
                const playerKilledInBattlePassiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_KILLED_IN_BATTLE, [killer], null, this.playerToDie.node)
                const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(playerKilledInBattlePassiveMeta)
                if (!afterPassiveMeta.continue) {
                    return
                }
                await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(playerKilledInBattlePassiveMeta)
            }
        }
        const playerPenalty = new PlayerDeathPenalties(this.playerToDie.character!.getComponent(Card)!._cardId, this.playerToDie.character!)
        //make silent
        await WrapperProvider.stackWrapper.out.fizzleStackEffect(this, true, true)
        await WrapperProvider.stackWrapper.out.addToStackAbove(playerPenalty)
        await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
        // await WrapperProvider.stackWrapper.out.addToStackBelow(playerPenalty, this, true)
    }

    convertToServerStackEffect() {

        const serverPlayerDeath = new ServerPlayerDeath(this)
        return serverPlayerDeath
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: PlayerDeath\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.playerToDie) { endString = endString + `Player To DIe:${this.playerToDie.name}\n` }
        if (this.killer) { endString = endString + `Killer:${this.killer.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
