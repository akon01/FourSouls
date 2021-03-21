import { Node } from 'cc';
import { Cost } from "../Costs/Cost";
interface DataCollectorInterface {
  DataCollectorId: number
  collectorName: string;
  isEffectChosen: boolean;
  cardChosen: Node | null;
  isCardChosen: boolean;
  // costIdFinal: number
  cost: Cost | null
  hasBeenHandled: boolean
  getCost(): Cost | null
  collectData(data?: any): Promise<any>;
}

export type { DataCollectorInterface };

