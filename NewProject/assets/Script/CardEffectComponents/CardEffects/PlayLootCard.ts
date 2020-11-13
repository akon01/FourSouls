import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import PlayLootCardStackEffect from "../../StackEffects/Play Loot Card";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import MultiEffectChoose from "../MultiEffectChooser/MultiEffectChoose";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayLootCard extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "playLootCard";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    let hasLockingEffect;
    const card = data.getTarget(TARGETTYPE.CARD)

    const collector = (card as cc.Node).getComponent(CardEffect).getMultiEffectCollector();
    if (collector != null && !(collector instanceof MultiEffectChoose)) {
      hasLockingEffect = true;
    } else { hasLockingEffect = false; }
    const player = PlayerManager.getPlayerByCard(data.effectCard)
    if (card != null && card instanceof cc.Node) {
      const playLoot = new PlayLootCardStackEffect(player.character.getComponent(Card)._cardId, hasLockingEffect, card, player.character, false, false)

      await Stack.addToStackBelow(playLoot, Stack._currentStack[Stack._currentStack.length - 1], false)
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
