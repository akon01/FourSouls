import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import { PASSIVE_EVENTS } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerPayPenalties extends Condition {


  event = PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name
      // &&  meta.passiveEvent == PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES
    ) {
      return true;
    } else {
      return false;
    }
  }
}
