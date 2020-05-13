import { GAME_EVENTS, PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerPlayerDeathPenalties from "./ServerSideStackEffects/Server Player Death Penalties";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { PlayerDeathPenaltiesVis } from "./StackEffectVisualRepresentation/Player Death Penalties Vis";
import ActionLable from "../LableScripts/Action Lable";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";

export default class PlayerDeathPenalties extends StackEffectConcrete {
    visualRepesentation: PlayerDeathPenaltiesVis;
    name = `Player Death Penalties`
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAYER_DEATH_PENALTY;
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
    playerToPay: Player

    constructor(creatorCardId: number, playerToPayCard: cc.Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.playerToPay = PlayerManager.getPlayerByCard(playerToPayCard)
        this.visualRepesentation = new PlayerDeathPenaltiesVis(this.playerToPay.getComponent(Player))
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.playerToPay.playerId} Is About To Pay Death Penalties`, false)
        }
    }

    async putOnStack() {
        //TODO add passive check for every "before paying penalties" and "when a player would die"

        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES, [], null, this.playerToPay.node, this.entityId)
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        passiveMeta.args = afterPassiveMeta.args;

        //if prevent death, dont continue
        if (!afterPassiveMeta.continue) {
            await Stack.fizzleStackEffect(this, true)
            return
            // cc.log(`b4 fizzle player death penalties`)
            // cc.log(`after fizzle player death penalties`)
        }
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
    }

    async resolve() {
        const amId = ActionLable.$.publishMassage(`Player ${this.playerToPay.playerId} pays Penalties`, 0, true)
        await this.playerToPay.payPenalties(true)
        ActionLable.$.removeMessage(amId, true)
        this.playerToPay._isDead = true
        ServerClient.$.send(Signal.PLAYER_DIED, { playerId: this.playerToPay.playerId })
        this.setLable(`Player ${this.playerToPay.playerId} Paid Death Penalties`, true)
        // if (TurnsManager.currentTurn.getTurnPlayer().playerId == this.playerToPay.playerId) {
        //     //   Stack.removeFromCurrentStackEffectResolving()
        //     this.playerToPay.endTurn(true);
        // }

    }

    convertToServerStackEffect() {
        const serverPlayerDeathPenalties = new ServerPlayerDeathPenalties(this)
        return serverPlayerDeathPenalties
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Player Death Penalties\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.playerToPay) { endString = endString + `Player To Pay:${this.playerToPay.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
