import { STACK_EFFECT_TYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerPlayerDeathPenalties from "./ServerSideStackEffects/Server Player Death Penalties";
import StackEffectInterface from "./StackEffectInterface";
import { PlayerDeathPenaltiesVis } from "./StackEffectVisualRepresentation/Player Death Penalties Vis";


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

        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

        //add passive check for every time a monster dies.

    }

    async resolve() {
        cc.log('resolve player death penalty')
        await this.playerToPay.payPenalties(true)
        if (TurnsManager.currentTurn.getTurnPlayer().playerId == this.playerToPay.playerId) {
            await this.playerToPay.endTurn(true);
        }


    }

    convertToServerStackEffect() {
        let serverPlayerDeathPenalties = new ServerPlayerDeathPenalties(this)
        return serverPlayerDeathPenalties
    }

}
