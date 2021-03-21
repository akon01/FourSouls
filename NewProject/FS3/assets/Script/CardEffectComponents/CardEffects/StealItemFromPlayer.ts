import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { CardManager } from "../../Managers/CardManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { ChooseCard } from "../DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
import { Player } from "../../Entites/GameEntities/Player";
import { Stack } from "../../Entites/Stack";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('StealItemFromPlayer')
export class StealItemFromPlayer extends Effect {
  effectName = "StealItemFromPlayer";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const playerToGiveTo: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard((data.getTarget(TARGETTYPE.PLAYER) as Node))!
    if (playerToGiveTo == null) {
      throw new Error(`player is null`)
    } else {
      const cardToTake = data.getTarget(TARGETTYPE.ITEM) as Node;
      // p1 choose which loot to get.
      const playerToTakeFrom = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardToTake)!
      await playerToTakeFrom.loseItem(cardToTake, true)
      await playerToGiveTo.addItem(cardToTake, true, true)
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
