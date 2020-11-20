import { ITEM_TYPE } from "../../Constants";
import EffectsAndNumbers from "../../EffectsAndNumbers";
import CardEffect from "../../Entites/CardEffect";
import { createNewEffect } from "../../reset";
import Effect from "../CardEffects/Effect";




const { ccclass, property } = cc._decorator;



@ccclass("MultiEffectRollEffect")
export default class MultiEffectRollEffect extends Effect {
  effectName = "MultiEffectRoll";

  @property({ type: cc.Enum(ITEM_TYPE) })
  effectsType: ITEM_TYPE = ITEM_TYPE.PASSIVE;

  @property({ type: [EffectsAndNumbers], multiline: true })
  effectsAndNumbers: EffectsAndNumbers[] = [];

  setWithOld(data: MultiEffectRollEffect) {
    const oldEffectsAndNumbers = data.effectsAndNumbers;
    oldEffectsAndNumbers.forEach(effect => {
      if (effect.effect.hasBeenHandled) {
        effect.effectId.id = effect.effect.EffectId
        effect.effectId.name = effect.effect.effectName
      } else {
        const newId = createNewEffect(effect.effect, this.node, true)
        effect.effectId.id = newId
        effect.effectId.name = effect.effect.effectName
      }
      effect.effect = null
    });
  }


  getEffectByNumberRolled(numberRolled: number, cardPlayed: cc.Node) {

    cc.log(`get by number rolled ${numberRolled}`)
    let cardEffectComp = cardPlayed.getComponent(CardEffect);
    let effects: Effect[] = [];
    effects = effects.concat(cardEffectComp.getActiveEffects(), cardEffectComp.getPaidEffects(), cardEffectComp.getPassiveEffects())
    let chosenEffect: Effect = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      let index = eAn.numbers.find((number) => { if (number == numberRolled) return true })
      if (index != null) {
        chosenEffect = eAn.effect

        break;
      }

    }
    if (!chosenEffect) {
      throw new Error(`No effect was chosen!`)
    }
    cc.log(chosenEffect.name)
    return chosenEffect;

  }
  onLoad() {
    const cardEffectComp = this.node.getComponent(CardEffect)
    this.effectsAndNumbers.forEach(ean => ean.effect = cardEffectComp.getEffect(ean.effectId.id))
  }
}
