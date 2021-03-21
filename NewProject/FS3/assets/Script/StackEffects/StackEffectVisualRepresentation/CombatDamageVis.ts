import { Node, SpriteFrame } from 'cc';
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { BaseStackEffectVisualRepresentation } from "./StackVisInterface";

export class CombatDamageVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.COMBAT_DAMAGE;
    flavorText: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.monsterBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC
    constructor(dmgDealer: Node, dmgReciver: Node, damageNumber: number, flavorText: string) {
        super()
        if (damageNumber == 0) {
            this.extraSprite = WrapperProvider.stackEffectVisManagerWrapper.out.combatDamageToBe!
        } else this.extraSprite = WrapperProvider.stackEffectVisManagerWrapper.out.combatDamageNumbers[damageNumber - 1]
        this.flavorText = flavorText
        let player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(dmgReciver)
        if (player) {
            this.visType = STACK_EFFECT_VIS_TYPE.PLAYER_ACTION
            this.baseSprite = WrapperProvider.stackEffectVisManagerWrapper.out.happeningBaseSprite!;
        } else {
            switch (dmgReciver.getComponent(Card)!.souls) {
                case 0:
                    this.visType = STACK_EFFECT_VIS_TYPE.MONSTER_ACTION
                    this.baseSprite = WrapperProvider.stackEffectVisManagerWrapper.out.monsterBaseSprite!;
                    break;
                case 1:
                    this.visType = STACK_EFFECT_VIS_TYPE.BOSS_ACTION
                    this.baseSprite = WrapperProvider.stackEffectVisManagerWrapper.out.bossFrame!;
                    break;
                case 2:
                    this.visType = STACK_EFFECT_VIS_TYPE.MEGA_BOSS_ACTION
                    this.baseSprite = WrapperProvider.stackEffectVisManagerWrapper.out.megaBossFrame!;
                    break
                default:
                    break;
            }
        }
    }
    changeDamage(damage: number) {
        this.extraSprite = WrapperProvider.stackEffectVisManagerWrapper.out.combatDamageNumbers[damage - 1]
    }
}

