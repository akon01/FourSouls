import { Component, Node, _decorator } from 'cc';
import { CARD_TYPE } from '../../Constants';
import { Card } from '../../Entites/GameEntities/Card';
import { Player } from '../../Entites/GameEntities/Player';
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

      isThisCardALootCard() {
            if (!this._effectCard) {
                  throw new Error("No Effect Card Set!");
            }
            return this._effectCard.getComponent(Card)?.type == CARD_TYPE.LOOT
      }
      
      getQuantityInRegardsToBlankCard(target: Node, originalQuantity: number) {
            const player = target.getComponent(Player)
            if (!player) {
                  return originalQuantity
            }
            if (!this.isThisCardALootCard()) {
                  return originalQuantity
            }
            return player.hasBlankCardEffectActive ? originalQuantity * 2 : originalQuantity
      }


}
