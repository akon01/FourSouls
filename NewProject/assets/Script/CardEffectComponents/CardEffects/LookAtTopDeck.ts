import { TARGETTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";
import PlayerManager from "../../Managers/PlayerManager";
import Player from "../../Entites/GameEntities/Player";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtTopDeck extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;

  effectName = "LookAtTopDeck";

  @property(cc.Integer)
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
        if (deck.getCardsLength() > i) {
          cardsToSee.push(deck.getCards()[deck.getCardsLength() - i])// []);
          //now only log, do multiple card previews!
        }
      }
      await CardPreviewManager.getPreviews(cardsToSee, true)
      await PlayerManager.mePlayer.getComponent(Player).giveNextClick("Click Next When To Continue")
      await CardPreviewManager.removeFromCurrentPreviews(cardsToSee)
    }


    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
