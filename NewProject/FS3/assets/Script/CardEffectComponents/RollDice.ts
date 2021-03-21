import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { ROLL_TYPE } from "../Constants";
import { Dice } from "../Entites/GameEntities/Dice";
import { Player } from "../Entites/GameEntities/Player";
import { CardManager } from "../Managers/CardManager";
import { PlayerManager } from "../Managers/PlayerManager";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector/DataCollector";

@ccclass('RollDice')
export class RollDice extends DataCollector {
  collectorName = "RollDice";
  isEffectChosen: boolean = false;
  cardChosen: Node | null = null;
  playerId: number | null = null;
  rollType: ROLL_TYPE = ROLL_TYPE.ATTACK;
  hasSubAction = true;
  /**
   *
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */
  async collectData(data: {
    cardPlayerId: number;
    cardId: number;
  }): Promise<Number> {
    let player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    let numberRolled;
    let cardPlayed = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardId, true);
    if (cardPlayed.getComponent(Dice) != null) {
      let startTime = new Date().getTime()
      numberRolled = await player.rollDice(ROLL_TYPE.ATTACK);
      let endTime = new Date().getTime()
    } else {
      numberRolled = await player.rollDice(ROLL_TYPE.EFFECT_ROLL);
    }
    let collectedData = {
      numberRolled: numberRolled,
      cardPlayerId: data.cardPlayerId
    };
    let number: Number = collectedData.numberRolled;
    return collectedData.numberRolled;
  }
}
