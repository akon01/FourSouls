import Character from "../../Entites/CardTypes/Character";
import Monster from "../../Entites/CardTypes/Monster";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PreventDamage extends Effect {

  effectName = "PreventDamage";

  @property(cc.Integer)
  damageToPrevent: number = 0;

  @property
  multipleTargets: boolean = false;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {


    let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
    if (targetEntity == null) targetEntity = data.getTarget(TARGETTYPE.MONSTER);
    if (targetEntity == null) {
      cc.log(`target is null`)
      return
    }

    await this.giveDmgProtection(targetEntity as cc.Node)


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }

  async giveDmgProtection(targetEntity: cc.Node) {
    let entityComp;
    entityComp = targetEntity.getComponent(Character);
    //Entity is Monster
    if (entityComp == null) {
      entityComp = targetEntity.getComponent(Monster)
      if (entityComp instanceof Monster) {
        await entityComp.addDamagePrevention(this.damageToPrevent, true)
      }
    } else {
      //Entity is Player
      if (entityComp instanceof Character) {
        await PlayerManager.getPlayerByCard(entityComp.node).addDamagePrevention(this.damageToPrevent, true)
      }
    }
  }
}
