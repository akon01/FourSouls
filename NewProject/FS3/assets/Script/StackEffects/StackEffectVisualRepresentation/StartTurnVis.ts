import { _decorator, SpriteFrame } from 'cc';
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { StackEffectVisManager } from "../../Managers/StackEffectVisManager";
import { BaseStackEffectVisualRepresentation, StackEffectVisualRepresentation } from "./StackVisInterface";
import { Player } from "../../Entites/GameEntities/Player";
import { WrapperProvider } from '../../Managers/WrapperProvider';

export class StartTurnVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.startTurnLootSprite!;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.START_TURN_LOOT;
    flavorText: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.lootBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.PLAYER_ACTION
    constructor(player: Player) {
        super()
        this.flavorText = `player ${player.playerId} start turn loot`
    }
}
