import { ANNOUNCEMENT_TIME } from "../Constants";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AnnouncementLable extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Label)
    timer: cc.Label = null

    @property({ visible: false })
    timerId: number = null;

    static $: AnnouncementLable = null;

    private setLable(text: string) {
        this.label.string = text;
    }

    showAnnouncement(text: string, time: number, sendToServer: boolean) {
        this.setLable(text)
        this.label.node.active = true;
        if (time != 0) {
            setTimeout(() => {
                this.hideAnnouncement(sendToServer)
            }, 1000 * time);
        }
        if (sendToServer) {
            AnnouncementLable.$.sendToServerShowAnnouncment(text)
        }
    }


    sendToServerShowAnnouncment(text:string){
        ServerClient.$.send(Signal.SHOW_ANNOUNCEMENT, { text: text })
    }

    hideAnnouncement(sendToServer: boolean) {
        this.label.node.active = false;
        if (sendToServer) {
            ServerClient.$.send(Signal.HIDE_ANNOUNCEMENT)
        }
    }

    showTimer(time: number, sendToServer: boolean) {
        this.timer.node.active = true;
        this.timer.string = time.toString()
        this.timerId = setInterval(() => {
            if (time - 1 >= 0) {
                time -= 1;
                this.timer.string = time.toString()
            }
        }, 1000)
        if (sendToServer) {
            ServerClient.$.send(Signal.SHOW_TIMER, { time: time })
        }
    }

    hideTimer(sendToServer: boolean) {
        if (this.timerId != null) {
            clearInterval(this.timerId)
            this.timer.node.active = false;
            this.timerId = null
            if (sendToServer) {
                ServerClient.$.send(Signal.HIDE_TIMER)
            }
        }
    }



    onLoad() {
        // cc.error(`on load announcement`)
        // AnnouncementLable.$ = this
    }

    start() {
        cc.error(`on load announcement`)
        AnnouncementLable.$ = this
    }

    // update (dt) {}
}
