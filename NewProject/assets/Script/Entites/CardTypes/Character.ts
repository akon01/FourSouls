import Player from "../GameEntities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Character extends cc.Component {
  @property(cc.Prefab)
  charItemPrefab: cc.Prefab = null;

  @property
  charItemCard: cc.Node = null;

  @property
  activated: boolean = false;

  @property
  hp: number = 0;

  @property
  damage: number = 0;

  @property({ visible: false })
  player: Player = null

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
