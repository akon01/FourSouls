import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import { ITEM_TYPE, TIME_TO_ROTATE_ACTIVATION } from "../../Constants";




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

  async rechargeItem(sendToServer: boolean) {
    if (sendToServer) {
      //   cc.log(this.node.getComponent("Card"))
      let id = this.node.getComponent("Card")._cardId
      ServerClient.$.send(Signal.RECHARGE_ITEM, { cardId: id })
      cc.log(Signal.RECHARGE_ITEM)
    }
    this.node.runAction(cc.rotateTo(TIME_TO_ROTATE_ACTIVATION, 0));
    this.activated = false;
    return true;
  }

  useItem(sendToServer: boolean) {
    if (sendToServer) {
      ServerClient.$.send(Signal.USE_ITEM, { cardId: this.node.getComponent("Card")._cardId })
    }
    this.node.runAction(cc.rotateTo(TIME_TO_ROTATE_ACTIVATION, -90));
    // }
    this.activated = true;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
