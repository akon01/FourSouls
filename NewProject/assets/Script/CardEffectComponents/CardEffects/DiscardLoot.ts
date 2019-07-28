import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardPlayer from "../DataCollector/CardPlayer";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData } from "../../Managers/NewScript";
import { TARGETTYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardLoot extends Effect {
  effectName = "DiscardLoot";



  @property(Number)
  numOfLoot: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?: ActiveEffectData) {




    // let targetPlayer: cc.Node = data.getTargets(TARGETTYPE.PLAYER)[0].effectTargetCard;
    let targetLoots: cc.Node[] = data.getTargets(TARGETTYPE.CARD)
    let player: Player
    for (let i = 0; i < targetLoots.length; i++) {
      const lootToDiscard = targetLoots[i];
      player = PlayerManager.getPlayerByCard(lootToDiscard)
      await player.discardLoot(lootToDiscard, true)
    }

    return serverEffectStack
  }
}
