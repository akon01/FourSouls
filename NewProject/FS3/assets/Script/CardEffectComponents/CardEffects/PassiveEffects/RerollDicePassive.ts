import { log, _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../../Constants";
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { PlayerManager } from "../../../Managers/PlayerManager";
import { WrapperProvider } from '../../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { PassiveEffect } from "../PassiveEffect";

@ccclass('RerollDicePassive')
export class RerollDicePassive extends PassiveEffect {
  effectName = "RerollDicePassive";
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const terminateOriginal = data.terminateOriginal;
    log(data)
    // let player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(data.effectCardPlayer)
    const player = data.getTarget(TARGETTYPE.PLAYER)
    if (!player) { throw new Error(`no Player Target to Reroll`) }
    const args = data.methodArgs;
    args[0] = await WrapperProvider.playerManagerWrapper.out.getPlayerByCard((player as Node))!.rollDice(args[1])
    return data
  }
}
