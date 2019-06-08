import Player from "../Entites/Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MoneyLable extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    player:Player = null;

    @property
    playerMoney:number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

     update (dt) {
        if(this.player != null){
            this.playerMoney = this.player.coins;
            this.label.string = this.playerMoney.toString()
        }
     }
}
