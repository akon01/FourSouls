import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { PassiveEffectData } from "../Managers/PassiveEffectData";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { Store } from "../Entites/GameEntities/Store";
import { TARGETTYPE } from "../Constants";
import { PlayerManager } from "../Managers/PlayerManager";
import { Player } from "../Entites/GameEntities/Player";
import { Stack } from "../Entites/Stack";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('SteamySaleEffect')
export class SteamySaleEffect extends Effect {
  effectName = "SteamySaleEffect";
  originalStoreCost: number = 0
  @property
  toReverseEffect: boolean = false;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    const playerCard = data.getTarget(TARGETTYPE.PLAYER) as Node
    if (!playerCard) {
      //throw new Error(`No Player Found To Reduce Store Cost`)
    }
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!
    this.originalStoreCost = player.storeCardCostReduction
    player.storeCardCostReduction += 5;
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
