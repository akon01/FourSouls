import { error, Node } from 'cc';
import { PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import { Monster } from "../Entites/CardTypes/Monster";
import { Player } from "../Entites/GameEntities/Player";
import { IAttackableEntity } from '../Entites/IAttackableEntity';
import { PassiveMeta } from "../Managers/PassiveMeta";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { ServerCombatDamage } from "./ServerSideStackEffects/ServerCombatDamage";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { CombatDamageVis } from "./StackEffectVisualRepresentation/CombatDamageVis";

export class CombatDamage extends StackEffectConcrete {
    visualRepesentation: CombatDamageVis;
    name = `CombatDamage`
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.COMBAT_DAMAGE;
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
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        let player: Player | null = null;
        let monster: Monster | null = null;

        if (this.isPlayerDoDamage) {
            player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.entityToDoDamageCard);
            monster = this.entityToTakeDamageCard.getComponent(Monster);
        }
        if (this.isMonsterDoDamage) {
            player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.entityToTakeDamageCard);
            monster = this.entityToDoDamageCard.getComponent(Monster);
        }
        if (player || monster) {
            if (player && (player._isDead || player._Hp == 0) || monster && (monster.currentHp == 0 || monster._isDead || monster != WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity)) {
                this.isToBeFizzled = true;
                return true;
            }
        }
        return false;
    }

    nonOriginal = false;

    entityToTakeDamageCard: Node;
    entityToDoDamageCard: Node;
    isMonsterTakeDamage: boolean;
    isPlayerTakeDamage!: boolean;
    isMonsterDoDamage: boolean;
    isPlayerDoDamage: boolean;

    numberRolled: number;

    constructor(creatorCardId: number, entityToTakeDamageCard: Node, entityToDoDamageCard: Node, numberRolled: number, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)
        this.entityToTakeDamageCard = entityToTakeDamageCard;
        if (this.entityToTakeDamageCard.getComponent(Monster) != null) {
            //    this.isPlayerDoDamage = true;
            //  this.isMonsterDoDamage = false;
            this.isMonsterTakeDamage = true
            this.isPlayerTakeDamage = false
        } else {
            this.isPlayerTakeDamage = true
            this.isMonsterTakeDamage = false
            //  this.isPlayerDoDamage = false;
            //            this.isMonsterDoDamage = true;
        }
        this.entityToDoDamageCard = entityToDoDamageCard;
        if (this.entityToDoDamageCard.getComponent(Monster) != null) {
            // this.isPlayerTakeDamage = true;
            // this.isMonsterTakeDamage = false;
            this.isMonsterDoDamage = true
            this.isPlayerDoDamage = false
        } else {
            this.isMonsterDoDamage = false
            this.isPlayerDoDamage = true
            //  this.isPlayerDoDamage = false;
            //    this.isMonsterTakeDamage = true;
        }
        if (this.isPlayerDoDamage) {
            this.name = `Player CombatDamage To A Monster`
        } else {
            this.name = `Monster CombatDamage To A Player`
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
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!;
        turnPlayer.givePriority(true);
        // add Passive Check for all the +X/-X To dice rolls to add on top of the stack
    }

    async resolve() {
        console.error(`combat dmg resolve`)
        let player: Player | null = null;
        let damage: number;
        const damageDealer: IAttackableEntity | null = this.entityToDoDamageCard.getComponent(Monster) ?? WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.entityToDoDamageCard)?.getComponent(Player) ?? null
        if (!damageDealer) {
            throw new Error("Cant Resolve Combat Damage, No damageDealer Entity Found");

        }
        // if (player._isFirstAttackRollOfTurn) { player._isFirstAttackRollOfTurn = false; }
        if (this.isPlayerTakeDamage) {
            ///TODO: now players can be attacked also, make sure this is ok!! (IAttackableEntity)
            player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.entityToTakeDamageCard);
            if (!player) { debugger; throw new Error("No Player Found!"); }

            damage = damageDealer.calculateDamage();
            this.setLable(`${this.entityToDoDamageCard.name} Is Going To Hurt ${this.entityToTakeDamageCard.name} For ${damage} DMG `, true);
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN, [damage, this.numberRolled, this.entityToDoDamageCard], null, player.node, this.entityId);
            const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta);
            if (!afterPassiveMeta.continue) { return; }
            passiveMeta.args = afterPassiveMeta.args;
            if (!afterPassiveMeta.args) { debugger; throw new Error("No After Passive Args!"); }
            damage = afterPassiveMeta.args[0];
            this.numberRolled = afterPassiveMeta.args[1];
            this.visualRepesentation.changeDamage(damage);
            WrapperProvider.stackEffectVisManagerWrapper.out.updatePreviewByStackId(this.entityId, `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`)
            //this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`;
            this.setLable(`${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`, true);
            const isPlayerTookDamage = await player.takeDamage(damage, true, this.entityToDoDamageCard);
            if (isPlayerTookDamage) {
                passiveMeta.result = null;
                // do passive effects after!
                const thisResult = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta);
            }

        } else {

            //   player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.entityToDoDamageCard);
            // if (!player) { debugger; throw new Error("No Player Found!"); }
            damage = damageDealer.calculateDamage()

            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN, [damage, this.numberRolled, this.entityToDoDamageCard, this.entityToTakeDamageCard], null, damageDealer.node, this.entityId);
            const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta);
            if (!afterPassiveMeta.continue) { return; }
            passiveMeta.args = afterPassiveMeta.args;
            if (!afterPassiveMeta.args) { debugger; throw new Error("No After Passive Args!"); }
            damage = afterPassiveMeta.args[0];

            const monster = this.entityToTakeDamageCard.getComponent(Monster)!;
            this.setLable(`${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name} `, true);
            WrapperProvider.stackEffectVisManagerWrapper.out.updatePreviewByStackId(this.entityId, `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`)
            //this.visualRepesentation.flavorText = `${this.entityToDoDamageCard.name} will deal ${damage} combat damage to ${this.entityToTakeDamageCard.name}`;
            if (damage > 0) {
                monster._lastHitRoll = this.numberRolled
            }
            await monster.takeDamaged(damage, true, this.entityToDoDamageCard, this.numberRolled);
            // add death check! 

            const thisResult = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta);

        }

    }

    convertToServerStackEffect() {
        const serverCombatDamage = new ServerCombatDamage(this);
        return serverCombatDamage;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: CombatDamage\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`;
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n`; }
        if (this.entityToDoDamageCard) { endString = endString + `Attacking Card:${this.entityToDoDamageCard.name}\n`; }
        if (this.numberRolled) { endString = endString + `Number Rolled:${this.numberRolled}\n`; }
        if (this.entityToTakeDamageCard) { endString = endString + `Taking Damage Card:${this.entityToTakeDamageCard.name}\n`; }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`; }
        return endString;
    }

}
