import { CCInteger, log, Node, _decorator } from 'cc';
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


@ccclass('HealEntity')
export class HealEntity extends Effect {
  effectName = "HealEntity";
  @property({ type: CCInteger, visible: function (this: HealEntity) { return !this.isHealToFullHp } })
  hpToHeal = 1

  @property
  isHealToFullHp = false

  @property
  isMultiTarget = false;
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
      if (targetEntities.length == 0) { targetEntities = data.getTargets(TARGETTYPE.MONSTER) }
      if (targetEntities.length == 0) {
        throw new CardEffectTargetError(`No Target Entites To Kill Found`, true, data, stack)
      } else {
        for (const entity of targetEntities) {
          this.healEntity(entity as Node)
        }
      }
    } else {
      let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
      if (targetEntity == null) { targetEntity = data.getTarget(TARGETTYPE.MONSTER) }

      if (targetEntity == null) {
        throw new CardEffectTargetError(`No Target Entity To Kill Found`, true, data, stack)
      } else {
        this.healEntity(targetEntity as Node)
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
  healEntity(entity: Node) {
    let hpToHeal = this.hpToHeal;
    const entityComp = entity.getComponent(Character);
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
