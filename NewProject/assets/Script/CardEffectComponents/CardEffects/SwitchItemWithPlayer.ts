import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChooseCard from "../DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import ChooseCardTypeAndFilter from "../ChooseCardTypeAndFilter";

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

    const playersCards = data.getTargets(TARGETTYPE.PLAYER)

    const players = []
    for (let i = 0; i < playersCards.length; i++) {
      const playerCard = playersCards[i];
      if (playerCard instanceof cc.Node) {
        players.push(PlayerManager.getPlayerByCard(playerCard))
      }
    }
    const playerToTakeFrom: Player = players[0]
    const playerToGiveTo: Player = players[1]
    if (playerToGiveTo == null || playerToTakeFrom == null) {
      throw new Error(`one of the players is null`)
    } else {
      const chooseCard = new ChooseCard();
      chooseCard.flavorText = "Choose Item To Take"
      //taker chooses what to take
      chooseCard.chooseType = new ChooseCardTypeAndFilter();
      chooseCard.otherPlayer = playerToTakeFrom
      chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS

      let targetCard = await chooseCard.collectData({ cardPlayerId: playerToGiveTo.playerId })
      // const playerToTakeFromItems = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS, null, playerToTakeFrom)
      // let chosenData = await chooseCard.requireChoosingACard(playerToTakeFromItems)

      const cardToTake = targetCard.effectTargetCard
      cc.log(`card to steal is ${cardToTake.name}`)

      //p1 choose which loot to get.
      chooseCard.otherPlayer = playerToGiveTo
      chooseCard.flavorText = "Choose Item To Give"
      targetCard = await chooseCard.collectData({ cardPlayerId: playerToGiveTo.playerId })
      const cardToGive = targetCard.effectTargetCard
      cc.log(`card to give is ${cardToGive.name}`)

      await playerToTakeFrom.loseItem(cardToTake, true)
      await playerToGiveTo.addItem(cardToTake, true, true)

      await playerToGiveTo.loseItem(cardToGive, true)

      await playerToTakeFrom.addItem(cardToGive, true, true)

    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
