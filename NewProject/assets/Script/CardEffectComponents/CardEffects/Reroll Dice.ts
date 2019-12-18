import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import AttackRoll from "../../StackEffects/Attack Roll";
import RollDiceStackEffect from "../../StackEffects/Roll DIce";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, ROLL_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RerollDice extends Effect {
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
    cc.log(data)
    let diceRollStackEffect = data.getTarget(TARGETTYPE.STACK_EFFECT)
    if (diceRollStackEffect == null) {
      cc.log(`no dice stack effect to reroll`)
    } else {
      if (!(diceRollStackEffect instanceof cc.Node)) {
        if (diceRollStackEffect instanceof RollDiceStackEffect) {
          let playerCard = CardManager.getCardById(diceRollStackEffect.creatorCardId, true);
          let player = PlayerManager.getPlayerByCard(playerCard);
          let newNumberRolled = await player.rollDice(ROLL_TYPE.EFFECT)
          diceRollStackEffect.numberRolled = newNumberRolled;
        } else
          if (diceRollStackEffect instanceof AttackRoll) {
            let playerCard = CardManager.getCardById(diceRollStackEffect.creatorCardId, true);
            let player = PlayerManager.getPlayerByCard(playerCard);
            let newNumberRolled = await player.rollDice(ROLL_TYPE.ATTACK)
            diceRollStackEffect.numberRolled = newNumberRolled;
          }
      }
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
