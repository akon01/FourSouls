import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerPayPenalties extends Condition {

  event = PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES

  conditionData: ActiveEffectData | PassiveEffectData = null;

  @property({ type: DataCollector, tooltip: 'If In "Add Passive Effect" No Need' })
  dataCollector: DataCollector = null

  async testCondition(meta: PassiveMeta) {

    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node);
    //   let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;


    const selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)
    if (selectedPlayerCard == null) {
      throw new Error("no selected player")
    } else {
      if (selectedPlayerCard instanceof cc.Node) {
        const selectedPlayer = PlayerManager.getPlayerByCard(selectedPlayerCard)
        if (
          player instanceof Player &&
          player.playerId == selectedPlayer.playerId
          //&&
          // meta.passiveEvent == PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES
        ) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
}
