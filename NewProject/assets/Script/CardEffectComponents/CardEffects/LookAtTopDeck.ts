import { TARGETTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtTopDeck extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;

  effectName = "LookAtTopDeck";

  @property(Number)
  numOfCards: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    let deckNode = data.getTarget(TARGETTYPE.DECK)
    let deck: Deck
    if (deckNode instanceof cc.Node) {
      deck = deckNode.getComponent(
        Deck
      );
    }

    if (deck == null) {
      cc.log(`no deck`)
    } else {
      let cardsToSee: cc.Node[] = [];
      for (let i = 1; i <= this.numOfCards; i++) {
        if (deck._cards.length > i) {
          cardsToSee.push(deck._cards.getCard(deck._cards.length - i))// []);
          //now only log, do multiple card previews!
        }
      }
      cc.log(cardsToSee.map(card => card.name))
      CardPreviewManager.getPreviews(cardsToSee, true)
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
