import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Stack from "../../Entites/Stack";

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
    data?: ActiveEffectData | PassiveEffectData
  ) {

    let cardChosen = data.getTargets(TARGETTYPE.CARD)
    cc.log(cardChosen)
    if (cardChosen == null) {
      //cc.log(`target card is null`)
    } else {
      if (cardChosen instanceof cc.Node) {
        let player = PlayerManager.getPlayerByCard(cardChosen)
        // player.getComponent(Player).playLootCard(cardPlayed, true);
        await player.discardLoot(cardChosen, true);
        await player.drawCard(CardManager.lootDeck, true);
      } else {
        if (cardChosen instanceof Array) {
          for (let i = 0; i < cardChosen.length; i++) {
            const card = cardChosen[i];
            let player = PlayerManager.getPlayerByCard(card as cc.Node)
            // player.getComponent(Player).playLootCard(cardPlayed, true);
            await player.discardLoot(card as cc.Node, true);
            await player.drawCard(CardManager.lootDeck, true);
          }
        }
      }
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
