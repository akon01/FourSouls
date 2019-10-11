import { STACK_EFFECT_TYPE, PASSIVE_EVENTS } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerPlayerDeathPenalties from "./ServerSideStackEffects/Server Player Death Penalties";
import StackEffectInterface from "./StackEffectInterface";
import { PlayerDeathPenaltiesVis } from "./StackEffectVisualRepresentation/Player Death Penalties Vis";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import CardManager from "../Managers/CardManager";


export default class PlayerDeathPenalties implements StackEffectInterface {
    visualRepesentation: PlayerDeathPenaltiesVis;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAYER_DEATH_PENALTY;

    playerToPay: Player

    constructor(creatorCardId: number, playerToPayCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.playerToPay = PlayerManager.getPlayerByCard(playerToPayCard)
        this.visualRepesentation = new PlayerDeathPenaltiesVis(this.playerToPay.getComponent(Player))
    }

    async putOnStack() {
        cc.log(`put player death penalty on the stack`)


        //TODO add passive check for every "before paying penalties" and "when a player would die"

        let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES, [], null, this.playerToPay.node)
        cc.log(`check b4 passives in player death penalties`)
        let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        cc.log(`check after passives in player death penalties`)
        passiveMeta.args = afterPassiveMeta.args;

        //if prevent death, dont continue
        if (!afterPassiveMeta.continue) {
            return
            // cc.log(`b4 fizzle player death penalties`)
            // await Stack.fizzleStackEffect(this, true)
            // cc.log(`after fizzle player death penalties`) 
        }

        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        cc.log(`end of put on stack of player death panelties`)
    }

    async resolve() {
        cc.log('resolve player death penalty')
        await this.playerToPay.payPenalties(true)
        if (TurnsManager.currentTurn.getTurnPlayer().playerId == this.playerToPay.playerId) {
            //   Stack.removeFromCurrentStackEffectResolving()
            this.playerToPay.endTurn(true);
        }


    }

    convertToServerStackEffect() {
        let serverPlayerDeathPenalties = new ServerPlayerDeathPenalties(this)
        return serverPlayerDeathPenalties
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Player Death Penalties\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.playerToPay) endString = endString + `Player To Pay:${this.playerToPay.name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
