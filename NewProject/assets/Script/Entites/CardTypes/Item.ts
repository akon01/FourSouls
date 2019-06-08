import { ITEM_TYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Item extends cc.Component {

    @property({
        type: cc.Enum(ITEM_TYPE)
    })
    type: ITEM_TYPE = ITEM_TYPE.ACTIVE;

    @property
    activated:boolean = false;

   

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
