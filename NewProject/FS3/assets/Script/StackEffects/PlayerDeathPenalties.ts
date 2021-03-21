import { Node } from 'cc';
import { Signal } from "../../Misc/Signal";
import { PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { PassiveMeta } from "../Managers/PassiveMeta";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { ServerPlayerDeathPenalties } from "./ServerSideStackEffects/ServerPlayerDeathPenalties";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { PlayerDeathPenaltiesVis } from "./StackEffectVisualRepresentation/PlayerDeathPenaltiesVis";

export class PlayerDeathPenalties extends StackEffectConcrete {
    visualRepesentation: PlayerDeathPenaltiesVis;
    name = `PlayerDeathPenalties`
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAYER_DEATH_PENALTY;
    _lable!: string;

    isToBeFizzled: boolean = false;

    creationTurnId!: number;

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal: boolean = false;
    playerToPay: Player

    constructor(creatorCardId: number, playerToPayCard: Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.playerToPay = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerToPayCard)!
        this.visualRepesentation = new PlayerDeathPenaltiesVis(this.playerToPay.getComponent(Player)!)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.playerToPay.playerId} Is About To Pay Death Penalties`, false)
        }
    }

    async putOnStack() {
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES, [], null, this.playerToPay.node, this.entityId)
        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
        passiveMeta.args = afterPassiveMeta.args;

        //if prevent death, dont continue
        if (!afterPassiveMeta.continue) {
            await WrapperProvider.stackWrapper.out.fizzleStackEffect(this, true, true)
            return
        }
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true);
    }

    async resolve() {
        const amId = WrapperProvider.actionLableWrapper.out.publishMassage(`Player ${this.playerToPay.playerId} pays Penalties`, 0, true)
        await this.playerToPay.payPenalties()
        WrapperProvider.actionLableWrapper.out.removeMessage(amId, true)
        this.playerToPay._isDead = true
        WrapperProvider.serverClientWrapper.out.send(Signal.PLAYER_DIED, { playerId: this.playerToPay.playerId })
        this.setLable(`Player ${this.playerToPay.playerId} Paid Death Penalties`, true)
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES, [], null, this.playerToPay.node, this.entityId)
        await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
        // if (turnsManagerWrapper._tm.currentTurn.getTurnPlayer().playerId == this.playerToPay.playerId) {
        //     //   WrapperProvider.stackWrapper.out.removeFromCurrentStackEffectResolving()
        //     this.playerToPay.endTurn(true);
        // }

    }

    convertToServerStackEffect() {
        const serverPlayerDeathPenalties = new ServerPlayerDeathPenalties(this)
        return serverPlayerDeathPenalties
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: PlayerDeathPenalties\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.playerToPay) { endString = endString + `Player To Pay:${this.playerToPay.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
