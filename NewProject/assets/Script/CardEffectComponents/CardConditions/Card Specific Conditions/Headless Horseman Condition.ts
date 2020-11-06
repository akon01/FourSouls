
import { PASSIVE_EVENTS } from "../../../Constants";
import Monster from "../../../Entites/CardTypes/Monster";
import Card from "../../../Entites/GameEntities/Card";
import { PassiveMeta } from "../../../Managers/PassiveManager";
import AtSpecificHp from "../AtSpecificHP";
import Condition from "../Condition";
import MonsterIsKilled from "../MonsterIsKilled";


const { ccclass, property } = cc._decorator;

@ccclass
export default class HeadlessHorsmanCondition extends Condition {

  event = PASSIVE_EVENTS.MONSTER_GET_HIT

  _isFirstTime= true 

  @property(AtSpecificHp)
  monsterDeathCondition:AtSpecificHp = null 


  async testCondition(meta: PassiveMeta) {
    if(!this._isFirstTime){
      return false;
    }

    return await this.monsterDeathCondition.testCondition(meta);
  }
}
