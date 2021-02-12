import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass('PutTopCardOfDeckOnBottom')
export default class PutTopCardOfDeckOnBottom extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;

  effectName = "PutTopCardOfDeckOnBottom";


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
    if (data == null) {

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
    if (deck.getCardsLength() > 1) {
      const card = deck.getCards()[deck.getCardsLength() - 1]// []
      deck.drawSpecificCard(card, true)
      deck.addToDeckOnBottom(card, 0, true)
    }

    if (this.conditionsIdsFinal.length > 0) {
      return data;
    } else { return stack }
  }
}
