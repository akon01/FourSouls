import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { TARGETTYPE } from "../Constants";

import { PlayerManager } from "../Managers/PlayerManager";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { CardManager } from "../Managers/CardManager";
import { Monster } from "../Entites/CardTypes/Monster";
import { Item } from "../Entites/CardTypes/Item";
import { Store } from "../Entites/GameEntities/Store";
import { PileManager } from "../Managers/PileManager";
import { Card } from "../Entites/GameEntities/Card";
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('ChaosCardEffect')
export class ChaosCardEffect extends Effect {
  effectName = "ChaosCardEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {
    let target = data.getTarget(TARGETTYPE.CARD) as Node
    if (!target) {
      throw new Error(`no target found`)
    } else {
      if (WrapperProvider.playerManagerWrapper.out.isAOwnedSoul(target)) {
        // Card Should Be Soul Card
        await WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)!.loseSoul(target, true)
        await WrapperProvider.pileManagerWrapper.out.addCardToPile((target).getComponent(Card)!.type, target, true)
        if (data instanceof PassiveEffectData) {
          return data
        }
        return stack
      }
      if ((target).getComponent(Monster)) {
        await this.killMonster(target)
        //  await WrapperProvider.pileManagerWrapper.out.addCardToPile((target).getComponent(Card).type, target, true)
        if (data instanceof PassiveEffectData) {
          return data
        }
        return stack
      }
      if ((target).getComponent(Item)) {
        const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)!;
        if (!WrapperProvider.cardManagerWrapper.out.getCardOwner(target)) {
          await WrapperProvider.storeWrapper.out.removeFromStore(target, true)
          await WrapperProvider.pileManagerWrapper.out.addCardToPile((target).getComponent(Card)!.type, target, true)
        } else if (!((target) == cardOwner.character || (target) == cardOwner.characterItem)) {
          await target.getComponent(Item)!.destroyItem(true)
          if (data instanceof PassiveEffectData) {
            return data
          }
          return stack
        }
      }
      if (WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)) {
        await WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)!.killPlayer(true, WrapperProvider.cardManagerWrapper.out.getCardOwner(this.node.parent!)!)
        if (data instanceof PassiveEffectData) {
          return data
        }
        return stack
      }


    }
    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }
  async killMonster(monster: Node) {
    await monster.getComponent(Monster)!.kill(WrapperProvider.cardManagerWrapper.out.getCardOwner(WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)!)!)
  }
}