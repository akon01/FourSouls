import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Player } from "./GameEntities/Player";
import { Character } from "./CardTypes/Character";

@ccclass('PlayerStatsViewer')
export class PlayerStatsViewer extends Component {
    @property(Label)
    hp: Label | null = null;

    @property(Label)
    dmg: Label | null = null;

    @property(Label)
    coins: Label | null = null;

    @property(Label)
    dmgPrevention: Label | null = null;

    player: Player | null = null;

    @property(Node)
    reactionToggle: Node | null = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}


    update(dt: number) {
        if (this.player != null) {
            this.coins!.string = '💰:' + this.player.coins.toString()
            this.hp!.string = '🧡' + (this.player._Hp).toString()
            //if the players damage is base, dont show 
            if (this.player.character != null && this.player!.character!.getComponent(Character)!.damage != this.player.calculateDamage()) {
                this.dmg!.node.active = true
                this.dmg!.string = '🏹' + (this.player.calculateDamage()).toString()
            } else {
                this.dmg!.node.active = false
            }
        }
    }
}
