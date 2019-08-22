import CardEffect from "../../Entites/CardEffect";
import Stack from "../../Entites/Stack";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import PlayLootCardStackEffect from "../../StackEffects/Play Loot Card";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import MultiEffectRoll from "../MultiEffectChooser/MultiEffectRoll";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Card from "../../Entites/GameEntities/Card";



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
    data?: ActiveEffectData
  ) {
    cc.log(data)
    let hasLockingEffect;
    let collector = this.node.parent.getComponent(CardEffect).multiEffectCollector;
    if (collector != null && collector instanceof MultiEffectRoll) {
      hasLockingEffect = true;
    } else hasLockingEffect = false;
    let player = PlayerManager.getPlayerByCard(data.effectCard)
    let card = data.getTarget(TARGETTYPE.CARD)
    if (card != null && card instanceof cc.Node) {
      let playLoot = new PlayLootCardStackEffect(player.character.getComponent(Card)._cardId, hasLockingEffect, card, player.character, false, false)

      await Stack.addToStackBelow(playLoot, Stack._currentStack[Stack._currentStack.length - 1])
    }
    // stack.push(data.cardEffect);
    return stack
  }
}
