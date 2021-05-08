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
      let player: Player
      const i = 0
      for (let i = 0; i < targetItems.length; i++) {
        const item = targetItems[i] as Node;
        player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(item)!
        await item.getComponent(Item)!.destroyItem(true)
        if (i + 1 == this.numberOfItemsToDestroy) break;
      }
    }


    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }

  private handleDestroyItem(idx: number, length: number) {
    const item = this.currTargets[idx]
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(item)!
    return item.getComponent(Item)!.destroyItem(true)

  }

  private handleAfterDestroyItem(idx: number, length: number)
}
