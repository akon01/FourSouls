import Effect from "../Effect";
import DataCollector from "../../DataCollector/DataCollector";
import { ServerEffect } from "../../../Entites/ServerCardEffect";
import CardManager from "../../../Managers/CardManager";
import PlayerManager from "../../../Managers/PlayerManager";
import Player from "../../../Entites/GameEntities/Player";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AddMoneyToReceive extends Effect {
  effectName = "AddMoneyToReceive";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property(Number)
  numOfCoins: number = 0;

  /**
   *
   * @param args {target:PlayerId}
   */
  doEffect(serverEffectStack: ServerEffect[], args?) {
    let terminateOriginal = args.terminateOriginal;
    let args2 = args.newArgs;
    //should be money count
    args2[0] = args2[0] + 1
    return new Promise<{ terminateOriginal: boolean, newArgs: any }>((resolve, reject) => {
      resolve({ terminateOriginal: terminateOriginal, newArgs: args2 });
    });
  }
}
