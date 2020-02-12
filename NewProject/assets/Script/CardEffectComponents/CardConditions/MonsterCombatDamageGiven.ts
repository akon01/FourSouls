import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterCombatDamageGiven extends Condition {

  @property
  isSpecificToEntityDealsDamage: boolean = false;

  @property({
    type: cc.Node, visible: function (this: MonsterCombatDamageGiven) {
      if (this.isSpecificToEntityDealsDamage) { return true }
    }
  })
  entityWhoDealtDamage: cc.Node = null;

  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN

  async testCondition(meta: PassiveMeta) {
    cc.log(`test monster combat damage given`)
    const player: Player = meta.methodScope.getComponent(Player);
    const thisCard = Card.getCardNodeByChild(this.node);
    let answer = false;
    if (player instanceof Player) { answer = true; }
    if (this.isSpecificToEntityDealsDamage) {
      if (this.entityWhoDealtDamage != meta.args[2]) { answer = false; }
    }
    return answer

  }
}
