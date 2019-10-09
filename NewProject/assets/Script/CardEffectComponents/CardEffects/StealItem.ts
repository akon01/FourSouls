import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Store from "../../Entites/GameEntities/Store";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StealItem extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;

  effectName = "StealItem";



  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    cc.log(data)
    let stealer = PlayerManager.getPlayerByCard(data.effectCardPlayer)
    let itemToSteal = data.getTarget(TARGETTYPE.ITEM)
    if (itemToSteal instanceof cc.Node) {
      if (itemToSteal == null) {
        cc.log(`no target player available`)
      } else {
        let player = PlayerManager.getPlayerByCard(itemToSteal)
        if (player != null) {
          player.loseItem(itemToSteal)
          await stealer.addItem(itemToSteal, true, true)
        } else {
          await Store.$.buyItemFromShop(itemToSteal, true)
          await stealer.addItem(itemToSteal, true, true)
        }
      }
    }

    if (data instanceof PassiveEffectData) return data
    return stack;
  }
}
