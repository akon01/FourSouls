import Effect from "./CardEffectComponents/CardEffects/Effect";
import IdAndName from "./CardEffectComponents/IdAndNameComponent";


const { ccclass, property } = cc._decorator;

@ccclass('EffectsAndNumbers')
export default class EffectsAndNumbers {

    @property({ type: [cc.Integer], min: 0, max: 7 })
    numbers: number[] = [];

    @property(Effect)
    effect: Effect = null;

    @property(IdAndName)
    effectId: IdAndName = new IdAndName()

    @property(cc.Integer)
    effectIdFinal: number = -1

}
