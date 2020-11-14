
import { PASSIVE_EVENTS } from "../../../Constants";
import Monster from "../../../Entites/CardTypes/Monster";
import Card from "../../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../../Managers/PassiveManager";
import { createNewCondition } from "../../../reset";
import IdAndName from "../../IdAndNameComponent";
import AtSpecificHP from "../AtSpecificHP";
import Condition from "../Condition";
import MonsterIsKilled from "../MonsterIsKilled";


const { ccclass, property } = cc._decorator;

@ccclass('HeadlessHorsmanCondition')
export default class HeadlessHorsmanCondition extends Condition {

  event = PASSIVE_EVENTS.MONSTER_GET_HIT

  _isFirstTime = true

  @property(AtSpecificHP)
  monsterDeathCondition: AtSpecificHP = null

  @property(IdAndName)
  monsterDeathConditionId: IdAndName = new IdAndName()

  setWithOld(data: HeadlessHorsmanCondition) {
    if (this.monsterDeathCondition) {
      const newCondition = createNewCondition(this.node, this.monsterDeathCondition)
      this.monsterDeathConditionId.id = newCondition.conditionId;
      this.monsterDeathConditionId.name = newCondition.name;
      this.monsterDeathCondition = null
      data.monsterDeathCondition = null
    }
  }


  async testCondition(meta: PassiveMeta) {
    if (!this._isFirstTime) {
      return false;
    }

    return await this.monsterDeathCondition.testCondition(meta);
  }
}
