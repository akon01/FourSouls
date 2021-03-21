import { SpriteFrame } from 'cc';
import { STACK_EFFECT_TYPE, STACK_EFFECT_VIS_TYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { BaseStackEffectVisualRepresentation } from "./StackVisInterface";

export class DiceRollVis extends BaseStackEffectVisualRepresentation {
    extraSprite: SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ROLL_DICE;
    flavorText: string;
    baseSprite: SpriteFrame = WrapperProvider.stackEffectVisManagerWrapper.out.diceRollBaseSprite!;
    hasBeenUpdated: boolean = false;
    visType: STACK_EFFECT_VIS_TYPE = STACK_EFFECT_VIS_TYPE.BASIC
    playerWhoRolled: Player
    constructor(playerWhoRolled: Player, diceSprite: SpriteFrame, flavorText: string) {
        super()
        this.extraSprite = diceSprite
        this.flavorText = flavorText
        this.playerWhoRolled = playerWhoRolled
    }
}
