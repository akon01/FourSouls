import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { BattleManager } from "../../Managers/BattleManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { PreCondition } from "./PreCondition";

@ccclass('NoDuringAttack')
export class NoDuringAttack extends PreCondition {
  testCondition(meta: any) {

    if (
      WrapperProvider.battleManagerWrapper.out.currentlyAttackedMonsterNode == null
    ) {
      return true;
    } else {
      return false;
    }
  }
}