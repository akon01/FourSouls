import { ServerEffect } from "./../../Entites/ServerCardEffect";

import EffectInterface from "./EffectInterface";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE } from "../../Constants";
import Condition from "../CardConditions/Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect extends cc.Component implements EffectInterface {
  @property(Condition)
  condition: Condition = null;
  effectName: string = null;

  chooseType: CHOOSE_TYPE = null;

  @property(DataCollector)
  dataCollector: DataCollector = null;

  /**
   *
   * @param data {target:Player}
   */
  doEffect(serverEffectStack: ServerEffect[], data?) {
    return new Promise<ServerEffect[]>((resolve, reject) => {});
  }
}
