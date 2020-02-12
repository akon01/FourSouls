import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";
import PlayerManager from "../../Managers/PlayerManager";
import Player from "../../Entites/GameEntities/Player";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtTopDeckAndPutOnTop extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;

  effectName = "LookAtTopDeckAndPutOnTop";

  @property(Number)
  numOfCardsToSee: number = 0;

  @property(Number)
  numOfCardsToPut: number = 0;

  @property
  isReorderOptional: boolean = false;

  @property({
    override: true, visible: function (this: LookAtTopDeckAndPutOnTop) {
      if (this.isReorderOptional) {
        return true
      }
    }
  })
  optionalFlavorText: string = ''

  @property
  putOnBottomOfDeck: boolean = false;

  @property({ type: cc.Enum(CARD_TYPE) })
  deckType: CARD_TYPE = CARD_TYPE.CHAR;
  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    let deck: Deck;
    if (this.dataCollector instanceof Array && this.dataCollector.length < 0 || this.dataCollector == null) {
      switch (this.deckType) {
        case CARD_TYPE.LOOT:
          deck = CardManager.lootDeck.getComponent(Deck)
          break;
        case CARD_TYPE.MONSTER:
          deck = CardManager.monsterDeck.getComponent(Deck)
          break;
        case CARD_TYPE.TREASURE:
          deck = CardManager.treasureDeck.getComponent(Deck)
        default:
          break;
      }
    } else {

      deck = (data.getTarget(TARGETTYPE.DECK) as cc.Node).getComponent(Deck)
    }
    const cardsToSee = [];
    for (let i = 0; i < this.numOfCardsToSee; i++) {
      if (deck._cards.length > i) {
        const card = deck._cards.getCard(deck._cards.length - 1 - i)// []
        cardsToSee.push(card);
      }
    }

    let text = "Order Cards To Put On"
    this.putOnBottomOfDeck == true ? text = text + ` Bottom` : text = text + ` Top`

    await CardPreviewManager.getPreviews(cardsToSee, true)
    let doEffect = true
    if (this.isReorderOptional) {
      const choice = PlayerManager.mePlayer.getComponent(Player).giveYesNoChoice(`Do You Want To Reorder the Cards?`)
    }
    const selectedQueue = await CardPreviewManager.selectFromCards(cardsToSee, this.numOfCardsToPut)

    // selectedQueue.forEach(card => {
    //   deck.drawSpecificCard(card, true)
    // })

    if (!this.putOnBottomOfDeck) {
      for (let i = 0; i < selectedQueue.length; i++) {
        const selectedCard = selectedQueue[selectedQueue.length - i - 1];
        deck.addToDeckOnTop(selectedCard, true)
      }
      let notSelectedCards: cc.Node[] = [];
      notSelectedCards = cardsToSee.filter(card => !selectedQueue.includes(card))
      for (let i = 0; i < notSelectedCards.length; i++) {
        const card = notSelectedCards[i];
        deck.addToDeckOnBottom(card, true)
        // await PileManager.addCardToPile(this.deckType, card, true)
      }
    } else {
      for (let i = 0; i < selectedQueue.length; i++) {
        const selectedCard = selectedQueue[i];
        deck.addToDeckOnBottom(selectedCard, true)
      }
      let notSelectedCards: cc.Node[] = [];
      notSelectedCards = cardsToSee.filter(card => !selectedQueue.includes(card))
      for (let i = 0; i < notSelectedCards.length; i++) {
        const card = notSelectedCards[i];
        deck.addToDeckOnTop(card, true)
        // await PileManager.addCardToPile(this.deckType, card, true)
      }
    }

    if (this.conditions.length > 0) {
      return data;
    } else { return stack }
  }
}
