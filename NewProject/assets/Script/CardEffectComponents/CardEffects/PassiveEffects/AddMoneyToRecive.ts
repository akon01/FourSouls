import Effect from "../Effect";
import DataCollector from "../../DataCollector/DataCollector";
import { ServerEffect } from "../../../Entites/ServerCardEffect";
import CardManager from "../../../Managers/CardManager";
import PlayerManager from "../../../Managers/PlayerManager";
import Player from "../../../Entites/GameEntities/Player";
import PassiveEffect from "../PassiveEffect";

import StackEffectInterface from "../../../StackEffects/StackEffectInterface";
import { PassiveEffectData } from "../../../Managers/DataInterpreter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AddMoneyToReceive extends PassiveEffect {
  effectName = "AddMoneyToReceive";


  @property(cc.Integer)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    let terminateOriginal = data.terminateOriginal;
    let args = data.methodArgs;
    //should be money count
    args[0] = args[0] + this.numOfCoins
    return data
  }
}
