import { TARGETTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainTreasure extends Effect {
  effectName = "GainTreasure";


  @property(Number)
  numOfTreasure: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {



    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      cc.log(`no player`)
    } else {
      let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
      let topDeck = CardManager.treasureDeck.getComponent(Deck).topBlankCard
      for (let i = 0; i < this.numOfTreasure; i++) {
        await player.addItem(topDeck, true, true)
      }
    }

    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}
