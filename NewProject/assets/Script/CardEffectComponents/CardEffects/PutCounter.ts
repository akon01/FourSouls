import { TARGETTYPE } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";

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
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    let targetItem = data.getTarget(TARGETTYPE.ITEM)
    if (targetItem == null) {
      cc.log(`no item to put counter on`)
    } else {
      await (targetItem as cc.Node).getComponent(Card).putCounter(this.howManyCountersToAdd)
    }

    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
