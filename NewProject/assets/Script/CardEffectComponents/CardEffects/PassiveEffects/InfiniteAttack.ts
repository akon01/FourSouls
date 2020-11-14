import { PassiveEffectData } from "../../../Managers/DataInterpreter";
import TurnsManager from "../../../Managers/TurnsManager";
import StackEffectInterface from "../../../StackEffects/StackEffectInterface";
import Effect from "../Effect";



const { ccclass, property } = cc._decorator;

@ccclass
export default class InfiniteAttack extends Effect {
  effectName = "InfiniteAttack";

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {

    TurnsManager.currentTurn.getTurnPlayer().attackPlays += 1;

    return data
  }
}
