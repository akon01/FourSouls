import { PASSIVE_EVENTS, PLAYER_RESOURCES } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerEndTurnWithAmountOfResource extends Condition {

  event = PASSIVE_EVENTS.PLAYER_END_TURN

  @property
  amount: number = 0

  @property({ type: cc.Enum(PLAYER_RESOURCES) })
  resource: PLAYER_RESOURCES = PLAYER_RESOURCES.MONEY;

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player.playerId == PlayerManager.mePlayer.getComponent(Player).playerId
    ) {
      switch (this.resource) {
        case PLAYER_RESOURCES.LOOT:
          if (cardOwner.getHandCards().length == this.amount) {
            return true
          } else {
            return false
          }
        case PLAYER_RESOURCES.MONEY:
          if (cardOwner.coins == this.amount) {
            return true
          } else {
            return false
          }
        default:
          break;
      }
    } else {
      return false
    }
  }
}
