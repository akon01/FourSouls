import { COLLECTORTYPE } from "../../Constants";
import Cost from "../Costs/Cost";

export default interface DataCollectorInterface {
  DataCollectorId: number
  collectorName: string;
  isEffectChosen: boolean;
  cardChosen: cc.Node;
  isCardChosen: boolean;
  cost: Cost



  collectData(data?): Promise<{}>;
}
