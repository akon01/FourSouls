import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import { PassiveMeta } from "../../Managers/PassiveManager";
import { PASSIVE_EVENTS } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";

const { ccclass, property } = cc._decorator;



@ccclass
export default class MonsterIsKilled extends Condition {

  event = PASSIVE_EVENTS.MONSTER_IS_KILLED

  async testCondition(meta: PassiveMeta) {
    let monster: Monster = meta.methodScope.getComponent(Monster);
    let thisCard = this.node.parent.parent;
    let cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      monster instanceof Monster &&
      monster.name == cardOwner.name
      //&&
      // meta.passiveEvent == PASSIVE_EVENTS.MONSTER_IS_KILLED
    ) {
      return true;
    } else {
      return false;
    }
  }
}
