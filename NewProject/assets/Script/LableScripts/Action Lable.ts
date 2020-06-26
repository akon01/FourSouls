import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { GAME_EVENTS, MAX_NUM_OF_HISTORY_ITEM } from "../Constants";
import ActionMessage from "../Entites/Action Message";
import ActionHistoryMessage from "./Action History Message";
import { whevent } from "../../ServerClient/whevent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActionLable extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    messages: ActionMessage[] = []

    @property(cc.NodePool)
    _historyItemPool: cc.NodePool = null;

    @property(cc.ScrollView)
    actionHistory: cc.ScrollView = null;

    @property
    actionHistoryMessages: ActionHistoryMessage[] = []

    static $: ActionLable = null;

    @property
    _messagesId: number = 0

    publishMassage(massage: string, timeToDisappear: number, doNotAddToHistory?: boolean, childOfId?: number) {
        //  this.label.node.active = true;
        const actionMessage = new ActionMessage(this._messagesId++, massage);
        if (!childOfId) {
            this.messages.push(actionMessage)
        }
        whevent.emit(GAME_EVENTS.ACTION_LABLE_UPDATE)
        //if (!doNotAddToHistory) { this.addToHistory(actionMessage, childOfId) }
        try {
            this.addToHistory(actionMessage, childOfId)
        } catch (error) {
            cc.error(`could not add to history`, [massage, childOfId])
        }
        ServerClient.$.send(Signal.ACTION_MASSAGE_ADD, { massage: actionMessage, childOfId: childOfId })
        if (timeToDisappear != 0) {
            setTimeout(() => {
                this.removeMessage(actionMessage.id, true)
                //this.messages.splice(this.messages.indexOf(actionMessage), 1)
            }, timeToDisappear * 1000);
        }
        return actionMessage.id
    }

    addToHistory(massage: ActionMessage, childOfId?: number) {
        if (this.actionHistoryMessages.length > 50) {
            this.removeFromHistroy(this.actionHistoryMessages[0].id)
        }
        if (!childOfId) {
            if (this._historyItemPool.size() == 0) {
                // const oldActionHistoryMessage = this.actionHistory.content.children[0];
                // oldActionHistoryMessage.getComponent(ActionHistoryMessage).removeMessage(oldActionHistoryMessage.getComponent(ActionHistoryMessage).id)
                // this._historyItemPool.put(oldActionHistoryMessage)
                // this.actionHistoryMessages.splice(this.actionHistoryMessages.indexOf(oldActionHistoryMessage.getComponent(ActionHistoryMessage)), 1)
                this.removeFromHistroy(this.actionHistoryMessages[0].id)
            }
            const item = this._historyItemPool.get();
            //  item.getComponent(cc.Label).string = massage
            const actionHistoryM = item.getComponent(ActionHistoryMessage);
            this.actionHistory.content.addChild(item)
            actionHistoryM.addMessage(massage)
            this.actionHistoryMessages.push(actionHistoryM)
        } else {
            const mainMessage = this.actionHistoryMessages.find(item => item.id == childOfId)
            if (mainMessage) {

                mainMessage.addMessage(massage)
            } else {
                throw new Error(`no action history message was found for id ${childOfId}`)
            }
        }
    }

    removeFromHistroy(id: number) {
        const actionMessage = this.actionHistoryMessages.find(am => am.id == id)
        if (!actionMessage) {
            return
        }
        actionMessage.removeMessage(id)
        this.actionHistory.content.removeChild(actionMessage.node)
        this.actionHistoryMessages.splice(this.actionHistoryMessages.findIndex(am => am.id == id), 1)
        this._historyItemPool.put(actionMessage.node)
    }

    removeMessage(id: number, sendToServer: boolean) {
        let messageToRemove = this.messages.find(message => { message.id == id; });


        if (messageToRemove) {
            this.messages.splice(this.messages.indexOf(messageToRemove), 1)
        } else {
            for (const actionHistoryMessage of this.actionHistoryMessages) {
                for (const message of actionHistoryMessage._additionalMessages) {
                    if (message.id == id) {
                        messageToRemove = message
                        break;
                    }
                }
                if (messageToRemove) {
                    actionHistoryMessage.removeMessage(id)
                    whevent.emit(GAME_EVENTS.ACTION_LABLE_UPDATE)
                    if (sendToServer) {
                        ServerClient.$.send(Signal.ACTION_MASSAGE_REMOVE, { id: id })
                    }
                    break;
                }
            }
        }
    }

    toggleHistory() {
        if (this.actionHistory.node.active) {
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

        //  this.actionHistory.node.zIndex
    }

    putMassage(massage: ActionMessage, childOfId?: number) {
        this.label.node.active = true;
        this._messagesId++
        if (!childOfId) {
            this.messages.push(massage)
        }
        try {
            this.addToHistory(massage, childOfId)
        } catch (error) {
            cc.error(`could not add to history`, [massage, childOfId])
        }
        whevent.emit(GAME_EVENTS.ACTION_LABLE_UPDATE)
    }

    updateLable() {
        let text = ""
        if (this.messages.length != 0) {
            const actionHistoryMessage = this.actionHistoryMessages.find(item => item.id == this.messages[this.messages.length - 1].id);
            // for (let i = 0; i < this.messages.length; i++) {
            //     const message = this.messages[i];
            //     if (message.id == undefined || message.text == undefined) {
            //         this.messages.splice(i, 1)
            //         continue
            //     }
            //     text = text + message.text + "\n"
            // }
            if (actionHistoryMessage) {
                text = text + actionHistoryMessage.getText(false)
            }
            //  else {
            //     text = text +
            // }
        }

        this.label.string = text

    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        ActionLable.$ = this;
        this._historyItemPool = new cc.NodePool()
        this._historyItemPool.poolHandlerComp = `ActionHistoryMessage`
        const itemPrefab = this.actionHistory.content.getChildByName("item")
        for (let i = 2; i < MAX_NUM_OF_HISTORY_ITEM; i++) {
            const newItem = cc.instantiate(itemPrefab)
            newItem.name = `Item${i}`
            newItem.active = true
            this._historyItemPool.put(newItem)

        }
        whevent.on(GAME_EVENTS.ACTION_LABLE_UPDATE, this.updateLable, this)
        whevent.on(GAME_EVENTS.STACK_EMPTIED, () => {
            for (const message of this.messages) {
                this.removeMessage(message.id, true)
            }
            // StackLable.updateLable()
        })
    }

    start() {

    }

    // update (dt) {}
}
