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
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { CombatDamageVis } from "./StackEffectVisualRepresentation/Combat Damage Vis";
import StackEffectVisManager from "../Managers/StackEffectVisManager";
import { whevent } from "../../ServerClient/whevent";

export default class CombatDamage extends StackEffectConcrete {
    visualRepesentation: CombatDamageVis;
    name = `Combat Damage`
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

    isToBeFizzled: boolean = false;

    creationTurnId: number;

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
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
        if (player || monster) {
            if (player._isDead || player._Hp == 0 || monster.currentHp == 0 || monster._isDead || monster != BattleManager.currentlyAttackedMonster) {
                this.isToBeFizzled = true;
                return true;
            }
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

    constructor(creatorCardId: number, entityToTakeDamageCard: cc.Node, entityToDoDamageCard: cc.Node, numberRolled: number, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)
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
        if (this.isPlayerDoDamage) {
            this.name = `Player Combat Damage To A Monster`
        } else {
            this.name = `Monster Combat Damage To A Player`
        }
        this.numberRolled = numberRolled
        this.visualRepesentation = new CombatDamageVis(this.entityToDoDamageCard, this.entityToTakeDamageCard, 0, `${this.entityToDoDamageCard.name} is going to hurt ${this.entityToTakeDamageCard.name} `);
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`${this.entityToDoDamageCard.name} is going to hurt ${this.entityToTakeDamageCard.name}`, false);
        }
    }

    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer();
        turnPlayer.givePriority(true);
        // add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        cc.error(`combat dmg resolve`)
        let player: Player;
        let damage: number;
        // if (player._isFirstAttackRollOfTurn) { player._isFirstAttackRollOfTurn = false; }
        if (this.isPlayerTakeDamage) {
            player = PlayerManager.getPlayerByCard(this.entityToTakeDamageCard);
            damage = this.entityToDoDamageCard.getComponent(Monster).calculateDamage();
            this.setLable(`${this.entityToDoDamageCard.name} Is Going To Hurt ${this.entityToTakeDamageCard.name} For ${damage} DMG `, true);
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN, [damage, this.numberRolled, this.entityToDoDamageCard], null, player.node, this.entityId);
            const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta);
            if (!afterPassiveMeta.continue) { return; }
            passiveMeta.args = afterPassiveMeta.args;
            damage = afterPassiveMeta.args[0];
            this.numberRolled = afterPassiveMeta.args[1];
            this.visualRepesentation.changeDamage(damage);
            StackEffectVisManager.$.updatePreviewByStackId(this.entityId, `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`)
            //this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`;
            this.setLable(`${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`, true);
            const isPlayerTookDamage = await player.takeDamage(damage, true, this.entityToDoDamageCard);
            if (isPlayerTookDamage) {
                passiveMeta.result = null;
                // do passive effects after!
                const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta);
            }

        } else {

            player = PlayerManager.getPlayerByCard(this.entityToDoDamageCard);
            damage = player.calculateDamage()

            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN, [damage, this.numberRolled, this.entityToDoDamageCard, this.entityToTakeDamageCard], null, player.node, this.entityId);
            const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta);
            if (!afterPassiveMeta.continue) { return; }
            passiveMeta.args = afterPassiveMeta.args;
            damage = afterPassiveMeta.args[0];

            const monster = this.entityToTakeDamageCard.getComponent(Monster);
            this.setLable(`${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name} `, true);
            StackEffectVisManager.$.updatePreviewByStackId(this.entityId, `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`)
            //this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`;
            if (damage > 0) {
                monster._lastHitRoll = this.numberRolled
            }
            await monster.takeDamaged(damage, true, this.entityToDoDamageCard,this.numberRolled);
            // add death check! 

            const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta);

        }
        if (player._isFirstAttackRollOfTurn) { player._isFirstAttackRollOfTurn = false; }
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
