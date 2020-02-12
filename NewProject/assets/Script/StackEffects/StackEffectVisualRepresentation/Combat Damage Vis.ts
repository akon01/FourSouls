import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import Stack from "../../Entites/Stack";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import PlayerManager from "../../Managers/PlayerManager";
import Monster from "../../Entites/CardTypes/Monster";

export class CombatDamageVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.COMBAT_DAMAGE;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.monsterBaseSprite;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = null


    constructor(dmgDealer: cc.Node, dmgReciver: cc.Node, damageNumber: number, flavorText: string) {

        if (damageNumber == 0) {
            this.extraSprite = StackEffectVisManager.$.combatDamageToBe
        } else this.extraSprite = StackEffectVisManager.$.combatDamageNumbers[damageNumber - 1]
        this.flavorText = flavorText
        let player = PlayerManager.getPlayerByCard(dmgReciver)
        if (player) {
            this.visType = STACK_EFFECT_VIS_TYPE.PLAYER_ACTION
        } else {
            switch (dmgReciver.getComponent(Monster).souls) {
                case 0:
                    this.visType = STACK_EFFECT_VIS_TYPE.MONSTER_ACTION
                    break;
                case 1:
                    this.visType = STACK_EFFECT_VIS_TYPE.BOSS_ACTION
                    break;
                case 2:
                    this.visType = STACK_EFFECT_VIS_TYPE.MEGA_BOSS_ACTION
                    break
                default:
                    break;
            }
        }
    }

    changeDamage(damage: number) {
        this.extraSprite = StackEffectVisManager.$.combatDamageNumbers[damage - 1]
    }

}