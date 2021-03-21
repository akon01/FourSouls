import { _decorator, Node, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('MonsterIsKilled')
export class MonsterIsKilled extends Condition {
  event = PASSIVE_EVENTS.MONSTER_IS_KILLED
  @property
  isSpecificMonster: boolean = false;
  // @ts-ignore
  @property({
    type: Node,
    visible: function (this: MonsterIsKilled) {
      if (this.isSpecificMonster) { return true }
    }
  })
  specificMonsterCard: Node | null = null

  @property
  isSpecificNotMonster: boolean = false;
  // @ts-ignore
  @property({
    type: Node,
    visible: function (this: MonsterIsKilled) {
      if (this.isSpecificNotMonster) { return true }
    }
  })
  specificNotMonsterCard: Node | null = null
  @property
  isSpecificRoll: boolean = false;
  // @ts-ignore
  @property({
    type: [CCInteger],
    visible: function (this: MonsterIsKilled) {
      if (this.isSpecificRoll) { return true }
    }
  })
  specificRolls: number[] = []
  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    const monster: Monster = meta.methodScope.getComponent(Monster)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    let answer = true
    // const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard);
    if (!(monster instanceof Monster)) {
      answer = false;
    }
    if (this.isSpecificMonster) {
      if (monster.node != this.specificMonsterCard) {
        answer = false;
      }
    }
    if (this.isSpecificNotMonster) {
      if (monster.node == this.specificNotMonsterCard) {
        answer = false;
      }
    }
    if (this.isSpecificRoll) {
      let isTrue = false;
      for (const roll of this.specificRolls) {
        if (!meta.args) { debugger; throw new Error("No Args"); }
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
