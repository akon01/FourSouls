import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import Player from "../../Entites/GameEntities/Player";

export class StartTurnVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame = StackEffectVisManager.$.startTurnLootSprite;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.START_TURN_LOOT;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.lootBaseSprite;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.PLAYER_ACTION


    constructor(player: Player) {
        this.flavorText = `player ${player.playerId} start turn loot`
    }

}