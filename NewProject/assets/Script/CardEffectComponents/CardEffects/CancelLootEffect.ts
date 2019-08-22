import Character from "../../Entites/CardTypes/Character";
import Monster from "../../Entites/CardTypes/Monster";
import BattleManager from "../../Managers/BattleManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CancelLootEffect extends Effect {

  effectName = "CancelLootEffect";


  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    let targetStackEffectToCancel = data.getTarget(TARGETTYPE.STACK_EFFECT)
    if (targetStackEffectToCancel == null) {
      cc.log(`no target stack effect`)
    } else {
      if (!(targetStackEffectToCancel instanceof cc.Node)) {
        await Stack.fizzleStackEffect(targetStackEffectToCancel)
      }
    }


    return stack
  }
}
