import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import Deck from "../../Entites/GameEntities/Deck";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";
import Store from "../../Entites/GameEntities/Store";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardFromPlace extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;

  effectName = "DiscardFromPlace";


  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    const targetsToDiscard = data.getTargets(TARGETTYPE.CARD) as cc.Node[]
    if (targetsToDiscard.length == 0) {
      throw new Error('No Targets Found')
    }
    for (const target of targetsToDiscard) {
      const monsterComp = target.getComponent(Monster);
      if (monsterComp != null && monsterComp.monsterPlace != null) {
        await monsterComp.monsterPlace.discardTopMonster(true)
        continue
      }
      if (Store.getStoreCards().includes(target)) {
        await Store.$.discardStoreCard(target, true)
        continue
      }
    }
    if (data instanceof PassiveEffectData) {
      return data;
    } else { return stack }
  }
}


