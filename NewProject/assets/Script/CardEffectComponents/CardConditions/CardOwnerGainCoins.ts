import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerGainCoin extends Condition {
  testCondition(meta: any) {
    let player: Player = meta.scope;
    let thisCard = this.node.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player.playerId == PlayerManager.mePlayer.getComponent(Player).playerId &&
      meta.key == "changeMoney" &&
      meta.args[0] > 0
    ) {
      return true;
    } else {
      return false;
    }
  }
}
