import PassiveManager from "../../Managers/PassiveManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddPassiveEffect extends Effect {
  effectName = "AddPassiveEffect";

  @property({ type: Effect, override: true })
  passiveEffectToAdd: Effect = null;

  @property({ tooltip: `Any Data Collected Will Go Into the Condition Data, To Access Use GetTargetFromConditionData`, override: true })
  dataCollector


  /**
   *
   * @param data {target:PlayerId} 
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    for (let i = 0; i < this.passiveEffectToAdd.conditions.length; i++) {
      const condition = this.passiveEffectToAdd.conditions[i];
      condition.conditionData = data
      condition.isAddPassiveEffect = true
    }

    //  this.passiveEffectToAdd.conditions.conditionData = data;
    await PassiveManager.registerOneTurnPassiveEffect(this.passiveEffectToAdd, true)
    cc.log(`registered one turn passive ${this.passiveEffectToAdd.name}`)

    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
