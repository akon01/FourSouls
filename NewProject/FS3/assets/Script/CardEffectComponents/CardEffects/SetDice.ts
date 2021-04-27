import { _decorator, CCInteger, log, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Stack } from "../../Entites/Stack";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { AttackRoll } from "../../StackEffects/AttackRoll";
import { RollDiceStackEffect } from "../../StackEffects/RollDIce";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";

@ccclass('SetDice')
export class SetDice extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "SetDice";
  @property({ type: CCInteger, visible: function (this: SetDice) { return !this.isRollFromDataCollector } })
  rollValueToPut = 1

  @property
  isRollFromDataCollector = false
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }

    console.log(data.effectTargets)
    const diceRollStackEffect = data.getTarget(TARGETTYPE.STACK_EFFECT)
    if (diceRollStackEffect == null) {
      throw new Error(`No Dice Roll stack effect found`)
    } else {
      if (!(diceRollStackEffect instanceof Node)) {
        if (diceRollStackEffect instanceof RollDiceStackEffect || diceRollStackEffect instanceof AttackRoll) {
          const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(diceRollStackEffect.creatorCardId)!
          let rollValueToPut = this.rollValueToPut
          if (this.isRollFromDataCollector) {
            rollValueToPut = data.getTarget(TARGETTYPE.NUMBER) as number
          }
          player.dice!.setRoll(rollValueToPut)
          diceRollStackEffect.numberRolled = rollValueToPut;
        }

      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
