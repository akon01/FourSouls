import { _decorator, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "./CardEffectComponents/CardEffects/Effect";
import { IdAndNameComponent as IdAndName } from "./CardEffectComponents/IdAndNameComponent";

@ccclass('EffectsAndNumbers')
export class EffectsAndNumbers {
    @property({ type: [CCInteger], min: 0, max: 7 })
    numbers: number[] = [];

    @property(Effect)
    effect: Effect | null = null
    @property(CCInteger)
    effectIdFinal: number = -1
}
