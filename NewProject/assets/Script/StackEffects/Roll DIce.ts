import { ROLL_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerRollDiceStackEffect from "./ServerSideStackEffects/Server Roll DIce";
import StackEffectInterface from "./StackEffectInterface";
import { DiceRollVis } from "./StackEffectVisualRepresentation/Dice Roll Vis";


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

    resolve() {
        cc.log('resolve roll dice')
        if (Stack._currentStack.includes(this.stackEffectToLock) && this.stackEffectToLock.hasLockingStackEffectResolved == false) {
            let stackEffectToLock = Stack._currentStack[Stack._currentStack.indexOf(this.stackEffectToLock)];
            stackEffectToLock.LockingResolve = this.numberRolled;
            stackEffectToLock.hasLockingStackEffectResolved = true;
        } else {
            cc.log(`locking stack effect tried to resolve when his to lock effect is not in the stack`)
        }
    }

    convertToServerStackEffect() {
        let serverDiceRoll = new ServerRollDiceStackEffect(this)
        return serverDiceRoll
    }

}
