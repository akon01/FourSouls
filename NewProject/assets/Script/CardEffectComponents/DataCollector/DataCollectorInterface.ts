import { COLLECTORTYPE } from "../../Constants";
import Cost from "../Costs/Cost";
import DataCollector from "./DataCollector";

export default interface DataCollectorInterface {
  DataCollectorId: number
  collectorName: string;
  isEffectChosen: boolean;
  cardChosen: cc.Node;
  isCardChosen: boolean;
  cost: Cost
  setWithOld(oldDataCollector: DataCollector)


  collectData(data?): Promise<{}>;
}
