import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import AttackRoll from "../../StackEffects/Attack Roll";
import RollDiceStackEffect from "../../StackEffects/Roll DIce";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SetDice extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "SetDice";


  @property(cc.Integer)
  rollValueToPut: number = 1

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    cc.log(data)
    let diceRollStackEffect = data.getTarget(TARGETTYPE.STACK_EFFECT)
    if (diceRollStackEffect == null) {
      cc.log(`no dice stack effect to reroll`)
    } else {
      if (!(diceRollStackEffect instanceof cc.Node)) {
        if (diceRollStackEffect instanceof RollDiceStackEffect || diceRollStackEffect instanceof AttackRoll) {

          diceRollStackEffect.numberRolled = this.rollValueToPut;
        }


      }
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
