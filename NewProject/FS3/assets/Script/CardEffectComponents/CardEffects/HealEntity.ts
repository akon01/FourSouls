import { CCInteger, log, Node, _decorator } from 'cc';
import { Character } from "../../Entites/CardTypes/Character";
import { Monster } from "../../Entites/CardTypes/Monster";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('HealEntity')
export class HealEntity extends Effect {
  effectName = "HealEntity";
  @property({ type: CCInteger, visible: function (this: HealEntity) { return !this.isHealToFullHp } })
  hpToHeal: number = 1

  @property
  isHealToFullHp: boolean = false

  @property
  isMultiTarget: boolean = false;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    if (this.isMultiTarget) {
      let targetEntities = data.getTargets(TARGETTYPE.PLAYER)
      if (targetEntities == null) { targetEntities = data.getTargets(TARGETTYPE.MONSTER) }

      if (targetEntities == null) {
        log('no target entities to kill')
      } else {
        for (const entity of targetEntities) {
          this.healEntity(entity as Node)
        }
      }
    } else {
      let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
      if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER) }

      if (targetEntity == null) {
        log('no target entity to kill')
      } else {
        this.healEntity(targetEntity as Node)
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
  healEntity(entity: Node) {
    let entityComp;
    let hpToHeal = this.hpToHeal;
    entityComp = entity.getComponent(Character);
    if (entityComp == null) {
      const monsterComp = entity.getComponent(Monster)!;
      if (this.isHealToFullHp) {
        hpToHeal = monsterComp.HP
      }
      monsterComp.heal(hpToHeal, true)
    } else {
      if (entityComp instanceof Character) {
        const playerComp = (WrapperProvider.playerManagerWrapper.out.getPlayerByCard(entityComp.node)!);
        if (this.isHealToFullHp) {
          hpToHeal = playerComp._Hp
        }
        playerComp.heal(hpToHeal, true)
      }
    }
  }
}
