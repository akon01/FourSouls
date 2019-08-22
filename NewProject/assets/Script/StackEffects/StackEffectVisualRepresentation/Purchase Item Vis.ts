import { STACK_EFFECT_TYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import { StackEffectVisualRepresentation } from "./Stack Vis Interface";

export class PurchaseItemVis implements StackEffectVisualRepresentation {
    extraSprite: cc.SpriteFrame;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PURCHASE_ITEM;
    flavorText: string;
    baseSprite: cc.SpriteFrame = StackEffectVisManager.$.happeningBaseSprite;
    hasBeenUpdated: boolean = false;


    constructor(itemToBuy: cc.Node, playerWhoBuys: Player, cost: number) {
        this.flavorText = `player ${playerWhoBuys.playerId} is going to buy ${itemToBuy.name} for ${-cost} cents`
    }



}