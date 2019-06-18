import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TakeDamage extends Condition {
  testCondition(meta: any) {
    cc.log("test condition take damage");
    let className = meta.scope;
    if (className instanceof Player && meta.key == "getHit") {
      return true;
    } else {
      return false;
    }
  }
}
