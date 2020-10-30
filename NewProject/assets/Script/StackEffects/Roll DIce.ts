import { GAME_EVENTS, PASSIVE_EVENTS, ROLL_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import Stack from "../Entites/Stack";
import ActionLable from "../LableScripts/Action Lable";
import CardManager from "../Managers/CardManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerRollDiceStackEffect from "./ServerSideStackEffects/Server Roll DIce";
import StackEffectInterface from "./StackEffectInterface";
import { DiceRollVis } from "./StackEffectVisualRepresentation/Dice Roll Vis";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectVisManager from "../Managers/StackEffectVisManager";
import DecisionMarker from "../Entites/Decision Marker";
import { whevent } from "../../ServerClient/whevent";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

export default class RollDiceStackEffect extends StackEffectConcrete {
    visualRepesentation: DiceRollVis
    name = `Roll Dice`
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


    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        if (!Stack._currentStack.includes(this.stackEffectToLock)) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal: boolean = false;

    numberRolled: number

    constructor(creatorId: number, stackEffectToLock: StackEffectInterface, entityId?: number, lable?: string) {
        super(creatorId, entityId)
        this.stackEffectToLock = stackEffectToLock;
        this.hasLockingStackEffect = false;
        const playerCard = CardManager.getCardById(this.creatorCardId, true);
        const player = PlayerManager.getPlayerByCard(playerCard);
        this.visualRepesentation = new DiceRollVis(player, player.dice.diceSprite.spriteFrame, `player ${player.playerId} is rolling dice`)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${player.playerId} Is About To Roll A Dice`, true)
        }
    }

    async putOnStack() {
        const playerCard = CardManager.getCardById(this.creatorCardId, true);
        const player = PlayerManager.getPlayerByCard(playerCard);
        const numberRolled = await player.rollDice(ROLL_TYPE.EFFECT)
        cc.log(`in roll dice stack effect rolled ${numberRolled}`)
        this.numberRolled = numberRolled
        StackEffectVisManager.$.updatePreviewByStackId(this.entityId, `player ${player.playerId} rolled ${numberRolled}`)
        this.visualRepesentation.extraSprite = player.dice.diceSprite.spriteFrame
        await DecisionMarker.$.showDiceRoll(this, true)
        // this.visualRepesentation.flavorText =
        this.setLable(`Player ${player.playerId} Rolled ${numberRolled}`, true)
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve(true) {
        const playerCard = CardManager.getCardById(this.creatorCardId, true);
        const player = PlayerManager.getPlayerByCard(playerCard);
        let playerRollValue = player.calculateFinalRoll(this.numberRolled, ROLL_TYPE.EFFECT)
        this.visualRepesentation.extraSprite = player.dice.diceSprite.spriteFrame
        if (this.numberRolled != playerRollValue) {
            if (this.numberRolled < playerRollValue) {
                this.setLable(`Player ${player.playerId} Added ${playerRollValue - this.numberRolled} To Its Original Roll, Rolled ${playerRollValue}`, true)
                ActionLable.$.publishMassage(`Added ${playerRollValue - this.numberRolled} to original roll`, 3)
            } else {
                ActionLable.$.publishMassage(`Decreased ${this.numberRolled - playerRollValue} From Original Roll`, 3)
                this.setLable(`Player ${player.playerId} decreased ${this.numberRolled - playerRollValue} from its original roll, rolled ${playerRollValue}`, true)
            }
        }

        playerRollValue = await player.dice.setRoll(playerRollValue)
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [playerRollValue, ROLL_TYPE.EFFECT], null, player.node, this.entityId)
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        playerRollValue = afterPassiveMeta.args[0]
        passiveMeta.args[0] = afterPassiveMeta.args[0]
        if (Stack._currentStack.includes(this.stackEffectToLock) && this.stackEffectToLock.hasLockingStackEffectResolved == false) {
            const stackEffectToLock = Stack._currentStack[Stack._currentStack.indexOf(this.stackEffectToLock)];
            stackEffectToLock.LockingResolve = playerRollValue
            stackEffectToLock.hasLockingStackEffectResolved = true;
        } else {
            cc.log(`locking stack effect tried to resolve when his to lock effect is not in the stack`)
            cc.log(this.stackEffectToLock)
            cc.log(Stack._currentStack)
        }
        await PassiveManager.testForPassiveAfter(passiveMeta)
        player.lastRoll = playerRollValue
    }

    convertToServerStackEffect() {
        const serverDiceRoll = new ServerRollDiceStackEffect(this)
        return serverDiceRoll
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Roll Dice\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.numberRolled) { endString = endString + `Number Rolled:${this.numberRolled}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
