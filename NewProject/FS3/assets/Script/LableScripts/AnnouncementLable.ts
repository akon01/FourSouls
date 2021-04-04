import { Component, error, Label, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { WrapperProvider } from '../Managers/WrapperProvider';
const { ccclass, property } = _decorator;



@ccclass('AnnouncementLable')
export class AnnouncementLable extends Component {

    @property(Label)
    label: Label | null = null;

    @property(Label)
    timer: Label | null = null

    timerId: number | null = null;





    private setLable(text: string) {
        this.label!.string = text;
    }

    showAnnouncement(text: string, time: number, sendToServer: boolean) {
        this.setLable(text)
        this.label!.node.active = true;
        if (time != 0) {
            setTimeout(() => {
                this.hideAnnouncement(sendToServer)
            }, 1000 * time);
        }
        if (sendToServer) {
            WrapperProvider.announcementLableWrapper.out.sendToServerShowAnnouncment(text)
        }
    }


    sendToServerShowAnnouncment(text: string) {
        WrapperProvider.serverClientWrapper.out.send(Signal.SHOW_ANNOUNCEMENT, { text: text })
    }

    hideAnnouncement(sendToServer: boolean) {
        this.label!.node.active = false;
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.HIDE_ANNOUNCEMENT)
        }
    }

    showTimer(time: number, sendToServer: boolean) {
        this.timer!.node.active = true;
        this.timer!.string = time.toString()
        this.timerId = setInterval(() => {
            if (time - 1 >= 0) {
                time -= 1;
                this.timer!.string = time.toString()
            }
        }, 1000)
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.SHOW_TIMER, { time: time })
        }
    }

    hideTimer(sendToServer: boolean) {
        if (this.timerId != null) {
            clearInterval(this.timerId)
            this.timer!.node.active = false;
            this.timerId = null
            if (sendToServer) {
                WrapperProvider.serverClientWrapper.out.send(Signal.HIDE_TIMER)
            }
        }
    }

    start() {
        console.error(`on load announcement`)
        WrapperProvider.announcementLableWrapper.out = this
    }

    // update (dt) {}
}
