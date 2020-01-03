import Card from "../../Entites/GameEntities/Card";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CARD_TYPE, CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";

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
    cc.log(data)
    const targets = data.getTargets(TARGETTYPE.CARD)
    const playerCard = targets[1]
    const cardToTake = targets[0]
    // const players = []
    // for (let i = 0; i < playersCards.length; i++) {
    //   const playerCard = playersCards[i];
    //   if (playerCard instanceof cc.Node) {
    //     players.push(playerCard)
    //   }
    // }
    // const playerToTakeFrom = players[0]
    const playerToGiveTo = PlayerManager.getPlayerByCard(playerCard as cc.Node)
    if (playerToGiveTo == null) {
      throw new Error(`player to give to is null`)
    } else {

      const playerToTakeFrom = PlayerManager.getPlayerByCard(cardToTake as cc.Node)
      // if (!(cardToTake && (cardToTake as cc.Node).getComponent(Card).type == CARD_TYPE.LOOT)) {
      //   const chooseCard = new ChooseCard();

      //   const playerHand = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND, null, playerToTakeFrom)
      //   const chosenData = await chooseCard.requireChoosingACard(playerHand)

      //   cardToTake = CardManager.getCardById(chosenData.cardChosenId, true)
      // }

      await playerToTakeFrom.loseLoot(cardToTake as cc.Node, true)

      await CardManager.moveCardTo(cardToTake as cc.Node, playerToGiveTo.hand.node, true, false)
      await playerToGiveTo.gainLoot(cardToTake as cc.Node, true)
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
