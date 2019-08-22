import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActionLable extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    messages: string[] = []

    static $: ActionLable = null;

    publishMassage(massage: string, timeToDisappear: number) {
        this.label.node.active = true;
        this.label.string = massage
        this.messages.push(massage)
        ServerClient.$.send(Signal.ACTION_MASSAGE, { massage: massage, timeToDisappear: timeToDisappear })
        if (timeToDisappear != 0) {
            setTimeout(() => {
                this.label.node.active = false;
            }, timeToDisappear * 1000);
        }
    }

    putMassage(massage: string, timeToDisappear: number) {
        this.label.node.active = true;
        this.label.string = massage
        this.messages.push(massage)
        if (timeToDisappear != 0) {
            setTimeout(() => {
                this.label.node.active = false;
            }, timeToDisappear * 1000);
        }
    }


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        ActionLable.$ = this;
    }

    start() {

    }

    // update (dt) {}
}
