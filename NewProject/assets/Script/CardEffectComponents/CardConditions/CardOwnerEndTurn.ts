import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EndTurn extends Condition {

  event = PASSIVE_EVENTS.PLAYER_END_TURN

  @property
  isCardOwnerOnly: boolean = true;

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    let answer = false;
    if (
      player instanceof Player &&
      player.playerId == PlayerManager.mePlayer.getComponent(Player).playerId

    ) answer = true
    if (this.isCardOwnerOnly) {
      if (player.name == cardOwner.name) {
        answer = true
      } else {
        answer = false;
      }

    }
    return answer
  }
}