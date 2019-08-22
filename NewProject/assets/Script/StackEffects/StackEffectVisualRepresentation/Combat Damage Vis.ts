import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import { STACK_EFFECT_TYPE } from "../../Constants";
import Stack from "../../Entites/Stack";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";

export class CombatDamageVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.COMBAT_DAMAGE;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.monsterBaseSprite;
    hasBeenUpdated: boolean = false;


    constructor(damageNumber: number, flavorText: string) {

        if (damageNumber == 0) {
            this.extraSprite = StackEffectVisManager.$.combatDamageToBe
        } else this.extraSprite = StackEffectVisManager.$.combatDamageNumbers[damageNumber - 1]
        this.flavorText = flavorText
    }

    changeDamage(damage: number) {
        this.extraSprite = StackEffectVisManager.$.combatDamageNumbers[damage - 1]
    }

}