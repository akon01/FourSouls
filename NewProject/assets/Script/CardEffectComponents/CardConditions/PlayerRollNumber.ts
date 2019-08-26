import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE, PASSIVE_EVENTS } from "../../Constants";
import { PassiveMeta } from "../../Managers/PassiveManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerRollNumber extends Condition {


  @property
  numberRoll: number = 1;

  // cardChosenId: number;
  // playerId: number;
  conditionData = null;

  async testCondition(meta: PassiveMeta) {

    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;

    let c = await meta.result

    //  let playerName = PlayerManager.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (
      player instanceof Player &&
      meta.passiveEvent == PASSIVE_EVENTS.PLAYER_ROLL_DICE &&
      this.numberRoll == c
    ) {
      return true;
    } else {
      return false;
    }
  }
}
