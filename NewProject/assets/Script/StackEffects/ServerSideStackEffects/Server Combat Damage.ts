import ServerStackEffectInterface from "./ServerStackEffectInterface";
import CombatDamage from "../Combat Damage";
import Card from "../../Entites/GameEntities/Card";
import PlayerManager from "../../Managers/PlayerManager";
import CardManager from "../../Managers/CardManager";
import { STACK_EFFECT_TYPE } from "../../Constants";



export default class ServerCombatDamage implements ServerStackEffectInterface {
    stackEffectType: STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
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
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.entityToDoDamageCardId = stackEffect.entityToDoDamageCard.getComponent(Card)._cardId
        this.entityToTakeDamageCardId = stackEffect.entityToTakeDamageCard.getComponent(Card)._cardId
        this.isMonsterDoDamage = stackEffect.isMonsterDoDamage
        this.isPlayerTakeDamage = stackEffect.isPlayerTakeDamage
        this.isMonsterTakeDamage = stackEffect.isMonsterTakeDamage
        this.isPlayerDoDamage = stackEffect.isPlayerDoDamage
        this.stackEffectType = stackEffect.stackEffectType;
        this.numberRolled = stackEffect.numberRolled
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let entityToDoDamage: cc.Node;
        if (this.isPlayerDoDamage) {
            entityToDoDamage = PlayerManager.getPlayerByCardId(this.entityToDoDamageCardId).node
        } else {
            entityToDoDamage = CardManager.getCardById(this.entityToDoDamageCardId)
        }
        let entityToTakeDamage: cc.Node;
        if (this.isPlayerTakeDamage) {
            entityToTakeDamage = PlayerManager.getPlayerByCardId(this.entityToTakeDamageCardId).node
        } else {
            entityToTakeDamage = CardManager.getCardById(this.entityToTakeDamageCardId)
        }
        let combatDamage = new CombatDamage(this.creatorCardId, entityToTakeDamage, entityToDoDamage, this.numberRolled, this.entityId, this.lable)

        return combatDamage;
    }


    toString() {
        let endString = `id:${this.entityId}\ntype: Combat Damage\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.entityToDoDamageCardId) endString = endString + `Attacking Card:${CardManager.getCardById(this.entityToDoDamageCardId).name}\n`
        if (this.entityToTakeDamageCardId) endString = endString + `Taking Damage Card:${CardManager.getCardById(this.entityToTakeDamageCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
