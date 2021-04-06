import { Component, Node, _decorator } from 'cc';
import { Cost } from "../Costs/Cost";
import { DataCollectorInterface } from "./DataCollectorInterface";
const { ccclass, property } = _decorator;


@ccclass('DataCollector')
export class DataCollector extends Component implements DataCollectorInterface {
      getCost() {
            return this.cost
            // return this.node.getComponent(CardEffect)!.getCost(this.costIdFinal)
      }

      hasBeenHandled = false

      @property
      DataCollectorId = -1

      isCardChosen = false
      isEffectChosen = false

      setDataCollectorId() {
            if (this.node && this.DataCollectorId == -1) {
                  const comps = this.node.getComponents(DataCollector);
                  this.DataCollectorId = comps.findIndex(ed => ed == this);
            }
      }

      setIsCardChosen(is: boolean) {
            this.isCardChosen = is
      }

      setIsEffectChosen(is: boolean) {
            this.isEffectChosen = is
      }

      cardChosen: Node | null = null;
      collectorName = "CardPlayer";
      hasSubAction = false;


      // @property({ type: CCInteger })
      // costIdFinal: number = -1

      @property({ type: Component })
      cost: Cost | null = null

      /**
       *
       * @param data {playerId:Player who played the card}
       */
      collectData(data: any) {
            return data.playerId;
      }

      private _effectCard: Node | null = null

      getEffectCard() {
            return this._effectCard ?? this.node
      }

      onLoad() {
            this._effectCard = this.node
      }


}
