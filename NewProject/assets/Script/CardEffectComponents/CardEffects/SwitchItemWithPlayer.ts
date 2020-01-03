import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChooseCard from "../DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SwtichItemWithPlayer extends Effect {

  effectName = "SwtichItemWithPlayer";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    let playersCards = data.getTargets(TARGETTYPE.PLAYER)

    let players = []
    for (let i = 0; i < playersCards.length; i++) {
      const playerCard = playersCards[i];
      if (playerCard instanceof cc.Node) {
        players.push(PlayerManager.getPlayerByCard(playerCard))
      }
    }
    let playerToTakeFrom: Player = players[0]
    let playerToGiveTo: Player = players[1]
    if (playerToGiveTo == null || playerToTakeFrom == null) {
      throw `one of the players is null`
    } else {
      let chooseCard = new ChooseCard();
      chooseCard.flavorText = "Choose Item To Take"
      //taker chooses what to take 
      chooseCard.chooseType = CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS
      let playerToTakeFromItems = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS, null, playerToTakeFrom)
      let chosenData = await chooseCard.requireChoosingACard(playerToTakeFromItems)

      let cardToTake = CardManager.getCardById(chosenData.cardChosenId, true)
      cc.log(`card to steal is ${cardToTake.name}`)


      //p1 choose which loot to get.  
      let playerToGiveToItems = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS, null, playerToGiveTo)
      chooseCard.flavorText = "Choose Item To Give"
      chosenData = await chooseCard.requireChoosingACard(playerToGiveToItems)
      let cardToGive = CardManager.getCardById(chosenData.cardChosenId, true)
      cc.log(`card to give is ${cardToGive.name}`)

      await playerToTakeFrom.loseItem(cardToTake, true)
      await playerToGiveTo.addItem(cardToTake, true, true)

      await playerToGiveTo.loseItem(cardToGive, true)

      await playerToTakeFrom.addItem(cardToGive, true, true)

    }

    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
