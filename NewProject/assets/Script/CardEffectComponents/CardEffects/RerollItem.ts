import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import Deck from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RerollItem extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "RerollItem";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    let cardChosen = data.getTarget(TARGETTYPE.ITEM)
    if (cardChosen == null) {
      cc.log(`no item to reroll`)
    } else {
      if (cardChosen instanceof cc.Node) {
        let player = PlayerManager.getPlayerByCard(cardChosen)
        await player.destroyItem(cardChosen, true);
        let treasureTopDeck = CardManager.treasureDeck.getComponent(Deck).topBlankCard;
        await player.addItem(treasureTopDeck, true, true);
      }
    }
    return stack
  }
}
