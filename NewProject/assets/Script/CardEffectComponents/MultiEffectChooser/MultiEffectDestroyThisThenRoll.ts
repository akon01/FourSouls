import { ITEM_TYPE, CARD_TYPE } from "../../Constants";
import EffectsAndNumbers from "../../EffectsAndNumbers";
import CardEffect from "../../Entites/CardEffect";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import DataCollector from "../DataCollector/DataCollector";
import PileManager from "../../Managers/PileManager";
import Card from "../../Entites/GameEntities/Card";




const { ccclass, property } = cc._decorator;



@ccclass
export default class MultiEffectDestroyThisThenRoll extends DataCollector {
  collectorName = "MultiEffectDestroyThisThenRoll";


  @property({ type: cc.Enum(ITEM_TYPE) })
  effectsType: ITEM_TYPE = ITEM_TYPE.ACTIVE;

  @property({ type: [EffectsAndNumbers], multiline: true })
  effectsAndNumbers: EffectsAndNumbers[] = [];



  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: cc.Node;
    cardPlayerId: number;
  }): Promise<Effect> {

    let thisCard = this.node.parent;
    let thisOwner = PlayerManager.getPlayerByCard(thisCard)
    await thisOwner.loseItem(thisCard)
    await PileManager.addCardToPile(thisCard.getComponent(Card).type, thisCard, true)



    return null
  }



  getEffectByNumberRolled(numberRolled: number, cardPlayed: cc.Node) {
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
      throw `No effect was chosen!`
    }
    cc.log(chosenEffect.name)
    return chosenEffect;

  }
}
