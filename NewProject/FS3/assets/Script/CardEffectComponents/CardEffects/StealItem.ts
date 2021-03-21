import { _decorator, log, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
import { Store } from "../../Entites/GameEntities/Store";
import { Stack } from "../../Entites/Stack";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('StealItem')
export class StealItem extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;
  effectName = "StealItem";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    log(data)
    if (!data) { debugger; throw new Error("No Data"); }
    const stealer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(data.effectCardPlayer!)!
    const itemToSteal = data.getTarget(TARGETTYPE.ITEM)
    if (itemToSteal instanceof Node) {
      if (itemToSteal == null) {
        log(`no target player available`)
      } else {
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(itemToSteal)!
        if (player != null) {
          await player.loseItem(itemToSteal, true)
          await stealer.addItem(itemToSteal, true, true)
        } else {
          await WrapperProvider.storeWrapper.out.removeFromStore(itemToSteal, true)
          await stealer.addItem(itemToSteal, true, true)
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}