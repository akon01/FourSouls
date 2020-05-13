import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PreventDamage extends Condition {

  event = PASSIVE_EVENTS.PLAYER_PREVENT_DAMAGE

  @property
  isOwnerOnly: boolean = false;

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    let answer = false
    if (
      player instanceof Player &&
      player.name == cardOwner.name
    ) {
      answer = true;
      if (this.isOwnerOnly) {
        if (player.playerId == cardOwner.playerId) {
          answer = true
        } else {
          answer = false
        }
      }
    }
    return answer
  }
}
