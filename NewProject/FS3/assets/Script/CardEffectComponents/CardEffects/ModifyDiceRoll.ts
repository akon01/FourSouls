import { CCInteger, _decorator } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { AttackRoll } from "../../StackEffects/AttackRoll";
import { RollDiceStackEffect } from "../../StackEffects/RollDIce";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('ModifyDiceRoll')
export class ModifyDiceRoll extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "ModifyDiceRoll";
  @property({
    type: CCInteger, visible: function (this: ModifyDiceRoll) {
      return !this.isRollBonusFromDataCollector
    }
  })
  rollBonus = 1

  @property
  isRollBonusFromDataCollector = false
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const diceRollStackEffect = data.getTarget(TARGETTYPE.STACK_EFFECT)
    if (diceRollStackEffect == null) {
      throw new CardEffectTargetError(`No Dice Roll stack effect found`, true, data, stack)
    } else {
      if (!(diceRollStackEffect instanceof Node)) {
        if (diceRollStackEffect instanceof RollDiceStackEffect || diceRollStackEffect instanceof AttackRoll) {
          const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(diceRollStackEffect.creatorCardId)!

          let rollBonus: number | null = this.rollBonus
          if (this.isRollBonusFromDataCollector) {
            rollBonus = data.getTarget(TARGETTYPE.NUMBER) as number | null
            if (!rollBonus) {
              throw new CardEffectTargetError(`No Roll Bonus In Data found`, true, data, stack)
            }
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
