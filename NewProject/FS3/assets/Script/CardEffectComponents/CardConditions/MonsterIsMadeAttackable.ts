import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { Card } from "../../Entites/GameEntities/Card";
import { Stack } from "../../Entites/Stack";
import { BattleManager } from "../../Managers/BattleManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('MonsterIsMadeAttackable')
export class MonsterIsMadeAttackable extends Condition {
  event = PASSIVE_EVENTS.MONSTER_MADE_ATTACKABLE
  @property
  isSpecificMonster = false;
  //@ts-ignore
  @property({
    type: Node,
    visible: function (this: MonsterIsMadeAttackable) {
      if (this.isSpecificMonster) { return true }
    }
  })
  specificMonsterCard: Node | null = null
  @property
  isSpecificNotMonster = false;
  //@ts-ignore
  @property({
    type: Node,
    visible: function (this: MonsterIsMadeAttackable) {
      if (this.isSpecificNotMonster) { return true }
    }
  })
  specificNotMonsterCard: Node | null = null
  @property
  isTurnPlayerNotOnBattle = false
  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    const monster: Monster = meta.methodScope.getComponent(Monster)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    let answer = true
    // const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)
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
    if (WrapperProvider.stackWrapper.out._currentStack.length != 0) {
      answer = false;
    }
    if (this.isTurnPlayerNotOnBattle) {
      if (WrapperProvider.battleManagerWrapper.out.inBattle) {
        answer = false;
      }
    }
    return answer
  }
}
