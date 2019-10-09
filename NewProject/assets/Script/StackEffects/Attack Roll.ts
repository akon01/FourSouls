import { PASSIVE_EVENTS, ROLL_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import TurnsManager from "../Managers/TurnsManager";
import CombatDamage from "./Combat Damage";
import ServerAttackRoll from "./ServerSideStackEffects/Server Attack Roll";
import StackEffectInterface from "./StackEffectInterface";
import { AttackRollVis } from "./StackEffectVisualRepresentation/Attack Roll Vis";
import ActionLable from "../LableScripts/Action Lable";


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

    rollingPlayer: Player
    numberRolled: number
    attackedMonster: Monster

    constructor(creatorCardId: number, rollingPlayer: cc.Node, attackedMonsterCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.rollingPlayer = rollingPlayer.getComponent(Player)
        this.attackedMonster = attackedMonsterCard.getComponent(Monster)
        let dice = this.rollingPlayer.dice
        this.visualRepesentation = new AttackRollVis(dice.node.getComponent(cc.Sprite).spriteFrame, 'create attack roll');
    }

    async putOnStack() {
        let player = this.rollingPlayer
        let attackType;
        this.rollingPlayer._isFirstAttackRollOfTurn == true ? attackType = ROLL_TYPE.FIRST_ATTACK : attackType = ROLL_TYPE.ATTACK;
        let numberRolled = await player.rollDice(attackType)
        this.numberRolled = numberRolled
        this.visualRepesentation.flavorText = 'player rolled ' + numberRolled + ' vs ' + this.attackedMonster.name
        this.visualRepesentation.hasBeenUpdated = true

        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        cc.log('resolve roll attack dice')
        let attackType;
        this.rollingPlayer._isFirstAttackRollOfTurn == true ? attackType = ROLL_TYPE.FIRST_ATTACK : attackType = ROLL_TYPE.ATTACK;
        if (this.rollingPlayer._isFirstAttackRollOfTurn) this.rollingPlayer._isFirstAttackRollOfTurn = false;


        let monsterEvasion = this.attackedMonster.rollValue + this.attackedMonster.rollBonus;

        //let playerRollValue = this.numberRolled + this.rollingPlayer.attackRollBonus;
        let playerRollValue = this.rollingPlayer.calculateFinalRoll(this.numberRolled, attackType)
        cc.log(`Added ${this.rollingPlayer.attackRollBonus} to original roll`)
        ActionLable.$.publishMassage(`Added ${this.rollingPlayer.attackRollBonus} to original roll`, 3)
        playerRollValue = await this.rollingPlayer.dice.setRoll(playerRollValue)
        let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [playerRollValue, attackType, monsterEvasion], null, this.rollingPlayer.node)
        let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        playerRollValue = afterPassiveMeta.args[0]
        monsterEvasion = afterPassiveMeta.args[2]
        //add the check if its the first attack roll, and first roll of the turn. and add the bonus.
        //if()
        //player hit monster.
        if (playerRollValue >= monsterEvasion) {
            let monsterCombatDamage = new CombatDamage(this.creatorCardId, this.attackedMonster.node, this.rollingPlayer.character)
            monsterCombatDamage.numberRolled = playerRollValue
            await Stack.addToStackBelow(monsterCombatDamage, this, true)

        } else {


            //Passive Check: Player Miss an Attack
            let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_MISS_ATTACK, [playerRollValue], null, this.rollingPlayer.node)
            let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
            passiveMeta.args = afterPassiveMeta.args;

            if (afterPassiveMeta.continue) {
                let playerCombatDamage = new CombatDamage(this.creatorCardId, this.rollingPlayer.character, this.attackedMonster.node)
                playerCombatDamage.numberRolled = playerRollValue
                await Stack.addToStackBelow(playerCombatDamage, this, true)
            }

        }
    }

    convertToServerStackEffect() {
        let serverDiceRoll = new ServerAttackRoll(this)
        return serverDiceRoll
    }

}
