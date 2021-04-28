import { Node, _decorator } from 'cc';
import { CardEffect } from "../../Entites/CardEffect";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Card } from "../../Entites/GameEntities/Card";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { PlayLootCardStackEffect } from "../../StackEffects/PlayLootCard";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { MultiEffectChoose } from "../MultiEffectChooser/MultiEffectChoose";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('PlayLootCard')
export class PlayLootCard extends Effect {
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
    if (!data) { debugger; throw new Error("No Data"); }
    const card = data.getTarget(TARGETTYPE.CARD)
    if (!card) {
      throw new CardEffectTargetError(`No Loot Card To Play found`, true, data, stack)
    }
    const collector = (card as Node).getComponent(CardEffect)!.getMultiEffectCollector();
    if (collector != null && !(collector instanceof MultiEffectChoose)) {
      hasLockingEffect = true;
    } else { hasLockingEffect = false; }
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(data.effectCard)!
    if (card != null && card instanceof Node) {
      const playLoot = new PlayLootCardStackEffect(player.character!.getComponent(Card)!._cardId, hasLockingEffect, card, player.character!, false, false)

      await WrapperProvider.stackWrapper.out.addToStackBelow(playLoot, WrapperProvider.stackWrapper.out._currentStack[WrapperProvider.stackWrapper.out._currentStack.length - 1], false)
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
