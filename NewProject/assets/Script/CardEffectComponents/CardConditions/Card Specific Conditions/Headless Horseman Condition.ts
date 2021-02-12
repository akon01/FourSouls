
import { PASSIVE_EVENTS } from "../../../Constants";
import CardEffect from "../../../Entites/CardEffect";
import Monster from "../../../Entites/CardTypes/Monster";
import Card from "../../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../../Managers/PassiveManager";
import IdAndName from "../../IdAndNameComponent";
import AtSpecificHP from "../AtSpecificHP";
import Condition from "../Condition";
import MonsterIsKilled from "../MonsterIsKilled";


const { ccclass, property } = cc._decorator;

@ccclass('HeadlessHorsmanCondition')
export default class HeadlessHorsmanCondition extends Condition {

  event = PASSIVE_EVENTS.MONSTER_GET_HIT

  _isFirstTime = true


  @property(cc.Integer)
  monsterDeathConditionIdFinal: number = -1

  // setWithOld(data: HeadlessHorsmanCondition) {
  //   if (this.monsterDeathCondition) {
  //     const newCondition = createNewCondition(this.node, this.monsterDeathCondition)
  //     this.monsterDeathConditionId.id = newCondition.ConditionId;
  //     this.monsterDeathConditionId.name = newCondition.name;
  //     this.monsterDeathCondition = null
  //     data.monsterDeathCondition = null
  //   }
  // }


  async testCondition(meta: PassiveMeta) {
    if (!this._isFirstTime) {
      return false;
    }

    return await this.node.getComponent(CardEffect).getCondition(this.monsterDeathConditionIdFinal).testCondition(meta);
  }
}
