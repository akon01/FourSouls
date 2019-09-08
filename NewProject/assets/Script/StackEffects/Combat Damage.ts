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
        cc.log('put combat damage on stack')
        cc.log(this.visualRepesentation)
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for all the +X/-X To dice rolls to add on top of the stack 
    }

    async resolve() {
        cc.log('resolve combat damage')
        let player: Player
        let damage
        if (this.isPlayerTakeDamage) {
            cc.log('player take damage')

            player = PlayerManager.getPlayerByCard(this.entityToTakeDamageCard)
            damage = this.entityToDoDamageCard.getComponent(Monster).calculateDamage()

            let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN, [damage, this.numberRolled], null, player.node)
            let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
            passiveMeta.args = afterPassiveMeta.args;

            this.visualRepesentation.changeDamage(damage)
            this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`
            await player.getHit(damage, true)
            passiveMeta.result = null
            //do passive effects after!
            let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)

        } else {
            cc.log('mosnter take damage')
            player = PlayerManager.getPlayerByCard(this.entityToDoDamageCard);
            damage = player.calculateDamage();
            let monster = this.entityToTakeDamageCard.getComponent(Monster)
            this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`
            await monster.getDamaged(damage, true)
            //add death check!

        }

    }

    convertToServerStackEffect() {
        let serverCombatDamage = new ServerCombatDamage(this)
        return serverCombatDamage
    }

}
