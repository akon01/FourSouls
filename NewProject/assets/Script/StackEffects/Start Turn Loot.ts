import { GAME_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerStartTurnLoot from "./ServerSideStackEffects/Server Start Turn Loot";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { StartTurnVis } from "./StackEffectVisualRepresentation/Start Turn Vis";
import { whevent } from "../../ServerClient/whevent";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

export default class StartTurnLoot extends StackEffectConcrete {
    visualRepesentation: StartTurnVis
    name = `Start Turn Loot Draw`
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


    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false;
    }

    nonOriginal: boolean = false;

    turnPlayer: Player;

    constructor(creatorCardId: number, turnPlayerCard: cc.Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.turnPlayer = PlayerManager.getPlayerByCard(turnPlayerCard)
        this.visualRepesentation = new StartTurnVis(this.turnPlayer)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.turnPlayer.playerId} Is About To Loot For Start Turn`, false)
        }
    }


    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

    }

    async resolve(true) {
        //  let cardToDraw = await CardManager.lootDeck.getComponent(Deck).drawCard(true)
        await this.turnPlayer.drawCard(CardManager.lootDeck, true)
        this.setLable(`Player ${this.turnPlayer.playerId} Has Drawn Loot For Start Turn`, true)
    }

    convertToServerStackEffect() {
        const serverPlayLoot = new ServerStartTurnLoot(this);
        return serverPlayLoot;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Start Turn Loot\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.turnPlayer) { endString = endString + `Turn Player: ${this.turnPlayer.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
