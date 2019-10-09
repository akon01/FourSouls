import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import Deck from "../../Entites/GameEntities/Deck";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RerollItems extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "RerollItems";


  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    let cardsChosen = data.getTargets(TARGETTYPE.ITEM);
    let player;
    let treasureTopDeck = CardManager.treasureDeck.getComponent(Deck).topBlankCard;
    if (cardsChosen.length == 0) {
      cc.log(`no items to reroll`)
    } else {
      for (let i = 0; i < cardsChosen.length; i++) {
        const cardChosen = cardsChosen[i];
        if (cardChosen instanceof cc.Node) {
          PlayerManager.getPlayerByCard(cardChosen).getComponent(
            Player
          );
          await player.destroyItem(cardChosen, true);
          await player.addItem(treasureTopDeck, true, true);
        }
      }
    }

    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
