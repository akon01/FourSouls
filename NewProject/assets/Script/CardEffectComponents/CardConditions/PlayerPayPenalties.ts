import { PASSIVE_EVENTS, TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerPayPenalties extends Condition {

  event = PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES

  conditionData: ActiveEffectData | PassiveEffectData = null;

  @property({ type: DataCollector, tooltip: 'If In "Add Passive Effect" No Need' })
  dataCollector: DataCollector = null

  async testCondition(meta: PassiveMeta) {

    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    //   let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name; 
    let selectedPlayerCard = this.conditionData.getTarget(TARGETTYPE.PLAYER)
    if (selectedPlayerCard == null) {
      cc.log('no selected player')
    } else {
      if (selectedPlayerCard instanceof cc.Node) {
        let selectedPlayer = PlayerManager.getPlayerByCard(selectedPlayerCard)
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
