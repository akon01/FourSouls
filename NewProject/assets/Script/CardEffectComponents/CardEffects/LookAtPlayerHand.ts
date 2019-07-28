import { TARGETTYPE } from "../../Constants";

import CardManager from "../../Managers/CardManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, COLORS } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Deck from "../../Entites/GameEntities/Deck";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtPlayerHand extends Effect {
  chooseType = CHOOSE_TYPE.PLAYERS;

  effectName = "LookAtPlayerHand";

  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {

    cc.log(data)
    let player: Player = PlayerManager.getPlayerByCard(data.getTarget(TARGETTYPE.PLAYER))

    let cardsToSee: cc.Node[] = player.handCards
    cc.log(cardsToSee.map(card => card.name))
    CardPreviewManager.getPreviews(cardsToSee)

    return serverEffectStack
  }
}
