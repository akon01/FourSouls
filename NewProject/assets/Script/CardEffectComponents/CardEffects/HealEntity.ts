import Character from "../../Entites/CardTypes/Character";
import Monster from "../../Entites/CardTypes/Monster";
import BattleManager from "../../Managers/BattleManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import CardManager from "../../Managers/CardManager";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HealEntity extends Effect {

  effectName = "HealEntity";

  @property
  hpToHeal: number = 0


  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
    if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER) }

    if (targetEntity == null) {
      cc.log('no target entity to kill')
    } else {
      let entityComp;
      entityComp = (targetEntity as cc.Node).getComponent(Character);
      let owner = CardManager.getCardOwner(this.node.parent)
      if (entityComp == null) {
        entityComp = (targetEntity as cc.Node).getComponent(Monster)
        await (targetEntity as cc.Node).getComponent(Monster).heal(this.hpToHeal, true)
      } else {
        if (entityComp instanceof Character) {
          await PlayerManager.getPlayerByCard(entityComp.node).heal(this.hpToHeal, true)
        }
      }
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
