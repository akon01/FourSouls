import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { ITEM_TYPE, TARGETTYPE } from "../Constants";
import Item from "../Entites/CardTypes/Item";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaBatteryEffect extends Effect {
  effectName = "MegaBatteryEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {

    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      throw new Error('no target')
    } else {
      let player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
      let itemsToRecharge = player.deskCards.filter(card => {
        let item = card.getComponent(Item)
        if ((item.type == ITEM_TYPE.ACTIVE || item.type == ITEM_TYPE.ACTIVE_AND_PASSIVE || item.type == ITEM_TYPE.ACTIVE_AND_PAID || item.type == ITEM_TYPE.ALL) && item.needsRecharge) {
          return true
        }
      })
      for (let i = 0; i < itemsToRecharge.length; i++) {
        const item = itemsToRecharge[i];
        await item.getComponent(Item).rechargeItem(true)

      }

      return stack
    }
  }
}
