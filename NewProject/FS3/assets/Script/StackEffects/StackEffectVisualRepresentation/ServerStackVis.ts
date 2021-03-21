import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { STACK_EFFECT_TYPE } from "../../Constants";
import { StackEffectVisualRepresentation } from "./StackVisInterface";

export class ServerStackVisualisation {

    stackEffectType: STACK_EFFECT_TYPE;
    flavorText: string
    baseSpriteUrl!: string
    extraSpriteUrl!: string
    hasBeenUpdated: boolean

    constructor(stackEffectVis: StackEffectVisualRepresentation) {
        this.stackEffectType = stackEffectVis.stackEffectType;
        this.flavorText = stackEffectVis.flavorText

        this.hasBeenUpdated = stackEffectVis.hasBeenUpdated;
    }

}