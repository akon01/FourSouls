import { CCInteger, Enum, Node, _decorator } from 'cc';
import { CARD_TYPE, CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Deck } from "../../Entites/GameEntities/Deck";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;




@ccclass('LookAtTopDeckAndPutOnTop')
export class LookAtTopDeckAndPutOnTop extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;
  effectName = "LookAtTopDeckAndPutOnTop";
  @property(CCInteger)
  numOfCardsToSee = 0;
  @property(CCInteger)
  numOfCardsToPut = 0;
  @property
  isReorder = false;
  @property
  isReorderOptional = false;
  @property({
    override: true, visible: function (this: LookAtTopDeckAndPutOnTop) {
      return this.isReorderOptional

    }
  })
  optionalFlavorText = ''
  @property
  putOnBottomOfDeck = false;
  @property({ type: Enum(CARD_TYPE) })
  deckType: CARD_TYPE = CARD_TYPE.CHAR;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    let deck: Deck | null = null;
    const dataCollectors = this.getDataCollectors();
    if (dataCollectors instanceof Array && dataCollectors.length < 0 || dataCollectors == null) {
      switch (this.deckType) {
        case CARD_TYPE.LOOT:
          deck = WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)
          break;
        case CARD_TYPE.MONSTER:
          deck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)
          break;
        case CARD_TYPE.TREASURE:
          deck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)
          break
        default:
          break;
      }
    } else {
      if (!data) { debugger; throw new Error("No Data"); }
      const deckTarget = data.getTarget(TARGETTYPE.DECK) as Node | null;
      if (!deckTarget) {
        throw new CardEffectTargetError(`No Deck Target Found`, true, data, stack)
      }
      deck = deckTarget.getComponent(Deck)
    }
    const cardsToSee: Node[] = [];
    if (!deck) { debugger; throw new Error("No Deck Found!"); }

    const deckCards = deck.getCards();
    const playerComp = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!;
    const numOfCardsToSee = this.getQuantityInRegardsToBlankCard(playerComp.node, this.numOfCardsToSee)
    const numOfCardsToPut = this.getQuantityInRegardsToBlankCard(playerComp.node, this.numOfCardsToPut)
    for (let i = 0; i < numOfCardsToSee; i++) {
      if (deck.getCardsLength() > i) {
        cardsToSee.push(deckCards[deck.getCardsLength() - 1 - i])
      }
    }
    let text = "Order Cards To Put On"
    this.putOnBottomOfDeck == true ? text = text + ` Bottom` : text = text + ` Top`
    await WrapperProvider.cardPreviewManagerWrapper.out.getPreviews(cardsToSee, true)
    await playerComp!.giveNextClick("Click Next To Continue")
    //await WrapperProvider.cardPreviewManagerWrapper.out.removeFromCurrentPreviews(cardsToSee)
    let selectedQueue: Node[] = []
    if (this.isReorderOptional) {

      const choice = await playerComp!.giveYesNoChoice(`Do You Want To Reorder the Cards?`)
      if (choice) {
        selectedQueue = await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(cardsToSee, numOfCardsToPut)
      }
    } else if (numOfCardsToPut == 1) {
      selectedQueue = await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(cardsToSee, numOfCardsToPut)
    } else if (this.isReorder) {
      selectedQueue = await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(cardsToSee, numOfCardsToPut)
    } else {
      selectedQueue = cardsToSee
    }
    for (const selectedCard of selectedQueue) {
      deck.removeCard(selectedCard)
    }
    if (!this.putOnBottomOfDeck) {
      for (let i = 0; i < selectedQueue.length; i++) {
        const selectedCard = selectedQueue[selectedQueue.length - i - 1];
        deck.addToDeckOnTop(selectedCard, 0, true)
      }
      let notSelectedCards: Node[] = [];
      notSelectedCards = cardsToSee.filter(card => !(selectedQueue.indexOf(card) >= 0))
      for (let i = 0; i < notSelectedCards.length; i++) {
        const card = notSelectedCards[i];
        deck.addToDeckOnBottom(card, 0, true)
        // await WrapperProvider.pileManagerWrapper.out.addCardToPile(this.deckType, card, true)
      }
    } else {
      for (let i = 0; i < selectedQueue.length; i++) {
        const selectedCard = selectedQueue[i];
        deck.addToDeckOnBottom(selectedCard, 0, true)
      }
      let notSelectedCards: Node[] = [];
      notSelectedCards = cardsToSee.filter(card => !(selectedQueue.indexOf(card) >= 0))
      for (let i = 0; i < notSelectedCards.length; i++) {
        const card = notSelectedCards[i];
        deck.addToDeckOnTop(card, 0, true)
        await WrapperProvider.pileManagerWrapper.out.addCardToPile(this.deckType, card, true)
      }
    }
    if (this.conditions.length > 0) {
      return data!;
    } else { return stack }
  }
}
