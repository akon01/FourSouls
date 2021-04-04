import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE, CHOOSE_CARD_TYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";

import { Effect } from "./Effect";
import { TakeLootFromPlayer } from "./TakeLootFromPlayer";
import { ChooseCard } from "../DataCollector/ChooseCard";
import { Card } from "../../Entites/GameEntities/Card";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { EffectTarget } from '../../Managers/EffectTarget';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { EffectRunner } from '../../Managers/EffectRunner';
import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';

@ccclass('LookAtPlayerHand')
export class LookAtPlayerHand extends Effect {
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
    if (!data) { debugger; throw new Error("No Data"); }
    const originalPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(data.effectCardPlayer!)!
    if (this.multiTarget) {
      const playersCards = data.getTargets(TARGETTYPE.PLAYER)
      if (!(playersCards != null && playersCards.length > 0)) {
        throw new Error(`no targets`)
      } else {
        const players = (playersCards as Node[]).map(card => WrapperProvider.playerManagerWrapper.out.getPlayerByCard(card)!)
        for (let i = 0; i < players.length; i++) {
          const player = players[i];
          const playerHandCards = player.getHandCards();
          playerHandCards.forEach(card => card.getComponent(Card)!.flipCard(false))
          await WrapperProvider.cardPreviewManagerWrapper.out.getPreviews(playerHandCards, true)
          if (this.isAlsoMayStealAChosenCard) {
            await this.stealACardFromPlayer(player, originalPlayer)
          }
          await originalPlayer.giveNextClick(this.optionalFlavorText)
          playerHandCards.forEach(card => card.getComponent(Card)!.flipCard(false))
          await WrapperProvider.cardPreviewManagerWrapper.out.removeFromCurrentPreviews(playerHandCards)
        }
      }
    } else {

      const playerCard = data.getTarget(TARGETTYPE.PLAYER)
      if (playerCard instanceof Node) {
        const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!
        if (player == null) {
          throw new Error("No Target Found")
        } else {
          const playerHandCards = player.getHandCards();
          const cardsToSee: Node[] = playerHandCards
          playerHandCards.forEach(card => card.getComponent(Card)!.flipCard(false))
          await WrapperProvider.cardPreviewManagerWrapper.out.getPreviews(cardsToSee, true)
          if (this.isAlsoMayStealAChosenCard) {
            await this.stealACardFromPlayer(player, originalPlayer)
          }
          playerHandCards.forEach(card => card.getComponent(Card)!.flipCard(false))
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
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
    // const chosenCard = cardTarget.effectTargetCard
    const data = new ActiveEffectData()
    data.addTarget(cardTarget)
    data.addTarget(WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(originalPlayer.character!))
    await EffectRunner.runEffect(steal, [], data)
    //  await steal.doEffect([], data)


  }
}
