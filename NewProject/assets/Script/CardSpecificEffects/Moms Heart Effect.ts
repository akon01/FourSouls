import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { GAME_EVENTS, TARGETTYPE } from "../Constants";
import { PassiveEffectData, ActiveEffectData } from "../Managers/DataInterpreter";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import CardManager from "../Managers/CardManager";
import Monster from "../Entites/CardTypes/Monster";
import Item from "../Entites/CardTypes/Item";
import Store from "../Entites/GameEntities/Store";
import PileManager from "../Managers/PileManager";
import Card from "../Entites/GameEntities/Card";
import { whevent } from "../../ServerClient/whevent";
import Player from "../Entites/GameEntities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MomsHeartEffect extends Effect {
  effectName = "MomsHeartEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {
    const winner = PlayerManager.getPlayerByCard((data.getTarget(TARGETTYPE.PLAYER) as cc.Node))
    whevent.emit(GAME_EVENTS.GAME_OVER, winner.playerId)

    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }



}
