import { Node } from 'cc';
import { STACK_EFFECT_TYPE } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { CombatDamage } from "../CombatDamage";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerCombatDamage extends BaseServerStackEffect {
    stackEffectType: STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean = false;
    hasLockingStackEffectResolved: boolean = false;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string


    entityToTakeDamageCardId: number
    entityToDoDamageCardId: number
    isMonsterTakeDamage: boolean
    isPlayerTakeDamage: boolean
    isMonsterDoDamage: boolean
    isPlayerDoDamage: boolean;

    numberRolled: number

    constructor(stackEffect: CombatDamage) {
        super()
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.entityToDoDamageCardId = stackEffect.entityToDoDamageCard.getComponent(Card)!._cardId
        this.entityToTakeDamageCardId = stackEffect.entityToTakeDamageCard.getComponent(Card)!._cardId
        this.isMonsterDoDamage = stackEffect.isMonsterDoDamage
        this.isPlayerTakeDamage = stackEffect.isPlayerTakeDamage
        this.isMonsterTakeDamage = stackEffect.isMonsterTakeDamage
        this.isPlayerDoDamage = stackEffect.isPlayerDoDamage
        this.stackEffectType = stackEffect.stackEffectType;
        this.numberRolled = stackEffect.numberRolled
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let entityToDoDamage: Node | null = null;
        if (this.isPlayerDoDamage) {
            entityToDoDamage = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.entityToDoDamageCardId)!.node
        } else {
            entityToDoDamage = WrapperProvider.cardManagerWrapper.out.getCardById(this.entityToDoDamageCardId)
        }
        let entityToTakeDamage: Node;
        if (this.isPlayerTakeDamage) {
            entityToTakeDamage = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.entityToTakeDamageCardId)!.node
        } else {
            entityToTakeDamage = WrapperProvider.cardManagerWrapper.out.getCardById(this.entityToTakeDamageCardId)
        }
        let combatDamage = new CombatDamage(this.creatorCardId, entityToTakeDamage, entityToDoDamage, this.numberRolled, this.entityId, this.lable)

        return combatDamage;
    }


    toString() {
        let endString = `id:${this.entityId}\ntype: CombatDamage\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.entityToDoDamageCardId) endString = endString + `Attacking Card:${WrapperProvider.cardManagerWrapper.out.getCardById(this.entityToDoDamageCardId).name}\n`
        if (this.entityToTakeDamageCardId) endString = endString + `Taking Damage Card:${WrapperProvider.cardManagerWrapper.out.getCardById(this.entityToTakeDamageCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
