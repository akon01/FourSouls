import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import IdAndName from "../IdAndNameComponent";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerPayPenalties extends Condition {

  event = PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES

  conditionData: ActiveEffectData | PassiveEffectData = null;

  @property(cc.Boolean)
  isSpecificPlayer: boolean = true

  @property({
    type: DataCollector, visible: function (this: PlayerPayPenalties) {
      return this.isSpecificPlayer
    }
  })
  dataCollector: DataCollector = null

  @property({
    type: IdAndName, visible: function (this: PlayerPayPenalties) {
      return this.isSpecificPlayer
    }
  })
  dataCollectorId: IdAndName = null

  @property({
    type: cc.Integer, visible: function (this: PlayerPayPenalties) {
      return this.isSpecificPlayer
    }
  })
  dataCollectorIdFinal: number = null

  async testCondition(meta: PassiveMeta) {

    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node);
    //   let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;
    let answer = true
    if (this.isSpecificPlayer) {
      const selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)
      if (selectedPlayerCard == null) {
        throw new Error("no selected player")
      } else {
        if (selectedPlayerCard instanceof cc.Node) {
          const selectedPlayer = PlayerManager.getPlayerByCard(selectedPlayerCard)
          if (!(player instanceof Player) || player.playerId != selectedPlayer.playerId) {
            answer = false
          }
        }
      }
    } else {
      if (!(player instanceof Player)) {
        answer = false
      }
    }
    return answer
  }
}
