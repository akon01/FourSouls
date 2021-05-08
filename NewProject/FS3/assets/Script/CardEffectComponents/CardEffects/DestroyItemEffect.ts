import { CCInteger, log, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Item } from '../../Entites/CardTypes/Item';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('DestroyItemEffect')
export class DestroyItemEffect extends Effect {
  effectName = "DestroyItem";
  @property(CCInteger)
  numberOfItemsToDestroy = 1

  currTargets: Node[] = []
  currData: ActiveEffectData | PassiveEffectData | null = null
  currStack: StackEffectInterface[] = []
  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetItems = data.getTargets(TARGETTYPE.ITEM)
    if (targetItems.length == 0) {
      throw new CardEffectTargetError(`target items are null`, true, data, stack)
    } else {
      this.currTargets = targetItems as Node[]
      this.currData = data
      this.currStack = stack
      return this.handleTarget(0, targetItems.length)
    }
  }
  handleTarget(index: number, length: number) {
    const item = this.currTargets[index]
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(item)!
    return item.getComponent(Item)!.destroyItem(true).then(_ => {
      if (index + 1 == this.numberOfItemsToDestroy) {
        return this.handleReturnValues()
      }
      return this.handleAfterTarget(index++, length, this.handleTarget, this)
    })
  }
}
