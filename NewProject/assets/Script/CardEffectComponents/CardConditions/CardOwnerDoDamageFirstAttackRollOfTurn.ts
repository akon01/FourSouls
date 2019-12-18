import { PASSIVE_EVENTS, ROLL_TYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerDoDamageFirstAttackRollOfTurn extends Condition {

  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN

  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = this.node.parent.parent.parent;
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      player instanceof Player &&
      player.name == cardOwner.name &&
      player._isFirstAttackRollOfTurn
    ) {
      return true;
    } else {
      return false;
    }
  }
}
