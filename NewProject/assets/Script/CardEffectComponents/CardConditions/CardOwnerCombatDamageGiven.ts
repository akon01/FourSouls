import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardOwnerCombatDamageGiven extends Condition {


  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    cc.log(this.node)
    let thisCard = this.node.parent.parent;
    cc.log(thisCard)
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    cc.log(player)
    cc.log(cardOwner)
    if (
      player instanceof Player &&
      player.name == cardOwner.name
      //   &&     meta.passiveEvent == PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN
    ) {
      return true;
    } else {
      return false;
    }
  }
}
