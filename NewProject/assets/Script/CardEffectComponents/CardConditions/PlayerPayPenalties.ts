import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerPayPenalties extends Condition {



  // cardChosenId: number;
  // playerId: number;
  conditionData = null;

  testCondition(meta: any) {
    let player: Player = meta.scope;
    let thisCard = this.node.parent.parent;
    let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (
      player instanceof Player &&
      player.name == playerName &&
      meta.key == "payPenalties"
    ) {
      return true;
    } else {
      return false;
    }
  }
}
