import { _decorator, CCInteger, log } from 'cc';
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

@ccclass('ModifyDiceRoll')
export class ModifyDiceRoll extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "ModifyDiceRoll";
  @property({
    type: CCInteger, visible: function (this: ModifyDiceRoll) {
      return !this.isRollBonusFromDataCollector
    }
  })
  rollBonus: number = 1

  @property
  isRollBonusFromDataCollector: boolean = false
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

          let rollBonus = this.rollBonus
          if (this.isRollBonusFromDataCollector) {
            rollBonus = data.getTarget(TARGETTYPE.NUMBER) as number
          }
          player.dice!.setRoll(diceRollStackEffect.numberRolled + rollBonus)
          diceRollStackEffect.numberRolled = diceRollStackEffect.numberRolled + rollBonus;
        }

      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
