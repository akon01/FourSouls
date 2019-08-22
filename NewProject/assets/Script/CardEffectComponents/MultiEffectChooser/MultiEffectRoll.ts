import ChooseNumber from "../../Entites/ChooseNumber";

import Effect from "../CardEffects/Effect";
import CardPreview from "../../Entites/CardPreview";

import CardPreviewManager from "../../Managers/CardPreviewManager";

import Card from "../../Entites/GameEntities/Card";
import RollDice from "../RollDice";
import PlayerManager from "../../Managers/PlayerManager";
import Player from "../../Entites/GameEntities/Player";
import CardEffect from "../../Entites/CardEffect";
import { ITEM_TYPE } from "../../Constants";
import EffectsAndNumbers from "../../EffectsAndNumbers";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;



@ccclass
export default class MultiEffectRoll extends DataCollector {
  collectorName = "MultiEffectRoll";

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
    let card = data.cardPlayed;
    let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(Player)
    let diceRoll = new RollDice();
    let numberRolled = await diceRoll.collectData({ cardPlayerId: data.cardPlayerId, cardId: player.dice.diceId });
    let cardEffectComp = card.getComponent(CardEffect);
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
    cc.log(chosenEffect.name)
    return chosenEffect;
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
    cc.log(chosenEffect.name)
    return chosenEffect;

  }
}
