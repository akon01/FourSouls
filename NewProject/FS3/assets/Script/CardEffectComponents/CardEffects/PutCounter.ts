import { log, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
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
  howManyCountersToAdd = 1;
  @property
  isGetCounterNumberFromDataCollctor = false

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data"); }
    const targetItem = data.getTarget(TARGETTYPE.ITEM)

    const countersToAdd = this.isGetCounterNumberFromDataCollctor ? data.getTarget(TARGETTYPE.NUMBER) as number | null : this.howManyCountersToAdd
    if (this.isGetCounterNumberFromDataCollctor && !countersToAdd) {
      throw new CardEffectTargetError(`No Counter Quantity Target Found`, true, data, stack)
    }
    if (targetItem == null) {
      throw new CardEffectTargetError(`No Target Item To Put Counter On found`, true, data, stack)

    } else {
      await (targetItem as Node).getComponent(Card)!.putCounter(countersToAdd!, true)
    }

    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
