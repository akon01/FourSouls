import ActionMessage from "../Entites/Action Message";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActionHistoryMessage extends cc.Component {

    @property(cc.Node)
    _BGNode: cc.Node = null;

    @property
    _label: cc.Label = null

    @property
    id: number = 0;

    @property
    private _mainMessage: ActionMessage = null

    set mainMessage(actionMessage: ActionMessage) {
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
        return this._mainMessage
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
            text = text + "      " + this.mainMessage.text
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

        this._label.string = this.getText(true)
    }

    unuse() {
        this.node.off("updateLable")
    }

    reuse() {
        this.node.on("updateLable", this.updateLable, this)
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._BGNode = this.node.getChildByName(`BG`)
        this._BGNode.color = cc.color(Math.random() * 255, Math.random() * 255, Math.random() * 255)
        this._label = this.node.getComponent(cc.Label)
        this.node.on("updateLable", this.updateLable, this)
        this.updateLable()
    }

    start() {

    }

    // update (dt) {}
}
