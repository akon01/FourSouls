import { StackEffectVisualRepresentation } from "./Stack Vis Interface";
import { STACK_EFFECT_TYPE } from "../../Constants";
import Stack from "../../Entites/Stack";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import Player from "../../Entites/GameEntities/Player";

export class PlayerDeathPenaltiesVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAYER_DEATH_PENALTY;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.happeningBaseSprite;
    hasBeenUpdated: boolean = false;


    constructor(playerToDie: Player) {
        this.flavorText = `player ${playerToDie.playerId} is going to pay death penalties`
    }



}