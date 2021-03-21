import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { COLLECTORTYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Effect } from "../CardEffects/Effect";
import { DataCollector } from "./DataCollector";

@ccclass('GetTargetFromConcurentData')
export class GetTargetFromConcurentData extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromConcurentData";
  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data: any) {

    const effectData = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node).getComponent(CardEffect)!.concurentEffectData!


    // let target = new EffectTarget(player)
    //let data2 = { cardOwner: player.playerId };
    return effectData.effectTargets;
  }
}
