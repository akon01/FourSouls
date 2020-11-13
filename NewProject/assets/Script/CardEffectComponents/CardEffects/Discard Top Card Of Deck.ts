import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardTopCardOfDeck extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;

  effectName = "DiscardTopCardOfDeck";

  @property
  multiType: boolean = false

  @property({
    type: [cc.Enum(CARD_TYPE)], visible: function (this: DiscardTopCardOfDeck) {
      if (this.multiType) {
        return true
      }
    }
  })
  deckTypes: CARD_TYPE[] = []

  @property({
    type: cc.Enum(CARD_TYPE), visible: function (this: DiscardTopCardOfDeck) {
      if (!this.multiType) {
        return true
      }
    }
  })
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
      if (this.multiType) {
        let decks = new Array<Deck>()
        for (const type of this.deckTypes) {
          switch (this.deckType) {
            case CARD_TYPE.LOOT:
              decks.push(CardManager.lootDeck.getComponent(Deck))
              break;
            case CARD_TYPE.MONSTER:
              decks.push(CardManager.monsterDeck.getComponent(Deck))
              break;
            case CARD_TYPE.TREASURE:
              decks.push(CardManager.treasureDeck.getComponent(Deck))
            default:
              break;
          }
        }
        for (const deck of decks) {
          await deck.discardTopCard()
        }

      } else {
        switch (this.deckType) {
          case CARD_TYPE.LOOT:
            await CardManager.lootDeck.getComponent(Deck).discardTopCard()
            break;
          case CARD_TYPE.MONSTER:
            await CardManager.monsterDeck.getComponent(Deck).discardTopCard()
            break;
          case CARD_TYPE.TREASURE:
            await CardManager.treasureDeck.getComponent(Deck).discardTopCard()
          default:
            break;
        }
      }

    } else {

      const decks = (data.getTargets(TARGETTYPE.DECK) as cc.Node[]).map(target => target.getComponent(Deck))
      for (const deck of decks) {
        await deck.discardTopCard()
      }

    }

    if (this.conditionsIds.length > 0) {
      return data;
    } else { return stack }
  }


}
