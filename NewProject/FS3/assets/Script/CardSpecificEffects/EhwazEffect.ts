import { _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { MonsterCardHolder } from "../Entites/MonsterCardHolder";
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;



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
      if (WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntityNode != monsterHolder.activeMonster) {
        console.log(`move ${monsterHolder.activeMonster!.name} to discard pile`)

        const monster = monsterHolder.getComponent(MonsterCardHolder)!.activeMonster;
        await monsterHolder.discardTopMonster(true)
        // await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, monster, true)
      }
    }
    return stack
  }
}
