import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { CardManager } from "../../Managers/CardManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { EffectTarget } from '../../Managers/EffectTarget';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { ChooseCard } from "../DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
import { Stack } from "../../Entites/Stack";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('SwitchLootWithPlayer')
export class SwitchLootWithPlayer extends Effect {
  effectName = "SwitchLootWithPlayer";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const playersCards = data.getTargets(TARGETTYPE.PLAYER)
    const players = []
    for (let i = 0; i < playersCards.length; i++) {
      const playerCard = playersCards[i];
      if (playerCard instanceof Node) {
        players.push(WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard))
      }
    }
    const playerToTakeFrom = players[0]
    const playerToGiveTo = players[1]
    if (playerToGiveTo == null || playerToTakeFrom == null) {
      throw new Error(`one of the players is null`)
    } else {
      const chooseCard = new ChooseCard();
      chooseCard.flavorText = "Choose Loot To Give"
      // p1 choose witch loot to give
      chooseCard.chooseType = new ChooseCardTypeAndFilter();
      chooseCard.otherPlayer = playerToGiveTo
      chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND

      let targetCard = await chooseCard.collectData({ cardPlayerId: playerToGiveTo.playerId })
      // const playerToGiveToHand = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND, null, playerToGiveTo)
      // let chosenData = await chooseCard.requireChoosingACard(playerToGiveToHand)

      const cardToGive = (targetCard as EffectTarget).effectTargetCard
      console.log(`card to give is ${cardToGive.name}`)

      // p1 choose which loot to get.
      chooseCard.otherPlayer = playerToTakeFrom
      // const playerToTakeFromHand = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND, null, playerToTakeFrom)
      chooseCard.flavorText = "Choose Loot To Take"
      targetCard = await chooseCard.collectData({ cardPlayerId: playerToGiveTo.playerId })
      // chosenData = await chooseCard.requireChoosingACard(playerToTakeFromHand)
      const cardToTake = (targetCard as EffectTarget).effectTargetCard
      console.log(`card to take is ${cardToTake.name}`)

      await playerToGiveTo.loseLoot(cardToGive, true)

      await WrapperProvider.cardManagerWrapper.out.moveCardTo(cardToGive, playerToTakeFrom.hand!.node, true, false)
      await playerToTakeFrom.gainLoot(cardToGive, true)

      await playerToTakeFrom.loseLoot(cardToTake, true)

      await WrapperProvider.cardManagerWrapper.out.moveCardTo(cardToTake, playerToGiveTo.hand!.node, true, false)
      await playerToGiveTo.gainLoot(cardToTake, true)
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
