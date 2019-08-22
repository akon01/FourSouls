import CardManager from "../../Managers/CardManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardAndDrawLoot extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "DiscardAndDrawLoot";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {

    let cardChosen = data.getTarget(TARGETTYPE.CARD)
    if (cardChosen == null) {
      cc.log(`target card is null`)
    } else {
      if (cardChosen instanceof cc.Node) {
        let player = PlayerManager.getPlayerByCard(cardChosen)
        // player.getComponent(Player).playLootCard(cardPlayed, true);
        await player.discardLoot(cardChosen, true);
        await player.drawCard(CardManager.lootDeck, true);
      }
    }

    return stack
  }
}
