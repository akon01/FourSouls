import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import MonsterCardHolder from "../../Entites/MonsterCardHolder";
import MonsterField from "../../Entites/MonsterField";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PutNewMonster extends Effect {
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
    cc.log(data)
    const cardTarget = data.getTarget(TARGETTYPE.MONSTER)
    if (cardTarget == null) {
      throw new Error(`no target in ${this.name}`)
    } else {
      const holderId = (cardTarget as cc.Node).getComponent(Monster).monsterPlace.getComponent(MonsterCardHolder).id
      const newMonster = await CardManager.monsterDeck.getComponent(Deck).drawCard(true)
      let doNotAdd = false
      if (this.discardOldMonster) {
        const monsterCardHolder = (cardTarget as cc.Node).getComponent(Monster).monsterPlace.getComponent(MonsterCardHolder);
        if (monsterCardHolder.monsters.length == 1) {
          doNotAdd = true
        }
        await monsterCardHolder.discardTopMonster(true)
      }
      if (!doNotAdd) {
        await MonsterField.addMonsterToExsistingPlace(holderId, newMonster, true)
      }

    }

    if (data instanceof PassiveEffectData) {
      return data;
    } else { return stack }
  }
}
