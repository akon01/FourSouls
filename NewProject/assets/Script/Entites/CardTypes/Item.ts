import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import { ITEM_TYPE, TIME_TO_ROTATE_ACTIVATION } from "../../Constants";
import Player from "../GameEntities/Player";




const { ccclass, property } = cc._decorator;

@ccclass
export default class Item extends cc.Component {
  @property({
    type: cc.Enum(ITEM_TYPE)
  })
  type: ITEM_TYPE = ITEM_TYPE.ACTIVE;

  @property
  needsRecharge: boolean = false;

  @property
  eternal: boolean = false;

  @property({ visible: false })
  lastOwnedBy: Player = null

  @property
  isGuppyItem: boolean = false;


  rechargeItem(sendToServer: boolean) {
    if (this.type == ITEM_TYPE.PASSIVE || this.type == ITEM_TYPE.TO_ADD_PASSIVE || this.type == ITEM_TYPE.PASSIVE_AND_PAID) {
      return
    }
    if (sendToServer) {
      let id = this.node.getComponent("Card")._cardId
      ServerClient.$.send(Signal.RECHARGE_ITEM, { cardId: id })
    }
    this.node.runAction(cc.rotateTo(TIME_TO_ROTATE_ACTIVATION, 0));
    this.needsRecharge = false;
    return true;
  }

  useItem(sendToServer: boolean) {
    if (this.type == ITEM_TYPE.PASSIVE || this.type == ITEM_TYPE.TO_ADD_PASSIVE || this.type == ITEM_TYPE.PASSIVE_AND_PAID) {
      return
    }
    if (sendToServer) {
      ServerClient.$.send(Signal.USE_ITEM, { cardId: this.node.getComponent("Card")._cardId })
    }
    this.node.runAction(cc.rotateTo(TIME_TO_ROTATE_ACTIVATION, -90));
    // }
    this.needsRecharge = true;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
