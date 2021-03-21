import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Deck } from "../../Entites/GameEntities/Deck";
import { Player } from "../../Entites/GameEntities/Player";
import { Stack } from "../../Entites/Stack";
import { CardManager } from "../../Managers/CardManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('GainTreasure')
export class GainTreasure extends Effect {
      effectName = "GainTreasure";
      @property({
            visible: function (this: GainTreasure) {
                  return !this.isSpecificTreasure
            }
      })
      numOfTreasure: number = 0;

      @property
      isSpecificTreasure: boolean = false

      @property({
            visible: function (this: GainTreasure) {
                  return this.isSpecificTreasure
            }
      })
      isSpecificFromDataCollector: boolean = false

      @property({
            visible: function (this: GainTreasure) {
                  return this.isSpecificTreasure && !this.isSpecificFromDataCollector
            }
      })
      specificTreasure: Node | null = null

      /**
       *
       * @param data {target:PlayerId}
       */
      async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

            if (!data) { debugger; throw new Error("No Data"); }

            const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
            if (targetPlayerCard == null) {
                  throw new Error(`no player`)
            } else {
                  const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
                  const treasureDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck
                  if (this.isSpecificTreasure) {
                        if (this.isSpecificFromDataCollector) {
                              player.addItem(data.getTarget(TARGETTYPE.ITEM) as Node, true, true)
                        } else {
                              if (!this.specificTreasure) { debugger; throw new Error("No Specific Treasure Set"); }

                              player.addItem(this.specificTreasure, true, true)
                        }
                  } else {
                        for (let i = 0; i < this.numOfTreasure; i++) {
                              await player.addItem(treasureDeck, true, true)
                        }
                  }
            }

            if (data instanceof PassiveEffectData) { return data }
            return WrapperProvider.stackWrapper.out._currentStack
      }
}
