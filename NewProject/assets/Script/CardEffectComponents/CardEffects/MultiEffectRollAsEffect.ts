import { ITEM_TYPE } from "../../Constants";
import EffectsAndNumbers from "../../EffectsAndNumbers";
import CardEffect from "../../Entites/CardEffect";
import Effect from "../CardEffects/Effect";




const { ccclass, property } = cc._decorator;



@ccclass("MultiEffectRollEffect")
export default class MultiEffectRollEffect extends Effect {
  effectName = "MultiEffectRoll";

  @property({ type: cc.Enum(ITEM_TYPE) })
  effectsType: ITEM_TYPE = ITEM_TYPE.PASSIVE;

  @property({ type: [EffectsAndNumbers], multiline: true })
  effectsAndNumbers: EffectsAndNumbers[] = [];




  getEffectByNumberRolled(numberRolled: number, cardPlayed: cc.Node) {

    cc.log(`get by number rolled ${numberRolled}`)
    let cardEffectComp = cardPlayed.getComponent(CardEffect);
    let effects: cc.Node[] = [];
    effects = effects.concat(cardEffectComp.activeEffects, cardEffectComp.paidEffects, cardEffectComp.passiveEffects)
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
}
