import Player from "../Entites/GameEntities/Player";


const { ccclass, property } = cc._decorator;

enum stats {
    HP, COINS
}

@ccclass
export default class StatLable extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    player: Player = null;

    @property({ type: cc.Enum(stats) })
    statType: stats = stats.COINS

    @property
    playerMoney: number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    update(dt) {
        if (this.player != null) {
            switch (this.statType) {
                case stats.COINS:
                    this.playerMoney = this.player.coins;
                    this.label.string = '💰:' + this.playerMoney.toString()
                    break;
                case stats.HP:
                    this.label.string = '🧡' + (this.player._Hp).toString()
                    break;
                default:
                    break;
            }
        }
    }
}
