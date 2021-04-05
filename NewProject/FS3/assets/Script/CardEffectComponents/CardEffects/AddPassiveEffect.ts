import { _decorator } from 'cc';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass } = _decorator;


@ccclass('AddPassiveEffect')
export class AddPassiveEffect extends Effect {
  effectName = "AddPassiveEffect";
  /**
   *
   * @param data {target:PlayerId} 
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data!"); }
    const passiveToAdd = this.getPassiveEffectToAdd();
    if (!passiveToAdd) { debugger; throw new Error("No Passive To Add"); }

    const conditions = passiveToAdd.getConditions();
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      condition.conditionData = data
      condition.isAddPassiveEffect = true
    }

    //  this.passiveEffectToAdd.conditions.conditionData = data;
    await WrapperProvider.passiveManagerWrapper.out.registerOneTurnPassiveEffect(passiveToAdd, true)
    console.log(`registered one turn passive ${passiveToAdd.name}`)

    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
