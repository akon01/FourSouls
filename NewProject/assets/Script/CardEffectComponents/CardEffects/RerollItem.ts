import Deck from "../../Entites/GameEntities/Deck";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RerollItem extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "RerollItem";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    let cardChosen = data.getTarget(TARGETTYPE.ITEM)
    if (cardChosen == null) {
      cc.log(`no item to reroll`)
    } else {
      if (cardChosen instanceof cc.Node) {
        let player = PlayerManager.getPlayerByCard(cardChosen)
        await player.destroyItem(cardChosen, true);
        let treasureTopDeck = CardManager.treasureDeck.getComponent(Deck).topBlankCard;
        await player.addItem(treasureTopDeck, true, true);
      }
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
