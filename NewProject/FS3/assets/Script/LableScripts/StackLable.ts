import { Component, Label, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { GAME_EVENTS } from "../Constants";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { ActivateItem } from "../StackEffects/ActivateItem";

const { ccclass, property } = _decorator;

const EmptyStackString = "Empty Stack";

@ccclass('StackLable')
export class StackLable extends Component {

    @property(Label)
    label: Label | null = null;





    updateLable() {
        if (WrapperProvider.stackWrapper.out._currentStack.length == 0) {
            if (this.label!.string != EmptyStackString) {
                this.label!.string = EmptyStackString
                WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_STACK_LABLE, { stackText: "Empty Stack" })
            }
        } else {
            let stackText: string = "";
            for (let i = 0; i < WrapperProvider.stackWrapper.out._currentStack.length; i++) {
                const stackEffect = WrapperProvider.stackWrapper.out._currentStack[i]
                let type: string;
                let text: string;
                switch (stackEffect.stackEffectType) {
                    case 1:
                        const ai: ActivateItem = stackEffect as ActivateItem
                        type = "ActivateItem"
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
            if (this.label!.string != stackText) {
                this.label!.string = stackText
                // if (turnsManagerWrapper._tm.isCurrentPlayer(WrapperProvider.playerManagerWrapper.out.mePlayer)){
                WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_STACK_LABLE, { stackText: stackText })
            }
            // }
        }
    }

    updateText(text: string) {
        this.label!.string = text
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        whevent.on(GAME_EVENTS.STACK_EMPTIED, () => {
            this.updateLable()
        })
        whevent.on(GAME_EVENTS.LABLE_CHANGE, (data: { stackId: number, text: string }) => {

            this.updateLable()
        })
    }

    start() {

    }

    // update (dt) {}
}
