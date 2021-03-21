import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "./CardEffectComponents/CardEffects/Effect";

@ccclass('EffectAndOptionalChoice')
export class EffectAndOptionalChoice {
    @property(Effect)
    effect: Effect | null = null;
    //@ts-ignore
    @property({ visible: function (this: EffectsAndOptionalChoice) { if (this.effect) return true } })
    optional: boolean = false;
}

