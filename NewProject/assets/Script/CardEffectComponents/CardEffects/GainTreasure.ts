import { TARGETTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainTreasure extends Effect {
  effectName = "GainTreasure";

  @property({visible:function(this:GainTreasure){
    return !this.isSpecificTreasure
  }})
  numOfTreasure: number = 0;

  @property
  isSpecificTreasure:boolean = false

  @property({visible:function(this:GainTreasure){
    return this.isSpecificTreasure
  }})
  isSpecificFromDataCollector:boolean = false

  @property({visible:function(this:GainTreasure){
    return this.isSpecificTreasure && !this.isSpecificFromDataCollector
  }})
  specificTreasure:cc.Node = null

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      throw new Error(`no player`)
    } else {
      const player: Player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
      const treasureDeck = CardManager.treasureDeck
      if(this.isSpecificTreasure){
          if(this.isSpecificFromDataCollector){
            player.addItem(data.getTarget(TARGETTYPE.ITEM) as cc.Node,true,true)
          } else {
            player.addItem(this.specificTreasure,true,true)
          }
      } else {
        for (let i = 0; i < this.numOfTreasure; i++) {
          await player.addItem(treasureDeck, true, true)
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}
