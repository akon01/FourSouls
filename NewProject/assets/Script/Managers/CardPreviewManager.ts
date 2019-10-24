import CardPreview from "../Entites/CardPreview";
import { TIME_TO_SHOW_PREVIEW, COLORS, BUTTON_STATE, GAME_EVENTS } from "../Constants";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";
import Player from "../Entites/GameEntities/Player";
import CardEffect from "../Entites/CardEffect";
import CardManager from "./CardManager";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import Pile from "../Entites/Pile";
import Item from "../Entites/CardTypes/Item";
import ButtonManager from "./ButtonManager";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { Logger } from "../Entites/Logger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardPreviewManager extends cc.Component {

    @property(cc.Prefab)
    cardPreviewPrefab: cc.Prefab = null;

    static cardPreviewPool: cc.NodePool = null;

    static previewsLayout: cc.Layout = null;

    static scrollView: cc.ScrollView = null;

    private static previewsToChooseFrom: cc.Node[] = [];

    private static currentPreviews: cc.Node[] = [];

    static selectQueue: cc.Node[] = [];

    static isOpen: boolean = false;

    static setCurrentPreviews(previews: cc.Node[]) {
        this.currentPreviews = previews;
    }

    static addToCurrentPreviews(previews: cc.Node[]) {
        this.currentPreviews = this.currentPreviews.concat(previews.filter(preview => !this.currentPreviews.includes(preview)));
    }

    static clearAllPreviews() {
        let notChoosablePreviews = this.currentPreviews.filter(preview => {
            if (this.previewsToChooseFrom.includes(preview)) return true
        })

        this.removeFromCurrentPreviews(notChoosablePreviews.map(preview => preview.getComponent(CardPreview).card))

        this.currentPreviews = this.currentPreviews.filter(preview => {
            if (this.previewsToChooseFrom.includes(preview)) return true
            this.cardPreviewPool.put(preview)
            return false
        })
        if (this.currentPreviews.length == 0) {
            this.hidePreviewManager()
        }
    }

    static async removeFromCurrentPreviews(cards: cc.Node[]) {

        let previews = cards.filter(card => CardPreviewManager.getPreviewByCard(card)).map(card => CardPreviewManager.getPreviewByCard(card).node)

        this.currentPreviews = this.currentPreviews.filter(preview => !previews.includes(preview));
        for (let i = 0; i < previews.length; i++) {
            const preview = previews[i].getComponent(CardPreview);
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



    static updatePreviewsEvents() {
        this.currentPreviews.forEach(preview => {
            if (this.previewsToChooseFrom.includes(preview)) {
                //   cc.log(`previews to choose from includes ${preview.name}`)
                return;
            }

            let cardComp;
            let newSprite;
            let card = preview.getComponent(CardPreview).card
            cardComp = card.getComponent(Deck)
            if (cardComp == null) {
                cardComp = card.getComponent(Card)
            }

            if (cardComp._hasEventsBeenModified || !preview.getComponent(CardPreview).hasTouchProperty) {
                let previewComp = preview.getComponent(CardPreview)
                if (cardComp._isRequired) {
                    //  cc.log(`${cardComp.name} is required`)
                    if (card.getComponent(Deck) == null) {
                        newSprite = card.getComponent(Card).frontSprite;
                    }
                    previewComp.hasTouchProperty = true
                    preview.on(cc.Node.EventType.TOUCH_START, async () => {
                        // cc.log(`chosen ${card.name}`)
                        let cardPlayer = PlayerManager.getPlayerById(
                            TurnsManager.currentTurn.PlayerId
                        ).getComponent(Player);
                        await preview.getComponent(CardPreview).hideCardPreview();
                        if (cardComp._requiredFor) {
                            cardComp._requiredFor.cardChosen = card;
                            //cc.log(cardComp._requiredFor)
                            cardComp._requiredFor.isCardChosen = true
                        } else {
                            throw "card has Requierd For Flag, but no data collector set as requiredFor.";

                        }
                        CardManager.disableCardActions(card)
                        this.hidePreviewManager()
                    });
                } else if (cardComp instanceof Card) {
                    //  cc.log(`${card.name} is: reactable ${cardComp._isReactable}, activatable ${cardComp._isActivateable}, playable ${cardComp._isPlayable},attackable ${cardComp._isAttackable}, buyable ${cardComp._isBuyable}`)
                    newSprite = card.getComponent(Card).frontSprite;
                    if (cardComp._isReactable) {
                        previewComp.hasTouchProperty = true
                        preview.on(cc.Node.EventType.TOUCH_START, async () => {
                            let cardPlayer = PlayerManager.getPlayerById(
                                cardComp._cardHolderId
                            ).getComponent(Player);
                            CardManager.disableCardActions(card)
                            if (!card.getComponent(CardEffect).hasMultipleEffects) {
                                await preview.getComponent(CardPreview).hideCardPreview();
                            }
                            this.hidePreviewManager()
                            cardPlayer.activatedCard = card;
                            whevent.emit(GAME_EVENTS.PLAYER_CARD_ACTIVATED)
                            cardPlayer.cardActivated = true;
                            if (card.getComponent(Item) != null) {
                                cardPlayer.activateCard(card, false);
                            } else {

                                cardPlayer.playLootCard(card, true)
                            }

                        });
                    } else if (cardComp._isActivateable) {
                        previewComp.hasTouchProperty = true
                        preview.on(cc.Node.EventType.TOUCH_START, async () => {
                            let cardPlayer = PlayerManager.getPlayerById(
                                TurnsManager.currentTurn.PlayerId
                            ).getComponent(Player);
                            CardManager.disableCardActions(card)
                            if (!card.getComponent(CardEffect).hasMultipleEffects) {
                                await preview.getComponent(CardPreview).hideCardPreview();
                            }
                            this.hidePreviewManager()
                            cardPlayer.activateCard(card, true);
                        });
                    } else if (cardComp._isPlayable) {
                        previewComp.hasTouchProperty = true
                        preview.on(cc.Node.EventType.TOUCH_START, async () => {
                            let cardPlayer = PlayerManager.getPlayerById(
                                TurnsManager.currentTurn.PlayerId
                            ).getComponent(Player);
                            await preview.getComponent(CardPreview).hideCardPreview();
                            CardManager.disableCardActions(card)
                            this.hidePreviewManager()
                            cardPlayer.playLootCard(card, true);
                        });
                    }
                    else if (cardComp._isAttackable) {
                        previewComp.hasTouchProperty = true
                        preview.on(cc.Node.EventType.TOUCH_START, async () => {

                            let cardPlayer = PlayerManager.getPlayerById(
                                TurnsManager.currentTurn.PlayerId
                            ).getComponent(Player);
                            await preview.getComponent(CardPreview).hideCardPreview();
                            CardManager.disableCardActions(card)
                            this.hidePreviewManager()
                            cardPlayer.declareAttack(card, true);
                        });
                    } else if (cardComp._isBuyable) {
                        previewComp.hasTouchProperty = true
                        preview.on(cc.Node.EventType.TOUCH_START, async () => {
                            let cardPlayer = PlayerManager.getPlayerById(
                                TurnsManager.currentTurn.PlayerId
                            ).getComponent(Player);
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
        let currentPlayer = TurnsManager.currentTurn.PlayerId;
        let srvData = {
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
     * @param numberOfCardsToSelect number of cards to select
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
            throw `still previews when should not be`
        }
        let previews = await this.getPreviews(cardsToSelectFrom, true)
        this.previewsToChooseFrom = previews;
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.CHANGE_TEXT, ['Confirm'])
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_CONFIRM_SELECT_IN_PREVIEWS)

        //ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.ENABLED)
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_NOT_YET_AVAILABLE)
        for (let i = 0; i < previews.length; i++) {
            const preview = previews[i];
            let previewComp = preview.getComponent(CardPreview);
            preview.on(cc.Node.EventType.TOUCH_START, () => {
                //if the preview is already selected

                if (previewComp.isSelected) {
                    previewComp.counterLable.enabled = false;
                    this.selectQueue.splice(this.selectQueue.indexOf(preview))

                    for (let i = 0; i < this.selectQueue.length; i++) {
                        const previewInQueue = this.selectQueue[i].getComponent(CardPreview);
                        previewInQueue.counterLable.string = (i + 1).toString();

                    }
                    previewComp.isSelected = false;
                    //if not
                } else if (this.selectQueue.length < numberOfCardsToSelect) {
                    this.selectQueue.push(preview)
                    previewComp.isSelected = true;
                    previewComp.counterLable.enabled = true;

                    previewComp.counterLable.string = this.selectQueue.length.toString()
                }
                if (this.isOpen) {
                    ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.cardPreviewButtonLayout)
                } else ButtonManager.moveButton(ButtonManager.$.yesButton, ButtonManager.$.playerButtonLayout)
                if (this.selectQueue.length == numberOfCardsToSelect) {
                    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_AVAILABLE)
                    //   this.confirmSelectButton.enabled = true;
                } else {
                    ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_NOT_YET_AVAILABLE)
                }
            }, this)
        }
        let selectedQueue = await this.waitForSelect(numberOfCardsToSelect)
        for (let i = 0; i < selectedQueue.length; i++) {
            const preview = selectedQueue[i].getComponent(CardPreview);
            preview.counterLable.string = '';
            preview.counterLable.enabled = false;
        }
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.ENABLED)
        // this.exitButton.enabled = true;
        this.previewsToChooseFrom = []
        this.removeFromCurrentPreviews(previews.map(preview => preview.getComponent(CardPreview).card))
        return selectedQueue.map(preview => preview.getComponent(CardPreview).card);
    }

    static async waitForSelect(numberOfCardsToSelect: number): Promise<cc.Node[]> {
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.CHANGE_TEXT, ['Confirm'])
        ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.SET_CONFIRM_SELECT_IN_PREVIEWS)
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.CARD_PREV_MAN_WAIT_FOR_SELECT, (params) => {
                ButtonManager.enableButton(ButtonManager.$.yesButton, BUTTON_STATE.DISABLED)
                resolve(this.selectQueue)
            })

        });
    }


    static async getPreviews(cardsToPreview: cc.Node[], openPreviewManager: boolean) {
        let previews: cc.Node[] = [];
        for (let i = 0; i < cardsToPreview.length; i++) {
            let card = cardsToPreview[i]
            let preview = await this.addPreview(card)
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
            throw `Cant Add Preview Of null Card`
        }
        let exsistingPreview = this.getPreviewByCard(cardToAdd)
        if (exsistingPreview != null) {

            preview = exsistingPreview
            return preview
        } else {
            preview = this.cardPreviewPool.get().getComponent(CardPreview);
        }

        preview.card = cardToAdd;
        let cardComp = cardToAdd.getComponent(Card)


        if (cardToAdd.getComponent(Deck) != null || cardComp.topDeckof != null) {

            preview.node.getComponent(cc.Sprite).spriteFrame = cardToAdd.getComponent(cc.Sprite).spriteFrame;
        } else if (cardToAdd.getComponent(Pile) != null) {

            preview.node.getComponent(cc.Sprite).spriteFrame = cardToAdd.getComponent(Pile).pileSprite.spriteFrame;
        } else {

            preview.node.getComponent(cc.Sprite).spriteFrame = cardComp.frontSprite;
        }
        this.currentPreviews.push(preview.node)
        preview.node.active = true;
        let func = cc.callFunc(() => {
            try {
                CardPreviewManager.updatePreviewsEvents()
            } catch (error) {
                cc.error(error)
                Logger.error(error)
            }
        }, this)
        if (this.isOpen) {
            preview.node.opacity = 0
            preview.node.setParent(this.scrollView.content.getChildByName('PreviewLayout'));
            preview.node.runAction(cc.sequence(cc.fadeTo(TIME_TO_SHOW_PREVIEW, 255), func))
        } else {
            preview.node.opacity = 255
            preview.node.setParent(this.scrollView.content.getChildByName('PreviewLayout'));
            try {
                CardPreviewManager.updatePreviewsEvents()
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
            CardPreviewManager.updatePreviewsEvents()
        } catch (error) {
            cc.error(error)
            Logger.error(error)
        }
        let action = cc.fadeTo(TIME_TO_SHOW_PREVIEW, 255)
        CardPreviewManager.scrollView.node.setSiblingIndex(CardPreviewManager.$.node.parent.childrenCount - 1);
        if (CardPreviewManager.currentPreviews[0] != null) {
            let previewWidth = CardPreviewManager.currentPreviews[0].width
            let screenWidth = cc.find('Canvas').width

            if ((previewWidth + 10) * CardPreviewManager.currentPreviews.length > screenWidth) {
                CardPreviewManager.scrollView.content.width = (previewWidth + 10) * CardPreviewManager.currentPreviews.length
            } else CardPreviewManager.scrollView.content.width = screenWidth;
        }
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
        let action = cc.fadeTo(TIME_TO_SHOW_PREVIEW, 0)
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
            CardPreviewManager.updatePreviewsEvents()
        } catch (error) {
            cc.error(error)
            Logger.error(error)
        }
        // this.node.active = false;
    }


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        CardPreviewManager.$ = this;
        CardPreviewManager.scrollView = cc.find('Canvas/CardPreviewScroll').getComponent(cc.ScrollView)
        CardPreviewManager.scrollView.node.active = false
        CardPreviewManager.cardPreviewPool = new cc.NodePool(CardPreview)

        CardPreviewManager.previewsLayout = this.getComponent(cc.Layout)
        for (let i = 0; i < 25; i++) {
            let preview = cc.instantiate(this.cardPreviewPrefab);
            preview.name = 'preview' + i;
            CardPreviewManager.cardPreviewPool.put(preview)
        }

        this.node.on('previewRemoved', (previewToRemove: cc.Node) => {
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
