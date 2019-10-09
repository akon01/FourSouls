import BattleManager from "../../Managers/BattleManager";
import PreCondition from "./PreCondition";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NoDuringAttack extends PreCondition {


  testCondition(meta: any) {

    if (
      BattleManager.currentlyAttackedMonsterNode == null
    ) {
      return true;
    } else {
      return false;
    }
  }
}
