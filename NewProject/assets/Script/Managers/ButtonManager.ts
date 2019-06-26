import Player from "../Entites/GameEntities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonManager extends cc.Component {
  static allButtonsNodes: cc.Node[] = [];

  static addToHandButtonPrefab: cc.Prefab = null;

  static addToHandButtonPool: cc.NodePool = null;

  static nextTurnButton: cc.Node = null;

  // LIFE-CYCLE CALLBACKS:

  static init() {
    this.nextTurnButton = cc.find("Canvas/nextTurnBtn");
    // this.addToHandButtonPool = new cc.NodePool();
    // //50 is number of available buttons during runtime (make Constant!)
    // for (let i = 0; i < 50; i++) {
    //      let addToHandButton:cc.Node = cc.instantiate(this.addToHandButtonPrefab);
    //      addToHandButton.name = 'addToHandButton';
    //      this.addToHandButtonPool.put(addToHandButton);

    // }
  }

  static addNewAddToHandButton(playerNode: cc.Node) {
    let buttonNode = this.addToHandButtonPool.get();
    playerNode.addChild(buttonNode);
    let playerComp: Player = playerNode.getComponent("Player");
    switch (playerComp.playerId) {
      case 1:
        buttonNode.setPosition(
          cc.find("Canvas").convertToNodeSpace(new cc.Vec2(300, 300))
        );
        break;
      case 2:
        buttonNode.setPosition(
          cc.find("Canvas").convertToNodeSpace(new cc.Vec2(100, 100))
        );
        break;
      default:
        break;
    }
  }

  static removeAddToHandButton(playersComps: Player[]) {
    for (let i = 0; i < playersComps.length; i++) {
      const playersComp = playersComps[i];
      let buttonNode = playersComp.node.getChildByName("addToHandButton");
      if (buttonNode != null) {
        this.addToHandButtonPool.put(buttonNode);
        //////cc.log('removed a button')
      }
    }
  }

  onLoad() {}

  start() {}

  // update (dt) {}
}
