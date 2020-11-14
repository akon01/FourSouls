import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerEndTurn extends Condition {

  event = PASSIVE_EVENTS.PLAYER_END_TURN

  @property
  isCardOwnerOnly: boolean = true;

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    cc.error(`test card owner end turn`)
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    let answer = false;
    if (
      player instanceof Player &&
      player.playerId == PlayerManager.mePlayer.getComponent(Player).playerId

    ) { answer = true }
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
