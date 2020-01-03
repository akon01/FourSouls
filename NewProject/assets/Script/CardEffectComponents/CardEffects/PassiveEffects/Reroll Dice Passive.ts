import { TARGETTYPE } from "../../../Constants";
import { PassiveEffectData } from "../../../Managers/DataInterpreter";
import PlayerManager from "../../../Managers/PlayerManager";
import StackEffectInterface from "../../../StackEffects/StackEffectInterface";
import PassiveEffect from "../PassiveEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RerollDicePassive extends PassiveEffect {
  effectName = "RerollDicePassive";

  /**
     *
     * @param data {target:PlayerId}
     */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    const terminateOriginal = data.terminateOriginal;
    cc.log(data)
    // let player = PlayerManager.getPlayerByCard(data.effectCardPlayer)
    const player = data.getTarget(TARGETTYPE.PLAYER)
    if (!player) { throw `no Player Target to Reroll` }
    const args = data.methodArgs;
    args[0] = await PlayerManager.getPlayerByCard((player as cc.Node)).rollDice(args[1])
    return data
  }
}
