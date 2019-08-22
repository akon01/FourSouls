import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { PassiveMeta } from "../../Managers/PassiveManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerPayPenalties extends Condition {


  conditionData: ActiveEffectData = null;

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    cc.log(this.conditionData)
    //   let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name; 
    let selectedPlayer = this.conditionData.getTarget(TARGETTYPE.PLAYER)
    if (selectedPlayer == null) {
      cc.log('no selected player')
    } else {
      if (selectedPlayer instanceof cc.Node) {
        if (
          player instanceof Player &&
          player.playerId == selectedPlayer.getComponent(Player).playerId &&
          meta.methodName == "payPenalties"
        ) {
          return true;
        } else {
          return false;
        }
      }
    }
    cc.log(selectedPlayer)

  }
}
