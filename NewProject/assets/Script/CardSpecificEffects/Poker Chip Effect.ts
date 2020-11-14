import Effect from "../CardEffectComponents/CardEffects/Effect";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import { TARGETTYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import PlayerManager from "../Managers/PlayerManager";



const { ccclass, property } = cc._decorator;

@ccclass('PokerChipEffect')
export default class PokerChipEffect extends Effect {
  effectName = "PokerChipEffect";



  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {

    data.methodArgs[0] = 1


    return data
  }
}
