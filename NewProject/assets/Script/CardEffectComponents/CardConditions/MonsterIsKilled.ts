import { PASSIVE_EVENTS } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterIsKilled extends Condition {

  event = PASSIVE_EVENTS.MONSTER_IS_KILLED

  @property
  isSpecificMonster: boolean = false;

  @property({
    type: cc.Node,
    visible: function (this: MonsterIsKilled) {
      if (this.isSpecificMonster) { return true }
    }
  })
  specificMonsterCard: cc.Node = null

  @property
  isSpecificRoll: boolean = false;

  @property({
    type: [cc.Integer],
    visible: function (this: MonsterIsKilled) {
      if (this.isSpecificRoll) { return true }
    }
  })
  specificRolls: number[] = []

  async testCondition(meta: PassiveMeta) {
    const monster: Monster = meta.methodScope.getComponent(Monster);
    const thisCard = Card.getCardNodeByChild(this.node);
    let answer = true
    // const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    if (!(monster instanceof Monster)) {
      answer = false;
    }
    if (this.isSpecificMonster) {
      if (monster.node != this.specificMonsterCard) {
        answer = false;
      }
    }
    if (this.isSpecificRoll) {
      let isTrue = false;
      for (const roll of this.specificRolls) {
        if (roll == meta.args[0]) {
          isTrue = true
          break;
        }
      }
      if (!isTrue) {
        answer = false
      }
    }
    return answer
  }
}
