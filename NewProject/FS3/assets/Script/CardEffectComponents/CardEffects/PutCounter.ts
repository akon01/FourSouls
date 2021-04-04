import { log, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('PutCounter')
export class PutCounter extends Effect {
  effectName = "PutCounter";
  @property({ visible: function (this: PutCounter) { return !this.isGetCounterNumberFromDataCollctor } })
  howManyCountersToAdd: number = 1;
  @property
  isGetCounterNumberFromDataCollctor: boolean = false

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data"); }
    let targetItem = data.getTarget(TARGETTYPE.ITEM)
    let countersToAdd = this.isGetCounterNumberFromDataCollctor ? data.getTarget(TARGETTYPE.NUMBER) as number : this.howManyCountersToAdd

    if (targetItem == null) {
      console.log(`no item to put counter on`)
    } else {
      await (targetItem as Node).getComponent(Card)!.putCounter(countersToAdd, true)
    }

    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
