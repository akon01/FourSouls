import { Node, _decorator } from 'cc';
import { Character } from "../../Entites/CardTypes/Character";
import { Monster } from "../../Entites/CardTypes/Monster";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
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

  currTargets: Node[] = []
  currData: ActiveEffectData | PassiveEffectData | null = null
  currStack: StackEffectInterface[] = []
  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    let damageToDeal = this.damageToDeal
    if (this.isGetDamageToDealFromDataCollector) {
      if (data instanceof PassiveEffectData) {
        damageToDeal = data.methodArgs[0]
      } else {
        damageToDeal = data?.getTarget(TARGETTYPE.NUMBER) as number
      }
    }
    //  const damageToDeal = (this.isGetDamageToDealFromDataCollector) ? (data as PassiveEffectData).methodArgs[0] : this.damageToDeal
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
        throw new CardEffectTargetError(`target entities are null`, true, data, stack)
      }

      const i = 1
      return this.handleHitAnEntity(i, targets.length, damageToDeal)
    } else {
      let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
      if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER); }
      if (targetEntity == null) {
        console.log(`target is null`)
        throw new Error("Target Entity Is Null");

      }
      return this.hitAnEntity(targetEntity as Node, damageToDeal).then(_ => {
        return this.handleEndDealDamage()
      })
    }
  }
  private handleHitAnEntity(idx: number, length: number, damageToDeal: number): Promise<PassiveEffectData | StackEffectInterface[]> {
    const target = this.currTargets[idx];
    return this.hitAnEntity(target, damageToDeal).then(_ => {
      return this.handleAfterHitAnEntity(idx, length, damageToDeal)
    })
  }

  private handleAfterHitAnEntity(idx: number, length: number, damageToDeal: number): Promise<PassiveEffectData | StackEffectInterface[]> {
    if (idx < length) {
      return this.handleHitAnEntity(idx++, length, damageToDeal)
    }

    return this.handleEndDealDamage()
  }
  private handleEndDealDamage(): Promise<PassiveEffectData | StackEffectInterface[]> {
    if (this.currData instanceof PassiveEffectData) { return Promise.resolve(this.currData) }
    return Promise.resolve(WrapperProvider.stackWrapper.out._currentStack)
  }


  hitAnEntity(targetEntity: Node, damageToDeal: number) {
    let entityComp;

    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const damageDealer = WrapperProvider.cardManagerWrapper.out.getCardOwner(thisCard)!
    entityComp = targetEntity.getComponent(Character);
    // Entity is Monster
    if (entityComp == null) {
      entityComp = targetEntity.getComponent(Monster)
      if (entityComp instanceof Monster) {
        return entityComp.takeDamaged(this.getQuantityInRegardsToBlankCard(entityComp.node, damageToDeal), true, damageDealer)
      }
      throw new Error("Should Not Get Here!")
    } else {
      // Entity is Player
      if (entityComp instanceof Character) {
        return WrapperProvider.playerManagerWrapper.out.getPlayerByCard(entityComp.node)!.takeDamage(this.getQuantityInRegardsToBlankCard(entityComp.node, damageToDeal), true, damageDealer)
      }
      throw new Error("Should Not Get Here!")
    }
  }
}
