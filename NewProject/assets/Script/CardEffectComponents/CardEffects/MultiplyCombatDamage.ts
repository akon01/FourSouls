import Character from "../../Entites/CardTypes/Character";
import Monster from "../../Entites/CardTypes/Monster";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplyCombatDamage extends Effect {

  effectName = "MultiplyCombatDamage";

  @property(cc.Integer)
  multiplier: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: PassiveEffectData
  ) {
    data.methodArgs[0] = data.methodArgs[0] * this.multiplier
    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }


}
