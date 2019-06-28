
const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardManager extends cc.Component {

    @property
    _mePlayer: cc.Node = null;

    @property
    _otherPlayers: cc.Node[] = [];


    //   sendBoardChange(playerSent:cc.Node,)


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
