import { _decorator, SpriteFrame } from 'cc';
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { StackEffectVisManager } from "../../Managers/StackEffectVisManager";
import { BaseStackEffectVisualRepresentation, StackEffectVisualRepresentation } from "./StackVisInterface";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';

export class MonsterDeathVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.monsterDeathSprite!;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_DEATH;
    flavorText: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.happeningBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC
    constructor(monster: Monster) {
        super()
        this.flavorText = `${monster.name} Death`
        switch (monster.node.getComponent(Card)!.souls) {
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
