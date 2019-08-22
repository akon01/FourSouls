import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE, TARGETTYPE, ROLL_TYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import Deck from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import StackEffectPreview from "../../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import RollDiceStackEffect from "../../StackEffects/Roll DIce";
import AttackRoll from "../../StackEffects/Attack Roll";

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
    data?: ActiveEffectData
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
    return stack
  }
}
