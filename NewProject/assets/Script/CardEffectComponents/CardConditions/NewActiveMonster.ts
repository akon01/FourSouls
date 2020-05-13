import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import TurnsManager from "../../Managers/TurnsManager";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewActiveMonster extends Condition {

  event = PASSIVE_EVENTS.NEW_ACTIVE_MONSTER

  @property
  isOwnerTurnOnly: boolean = true;

  async testCondition(meta: PassiveMeta) {
    let turnPlayer: Player = TurnsManager.currentTurn.getTurnPlayer()
    const thisCard = Card.getCardNodeByChild(this.node)
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (this.isOwnerTurnOnly) {
      if (turnPlayer.name == cardOwner.name) {
        return true
      } else return false
    }
    return true
  }
}
