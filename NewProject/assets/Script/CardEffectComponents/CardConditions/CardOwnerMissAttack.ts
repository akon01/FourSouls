import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import { PASSIVE_EVENTS } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerMissAttack extends Condition {
  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    cc.log(player)
    cc.log(cardOwner)
    cc.log(thisCard)
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      meta.passiveEvent == PASSIVE_EVENTS.PLAYER_MISS_ATTACK
    ) {
      return true;
    } else {
      return false;
    }
  }
}
