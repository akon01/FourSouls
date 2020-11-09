import Character from "../../Entites/CardTypes/Character";
import Monster from "../../Entites/CardTypes/Monster";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "../../Constants";
import Effect from "./Effect";
import Card from "../../Entites/GameEntities/Card";
import EffectDescription from "../Effect Description";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DealDamageV2 extends EffectDescription {

  effectName = "DealDamageV2";

  @property({
    visible: function (this: DealDamageV2) {
      return !this.isGetDamageToDealFromDataCollector
    }
  })
  damageToDeal: number = 0;

  @property(cc.Boolean)
  isGetDamageToDealFromDataCollector: boolean = false

  @property(cc.Boolean)
  multipleTargets: boolean = false;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    debugger
    const damageToDeal = (this.isGetDamageToDealFromDataCollector) ? (data as PassiveEffectData).methodArgs[0] : this.damageToDeal
    if (this.multipleTargets) {
      let targets = data.getTargets(TARGETTYPE.PLAYER)
      if (targets.length == 0) { targets = data.getTargets(TARGETTYPE.MONSTER) }
      if (targets.length == 0) {
        throw new Error(`no targets`)
      }

      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];

        await this.hitAnEntity(target as cc.Node, damageToDeal)

      }

    } else {
      let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
      if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER); }
      if (targetEntity == null) {
        cc.log(`target is null`)
        return
      }

      await this.hitAnEntity(targetEntity as cc.Node, damageToDeal)
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

  async hitAnEntity(targetEntity: cc.Node, damageToDeal: number) {
    let entityComp;

    const thisCard = this._effectCard
    const damageDealer = CardManager.getCardOwner(thisCard)
    entityComp = targetEntity.getComponent(Character);
    //Entity is Monster
    if (entityComp == null) {
      entityComp = targetEntity.getComponent(Monster)
      if (entityComp instanceof Monster) {
        await entityComp.takeDamaged(this.damageToDeal, true, damageDealer)
      }
    } else {
      //Entity is Player
      if (entityComp instanceof Character) {

        await PlayerManager.getPlayerByCard(entityComp.node).takeDamage(this.damageToDeal, true, damageDealer)
      }
    }
  }
}
