import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import ChooseCard from "../DataCollector/ChooseCard";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TakeLootFromPlayer extends Effect {

  effectName = "TakeLootFromPlayer";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {

    let playersCards = data.getTargets(TARGETTYPE.PLAYER)
    let players = []
    for (let i = 0; i < playersCards.length; i++) {
      const playerCard = playersCards[i];
      if (playerCard instanceof cc.Node) {
        players.push(playerCard)
      }
    }
    let playerToTakeFrom = players[0]
    let playerToGiveTo = players[1]
    if (playerToGiveTo == null || playerToTakeFrom == null) {
      cc.log(`one of the players is null`)
    } else {
      let chooseCard = new ChooseCard();

      let playerHand = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND, null, playerToTakeFrom)
      let chosenData = await chooseCard.requireChoosingACard(playerHand)

      let cardToTake = CardManager.getCardById(chosenData.cardChosenId, true)

      await playerToTakeFrom.loseLoot(cardToTake, true)

      await CardManager.moveCardTo(cardToTake, playerToGiveTo.hand.node, true, false)
      await playerToGiveTo.gainLoot(cardToTake, true)
    }
    return stack
  }
}
