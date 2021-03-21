import { _decorator, log, Node } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE, CHOOSE_CARD_TYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Deck } from "../../Entites/GameEntities/Deck";
import { MonsterCardHolder } from "../../Entites/MonsterCardHolder";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";

import { Effect } from "./Effect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('PutNewMonster')
export class PutNewMonster extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;
  effectName = "PutNewMonster";
  @property
  discardOldMonster: boolean = false;
  /**
   *
   * @param data {target:PlayerId}
   */
  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    log(data)
    if (!data) { debugger; throw new Error("No Data"); }
    const cardTarget = data.getTarget(TARGETTYPE.MONSTER)
    if (cardTarget == null) {
      throw new Error(`no target in ${this.name}`)
    } else {
      const holderId = (cardTarget as Node).getComponent(Monster)!.monsterPlace!.getComponent(MonsterCardHolder)!.id!
      const newMonster = await WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!.drawCard(true)
      let doNotAdd = false
      if (this.discardOldMonster) {
        const monsterCardHolder = (cardTarget as Node).getComponent(Monster)!.monsterPlace!.getComponent(MonsterCardHolder)!;
        if (monsterCardHolder.monsters.length == 1) {
          doNotAdd = true
        }
        await monsterCardHolder.discardTopMonster(true)
      }
      if (!doNotAdd) {
        await WrapperProvider.monsterFieldWrapper.out.addMonsterToExsistingPlace(holderId, newMonster, true)
      }

    }
    if (data instanceof PassiveEffectData) {
      return data;
    } else { return stack }
  }
}
