import { STACK_EFFECT_TYPE } from "../../Constants";
import { StackEffectVisualRepresentation } from "./Stack Vis Interface";


const { ccclass, property } = cc._decorator;

export class ServerStackVisualisation {

    stackEffectType: STACK_EFFECT_TYPE;
    flavorText: string
    baseSpriteUrl: string
    extraSpriteUrl: string
    hasBeenUpdated: boolean

    constructor(stackEffectVis: StackEffectVisualRepresentation) {
        this.stackEffectType = stackEffectVis.stackEffectType;
        this.flavorText = stackEffectVis.flavorText

        this.hasBeenUpdated = stackEffectVis.hasBeenUpdated;
    }

}