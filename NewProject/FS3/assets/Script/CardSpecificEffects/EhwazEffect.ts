import { log, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { PassiveEffect } from "../CardEffectComponents/CardEffects/PassiveEffect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { CARD_TYPE, TARGETTYPE } from "../Constants";
import { Deck } from "../Entites/GameEntities/Deck";
import { MonsterCardHolder } from "../Entites/MonsterCardHolder";
import { MonsterField } from "../Entites/MonsterField";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { BattleManager } from "../Managers/BattleManager";
import { CardManager } from "../Managers/CardManager";

import { PileManager } from "../Managers/PileManager";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('EhwazEffect')
export class EhwazEffect extends Effect {
  effectName = "EhwazEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    const monsterPlaces = WrapperProvider.monsterFieldWrapper.out.monsterCardHolders;
    for (let i = 0; i < monsterPlaces.length; i++) {
      const monsterHolder = monsterPlaces[i];
      if (WrapperProvider.battleManagerWrapper.out.currentlyAttackedMonsterNode != monsterHolder.activeMonster) {
        log(`move ${monsterHolder.activeMonster!.name} to discard pile`)

        const monster = monsterHolder.getComponent(MonsterCardHolder)!.activeMonster;
        await monsterHolder.discardTopMonster(true)
        // await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, monster, true)
      }
    }
    return stack
  }
}
