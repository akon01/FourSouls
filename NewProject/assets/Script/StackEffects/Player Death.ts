import { STACK_EFFECT_TYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import TurnsManager from "../Managers/TurnsManager";
import ServerPlayerDeath from "./ServerSideStackEffects/Server Player Death";
import StackEffectInterface from "./StackEffectInterface";
import { PlayerDeathVis } from "./StackEffectVisualRepresentation/Player Death Vis ";
import PlayerDeathPenalties from "./Player Death Penalties";
import Card from "../Entites/GameEntities/Card";
import Character from "../Entites/CardTypes/Character";
import PlayerManager from "../Managers/PlayerManager";


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

    playerToDie: Player;

    constructor(creatorCardId: number, playerToDieCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.playerToDie = PlayerManager.getPlayerByCard(playerToDieCard)
        this.visualRepesentation = new PlayerDeathVis(this.playerToDie)
    }

    async putOnStack() {
        cc.log(`put ${this.playerToDie.name} death on the stack`)
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        cc.log('resolve player death')
        for (let i = 0; i < this.playerToDie._curses.length; i++) {
            const curse = this.playerToDie._curses[i];
            await this.playerToDie.removeCurse(curse, true)
        }
        let playerPenalty = new PlayerDeathPenalties(this.playerToDie.character.getComponent(Card)._cardId, this.playerToDie.character)
        await Stack.addToStackBelow(playerPenalty, this)
    }

    convertToServerStackEffect() {
        let serverPlayerDeath = new ServerPlayerDeath(this)
        return serverPlayerDeath
    }

}
