import Card from "../../Entites/GameEntities/Card";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChooseCard from "../DataCollector/ChooseCard";
import { CARD_TYPE, CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";


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
    data?: ActiveEffectData | PassiveEffectData
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
      let cardToTake = data.getTarget(TARGETTYPE.CARD)
      if (!(cardToTake && (cardToTake as cc.Node).getComponent(Card).type == CARD_TYPE.LOOT)) {
        let chooseCard = new ChooseCard();

        let playerHand = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND, null, playerToTakeFrom)
        let chosenData = await chooseCard.requireChoosingACard(playerHand)

        cardToTake = CardManager.getCardById(chosenData.cardChosenId, true)
      }

      await playerToTakeFrom.loseLoot(cardToTake, true)

      await CardManager.moveCardTo(cardToTake as cc.Node, playerToGiveTo.hand.node, true, false)
      await playerToGiveTo.gainLoot(cardToTake, true)
    }

    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
