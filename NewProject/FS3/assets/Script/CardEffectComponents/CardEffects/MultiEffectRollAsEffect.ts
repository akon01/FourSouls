import { Enum, log, Node, _decorator } from 'cc';
import { ITEM_TYPE } from "../../Constants";
import { EffectsAndNumbers } from "../../EffectsAndNumbers";
import { CardEffect } from "../../Entites/CardEffect";
import { Effect } from '../CardEffects/Effect';
import { DealDamage } from './DealDamage';
const { ccclass, property } = _decorator;


@ccclass('MultiEffectRollAsEffect')
export class MultiEffectRollAsEffect extends Effect {
      effectName = "MultiEffectRoll";

      @property({ type: Enum(ITEM_TYPE) })
      effectsType: ITEM_TYPE = ITEM_TYPE.PASSIVE;

      @property({ type: [EffectsAndNumbers], multiline: true })
      effectsAndNumbers: EffectsAndNumbers[] = [];

      getEffectByNumberRolled(numberRolled: number, cardPlayed: Node) {

            console.log(`get by number rolled ${numberRolled}`)
            const cardEffectComp = cardPlayed.getComponent(CardEffect)!;
            let effects: Effect[] = [];
            effects = effects.concat(cardEffectComp.getActiveEffects(), cardEffectComp.getPaidEffects(), cardEffectComp.getPassiveEffects())
            let chosenEffect: Effect | null = null;
            for (let i = 0; i < this.effectsAndNumbers.length; i++) {
                  const eAn = this.effectsAndNumbers[i];
                  const index = eAn.numbers.find((number) => { if (number == numberRolled) return true })
                  if (index != null) {
                        chosenEffect = eAn.effect

                        break;
                  }

            }
            if (!chosenEffect) {
                  throw new Error(`No effect was chosen!`)
            }
            console.log(chosenEffect.name)
            return chosenEffect;

      }
      onLoad() {
            const cardEffectComp = this.node.getComponent(CardEffect)!
            this.effectsAndNumbers.forEach(ean => ean.effect = cardEffectComp.getEffect(ean.effectIdFinal))
      }
}
