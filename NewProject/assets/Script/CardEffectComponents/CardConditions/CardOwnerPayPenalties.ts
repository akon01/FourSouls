import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import { PassiveMeta } from "../../Managers/PassiveManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerPayPenalties extends Condition {
  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      meta.methodName == "payPenalties"
    ) {
      return true;
    } else {
      return false;
    }
  }
}
