import { log, Node } from 'cc';
import { PASSIVE_EVENTS, ROLL_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import { Monster } from "../Entites/CardTypes/Monster";
import { Player } from "../Entites/GameEntities/Player";
import { IAttackableEntity } from '../Entites/IAttackableEntity';
import { PassiveMeta } from "../Managers/PassiveMeta";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { CombatDamage } from "./CombatDamage";
import { ServerAttackRoll } from "./ServerSideStackEffects/ServerAttackRoll";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { AttackRollVis } from "./StackEffectVisualRepresentation/AttackRollVis";

export class AttackRoll extends StackEffectConcrete {
    visualRepesentation: AttackRollVis;


    name = `Player AttackRoll On Monster`

    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ATTACK_ROLL;
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    _lable!: string;

    isToBeFizzled = false;

    creationTurnId!: number;

    checkForFizzle() {
        console.log(`check for fizzle`)
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        if (this.rollingPlayer._isDead || this.rollingPlayer._Hp == 0 || this.attackedEntity._isDead || this.attackedEntity.getCurrentHp() == 0 || WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity != this.attackedEntity) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal = false;
    rollingPlayer: Player
    numberRolled!: number;
    attackedEntity: IAttackableEntity

    constructor(creatorCardId: number, rollingPlayer: Node, attackedMonsterCard: Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.rollingPlayer = rollingPlayer.getComponent(Player)!
        this.attackedEntity = (attackedMonsterCard.getComponent(Monster) ?? attackedMonsterCard.getComponent(Player))!
        const dice = this.rollingPlayer.dice!
        this.visualRepesentation = new AttackRollVis(this.rollingPlayer, dice.diceSprite!.spriteFrame!, "create AttackRoll");
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.rollingPlayer.playerId} is rolling against ${this.attackedEntity.node.name}`, false)
        }
    }

    async putOnStack() {
        const player = this.rollingPlayer
        let attackType;
        this.rollingPlayer._isFirstAttackRollOfTurn == true ? attackType = ROLL_TYPE.FIRST_ATTACK : attackType = ROLL_TYPE.ATTACK;
        const numberRolled = await player.rollDice(attackType)
        console.log(`in AttackRoll stack effect rolled ${numberRolled}`)
        this.numberRolled = numberRolled
        WrapperProvider.stackEffectVisManagerWrapper.out.updatePreviewByStackId(this.entityId, "player rolled " + numberRolled + " vs " + this.attackedEntity.node.name)
        this.visualRepesentation.extraSprite = player.dice!.diceSprite!.spriteFrame!
        this.visualRepesentation.hasBeenUpdated = true
        await WrapperProvider.decisionMarkerWrapper.out.showDiceRoll(this, true)
        this.setLable(`Player ${this.rollingPlayer.playerId} rolled ${numberRolled} vs ${this.attackedEntity.node.name}`, true)

        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        let attackType: ROLL_TYPE;
        this.rollingPlayer._isFirstAttackRollOfTurn == true ? attackType = ROLL_TYPE.FIRST_ATTACK : attackType = ROLL_TYPE.ATTACK;
        let monsterEvasion = this.attackedEntity.getRollValue() + this.attackedEntity.getRollBonus();
        //let playerRollValue = this.numberRolled + this.rollingPlayer.attackRollBonus;
        let playerRollValue = this.rollingPlayer.calculateFinalRoll(this.numberRolled, attackType)
        console.log(`Added ${this.rollingPlayer.attackRollBonus} to original roll`)
        WrapperProvider.actionLableWrapper.out.publishMassage(`Added ${this.rollingPlayer.attackRollBonus} to original roll`, 3)
        playerRollValue = await this.rollingPlayer!.dice!.setRoll(playerRollValue)
        this.visualRepesentation.extraSprite = this.rollingPlayer!.dice!.diceSprite!.spriteFrame!
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [playerRollValue, attackType, monsterEvasion], null, this.rollingPlayer.node, this.entityId)
        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
        if (!afterPassiveMeta.continue) { return }
        if (!afterPassiveMeta.args) { debugger; throw new Error("No Args Found!"); }

        playerRollValue = afterPassiveMeta.args[0]
        monsterEvasion = afterPassiveMeta.args[2]
        passiveMeta.args![0] = afterPassiveMeta.args[0]
        passiveMeta.args![2] = afterPassiveMeta.args[2]


        //add the check if its the first AttackRoll, and first roll of the turn. and add the bonus.
        //if()
        //player hit monster.
        this.setLable(`Player ${this.rollingPlayer.playerId} Rolled ${playerRollValue} Against ${this.attackedEntity.node.name}'s ${monsterEvasion} Evasion`, true)
        if (playerRollValue >= monsterEvasion) {
            this.setLable(`Player ${this.rollingPlayer.playerId} Roll Hit`, true)
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_LAND_ATTACK, [playerRollValue, this.attackedEntity], null, this.rollingPlayer.node, this.entityId)
            const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
            passiveMeta.args = afterPassiveMeta.args;

            if (afterPassiveMeta.continue) {
                const monsterCombatDamage = new CombatDamage(this.creatorCardId, this.attackedEntity.node, this.rollingPlayer!.character!, playerRollValue)
                monsterCombatDamage.numberRolled = playerRollValue
                this.rollingPlayer.lastRoll = playerRollValue
                await WrapperProvider.stackWrapper.out.addToStackBelow(monsterCombatDamage, this, true)
                await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
        } else {
            this.setLable(`Player ${this.rollingPlayer.playerId} Roll Miss`, true)
            //Passive Check: Player Miss an Attack
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_MISS_ATTACK, [playerRollValue, this.attackedEntity], null, this.rollingPlayer.node, this.entityId)
            const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
            passiveMeta.args = afterPassiveMeta.args;

            if (afterPassiveMeta.continue) {
                const playerCombatDamage = new CombatDamage(this.creatorCardId, this.rollingPlayer.character!, this.attackedEntity.node, playerRollValue)
                playerCombatDamage.numberRolled = playerRollValue
                this.rollingPlayer.lastRoll = playerRollValue
                await WrapperProvider.stackWrapper.out.addToStackBelow(playerCombatDamage, this, true)
                await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
        }
        //maybe make silent
        await WrapperProvider.stackWrapper.out.fizzleStackEffect(this, true, true)
        await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
        this.rollingPlayer.handleDiceRollProperties(true, playerRollValue)
    }

    convertToServerStackEffect() {
        const serverDiceRoll = new ServerAttackRoll(this)
        return serverDiceRoll
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: AttackRoll\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.attackedEntity) { endString = endString + `Attacked Monster:${this.attackedEntity.node.name}\n` }
        if (this.numberRolled) { endString = endString + `Number Rolled:${this.numberRolled}\n` }
        if (this.rollingPlayer) { endString = endString + `Rolling Player:${this.rollingPlayer.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
