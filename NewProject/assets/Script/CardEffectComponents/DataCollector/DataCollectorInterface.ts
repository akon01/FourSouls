import { COLLECTORTYPE } from "../../Constants";

export default interface DataCollectorInterface {
  collectorName: string;
  isEffectChosen: boolean;
  cardChosen: cc.Node;
  isCardChosen: boolean;

  collectData(data?): Promise<{}>;
}
