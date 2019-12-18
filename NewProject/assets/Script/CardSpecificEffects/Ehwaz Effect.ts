import Effect from "../CardEffectComponents/CardEffects/Effect";
import PassiveEffect from "../CardEffectComponents/CardEffects/PassiveEffect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { CARD_TYPE, TARGETTYPE } from "../Constants";
import Deck from "../Entites/GameEntities/Deck";
import MonsterCardHolder from "../Entites/MonsterCardHolder";
import MonsterField from "../Entites/MonsterField";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import PileManager from "../Managers/PileManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EhwazEffect extends Effect {
  effectName = "EhwazEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {

    const monsterPlaces = MonsterField.monsterCardHolders;

    for (let i = 0; i < monsterPlaces.length; i++) {
      const monsterHolder = monsterPlaces[i];
      if (BattleManager.currentlyAttackedMonsterNode != monsterHolder.activeMonster) {
        cc.log(`move ${monsterHolder.activeMonster.name} to discard pile`)

        const monster = monsterHolder.getComponent(MonsterCardHolder).activeMonster;
        await monsterHolder.discardTopMonster(true)
        //await PileManager.addCardToPile(CARD_TYPE.MONSTER, monster, true)
      }
    }

    return stack
  }
}
