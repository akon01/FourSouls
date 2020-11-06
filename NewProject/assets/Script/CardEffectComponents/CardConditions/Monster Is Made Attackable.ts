import { PASSIVE_EVENTS } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import { PassiveMeta } from "../../Managers/PassiveManager";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";
import Stack from "../../Entites/Stack";
import BattleManager from "../../Managers/BattleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterIsMadeAttackable extends Condition {

  event = PASSIVE_EVENTS.MONSTER_MADE_ATTACKABLE

  @property
  isSpecificMonster: boolean = false;

  @property({
    type: cc.Node,
    visible: function (this: MonsterIsMadeAttackable) {
      if (this.isSpecificMonster) { return true }
    }
  })
  specificMonsterCard: cc.Node = null

  @property
  isSpecificNotMonster: boolean = false;

  @property({
    type: cc.Node,
    visible: function (this: MonsterIsMadeAttackable) {
      if (this.isSpecificNotMonster) { return true }
    }
  })
  specificNotMonsterCard: cc.Node = null

  @property
  isTurnPlayerNotOnBattle: boolean = false



  async testCondition(meta: PassiveMeta) {
    const monster: Monster = meta.methodScope.getComponent(Monster);
    const thisCard = Card.getCardNodeByChild(this.node);
    let answer = true
    // const cardOwner = PlayerManager.getPlayerByCard(thisCard)
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
    if (Stack._currentStack.length != 0) {
      answer = false;
    }
    if (this.isTurnPlayerNotOnBattle) {
      if (BattleManager.inBattle) {
        answer = false;
      }
    }
    return answer
  }
}
