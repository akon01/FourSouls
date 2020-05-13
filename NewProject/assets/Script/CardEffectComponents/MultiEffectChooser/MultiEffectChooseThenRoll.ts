import { ITEM_TYPE } from "../../Constants";
import EffectsAndNumbers from "../../EffectsAndNumbers";
import CardEffect from "../../Entites/CardEffect";
import DecisionMarker from "../../Entites/Decision Marker";
import Card from "../../Entites/GameEntities/Card";
import Effect from "../CardEffects/Effect";
import ChooseCardTypeAndFilter from "../ChooseCardTypeAndFilter";
import ChooseCard from "../DataCollector/ChooseCard";
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
    type: ChooseCardTypeAndFilter, visible: function (this: MultiEffectChooseThenRoll) {
      if (!this.multiType) { return true }
    }
  })
  chooseType: ChooseCardTypeAndFilter = null;

  @property({
    type: [ChooseCardTypeAndFilter], visible: function (this: MultiEffectChooseThenRoll) {
      if (this.multiType) { return true }
    }
  })
  chooseTypes: ChooseCardTypeAndFilter[] = []

  @property
  flavorText: string = ''

  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: cc.Node;
    cardPlayerId: number;
  }): Promise<Effect> {

    const chooseCard = new ChooseCard()
    chooseCard.flavorText = this.flavorText
    if (this.multiType) {
      chooseCard.multiType = true
      chooseCard.chooseTypes = this.chooseTypes
    } else {
      chooseCard.chooseType = this.chooseType;
    }

    const chooseData = await chooseCard.collectData({ cardPlayerId: data.cardPlayerId })
    this.cardChosen = chooseData.effectTargetCard
    await DecisionMarker.$.showDecision(Card.getCardNodeByChild(this.node), this.cardChosen, true)

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
