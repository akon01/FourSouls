import { Node, _decorator } from 'cc';
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { EffectRunner } from '../../Managers/EffectRunner';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { ChooseCard } from "../DataCollector/ChooseCard";
import { Effect } from "./Effect";
import { TakeLootFromPlayer } from "./TakeLootFromPlayer";
const { ccclass, property } = _decorator;



@ccclass('LookAtPlayerHand')
export class LookAtPlayerHand extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;
  effectName = "LookAtPlayerHand";
  @property
  multiTarget = false;
  @property
  isAlsoMayStealAChosenCard = false
  @property({ override: true })
  optionalFlavorText = ''
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
        throw new CardEffectTargetError(`No Target Players Found`, true, data, stack)
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
          throw new CardEffectTargetError(`No Target Player Found`, true, data, stack)
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

    const cardTarget = await chooseCard.collectData({ cardPlayerId: originalPlayer.playerId })


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
