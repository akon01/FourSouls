import { PASSIVE_EVENTS } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import CardManager from "../../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass("PlayerIsKilledCondition")
export default class PlayerIsKilledCondition extends Condition {

  event = PASSIVE_EVENTS.PLAYER_IS_KILLED

  @property
  isSpecificPlayer: boolean = false;

  @property({
    type: cc.Node,
    visible: function (this: PlayerIsKilledCondition) {
      if (this.isSpecificPlayer) { return true }
    }
  })
  specificPlayer: cc.Node = null

  @property
  isNotCardOwner: boolean = false;



  async testCondition(meta: PassiveMeta) {
    const player: Player = PlayerManager.getPlayerByCard(meta.methodScope)
    const thisCard = Card.getCardNodeByChild(this.node);
    const cardOwner = CardManager.getCardOwner(thisCard)
    let answer = true
    // const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (!(player instanceof Player)) {
      answer = false;
    }
    if (this.isSpecificPlayer) {
      if (player.node != this.specificPlayer) {
        answer = false;
      }
    }
    if (this.isNotCardOwner) {
      if (player.character == cardOwner) {
        answer = false;
      }
    }
    return answer
  }
}
