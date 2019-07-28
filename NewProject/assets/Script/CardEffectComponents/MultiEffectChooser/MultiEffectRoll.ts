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
    // switch (this.effectsType) {
    //   case ITEM_TYPE.ACTIVE:
    effects = effects.concat(cardEffectComp.activeEffects, cardEffectComp.paidEffects, cardEffectComp.passiveEffects)
    // case ITEM_TYPE.PAID:
    //   effects = cardEffectComp.paidEffects;
    //   break;
    // case ITEM_TYPE.PASSIVE:
    //effects = cardEffectComp.passiveEffects;
    //     break;
    //   default:
    //     break;
    // }



    let chosenEffect: Effect = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      let index = eAn.numbers.find((number) => { if (number == numberRolled) return true })
      if (index != null) {
        chosenEffect = eAn.effect
        // 
        // 
        // for (let j = 0; j < effects.length; j++) {
        //   const effect = effects[j];
        //   
        //   if (effect.getComponent(Effect).name == eAn.effect.name) {

        //     chosenEffect = effect.getComponent(Effect);
        //   }
        // }
        break;
      }

    }
    cc.log(chosenEffect.name)
    return chosenEffect;
  }
}

