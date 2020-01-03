import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RerollItems extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "RerollItems";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    const cardsChosen = data.getTargets(TARGETTYPE.ITEM);
    let player: Player;
    const treasureDeck = CardManager.treasureDeck;
    if (cardsChosen.length == 0) {
      cc.log(`no items to reroll`)
    } else {
      for (let i = 0; i < cardsChosen.length; i++) {
        const cardChosen = cardsChosen[i];
        if (cardChosen instanceof cc.Node) {
          PlayerManager.getPlayerByCard(cardChosen).getComponent(
            Player
          );
          await player.destroyItem(cardChosen, true);
          await player.addItem(treasureDeck, true, true);
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
