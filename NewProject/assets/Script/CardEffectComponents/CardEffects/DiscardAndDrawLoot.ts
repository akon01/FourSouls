import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardAndDrawLoot extends Effect {
  chooseType = CHOOSE_TYPE.MYHAND;

  effectName = "DiscardAndDrawLoot";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {

    let cardChosen = data.getTarget(TARGETTYPE.CARD)

    let player = PlayerManager.getPlayerByCard(cardChosen)
    // player.getComponent(Player).playLootCard(cardPlayed, true);
    await player.discardLoot(cardChosen, true);
    await player.drawCard(CardManager.lootDeck, true);
    return serverEffectStack
  }
}
