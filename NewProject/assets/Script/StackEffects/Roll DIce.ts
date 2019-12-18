import { ROLL_TYPE, STACK_EFFECT_TYPE, PASSIVE_EVENTS, GAME_EVENTS } from "../Constants";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerRollDiceStackEffect from "./ServerSideStackEffects/Server Roll DIce";
import StackEffectInterface from "./StackEffectInterface";
import { DiceRollVis } from "./StackEffectVisualRepresentation/Dice Roll Vis";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import ActionLable from "../LableScripts/Action Lable";


export default class RollDiceStackEffect implements StackEffectInterface {

    visualRepesentation: DiceRollVis
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ROLL_DICE;
    _lable: string;

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) whevent.emit(GAME_EVENTS.LABLE_CHANGE)
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number


    checkForFizzle() {
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) return true
        if (this.isToBeFizzled) return true
        if (!Stack._currentStack.includes(this.stackEffectToLock)) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal: boolean = false;

    numberRolled: number

    constructor(creatorId: number, stackEffectToLock: StackEffectInterface, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorId;
        this.stackEffectToLock = stackEffectToLock;
        this.hasLockingStackEffect = false;
        let playerCard = CardManager.getCardById(this.creatorCardId, true);
        let player = PlayerManager.getPlayerByCard(playerCard);
        this.visualRepesentation = new DiceRollVis(player.dice.node.getComponent(cc.Sprite).spriteFrame, `player ${player.playerId} is rolling dice`)
        this.lable = `Player ${player.playerId} roll a dice`
    }

    async putOnStack() {
        cc.error(`put on stack of roll dice`)
        let playerCard = CardManager.getCardById(this.creatorCardId, true);
        let player = PlayerManager.getPlayerByCard(playerCard);
        cc.error(`roll dice put on stack b4 roll dice`)
        let numberRolled = await player.rollDice(ROLL_TYPE.EFFECT)
        cc.error(`roll dice put on stack after ${numberRolled}`)
        this.numberRolled = numberRolled
        this.visualRepesentation.flavorText = `player ${player.playerId} rolled ${numberRolled}`
        this.lable = `Player ${player.playerId} rolled ${numberRolled}`
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        cc.error(`resolve of roll dice`)
        let playerCard = CardManager.getCardById(this.creatorCardId, true);
        let player = PlayerManager.getPlayerByCard(playerCard);
        let playerRollValue = player.calculateFinalRoll(this.numberRolled, ROLL_TYPE.EFFECT)

        if (this.numberRolled != playerRollValue) {
            if (this.numberRolled < playerRollValue) {
                this.lable = `Player ${player.playerId} added ${playerRollValue - this.numberRolled} to its original roll, rolled ${playerRollValue}`
                ActionLable.$.publishMassage(`Added ${playerRollValue - this.numberRolled} to original roll`, 3)
            } else {
                ActionLable.$.publishMassage(`Decreased ${this.numberRolled - playerRollValue} from original roll`, 3)
                this.lable = `Player ${player.playerId} decreased ${this.numberRolled - playerRollValue} from its original roll, rolled ${playerRollValue}`
            }
        }


        playerRollValue = await player.dice.setRoll(playerRollValue)
        let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [playerRollValue, ROLL_TYPE.EFFECT], null, player.node, this.entityId)
        cc.error(`player roll value b4 passive ${playerRollValue}`)
        let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        playerRollValue = afterPassiveMeta.args[0]
        cc.error(`player roll value after passive ${playerRollValue}`)
        if (Stack._currentStack.includes(this.stackEffectToLock) && this.stackEffectToLock.hasLockingStackEffectResolved == false) {
            let stackEffectToLock = Stack._currentStack[Stack._currentStack.indexOf(this.stackEffectToLock)];
            stackEffectToLock.LockingResolve = playerRollValue
            stackEffectToLock.hasLockingStackEffectResolved = true;
        } else {
            cc.log(`locking stack effect tried to resolve when his to lock effect is not in the stack`)
        }
    }

    convertToServerStackEffect() {
        let serverDiceRoll = new ServerRollDiceStackEffect(this)
        return serverDiceRoll
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Roll Dice\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.numberRolled) endString = endString + `Number Rolled:${this.numberRolled}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
