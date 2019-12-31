import { CHOOSE_CARD_TYPE, ITEM_TYPE } from "../../Constants";
import EffectsAndNumbers from "../../EffectsAndNumbers";
import CardEffect from "../../Entites/CardEffect";
import Effect from "../CardEffects/Effect";
import ChooseCard from "../DataCollector/ChooseCard";
import DataCollector from "../DataCollector/DataCollector";
import MultiEffectRoll from "./MultiEffectRoll";
import { IMultiEffectRollAndCollect } from "./IMultiEffectRollAndCollect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiEffectChooseThenRoll extends IMultiEffectRollAndCollect {
  collectorName = "MultiEffectChooseThenRoll";

  cardChosen: cc.Node;

  @property({ type: cc.Enum(ITEM_TYPE) })
  effectsType: ITEM_TYPE = ITEM_TYPE.ACTIVE;

  @property({ type: [EffectsAndNumbers], multiline: true })
  effectsAndNumbers: EffectsAndNumbers[] = [];

  @property
  multiType: boolean = false;

  @property({
    type: cc.Enum(CHOOSE_CARD_TYPE), visible: function (this: MultiEffectChooseThenRoll) {
      if (!this.multiType) { return true }
    }
  })
  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;

  @property({
    type: [cc.Enum(CHOOSE_CARD_TYPE)], visible: function (this: MultiEffectChooseThenRoll) {
      if (this.multiType) { return true }
    }
  })
  chooseTypes: CHOOSE_CARD_TYPE[] = []

  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: cc.Node;
    cardPlayerId: number;
  }): Promise<Effect> {

    const chooseCard = new ChooseCard()
    if (this.multiType) {
      chooseCard.multiType = true
      chooseCard.chooseTypes = this.chooseTypes
    } else {
      chooseCard.chooseType = this.chooseType;
    }

    const chooseData = await chooseCard.collectData({ cardPlayerId: data.cardPlayerId })
    this.cardChosen = chooseData.effectTargetCard

    // let card = data.cardPlayed;
    //  let activatingPlayer = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(Player)

    //   let cardEffectComp = card.getComponent(CardEffect);
    //  let effects: cc.Node[] = [];
    //   effects = effects.concat(cardEffectComp.activeEffects, cardEffectComp.paidEffects, cardEffectComp.passiveEffects)
    //   let chosenEffect: Effect = null;
    // for (let i = 0; i < this.effectsAndNumbers.length; i++) {
    //   const eAn = this.effectsAndNumbers[i];
    //   let index = eAn.numbers.find((number) => { if (number == numberRolled) return true })
    //   if (index != null) {
    //     chosenEffect = eAn.effect

    //     break;
    //   }

    // }
    // cc.log(chosenEffect.name)
    //   return chosenEffect;
    return null
  }

  getEffectByNumberRolled(numberRolled: number, cardPlayed: cc.Node) {
    const cardEffectComp = cardPlayed.getComponent(CardEffect);
    let effects: cc.Node[] = [];
    effects = effects.concat(cardEffectComp.activeEffects, cardEffectComp.paidEffects, cardEffectComp.passiveEffects)
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
