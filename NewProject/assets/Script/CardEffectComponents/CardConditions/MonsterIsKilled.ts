import { PASSIVE_EVENTS } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import ConditionInterface from "./ConditionInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterIsKilled extends Condition {

  event = PASSIVE_EVENTS.MONSTER_IS_KILLED

  async testCondition(meta: PassiveMeta) {
    const monster: Monster = meta.methodScope.getComponent(Monster);
    const thisCard = this.node.parent.parent;
    // const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (
      monster instanceof Monster
      // monster.name == cardOwner.name
      //&&
      // meta.passiveEvent == PASSIVE_EVENTS.MONSTER_IS_KILLED
    ) {
      return true;
    } else {
      return false;
    }
  }
}
