import { log, _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { Stack } from "../../Entites/Stack";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('DestroyCurse')
export class DestroyCurse extends Effect {
  effectName = "DestroyCurse";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    let targetCurses = data.getTargets(TARGETTYPE.CARD)
    if (targetCurses.length == 0) {
      log(`no targets`)
    } else {
      let player: Player
      for (let i = 0; i < targetCurses.length; i++) {
        const curse = targetCurses[i];
        player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(curse as Node)!
        await player.removeCurse(curse as Node, true)
      }
    }


    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
