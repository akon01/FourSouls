import { COLLECTORTYPE } from "../../Constants";
import Effect from "../CardEffects/Effect";
import DataCollector from "./DataCollector";
import { EffectTarget } from "../../Managers/DataInterpreter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GetTargetFromMultiChooser extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromMultiChooser";

  @property(DataCollector)
  multiChooserToGetTargetsFrom: DataCollector = null;

  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {
    let effectData = new EffectTarget(this.multiChooserToGetTargetsFrom.cardChosen)
    return effectData;
  }
}
