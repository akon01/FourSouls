import { _decorator } from 'cc';
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { WrapperProvider } from '../../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { Effect } from "../Effect";
const { ccclass, property } = _decorator;


@ccclass('InfiniteAttack')
export class InfiniteAttack extends Effect {
  effectName = "InfiniteAttack";
  noDataCollector = true
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("Data Is Undef"); }
    WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!.attackPlays += 1;

    return data
  }
}
