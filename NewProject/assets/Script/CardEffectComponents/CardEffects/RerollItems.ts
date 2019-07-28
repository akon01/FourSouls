import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import Deck from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from "../../Managers/NewScript";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RerollItems extends Effect {
  chooseType = CHOOSE_TYPE.MYHAND;

  effectName = "RerollItems";


  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data?: ActiveEffectData
  ) {
    //   let cardChosenId = data.targets
    // let cardsChosen: cc.Node[] = [];
    // for (let i = 0; i < cardChosenId.length; i++) {
    //   cardsChosen.push(CardManager.getCardById(cardChosenId[i]))
    // }
    let cardsChosen = data.getTargets(TARGETTYPE.ITEM);
    //  let cardChosen = CardManager.getCardById(data.cardChosenId);
    let player;
    let treasureTopDeck = CardManager.treasureDeck.getComponent(Deck).topBlankCard;
    for (let i = 0; i < cardsChosen.length; i++) {
      const cardChosen = cardsChosen[i];
      PlayerManager.getPlayerByCard(cardChosen).getComponent(
        Player
      );
      await player.destroyItem(cardChosen, true);
      await player.addItem(treasureTopDeck, true, true);
    }
    // player.getComponent(Player).playLootCard(cardPlayed, true);
    return serverEffectStack
  }
}
