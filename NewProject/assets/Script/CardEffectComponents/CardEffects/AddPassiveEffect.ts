import PassiveManager from "../../Managers/PassiveManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

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
  async doEffect(stack: StackEffectInterface[], data?) {

    this.passiveEffectToAdd.condition.conditionData = data;
    await PassiveManager.registerOneTurnPassiveEffect(this.passiveEffectToAdd, true)
    cc.log(`registered one turn passive ${this.passiveEffectToAdd.name}`)
    return stack
  }
}
