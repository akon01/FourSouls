import Player from "./GameEntities/Player";
import Character from "./CardTypes/Character";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerStatsViewer extends cc.Component {

    @property(cc.Label)
    hp: cc.Label = null;

    @property(cc.Label)
    dmg: cc.Label = null;

    @property(cc.Label)
    coins: cc.Label = null;

    @property(cc.Label)
    dmgPrevention: cc.Label = null;

    @property({ visible: false })
    player: Player = null;

    @property(cc.Node)
    reactionToggle: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    update(dt) {
        if (this.player != null) {
            this.coins.string = '💰:' + this.player.coins.toString()
            this.hp.string = '🧡' + (this.player._Hp).toString()
            //if the players damage is base, dont show 
            if (this.player.character != null && this.player.character.getComponent(Character).damage != this.player.calculateDamage()) {
                this.dmg.node.active = true
                this.dmg.string = '🏹' + (this.player.calculateDamage()).toString()
            } else {
                this.dmg.node.active = false
            }
        }
    }
}
