import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { GAME_EVENTS, TARGETTYPE } from "../Constants";
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { PlayerManager } from "../Managers/PlayerManager";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { CardManager } from "../Managers/CardManager";
import { Monster } from "../Entites/CardTypes/Monster";
import { Item } from "../Entites/CardTypes/Item";
import { Store } from "../Entites/GameEntities/Store";
import { PileManager } from "../Managers/PileManager";
import { Card } from "../Entites/GameEntities/Card";
import { whevent } from "../../ServerClient/whevent";
import { Player } from "../Entites/GameEntities/Player";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('MomsHeartEffect')
export class MomsHeartEffect extends Effect {
  effectName = "MomsHeartEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {
    const winner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard((data.getTarget(TARGETTYPE.PLAYER) as Node))!
    whevent.emit(GAME_EVENTS.GAME_OVER, winner.playerId)
    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }
}
