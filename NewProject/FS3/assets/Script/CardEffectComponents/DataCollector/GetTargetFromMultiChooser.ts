import { _decorator, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { COLLECTORTYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { EffectTarget } from "../../Managers/EffectTarget";
import { IdAndNameComponent as IdAndName } from "../IdAndNameComponent";
import { DataCollector } from "./DataCollector";

@ccclass('GetTargetFromMultiChooser')
export class GetTargetFromMultiChooser extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromMultiChooser";
  // @property(CCInteger)
  // multiChooserToGetTargetsFromIdFinal: number = -1

  @property(DataCollector)
  multiChooserToGetTargetsFrom: DataCollector | null = null

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data: any) {
    const dataCollector = this.multiChooserToGetTargetsFrom;
    if (!dataCollector) { debugger; throw new Error("No Multi Effect Chooser Collector To Get Targets From"); }
    let effectData = new EffectTarget(dataCollector!.cardChosen!)
    return effectData;
  }
}
