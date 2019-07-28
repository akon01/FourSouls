import CostInterface from "./CostInterface";
import Cost from "./Cost";
import Card from "../../Entites/GameEntities/Card";
import Effect from "../CardEffects/Effect";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PayCounters extends Cost {

    @property
    numOfCounters: number = 1;

    takeCost() {
        let thisEffect = this.node.parent;
        let thisCard = thisEffect.getComponent(Effect)._effectCard
        let cardComp = thisCard.getComponent(Card)
        cardComp._counters -= this.numOfCounters;
    }



}
