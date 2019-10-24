import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import { MAX_NUM_OF_HISTORY_ITEM } from "../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActionLable extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    messages: string[] = []

    @property(cc.NodePool)
    _historyItemPool: cc.NodePool = null;



    @property(cc.ScrollView)
    actionHistory: cc.ScrollView = null;

    static $: ActionLable = null;

    publishMassage(massage: string, timeToDisappear: number) {
        this.label.node.active = true;
        this.label.string = massage
        this.messages.push(massage)
        this.addToHistory(massage)
        ServerClient.$.send(Signal.ACTION_MASSAGE, { massage: massage, timeToDisappear: timeToDisappear })
        if (timeToDisappear != 0) {
            setTimeout(() => {
                this.label.node.active = false;
            }, timeToDisappear * 1000);
        }
    }

    addToHistory(massage: string) {
        if (this._historyItemPool.size() == 0) {
            this._historyItemPool.put(this.actionHistory.content.children[1])
        }
        let item = this._historyItemPool.get();
        item.getComponent(cc.Label).string = massage
        this.actionHistory.content.addChild(item)
    }

    toggleHistory() {
        if (this.actionHistory.enabled) {
            this.hideHistory()
        } else {
            this.showHistory()
        }
    }

    hideHistory() {
        this.actionHistory.node.active = false;

    }

    showHistory() {
        this.actionHistory.node.active = true;
    }

    putMassage(massage: string, timeToDisappear: number) {
        this.label.node.active = true;
        this.label.string = massage
        this.messages.push(massage)
        this.addToHistory(massage)
        if (timeToDisappear != 0) {
            setTimeout(() => {
                this.label.node.active = false;
            }, timeToDisappear * 1000);
        }
    }


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        ActionLable.$ = this;
        this._historyItemPool = new cc.NodePool()
        let itemPrefab = this.actionHistory.content.getChildByName('item')
        for (let i = 2; i < MAX_NUM_OF_HISTORY_ITEM; i++) {
            let newItem = cc.instantiate(itemPrefab)
            newItem.name = `Item${i}`
            newItem.active = true
            this._historyItemPool.put(newItem)

        }
    }

    start() {

    }

    // update (dt) {}
}
