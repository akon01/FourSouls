import { log } from 'cc';
import { PASSIVE_EVENTS, ROLL_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import { PassiveMeta } from "../Managers/PassiveMeta";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { ServerRollDiceStackEffect } from "./ServerSideStackEffects/ServerRollDIce";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { DiceRollVis } from "./StackEffectVisualRepresentation/DiceRollVis";

export class RollDiceStackEffect extends StackEffectConcrete {
    visualRepesentation: DiceRollVis
    name = `Roll Dice`
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ROLL_DICE;
    _lable!: string;


    isToBeFizzled: boolean = false;

    creationTurnId!: number









    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        if (!(WrapperProvider.stackWrapper.out._currentStack.indexOf(this.stackEffectToLock) >= 0)) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal: boolean = false;

    numberRolled!: number

    constructor(creatorId: number, stackEffectToLock: StackEffectInterface, entityId?: number, lable?: string) {
        super(creatorId, entityId)
        this.stackEffectToLock = stackEffectToLock;
        this.hasLockingStackEffect = false;
        const playerCard = WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId, true)!;
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!;
        this.visualRepesentation = new DiceRollVis(player, player.dice!.diceSprite!.spriteFrame!, `player ${player.playerId} is rolling dice`)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${player.playerId} Is About To Roll A Dice`, true)
        }
    }

    async putOnStack() {
        const playerCard = WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId, true)!;
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!;
        const numberRolled = await player.rollDice(ROLL_TYPE.EFFECT)
        console.log(`in roll dice stack effect rolled ${numberRolled}`)
        this.numberRolled = numberRolled
        WrapperProvider.stackEffectVisManagerWrapper.out.updatePreviewByStackId(this.entityId, `player ${player.playerId} rolled ${numberRolled}`)
        this.visualRepesentation.extraSprite = player.dice!.diceSprite!.spriteFrame!
        await WrapperProvider.decisionMarkerWrapper.out.showDiceRoll(this, true)
        // this.visualRepesentation.flavorText =
        this.setLable(`Player ${player.playerId} Rolled ${numberRolled}`, true)
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        const playerCard = WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId, true)!;
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!;
        let playerRollValue = player.calculateFinalRoll(this.numberRolled, ROLL_TYPE.EFFECT)
        this.visualRepesentation.extraSprite = player.dice!.diceSprite!.spriteFrame!
        if (this.numberRolled != playerRollValue) {
            if (this.numberRolled < playerRollValue) {
                this.setLable(`Player ${player.playerId} Added ${playerRollValue - this.numberRolled} To Its Original Roll, Rolled ${playerRollValue}`, true)
                WrapperProvider.actionLableWrapper.out.publishMassage(`Added ${playerRollValue - this.numberRolled} to original roll`, 3)
            } else {
                WrapperProvider.actionLableWrapper.out.publishMassage(`Decreased ${this.numberRolled - playerRollValue} From Original Roll`, 3)
                this.setLable(`Player ${player.playerId} decreased ${this.numberRolled - playerRollValue} from its original roll, rolled ${playerRollValue}`, true)
            }
        }

        playerRollValue = await player.dice!.setRoll(playerRollValue)
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [playerRollValue, ROLL_TYPE.EFFECT], null, player.node, this.entityId)
        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
        if (!afterPassiveMeta.args) { debugger; throw new Error("No Args Found!"); }
        playerRollValue = afterPassiveMeta.args[0]
        passiveMeta.args![0] = afterPassiveMeta.args[0]
        if (WrapperProvider.stackWrapper.out._currentStack.indexOf(this.stackEffectToLock) >= 0 && this.stackEffectToLock.hasLockingStackEffectResolved == false) {
            const stackEffectToLock = WrapperProvider.stackWrapper.out._currentStack[WrapperProvider.stackWrapper.out._currentStack.indexOf(this.stackEffectToLock)];
            stackEffectToLock.LockingResolve = playerRollValue
            stackEffectToLock.hasLockingStackEffectResolved = true;
        } else {
            console.log(`locking stack effect tried to resolve when his to lock effect is not in the stack`)
            console.log(this.stackEffectToLock)
            console.log(WrapperProvider.stackWrapper.out._currentStack)
        }
        await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
        player.lastRoll = playerRollValue
    }

    convertToServerStackEffect() {
        const serverDiceRoll = new ServerRollDiceStackEffect(this)
        return serverDiceRoll
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Roll Dice\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.numberRolled) { endString = endString + `Number Rolled:${this.numberRolled}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
