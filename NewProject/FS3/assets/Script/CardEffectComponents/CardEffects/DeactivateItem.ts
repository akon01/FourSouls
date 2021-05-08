import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { Stack } from "../../Entites/Stack";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';

@ccclass('DeactivateItem')
export class DeactivateItem extends Effect {
      effectName = "DeactivateItem";
      @property
      isMulti = false;
      chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;
      /**
       *
       * @param data {target:PlayerId}
       */
      doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
            if (!data) { debugger; throw new Error("No Data!"); }
            if (this.isMulti) {
                  const targetItems = data.getAllTargets()
                  if (targetItems.nodes.length == 0) {
                        throw new CardEffectTargetError(`target items are null`, true, data, stack)
                  }
                  for (let i = 0; i < targetItems.nodes.length; i++) {
                        const target = targetItems.nodes[i];
                        this.deactivateItem(target)
                  }
            } else {
                  let targetItem: Node
                  targetItem = data.getTarget(TARGETTYPE.ITEM) as Node;
                  if (targetItem == null) {
                        targetItem = data.getTarget(TARGETTYPE.PLAYER) as Node
                        if (targetItem == null) {
                              throw new CardEffectTargetError(`target item is null`, true, data, stack)
                        }
                  }
                  this.deactivateItem(targetItem);
            }



            if (data instanceof PassiveEffectData) { return Promise.resolve(data) }
            return Promise.resolve(WrapperProvider.stackWrapper.out._currentStack)
      }
      private deactivateItem(targetItem: any) {
            const cardPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetItem)!;
            cardPlayer.deactivateItem(targetItem, true);
      }
}
