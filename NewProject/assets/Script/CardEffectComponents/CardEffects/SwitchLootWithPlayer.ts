import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChooseCard from "../DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SwtichLootWithPlayer extends Effect {

  effectName = "SwtichLootWithPlayer";

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
    let playerToTakeFrom = players[0]
    let playerToGiveTo = players[1]
    if (playerToGiveTo == null || playerToTakeFrom == null) {
      throw `one of the players is null`
    } else {
      let chooseCard = new ChooseCard();
      //p1 choose witch loot to give
      chooseCard.chooseType = CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND
      let playerToGiveToHand = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND, null, playerToGiveTo)
      let chosenData = await chooseCard.requireChoosingACard(playerToGiveToHand)

      let cardToGive = CardManager.getCardById(chosenData.cardChosenId, true)
      cc.log(`card to give is ${cardToGive.name}`)


      //p1 choose which loot to get.  
      let playerToTakeFromHand = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND, null, playerToTakeFrom)
      chosenData = await chooseCard.requireChoosingACard(playerToTakeFromHand)
      let cardToTake = CardManager.getCardById(chosenData.cardChosenId, true)
      cc.log(`card to take is ${cardToTake.name}`)

      await playerToGiveTo.loseLoot(cardToGive, true)

      await CardManager.moveCardTo(cardToGive, playerToTakeFrom.hand.node, true, false)
      await playerToTakeFrom.gainLoot(cardToGive, true)

      await playerToTakeFrom.loseLoot(cardToTake, true)

      await CardManager.moveCardTo(cardToTake, playerToGiveTo.hand.node, true, false)
      await playerToGiveTo.gainLoot(cardToTake, true)
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
