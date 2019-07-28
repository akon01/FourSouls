import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import ChooseCard from "../DataCollector/ChooseCard";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from "../../Managers/DataInterpreter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TakeLootFromPlayer extends Effect {

  effectName = "TakeLootFromPlayer";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {

    let players = data.getTargets(TARGETTYPE.PLAYER).map(target => PlayerManager.getPlayerByCard(target))
    let playerToTakeFrom = players[0]
    let playerToGiveTo = players[1]
    let chooseCard = new ChooseCard();
    ;
    let playerHand = chooseCard.getCardsToChoose(CHOOSE_TYPE.SPECIPICPLAYERHAND, null, playerToTakeFrom)
    let chosenData = await chooseCard.requireChoosingACard(playerHand)

    let cardToTake = CardManager.getCardById(chosenData.cardChosenId, true)

    await playerToTakeFrom.loseLoot(cardToTake, true)

    await CardManager.moveCardTo(cardToTake, playerToGiveTo.hand.node, true)
    await playerToGiveTo.gainLoot(cardToTake, true)
    return serverEffectStack
  }
}
