import { STACK_EFFECT_TYPE, GAME_EVENTS } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerStartTurnLoot from "./ServerSideStackEffects/Server Start Turn Loot";
import StackEffectInterface from "./StackEffectInterface";
import { StartTurnVis } from "./StackEffectVisualRepresentation/Start Turn Vis";


export default class StartTurnLoot implements StackEffectInterface {


    visualRepesentation: StartTurnVis
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.START_TURN_LOOT;
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    _lable: string;

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) whevent.emit(GAME_EVENTS.LABLE_CHANGE)
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number


    checkForFizzle() {
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) return true
        return false;
    }

    nonOriginal: boolean = false;

    turnPlayer: Player;


    constructor(creatorCardId: number, turnPlayerCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }
        this.creatorCardId = creatorCardId;
        this.creationTurnId = TurnsManager.currentTurn.turnId;
        this.turnPlayer = PlayerManager.getPlayerByCard(turnPlayerCard)
        this.visualRepesentation = new StartTurnVis(this.turnPlayer)
        this.lable = `Player ${this.turnPlayer.playerId} start turn loot`
    }



    async putOnStack() {
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

    }

    async resolve() {
        //  let cardToDraw = await CardManager.lootDeck.getComponent(Deck).drawCard(true)
        await this.turnPlayer.drawCard(CardManager.lootDeck, true)
    }



    convertToServerStackEffect() {
        let serverPlayLoot = new ServerStartTurnLoot(this);
        return serverPlayLoot;
    }


    toString() {
        let endString = `id:${this.entityId}\ntype: Start Turn Loot\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.turnPlayer) endString = endString + `Turn Player: ${this.turnPlayer.name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
