import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData, EffectTarget, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";
import TakeLootFromPlayer from "./TakeLootFromPlayer";
import ChooseCard from "../DataCollector/ChooseCard";
import CardManager from "../../Managers/CardManager";
import Card from "../../Entites/GameEntities/Card";
import ChooseCardTypeAndFilter from "../ChooseCardTypeAndFilter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtPlayerHand extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;

  effectName = "LookAtPlayerHand";

  @property
  multiTarget: boolean = false;

  @property
  isAlsoMayStealAChosenCard: boolean = false

  @property({ override: true })
  optionalFlavorText: string = ''

  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    const originalPlayer = PlayerManager.getPlayerByCard(data.effectCardPlayer)
    if (this.multiTarget) {
      const playersCards = data.getTargets(TARGETTYPE.PLAYER)
      if (!(playersCards != null && playersCards.length > 0)) {
        throw new Error(`no targets`)
      } else {
        const players = (playersCards as cc.Node[]).map(card => PlayerManager.getPlayerByCard(card))
        for (let i = 0; i < players.length; i++) {
          const player = players[i];
          const playerHandCards = player.getHandCards();
          playerHandCards.forEach(card => card.getComponent(Card).flipCard(false))
          await CardPreviewManager.getPreviews(playerHandCards, true)
          if (this.isAlsoMayStealAChosenCard) {
            await this.stealACardFromPlayer(player, originalPlayer)
          }
          await originalPlayer.giveNextClick(this.optionalFlavorText)
          playerHandCards.forEach(card => card.getComponent(Card).flipCard(false))
          await CardPreviewManager.removeFromCurrentPreviews(playerHandCards)
        }
      }
    } else {

      const playerCard = data.getTarget(TARGETTYPE.PLAYER)
      if (playerCard instanceof cc.Node) {
        const player: Player = PlayerManager.getPlayerByCard(playerCard)
        if (player == null) {
          throw new Error("No Target Found")
        } else {
          const playerHandCards = player.getHandCards();
          const cardsToSee: cc.Node[] = playerHandCards
          playerHandCards.forEach(card => card.getComponent(Card).flipCard(false))
          await CardPreviewManager.getPreviews(cardsToSee, true)
          if (this.isAlsoMayStealAChosenCard) {
            await this.stealACardFromPlayer(player, originalPlayer)
          }
          playerHandCards.forEach(card => card.getComponent(Card).flipCard(false))
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

  async stealACardFromPlayer(player: Player, originalPlayer: Player) {
    const steal = new TakeLootFromPlayer();
    const chooseCard = new ChooseCard();
    chooseCard.otherPlayer = player;
    chooseCard.chooseType = new ChooseCardTypeAndFilter();
    chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND
    chooseCard.flavorText = "Choose A Card To Steal"

    let cardTarget = await chooseCard.collectData({ cardPlayerId: originalPlayer.playerId })


    // const cards = await chooseCard.getCardsToChoose(CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_HAND, originalPlayer, player)
    // const chosenData = await chooseCard.requireChoosingACard(cards)
    //const chosenCard = cardTarget.effectTargetCard
    const data = new ActiveEffectData()
    data.addTarget(cardTarget)
    data.addTarget(new EffectTarget(originalPlayer.character))
    await steal.doEffect(null, data)


  }
}
