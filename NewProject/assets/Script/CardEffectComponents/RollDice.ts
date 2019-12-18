import { ROLL_TYPE } from "../Constants";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import DataCollector from "./DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollDice extends DataCollector {
  collectorName = "RollDice";
  isEffectChosen: boolean = false;
  cardChosen: cc.Node;
  playerId: number;
  rollType: ROLL_TYPE;
  hasSubAction = true;

  /**
   *
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */

  async collectData(data: {
    cardPlayerId;
    cardId;
  }): Promise<Number> {

    let player = PlayerManager.getPlayerById(data.cardPlayerId)
    let numberRolled;

    let cardPlayed = CardManager.getCardById(data.cardId, true);

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
