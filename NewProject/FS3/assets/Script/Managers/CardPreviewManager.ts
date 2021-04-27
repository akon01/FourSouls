import { _decorator, Component, Prefab, NodePool, Layout, ScrollView, Node, Color, Label, find, instantiate, log, Widget, Tween, UITransform, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

import { Signal } from "../../Misc/Signal";

import { BUTTON_STATE, GAME_EVENTS } from "../Constants";
import { CardEffect } from "../Entites/CardEffect";
import { Card } from "../Entites/GameEntities/Card";
import { Deck } from "../Entites/GameEntities/Deck";
import { Player } from "../Entites/GameEntities/Player";
import { whevent } from "../../ServerClient/whevent";
import { CardPreview } from "../Entites/CardPreview";

import { WrapperProvider } from './WrapperProvider';

@ccclass("CardPreviewManager")
export class CardPreviewManager extends Component {

    @property(Prefab)
    cardPreviewPrefab: Prefab | null = null;

    cardPreviewPool: NodePool | null = null;

    previewsLayout: Layout | null = null;

    scrollView: ScrollView | null = null;

    previewsToChooseFrom: Node[] = [];

    private currentPreviews: Node[] = [];

    selectQueue: Node[] = [];

    isOpen = false;

    groups: Map<string, Color> = new Map()

    @property(Label)
    flavorTextLable: Label | null = null

    @property(Node)
    contentNode: Node | null = null


    setCurrentPreviews(previews: Node[]) {
        this.currentPreviews = previews;
    }

    addToCurrentPreviews(previews: Node[]) {
        this.currentPreviews = this.currentPreviews.concat(previews.filter(preview => !(this.currentPreviews.indexOf(preview) >= 0)));
    }

    setFalvorText(newText: string) {
        this.flavorTextLable!.string = newText
    }

    async clearPreviewsButtonClicked() {
        await this.clearAllPreviews()
    }

    async clearAllPreviews() {
        const removeablePreviews = this.currentPreviews.filter(preview => {
            if (!(this.previewsToChooseFrom.indexOf(preview) >= 0)) { return true }
        })
        const cardsToRemove = removeablePreviews.map(preview => preview.getComponent(CardPreview)!.card!)
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

    async removeFromCurrentPreviews(cards: Node[]) {

        const previews = cards.filter(card => this.getPreviewByCard(card)).map(card => this.getPreviewByCard(card)!.node!)

        this.currentPreviews = this.currentPreviews.filter(preview => !(previews.indexOf(preview) >= 0));
        for (let i = 0; i < previews.length; i++) {
            const preview = previews[i].getComponent(CardPreview)!
            //    console.log(`remove preview of ${preview.card.name}`)
            preview.hasTouchProperty = false;
            preview.node.off(Node.EventType.TOUCH_START)
            if (preview.node.active) {
                await preview.hideCardPreview();
            }
            this.cardPreviewPool!.put(preview.node);
        }
        if (this.currentPreviews.length == 0) {
            this.hidePreviewManager()
        }
    }

    getPreviewByCard(card: Node) {

        for (const preview of this.currentPreviews) {
            if (preview.getComponent(CardPreview)!.card == card) {
                return preview.getComponent(CardPreview)
            }
        }

        return null

        //throw `no preview with ${card.name} found`
    }

    disableAllCardsActions() {
        if (WrapperProvider.cardManagerWrapper.out.allCards.length != 0) {
            const cards = WrapperProvider.cardManagerWrapper.out.getOnTableCards().concat(...WrapperProvider.playerManagerWrapper.out.players.map(player => {
                return player.getComponent(Player)!.getHandCards()
            })).filter(card => {
                if (card.parent != null) { return true }
            })
            //  const allFlippedCards = WrapperProvider.cardManagerWrapper.out.allCards.filter(card => (!card.getComponent(Card)!._isFlipped))!.
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i]
                WrapperProvider.cardManagerWrapper.out.disableCardActions(card);
                for (const preview of this.currentPreviews) {
                    this.updatePreview(preview.getComponent(CardPreview)!)
                }
                // WrapperProvider.cardManagerWrapper.out.makeCardPreviewable(card);
            }
        }

    }

    updatePreview(preview: CardPreview) {
        preview.node.off(Node.EventType.TOUCH_END)
        preview.node.once(Node.EventType.TOUCH_END, async () => {

            if (this.previewsToChooseFrom.indexOf(preview.node) >= 0) {
                return;
            }
            let cardComp: Deck | Card;
            const card = preview.getComponent(CardPreview)!.card!
            cardComp = card.getComponent(Deck)!
            if (cardComp == null) {
                cardComp = card.getComponent(Card)!
            }
            //if the card is required for a data collector
            if (cardComp._isRequired) {
                console.log(`${cardComp.name} is required`)
                await preview.getComponent(CardPreview)!.hideCardPreview()!
                if (cardComp._requiredFor) {
                    cardComp._requiredFor.cardChosen = card;
                    cardComp._requiredFor.setIsCardChosen(true)
                } else {
                    throw new Error("card has Requierd For Flag, but no data collector set as requiredFor.");
                }
                this.disableAllCardsActions()
                this.hidePreviewManager()
            } else {
                // if (cardComp instanceof Card) {
                cardComp = card.getComponent(Card)!
                console.log(cardComp)
                if (cardComp._isReactable) {
                    const cardPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById((cardComp as Card)._cardHolderId)!
                    this.disableAllCardsActions()
                    if (!card.getComponent(CardEffect)!.hasMultipleEffects) {
                        await preview.getComponent(CardPreview)!.hideCardPreview()!
                    }
                    this.hidePreviewManager()
                    cardPlayer.activatedCard = card;
                    whevent.emit(GAME_EVENTS.PLAYER_CARD_ACTIVATED, card)
                    cardPlayer.cardActivated = true;
                } else if (cardComp._isActivateable) {
                    const cardPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId)!
                    this.disableAllCardsActions()
                    if (!card.getComponent(CardEffect)!.hasMultipleEffects) {
                        await preview.getComponent(CardPreview)!.hideCardPreview()!
                    }
                    this.hidePreviewManager()
                    await cardPlayer.activateCard(card);
                } else if (cardComp._isPlayable) {
                    const cardPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId)!
                    await preview.getComponent(CardPreview)!.hideCardPreview()!
                    this.disableAllCardsActions()
                    this.hidePreviewManager()
                    await cardPlayer.playLootCard(card, true);
                } else if (cardComp._isAttackable) {
                    const cardPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId)!
                    await preview.getComponent(CardPreview)!.hideCardPreview()!
                    this.disableAllCardsActions()
                    this.hidePreviewManager()
                    await cardPlayer.declareAttack(card, true);

                } else if (cardComp._isBuyable) {

                    const cardPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId)!
                    await preview.getComponent(CardPreview)!.hideCardPreview()!
                    this.disableAllCardsActions()
                    this.hidePreviewManager()
                    await cardPlayer.buyItem(card, true);

                }
            }
        }, this)
    }


    openPreview(preview: Node) {
        this.addToCurrentPreviews(Array.of(preview))
        if (this.isOpen == false) {
            this.showPreviewManager()
        } else {
            Tween.stopAllByTarget(this.node)
            this.showPreviewManager()
        }
    }

    showToOtherPlayers(cards: Node[]) {
        const currentPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId;
        const srvData = {
            cardsToShowId: cards.map(c => c.getComponent(Card)!._cardId),
            playerId: currentPlayer
        };
        WrapperProvider.serverClientWrapper.out.send(Signal.SHOW_CARD_PREVIEW, srvData);
    }

    confirmSelect() {
        whevent.emit(GAME_EVENTS.CARD_PREV_MAN_WAIT_FOR_SELECT)
        this.previewsToChooseFrom.forEach(preview => {
            preview.getComponent(CardPreview)!.extraInfo!.active = false
        })
        // this.isSelectOver = true;
        this.hidePreviewManager()
    }

    /**
     *
     * @param cardsToSelectFrom card nodes to select from
     * @param numberOfCardsToSelect number of cards to select, if 0 you can choose as many as you like
     * @returns the nodes of the cards selected in order of selection
     */
    async selectFromCards(cardsToSelectFrom: Node[], numberOfCardsToSelect: number, isUpToNumberOfCards?: boolean): Promise<Node[]> {
        const buttonManager = WrapperProvider.buttonManagerWrapper.out;
        buttonManager.enableButton(buttonManager.togglePreviewManagerButton!, BUTTON_STATE.DISABLED)
        buttonManager.enableButton(buttonManager.confirmButton!, BUTTON_STATE.ENABLED)
        if (numberOfCardsToSelect != 0) {
            buttonManager.enableButton(buttonManager.confirmButton!, BUTTON_STATE.SET_NOT_YET_AVAILABLE)
        }
        //   this.exitButton.enabled = false;
        this.previewsToChooseFrom = []
        if (this.isOpen) {
            this.hidePreviewManager()
        }
        await this.clearAllPreviews()
        if (this.currentPreviews.length != 0) {
            buttonManager.enableButton(buttonManager.confirmButton!, BUTTON_STATE.DISABLED)
            throw new Error(`still previews when should not be`)
        }
        cardsToSelectFrom.forEach(card => {
            WrapperProvider.cardManagerWrapper.out.disableCardActions(card)
        });
        const previews = await this.getPreviews(cardsToSelectFrom, true)
        this.previewsToChooseFrom = previews;
        this.previewsToChooseFrom.forEach(preview => {
            preview.getComponent(CardPreview)!.disableExit()
        })
        for (let i = 0; i < previews.length; i++) {
            const preview = previews[i];
            const previewComp = preview.getComponent(CardPreview)!
            preview.on(Node.EventType.TOUCH_START, () => {
                //if the preview is already selected,disable its selection
                if (this.selectQueue.indexOf(preview) >= 0) {
                    previewComp.extraInfo!.active = false;
                    this.selectQueue.splice(this.selectQueue.indexOf(preview), 1)
                    previewComp.isSelected = false;
                    //if not:
                    //special case: number of cards to select is any number
                } else if (numberOfCardsToSelect == 0) {
                    this.selectQueue.push(preview)
                    previewComp.isSelected = true;
                    previewComp.extraInfo!.active = true;
                    //  previewComp.counterLable.string = this.selectQueue.length.toString()
                    //if still more to choose, select the card
                } else if (this.selectQueue.length < numberOfCardsToSelect) {
                    this.selectQueue.push(preview)
                    previewComp.isSelected = true;
                    previewComp.extraInfo!.active = true;
                    // previewComp.counterLable.string = this.selectQueue.length.toString()
                }
                if (this.selectQueue.length >= numberOfCardsToSelect) {
                    buttonManager.enableButton(buttonManager.confirmButton!, BUTTON_STATE.SET_AVAILABLE)
                }
                else if (this.selectQueue.length <= numberOfCardsToSelect && isUpToNumberOfCards == true) {
                    buttonManager.enableButton(buttonManager.confirmButton!, BUTTON_STATE.SET_AVAILABLE)
                } else {
                    buttonManager.enableButton(buttonManager.confirmButton!, BUTTON_STATE.SET_NOT_YET_AVAILABLE)
                }
                for (let i = 0; i < this.selectQueue.length; i++) {
                    const previewInQueue = this.selectQueue[i].getComponent(CardPreview)!
                    if (i != 0) {
                        previewInQueue.extraLable!.string = (i + 1).toString();
                    } else {
                        previewInQueue.extraLable!.string = `1 /Top`
                    }

                }
            }, this)
        }
        let selectedQueue = await this.waitForSelect()
        this.selectQueue = []
        this.previewsToChooseFrom.forEach(preview => {
            preview.getComponent(CardPreview)!.enableExit()
        })
        buttonManager.enableButton(buttonManager.confirmButton!, BUTTON_STATE.DISABLED)
        for (let i = 0; i < selectedQueue.length; i++) {
            const preview = selectedQueue[i].getComponent(CardPreview)!
            preview.counterLable!.string = "";
            preview.counterLable!.enabled = false;
        }
        buttonManager.enableButton(buttonManager.togglePreviewManagerButton!, BUTTON_STATE.ENABLED)
        // this.exitButton.enabled = true;
        this.previewsToChooseFrom = []
        selectedQueue = selectedQueue.map(preview => preview.getComponent(CardPreview)!.card!)!
        await this.removeFromCurrentPreviews(previews.map(preview => preview.getComponent(CardPreview)!.card!))

        return selectedQueue;
    }

    async waitForSelect(): Promise<Node[]> {
        return new Promise((resolve) => {
            whevent.onOnce(GAME_EVENTS.CARD_PREV_MAN_WAIT_FOR_SELECT, () => {
                resolve(this.selectQueue)
            })

        });
    }

    async getPreviews(cardsToPreview: Node[], openPreviewManager: boolean, groupUuid?: string) {
        const previews: Node[] = [];
        for (let i = 0; i < cardsToPreview.length; i++) {
            const card = cardsToPreview[i]
            const preview = await this.addPreview(card, groupUuid)
            previews.push(preview.node)
        }

        // this.cardPreviewManagerWrapper._pm.node.active = true;

        if (openPreviewManager) {
            if (this.isOpen == false) {
                this.showPreviewManager()
            } else {
                Tween.stopAllByTarget(this.node)
                this.showPreviewManager()
            }
        }
        return previews
    }

    setGroup(preview: CardPreview, groupUuid?: string) {
        if (groupUuid == null || groupUuid == undefined) {
            return
        }
        if (groupUuid) {
            if (!this.groups.has(groupUuid)) {
                this.groups.set(groupUuid, new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255))
            }
            preview.setGroup(groupUuid)
        }
    }

    addPreview(cardToAdd: Node, groupUuid?: string) {

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
            preview = this.cardPreviewPool!.get()!.getComponent(CardPreview)!
        }
        preview.setCard(cardToAdd, false)
        this.setGroup(preview, groupUuid)
        this.currentPreviews.push(preview.node)
        preview.node.active = true;
        const func =
            //callFunc(
            () => {
                try {
                    this.updatePreview(preview)
                    // this.updatePreviewsEvents()
                } catch (error) {
                    WrapperProvider.loggerWrapper.out.error(error)
                }
            }
        //, this)
        preview.node.setPosition(0, 0)
        if (this.isOpen) {
            //     preview.node.opacity = 0

            preview.node.setParent(this.contentNode!.getChildByName("PreviewLayout"));
            this.orgenizePreviews()
            func()
            //preview.node.runAction(sequence(fadeTo(TIME_TO_SHOW_PREVIEW, 255), func))
        } else {
            //   preview.node.opacity = 255
            preview.node.setParent(this.contentNode!.getChildByName("PreviewLayout"));
            this.orgenizePreviews()
            try {
                this.updatePreview(preview)
                // this.updatePreviewsEvents()
            } catch (error) {
                WrapperProvider.loggerWrapper.out.error(error)
            }
        }
        return preview
    }

    orgenizePreviews() {

        const previewsWithGroup = this.currentPreviews.filter(preview => preview.getComponent(CardPreview)!._groupUuid != null).map(c => c.getComponent(CardPreview)!)
        const otherPreviews = this.currentPreviews.filter(preview => preview.getComponent(CardPreview)!._groupUuid == null).map(c => c.getComponent(CardPreview)!)
        const groupedPreviews: Map<string, CardPreview[]> = new Map()

        previewsWithGroup.forEach(preview => {
            if (groupedPreviews.has(preview._groupUuid!)) {
                groupedPreviews.get(preview._groupUuid!)!.push(preview)
            } else {
                groupedPreviews.set(preview._groupUuid!, [])
                groupedPreviews.get(preview._groupUuid!)!.push(preview)

            }
        });

        let allPreviews: CardPreview[] = []
        groupedPreviews.forEach(prev => {
            allPreviews.push(...prev)
        })

        allPreviews = allPreviews.concat(otherPreviews)
        for (let i = 0; i < allPreviews.length; i++) {
            const preview = allPreviews[i];
            preview.node.setSiblingIndex(0 + i)
            // const trans = preview.node.getComponent(UITransform)!
            // trans.priority = 0 + i
        }
    }

    makeCardsOpaqe() {
        //this.currentPreviews.forEach(preview => preview.opacity = 255)
    }

    openPrevManagerButtonClicked() {
        this.showPreviewManager()
    }

    closePrevManagerButtonClicked() {
        this.hidePreviewManager()
    }

    showPreviewManager() {
        if (WrapperProvider.stackEffectVisManagerWrapper.out.isOpen) {
            WrapperProvider.stackEffectVisManagerWrapper.out.hidePreviews()
        }
        this.scrollView!.content!.active = false
        this.scrollView!.content = this.contentNode
        this.scrollView!.content!.active = true
        try {
            for (const preview of this.currentPreviews) {
                this.updatePreview(preview.getComponent(CardPreview)!)
            }
            //  this.updatePreviewsEvents()
        } catch (error) {
            WrapperProvider.loggerWrapper.out.error(error)
        }
        // const action = fadeTo(TIME_TO_SHOW_PREVIEW, 255)
        //this.scrollView!.node.setSiblingIndex(this.node!.parent!.children.length! - 1);
        const scrollViewTrans = (this.scrollView!.content!.getComponent(UITransform)!);
        if (this.currentPreviews[0] != null) {
            const previewWidth = this.currentPreviews[0].getComponent(UITransform)!.width
            const screenWidth = WrapperProvider.CanvasNode!.getComponent(UITransform)!.width


            if ((previewWidth + 10) * this.currentPreviews.length > screenWidth) {
                scrollViewTrans.width = (previewWidth + 10) * this.currentPreviews.length
            } else { scrollViewTrans.width = screenWidth; }
        }
        const widget = this.scrollView!.content!.getComponent(Widget)!
        this.scrollView!.node.active = true;
        widget.top = 0;
        widget.left = 0;
        widget.updateAlignment()
        WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.togglePreviewManagerButton!, BUTTON_STATE.TOGGLE_TO_CLOSE_PREVIEWS)
        WrapperProvider.buttonManagerWrapper.out.moveAvailableButtonsTo(WrapperProvider.buttonManagerWrapper.out.cardPreviewButtonLayout!)
        this.isOpen = true
        // this.scrollView!.node.runAction(sequence(action, callFunc(() => {
        //     this.makeCardsOpaqe();
        //     whevent.emit(GAME_EVENTS.PREVIEW_MANAGER_OPEN)     
        // }, this.))
        this.makeCardsOpaqe();
        whevent.emit(GAME_EVENTS.PREVIEW_MANAGER_OPEN)
        //   scrollViewTrans.node.setSiblingIndex(1)
        //    scrollViewTrans.priority = 1
    }

    hidePreviewManager(event?: EventTouch) {
        if (event) {
            event.propagationStopped = true;
        }
        this.scrollView!.node.active = false
        //    const action = fadeTo(TIME_TO_SHOW_PREVIEW, 0)
        //     this.scrollView!.node.runAction(sequence(action, callFunc(() => {
        this.scrollView!.node.active = false
        //   }, this)))
        this.isOpen = false

        WrapperProvider.buttonManagerWrapper.out.moveAvailableButtonsTo(WrapperProvider.buttonManagerWrapper.out.playerButtonLayout!)
        WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.togglePreviewManagerButton!, BUTTON_STATE.TOGGLE_TO_OPEN_PREVIEWS)
        try {
            for (const preview of this.currentPreviews) {
                this.updatePreview(preview.getComponent(CardPreview)!)
            }
            //  this.updatePreviewsEvents()
        } catch (error) {
            WrapperProvider.loggerWrapper.out.error(error)
        }
        // this.node.active = false;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        const canvas = WrapperProvider.CanvasNode
        this.scrollView = find("CardPreviewScroll", canvas)!.getComponent(ScrollView)!
        this.scrollView.node.active = false
        this.cardPreviewPool = new NodePool(CardPreview)

        this.previewsLayout = this.getComponent(Layout)
        for (let i = 0; i < 10; i++) {
            const preview = instantiate(this.cardPreviewPrefab!);
            preview.name = "preview" + i;
            this.cardPreviewPool.put(preview)
        }

        this.node.on("previewRemoved", async (previewToRemove: Node) => {
            await this.removeFromCurrentPreviews(Array.of(previewToRemove.getComponent(CardPreview)!.card!))
            if (this.currentPreviews.length == 0) {
                this.hidePreviewManager()
            }
        })

        //    WrapperProvider.buttonManagerWrapper.out.moveButton(buttonManagerWrapper._bm.togglePreviewManagerButton, buttonManagerWrapper._bm.playerButtonLayout)
        WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.togglePreviewManagerButton!, BUTTON_STATE.TOGGLE_TO_OPEN_PREVIEWS)

    }

    start() {

    }

    // update (dt) {}
}
