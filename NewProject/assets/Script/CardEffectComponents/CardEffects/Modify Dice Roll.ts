import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import AttackRoll from "../../StackEffects/Attack Roll";
import RollDiceStackEffect from "../../StackEffects/Roll DIce";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModifyDiceRoll extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "ModifyDiceRoll";

  @property(cc.Integer)
  rollBonus: number = 1

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    cc.log(data.effectTargets)
    const diceRollStackEffect = data.getTarget(TARGETTYPE.STACK_EFFECT)

    if (diceRollStackEffect == null) {
      throw new Error(`No Dice Roll stack effect found`)
    } else {
      if (!(diceRollStackEffect instanceof cc.Node)) {
        if (diceRollStackEffect instanceof RollDiceStackEffect || diceRollStackEffect instanceof AttackRoll) {
          const player = PlayerManager.getPlayerByCardId(diceRollStackEffect.creatorCardId)
          player.dice.setRoll(diceRollStackEffect.numberRolled + this.rollBonus)
          diceRollStackEffect.numberRolled = diceRollStackEffect.numberRolled + this.rollBonus;
        }

      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
