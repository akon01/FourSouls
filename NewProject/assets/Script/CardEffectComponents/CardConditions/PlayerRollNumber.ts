import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerRollNumber extends Condition {


  @property
  numberRoll: number = 1;

  // cardChosenId: number;
  // playerId: number;
  conditionData = null;

  async testCondition(meta: any) {

    let player: Player = meta.scope;
    let thisCard = this.node.parent.parent;

    let c = await meta.result

    //  let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (
      player instanceof Player &&
      meta.key == "rollDice" &&
      this.numberRoll == c
    ) {
      return true;
    } else {
      return false;
    }
  }
}
