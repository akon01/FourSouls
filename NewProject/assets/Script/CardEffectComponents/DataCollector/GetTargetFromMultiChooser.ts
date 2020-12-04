import { COLLECTORTYPE } from "../../Constants";
import { EffectTarget } from "../../Managers/DataInterpreter";
import { createNewDataCollector } from "../../reset";
import IdAndName from "../IdAndNameComponent";
import DataCollector from "./DataCollector";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GetTargetFromMultiChooser extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromMultiChooser";

  @property(DataCollector)
  multiChooserToGetTargetsFrom: DataCollector = null;

  @property(IdAndName)
  multiChooserToGetTargetsFromId: IdAndName = new IdAndName()

  @property(cc.Integer)
  multiChooserToGetTargetsFromIdFinal: number = -1

  setWithOld(old: GetTargetFromMultiChooser) {
    if (old.multiChooserToGetTargetsFrom) {
      if (old.multiChooserToGetTargetsFrom.hasBeenHandled) {
        this.multiChooserToGetTargetsFromId.id = old.multiChooserToGetTargetsFrom.DataCollectorId;
        this.multiChooserToGetTargetsFromId.name = old.multiChooserToGetTargetsFrom.collectorName;
      } else {
        const newId = createNewDataCollector(this.node, old.multiChooserToGetTargetsFrom)
        this.multiChooserToGetTargetsFromId.id = newId
        this.multiChooserToGetTargetsFromId.name = old.multiChooserToGetTargetsFrom.collectorName;
      }
      this.multiChooserToGetTargetsFrom = null
      old.multiChooserToGetTargetsFrom = null
      old.multiChooserToGetTargetsFromId = this.multiChooserToGetTargetsFromId
    }
  }
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
