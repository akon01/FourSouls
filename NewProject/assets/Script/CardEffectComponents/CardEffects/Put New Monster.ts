import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";
import Card from "../../Entites/GameEntities/Card";
import Monster from "../../Entites/CardTypes/Monster";
import MonsterCardHolder from "../../Entites/MonsterCardHolder";
import MonsterField from "../../Entites/MonsterField";


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
    let cardTarget = data.getTarget(TARGETTYPE.MONSTER)
    if (cardTarget == null) {
      throw `no target in ${this.name}`
    } else {
      let holderId = (cardTarget as cc.Node).getComponent(Monster).monsterPlace.getComponent(MonsterCardHolder).id
      let newMonster = await CardManager.monsterDeck.getComponent(Deck).drawCard(true)

      if (this.discardOldMonster) {
        await (cardTarget as cc.Node).getComponent(Monster).monsterPlace.getComponent(MonsterCardHolder).discardTopMonster(true)
      }
      await MonsterField.addMonsterToExsistingPlace(holderId, newMonster, true)

    }


    if (data instanceof PassiveEffectData) {
      return data;
    } else return stack
  }
}
