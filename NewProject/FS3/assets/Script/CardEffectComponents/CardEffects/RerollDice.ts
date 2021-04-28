import { log, _decorator } from 'cc';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { AttackRoll } from "../../StackEffects/AttackRoll";
import { RollDiceStackEffect } from "../../StackEffects/RollDIce";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, ROLL_TYPE, TARGETTYPE } from "../../Constants";
import { Effect } from "./Effect";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
const { ccclass, property } = _decorator;


@ccclass('RerollDice')
export class RerollDice extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "RerollDice";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    console.log(data)
    if (!data) { debugger; throw new Error("No Data"); }
    const diceRollStackEffect = data.getTarget(TARGETTYPE.STACK_EFFECT)
    if (diceRollStackEffect == null) {
      throw new CardEffectTargetError(`No Dice Roll Stack Effect found`, true, data, stack)
    } else {
      if (!(diceRollStackEffect instanceof Node)) {
        if (diceRollStackEffect instanceof RollDiceStackEffect) {
          const playerCard = WrapperProvider.cardManagerWrapper.out.getCardById(diceRollStackEffect.creatorCardId, true);
          const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!;
          const newNumberRolled = await player.rollDice(ROLL_TYPE.EFFECT)
          diceRollStackEffect.numberRolled = newNumberRolled;
        } else
          if (diceRollStackEffect instanceof AttackRoll) {
            const playerCard = WrapperProvider.cardManagerWrapper.out.getCardById(diceRollStackEffect.creatorCardId, true);
            const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!;
            const newNumberRolled = await player.rollDice(ROLL_TYPE.ATTACK)
            diceRollStackEffect.numberRolled = newNumberRolled;
          }
      }
    }
    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}