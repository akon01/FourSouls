import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import PlayerManager from "../Managers/PlayerManager";
import Player from "./GameEntities/Player";
import { BUTTON_STATE } from "../Constants";
import ButtonManager from "../Managers/ButtonManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ReactionToggle extends cc.Component {

    @property(cc.Toggle)
    private toggle: cc.Toggle = null;

    @property({ visible: false })
    isChecked: boolean = false;

    toggleThis(sendToServer: boolean) {
        if (sendToServer == null || sendToServer == undefined) {
            sendToServer = true
        }

        cc.log(this.toggle.isChecked)
        if (sendToServer) {
            ServerClient.$.send(Signal.REACTION_TOGGLED, { playerId: PlayerManager.mePlayer.getComponent(Player).playerId })
        }
        if (this.toggle.isChecked) {
            // this.uncheck(sendToServer)
            this.isChecked = true
        } else {
            //this.check(sendToServer)
            this.isChecked = false
        }
    }

    check(sendToServer: boolean) {
        cc.log(`check`)
        if (sendToServer) {
            ServerClient.$.send(Signal.REACTION_TOGGLED, { playerId: PlayerManager.mePlayer.getComponent(Player).playerId })
        }
        if (!this.toggle.isChecked) {
            this.toggle.check();
        }
        cc.log(this.toggle.isChecked)
        this.isChecked = true
    }

    uncheck(sendToServer: boolean) {
        cc.log(`uncheck`)
        if (sendToServer) {
            ServerClient.$.send(Signal.REACTION_TOGGLED, { playerId: PlayerManager.mePlayer.getComponent(Player).playerId })
        }
        if (this.toggle.isChecked) {
            this.toggle.uncheck();
        }
        cc.log(this.toggle.isChecked)
        this.isChecked = false
    }

    setSelfReactionEvent() {
        const e = new cc.Component.EventHandler()
        e.component = `Reaction Toggle`
        e.handler = `determineSkipButton`
        e.target = this.node;
        this.toggle.checkEvents.push(e)
    }

    addEvent(e: cc.Component.EventHandler) {
        this.toggle.checkEvents.push(e)
    }

    addRespondWithNoAction(playerNode: cc.Node) {
        const e = new cc.Component.EventHandler()
        e.target = playerNode
        e.component = `Player`
        e.handler = 'respondWithNoAction'
        this.addEvent(e)
    }

    removeRespondWithNoAction() {
        this.toggle.checkEvents = this.toggle.checkEvents.filter(e => e.handler != `respondWithNoAction`)
    }

    determineSkipButton() {
        let event;
        cc.error(`determine skip button`)
        !PlayerManager.mePlayer.getComponent(Player)._reactionToggle.isChecked == true ? event = BUTTON_STATE.ENABLED : event = BUTTON_STATE.DISABLED;
        if (event == BUTTON_STATE.ENABLED) {
            if (!PlayerManager.mePlayer.getComponent(Player)._inGetResponse) {
                event = BUTTON_STATE.DISABLED
            }
        }
        cc.error(`skip is ${event}`)
        ButtonManager.enableButton(ButtonManager.$.skipButton, event);
    }

    // onLoad () {}

    start() {
        cc.error(`uncheck`)
        this.toggle.uncheck();
        cc.log(this.toggle.isChecked)
    }

    // update (dt) {}
}
