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
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LootThenPutOnTop extends Effect {
  chooseType = CHOOSE_TYPE.MYHAND;

  effectName = "LootThenPutOnTop";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {
    let player = PlayerManager.getPlayerByCard(data.getTarget(TARGETTYPE.PLAYER))


    await player.drawCard(CardManager.lootDeck, true);
    let cardChoose = new ChooseCard();
    cardChoose.chooseType = CHOOSE_TYPE.MYHAND;
    let chosenData = await cardChoose.collectData({ cardPlayerId: player.playerId })
    // let chosenCard = CardManager.getCardById(chosenData.cardChosenId, true)
    let chosenCard = chosenData.effectTargetCard;
    let lootDeck = CardManager.lootDeck.getComponent(Deck);
    await CardManager.moveCardTo(chosenCard, lootDeck.node, true);
    await player.loseLoot(chosenCard, true)
    await lootDeck.addToDeckOnTop(chosenCard, true)
    return serverEffectStack
  }
}
