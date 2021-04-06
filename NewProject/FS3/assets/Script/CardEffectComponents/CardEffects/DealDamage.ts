import { Node, _decorator } from 'cc';
import { Character } from "../../Entites/CardTypes/Character";
import { Monster } from "../../Entites/CardTypes/Monster";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('DealDamage')
export class DealDamage extends Effect {
  effectName = "DealDamage";
  @property({
    visible: function (this: DealDamage) {
      return !this.isGetDamageToDealFromDataCollector
    }
  })
  damageToDeal = 0;
  @property
  isGetDamageToDealFromDataCollector = false
  @property
  multipleTargets = false;
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
      const targets = data.getTargets(TARGETTYPE.PLAYER) ?? []
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
        await entityComp.takeDamaged(this.getQuantityInRegardsToBlankCard(entityComp.node, damageToDeal), true, damageDealer)
      }
    } else {
      // Entity is Player
      if (entityComp instanceof Character) {

        await WrapperProvider.playerManagerWrapper.out.getPlayerByCard(entityComp.node)!.takeDamage(this.getQuantityInRegardsToBlankCard(entityComp.node, damageToDeal), true, damageDealer)
      }
    }
  }
}
