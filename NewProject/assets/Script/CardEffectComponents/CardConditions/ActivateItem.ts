import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";
import BattleManager from "../../Managers/BattleManager";
import TurnsManager from "../../Managers/TurnsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActivateItemCondition extends Condition {

  event = PASSIVE_EVENTS.PLAYER_ACTIVATE_ITEM

  @property
  isOwnerOnly: boolean = true;

  @property
  isAttackingPlayerOnly: boolean = false;

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node)
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    let answer = true;
    if (!(player instanceof Player)) {
      answer = false;
    }

    if (this.isOwnerOnly) {
      if (player.name != cardOwner.name) {
        answer = false
      }
    }

    if (this.isAttackingPlayerOnly) {
      if (!(BattleManager.inBattle && player == TurnsManager.getCurrentTurn().getTurnPlayer())) {
        answer = false;
      }
    }

    return answer
  }
}
