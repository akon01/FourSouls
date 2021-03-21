import { SpriteFrame } from 'cc';
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { BaseStackEffectVisualRepresentation } from "./StackVisInterface";

export class PlayerDeathVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame | undefined;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAYER_DEATH;
    flavorText: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.happeningBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.PLAYER_ACTION
    constructor(playerToDie: Player) {
        super()
        this.flavorText = `player ${playerToDie.playerId} is going to die`
    }
}

