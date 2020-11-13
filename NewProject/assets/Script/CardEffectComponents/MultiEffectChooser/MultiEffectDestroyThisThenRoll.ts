import { ITEM_TYPE } from "../../Constants";
import EffectsAndNumbers from "../../EffectsAndNumbers";
import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import PileManager from "../../Managers/PileManager";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import { IMultiEffectRollAndCollect } from "./IMultiEffectRollAndCollect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiEffectDestroyThisThenRoll extends IMultiEffectRollAndCollect {
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

    const thisCard = Card.getCardNodeByChild(this.node)
    const thisOwner = PlayerManager.getPlayerByCard(thisCard)
    await thisOwner.loseItem(thisCard, true)
    await PileManager.addCardToPile(thisCard.getComponent(Card).type, thisCard, true)

    return null
  }

  getEffectByNumberRolled(numberRolled: number, cardPlayed: cc.Node) {
    const cardEffectComp = cardPlayed.getComponent(CardEffect);
    let chosenEffect: Effect = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      const index = eAn.numbers.find((number) => { if (number == numberRolled) { return true } })
      if (index != null) {
        chosenEffect = eAn.effect

        break;
      }

    }
    if (!chosenEffect) {
      cc.log(this.effectsAndNumbers.map(ean => ean.effect.name + "" + ean.numbers))
      throw new Error(`No effect was chosen with the number rolled ${numberRolled}`)
    }
    cc.log(chosenEffect.name)
    return chosenEffect;

  }
}
