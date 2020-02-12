import AdminCommandButton from "../Admin/Admin Command Button";
import NumberInput from "../Admin/Number Input";
import TextInput from "../Admin/Text Input";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import { ADMIN_COMMANDS, GAME_EVENTS, INPUT_TYPE, ITEM_TYPE, SIGNAL_GROUPS } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Item from "../Entites/CardTypes/Item";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import Player from "../Entites/GameEntities/Player";
import { Logger } from "../Entites/Logger";
import Stack from "../Entites/Stack";
import ActionManager from "../Managers/ActionManager";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import Menu from "./Menu";
import StackLable from "./StackLable";
import Character from "../Entites/CardTypes/Character";
import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AdminConsole extends cc.Component {

    @property(cc.Button)
    sendButton: cc.Button = null;

    @property(cc.EditBox)
    consoleEditBox: cc.EditBox = null;

    @property
    _autoCompleteCard: cc.Node = null;

    @property(cc.Prefab)
    adminCommandButtonPrefab: cc.Prefab = null

    @property(cc.Prefab)
    textInput: cc.Prefab = null

    @property(cc.Prefab)
    numberInput: cc.Prefab = null

    @property(cc.Node)
    menuNode: cc.Node = null

    static $: AdminConsole

    static noPrintSignal: string[] = []

    async doCommand(command: ADMIN_COMMANDS, extra?: any) {
        const mePlayer = PlayerManager.mePlayer.getComponent(Player)
        let flag
        if (extra) { flag = extra.split(" ")[1] }
        switch (command) {
            case ADMIN_COMMANDS.CARD:
                let card = CardManager.getCardByName(extra)
                if (card == null) {
                    card = this._autoCompleteCard;
                }
                await mePlayer.giveCard(card)
                await ActionManager.updateActions()
                break;
            case ADMIN_COMMANDS.ROLL:
                await mePlayer.gainRollBonus(Number(extra), true, true)
                await mePlayer.gainAttackRollBonus(Number(extra), true, true)
                break;
            case ADMIN_COMMANDS.DICE:
                const num = Number.parseInt(extra)
                if (num > 0 && num < 7) {

                    mePlayer.setDiceAdmin = num
                } else {
                    mePlayer.setDiceAdmin = 0
                }
                cc.log(`set all rolls to ${extra}`)
                break;
            case ADMIN_COMMANDS.HP:
                await mePlayer.gainHeartContainer(Number.parseInt(extra), true, true)
                break;
            case ADMIN_COMMANDS.SOUL:
                const soulCard = CardManager.monsterDeck.getComponent(Deck).drawSpecificCard(CardManager.monsterDeck.getComponent(Deck)._cards.filter(card => card.getComponent(Monster).souls > 0)[0], true)
                await mePlayer.getSoulCard(soulCard, true)
                break
            case ADMIN_COMMANDS.DMG:
                await mePlayer.gainDMG(Number.parseInt(extra), true, true)
                break
            case ADMIN_COMMANDS.HEAL:
                await mePlayer.heal(Number.parseInt(extra), true)
                break;
            case ADMIN_COMMANDS.COINS:
                // tslint:disable-next-line: radix
                await mePlayer.changeMoney(Number.parseInt(extra), true)
                break;
            case ADMIN_COMMANDS.LOG:
                const logGroups = new SIGNAL_GROUPS();

                if (AdminConsole.noPrintSignal.includes(extra)) {
                    if (flag == "g") {
                        cc.log(`command text is ${extra}`)
                        const chosenGroup = logGroups.getGroup(extra)
                        if (chosenGroup) {
                            chosenGroup.forEach(word => {
                                AdminConsole.noPrintSignal.splice(AdminConsole.noPrintSignal.indexOf(word))
                            })
                            cc.log(`resume showing logs for ${extra} group`)
                        } else { cc.log(`no group found`) }
                    } else {
                        AdminConsole.noPrintSignal.splice(AdminConsole.noPrintSignal.indexOf(extra))
                        cc.log(`resume showing logs for ${extra}`)
                    }
                } else {
                    if (flag == "g") {
                        cc.log(`command text is ${extra}`)
                        const chosenGroup = logGroups.getGroup(extra)
                        if (chosenGroup) {
                            chosenGroup.forEach(word => {
                                AdminConsole.noPrintSignal.push(word)
                            })
                            cc.log(`stop showing logs for ${extra} group`)
                        } else { cc.log("no group found") }
                    } else {
                        AdminConsole.noPrintSignal.push(extra)
                        cc.log(`stop showing logs for ${extra}`)
                    }
                }
                break

            case ADMIN_COMMANDS.CHARGE:
                for (let i = 0; i < mePlayer.activeItems.length; i++) {
                    const item = mePlayer.activeItems[i];
                    await item.getComponent(Item).rechargeItem(true)
                }
                // tslint:disable-next-line: no-floating-promises
                ActionManager.updateActions()
                break;
            case ADMIN_COMMANDS.STACKTRACE:
                cc.error(`stack trace`)
                break
            case ADMIN_COMMANDS.STACK:
                cc.log(StackLable.$.label.string)
                break
            // case ADMIN_COMMANDS.CHAR:
            //     //let mePlayer = PlayerManager.mePlayer.getComponent(Player)
            //     mePlayer.activeItems.splice(mePlayer.activeItems.indexOf(mePlayer.character))
            //     if (mePlayer.characterItem.getComponent(Item).type == ITEM_TYPE.PASSIVE) {
            //         mePlayer.activeItems.splice(mePlayer.passiveItems.indexOf(mePlayer.characterItem))
            //     } else { mePlayer.activeItems.splice(mePlayer.activeItems.indexOf(mePlayer.characterItem)) }
            //     const fullCharCard: {
            //         char: cc.Node;
            //         item: cc.Node;
            //     } = CardManager.characterDeck.find(char => char.char.name == extra)
            //     await PlayerManager.assignCharacterToPlayer(fullCharCard, mePlayer, true)
            //     break
            case ADMIN_COMMANDS.RUN:
                if (flag != undefined || flag != " ") { extra = extra.split(" ")[0] }

                switch (extra) {
                    case "test":
                        this.testForEmptyEffects()
                        break;
                    case "char":
                        const charAndItem = CardManager.characterDeck.find(item => item.char.getComponent(Card).cardName.toLowerCase() == flag.toLowerCase())
                        PlayerManager.mePlayer.getComponent(Player).character.setParent(null)
                        PlayerManager.mePlayer.getComponent(Player).characterItem.setParent(null)
                        await PlayerManager.mePlayer.getComponent(Player).setCharacter(charAndItem.char, charAndItem.item)
                        ServerClient.$.send(Signal.ASSIGN_CHAR_TO_PLAYER, { playerId: PlayerManager.mePlayer.getComponent(Player).playerId, charCardId: charAndItem.char.getComponent(Card)._cardId, itemCardId: charAndItem.item.getComponent(Card)._cardId });
                    case "test2":
                        mePlayer.updateProperties({ _isDead: true })
                        break;
                    case "emptyStack":
                        whevent.emit(GAME_EVENTS.STACK_EMPTIED)
                        break;
                    case "respond":
                        cc.log(flag)
                        mePlayer.respondWithNoAction(flag)
                        Stack.hasOtherPlayerRespond = false;
                        whevent.emit(GAME_EVENTS.PLAYER_RESPOND)
                        break
                    case "error":
                        const e = new Error('test message')
                        Logger.error(e)
                    //  Logger.error(JSON.stringify(e.stack))
                    //  Logger.error({ test: true })
                    default:
                        break;
                }
                break;
            default:
                this.consoleEditBox.placeholder = "Unknown command, try help"
                break;
                ActionManager.updateActions()
        }
    }

    async sendCommand() {
        const mePlayer = PlayerManager.mePlayer.getComponent(Player)
        let commandText = this.consoleEditBox.string;
        const cmdWord = commandText.split(" ")[0]
        const flag = commandText.split(" ")[1]
        if (flag == "g") {
            commandText = commandText.replace(cmdWord + " g" + " ", "")
        } else { commandText = commandText.replace(cmdWord + " ", "") }

        const logGroups = new SIGNAL_GROUPS();

        switch (cmdWord) {
            case "card":
                let card = CardManager.getCardByName(commandText)
                if (card == null) {
                    card = this._autoCompleteCard;
                }
                await mePlayer.giveCard(card)
                await ActionManager.updateActions()
                break;
            case "roll":
                await mePlayer.gainRollBonus(Number(commandText), true, true)
                await mePlayer.gainAttackRollBonus(Number(commandText), true, true)
                break;
            case "dice":
                const num = Number.parseInt(commandText)
                if (num > 0 && num < 7) {

                    mePlayer.setDiceAdmin = num
                } else {
                    mePlayer.setDiceAdmin = 0
                }
                cc.log(`set all rolls to ${commandText}`)
                break;
            case "hp":
                await mePlayer.gainHeartContainer(Number.parseInt(commandText), true, true)
                break;
            case `soul`:
                const soulCard = CardManager.monsterDeck.getComponent(Deck).drawSpecificCard(CardManager.monsterDeck.getComponent(Deck)._cards.filter(card => card.getComponent(Monster).souls > 0)[0], true)
                await mePlayer.getSoulCard(soulCard, true)
                break
            case `dmg`:
                await mePlayer.gainDMG(Number.parseInt(commandText), true, true)
                break
            case "heal":
                await mePlayer.heal(Number.parseInt(commandText), true)
                break;
            case "coins":
                // tslint:disable-next-line: radix
                await mePlayer.changeMoney(Number.parseInt(commandText), true)
                break;
            case "log":
                if (AdminConsole.noPrintSignal.includes(commandText)) {
                    if (flag == "g") {
                        cc.log(`command text is ${commandText}`)
                        const chosenGroup = logGroups.getGroup(commandText)
                        if (chosenGroup) {
                            chosenGroup.forEach(word => {
                                AdminConsole.noPrintSignal.splice(AdminConsole.noPrintSignal.indexOf(word))
                            })
                            cc.log(`resume showing logs for ${commandText} group`)
                        } else { cc.log(`no group found`) }
                    } else {
                        AdminConsole.noPrintSignal.splice(AdminConsole.noPrintSignal.indexOf(commandText))
                        cc.log(`resume showing logs for ${commandText}`)
                    }
                } else {
                    if (flag == "g") {
                        cc.log(`command text is ${commandText}`)
                        const chosenGroup = logGroups.getGroup(commandText)
                        if (chosenGroup) {
                            chosenGroup.forEach(word => {
                                AdminConsole.noPrintSignal.push(word)
                            })
                            cc.log(`stop showing logs for ${commandText} group`)
                        } else { cc.log("no group found") }
                    } else {
                        AdminConsole.noPrintSignal.push(commandText)
                        cc.log(`stop showing logs for ${commandText}`)
                    }
                }
                break
            case "help":
                cc.log('available commands:  log,coins X,heal X,hp X,dmg X,dice X,soul,charge,roll +/-X,card "Name",run,stackTrace,stack')
                break;
            case "charge":
                for (let i = 0; i < mePlayer.activeItems.length; i++) {
                    const item = mePlayer.activeItems[i];
                    await item.getComponent(Item).rechargeItem(true)
                }
                // tslint:disable-next-line: no-floating-promises
                ActionManager.updateActions()
                break;
            case "stackTrace":
                cc.error(`stack trace`)
                break
            case "stack":
                cc.log(StackLable.$.label.string)
                break
            case "char":
                //let mePlayer = PlayerManager.mePlayer.getComponent(Player)
                mePlayer.activeItems.splice(mePlayer.activeItems.indexOf(mePlayer.character))
                if (mePlayer.characterItem.getComponent(Item).type == ITEM_TYPE.PASSIVE) {
                    mePlayer.activeItems.splice(mePlayer.passiveItems.indexOf(mePlayer.characterItem))
                } else { mePlayer.activeItems.splice(mePlayer.activeItems.indexOf(mePlayer.characterItem)) }
                const fullCharCard: {
                    char: cc.Node;
                    item: cc.Node;
                } = CardManager.characterDeck.find(char => char.char.name == commandText)
                mePlayer.character.setParent(null)
                mePlayer.characterItem.setParent(null)
                await PlayerManager.assignCharacterToPlayer(fullCharCard, mePlayer, true)
                break
            case "run":
                cc.log(commandText)
                switch (commandText) {
                    case "test":
                        this.testForEmptyEffects()
                        break;

                    default:
                        break;
                }
                break;
            case "diceNum":
                mePlayer.dice.changeSprite(Number.parseInt(commandText))
                break;
            default:
                // this.consoleEditBox.placeholder = "Unknown command, try help"
                break;
        }

    }

    testForEmptyEffects() {
        let cardsWithEffects = CardManager.allCards.filter(card => card.getComponent(CardEffect))
        cardsWithEffects = cardsWithEffects.concat(CardManager.inDecksCards.filter(card => card.getComponent(CardEffect)))
        const cardSet = new Set<cc.Node>();
        for (const card of cardsWithEffects) {
            cardSet.add(card)
        }
        let finalString: string = ""
        cardSet.forEach((card) => {
            let cardString = `${card.name}:\n`
            const effectComp = card.getComponent(CardEffect);
            let count = 0
            for (const effect of effectComp.activeEffects) {
                if (!effect) { count++ }
            }
            if (count != 0) {
                cardString = cardString.concat(`Empty Active Effects:${count}\n`)
            }
            count = 0
            let passiveString = "No Conditions:\n"
            for (const effect of effectComp.passiveEffects) {
                if (!effect) { count++ }
                if (effect.getComponent(Effect).conditions.length == 0) { passiveString = passiveString + `${effect.name} \n` }
            }
            if (count != 0) {
                cardString = cardString.concat(`Empty Passive Effects:${count}\n`)
            }
            if (passiveString != "No Conditions:\n") {
                cardString = cardString.concat(passiveString)
            }
            count = 0
            for (const effect of effectComp.paidEffects) {
                if (!effect) { count++ }
            }
            if (count != 0) {
                cardString = cardString.concat(`Empty Paid Effects:${count}\n`)
            }
            count = 0
            for (const effect of effectComp.toAddPassiveEffects) {
                if (!effect) { count++ }
            }
            if (count != 0) {
                cardString = cardString.concat(`Empty toAddPassives Effects:${count}\n`)
            }
            count = 0
            cardString = cardString.concat(`\n`)
            if (cardString != `${card.name}:\n\n`) {
                finalString = finalString.concat(cardString);
            }
        })
        cc.log(finalString)
        Logger.log(finalString)
    }

    async autoCompleteCardName(text?: string) {

        let currentText
        if (text) {
            currentText = text
        } else {
            currentText = this.consoleEditBox.string;
        }
        const cmdWord = currentText.split(" ")[0]
        currentText = currentText.replace(cmdWord + " ", "")
        if (currentText != "" && cmdWord == "card") {
            const regEx = new RegExp("^" + currentText.trim() + ".*", "i")
            const availableCards = CardManager.allCards.filter(cardNode => {
                const card = cardNode.getComponent(Card)
                if (regEx.test(card.cardName)) { return true }
            })
            availableCards.push(...CardManager.inDecksCards.filter(cardNode => {
                const card = cardNode.getComponent(Card)
                if (regEx.test(card.cardName)) { return true }
            }))
            cc.log(availableCards.map(card => card.getComponent(Card).cardName))
            this._autoCompleteCard = availableCards[availableCards.length - 1]
        }
    }

    showMenu() {
        this.menuNode.active = true
        if (this.menuNode.getComponentInChildren(Menu).currentMenu != "AdminMenu") {
            this.menuNode.getComponentInChildren(Menu).setAdminMenu()
        }
    }

    hideMenu() {
        this.menuNode.active = false;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        AdminConsole.$ = this
        // interface adminCommand { command: ADMIN_COMMANDS, input: INPUT_TYPE }
        // const availableCommands: adminCommand[] = [
        //     { command: ADMIN_COMMANDS.CARD, input: INPUT_TYPE.TEXT_INPUT },
        //     { command: ADMIN_COMMANDS.CHARGE, input: INPUT_TYPE.NONE },
        //     { command: ADMIN_COMMANDS.COINS, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.DICE, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.DMG, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.HEAL, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.HP, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.LOG, input: INPUT_TYPE.TEXT_INPUT },
        //     { command: ADMIN_COMMANDS.ROLL, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.RUN, input: INPUT_TYPE.TEXT_INPUT },
        //     { command: ADMIN_COMMANDS.SOUL, input: INPUT_TYPE.NONE },
        //     { command: ADMIN_COMMANDS.STACK, input: INPUT_TYPE.NONE },
        //     { command: ADMIN_COMMANDS.STACKTRACE, input: INPUT_TYPE.NONE },
        // ]
        // availableCommands.forEach(command => {
        //     const adminC = cc.instantiate(this.adminCommandButtonPrefab)
        //     adminC.getComponent(AdminCommandButton).adminCommand = command.command
        //     if (command.input == INPUT_TYPE.NUMBER_INPUT) {
        //         adminC.getComponent(AdminCommandButton).setInput(cc.instantiate(this.numberInput))
        //     } else if (command.input == INPUT_TYPE.TEXT_INPUT) {
        //         adminC.getComponent(AdminCommandButton).setInput(cc.instantiate(this.textInput))
        //     }
        //     adminC.setParent(this.menuNode.getChildByName("Menu Layout"))

        // });
        const logGroups = new SIGNAL_GROUPS();
        const chosenGroup = logGroups.getGroup("test")
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
