import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { TARGETTYPE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { PlayerManager } from "../Managers/PlayerManager";

@ccclass('PokerChipEffect')
export class PokerChipEffect extends Effect {
  effectName = "PokerChipEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data"); }
    data.methodArgs[0] = 1


    return data
  }
}
