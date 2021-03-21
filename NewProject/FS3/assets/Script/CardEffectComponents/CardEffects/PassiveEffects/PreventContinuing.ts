import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { PassiveEffect } from "../PassiveEffect";

@ccclass('PreventContinuing')
export class PreventContinuing extends PassiveEffect {
  effectName = "PreventContinuing";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("Data Is Undef"); }
    data.terminateOriginal = true
    return data
  }
}
