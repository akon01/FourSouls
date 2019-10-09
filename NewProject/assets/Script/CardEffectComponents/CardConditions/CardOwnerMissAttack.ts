import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerMissAttack extends Condition {

  event = PASSIVE_EVENTS.PLAYER_MISS_ATTACK

  @property
  isSpecificRoll: boolean = false;

  @property({
    visible: function (this: CardOwnerMissAttack) {
      if (this.isSpecificRoll) return true;
    }
    , type: cc.Integer
  })
  specificNumber: number = 1;

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name
      //   &&     meta.passiveEvent == PASSIVE_EVENTS.PLAYER_MISS_ATTACK
    ) {
      if (this.isSpecificRoll) {
        if (this.specificNumber == meta.args[0]) {
          return true
        } else return false
      } else return true;
    } else {
      return false;
    }
  }
}
