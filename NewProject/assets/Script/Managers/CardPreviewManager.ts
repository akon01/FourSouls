import CardPreview from "../Entites/CardPreview";
import { TIMETOSHOWPREVIEW, COLORS } from "../Constants";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";
import Player from "../Entites/GameEntities/Player";
import CardEffect from "../Entites/CardEffect";
import CardManager from "./CardManager";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardPreviewManager extends cc.Component {

    @property(cc.Prefab)
    cardPreviewPrefab: cc.Prefab = null;

    static cardPreviewPool: cc.NodePool = null;

    static exitButton: cc.Button = null;


    static previewsLayout: cc.Layout = null;

    static scrollView: cc.ScrollView = null;

    static isSelectOver: boolean = false;

    private static previewsToChooseFrom: cc.Node[] = [];

    private static currentPreviews: cc.Node[] = [];

    static selectQueue: cc.Node[] = [];

    static confirmSelectButton: cc.Button;

    static setCurrentPreviews(previews: cc.Node[]) {
        this.currentPreviews = previews;
    }

    static addToCurrentPreviews(previews: cc.Node[]) {
        this.currentPreviews = this.currentPreviews.concat(previews.filter(preview => !this.currentPreviews.includes(preview)));
    }

    static removeFromCurrentPreviews(previews: cc.Node[]) {

        this.currentPreviews = this.currentPreviews.filter(preview => !previews.includes(preview));
        for (let i = 0; i < previews.length; i++) {
            const preview = previews[i].getComponent(CardPreview);
            if (preview.node.active) {
                //  preview.hideCardPreview();
            }
            this.cardPreviewPool.put(preview.node);
        }
    }

    static getPreviewByCard(card: cc.Node) {
        for (const preview of this.currentPreviews) {
            if (preview.getComponent(CardPreview).card == card) {
                return preview
            }
        }
        return null
        //throw `no preview with ${card.name} found`
    }


    static updatePreviewsEvents() {
        cc.log(`update previews events`)
        this.currentPreviews.forEach(preview => {
            if (this.previewsToChooseFrom.includes(preview)) {
                cc.log(`previews to choose from includes ${preview.name}`)
                return;
            }
            let cardComp;
            let newSprite;
            let card = preview.getComponent(CardPreview).card
            cardComp = card.getComponent(Deck)
            if (cardComp == null) {
                cardComp = card.getComponent(Card)
            }

            if (cardComp.isRequired) {
                cc.log(`${cardComp.name} is required`)
                if (card.getComponent(Deck) == null) {
                    newSprite = card.getComponent(Card).frontSprite;
                }
                preview.once(cc.Node.EventType.TOUCH_START, () => {
                    let cardPlayer = PlayerManager.getPlayerById(
                        TurnsManager.currentTurn.PlayerId
                    ).getComponent(Player);
                    preview.getComponent(CardPreview).hideCardPreview();
                    cardComp.requiredFor.cardChosen = card;
                    cardComp.requiredFor.isCardChosen = true;
                    CardManager.disableCardActions(card)
                });
            } else if (cardComp instanceof Card) {
                cc.log(`${card.name} is: reactable ${cardComp._isReactable}, activatable ${cardComp._isActivateable}, playable ${cardComp._isPlayable},attackable ${cardComp._isAttackable}, buyable ${cardComp._isBuyable}`)
                newSprite = card.getComponent(Card).frontSprite;
                if (cardComp._isReactable) {

                    preview.once(cc.Node.EventType.TOUCH_START, () => {
                        let cardPlayer = PlayerManager.getPlayerById(
                            cardComp._cardHolderId
                        ).getComponent(Player);
                        CardManager.disableCardActions(card)
                        if (!card.getComponent(CardEffect).hasMultipleEffects) {
                            preview.getComponent(CardPreview).hideCardPreview();
                        }
                        cardPlayer.activateCard(card);

                    });
                } else if (cardComp._isActivateable) {

                    preview.once(cc.Node.EventType.TOUCH_START, () => {
                        let cardPlayer = PlayerManager.getPlayerById(
                            TurnsManager.currentTurn.PlayerId
                        ).getComponent(Player);
                        CardManager.disableCardActions(card)
                        if (!card.getComponent(CardEffect).hasMultipleEffects) {
                            preview.getComponent(CardPreview).hideCardPreview();
                        }
                        cardPlayer.activateItem(card, true);
                    });
                } else if (cardComp._isPlayable) {

                    preview.once(cc.Node.EventType.TOUCH_START, () => {
                        let cardPlayer = PlayerManager.getPlayerById(
                            TurnsManager.currentTurn.PlayerId
                        ).getComponent(Player);
                        preview.getComponent(CardPreview).hideCardPreview();
                        CardManager.disableCardActions(card)
                        cardPlayer.playLootCard(card, true);
                    });
                }
                if (cardComp._isAttackable) {
                    cc.log(`${cardComp.name} is attackable`)
                    preview.once(cc.Node.EventType.TOUCH_START, () => {
                        cc.log(`${cardComp.name} has been clicked, start declare attack`)
                        let cardPlayer = PlayerManager.getPlayerById(
                            TurnsManager.currentTurn.PlayerId
                        ).getComponent(Player);
                        preview.getComponent(CardPreview).hideCardPreview();
                        CardManager.disableCardActions(card)
                        cardPlayer.declareAttack(card, true);
                    });
                } else if (cardComp._isBuyable) {

                    preview.once(cc.Node.EventType.TOUCH_START, () => {
                        let cardPlayer = PlayerManager.getPlayerById(
                            TurnsManager.currentTurn.PlayerId
                        ).getComponent(Player);
                        preview.getComponent(CardPreview).hideCardPreview();
                        CardManager.disableCardActions(card)
                        cardPlayer.buyItem(card, true);
                    });
                }
            }
            cc.log(cardComp)
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
        Server.$.send(Signal.SHOWCARDPREVIEW, srvData);
    }


    static confirmSelect() {
        CardPreviewManager.isSelectOver = true;
        CardPreviewManager.hidePreviewManager()
    }

    /**
     * 
     * @param cardsToSelectFrom card nodes to select from
     * @param numberOfCardsToSelect number of cards to select
     * @returns the nodes of the cards selected in order of selection
     */
    static async selectFromCards(cardsToSelectFrom: cc.Node[], numberOfCardsToSelect: number): Promise<cc.Node[]> {
        this.exitButton.enabled = false;
        this.previewsToChooseFrom = []
        let previews = this.getPreviews(cardsToSelectFrom)
        this.previewsToChooseFrom = previews;

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
            }, this)
        }
        let selectedQueue = await this.waitForSelect(numberOfCardsToSelect)
        for (let i = 0; i < selectedQueue.length; i++) {
            const preview = selectedQueue[i].getComponent(CardPreview);
            preview.counterLable.string = '';
            preview.counterLable.enabled = false;
        }
        this.exitButton.enabled = true;
        this.previewsToChooseFrom = []
        this.removeFromCurrentPreviews(previews)
        return selectedQueue.map(preview => preview.getComponent(CardPreview).card);
    }

    static async waitForSelect(numberOfCardsToSelect: number): Promise<cc.Node[]> {
        this.confirmSelectButton.node.active = true;
        this.confirmSelectButton.node.on(cc.Node.EventType.TOUCH_START, CardPreviewManager.confirmSelect)

        //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
        return new Promise((resolve, reject) => {
            let check = () => {
                if (this.selectQueue.length < numberOfCardsToSelect) {
                    this.confirmSelectButton.enabled = false;
                } else {
                    this.confirmSelectButton.enabled = true;
                }
                if (this.selectQueue.length == numberOfCardsToSelect) {
                    this.confirmSelectButton.enabled = true;
                }
                if (this.isSelectOver == true) {
                    this.isSelectOver = false;
                    resolve(this.selectQueue)
                } else {
                    setTimeout(check, 50);
                }
            };
            check.bind(this);
            setTimeout(check, 50);
        });
    }


    static getPreviews(cardsToPreview: cc.Node[]) {
        let previews: cc.Node[] = [];
        for (let i = 0; i < cardsToPreview.length; i++) {
            let card = cardsToPreview[i]
            let preview: CardPreview;
            let exsistingPreview = this.getPreviewByCard(card)
            if (exsistingPreview == null) {
                preview = this.cardPreviewPool.get().getComponent(CardPreview);
            } else {
                preview = exsistingPreview.getComponent(CardPreview)
            }
            preview.node.setParent(this.scrollView.content.getChildByName('PreviewLayout'));
            preview.node.runAction(cc.fadeTo(0, 255))
            preview.card = card;
            if (card.getComponent(Deck) == null) {

                preview.node.getComponent(cc.Sprite).spriteFrame = card.getComponent(Card).frontSprite;
            } else {
                preview.node.getComponent(cc.Sprite).spriteFrame = card.getComponent(cc.Sprite).spriteFrame;
            }
            this.currentPreviews.push(preview.node)
            previews.push(preview.node)
            preview.node.active = true;

            preview.node.runAction(cc.fadeTo(0, 255))

            // preview.node.runAction(cc.fadeTo(TIMETOSHOWPREVIEW, 255));

            //   await preview.showCardPreview2(card);
        }

        this.$.node.active = true;

        if (this.$.node.getNumberOfRunningActions() == 0) {
            this.showPreviewManager()
        } else {
            this.$.node.stopAllActions();
            this.showPreviewManager()
        }
        return previews
    }


    static makeCardsOpaqe() {
        this.currentPreviews.forEach(preview => preview.runAction(cc.fadeTo(0, 255)))

    }

    static showPreviewManager() {

        let action = cc.fadeTo(TIMETOSHOWPREVIEW, 255)
        CardPreviewManager.scrollView.node.setSiblingIndex(CardPreviewManager.$.node.parent.childrenCount - 1);
        CardPreviewManager.scrollView.node.active = true;
        CardPreviewManager.scrollView.node.runAction(cc.sequence(action, cc.callFunc(() => {
            CardPreviewManager.makeCardsOpaqe();
            CardPreviewManager.exitButton.node.getComponentInChildren(cc.Label).string = "-"
            CardPreviewManager.exitButton.node.off(cc.Node.EventType.TOUCH_START)
            CardPreviewManager.exitButton.node.on(cc.Node.EventType.TOUCH_START, CardPreviewManager.confirmSelect)
        }, CardPreviewManager)))
        CardPreviewManager.updatePreviewsEvents()
    }

    static hidePreviewManager(event?) {

        if (event) {
            event.stopPropagation();
        }
        CardPreviewManager.scrollView.node.active = false
        let action = cc.fadeTo(TIMETOSHOWPREVIEW, 0)
        CardPreviewManager.scrollView.node.runAction(cc.sequence(action, cc.callFunc(() => { CardPreviewManager.scrollView.node.active = false, this })))
        CardPreviewManager.exitButton.node.getComponentInChildren(cc.Label).string = "+"
        this.exitButton.node.off(cc.Node.EventType.TOUCH_START)
        this.exitButton.node.on(cc.Node.EventType.TOUCH_START, this.showPreviewManager)
        CardPreviewManager.updatePreviewsEvents()
        // this.node.active = false;
    }


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        CardPreviewManager.$ = this;
        CardPreviewManager.scrollView = cc.find('Canvas/CardPreviewScroll').getComponent(cc.ScrollView)
        // CardPreviewManager.exitButton = CardPreviewManager.scrollView.node.getChildByName('ExitPreviewsButton').getComponent(cc.Button)
        // CardPreviewManager.confirmSelectButton = CardPreviewManager.scrollView.node.getChildByName('ConfirmSelectButton').getComponent(cc.Button)
        CardPreviewManager.exitButton = cc.find('Canvas/ExitPreviewsButton').getComponent(cc.Button)
        CardPreviewManager.confirmSelectButton = cc.find('Canvas/ConfirmSelectButton').getComponent(cc.Button)
        CardPreviewManager.scrollView.node.active = false
        CardPreviewManager.cardPreviewPool = new cc.NodePool()

        CardPreviewManager.previewsLayout = this.getComponent(cc.Layout)
        for (let i = 0; i < 10; i++) {
            let preview = cc.instantiate(this.cardPreviewPrefab);
            preview.name = 'preview' + i;
            CardPreviewManager.cardPreviewPool.put(preview)
        }

        this.node.on('previewRemoved', (previewToRemove) => {
            CardPreviewManager.removeFromCurrentPreviews(Array.of(previewToRemove))
            if (CardPreviewManager.currentPreviews.length == 0) {
                CardPreviewManager.hidePreviewManager()
            }
        })
        CardPreviewManager.confirmSelectButton.node.active = false;
        CardPreviewManager.exitButton.node.getComponentInChildren(cc.Label).string = "+"
        CardPreviewManager.exitButton.node.off(cc.Node.EventType.TOUCH_START)
        CardPreviewManager.exitButton.node.on(cc.Node.EventType.TOUCH_START, CardPreviewManager.showPreviewManager)
    }

    start() {

    }

    // update (dt) {}
}
