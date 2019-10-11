import { STACK_EFFECT_TYPE, PASSIVE_EVENTS } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Stack from "../Entites/Stack";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";

import StackEffectInterface from "./StackEffectInterface";
import { CombatDamageVis } from "./StackEffectVisualRepresentation/Combat Damage Vis";
import ServerCombatDamage from "./ServerSideStackEffects/Server Combat Damage";
import Player from "../Entites/GameEntities/Player";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import CardManager from "../Managers/CardManager";


export default class CombatDamage implements StackEffectInterface {
    visualRepesentation: CombatDamageVis;

    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.COMBAT_DAMAGE;
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;

    entityToTakeDamageCard: cc.Node
    entityToDoDamageCard: cc.Node
    isMonsterTakeDamage: boolean
    isPlayerTakeDamage: boolean
    isMonsterDoDamage: boolean
    isPlayerDoDamage: boolean;

    numberRolled: number;

    constructor(creatorCardId: number, entityToTakeDamageCard: cc.Node, entityToDoDamageCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.entityToTakeDamageCard = entityToTakeDamageCard;
        if (this.entityToTakeDamageCard.getComponent(Monster) != null) {
            this.isPlayerDoDamage = true
            this.isMonsterDoDamage = false;
        } else {
            this.isPlayerDoDamage = false;
            this.isMonsterDoDamage = true
        }
        this.entityToDoDamageCard = entityToDoDamageCard
        if (this.entityToDoDamageCard.getComponent(Monster) != null) {
            this.isPlayerTakeDamage = true
            this.isMonsterTakeDamage = false;
        } else {
            this.isPlayerDoDamage = false;
            this.isMonsterTakeDamage = true
        }
        this.visualRepesentation = new CombatDamageVis(0, `${this.entityToDoDamageCard.name} is going to hurt ${this.entityToTakeDamageCard.name} `)
    }

    async putOnStack() {
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack 
    }

    async resolve() {
        let player: Player
        let damage: number
        if (this.isPlayerTakeDamage) {
            cc.log('player take damage')

            player = PlayerManager.getPlayerByCard(this.entityToTakeDamageCard)
            damage = this.entityToDoDamageCard.getComponent(Monster).calculateDamage()
            cc.log(`player should take ${damage} damage`)
            let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN, [damage, this.numberRolled, this.entityToDoDamageCard], null, player.node)
            let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
            passiveMeta.args = afterPassiveMeta.args;
            damage = afterPassiveMeta.args[0]
            this.numberRolled = afterPassiveMeta.args[1]
            cc.log(`after passives, damge is ${damage}, numberRolled is ${this.numberRolled}`)

            this.visualRepesentation.changeDamage(damage)
            this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`
            await player.getHit(damage, true, this.entityToDoDamageCard)
            passiveMeta.result = null
            //do passive effects after!
            let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)

        } else {
            cc.log('mosnter take damage')
            player = PlayerManager.getPlayerByCard(this.entityToDoDamageCard);
            damage = player.calculateDamage();

            let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN, [damage, this.numberRolled, this.entityToDoDamageCard, this.entityToTakeDamageCard], null, player.node)
            let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
            passiveMeta.args = afterPassiveMeta.args;
            damage = afterPassiveMeta.args[0]

            let monster = this.entityToTakeDamageCard.getComponent(Monster)
            this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`
            await monster.getDamaged(damage, true, this.entityToDoDamageCard)
            //add death check!

            let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)

        }

        if (player._isFirstAttackRollOfTurn) player._isFirstAttackRollOfTurn = false;

    }

    convertToServerStackEffect() {
        let serverCombatDamage = new ServerCombatDamage(this)
        return serverCombatDamage
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Combat Damage\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.entityToDoDamageCard) endString = endString + `Attacking Card:${this.entityToDoDamageCard.name}\n`
        if (this.numberRolled) endString = endString + `Number Rolled:${this.numberRolled}\n`
        if (this.entityToTakeDamageCard) endString = endString + `Taking Damage Card:${this.entityToTakeDamageCard.name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
