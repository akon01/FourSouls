import { TARGETTYPE } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PutCounter extends Effect {
  effectName = "PutCounter";

  @property
  howManyCountersToAdd: number = 1;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {
    let targetItem: cc.Node
    targetItem = data.getTarget(TARGETTYPE.ITEM)
    if (targetItem == null) {
      cc.log(`no item to put counter on`)
    } else {
      targetItem.getComponent(Card)._counters += this.howManyCountersToAdd;
    }
    return stack
  }
}
