import { GAME_EVENTS, PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Stack from "../Entites/Stack";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";

import Player from "../Entites/GameEntities/Player";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import ServerCombatDamage from "./ServerSideStackEffects/Server Combat Damage";
import StackEffectInterface from "./StackEffectInterface";
import { CombatDamageVis } from "./StackEffectVisualRepresentation/Combat Damage Vis";

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
    _lable: string;

    set lable(text: string) {
        this._lable = text;
        if (!this.nonOriginal) { whevent.emit(GAME_EVENTS.LABLE_CHANGE); }
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number;

    checkForFizzle() {
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) { return true; }
        if (this.isToBeFizzled) { return true; }
        let player: Player;
        let monster: Monster;
        if (this.isPlayerDoDamage) {
            player = PlayerManager.getPlayerByCard(this.entityToDoDamageCard);
            monster = this.entityToTakeDamageCard.getComponent(Monster);
        }
        if (this.isMonsterDoDamage) {
            player = PlayerManager.getPlayerByCard(this.entityToTakeDamageCard);
            monster = this.entityToDoDamageCard.getComponent(Monster);
        }
        if (player._isDead || player._Hp == 0 || monster.currentHp == 0 || monster._isDead || monster != BattleManager.currentlyAttackedMonster) {
            this.isToBeFizzled = true;
            return true;
        }
        return false;
    }

    nonOriginal: boolean = false;

    entityToTakeDamageCard: cc.Node;
    entityToDoDamageCard: cc.Node;
    isMonsterTakeDamage: boolean;
    isPlayerTakeDamage: boolean;
    isMonsterDoDamage: boolean;
    isPlayerDoDamage: boolean;

    numberRolled: number;

    constructor(creatorCardId: number, entityToTakeDamageCard: cc.Node, entityToDoDamageCard: cc.Node, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true;
            this.entityId = entityId;
        } else {
            this.entityId = Stack.getNextStackEffectId();
        }

        this.creatorCardId = creatorCardId;
        this.creationTurnId = TurnsManager.currentTurn.turnId;
        this.entityToTakeDamageCard = entityToTakeDamageCard;
        if (this.entityToTakeDamageCard.getComponent(Monster) != null) {
            this.isPlayerDoDamage = true;
            this.isMonsterDoDamage = false;
        } else {
            this.isPlayerDoDamage = false;
            this.isMonsterDoDamage = true;
        }
        this.entityToDoDamageCard = entityToDoDamageCard;
        if (this.entityToDoDamageCard.getComponent(Monster) != null) {
            this.isPlayerTakeDamage = true;
            this.isMonsterTakeDamage = false;
        } else {
            this.isPlayerDoDamage = false;
            this.isMonsterTakeDamage = true;
        }
        this.visualRepesentation = new CombatDamageVis(0, `${this.entityToDoDamageCard.name} is going to hurt ${this.entityToTakeDamageCard.name} `);
        this.lable = `${this.entityToDoDamageCard.name} combat damage to ${this.entityToTakeDamageCard.name}`;
    }

    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer();
        turnPlayer.givePriority(true);
        // add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        let player: Player;
        let damage: number;
        // if (player._isFirstAttackRollOfTurn) { player._isFirstAttackRollOfTurn = false; }
        if (this.isPlayerTakeDamage) {
            player = PlayerManager.getPlayerByCard(this.entityToTakeDamageCard);
            damage = this.entityToDoDamageCard.getComponent(Monster).calculateDamage();
            this.lable = `${this.entityToDoDamageCard.name} ${damage} combat damage to ${this.entityToTakeDamageCard.name}`;
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN, [damage, this.numberRolled, this.entityToDoDamageCard], null, player.node, this.entityId);
            const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta);
            if (!afterPassiveMeta.continue) { return; }
            passiveMeta.args = afterPassiveMeta.args;
            damage = afterPassiveMeta.args[0];
            this.numberRolled = afterPassiveMeta.args[1];

            this.visualRepesentation.changeDamage(damage);
            this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`;
            this.lable = `${this.entityToDoDamageCard.name} ${damage} combat damage to ${this.entityToTakeDamageCard.name}`;
            const isPlayerTookDamage = await player.takeDamage(damage, true, this.entityToDoDamageCard);
            if (isPlayerTookDamage) {
                passiveMeta.result = null;
                // do passive effects after!
                const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta);
            }

        } else {

            player = PlayerManager.getPlayerByCard(this.entityToDoDamageCard);
            damage = player.calculateDamage();

            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN, [damage, this.numberRolled, this.entityToDoDamageCard, this.entityToTakeDamageCard], null, player.node, this.entityId);
            const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta);
            if (!afterPassiveMeta.continue) { return; }
            passiveMeta.args = afterPassiveMeta.args;
            damage = afterPassiveMeta.args[0];

            const monster = this.entityToTakeDamageCard.getComponent(Monster);
            this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`;
            await monster.takeDamaged(damage, true, this.entityToDoDamageCard);
            // add death check!

            const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta);

        }


    }

    convertToServerStackEffect() {
        const serverCombatDamage = new ServerCombatDamage(this);
        return serverCombatDamage;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Combat Damage\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`;
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n`; }
        if (this.entityToDoDamageCard) { endString = endString + `Attacking Card:${this.entityToDoDamageCard.name}\n`; }
        if (this.numberRolled) { endString = endString + `Number Rolled:${this.numberRolled}\n`; }
        if (this.entityToTakeDamageCard) { endString = endString + `Taking Damage Card:${this.entityToTakeDamageCard.name}\n`; }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`; }
        return endString;
    }

}
