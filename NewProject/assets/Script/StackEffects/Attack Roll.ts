import { GAME_EVENTS, PASSIVE_EVENTS, ROLL_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import ActionLable from "../LableScripts/Action Lable";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import TurnsManager from "../Managers/TurnsManager";
import CombatDamage from "./Combat Damage";
import ServerAttackRoll from "./ServerSideStackEffects/Server Attack Roll";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { AttackRollVis } from "./StackEffectVisualRepresentation/Attack Roll Vis";
import StackEffectVisManager from "../Managers/StackEffectVisManager";
import DecisionMarker from "../Entites/Decision Marker";
import { whevent } from "../../ServerClient/whevent";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

export default class AttackRoll extends StackEffectConcrete {
    visualRepesentation: AttackRollVis;


    name = `Player Attack Roll On Monster`

    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ATTACK_ROLL;
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
        cc.log(`check for fizzle`)
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        if (this.rollingPlayer._isDead || this.rollingPlayer._Hp == 0 || this.attackedMonster._isDead || this.attackedMonster.currentHp == 0 || BattleManager.currentlyAttackedMonster != this.attackedMonster) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal: boolean = false;
    rollingPlayer: Player
    numberRolled: number
    attackedMonster: Monster

    constructor(creatorCardId: number, rollingPlayer: cc.Node, attackedMonsterCard: cc.Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.rollingPlayer = rollingPlayer.getComponent(Player)
        this.attackedMonster = attackedMonsterCard.getComponent(Monster)
        const dice = this.rollingPlayer.dice
        this.visualRepesentation = new AttackRollVis(this.rollingPlayer, dice.diceSprite.spriteFrame, "create attack roll");
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.rollingPlayer.playerId} is rolling against ${this.attackedMonster.name}`, false)
        }
    }

    async putOnStack() {
        const player = this.rollingPlayer
        let attackType;
        this.rollingPlayer._isFirstAttackRollOfTurn == true ? attackType = ROLL_TYPE.FIRST_ATTACK : attackType = ROLL_TYPE.ATTACK;
        const numberRolled = await player.rollDice(attackType)
        this.numberRolled = numberRolled
        StackEffectVisManager.$.updatePreviewByStackId(this.entityId, "player rolled " + numberRolled + " vs " + this.attackedMonster.name)
        this.visualRepesentation.extraSprite = player.dice.diceSprite.spriteFrame
        this.visualRepesentation.hasBeenUpdated = true
        await DecisionMarker.$.showDiceRoll(this, true)
        this.setLable(`Player ${this.rollingPlayer.playerId} rolled ${numberRolled} vs ${this.attackedMonster.name}`, true)

        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        let attackType: ROLL_TYPE;
        this.rollingPlayer._isFirstAttackRollOfTurn == true ? attackType = ROLL_TYPE.FIRST_ATTACK : attackType = ROLL_TYPE.ATTACK;
        let monsterEvasion = this.attackedMonster.rollValue + this.attackedMonster.rollBonus;
        //let playerRollValue = this.numberRolled + this.rollingPlayer.attackRollBonus;
        let playerRollValue = this.rollingPlayer.calculateFinalRoll(this.numberRolled, attackType)
        cc.log(`Added ${this.rollingPlayer.attackRollBonus} to original roll`)
        ActionLable.$.publishMassage(`Added ${this.rollingPlayer.attackRollBonus} to original roll`, 3)
        playerRollValue = await this.rollingPlayer.dice.setRoll(playerRollValue)
        this.visualRepesentation.extraSprite = this.rollingPlayer.dice.diceSprite.spriteFrame
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [playerRollValue, attackType, monsterEvasion], null, this.rollingPlayer.node, this.entityId)
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        if (!afterPassiveMeta.continue) { return }
        playerRollValue = afterPassiveMeta.args[0]
        monsterEvasion = afterPassiveMeta.args[2]
        passiveMeta.args[0] = afterPassiveMeta.args[0]
        passiveMeta.args[2] = afterPassiveMeta.args[2]
        //add the check if its the first attack roll, and first roll of the turn. and add the bonus.
        //if()
        //player hit monster.
        this.setLable(`Player ${this.rollingPlayer.playerId} Rolled ${playerRollValue} Against ${this.attackedMonster.name} ${monsterEvasion}`, true)
        if (playerRollValue >= monsterEvasion) {
            this.setLable(`Player ${this.rollingPlayer.playerId} Roll Hit`, true)
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_LAND_ATTACK, [playerRollValue, this.attackedMonster], null, this.rollingPlayer.node, this.entityId)
            const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
            passiveMeta.args = afterPassiveMeta.args;

            if (afterPassiveMeta.continue) {
                const monsterCombatDamage = new CombatDamage(this.creatorCardId, this.attackedMonster.node, this.rollingPlayer.character, playerRollValue)
                monsterCombatDamage.numberRolled = playerRollValue
                this.rollingPlayer.lastRoll = playerRollValue
                await Stack.addToStackBelow(monsterCombatDamage, this, true)
            }

        } else {
            this.setLable(`Player ${this.rollingPlayer.playerId} Roll Miss`, true)
            //Passive Check: Player Miss an Attack
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_MISS_ATTACK, [playerRollValue], null, this.rollingPlayer.node, this.entityId)
            const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
            passiveMeta.args = afterPassiveMeta.args;

            if (afterPassiveMeta.continue) {
                const playerCombatDamage = new CombatDamage(this.creatorCardId, this.rollingPlayer.character, this.attackedMonster.node, playerRollValue)
                playerCombatDamage.numberRolled = playerRollValue
                this.rollingPlayer.lastRoll = playerRollValue
                await Stack.addToStackBelow(playerCombatDamage, this, true)
            }
        }

        await PassiveManager.testForPassiveAfter(passiveMeta)
        this.rollingPlayer.lastAttackRoll = playerRollValue

    }

    convertToServerStackEffect() {
        const serverDiceRoll = new ServerAttackRoll(this)
        return serverDiceRoll
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Attack Roll\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.attackedMonster) { endString = endString + `Attacked Monster:${this.attackedMonster.name}\n` }
        if (this.numberRolled) { endString = endString + `Number Rolled:${this.numberRolled}\n` }
        if (this.rollingPlayer) { endString = endString + `Rolling Player:${this.rollingPlayer.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
