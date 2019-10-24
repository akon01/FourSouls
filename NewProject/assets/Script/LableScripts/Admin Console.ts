import Effect from "../CardEffectComponents/CardEffects/Effect";
import { SIGNAL_GROUPS, ITEM_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Player from "../Entites/GameEntities/Player";
import { Logger } from "../Entites/Logger";
import ActionManager from "../Managers/ActionManager";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import Item from "../Entites/CardTypes/Item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AdminConsole extends cc.Component {

    @property(cc.Button)
    sendButton: cc.Button = null;

    @property(cc.EditBox)
    consoleEditBox: cc.EditBox = null;

    @property
    _autoCompleteCard: cc.Node = null;

    static noPrintSignal: string[] = []


    async sendCommand() {
        let mePlayer = PlayerManager.mePlayer.getComponent(Player)
        let commandText = this.consoleEditBox.string;
        let cmdWord = commandText.split(' ')[0]
        let flag = commandText.split(' ')[1]
        if (flag == 'g') {
            commandText = commandText.replace(cmdWord + ' g' + ' ', '')
        } else commandText = commandText.replace(cmdWord + ' ', '')

        const logGroups = new SIGNAL_GROUPS();

        switch (cmdWord) {
            case 'card':
                let card = CardManager.getCardByName(commandText)
                if (card == null) {
                    card = this._autoCompleteCard;
                }
                await mePlayer.giveCard(card)
                await ActionManager.updateActions()
                break;
            case 'roll':
                await mePlayer.gainRollBonus(Number(commandText), true, true)
                await mePlayer.gainAttackRollBonus(Number(commandText), true, true)
                break;
            case 'dice':
                let num = Number.parseInt(commandText)
                if (num > 0 && num < 7) {

                    mePlayer.setDiceAdmin = num
                } else {
                    mePlayer.setDiceAdmin = 0
                }
                cc.log(`set all rolls to ${commandText}`)
                break;
            case 'hp':
                await mePlayer.gainHeartContainer(Number.parseInt(commandText), true, true)
                break;
            case 'heal':
                await mePlayer.heal(Number.parseInt(commandText), true)
                break;
            case 'coins':
                await mePlayer.changeMoney(Number.parseInt(commandText), true)
                break;
            case 'log':
                if (AdminConsole.noPrintSignal.includes(commandText)) {
                    if (flag == 'g') {
                        cc.log(`command text is ${commandText}`)
                        let chosenGroup = logGroups.getGroup(commandText)
                        if (chosenGroup) {
                            chosenGroup.forEach(word => {
                                AdminConsole.noPrintSignal.splice(AdminConsole.noPrintSignal.indexOf(word))
                            })
                            cc.log(`resume showing logs for ${commandText} group`)
                        } else cc.log(`no group found`)
                    } else {
                        AdminConsole.noPrintSignal.splice(AdminConsole.noPrintSignal.indexOf(commandText))
                        cc.log(`resume showing logs for ${commandText}`)
                    }
                } else {
                    if (flag == 'g') {
                        cc.log(`command text is ${commandText}`)
                        let chosenGroup = logGroups.getGroup(commandText)
                        if (chosenGroup) {
                            chosenGroup.forEach(word => {
                                AdminConsole.noPrintSignal.push(word)
                            })
                            cc.log(`stop showing logs for ${commandText} group`)
                        } else cc.log('no group found')
                    } else {
                        AdminConsole.noPrintSignal.push(commandText)
                        cc.log(`stop showing logs for ${commandText}`)
                    }
                }
                break
            case 'help':
                cc.log('available commands:  log,coins,heal,hp,dice,roll,card,run')
                break;
            case 'char':
                //let mePlayer = PlayerManager.mePlayer.getComponent(Player)
                mePlayer.activeItems.splice(mePlayer.activeItems.indexOf(mePlayer.character))
                if (mePlayer.characterItem.getComponent(Item).type == ITEM_TYPE.PASSIVE) {
                    mePlayer.activeItems.splice(mePlayer.passiveItems.indexOf(mePlayer.characterItem))
                } else mePlayer.activeItems.splice(mePlayer.activeItems.indexOf(mePlayer.characterItem))
                let fullCharCard: {
                    char: cc.Node;
                    item: cc.Node;
                } = CardManager.characterDeck.find(char => char.char.name == commandText)
                await PlayerManager.assignCharacterToPlayer(fullCharCard, mePlayer, true)
                break
            case 'run':
                switch (commandText) {
                    case 'test':
                        this.testForEmptyEffects()
                        break;
                    default:
                        break;
                }
                break;
            default:
                this.consoleEditBox.placeholder = 'Unknown command, try help'
                break;
        }



    }


    testForEmptyEffects() {
        let cardsWithEffects = CardManager.allCards.filter(card => card.getComponent(CardEffect))
        cardsWithEffects = cardsWithEffects.concat(CardManager.inDecksCards.filter(card => card.getComponent(CardEffect)))
        let cardSet = new Set<cc.Node>();
        for (const card of cardsWithEffects) {
            cardSet.add(card)
        }
        let finalString: string = ''
        cardSet.forEach((card) => {
            let cardString = `${card.name}:\n`
            let effectComp = card.getComponent(CardEffect);
            let count = 0
            for (const effect of effectComp.activeEffects) {
                if (!effect) count++
            }
            if (count != 0)
                cardString = cardString.concat(`Empty Active Effects:${count}\n`)
            count = 0
            let passiveString = 'No Conditions:\n'
            for (const effect of effectComp.passiveEffects) {
                if (!effect) count++
                if (effect.getComponent(Effect).conditions.length == 0) passiveString = passiveString + `${effect.name} \n`
            }
            if (count != 0)
                cardString = cardString.concat(`Empty Passive Effects:${count}\n`)
            if (passiveString != 'No Conditions:\n')
                cardString = cardString.concat(passiveString)
            count = 0
            for (const effect of effectComp.paidEffects) {
                if (!effect) count++
            }
            if (count != 0)
                cardString = cardString.concat(`Empty Paid Effects:${count}\n`)
            count = 0
            for (const effect of effectComp.toAddPassiveEffects) {
                if (!effect) count++
            }
            if (count != 0)
                cardString = cardString.concat(`Empty toAddPassives Effects:${count}\n`)
            count = 0
            cardString = cardString.concat(`\n`)
            if (cardString != `${card.name}:\n\n`)
                finalString = finalString.concat(cardString);
        })
        cc.log(finalString)
        Logger.log(finalString)
    }


    async autoCompleteCardName() {
        let currentText = this.consoleEditBox.string;
        let cmdWord = currentText.split(' ')[0]
        currentText = currentText.replace(cmdWord + ' ', '')
        if (currentText != '' && cmdWord == 'card') {
            let regEx = new RegExp('^' + currentText + '.*', 'i')
            let availableCards = CardManager.allCards.filter(card => {

                if (card.name.search(regEx) != -1) return true
            })
            availableCards.push(...CardManager.inDecksCards.filter(card => {
                if (card.name.search(regEx) != -1) return true
            }))
            cc.log(availableCards.map(card => card.name))
            this._autoCompleteCard = availableCards[availableCards.length - 1]
        }
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        const logGroups = new SIGNAL_GROUPS();
        let chosenGroup = logGroups.getGroup('test')
        if (chosenGroup) {
            chosenGroup.forEach(word => {
                AdminConsole.noPrintSignal.push(word)
            })
        }
    }

    start() {

    }

    // update (dt) {}
}
