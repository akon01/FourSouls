import { ROLL_TYPE, STACK_EFFECT_TYPE, PASSIVE_EVENTS } from "../Constants";
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



    numberRolled: number

    constructor(creatorId: number, stackEffectToLock: StackEffectInterface, entityId?: number) {
        if (entityId) {
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
    }

    async putOnStack() {
        let playerCard = CardManager.getCardById(this.creatorCardId, true);
        let player = PlayerManager.getPlayerByCard(playerCard);
        let numberRolled = await player.rollDice(ROLL_TYPE.EFFECT)
        this.numberRolled = numberRolled
        this.visualRepesentation.flavorText = `player ${player.playerId} rolled ${numberRolled}`
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        cc.log('resolve roll dice')
        let playerCard = CardManager.getCardById(this.creatorCardId, true);
        let player = PlayerManager.getPlayerByCard(playerCard);
        cc.log(`roll b4 modifires ${this.numberRolled}`)
        let playerRollValue = player.calculateFinalRoll(this.numberRolled, ROLL_TYPE.EFFECT)
        cc.log(`roll after modifires ${playerRollValue}`)
        ActionLable.$.publishMassage(`Added ${player.nonAttackRollBonus} to original roll`, 3)
        playerRollValue = await player.dice.setRoll(playerRollValue)
        let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [playerRollValue, ROLL_TYPE.EFFECT], null, player.node)
        let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        playerRollValue = afterPassiveMeta.args[0]
        if (Stack._currentStack.includes(this.stackEffectToLock) && this.stackEffectToLock.hasLockingStackEffectResolved == false) {
            let stackEffectToLock = Stack._currentStack[Stack._currentStack.indexOf(this.stackEffectToLock)];
            cc.log(`setting stackEffect ${stackEffectToLock.entityId} locking resolve as ${playerRollValue}`)
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
