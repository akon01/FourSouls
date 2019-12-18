import { STACK_EFFECT_TYPE, GAME_EVENTS } from "../Constants";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import PlayerDeathPenalties from "./Player Death Penalties";
import ServerPlayerDeath from "./ServerSideStackEffects/Server Player Death";
import StackEffectInterface from "./StackEffectInterface";
import { PlayerDeathVis } from "./StackEffectVisualRepresentation/Player Death Vis ";
import CardManager from "../Managers/CardManager";
import BattleManager from "../Managers/BattleManager";


export default class PlayerDeath implements StackEffectInterface {
    visualRepesentation: PlayerDeathVis;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAYER_DEATH;
    _lable: string;

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) whevent.emit(GAME_EVENTS.LABLE_CHANGE)
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number


    checkForFizzle() {
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) return true
        return false
    }

    nonOriginal: boolean = false;

    playerToDie: Player;
    killer: cc.Node

    constructor(creatorCardId: number, playerToDieCard: cc.Node, killer: cc.Node, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }
        this.killer = killer
        this.creatorCardId = creatorCardId;
        this.creationTurnId = TurnsManager.currentTurn.turnId;
        this.playerToDie = PlayerManager.getPlayerByCard(playerToDieCard)
        this.visualRepesentation = new PlayerDeathVis(this.playerToDie)
        this.lable = `Player ${this.playerToDie.playerId} is about to die`
    }

    async putOnStack() {
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
    }

    async resolve() {
        this.playerToDie._thisTurnKiller = this.killer;
        for (let i = 0; i < this.playerToDie._curses.length; i++) {
            const curse = this.playerToDie._curses[i];
            await this.playerToDie.removeCurse(curse, true)
        }
        if (BattleManager.inBattle && this.playerToDie == TurnsManager.currentTurn.getTurnPlayer()) {
            await BattleManager.cancelAttack(true)
        }
        let playerPenalty = new PlayerDeathPenalties(this.playerToDie.character.getComponent(Card)._cardId, this.playerToDie.character)
        await Stack.addToStackAbove(playerPenalty)
        // await Stack.addToStackBelow(playerPenalty, this, true)
    }

    convertToServerStackEffect() {

        let serverPlayerDeath = new ServerPlayerDeath(this)
        return serverPlayerDeath
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Player Death\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.playerToDie) endString = endString + `Player To DIe:${this.playerToDie.name}\n`
        if (this.killer) endString = endString + `Killer:${this.killer.name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
