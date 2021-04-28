import { CCInteger, Node, _decorator } from 'cc';
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
      throw new CardEffectTargetError(`No Dice Roll Stack Effect found`, true, data, stack)
    } else {
      if (!(diceRollStackEffect instanceof Node)) {
        if (diceRollStackEffect instanceof RollDiceStackEffect || diceRollStackEffect instanceof AttackRoll) {
          const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(diceRollStackEffect.creatorCardId)!
          let rollValueToPut = this.rollValueToPut
          if (this.isRollFromDataCollector) {
            const diceRollTarget = data.getTarget(TARGETTYPE.NUMBER) as number | null;
            if (!diceRollTarget) {
              throw new CardEffectTargetError(`No Dice Roll Number found`, true, data, stack)
            }
            rollValueToPut = diceRollTarget
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
