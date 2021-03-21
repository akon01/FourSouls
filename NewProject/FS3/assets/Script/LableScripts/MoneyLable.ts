import { _decorator, Component, Label, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { Player } from "../Entites/GameEntities/Player";
enum stats {
    HP, COINS, DMG
}

@ccclass('MoneyLable')
export class MoneyLable extends Component {
    @property(Label)
    label: Label | null = null;

    @property
    player: Player | null = null;

    @property({ type: Enum(stats) })
    statType: stats = stats.COINS

    @property
    playerMoney: number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    update(dt: number) {
        if (this.player != null) {
            switch (this.statType) {
                case stats.COINS:
                    this.playerMoney = this.player.coins;
                    this.label!.string = '💰:' + this.playerMoney.toString()
                    break;
                case stats.HP:
                    this.label!.string = '🧡' + (this.player._Hp).toString()
                    break;
                case stats.DMG:
                    this.label!.string = '🧡' + (this.player._Hp).toString()
                    break;
                default:
                    break;
            }
        }
    }
}
