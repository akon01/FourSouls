import { PASSIVE_EVENTS, PLAYER_RESOURCES } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerEndTurnWithAmountOfResource extends Condition {

  event = PASSIVE_EVENTS.PLAYER_END_TURN

  @property
  amount: number = 0

  @property({ type: cc.Enum(PLAYER_RESOURCES) })
  resource: PLAYER_RESOURCES = PLAYER_RESOURCES.MONEY;

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player.playerId == PlayerManager.mePlayer.getComponent(Player).playerId
    ) {
      switch (this.resource) {
        case PLAYER_RESOURCES.LOOT:
          if (cardOwner.handCards.length == this.amount) {
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
