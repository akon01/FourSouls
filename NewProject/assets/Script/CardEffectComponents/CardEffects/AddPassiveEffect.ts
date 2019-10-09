import PassiveManager from "../../Managers/PassiveManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddPassiveEffect extends Effect {
  effectName = "AddPassiveEffect";

  @property({ type: Effect, override: true })
  passiveEffectToAdd: Effect = null;


  /**
   *
   * @param data {target:PlayerId} 
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {



    for (let i = 0; i < this.passiveEffectToAdd.conditions.length; i++) {
      const condition = this.passiveEffectToAdd.conditions[i];
      condition.conditionData = data

    }

    //  this.passiveEffectToAdd.conditions.conditionData = data;
    await PassiveManager.registerOneTurnPassiveEffect(this.passiveEffectToAdd, true)
    cc.log(`registered one turn passive ${this.passiveEffectToAdd.name}`)
    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
