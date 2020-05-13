import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { GAME_EVENTS } from "../Constants";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ActivateItem from "../StackEffects/Activate Item";
import { whevent } from "../../ServerClient/whevent";

const { ccclass, property } = cc._decorator;

const EmptyStackString = "Empty Stack";
@ccclass
export default class StackLable extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    static $: StackLable = null;

    static updateLable() {
        if (Stack._currentStack.length == 0) {
            if (this.$.label.string != EmptyStackString) {
                this.$.label.string = EmptyStackString
                ServerClient.$.send(Signal.UPDATE_STACK_LABLE, { stackText: "Empty Stack" })
            }
        } else {
            let stackText: string = "";
            for (let i = 0; i < Stack._currentStack.length; i++) {
                const stackEffect = Stack._currentStack[i]
                let type: string;
                let text: string;
                switch (stackEffect.stackEffectType) {
                    case 1:
                        const ai: ActivateItem = stackEffect as ActivateItem
                        type = "ACTIVATE ITEM"
                        break;
                    case 2:
                        type = "ATTACK_ROLL"
                        break;
                    case 3:
                        type = "COMBAT_DAMAGE"
                        break;
                    case 4:
                        type = "DECLARE_ATTACK"
                        break;
                    case 5:
                        type = "MONSTER_DEATH"
                        break;
                    case 6:
                        type = "MONSTER_END_DEATH"
                        break;
                    case 7:
                        type = "MONSTER_REWARD"
                        break;
                    case 8:
                        type = "PLAY_LOOT_CARD"
                        break;
                    case 9:
                        type = "  PURCHASE_ITEM"
                        break;
                    case 10:
                        type = "REFILL_EMPTY_SLOT"
                        break;
                    case 11:
                        type = "ROLL_DICE"
                        break;
                    case 12:

                        type = "TAKE_DAMAGE"
                        break;
                    case 13:
                        type = "START_TURN_LOOT"
                        break
                    case 14:
                        type = "ACTIVATE_PASSIVE_EFFECT"
                        break
                    case 15:
                        type = "PLAYER_DEATH"
                        break;
                    case 16:
                        type = "PLAYER_DEATH_PENALTY"
                        break
                    default:
                        break;
                }

                stackText = stackText.concat(` \n${i + 1}:` + stackEffect._lable)
            }
            if (StackLable.$.label.string != stackText) {
                StackLable.$.label.string = stackText
                // if (TurnsManager.isCurrentPlayer(PlayerManager.mePlayer)){
                ServerClient.$.send(Signal.UPDATE_STACK_LABLE, { stackText: stackText })
            }
            // }
        }
    }

    static updateText(text: string) {
        StackLable.$.label.string = text
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        StackLable.$ = this
        whevent.on(GAME_EVENTS.STACK_EMPTIED, () => {
            StackLable.updateLable()
        })
        whevent.on(GAME_EVENTS.LABLE_CHANGE, (data: { stackId: number, text: string }) => {

            StackLable.updateLable()
        })
    }

    start() {

    }

    // update (dt) {}
}
