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
export default class LootThenPutOnTop extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "LootThenPutOnTop";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    let playerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (playerCard instanceof cc.Node) {
      let player = PlayerManager.getPlayerByCard(playerCard)
      if (player == null) {
        cc.log(`no player to loot`)
      } else {
        await player.drawCard(CardManager.lootDeck, true);
        let cardChoose = new ChooseCard();
        cardChoose.chooseType = CHOOSE_CARD_TYPE.MY_HAND;
        let chosenData = await cardChoose.collectData({ cardPlayerId: player.playerId })
        // let chosenCard = CardManager.getCardById(chosenData.cardChosenId, true)
        let chosenCard = chosenData.effectTargetCard;
        let lootDeck = CardManager.lootDeck.getComponent(Deck);
        await CardManager.moveCardTo(chosenCard, lootDeck.node, true, false);
        await player.loseLoot(chosenCard, true)
        await lootDeck.addToDeckOnTop(chosenCard, true)
      }
    }
    return stack
  }
}
