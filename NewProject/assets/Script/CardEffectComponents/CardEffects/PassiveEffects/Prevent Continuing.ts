import { PassiveEffectData } from "../../../Managers/DataInterpreter";
import StackEffectInterface from "../../../StackEffects/StackEffectInterface";
import PassiveEffect from "../PassiveEffect";



const { ccclass, property } = cc._decorator;

@ccclass
export default class PreventContinuing extends PassiveEffect {
  effectName = "PreventContinuing";



  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {

    data.terminateOriginal = true
    return data
  }
}
