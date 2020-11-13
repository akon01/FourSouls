import PassiveManager from "../../Managers/PassiveManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import Stack from "../../Entites/Stack";
import IdAndName from "../IdAndNameComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddPassiveEffect extends Effect {
  effectName = "AddPassiveEffect";

  /**
   *
   * @param data {target:PlayerId} 
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    const passiveToAdd = this.getPassiveEffectToAdd();
    const conditions = passiveToAdd.getConditions();
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      condition.conditionData = data
      condition.isAddPassiveEffect = true
    }

    //  this.passiveEffectToAdd.conditions.conditionData = data;
    await PassiveManager.registerOneTurnPassiveEffect(passiveToAdd, true)
    cc.log(`registered one turn passive ${passiveToAdd.name}`)

    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
