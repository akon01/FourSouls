import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import Player from "../../Entites/GameEntities/Player";

export class DeclareAttackVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame = StackEffectVisManager.$.combatDamageToBe;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.DECLARE_ATTACK;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.happeningBaseSprite;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.PLAYER_ACTION


    constructor(attackingPlayer: Player, monsterBeingAttacked: cc.Node, monsterToAttack: cc.SpriteFrame) {

    }

}