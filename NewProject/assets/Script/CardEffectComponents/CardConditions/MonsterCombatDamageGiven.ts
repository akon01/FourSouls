import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterCombatDamageGiven extends Condition {

  @property
  isSpecificToEntityDealsDamage: boolean = false;

  @property({
    type: cc.Node, visible: function (this: MonsterCombatDamageGiven) {
      if (this.isSpecificToEntityDealsDamage) return true
    }
  })
  entityWhoDealtDamage: cc.Node = null;


  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_TAKEN

  async testCondition(meta: PassiveMeta) {
    let player: Player = meta.methodScope.getComponent(Player);
    let thisCard = this.node.parent.parent;
    let answer = false;
    if (player instanceof Player) answer = true;
    if (this.isSpecificToEntityDealsDamage) {
      if (this.entityWhoDealtDamage != meta.args[2]) answer = false;
    }
    return answer


  }
}
