import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Player } from "../../Entites/GameEntities/Player";
import { Stack } from "../../Entites/Stack";
import { BattleManager } from "../../Managers/BattleManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { TurnsManager } from "../../Managers/TurnsManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { TARGETTYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { WrapperProvider } from '../../Managers/WrapperProvider';

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
      throw new Error(`No Monster With Reward Found`)
    }

    monsterWithReward.getComponent(Monster)!.getReward().doubleReward = true


    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
