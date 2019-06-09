import { COLLECTORTYPE } from "../../Constants";

export default interface DataCollectorInterface {
  collectorName: string;
  isCardChosen: boolean;
  cardChosen: cc.Node;

  collectData(data?): Promise<{}>;
}
