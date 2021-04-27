import { _decorator } from 'cc';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { PreCondition } from "./PreCondition";
const { ccclass, property } = _decorator;


@ccclass('NoDuringAttack')
export class NoDuringAttack extends PreCondition {
  testCondition(meta: any) {

    if (
      WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntityNode == null && WrapperProvider.battleManagerWrapper.out.inBattle
    ) {
      return true;
    } else {
      return false;
    }
  }
}