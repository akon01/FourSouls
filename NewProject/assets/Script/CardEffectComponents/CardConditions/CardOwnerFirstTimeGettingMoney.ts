import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import { PASSIVE_EVENTS } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerFirstTimeGettingMoney extends Condition {


  event = PASSIVE_EVENTS.PLAYER_CHANGE_MONEY

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player._isFirstTimeGettingMoney
    ) {
      return true;
    } else {
      return false;
    }
  }
}
