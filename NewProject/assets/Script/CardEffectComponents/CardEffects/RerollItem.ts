import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import Deck from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RerollItem extends Effect {
  chooseType = CHOOSE_TYPE.MYHAND;

  effectName = "RerollItem";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {
    let cardChosen = data.getTarget(TARGETTYPE.ITEM)
    let player = PlayerManager.getPlayerByCard(cardChosen)
    // player.getComponent(Player).playLootCard(cardPlayed, true);
    await player.destroyItem(cardChosen, true);
    let treasureTopDeck = CardManager.treasureDeck.getComponent(Deck).topBlankCard;
    await player.addItem(treasureTopDeck, true, true);
    return serverEffectStack
  }
}
