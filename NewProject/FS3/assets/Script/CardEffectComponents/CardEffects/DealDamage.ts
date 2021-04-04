import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { Character } from "../../Entites/CardTypes/Character";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Stack } from "../../Entites/Stack";
import { CardManager } from "../../Managers/CardManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('DealDamage')
export class DealDamage extends Effect {
  effectName = "DealDamage";
  @property({
    visible: function (this: DealDamage) {
      return !this.isGetDamageToDealFromDataCollector
    }
  })
  damageToDeal: number = 0;
  @property
  isGetDamageToDealFromDataCollector: boolean = false
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
    const damageToDeal = (this.isGetDamageToDealFromDataCollector) ? (data as PassiveEffectData).methodArgs[0] : this.damageToDeal
    if (!data) { debugger; throw new Error("No Data!"); }
    if (this.multipleTargets) {
      let targets = data.getTargets(TARGETTYPE.PLAYER) ?? []
      const monsterTargets = data.getTargets(TARGETTYPE.MONSTER)
      if (monsterTargets.length > 0) {
        //@ts-ignore
        targets.push(monsterTargets.filter((mt: any) => mt != null))
      }
      //    if (targets.length == 0) { targets = data.getTargets(TARGETTYPE.MONSTER) }
      if (targets.length == 0) {
        throw new Error(`no targets`)
      }

      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];

        await this.hitAnEntity(target as Node, damageToDeal)

      }

    } else {
      let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
      if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER); }
      if (targetEntity == null) {
        console.log(`target is null`)
        throw new Error("Target Entity Is Null");

      }

      await this.hitAnEntity(targetEntity as Node, damageToDeal)
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
  async hitAnEntity(targetEntity: Node, damageToDeal: number) {
    let entityComp;

    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const damageDealer = WrapperProvider.cardManagerWrapper.out.getCardOwner(thisCard)!
    entityComp = targetEntity.getComponent(Character);
    // Entity is Monster
    if (entityComp == null) {
      entityComp = targetEntity.getComponent(Monster)
      if (entityComp instanceof Monster) {
        await entityComp.takeDamaged(this.damageToDeal, true, damageDealer)
      }
    } else {
      // Entity is Player
      if (entityComp instanceof Character) {

        await WrapperProvider.playerManagerWrapper.out.getPlayerByCard(entityComp.node)!.takeDamage(this.damageToDeal, true, damageDealer)
      }
    }
  }
}
