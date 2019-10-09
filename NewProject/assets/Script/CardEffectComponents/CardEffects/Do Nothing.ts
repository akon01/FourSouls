import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DoNothing extends Effect {
  effectName = "DoNothing";


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    cc.log(`do nothing Effect!`)

    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
}
