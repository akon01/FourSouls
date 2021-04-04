import { Component, error, EventHandler, log, Node, Toggle, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { BUTTON_STATE } from "../Constants";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { Player } from "./GameEntities/Player";
const { ccclass, property } = _decorator;


@ccclass('ReactionToggle')
export class ReactionToggle extends Component {
    @property(Toggle)
    private toggle: Toggle | null = null;


    isChecked: boolean = false;




    toggleThis(sendToServer: boolean) {
        if (sendToServer == null || sendToServer == undefined) {
            sendToServer = true
        }

        console.log(this.toggle!.isChecked)
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.REACTION_TOGGLED, { playerId: WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId })
        }
        if (this.toggle!.isChecked) {
            // this.uncheck(sendToServer)
            this.isChecked = true
        } else {
            //this.check(sendToServer)
            this.isChecked = false
        }
    }

    check(sendToServer: boolean) {
        console.log(`check`)
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.REACTION_TOGGLED, { playerId: WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId })
        }
        if (!this.toggle!.isChecked) {
            this.toggle!.isChecked = true;
        }
        console.log(this.toggle!.isChecked)
        this.isChecked = true
    }

    uncheck(sendToServer: boolean) {
        console.log(`uncheck`)
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.REACTION_TOGGLED, { playerId: WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId })
        }
        if (this.toggle!.isChecked) {
            this.toggle!.isChecked = false;
        }
        console.log(this.toggle!.isChecked)
        this.isChecked = false
    }

    setSelfReactionEvent() {
        const e = new EventHandler()
        e.component = `ReactionToggle`
        e.handler = `determineSkipButton`
        e.target = this.node;
        this.toggle!.checkEvents.push(e)
    }

    addEvent(e: EventHandler) {
        this.toggle!.checkEvents.push(e)
    }

    addRespondWithNoAction(playerNode: Node) {
        const e = new EventHandler()
        e.target = playerNode
        e.component = `Player`
        e.handler = 'respondWithNoAction'
        this.addEvent(e)
    }

    removeRespondWithNoAction() {
        this.toggle!.checkEvents = this.toggle!.checkEvents.filter(e => e.handler != `respondWithNoAction`)
    }

    determineSkipButton() {
        let event;
        console.error(`determine skip button`)
        !WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!._reactionToggle!.isChecked == true ? event = BUTTON_STATE.ENABLED : event = BUTTON_STATE.DISABLED;
        if (event == BUTTON_STATE.ENABLED) {
            if (!WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!._inGetResponse) {
                event = BUTTON_STATE.DISABLED
            }
        }
        console.error(`skip is ${event}`)
        WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.skipButton!, event);
    }

    // onLoad () {}

    start() {
        console.error(`uncheck`)
        this.toggle!.isChecked = false;
        console.log(this.toggle!.isChecked)
    }

    // update (dt) {}
}
