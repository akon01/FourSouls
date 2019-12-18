import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeItems extends Effect {
  effectName = "RechargeItems";




  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    //let targetItemsId: number[] = data.targets;
    let cardPlayer: Player;
    let itemsToRecharge = data.getTargets(TARGETTYPE.ITEM)

    if (itemsToRecharge.length == 0) {
      cc.log(`no items to recharge`)
    } else {

      for (let i = 0; i < itemsToRecharge.length; i++) {
        const item = itemsToRecharge[i];
        if (item instanceof cc.Node) {
          cardPlayer = PlayerManager.getPlayerByCard(item);
          await cardPlayer.rechargeItem(item, true)
        }
      }
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
