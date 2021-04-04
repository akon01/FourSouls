import { _decorator, CCInteger, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE, CHOOSE_CARD_TYPE } from "../../Constants";
import { Deck } from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";

import { Effect } from "./Effect";
import { Player } from "../../Entites/GameEntities/Player";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('LookAtTopDeck')
export class LookAtTopDeck extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;
  effectName = "LookAtTopDeck";
  @property(CCInteger)
  numOfCards: number = 0;

  @property
  isRevealToAllPlayers: boolean = false

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
    let deckNode = data.getTarget(TARGETTYPE.DECK)
    let deck: Deck | null = null
    if (deckNode instanceof Node) {
      deck = deckNode.getComponent(Deck)!;
    }
    if (deck == null) {
      console.log(`no deck`)
    } else {
      let cardsToSee: Node[] = [];
      for (let i = 1; i <= this.numOfCards; i++) {
        if (deck.getCardsLength() > i) {
          cardsToSee.push(deck.getCards()[deck.getCardsLength() - i])// []);
          // now only log, do multiple card previews!
        }
      }
      const cardPreviewManager = WrapperProvider.cardPreviewManagerWrapper.out;
      await cardPreviewManager.getPreviews(cardsToSee, true)
      if (this.isRevealToAllPlayers) {
        cardPreviewManager.showToOtherPlayers(cardsToSee)
      }
      await WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.giveNextClick("Click Next When To Continue")
      await cardPreviewManager.removeFromCurrentPreviews(cardsToSee)
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
