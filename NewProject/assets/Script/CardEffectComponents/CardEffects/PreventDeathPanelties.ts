import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PreventDeathPenalties extends Effect {
  effectName = "PreventDeathPenalties";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(serverEffectStack: ServerEffect[], args?) {
    let terminateOriginal = args.terminateOriginal;
    terminateOriginal = true;
    let args2 = args.newArgs;
    cc.log('terminate pay penalties')
    return new Promise<{ terminateOriginal: boolean, newArgs: any }>((resolve, reject) => {
      resolve({ terminateOriginal: terminateOriginal, newArgs: args2 });
    });
  }
}
