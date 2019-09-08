import Player from "../Entites/GameEntities/Player";
import PlayerManager from "../Managers/PlayerManager";
import CardManager from "../Managers/CardManager";
import ActionManager from "../Managers/ActionManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AdminConsole extends cc.Component {

    @property(cc.Button)
    sendButton: cc.Button = null;

    @property(cc.EditBox)
    consoleEditBox: cc.EditBox = null;


    async sendCommand() {
        let mePlayer = PlayerManager.mePlayer.getComponent(Player)
        let commandText = this.consoleEditBox.string;
        if (commandText != '') {
            let card = CardManager.getCardByName(commandText)
            if (card != null) {
                await mePlayer.giveCard(card)
                await ActionManager.updateActions()
            } else {
                cc.log(`please write the name correctly : ${commandText}`)
            }
        } else {
            this.consoleEditBox.placeholder = 'Please Write Card Name '
        }
    }

    async autoCompleteCardName() {
        let currentText = this.consoleEditBox.string;
        if (currentText != '') {
            let regEx = new RegExp('^' + currentText + '.*', 'i')
            let availableCards = CardManager.allCards.filter(card => {

                if (card.name.search(regEx) != -1) return true
            })
            availableCards.push(...CardManager.inDecksCards.filter(card => {
                if (card.name.search(regEx) != -1) return true
            }))
            cc.log(availableCards.map(card => card.name))
        }
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
