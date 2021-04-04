import { _decorator, Component, Node, Label, Sprite, color } from 'cc';
const { ccclass, property } = _decorator;

import { ActionMessage } from "../Entites/ActionMessage";

@ccclass('ActionHistoryMessage')
export class ActionHistoryMessage extends Component {

    @property(Node)
    _BGNode: Node | null = null;

    @property
    _label: Label | null = null

    @property
    id: number = 0;

    @property
    private _mainMessage: ActionMessage | null = null

    set mainMessage(actionMessage: ActionMessage | null) {
        if (actionMessage) {
            this.id = actionMessage.id
            this._mainMessage = actionMessage
        } else {
            this.id = 0
            this._mainMessage = null
            this._additionalMessages.forEach(message => this.removeMessage(message.id))
        }
        this.node.emit("updateLable")
    }

    get mainMessage() {
        return this._mainMessage!
    }


    @property
    _additionalMessages: ActionMessage[] = []


    addMessage(message: ActionMessage) {
        if (this.mainMessage == null) {
            this.mainMessage = message
        } else {
            this._additionalMessages.push(message)
        }
        this.node.emit("updateLable")
    }

    removeMessage(id: number) {
        if (id == this.id) {
            this.mainMessage = null
        } else {
            for (let i = 0; i < this._additionalMessages.length; i++) {
                const message = this._additionalMessages[i];
                if (message.id == id) {
                    //  this._additionalMessages.splice(i, 1)
                    message.isRemoved = true
                    break
                }
            }
        }
        this.node.emit("updateLable")
    }

    getText(showRemoved: boolean) {
        let text = ``
        if (this._mainMessage) {
            text = text + "      " + this.mainMessage!.text
        }
        text = text + "\n"
        if (this._additionalMessages.length > 0) {
            for (const message of this._additionalMessages) {
                if (showRemoved) {
                    text = text + message.text + "\n"
                } else if (!message.isRemoved) {
                    text = text + message.text + "\n"
                }
            }

        }
        return text
    }

    updateLable() {

        if (this._label)
            this._label!.string = this.getText(true)
    }

    unuse() {
        this.node.off("updateLable")
    }

    reuse() {
        this.node.on("updateLable", this.updateLable, this)
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._BGNode = this.node.getChildByName(`BG`)!
        this._BGNode.getComponent(Sprite)!.color.set(color(Math.random() * 255, Math.random() * 255, Math.random() * 255))
        this._label = this.node.getComponent(Label)!
        this.node.on("updateLable", this.updateLable, this)
        this.updateLable()
    }


    // update (dt) {}
}
