import { ITEM_TYPE, TIMETOROTATEACTIVATION } from "../../Constants";

import Signal from "../../../Misc/Signal";

import Server from "../../../ServerClient/ServerClient";
import Card from "../GameEntities/Card";


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
      Server.$.send(Signal.RECHARGEITEM, { cardId: id })
      cc.log(Signal.RECHARGEITEM)
    }
    this.node.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, 0));
    this.activated = false;
    return true;
  }

  useItem(sendToServer: boolean) {
    if (sendToServer) {
      Server.$.send(Signal.USEITEM, { cardId: this.node.getComponent("Card")._cardId })
    }
    this.node.runAction(cc.rotateTo(TIMETOROTATEACTIVATION, -90));
    // }
    this.activated = true;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
