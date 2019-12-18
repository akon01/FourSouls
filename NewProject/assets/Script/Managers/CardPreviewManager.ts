import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { BUTTON_STATE, GAME_EVENTS, TIME_TO_SHOW_PREVIEW } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import CardPreview from "../Entites/CardPreview";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import { Logger } from "../Entites/Logger";
import Pile from "../Entites/Pile";
import ButtonManager from "./ButtonManager";
import CardManager from "./CardManager";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";

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

    static setCurrentPreviews(previews: cc.Node[]) {
        this.currentPreviews = previews;
    }

    static addToCurrentPreviews(previews: cc.Node[]) {
        this.currentPreviews = this.currentPreviews.concat(previews.filter(preview => !this.currentPreviews.includes(preview)));
    }

    static async clearAllPreviews() {
        const removeablePreviews = this.currentPreviews.filter(preview => {
            if (!this.previewsToChooseFrom.includes(preview)) { return true }
        })
        const cardsToRemove = removeablePreviews.map(preview => preview.getComponent(CardPreview).card)
        cc.log(cardsToRemove.map(card => card.name))
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
                await preview.getComponent(CardPreview).hideCardPreview();
                if (cardComp._requiredFor) {
                    cardComp._requiredFor.cardChosen = card;
                    cardComp._requiredFor.isCardChosen = true
                } else {
                    throw new Error("card has Requierd For Flag, but no data collector set as requiredFor.");
                }
                CardManager.disableCardActions(card)
                this.hidePreviewManager()
            } else if (cardComp instanceof Card) {
                if (cardComp._isReactable) {
                    const cardPlayer = PlayerManager.getPlayerById(
                        (cardComp as Card)._cardHolderId
                    )
                    CardManager.disableCardActions(card)
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
                    CardManager.disableCardActions(card)
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
                    CardManager.disableCardActions(card)
                    this.hidePreviewManager()
                    await cardPlayer.playLootCard(card, true);
                } else if (cardComp._isAttackable) {

                    const cardPlayer = PlayerManager.getPlayerById(
                        TurnsManager.currentTurn.PlayerId
                    )
                    await preview.getComponent(CardPreview).hideCardPreview();
                    CardManager.disableCardActions(card)
                    this.hidePreviewManager()
                    await cardPlayer.declareAttack(card, true);

                } else if (cardComp._isBuyable) {

                    const cardPlayer = PlayerManager.getPlayerById(
                        TurnsManager.currentTurn.PlayerId
                    )
                    await preview.getComponent(CardPreview).hideCardPreview();
                    CardManager.disableCardActions(card)
                    this.hidePreviewManager()
                    cardPlayer.buyItem(card, true);

                }
            }
        }, this)
    }

    static updatePreviewsEvents() {
        this.currentPreviews.forEach(preview => {
            if (this.previewsToChooseFrom.includes(preview)) {
                //   cc.log(`previews to choose from includes ${preview.name}`)
                return;
            }

            let cardComp: Deck | Card;
            const card = preview.getComponent(CardPreview).card
            cardComp = card.getComponent(Deck)
            if (cardComp == null) {
                cardComp = card.getComponent(Card)
            }

            if (cardComp._hasEventsBeenModified || !preview.getComponent(CardPreview).hasTouchProperty) {
                const previewComp = preview.getComponent(CardPreview)
                if (cardComp._isRequired) {
                    //  cc.log(`${cardComp.name} is required`)
                    if (card.getComponent(Deck) == null) {
                    }
                    previewComp.hasTouchProperty = true
                    preview.on(cc.Node.EventType.TOUCH_START, async () => {
                        await preview.getComponent(CardPreview).hideCardPreview();
                        if (cardComp._requiredFor) {
                            cardComp._requiredFor.cardChosen = card;
                            //cc.log(cardComp._requiredFor)
                            cardComp._requiredFor.isCardChosen = true
                        } else {
                            throw new Error("card has Requierd For Flag, but no data collector set as requiredFor.");
                        }
                        CardManager.disableCardActions(card)
                        this.hidePreviewManager()
                    });
                } else if (cardComp instanceof Card) {
                    if (cardComp._isReactable) {
                        previewComp.hasTouchProperty = true
                        preview.once(cc.Node.EventType.TOUCH_START, async () => {
                            const cardPlayer = PlayerManager.getPlayerById(
                                (cardComp as Card)._cardHolderId
                            )
                            CardManager.disableCardActions(card)
                            if (!card.getComponent(CardEffect).hasMultipleEffects) {
                                await preview.getComponent(CardPreview).hideCardPreview();
                            }
                            this.hidePreviewManager()
                            cardPlayer.activatedCard = card;
                            whevent.emit(GAME_EVENTS.PLAYER_CARD_ACTIVATED, card)
                            cardPlayer.cardActivated = true;
                            // if (card.getComponent(Item) != null) {
                            //     cardPlayer.activateCard(card, false);
                            // } else {

                            //     cardPlayer.playLootCard(card, true)
                            // }

                        });
                    } else if (cardComp._isActivateable) {
                        previewComp.hasTouchProperty = true
                        preview.on(cc.Node.EventType.TOUCH_START, async () => {
                            const cardPlayer = PlayerManager.getPlayerById(
                                TurnsManager.currentTurn.PlayerId
                            )
                            CardManager.disableCardActions(card)
                            if (!card.getComponent(CardEffect).hasMultipleEffects) {
                                await preview.getComponent(CardPreview).hideCardPreview();
                            }
                            this.hidePreviewManager()
                            cardPlayer.activateCard(card);
                        });
                    } else if (cardComp._isPlayable) {
                        previewComp.hasTouchProperty = true
                        preview.on(cc.Node.EventType.TOUCH_START, async () => {
                            const cardPlayer = PlayerManager.getPlayerById(
                                TurnsManager.currentTurn.PlayerId
                            )
                            await preview.getComponent(CardPreview).hideCardPreview();
                            CardManager.disableCardActions(card)
                            this.hidePreviewManager()
                            cardPlayer.playLootCard(card, true);
                        });
                    } else if (cardComp._isAttackable) {
                        previewComp.hasTouchProperty = true
                        preview.on(cc.Node.EventType.TOUCH_START, async () => {

                            const cardPlayer = PlayerManager.getPlayerById(
                                TurnsManager.currentTurn.PlayerId
                            )
                            await preview.getComponent(CardPreview).hideCardPreview();
                            CardManager.disableCardActions(card)
                            this.hidePreviewManager()
                            cardPlayer.declareAttack(card, true);
                        });
                    } else if (cardComp._isBuyable) {
                        previewComp.hasTouchProperty = true
                        preview.on(cc.Node.EventType.TOUCH_START, async () => {
                            const cardPlayer = PlayerManager.getPlayerById(
                                TurnsManager.currentTurn.PlayerId
                            )
                            await preview.getComponent(CardPreview).hideCardPreview();
                            CardManager.disableCardActions(card)
                            this.hidePreviewManager()
                            cardPlayer.buyItem(card, true);
                        });
                    } else {
                        previewComp.hasTouchProperty = false
                        preview.off(cc.Node.EventType.TOUCH_START)
                    }
                }
                cardComp._hasEventsBeenModified = false;
            }
        })

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
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.REMOVE_CONFIRM_SELECT)
        whevent.emit(GAME_EVENTS.CARD_PREV_MAN_WAIT_FOR_SELECT)
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
        //   this.exitButton.enabled = false;
        this.previewsToChooseFrom = []
        if (this.isOpen) {
            this.hidePreviewManager()
        }
        await this.clearAllPreviews()
        if (this.currentPreviews.length != 0) {
            throw new Error(`still previews when should not be`)
        }
        cardsToSelectFrom.forEach(card => {
            CardManager.disableCardActions(card)
        });
        const previews = await this.getPreviews(cardsToSelectFrom, true)
        this.previewsToChooseFrom = previews;
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.CHANGE_TEXT, ["Confirm"])
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_CONFIRM_SELECT_IN_PREVIEWS)

        //ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.ENABLED)
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_NOT_YET_AVAILABLE)
        for (let i = 0; i < previews.length; i++) {
            const preview = previews[i];
            const previewComp = preview.getComponent(CardPreview);
            preview.on(cc.Node.EventType.TOUCH_START, () => {
                //if the preview is already selected,disable its selection

                if (previewComp.isSelected) {
                    previewComp.counterLable.enabled = false;
                    this.selectQueue.splice(this.selectQueue.indexOf(preview))

                    for (let i = 0; i < this.selectQueue.length; i++) {
                        const previewInQueue = this.selectQueue[i].getComponent(CardPreview);
                        previewInQueue.counterLable.string = (i + 1).toString();

                    }
                    previewComp.isSelected = false;
                    //if not:
                    //special case: number of cards to select is any number
                } else if (numberOfCardsToSelect == 0) {
                    this.selectQueue.push(preview)
                    previewComp.isSelected = true;
                    previewComp.counterLable.enabled = true;

                    previewComp.counterLable.string = this.selectQueue.length.toString()
                    //if still more to choose, select the card
                } else if (this.selectQueue.length < numberOfCardsToSelect) {
                    this.selectQueue.push(preview)
                    previewComp.isSelected = true;
                    previewComp.counterLable.enabled = true;

                    previewComp.counterLable.string = this.selectQueue.length.toString()
                }
                if (this.isOpen) {
                    ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.cardPreviewButtonLayout)
                } else { ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.playerButtonLayout) }
                if (this.selectQueue.length >= numberOfCardsToSelect) {
                    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_AVAILABLE)
                    //   this.confirmSelectButton.enabled = true;
                } else {
                    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_NOT_YET_AVAILABLE)
                }
            }, this)
        }
        const selectedQueue = await this.waitForSelect()
        for (let i = 0; i < selectedQueue.length; i++) {
            const preview = selectedQueue[i].getComponent(CardPreview);
            preview.counterLable.string = "";
            preview.counterLable.enabled = false;
        }
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.ENABLED)
        // this.exitButton.enabled = true;
        this.previewsToChooseFrom = []
        this.removeFromCurrentPreviews(previews.map(preview => preview.getComponent(CardPreview).card))
        return selectedQueue.map(preview => preview.getComponent(CardPreview).card);
    }

    static async waitForSelect(): Promise<cc.Node[]> {
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.CHANGE_TEXT, ["Confirm"])
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_CONFIRM_SELECT_IN_PREVIEWS)
        return new Promise((resolve) => {
            whevent.onOnce(GAME_EVENTS.CARD_PREV_MAN_WAIT_FOR_SELECT, () => {
                ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.DISABLED)
                resolve(this.selectQueue)
            })

        });
    }

    static async getPreviews(cardsToPreview: cc.Node[], openPreviewManager: boolean) {
        const previews: cc.Node[] = [];
        for (let i = 0; i < cardsToPreview.length; i++) {
            const card = cardsToPreview[i]
            const preview = await this.addPreview(card)
            previews.push(preview.node)
        }

        this.$.node.active = true;

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

    static addPreview(cardToAdd: cc.Node) {

        let preview: CardPreview
        if (!cardToAdd) {
            throw new Error(`Cant Add Preview Of null Card`)
        }
        const exsistingPreview = this.getPreviewByCard(cardToAdd)
        if (exsistingPreview != null) {

            preview = exsistingPreview
            return preview
        } else {
            preview = this.cardPreviewPool.get().getComponent(CardPreview);
        }

        preview.card = cardToAdd;
        const cardComp = cardToAdd.getComponent(Card)

        if (cardToAdd.getComponent(Deck) != null || cardComp.topDeckof != null) {

            preview.node.getComponent(cc.Sprite).spriteFrame = cardToAdd.getComponent(cc.Sprite).spriteFrame;
        } else if (cardToAdd.getComponent(Pile) != null) {

            preview.node.getComponent(cc.Sprite).spriteFrame = cardToAdd.getComponent(Pile).pileSprite.spriteFrame;
        } else {

            preview.node.getComponent(cc.Sprite).spriteFrame = cardComp.frontSprite;
        }
        this.currentPreviews.push(preview.node)
        preview.node.active = true;
        const func = cc.callFunc(() => {
            try {
                CardPreviewManager.updatePreview(preview)
                // CardPreviewManager.updatePreviewsEvents()
            } catch (error) {
                cc.error(error)
                Logger.error(error)
            }
        }, this)
        if (this.isOpen) {
            preview.node.opacity = 0
            preview.node.setParent(this.scrollView.content.getChildByName("PreviewLayout"));
            preview.node.runAction(cc.sequence(cc.fadeTo(TIME_TO_SHOW_PREVIEW, 255), func))
        } else {
            preview.node.opacity = 255
            preview.node.setParent(this.scrollView.content.getChildByName("PreviewLayout"));
            try {
                CardPreviewManager.updatePreview(preview)
                // CardPreviewManager.updatePreviewsEvents()
            } catch (error) {
                cc.error(error)
                Logger.error(error)
            }
        }

        return preview
    }

    static makeCardsOpaqe() {
        this.currentPreviews.forEach(preview => preview.opacity = 255)
    }

    static showPreviewManager() {
        try {
            for (const preview of CardPreviewManager.currentPreviews) {
                CardPreviewManager.updatePreview(preview.getComponent(CardPreview))
            }
            //  CardPreviewManager.updatePreviewsEvents()
        } catch (error) {
            cc.error(error)
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
        if (ButtonManager.$.skipButton.active) {
            ButtonManager.moveButton(ButtonManager.$.skipButton, ButtonManager.$.cardPreviewButtonLayout)
        }
        if (ButtonManager.$.yesButton.active) {
            ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.cardPreviewButtonLayout)
        }
        CardPreviewManager.scrollView.node.runAction(cc.sequence(action, cc.callFunc(() => {
            CardPreviewManager.makeCardsOpaqe();
            CardPreviewManager.isOpen = true
        }, CardPreviewManager)))
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
        if (ButtonManager.$.skipButton.active) {
            ButtonManager.moveButton(ButtonManager.$.skipButton, ButtonManager.$.playerButtonLayout)
        }
        if (ButtonManager.$.yesButton.active) {
            ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.playerButtonLayout)
        }

        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.TOGGLE_TO_OPEN_PREVIEWS)
        try {
            for (const preview of CardPreviewManager.currentPreviews) {
                CardPreviewManager.updatePreview(preview.getComponent(CardPreview))
            }
            //  CardPreviewManager.updatePreviewsEvents()
        } catch (error) {
            cc.error(error)
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
        for (let i = 0; i < 25; i++) {
            const preview = cc.instantiate(this.cardPreviewPrefab);
            preview.name = "preview" + i;
            CardPreviewManager.cardPreviewPool.put(preview)
        }

        this.node.on("previewRemoved", (previewToRemove: cc.Node) => {
            CardPreviewManager.removeFromCurrentPreviews(Array.of(previewToRemove.getComponent(CardPreview).card))
            if (CardPreviewManager.currentPreviews.length == 0) {
                CardPreviewManager.hidePreviewManager()
            }
        })

        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.DISABLED)
        //    ButtonManager.moveButton(ButtonManager.$.togglePreviewManagerButton, ButtonManager.$.playerButtonLayout)
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.TOGGLE_TO_OPEN_PREVIEWS)
        ButtonManager.enableButton(ButtonManager.$.clearPreviewsButton, BUTTON_STATE.SET_CLEAR_PREVIEWS)

    }

    start() {

    }

    // update (dt) {}
}
