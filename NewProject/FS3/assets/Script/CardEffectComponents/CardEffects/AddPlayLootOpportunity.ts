import { _decorator, CCInteger, Node } from 'cc';
const { ccclass, property } = _decorator;

import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { TurnsManager } from "../../Managers/TurnsManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { Stack } from "../../Entites/Stack";
import { Player } from "../../Entites/GameEntities/Player";
import { TARGETTYPE } from "../../Constants";
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('AddPlayLootOpportunity')
export class AddPlayLootOpportunity extends Effect {
  effectName = "AddPlayLootOpportunity";
  @property(CCInteger)
  numOfTimes: number = 0;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const playerCard = data.getTarget(TARGETTYPE.PLAYER) as Node
    if (!playerCard) {
      throw new Error(`no Player to all loot plays to`)
    }
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!
    player.lootCardPlays += this.numOfTimes;
    if (WrapperProvider.turnsManagerWrapper.out.isCurrentPlayer(player.node)) {
      player.lootCardPlays += this.numOfTimes
    }

    //  }

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
