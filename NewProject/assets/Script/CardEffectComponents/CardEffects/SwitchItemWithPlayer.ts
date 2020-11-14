import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, EffectTarget, PassiveEffectData } from "../../Managers/DataInterpreter";
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
export default class SwitchItemWithPlayer extends Effect {

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

    const playersCards = data.getTargets(TARGETTYPE.PLAYER)

    const players = []
    for (let i = 0; i < playersCards.length; i++) {
      const playerCard = playersCards[i];
      if (playerCard instanceof cc.Node) {
        players.push(PlayerManager.getPlayerByCard(playerCard))
      }
    }

    const playerToGiveTo: Player = players[0]
    let playerToTakeFrom: Player;
    if (playerToGiveTo == null) {
      throw new Error(`one of the players is null`)
    } else {
      //taker chooses what to take
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
      cc.log(`card to steal is ${cardToTake.name}`)

      //p1 choose which loot to get.

      let cardToGive: cc.Node = null;
      if (this.isCardToGiveFromDataCollector) {
        cardToGive = data.getTarget(TARGETTYPE.ITEM) as cc.Node
      } else {
        chooseCard.otherPlayer = playerToGiveTo
        chooseCard.flavorText = "Choose Item To Give"
        targetCard = await chooseCard.collectData({ cardPlayerId: playerToGiveTo.playerId }) as EffectTarget
        cardToGive = targetCard.effectTargetCard
      }
      cc.log(`card to give is ${cardToGive.name}`)
      if (playerToTakeFrom == null || playerToTakeFrom == undefined) {
        playerToTakeFrom = PlayerManager.getPlayerByCard(cardToTake)
      }
      await playerToTakeFrom.loseItem(cardToTake, true)
      await playerToGiveTo.addItem(cardToTake, true, true)

      await playerToGiveTo.loseItem(cardToGive, true)

      await playerToTakeFrom.addItem(cardToGive, true, true)

    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
