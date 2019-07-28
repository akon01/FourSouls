import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "../../Constants";
import { PassiveMeta } from "../../Managers/PassiveManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerPayPenalties extends Condition {


  conditionData = null;

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (
      player instanceof Player &&
      player.name == playerName &&
      meta.methodName == "payPenalties"
    ) {
      return true;
    } else {
      return false;
    }
  }
}
