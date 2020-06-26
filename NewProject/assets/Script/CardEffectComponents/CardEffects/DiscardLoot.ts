import { TARGETTYPE, CARD_TYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardLoot extends Effect {
  effectName = "DiscardLoot";

  @property(cc.Integer)
  numOfLoot: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    const targetLoots = data.getTargets(TARGETTYPE.CARD)
    if (targetLoots.length == 0) {
      throw new Error(`no targets`)
    } else {
      let player: Player
      for (let i = 0; i < targetLoots.length; i++) {
        const lootToDiscard = targetLoots[i];
        if ((lootToDiscard as cc.Node).getComponent(Card).type != CARD_TYPE.LOOT) { continue }
        player = PlayerManager.getPlayerByCard(lootToDiscard as cc.Node)
        await player.discardLoot(lootToDiscard as cc.Node, true)
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
