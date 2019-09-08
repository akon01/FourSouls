import { ROLL_TYPE, STACK_EFFECT_TYPE, PASSIVE_EVENTS } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import TurnsManager from "../Managers/TurnsManager";
import CombatDamage from "./Combat Damage";
import ServerAttackRoll from "./ServerSideStackEffects/Server Attack Roll";
import StackEffectInterface from "./StackEffectInterface";
import { StackEffectVisualRepresentation } from "./StackEffectVisualRepresentation/Stack Vis Interface";
import { AttackRollVis } from "./StackEffectVisualRepresentation/Attack Roll Vis";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";


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
        let numberRolled = await player.rollDice(ROLL_TYPE.ATTACK)
        this.numberRolled = numberRolled
        this.visualRepesentation.flavorText = 'player rolled ' + numberRolled + ' vs ' + this.attackedMonster.name
        this.visualRepesentation.hasBeenUpdated = true

        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        cc.log('resolve roll attack dice')
        let monsterEvasion = this.attackedMonster.rollValue + this.attackedMonster.rollBonus;
        let playerRollValue = this.numberRolled + this.rollingPlayer.attackRollBonus;
        //add the check if its the first attack roll, and first roll of the turn. and add the bonus.
        //if()
        //player hit monster.
        if (playerRollValue >= monsterEvasion) {
            let monsterCombatDamage = new CombatDamage(this.creatorCardId, this.attackedMonster.node, this.rollingPlayer.character)
            monsterCombatDamage.numberRolled = playerRollValue
            await Stack.addToStackBelow(monsterCombatDamage, this, true)

        } else {


            //Passive Check: Player Miss an Attack
            let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_MISS_ATTACK, null, null, this.rollingPlayer.node)
            let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
            //passiveMeta.args = afterPassiveMeta.args;

            let playerCombatDamage = new CombatDamage(this.creatorCardId, this.rollingPlayer.character, this.attackedMonster.node)
            playerCombatDamage.numberRolled = playerRollValue
            await Stack.addToStackBelow(playerCombatDamage, this, true)
        }
    }

    convertToServerStackEffect() {
        let serverDiceRoll = new ServerAttackRoll(this)
        return serverDiceRoll
    }

}
