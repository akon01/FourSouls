import { Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('DestroyCurse')
export class DestroyCurse extends Effect {
  effectName = "DestroyCurse";
  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetCurses = data.getTargets(TARGETTYPE.CARD)
    if (targetCurses.length == 0) {
      throw new CardEffectTargetError(`target curses are null`, true, data, stack)
    } else {
      let player: Player
      for (let i = 0; i < targetCurses.length; i++) {
        const curse = targetCurses[i];
        player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(curse as Node)!
        return player.removeCurse(curse as Node, true).then(_ => {
          if (data instanceof PassiveEffectData) return data
          return WrapperProvider.stackWrapper.out._currentStack
        })
      }
    }


    if (data instanceof PassiveEffectData) return Promise.resolve(data)
    return Promise.resolve(WrapperProvider.stackWrapper.out._currentStack)
  }

}
