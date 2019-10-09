import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import Deck from "../Entites/GameEntities/Deck";
import MonsterField from "../Entites/MonsterField";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import MonsterCardHolder from "../Entites/MonsterCardHolder";
import PileManager from "../Managers/PileManager";
import { CARD_TYPE } from "../Constants";

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
    data
  ) {

    let activeMonsters = MonsterField.activeMonsters
    let monsterPlaces = MonsterField.monsterCardHolders;

    for (let i = 0; i < monsterPlaces.length; i++) {
      const monsterHolder = monsterPlaces[i];
      if (BattleManager.currentlyAttackedMonsterNode != monsterHolder.activeMonster) {
        cc.log(`move ${monsterHolder.activeMonster.name} to discard pile`)

        let monster = monsterHolder.getComponent(MonsterCardHolder).activeMonster;
        monsterHolder.removeMonster(monster, true)
        await PileManager.addCardToPile(CARD_TYPE.MONSTER, monster, true)
      }
    }

    for (let i = 0; i < monsterPlaces.length; i++) {
      const monsterHolder = monsterPlaces[i];
      if (BattleManager.currentlyAttackedMonsterNode != monsterHolder.activeMonster) {
        cc.log(CardManager.monsterDeck.getComponent(Deck)._cards.map(card => card.name))
        let newMonster = CardManager.monsterDeck.getComponent(Deck).drawCard(true)
        cc.log(`add new monster ${newMonster.name}`)
        await MonsterField.addMonsterToExsistingPlace(monsterHolder.getComponent(MonsterCardHolder).id, newMonster, true)
        //  await monsterHolder.addToMonsters(newMonster, true)
      }
    }




    return stack
  }
}
