import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DeactivateItem extends Effect {
  effectName = "DeactivateItem";

  @property
  isMulti: boolean = false;

  chooseType: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ITEMS;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    cc.log(data)
    if (this.isMulti) {
      const targetItems = data.getAllTargets()
      if (targetItems.nodes.length == 0) {
        throw new Error(`No Targets Found`)
      }
      for (let i = 0; i < targetItems.nodes.length; i++) {
        const target = targetItems.nodes[i];
        await this.deactivateItem(target)
      }
    } else {
      let targetItem: cc.Node
      targetItem = data.getTarget(TARGETTYPE.ITEM) as cc.Node;
      if (targetItem == null) {
        targetItem = data.getTarget(TARGETTYPE.PLAYER) as cc.Node
        if (targetItem == null) {
          throw new Error(`no item to recharge`)
        }
      }
      await this.deactivateItem(targetItem);
    }



    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

  private async deactivateItem(targetItem: any) {
    const cardPlayer = PlayerManager.getPlayerByCard(targetItem);
    await cardPlayer.deactivateItem(targetItem, true);
  }
}
