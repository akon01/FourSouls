import { COLLECTORTYPE } from "../../Constants";
import Cost from "../Costs/Cost";
import DataCollector from "./DataCollector";

export default interface DataCollectorInterface {
  DataCollectorId: number
  collectorName: string;
  isEffectChosen: boolean;
  cardChosen: cc.Node;
  isCardChosen: boolean;
  costIdFinal: number
  setWithOld(oldDataCollector: DataCollector)
  hasBeenHandled: boolean

  getCost(): Cost

  collectData(data?): Promise<{}>;
}
