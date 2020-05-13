import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { BUTTON_STATE, GAME_EVENTS, TIME_TO_SHOW_PREVIEW } from "../Constants";
import CardEffect from "../Entites/CardEffect";

import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import Player from "../Entites/GameEntities/Player";
import { Logger } from "../Entites/Logger";
import Pile from "../Entites/Pile";
import ButtonManager from "./ButtonManager";
import CardManager from "./CardManager";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";
import StackEffectVisManager from "./StackEffectVisManager";
import { whevent } from "../../ServerClient/whevent";
import CardPreview from "../Entites/Card Preview";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardPreviewManager extends cc.Component {

    @property(cc.Prefab)
    cardPreviewPrefab: cc.Prefab = null;

    static cardPreviewPool: cc.NodePool = null;

    static previewsLayout: cc.Layout = null;

    static scrollView: cc.ScrollView = null;

    static previewsToChooseFrom: cc.Node[] = [];

    private static currentPreviews: cc.Node[] = [];

    static selectQueue: cc.Node[] = [];

    static isOpen: boolean = false;

    static groups: Map<string, cc.Color> = new Map()

    @property(cc.Label)
    flavorTextLable: cc.Label = null

    @property(cc.Node)
    contentNode: cc.Node = null

    static setCurrentPreviews(previews: cc.Node[]) {
        this.currentPreviews = previews;
    }

    static addToCurrentPreviews(previews: cc.Node[]) {
        this.currentPreviews = this.currentPreviews.concat(previews.filter(preview => !this.currentPreviews.includes(preview)));
    }

    static setFalvorText(newText: string) {
        this.$.flavorTextLable.string = newText
    }

    async clearPreviewsButtonClicked() {
        await CardPreviewManager.clearAllPreviews()
    }

    static async clearAllPreviews() {
        const removeablePreviews = this.currentPreviews.filter(preview => {
            if (!this.previewsToChooseFrom.includes(preview)) { return true }
        })
        const cardsToRemove = removeablePreviews.map(preview => preview.getComponent(CardPreview).card)
        await this.removeFromCurrentPreviews(cardsToRemove)

        // this.currentPreviews = this.currentPreviews.filter(preview => {
        //     if (this.previewsToChooseFrom.includes(preview)) return true
        //     this.cardPreviewPool.put(preview)
        //     return false
        // })
        if (this.currentPreviews.length == 0) {
            this.hidePreviewManager()
        }
    }

    static async removeFromCurrentPreviews(cards: cc.Node[]) {

        const previews = cards.filter(card => CardPreviewManager.getPreviewByCard(card)).map(card => CardPreviewManager.getPreviewByCard(card).node)

        this.currentPreviews = this.currentPreviews.filter(preview => !previews.includes(preview));
        for (let i = 0; i < previews.length; i++) {
            const preview = previews[i].getComponent(CardPreview);
            //    cc.log(`remove preview of ${preview.card.name}`)
            preview.hasTouchProperty = false;
            preview.node.off(cc.Node.EventType.TOUCH_START)
            if (preview.node.active) {
                await preview.hideCardPreview();
            }
            this.cardPreviewPool.put(preview.node);
        }
        if (this.currentPreviews.length == 0) {
            this.hidePreviewManager()
        }
    }

    static getPreviewByCard(card: cc.Node) {

        for (const preview of this.currentPreviews) {
            if (preview.getComponent(CardPreview).card == card) {
                return preview.getComponent(CardPreview)
            }
        }

        return null

        //throw `no preview with ${card.name} found`
    }

    static disableAllCardsActions() {
        if (CardManager.allCards.length != 0) {
            const cards = CardManager.onTableCards.concat(...PlayerManager.players.map(player => {
                return player.getComponent(Player).handCards
            })).filter(card => {
                if (card.parent != null) { return true }
            })
            //  const allFlippedCards = CardManager.allCards.filter(card => (!card.getComponent(Card)._isFlipped));
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i]
                CardManager.disableCardActions(card);
                for (const preview of this.currentPreviews) {
                    this.updatePreview(preview.getComponent(CardPreview))
                }
                // CardManager.makeCardPreviewable(card);
            }
        }

    }

    static updatePreview(preview: CardPreview) {
        preview.node.off(cc.Node.EventType.TOUCH_END)
        preview.node.once(cc.Node.EventType.TOUCH_END, async () => {

            if (this.previewsToChooseFrom.includes(preview.node)) {
                return;
            }
            let cardComp: Deck | Card;
            const card = preview.getComponent(CardPreview).card
            cardComp = card.getComponent(Deck)
            if (cardComp == null) {
                cardComp = card.getComponent(Card)
            }
            //if the card is required for a data collector
            if (cardComp._isRequired) {
                cc.log(`${cardComp.name} is required`)
                await preview.getComponent(CardPreview).hideCardPreview();
                if (cardComp._requiredFor) {
                    cardComp._requiredFor.cardChosen = card;
                    cardComp._requiredFor.isCardChosen = true
                } else {
                    throw new Error("card has Requierd For Flag, but no data collector set as requiredFor.");
                }
                this.disableAllCardsActions()
                this.hidePreviewManager()
            } else {
                // if (cardComp instanceof Card) {
                cardComp = card.getComponent(Card)
                cc.log(cardComp)
                if (cardComp._isReactable) {
                    const cardPlayer = PlayerManager.getPlayerById(
                        (cardComp as Card)._cardHolderId
                    )
                    this.disableAllCardsActions()
                    if (!card.getComponent(CardEffect).hasMultipleEffects) {
                        await preview.getComponent(CardPreview).hideCardPreview();
                    }
                    this.hidePreviewManager()
                    cardPlayer.activatedCard = card;
                    whevent.emit(GAME_EVENTS.PLAYER_CARD_ACTIVATED, card)
                    cardPlayer.cardActivated = true;
                } else if (cardComp._isActivateable) {
                    const cardPlayer = PlayerManager.getPlayerById(
                        TurnsManager.currentTurn.PlayerId
                    )
                    this.disableAllCardsActions()
                    if (!card.getComponent(CardEffect).hasMultipleEffects) {
                        await preview.getComponent(CardPreview).hideCardPreview();
                    }
                    this.hidePreviewManager()
                    await cardPlayer.activateCard(card);
                } else if (cardComp._isPlayable) {
                    const cardPlayer = PlayerManager.getPlayerById(
                        TurnsManager.currentTurn.PlayerId
                    )
                    await preview.getComponent(CardPreview).hideCardPreview();
                    this.disableAllCardsActions()
                    this.hidePreviewManager()
                    await cardPlayer.playLootCard(card, true);
                } else if (cardComp._isAttackable) {
                    const cardPlayer = PlayerManager.getPlayerById(
                        TurnsManager.currentTurn.PlayerId
                    )
                    await preview.getComponent(CardPreview).hideCardPreview();
                    this.disableAllCardsActions()
                    this.hidePreviewManager()
                    await cardPlayer.declareAttack(card, true);

                } else if (cardComp._isBuyable) {

                    const cardPlayer = PlayerManager.getPlayerById(
                        TurnsManager.currentTurn.PlayerId
                    )
                    await preview.getComponent(CardPreview).hideCardPreview();
                    this.disableAllCardsActions()
                    this.hidePreviewManager()
                    await cardPlayer.buyItem(card, true);

                }
            }
        }, this)
    }

    static $: CardPreviewManager = null

    static openPreview(preview: cc.Node) {
        this.addToCurrentPreviews(Array.of(preview))
        if (this.$.node.getNumberOfRunningActions() == 0) {
            this.showPreviewManager()
        } else {
            this.$.node.stopAllActions();
            this.showPreviewManager()
        }
    }

    static showToOtherPlayers(card: cc.Node) {
        const currentPlayer = TurnsManager.currentTurn.PlayerId;
        const srvData = {
            cardToShowId: card.getComponent(Card)._cardId,
            playerId: currentPlayer
        };
        ServerClient.$.send(Signal.SHOW_CARD_PREVIEW, srvData);
    }

    confirmSelect() {
        whevent.emit(GAME_EVENTS.CARD_PREV_MAN_WAIT_FOR_SELECT)
        CardPreviewManager.previewsToChooseFrom.forEach(preview => {
            preview.getComponent(CardPreview).extraInfo.active = false
        })
        // CardPreviewManager.isSelectOver = true;
        CardPreviewManager.hidePreviewManager()
    }

    /**
     *
     * @param cardsToSelectFrom card nodes to select from
     * @param numberOfCardsToSelect number of cards to select, if 0 you can choose as many as you like
     * @returns the nodes of the cards selected in order of selection
     */
    static async selectFromCards(cardsToSelectFrom: cc.Node[], numberOfCardsToSelect: number): Promise<cc.Node[]> {
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.DISABLED)
        ButtonManager.enableButton(ButtonManager.$.confirmButton, BUTTON_STATE.ENABLED)
        if (numberOfCardsToSelect != 0) {
            ButtonManager.enableButton(ButtonManager.$.confirmButton, BUTTON_STATE.SET_NOT_YET_AVAILABLE)
        }
        //   this.exitButton.enabled = false;
        this.previewsToChooseFrom = []
        if (this.isOpen) {
            this.hidePreviewManager()
        }
        await this.clearAllPreviews()
        if (this.currentPreviews.length != 0) {
            ButtonManager.enableButton(ButtonManager.$.confirmButton, BUTTON_STATE.DISABLED)
            throw new Error(`still previews when should not be`)
        }
        cardsToSelectFrom.forEach(card => {
            CardManager.disableCardActions(card)
        });
        const previews = await this.getPreviews(cardsToSelectFrom, true)
        this.previewsToChooseFrom = previews;
        this.previewsToChooseFrom.forEach(preview => {
            preview.getComponent(CardPreview).disableExit()
        })
        for (let i = 0; i < previews.length; i++) {
            const preview = previews[i];
            const previewComp = preview.getComponent(CardPreview);
            preview.on(cc.Node.EventType.TOUCH_START, () => {
                //if the preview is already selected,disable its selection

                if (this.selectQueue.includes(preview)) {
                    previewComp.extraInfo.active = false;
                    this.selectQueue.splice(this.selectQueue.indexOf(preview), 1)

                    previewComp.isSelected = false;
                    //if not:
                    //special case: number of cards to select is any number
                } else if (numberOfCardsToSelect == 0) {
                    this.selectQueue.push(preview)
                    previewComp.isSelected = true;
                    previewComp.extraInfo.active = true;

                    //  previewComp.counterLable.string = this.selectQueue.length.toString()
                    //if still more to choose, select the card
                } else if (this.selectQueue.length < numberOfCardsToSelect) {
                    this.selectQueue.push(preview)
                    previewComp.isSelected = true;
                    previewComp.extraInfo.active = true;

                    // previewComp.counterLable.string = this.selectQueue.length.toString()
                }
                if (this.selectQueue.length >= numberOfCardsToSelect) {
                    ButtonManager.enableButton(ButtonManager.$.confirmButton, BUTTON_STATE.SET_AVAILABLE)
                } else {
                    ButtonManager.enableButton(ButtonManager.$.confirmButton, BUTTON_STATE.SET_NOT_YET_AVAILABLE)
                }
                for (let i = 0; i < this.selectQueue.length; i++) {
                    const previewInQueue = this.selectQueue[i].getComponent(CardPreview);
                    if (i != 0) {
                        previewInQueue.extraLable.string = (i + 1).toString();
                    } else {
                        previewInQueue.extraLable.string = `1 /Top`
                    }

                }
            }, this)
        }
        let selectedQueue = await this.waitForSelect()
        this.selectQueue = []
        this.previewsToChooseFrom.forEach(preview => {
            preview.getComponent(CardPreview).enableExit()
        })
        ButtonManager.enableButton(ButtonManager.$.confirmButton, BUTTON_STATE.DISABLED)
        for (let i = 0; i < selectedQueue.length; i++) {
            const preview = selectedQueue[i].getComponent(CardPreview);
            preview.counterLable.string = "";
            preview.counterLable.enabled = false;
        }
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.ENABLED)
        // this.exitButton.enabled = true;
        this.previewsToChooseFrom = []
        selectedQueue = selectedQueue.map(preview => preview.getComponent(CardPreview).card);
        await this.removeFromCurrentPreviews(previews.map(preview => preview.getComponent(CardPreview).card))

        return selectedQueue;
    }

    static async waitForSelect(): Promise<cc.Node[]> {
        return new Promise((resolve) => {
            whevent.onOnce(GAME_EVENTS.CARD_PREV_MAN_WAIT_FOR_SELECT, () => {
                resolve(this.selectQueue)
            })

        });
    }

    static async getPreviews(cardsToPreview: cc.Node[], openPreviewManager: boolean, groupUuid?: string) {
        const previews: cc.Node[] = [];
        for (let i = 0; i < cardsToPreview.length; i++) {
            const card = cardsToPreview[i]
            const preview = await this.addPreview(card, groupUuid)
            previews.push(preview.node)
        }

        // this.$.node.active = true;

        if (openPreviewManager) {
            if (this.$.node.getNumberOfRunningActions() == 0) {
                this.showPreviewManager()
            } else {
                this.$.node.stopAllActions();
                this.showPreviewManager()
            }
        }
        return previews
    }

    static setGroup(preview: CardPreview, groupUuid: string) {
        if (groupUuid == null || groupUuid == undefined) {
            return
        }
        if (groupUuid) {
            if (!this.groups.has(groupUuid)) {
                this.groups.set(groupUuid, new cc.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255))
            }
            preview.setGroup(groupUuid)
        }
    }

    static addPreview(cardToAdd: cc.Node, groupUuid?: string) {

        let preview: CardPreview
        if (!cardToAdd) {
            throw new Error(`Cant Add Preview Of null Card`)
        }
        const exsistingPreview = this.getPreviewByCard(cardToAdd)
        if (exsistingPreview != null) {

            preview = exsistingPreview
            this.setGroup(preview, groupUuid)
            return preview
        } else {
            preview = this.cardPreviewPool.get().getComponent(CardPreview);
        }

        preview.setCard(cardToAdd, false)
        this.setGroup(preview, groupUuid)
        this.currentPreviews.push(preview.node)
        preview.node.active = true;
        const func = cc.callFunc(() => {
            try {
                CardPreviewManager.updatePreview(preview)
                // CardPreviewManager.updatePreviewsEvents()
            } catch (error) {
                Logger.error(error)
            }
        }, this)
        preview.node.setPosition(0, 0)
        if (this.isOpen) {
            preview.node.opacity = 0
            preview.node.setParent(this.$.contentNode.getChildByName("PreviewLayout"));
            //  preview.node.setParent(this.scrollView.content);
            this.orgenizePreviews()
            preview.node.runAction(cc.sequence(cc.fadeTo(TIME_TO_SHOW_PREVIEW, 255), func))
        } else {
            preview.node.opacity = 255
            //preview.node.setParent(this.scrollView.content);
            preview.node.setParent(this.$.contentNode.getChildByName("PreviewLayout"));
            this.orgenizePreviews()
            try {
                CardPreviewManager.updatePreview(preview)
                // CardPreviewManager.updatePreviewsEvents()
            } catch (error) {
                Logger.error(error)
            }
        }
        return preview
    }

    static orgenizePreviews() {

        const previewsWithGroup = this.currentPreviews.filter(preview => preview.getComponent(CardPreview)._groupUuid != null).map(c => c.getComponent(CardPreview))
        const otherPreviews = this.currentPreviews.filter(preview => preview.getComponent(CardPreview)._groupUuid == null).map(c => c.getComponent(CardPreview))
        const groupedPreviews: Map<string, CardPreview[]> = new Map()

        previewsWithGroup.forEach(preview => {
            if (groupedPreviews.has(preview._groupUuid)) {
                groupedPreviews.get(preview._groupUuid).push(preview)
            } else {
                groupedPreviews.set(preview._groupUuid, [])
                groupedPreviews.get(preview._groupUuid).push(preview)

            }
        });

        let allPreviews: CardPreview[] = []
        groupedPreviews.forEach(prev => {
            allPreviews.push(...prev)
        })

        allPreviews = allPreviews.concat(otherPreviews)
        for (let i = 0; i < allPreviews.length; i++) {
            const preview = allPreviews[i];
            preview.node.zIndex = cc.macro.MIN_ZINDEX + i
        }
    }

    static makeCardsOpaqe() {
        this.currentPreviews.forEach(preview => preview.opacity = 255)
    }

    openPrevManagerButtonClicked() {
        CardPreviewManager.showPreviewManager()
    }

    closePrevManagerButtonClicked() {
        CardPreviewManager.hidePreviewManager()
    }

    static showPreviewManager() {
        if (StackEffectVisManager.$.isOpen) {
            StackEffectVisManager.$.hidePreviews()
        }
        CardPreviewManager.scrollView.content.active = false
        CardPreviewManager.scrollView.content = CardPreviewManager.$.contentNode
        CardPreviewManager.scrollView.content.active = true
        try {
            for (const preview of CardPreviewManager.currentPreviews) {
                CardPreviewManager.updatePreview(preview.getComponent(CardPreview))
            }
            //  CardPreviewManager.updatePreviewsEvents()
        } catch (error) {
            Logger.error(error)
        }
        const action = cc.fadeTo(TIME_TO_SHOW_PREVIEW, 255)
        CardPreviewManager.scrollView.node.setSiblingIndex(CardPreviewManager.$.node.parent.childrenCount - 1);
        if (CardPreviewManager.currentPreviews[0] != null) {
            const previewWidth = CardPreviewManager.currentPreviews[0].width
            const screenWidth = cc.find("Canvas").width

            if ((previewWidth + 10) * CardPreviewManager.currentPreviews.length > screenWidth) {
                CardPreviewManager.scrollView.content.width = (previewWidth + 10) * CardPreviewManager.currentPreviews.length
            } else { CardPreviewManager.scrollView.content.width = screenWidth; }
        }
        const widget = CardPreviewManager.scrollView.content.getComponent(cc.Widget)
        widget.top = 0;
        widget.left = 0;
        widget.updateAlignment()
        CardPreviewManager.scrollView.node.active = true;
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.TOGGLE_TO_CLOSE_PREVIEWS)
        ButtonManager.moveAvailableButtonsTo(ButtonManager.$.cardPreviewButtonLayout)
        CardPreviewManager.isOpen = true
        CardPreviewManager.scrollView.node.runAction(cc.sequence(action, cc.callFunc(() => {
            CardPreviewManager.makeCardsOpaqe();
            whevent.emit(GAME_EVENTS.PREVIEW_MANAGER_OPEN)
        }, CardPreviewManager)))
        const t = cc.find("Canvas")
        CardPreviewManager.scrollView.node.zIndex = 1
    }

    static hidePreviewManager(event?) {
        if (event) {
            event.stopPropagation();
        }
        CardPreviewManager.scrollView.node.active = false
        const action = cc.fadeTo(TIME_TO_SHOW_PREVIEW, 0)
        CardPreviewManager.scrollView.node.runAction(cc.sequence(action, cc.callFunc(() => {
            CardPreviewManager.scrollView.node.active = false
        }, this)))
        CardPreviewManager.isOpen = false
        // if (ButtonManager.$.skipButton.node.active) {
        //     ButtonManager.moveButton(ButtonManager.$.skipButton, ButtonManager.$.playerButtonLayout)
        // }
        // if (ButtonManager.$.yesButton.node.active) {
        //     ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.playerButtonLayout)
        // }
        ButtonManager.moveAvailableButtonsTo(ButtonManager.$.playerButtonLayout)
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.TOGGLE_TO_OPEN_PREVIEWS)
        try {
            for (const preview of CardPreviewManager.currentPreviews) {
                CardPreviewManager.updatePreview(preview.getComponent(CardPreview))
            }
            //  CardPreviewManager.updatePreviewsEvents()
        } catch (error) {
            Logger.error(error)
        }
        // this.node.active = false;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        CardPreviewManager.$ = this;
        CardPreviewManager.scrollView = cc.find("Canvas/CardPreviewScroll").getComponent(cc.ScrollView)
        CardPreviewManager.scrollView.node.active = false
        CardPreviewManager.cardPreviewPool = new cc.NodePool(CardPreview)

        CardPreviewManager.previewsLayout = this.getComponent(cc.Layout)
        for (let i = 0; i < 10; i++) {
            const preview = cc.instantiate(this.cardPreviewPrefab);
            preview.name = "preview" + i;
            CardPreviewManager.cardPreviewPool.put(preview)
        }

        this.node.on("previewRemoved", async (previewToRemove: cc.Node) => {
            await CardPreviewManager.removeFromCurrentPreviews(Array.of(previewToRemove.getComponent(CardPreview).card))
            if (CardPreviewManager.currentPreviews.length == 0) {
                CardPreviewManager.hidePreviewManager()
            }
        })

        //    ButtonManager.moveButton(ButtonManager.$.togglePreviewManagerButton, ButtonManager.$.playerButtonLayout)
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.TOGGLE_TO_OPEN_PREVIEWS)

    }

    start() {

    }

    // update (dt) {}
}
