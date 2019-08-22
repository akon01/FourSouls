import StackEffectInterface from "../../../StackEffects/StackEffectInterface";

import Effect from "../Effect";
import DataCollector from "../../DataCollector/DataCollector";
import { PassiveEffectData } from "../../../Managers/DataInterpreter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PreventDamage extends Effect {
  effectName = "PreventDamage";

  @property({ type: DataCollector, override: true })
  dataCollector = null;


  @property
  damageToPrevent: number = 1;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    data.methodArgs[0] -= this.damageToPrevent

    return data
  }
}
