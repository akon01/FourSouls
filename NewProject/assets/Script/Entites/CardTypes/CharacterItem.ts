import Item from "./Item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CharacterItem extends Item {
  @property(cc.Node)
  character: cc.Node = null;

  @property({ override: true })
  needsRecharge: boolean = false;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
