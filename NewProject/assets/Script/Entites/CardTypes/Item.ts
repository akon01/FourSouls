import { ITEM_TYPE, TIMETOROTATEACTIVATION } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Item extends cc.Component {
  @property({
    type: cc.Enum(ITEM_TYPE)
  })
  type: ITEM_TYPE = ITEM_TYPE.ACTIVE;

  @property
  activated: boolean = false;

  @property
  eternal: boolean = false;

  rechargeItem() {
    this.node.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, 0));
    this.activated = false;
  }

  useItem() {
    // if (this.type == ITEM_TYPE.ACTIVE) {
    this.node.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, -90));
    // }
    this.activated = true;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}
