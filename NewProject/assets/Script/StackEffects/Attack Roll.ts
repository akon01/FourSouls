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
import StackEffectInterface from "./StackEffectInterface";
import { AttackRollVis } from "./StackEffectVisualRepresentation/Attack Roll Vis";

export default class AttackRoll implements StackEffectInterface {
    visualRepesentation: AttackRollVis;

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

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) { whevent.emit(GAME_EVENTS.LABLE_CHANGE) }
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        cc.log(`check for fizzle`)
        cc.log(this.creationTurnId)
        cc.log(TurnsManager.currentTurn.turnId)
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) { return true }
        if (this.isToBeFizzled) { return true }
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

    constructor(creatorCardId: number, rollingPlayer: cc.Node, attackedMonsterCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.creationTurnId = TurnsManager.currentTurn.turnId;
        this.rollingPlayer = rollingPlayer.getComponent(Player)
        this.attackedMonster = attackedMonsterCard.getComponent(Monster)
        const dice = this.rollingPlayer.dice
        this.visualRepesentation = new AttackRollVis(dice.node.getComponent(cc.Sprite).spriteFrame, "create attack roll");
        this.lable = `Player ${this.rollingPlayer.playerId} is rolling against ${this.attackedMonster.name}`
    }

    async putOnStack() {
        const player = this.rollingPlayer
        let attackType;
        this.rollingPlayer._isFirstAttackRollOfTurn == true ? attackType = ROLL_TYPE.FIRST_ATTACK : attackType = ROLL_TYPE.ATTACK;
        const numberRolled = await player.rollDice(attackType)
        this.numberRolled = numberRolled
        this.visualRepesentation.flavorText = "player rolled " + numberRolled + " vs " + this.attackedMonster.name
        this.visualRepesentation.hasBeenUpdated = true
        this.lable = `Player ${this.rollingPlayer.playerId} rolled ${numberRolled} vs ${this.attackedMonster.name}`

        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        let attackType;
        this.rollingPlayer._isFirstAttackRollOfTurn == true ? attackType = ROLL_TYPE.FIRST_ATTACK : attackType = ROLL_TYPE.ATTACK;
        if (this.rollingPlayer._isFirstAttackRollOfTurn) { this.rollingPlayer._isFirstAttackRollOfTurn = false; }

        let monsterEvasion = this.attackedMonster.rollValue + this.attackedMonster.rollBonus;

        //let playerRollValue = this.numberRolled + this.rollingPlayer.attackRollBonus;
        let playerRollValue = this.rollingPlayer.calculateFinalRoll(this.numberRolled, attackType)
        cc.log(`Added ${this.rollingPlayer.attackRollBonus} to original roll`)
        ActionLable.$.publishMassage(`Added ${this.rollingPlayer.attackRollBonus} to original roll`, 3)
        playerRollValue = await this.rollingPlayer.dice.setRoll(playerRollValue)
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [playerRollValue, attackType, monsterEvasion], null, this.rollingPlayer.node, this.entityId)
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        if (!afterPassiveMeta.continue) { return }
        playerRollValue = afterPassiveMeta.args[0]
        monsterEvasion = afterPassiveMeta.args[2]
        //add the check if its the first attack roll, and first roll of the turn. and add the bonus.
        //if()
        //player hit monster.
        if (playerRollValue >= monsterEvasion) {
            const monsterCombatDamage = new CombatDamage(this.creatorCardId, this.attackedMonster.node, this.rollingPlayer.character)
            monsterCombatDamage.numberRolled = playerRollValue
            await Stack.addToStackBelow(monsterCombatDamage, this, true)

        } else {

            //Passive Check: Player Miss an Attack
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_MISS_ATTACK, [playerRollValue], null, this.rollingPlayer.node, this.entityId)
            const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
            passiveMeta.args = afterPassiveMeta.args;

            if (afterPassiveMeta.continue) {
                const playerCombatDamage = new CombatDamage(this.creatorCardId, this.rollingPlayer.character, this.attackedMonster.node)
                playerCombatDamage.numberRolled = playerRollValue
                await Stack.addToStackBelow(playerCombatDamage, this, true)
            }

        }
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
