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
    let terminateOriginal = data.terminateOriginal;
    let player = PlayerManager.getPlayerByCard(data.effectCardPlayer)
    let args = data.methodArgs;
    args[0] = await player.rollDice(args[1])
    return data
  }
}
