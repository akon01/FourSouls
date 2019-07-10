import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import ChooseCard from "../DataCollector/ChooseCard";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LootThenPutOnTop extends Effect {
  chooseType = CHOOSE_TYPE.PLAYERHAND;

  effectName = "LootThenPutOnTop";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?
  ) {
    let player = PlayerManager.getPlayerById(data.target).getComponent(
      Player
    );

    await player.drawCard(CardManager.lootDeck, true);
    let cardChoose = new ChooseCard();
    cardChoose.chooseType = CHOOSE_TYPE.PLAYERHAND;
    let chosenData = await cardChoose.collectData({ cardPlayerId: data.target })
    let chosenCard = CardManager.getCardById(chosenData.cardChosenId, true)
    let lootDeck = CardManager.lootDeck.getComponent(Deck);
    await CardManager.moveCardTo(chosenCard, lootDeck.node, true);
    await player.loseLoot(chosenCard, true)
    await lootDeck.addToDeckOnTop(chosenCard, true)
    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
