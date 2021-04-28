import { CCInteger, Node, _decorator } from 'cc';
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


@ccclass('PreventDamage')
export class PreventDamage extends Effect {
  effectName = "PreventDamage";
  @property(CCInteger)
  damageToPrevent = 0;
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
    if (!data) { debugger; throw new Error("No Data"); }
    let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
    if (targetEntity == null) targetEntity = data.getTarget(TARGETTYPE.MONSTER);
    if (targetEntity == null) {
      throw new CardEffectTargetError(`No Target Entity To Prevent Damage To found`, true, data, stack)
    }
    console.log(`give ${(targetEntity as Node).name} protecttion`)
    await this.giveDmgProtection(targetEntity as Node)
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
  async giveDmgProtection(targetEntity: Node) {
    let entityComp;
    entityComp = targetEntity.getComponent(Character);
    // Entity is Monster
    if (entityComp == null) {
      entityComp = targetEntity.getComponent(Monster)
      if (entityComp instanceof Monster) {
        await entityComp.addDamagePrevention(this.getQuantityInRegardsToBlankCard(entityComp.node, this.damageToPrevent), true)
      }
    } else {
      // Entity is Player
      if (entityComp instanceof Character) {
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(entityComp.node)!;
        await player.addDamagePrevention(this.getQuantityInRegardsToBlankCard(player.node, this.damageToPrevent), true)
      }
    }
  }
}
