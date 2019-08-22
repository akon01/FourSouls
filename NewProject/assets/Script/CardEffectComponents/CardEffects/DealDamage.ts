import Character from "../../Entites/CardTypes/Character";
import Monster from "../../Entites/CardTypes/Monster";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DealDamage extends Effect {

  effectName = "DealDamage";

  @property(cc.Integer)
  damageToDeal: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {

    let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
    if (targetEntity == null) targetEntity = data.getTarget(TARGETTYPE.MONSTER);
    if (targetEntity == null) {
      cc.log(`target is null`)
    } else {
      let entityComp;
      entityComp = targetEntity.getComponent(Character);
      //Entity is Monster
      if (entityComp == null) {
        entityComp = targetEntity.getComponent(Monster)
        if (entityComp instanceof Monster) {
          await entityComp.getDamaged(this.damageToDeal, true)
        }
      } else {
        //Entity is Player
        if (entityComp instanceof Character) {
          await PlayerManager.getPlayerByCard(entityComp.node).getHit(this.damageToDeal, true)
        }
      }
    }



    return stack
  }
}
