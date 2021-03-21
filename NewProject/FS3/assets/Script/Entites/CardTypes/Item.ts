import { Component, Enum, log, math, tween, _decorator, Node, v3 } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { ITEM_TYPE, TIME_TO_ROTATE_ACTIVATION } from "../../Constants";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Card } from '../GameEntities/Card';
import { Player } from "../GameEntities/Player";
const { ccclass, property } = _decorator;


@ccclass('Item')
export class Item extends Component {
  @property({
    type: Enum(ITEM_TYPE)
  })
  type: ITEM_TYPE = ITEM_TYPE.ACTIVE;
  @property
  needsRecharge: boolean = false;
  @property
  eternal: boolean = false;

  _lastOwnedBy: Player | null = null

  @property
  isGuppyItem: boolean = false;


  rechargeItem(sendToServer: boolean) {
    if (this.type == ITEM_TYPE.PASSIVE || this.type == ITEM_TYPE.TO_ADD_PASSIVE || this.type == ITEM_TYPE.PASSIVE_AND_PAID) {
      return
    }
    if (sendToServer) {
      let id = this.getComponent(Card)!._cardId
      if (WrapperProvider.serverClientWrapper.out)
        WrapperProvider.serverClientWrapper.out.send(Signal.RECHARGE_ITEM, { cardId: id })
    }
    tween(this.node).to(TIME_TO_ROTATE_ACTIVATION, { rotation: math.quat(0, 0, 0), scale: v3(1, 1, 1) }).start()
    //this.node.runAction(rotateTo(TIME_TO_ROTATE_ACTIVATION, 0));
    this.needsRecharge = false;
    return true;
  }

  useItem(sendToServer: boolean) {
    if (this.type == ITEM_TYPE.PASSIVE || this.type == ITEM_TYPE.TO_ADD_PASSIVE || this.type == ITEM_TYPE.PASSIVE_AND_PAID) {
      return
    }
    if (sendToServer && WrapperProvider.serverClientWrapper.out) {
      WrapperProvider.serverClientWrapper.out.send(Signal.USE_ITEM, { cardId: this.node.getComponent(Card)!._cardId })
    }
    tween(this.node).to(TIME_TO_ROTATE_ACTIVATION, { rotation: math.quat(undefined, undefined, 0.7, undefined), scale: v3(0.75, 0.75, 1) }).start()
    // this.node.runAction(cc.rotateTo(TIME_TO_ROTATE_ACTIVATION, -90));
    // }
    this.needsRecharge = true;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
