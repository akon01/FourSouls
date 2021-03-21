import { Button, Component, EditBox, error, log, Node, Prefab, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { ADMIN_COMMANDS, CARD_TYPE, GAME_EVENTS, ITEM_TYPE, SIGNAL_GROUPS } from "../Constants";
import { CardEffect } from "../Entites/CardEffect";
import { Item } from "../Entites/CardTypes/Item";
import { Card } from "../Entites/GameEntities/Card";
import { Deck } from "../Entites/GameEntities/Deck";
import { Player } from "../Entites/GameEntities/Player";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { CardAutoComplete } from "./CardAutoComplete";
import { Menu } from "./Menu";

const { ccclass, property, type } = _decorator;


@ccclass('AdminConsole')
export class AdminConsole extends Component {

    @property(Button)
    sendButton: Button | null = null;

    @property(EditBox)
    consoleEditBox: EditBox | null = null;

    @property
    _autoCompleteCard: Node | null = null;

    @property(Prefab)
    adminCommandButtonPrefab: Prefab | null = null

    @property(Prefab)
    textInput: Prefab | null = null

    @property(Prefab)
    numberInput: Prefab | null = null

    @property(Node)
    menuNode: Node | null = null

    autoComplete = new CardAutoComplete();


    noPrintSignal: string[] = []

    isTestModeSet: boolean = false



    async doCommand(command: ADMIN_COMMANDS, extra?: any) {
        const mePlayer = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!
        let flag: any
        const myActiveItems = mePlayer.getActiveItems();
        const monsterDeck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!;
        if (extra) { flag = extra.split(" ")[1] }
        switch (command) {
            case ADMIN_COMMANDS.NEXT_ITEM:
                const newItem = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!.drawCard(true)
                mePlayer.addItem(newItem, true, true)
                break
            case ADMIN_COMMANDS.NEXT_LOOT:
                let newLoot = WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!.drawCard(true)
                mePlayer.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true, [newLoot])
                break
            case ADMIN_COMMANDS.NEXT_MONSTER:
                const newMonster = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!.drawCard(true)
                await WrapperProvider.monsterFieldWrapper.out.addMonsterToExsistingPlace(WrapperProvider.monsterFieldWrapper.out.getMonsterCardHoldersIds()[mePlayer.getMonsterCardHolderId()], newMonster, true)
                mePlayer.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true, [newMonster])
                break
            case ADMIN_COMMANDS.SET_TEST_MODE:
                if (!this.isTestModeSet) {
                    mePlayer.attackPlays += 999;
                    mePlayer.buyPlays += 999;
                    mePlayer.lootCardPlays += 999;
                    log(`test mode set`)
                } else {
                    mePlayer.attackPlays = 1;
                    mePlayer.buyPlays = 1;
                    mePlayer.lootCardPlays = 1;
                    log(`test mode unset`)
                }
                break
            case ADMIN_COMMANDS.CARD:
                let card: Node | null = null
                //    card = this._autoCompleteCard;
                debugger
                card = this.autoComplete.getClosestCardByText(extra)
                if (card == null) {
                    card = WrapperProvider.cardManagerWrapper.out.getCardByName(extra)
                }
                if (!card) { debugger; throw new Error("No Card Found"); }
                await mePlayer.giveCard(card)
                await WrapperProvider.actionManagerWrapper.out.updateActions()
                break;
            case ADMIN_COMMANDS.ROLL:
                await mePlayer.gainRollBonus(Number(extra), true, true)
                await mePlayer.gainAttackRollBonus(Number(extra), true, false, true)
                break;
            case ADMIN_COMMANDS.DICE:
                const num = Number.parseInt(extra)
                if (num > 0 && num < 7) {

                    mePlayer.setDiceAdmin = num
                } else {
                    mePlayer.setDiceAdmin = 0
                }
                log(`set all rolls to ${extra}`)
                break;
            case ADMIN_COMMANDS.HP:
                await mePlayer.gainHeartContainer(Number.parseInt(extra), true, true)
                break;
            case ADMIN_COMMANDS.SOUL:

                const soulCard = monsterDeck.drawSpecificCard(monsterDeck.getCards().filter(card => card.getComponent(Card)!.souls > 0)[0], true)
                if (!soulCard) { debugger; throw new Error("No Soul Card"); }

                await mePlayer.receiveSoulCard(soulCard, true)
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

                if (WrapperProvider.adminConsoleWrapper.out.noPrintSignal.indexOf(extra) >= 0) {
                    if (flag == "g") {
                        log(`command text is ${extra}`)
                        const chosenGroup = logGroups.getGroup(extra)
                        if (chosenGroup) {
                            chosenGroup.forEach((word: string) => {
                                WrapperProvider.adminConsoleWrapper.out.noPrintSignal.splice(WrapperProvider.adminConsoleWrapper.out.noPrintSignal.indexOf(word))
                            })
                            log(`resume showing logs for ${extra} group`)
                        } else { log(`no group found`) }
                    } else {
                        WrapperProvider.adminConsoleWrapper.out.noPrintSignal.splice(WrapperProvider.adminConsoleWrapper.out.noPrintSignal.indexOf(extra))
                        log(`resume showing logs for ${extra}`)
                    }
                } else {
                    if (flag == "g") {
                        log(`command text is ${extra}`)
                        const chosenGroup = logGroups.getGroup(extra)
                        if (chosenGroup) {
                            chosenGroup.forEach((word: string) => {
                                WrapperProvider.adminConsoleWrapper.out.noPrintSignal.push(word)
                            })
                            log(`stop showing logs for ${extra} group`)
                        } else { log("no group found") }
                    } else {
                        WrapperProvider.adminConsoleWrapper.out.noPrintSignal.push(extra)
                        log(`stop showing logs for ${extra}`)
                    }
                }
                break

            case ADMIN_COMMANDS.CHARGE:

                for (let i = 0; i < myActiveItems.length; i++) {
                    const item = myActiveItems[i];
                    await item.getComponent(Item)!.rechargeItem(true)
                }
                // tslint:disable-next-line: no-floating-promises
                WrapperProvider.actionManagerWrapper.out.updateActions()
                break;
            case ADMIN_COMMANDS.STACKTRACE:
                error(`stack trace`)
                break
            case ADMIN_COMMANDS.STACK:
                log(WrapperProvider.stackLableWrapper.out.label!.string)
                break
            // case ADMIN_COMMANDS.CHAR:
            //     //let mePlayer = WrapperProvider.playerManagerWrapper.out.mePlayer.getComponent(Player)
            //     mePlayer.activeItems.splice(mePlayer.activeItems.indexOf(mePlayer.character))
            //     if (mePlayer.characterItem.getComponent(Item)!.type == ITEM_TYPE.PASSIVE) {
            //         mePlayer.activeItems.splice(mePlayer.passiveItems.indexOf(mePlayer.characterItem))
            //     } else { mePlayer.activeItems.splice(mePlayer.activeItems.indexOf(mePlayer.characterItem)) }
            //     const fullCharCard: {
            //         char: Node;
            //         item: Node;
            //     } = WrapperProvider.cardManagerWrapper.out.characterDeck.find(char => char.char.name == extra)
            //     await WrapperProvider.playerManagerWrapper.out.assignCharacterToPlayer(fullCharCard, mePlayer, true)
            //     break
            case ADMIN_COMMANDS.RUN:
                if (flag != undefined || flag != " ") { extra = extra.split(" ")[0] }

                switch (extra) {
                    case "test":
                        this.testForEmptyEffects()
                        break;
                    case "char":
                        const charAndItem = WrapperProvider.cardManagerWrapper.out.characterDeck.find(item => item.char.getComponent(Card)!.cardName.toLowerCase() == flag.toLowerCase())!
                        WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.character!.setParent(null)
                        WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.characterItem!.setParent(null)
                        await WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.setCharacter(charAndItem.char, charAndItem.item, true)
                        WrapperProvider.serverClientWrapper.out.send(Signal.ASSIGN_CHAR_TO_PLAYER, { playerId: WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId, charCardId: charAndItem.char.getComponent(Card)!._cardId, itemCardId: charAndItem.item.getComponent(Card)!._cardId });
                    case "test2":
                        for (let i = 0; i < 10; i++) {
                            await mePlayer.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true)
                            const treasureDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!;
                            const aPassiveItem = treasureDeck.getCards().find(card => card.getComponent(Item)!.type == ITEM_TYPE.PASSIVE)
                            const aActiveItem = treasureDeck.getCards().find(card => { if (card.getComponent(Item)!.type == ITEM_TYPE.ACTIVE || card.getComponent(Item)!.type == ITEM_TYPE.PAID || card.getComponent(Item)!.type == ITEM_TYPE.ACTIVE_AND_PAID || card.getComponent(Item)!.type == ITEM_TYPE.ACTIVE_AND_PASSIVE) return true })
                            if (aActiveItem) {
                                await mePlayer.giveCard(aActiveItem)
                            }
                            if (aPassiveItem) {
                                await mePlayer.giveCard(aPassiveItem)
                            }
                        }
                        break;
                    case 'test3':
                        WrapperProvider.announcementLableWrapper.out.showAnnouncement(`test announcment test test test test test announcment test test test test test announcment test test test test`, 2, true)
                        break
                    case 'top':
                        let card = WrapperProvider.cardManagerWrapper.out.getCardByName(flag)
                        if (card == null) {
                            card = this._autoCompleteCard;
                        }
                        if (!card) { debugger; throw new Error("No Card Found"); }

                        const cardcomp = card.getComponent(Card)!
                        let deck: Deck | null = null
                        switch (cardcomp.type) {
                            case CARD_TYPE.MONSTER:
                                deck = monsterDeck
                                break;
                            case CARD_TYPE.LOOT:
                                deck = WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!
                                break;
                            case CARD_TYPE.TREASURE:
                                deck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!
                                break;
                            default:
                                throw new Error("No Deck Found!");
                        }
                        deck.addToDeckOnTop(card, 0, true)
                        break;
                    case `raise`:
                        let toSendSignal: number = 0;
                        let data = null
                        switch (flag) {
                            case `Choose Card`:
                                toSendSignal = GAME_EVENTS.CHOOSE_CARD_CARD_CHOSEN
                                data = {}
                                break;
                            case `PlayLootCard`:
                                toSendSignal = GAME_EVENTS.SELECT_LOOT_TO_PLAY_CARD_CHOSEN
                                data = {}
                                break;
                            case `Choose From Target Card`:
                                toSendSignal = GAME_EVENTS.CHOOSE_FROM_TARGET_CARD_CARD_CHOSEN
                                data = {}
                                break;
                            case `Choose Stack Effect`:
                                toSendSignal = GAME_EVENTS.CHOOSE_STACK_EFFECT_CHOSEN
                                data = {}
                                break;
                            case `Put On Stack`:
                                toSendSignal = GAME_EVENTS.PUT_ON_STACK_END
                                break;
                            case `Player Reaction`:
                                toSendSignal = GAME_EVENTS.PLAYER_RESPOND
                                break;
                            case `Empty Stack`:
                                toSendSignal = GAME_EVENTS.PLAYER_RESPOND
                                break;
                            case `Stack Effect Resolved`:
                                toSendSignal = GAME_EVENTS.STACK_STACK_EFFECT_RESOLVED_AT_OTHER_PLAYER
                                break;
                            case `Dice Roll Over`:
                                toSendSignal = GAME_EVENTS.DICE_ROLL_OVER
                                break;
                            case `Player Click Next`:
                                toSendSignal = GAME_EVENTS.PLAYER_CLICKED_NEXT
                                break;
                            case `Player Select Yes`:
                                toSendSignal = GAME_EVENTS.PLAYER_SELECTED_YES_NO
                                data = true
                                break;
                            case `Player Select No`:
                                toSendSignal = GAME_EVENTS.PLAYER_SELECTED_YES_NO
                                data = false
                                break;
                            case `Player Card Activated`:
                                toSendSignal = GAME_EVENTS.PLAYER_CARD_NOT_ACTIVATED
                                break;
                            case `Check Dead Entities`:
                                toSendSignal = GAME_EVENTS.CHECK_FOR_DEAD_ENTITIES
                                break;
                            case `Select Preview`:
                                toSendSignal = GAME_EVENTS.CARD_PREV_MAN_WAIT_FOR_SELECT
                                break;
                            default:
                                break;
                        }
                        whevent.emit(toSendSignal, data)
                        break
                    case "emptyStack":
                        whevent.emit(GAME_EVENTS.STACK_EMPTIED)
                        break;
                    case "respond":
                        log(flag)
                        mePlayer.respondWithNoAction()
                        WrapperProvider.stackWrapper.out.hasOtherPlayerRespond = false;
                        whevent.emit(GAME_EVENTS.PLAYER_RESPOND)
                        break
                    case "error":
                        const e = new Error('test message')
                        WrapperProvider.loggerWrapper.out.error(e)
                    //  WrapperProvider.loggerWrapper.out.error(JSON.stringify(e.stack))
                    //  WrapperProvider.loggerWrapper.out.error({ test: true })
                    default:
                        break;
                }
                break;
            default:
                this.consoleEditBox!.placeholder = "Unknown command, try help"
                break;
                WrapperProvider.actionManagerWrapper.out.updateActions()
        }
    }



    testForEmptyEffects() {
        let cardsWithEffects = WrapperProvider.cardManagerWrapper.out.GetAllCards().filter(card => card.getComponent(CardEffect))
        cardsWithEffects = cardsWithEffects.concat(WrapperProvider.cardManagerWrapper.out.inDecksCardsIds.map(id => WrapperProvider.cardManagerWrapper.out.getCardById(id)).filter(card => card.getComponent(CardEffect)))
        const cardSet = new Set<Node>();
        for (const card of cardsWithEffects) {
            cardSet.add(card)
        }
        let finalString: string = ""
        cardSet.forEach((card) => {
            let cardString = `${card.name}:\n`
            const effectComp = card.getComponent(CardEffect)!;
            let count = 0
            const activeEffects = effectComp.getActiveEffects();
            for (const effect of activeEffects) {
                if (!effect) { count++ }
            }
            if (count != 0) {
                cardString = cardString.concat(`Empty Active Effects:${count}\n`)
            }
            count = 0
            let passiveString = "No Conditions:\n"
            const passiveEffects = effectComp.getPassiveEffects();
            for (const effect of passiveEffects) {
                if (!effect) { count++ }
                if (effect.conditions.length == 0) { passiveString = passiveString + `${effect.name} \n` }
            }
            if (count != 0) {
                cardString = cardString.concat(`Empty Passive Effects:${count}\n`)
            }
            if (passiveString != "No Conditions:\n") {
                cardString = cardString.concat(passiveString)
            }
            count = 0
            const paidEffects = effectComp.getPaidEffects();
            for (const effect of paidEffects) {
                if (!effect) { count++ }
            }
            if (count != 0) {
                cardString = cardString.concat(`Empty Paid Effects:${count}\n`)
            }
            count = 0
            const toAddPassiveEffects = effectComp.getToAddPassiveEffects();
            for (const effect of toAddPassiveEffects) {
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
        log(finalString)
        WrapperProvider.loggerWrapper.out.log(finalString)
    }

    async autoCompleteCardName(text?: string) {

        var auto = new CardAutoComplete();
        debugger
        let currentText
        if (text) {
            currentText = text
        } else {
            currentText = this.consoleEditBox!.string;
        }
        const cmdWord = currentText.split(" ")[0]
        currentText = currentText.replace(cmdWord + " ", "")
        this._autoCompleteCard = auto.getClosestCardByText(currentText)
        return true

    }

    showMenu() {
        this.menuNode!.active = true
        if (this.menuNode!.getComponentInChildren(Menu)!.currentMenu != "AdminMenu") {
            this.menuNode!.getComponentInChildren(Menu)!.setAdminMenu()
        }
    }

    hideMenu() {
        this.menuNode!.active = false;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
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
        //     const adminC = instantiate(this.adminCommandButtonPrefab)
        //     adminC.getComponent(AdminCommandButton)!.adminCommand = command.command
        //     if (command.input == INPUT_TYPE.NUMBER_INPUT) {
        //         adminC.getComponent(AdminCommandButton)!.setInput(instantiate(this.numberInput))
        //     } else if (command.input == INPUT_TYPE.TEXT_INPUT) {
        //         adminC.getComponent(AdminCommandButton)!.setInput(instantiate(this.textInput))
        //     }
        //     adminC.setParent(this.menuNode.getChildByName("Menu Layout"))

        // });
        const logGroups = new SIGNAL_GROUPS();
        const chosenGroup = logGroups.getGroup("test")
        if (chosenGroup) {
            chosenGroup.forEach((word: string) => {
                WrapperProvider.adminConsoleWrapper.out.noPrintSignal.push(word)
            })
        }
    }


    // update (dt) {}
}
