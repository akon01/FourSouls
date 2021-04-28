import { Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('DoubleMonsterReward')
export class DoubleMonsterReward extends Effect {
  effectName = "DoubleMonsterReward";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const monsterWithReward = data.getTarget(TARGETTYPE.MONSTER) as Node
    if (!monsterWithReward) {
      throw new CardEffectTargetError(`No Monster With Reward Found`, true, data, stack)
    }

    monsterWithReward.getComponent(Monster)!.getReward().doubleReward = true


    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
