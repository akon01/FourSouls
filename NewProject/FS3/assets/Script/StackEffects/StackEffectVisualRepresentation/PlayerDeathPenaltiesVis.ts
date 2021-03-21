import { _decorator, SpriteFrame } from 'cc';
import { BaseStackEffectVisualRepresentation, StackEffectVisualRepresentation } from "./StackVisInterface";
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { Stack } from "../../Entites/Stack";
import { StackEffectVisManager } from "../../Managers/StackEffectVisManager";
import { Player } from "../../Entites/GameEntities/Player";
import { WrapperProvider } from '../../Managers/WrapperProvider';

export class PlayerDeathPenaltiesVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame | undefined;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAYER_DEATH_PENALTY;
    flavorText: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.happeningBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.PLAYER_ACTION
    constructor(playerToDie: Player) {
        super()
        this.flavorText = `player ${playerToDie.playerId} is going to pay death penalties`
    }
}

