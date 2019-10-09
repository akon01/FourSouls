import Effect from "./CardEffectComponents/CardEffects/Effect";


const { ccclass, property } = cc._decorator;

@ccclass('EffectsAndOptionalChoice')
export default class EffectsAndOptionalChoice {
    @property(Effect)
    effect: Effect = null;

    @property({ visible: function (this: EffectsAndOptionalChoice) { if (this.effect) return true } })
    optional: boolean = false;


}
