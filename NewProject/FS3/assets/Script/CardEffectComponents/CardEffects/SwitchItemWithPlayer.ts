import { _decorator, log, Node } from 'cc';
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
import { Player } from "../../Entites/GameEntities/Player";
import { Stack } from "../../Entites/Stack";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('SwitchItemWithPlayer')
export class SwitchItemWithPlayer extends Effect {
  effectName = "SwitchItemWithPlayer";
  @property
  isCardToGiveFromDataCollector: boolean = false
  @property
  isSpecificPlayerToSwitchWith: boolean = false
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
        players.push(WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!)
      }
    }
    const playerToGiveTo: Player = players[0]
    let playerToTakeFrom: Player | null = null;
    if (playerToGiveTo == null) {
      throw new Error(`one of the players is null`)
    } else {
      // taker chooses what to take
      const chooseCard = new ChooseCard();
      chooseCard.chooseType = new ChooseCardTypeAndFilter();
      if (this.isSpecificPlayerToSwitchWith) {
        playerToTakeFrom = players[1]
        if (!playerToTakeFrom) {
          throw new Error("player to take from is null when said specific")
        }
        chooseCard.otherPlayer = playerToTakeFrom
        chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS
      } else {
        chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.OTHER_PLAYERS_NON_ETERNAL_ITEMS
      }
      chooseCard.flavorText = "Choose Item To Take"
      let targetCard = await chooseCard.collectData({ cardPlayerId: playerToGiveTo.playerId }) as EffectTarget
      // const playerToTakeFromItems = chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS, null, playerToTakeFrom)
      const cardToTake = targetCard.effectTargetCard
      log(`card to steal is ${cardToTake.name}`)

      // p1 choose which loot to get.

      let cardToGive: Node | null = null;
      if (this.isCardToGiveFromDataCollector) {
        cardToGive = data.getTarget(TARGETTYPE.ITEM) as Node
      } else {
        chooseCard.otherPlayer = playerToGiveTo
        chooseCard.flavorText = "Choose Item To Give"
        targetCard = await chooseCard.collectData({ cardPlayerId: playerToGiveTo.playerId }) as EffectTarget
        cardToGive = targetCard.effectTargetCard
      }
      log(`card to give is ${cardToGive.name}`)
      if (playerToTakeFrom == null || playerToTakeFrom == undefined) {
        playerToTakeFrom = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardToTake)
      }
      if (!playerToTakeFrom) { debugger; throw new Error("No Player To Take From"); }

      await playerToTakeFrom.loseItem(cardToTake, true)
      await playerToGiveTo.addItem(cardToTake, true, true)

      await playerToGiveTo.loseItem(cardToGive, true)

      await playerToTakeFrom.addItem(cardToGive, true, true)

    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
