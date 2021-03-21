import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { TARGETTYPE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { PlayerManager } from "../Managers/PlayerManager";

@ccclass('PokerChipEffect2')
export class PokerChipEffect2 extends Effect {
  effectName = "PokerChipEffect2";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data"); }

    let numOfMoneyToGet = data.methodArgs[0]
    data.methodArgs[0] = numOfMoneyToGet * 2


    return data
  }
}
