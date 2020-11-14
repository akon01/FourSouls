import Effect from "../CardEffectComponents/CardEffects/Effect";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import { TARGETTYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import PlayerManager from "../Managers/PlayerManager";



const { ccclass, property } = cc._decorator;

@ccclass('PokerChipEffect2')
export default class PokerChipEffect2 extends Effect {
  effectName = "PokerChipEffect2";



  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {


    let numOfMoneyToGet = data.methodArgs[0]
    data.methodArgs[0] = numOfMoneyToGet * 2


    return data
  }
}
