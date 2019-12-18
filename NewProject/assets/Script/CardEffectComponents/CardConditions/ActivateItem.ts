import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActivateItemCondition extends Condition {

  event = PASSIVE_EVENTS.PLAYER_ACTIVATE_ITEM

  @property
  isOwnerOnly: boolean = true;

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = this.node.parent.parent;
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    let answer = false;
    if (
      player instanceof Player &&
      player.playerId == PlayerManager.mePlayer.getComponent(Player).playerId
      // &&
      //meta.passiveEvent == PASSIVE_EVENTS.PLAYER_ACTIVATE_ITEM
    ) {
      if (this.isOwnerOnly) {
        if (player.name == cardOwner.name) { answer = true }
      } else {
        answer = true;
      }
      return true;
    }
    return answer
  }
}
