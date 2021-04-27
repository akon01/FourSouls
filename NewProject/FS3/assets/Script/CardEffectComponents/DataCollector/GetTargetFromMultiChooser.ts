import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


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
    const effectData = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(dataCollector!.cardChosen!)
    return effectData;
  }
}
