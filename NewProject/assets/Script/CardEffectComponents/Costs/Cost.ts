import CostInterface from "./CostInterface";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Cost extends cc.Component implements CostInterface {


    takeCost() {
        throw new Error("Method not implemented.");
    }



}
