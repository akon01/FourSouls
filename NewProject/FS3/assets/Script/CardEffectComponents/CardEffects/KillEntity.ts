import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Character } from "../../Entites/CardTypes/Character";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Card } from "../../Entites/GameEntities/Card";
import { Stack } from "../../Entites/Stack";
import { BattleManager } from "../../Managers/BattleManager";
import { CardManager } from "../../Managers/CardManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('KillEntity')
export class KillEntity extends Effect {
  effectName = "KillEntity";
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
    if (!data) { debugger; throw new Error("No Data"); }
    if (this.multipleTargets) {
      await this.doForMultipleTargets(data)
    } else {
      let targetEntity = data.getTarget(TARGETTYPE.PLAYER)
      if (targetEntity == null) {
        targetEntity = data.getTarget(TARGETTYPE.MONSTER)
      }
      if (targetEntity == null) {
        throw new Error("no target entity to kill")
      } else {
        let entityComp;
        entityComp = (targetEntity as Node).getComponent(Character);
        const owner = WrapperProvider.cardManagerWrapper.out.getCardOwner(WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node))!
        if (entityComp == null) {
          entityComp = (targetEntity as Node).getComponent(Monster);
          if (entityComp != null) {
            await entityComp.kill(owner)
          } else {
            throw new Error(`Entity Is Not Char Nor Monster,Cant Kill`)
          }
        } else {
          if (entityComp instanceof Character) {
            await WrapperProvider.playerManagerWrapper.out.getPlayerByCard(entityComp.node)!.killPlayer(true, owner)
          }
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
  async doForMultipleTargets(data: ActiveEffectData | PassiveEffectData) {
    let targets = data.getTargets(TARGETTYPE.PLAYER)
    let isPlayers = true
    if (targets.length == 0) {
      isPlayers = false;
      targets = data.getTargets(TARGETTYPE.MONSTER)
    }
    if (targets.length == 0) { throw new Error(`no targets to kill`) }
    for (let i = 0; i < targets.length; i++) {
      const targetEntity = targets[i] as Node;
      let entityComp;
      const owner = WrapperProvider.cardManagerWrapper.out.getCardOwner(this.node)!
      if (isPlayers) {
        entityComp = (targetEntity as Node).getComponent(Character);
        if (entityComp instanceof Character) {
          await WrapperProvider.playerManagerWrapper.out.getPlayerByCard(entityComp.node)!.killPlayer(true, owner)
        }
      } else {
        entityComp = (targetEntity as Node).getComponent(Monster);
        await (targetEntity as Node).getComponent(Monster)!.kill(owner)
      }
    }
  }
}