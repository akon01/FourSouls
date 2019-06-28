import DataCollector from "./DataCollector/DataCollector";
import PlayerManager from "../Managers/PlayerManager";
import Player from "../Entites/GameEntities/Player";
import Effect from "./CardEffects/Effect";
import { CARD_TYPE, CHOOSE_TYPE, ROLL_TYPE } from "../Constants";
import CardManager from "../Managers/CardManager";
import MonsterField from "../Entites/MonsterField";
import Deck from "../Entites/GameEntities/Deck";
import Card from "../Entites/GameEntities/Card";
import Dice from "../Entites/GameEntities/Dice";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollDice extends DataCollector {
  collectorName = "RollDice";
  isCardChosen: boolean = false;
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
  }): Promise<{
    numberRolled: number;
  }> {
    cc.log('roll dice collect data start')
    let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(
      Player
    );
    let numberRolled;

    let cardPlayed = CardManager.getCardById(data.cardId, true);

    if (cardPlayed.getComponent(Dice) != null) {
      numberRolled = await player.rollDice(ROLL_TYPE.ATTACK);
    } else {
      numberRolled = await player.rollDice(ROLL_TYPE.EFFECTROLL);
    }
    let collectedData = {
      numberRolled: numberRolled,
      cardPlayerId: data.cardPlayerId
    };
    cc.log(`roll dice collect data end with ${collectedData.numberRolled}`)
    return new Promise((resolve, reject) => {
      resolve(collectedData);
    });
  }


}
