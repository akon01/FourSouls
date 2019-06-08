import CardManager from "../Managers/CardManager";
import { addCardToCardLayout } from "../Modules/HandModule";
import { CardLayout } from "./CardLayout";

import { LANDING_NODES } from "../Constants";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Store extends cc.Component {

    @property(Number)
    maxNumOfItems: number = 2;

    
   static storeCards: cc.Node[] = [];

    @property
    layout:CardLayout = null;

    addStoreCard(){
      
        if(this.maxNumOfItems>Store.storeCards.length){
            ////cc.log('add store card')
            let newTreasure = CardManager.treasureCardPool.get()
            CardManager.allCards.push(newTreasure)
            CardManager.onTableCards.push(newTreasure)
            let layout = this.node.getComponent(CardLayout)
            Store.storeCards.push(newTreasure)
            newTreasure.parent = cc.find('Canvas')
            layout.addCardToLayout(newTreasure)     
        }
    }

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
         this.layout = this.node.getComponent(CardLayout)
         this.node.dispatchEvent(new cc.Event.EventCustom('StoreInit',true))
         ////cc.log('dispach store init')
     }

    start () {

    }

    // update (dt) {}
}
