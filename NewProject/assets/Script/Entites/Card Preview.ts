import CardPreviewManager from "../Managers/CardPreviewManager"; import Card from "./GameEntities/Card"; import Deck from "./GameEntities/Deck"; import Pile from "./Pile"; import { whevent } from "../../ServerClient/whevent"; import { GAME_EVENTS, TIME_TO_HIDE_PREVIEW } from "../Constants"; import Effect from "../CardEffectComponents/CardEffects/Effect"; import CardEffect from "./CardEffect"; import Item from "./CardTypes/Item"; import DecisionMarker from "./Decision Marker";
import AnnouncementLable from "../LableScripts/Announcement Lable";
import PlayerManager from "../Managers/PlayerManager";
import Player from "./GameEntities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardPreview extends cc.Component {

    @property({ type: cc.Node, visible: false })
    card: cc.Node = null;

    @property(cc.Button)
    exitButton: cc.Button = null;

    effectChosen: cc.Node = null;

    isSelected: boolean = false;

    @property
    counterLable: cc.Label = null;

    @property(cc.Node)
    counter: cc.Node = null

    @property(cc.Node)
    extraInfo: cc.Node = null

    @property
    extraLable: cc.Label = null

    @property
    effectChildren: cc.Node[] = [];

    @property(cc.Sprite)
    cardSprite: cc.Sprite = null

    @property
    hasTouchProperty: boolean = false;

    @property
    _groupUuid: string = null

    unuse() {
        this.node.active = true;
        this.node.opacity = 255;
        this.removeGroup()

    }

    reuse() {
        this.cardSprite = this.node.getChildByName("CardPreview").getComponent(cc.Sprite)
    }

    setGroup(groupUuid: string) {
        this._groupUuid = groupUuid
        this.node.color = CardPreviewManager.groups.get(groupUuid)
    }

    removeGroup() {
        this._groupUuid = null
        this.node.color = cc.Color.WHITE
    }

    setCard(cardToSet: cc.Node, useFrontSprite: boolean) {
        this.card = cardToSet;
        const cardComp = cardToSet.getComponent(Card)

        //  if (useFrontSprite) {
        if (cardToSet.getComponent(Deck) != null || cardComp.topDeckof != null) {

            this.cardSprite.spriteFrame = cardToSet.getComponent(Card).cardSprite.spriteFrame;
        } else if (cardToSet.getComponent(Pile) != null) {

            this.cardSprite.spriteFrame = cardToSet.getComponent(Pile).pileSprite.spriteFrame;
        } else {

            this.cardSprite.spriteFrame = cardComp.getComponent(Card).frontSprite;
        }
        // } else {
        // this.cardSprite.spriteFrame = cardComp.node.getComponent(cc.Sprite).spriteFrame;
        //}
    }

    async hideCardPreview(event?) {
        if (event) {
            event.stopPropagation();
        }
        this.node.off(cc.Node.EventType.TOUCH_START);
        const cardNode = this.node.getChildByName(`CardPreview`)
        for (let o = 0; o < this.effectChildren.length; o++) {
            const child = this.effectChildren[o];
            cardNode.removeChild(child);
        }
        const func = cc.callFunc(() => {
            // this.node.setSiblingIndex(0);
            this.card = null;
            this.hasTouchProperty = false
            this.cardSprite.spriteFrame = null;
            this.node.active = false;
            whevent.emit(GAME_EVENTS.CARD_PREVIEW_HIDE_OVER)
            CardPreviewManager.$.node.emit("previewRemoved", this.node)
        }, this)
        this.node.runAction(cc.sequence(cc.fadeTo(TIME_TO_HIDE_PREVIEW, 0), func));
        //this.hideThisTimeOut = setTimeout(hideTimeOut, TIME_TO_HIDE_PREVIEW * 1000);
        await this.waitForHideOver()
    }

    waitForHideOver() {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.CARD_PREVIEW_HIDE_OVER, () => {
                resolve(true)
            })
        });
    }

    addEffectToPreview(effect: cc.Node) {
        const originalParent = effect.parent;
        const originalY = effect.y;

        const parentHeight = originalParent.height;
        const cardNode = this.node.getChildByName(`CardPreview`)
        const yPositionScale = cardNode.height / parentHeight;

        const heightScale = effect.height / parentHeight;
        const widthScale = cardNode.width / originalParent.width;

        const name = effect.name + " " + cardNode.childrenCount
        cardNode.addChild(cc.instantiate(effect), 1, name);
        const newEffect = cardNode.getChildByName(name);
        newEffect.getComponent(Effect)._effectCard = originalParent;
        this.effectChildren.push(newEffect);

        //TODO:REMOVE /2 after changing all prefabs to right size.
        newEffect.width = cardNode.width
        //TODO:REMOVE /2 after changing all prefabs to right size.
        newEffect.height = cardNode.height * heightScale;

        const newY = originalY * yPositionScale;
        //TODO:REMOVE /2 after changing all prefabs to right size.
        newEffect.setPosition(0, newY);
        cc.log(`added ${newEffect.name} to preview`)
        newEffect.once(cc.Node.EventType.TOUCH_START, async () => {
            await this.hideCardPreview();
            cc.log(`chosen ${effect.name}`)
            this.effectChosen = effect;
            whevent.emit(GAME_EVENTS.CARD_PREVIEW_CHOOSE_EFFECT, effect)
            //  CardPreview.wasEffectChosen = true;
        }, this);
        return newEffect
    }

    async chooseEffectFromCard(card: cc.Node): Promise<cc.Node> {
        //  this.showCardPreview(card, false);

        CardPreviewManager.openPreview(this.node)
        this.exitButton.getComponent(cc.Button).interactable = false;
        const index = CardPreviewManager.previewsToChooseFrom.push(this.node) - 1
        let cardEffects = card.getComponent(CardEffect).paidEffects
        // let cardEffects = card.getComponent(CardEffect).activeEffects;
        //cardEffects = cardEffects.concat(card.getComponent(CardEffect).paidEffects)
        //let effects be chosen on click
        for (let i = 0; i < cardEffects.length; i++) {
            const effect = cardEffects[i];
            const preCondition = effect.getComponent(Effect).preCondition
            if (preCondition != null && preCondition.testCondition()) {

                this.addEffectToPreview(effect);
            } else if (preCondition == null) {

                this.addEffectToPreview(effect)
            }
        }
        cardEffects = card.getComponent(CardEffect).activeEffects;
        for (let i = 0; i < cardEffects.length; i++) {
            const effect = cardEffects[i];
            const preCondition = effect.getComponent(Effect).preCondition
            const itemComp = card.getComponent(Item)
            if (itemComp != null) {
                if (!itemComp.needsRecharge) {

                    if (preCondition != null && preCondition.testCondition()) {

                        this.addEffectToPreview(effect);
                    } else if (preCondition == null) {

                        this.addEffectToPreview(effect)
                    }
                }
            } else {
                if (preCondition != null && preCondition.testCondition()) {
                    this.addEffectToPreview(effect);
                } else if (preCondition == null) {
                    this.addEffectToPreview(effect)
                }
            }
        }
        AnnouncementLable.$.showAnnouncement(`Player ${PlayerManager.mePlayer.getComponent(Player).playerId} Is Choosing Effect From ${card.name}`, 0, true)
        const chosenEffect = await this.testForEffectChosen();
        AnnouncementLable.$.hideAnnouncement(true)
        cc.log(chosenEffect)
        await DecisionMarker.$.showEffectChosen(card, chosenEffect)
        CardPreviewManager.previewsToChooseFrom.splice(index, 1)
        //disable effects be chosen on click
        for (let i = 0; i < cardEffects.length; i++) {
            const effect = cardEffects[i];
            effect.off(cc.Node.EventType.TOUCH_START);
        }
        this.exitButton.getComponent(cc.Button).interactable = true;
        return new Promise<cc.Node>((resolve, reject) => {
            resolve(chosenEffect);
        });
    }

    testForEffectChosen(): Promise<cc.Node> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.CARD_PREVIEW_CHOOSE_EFFECT, (effect) => {
                resolve(effect)
            })
        });
    }

    // showToOtherPlayers(card: cc.Node) {
    //   let currentPlayer = TurnsManager.currentTurn.PlayerId;
    //   let srvData = {
    //     cardToShowId: card.getComponent(Card)._cardId,
    //     playerId: currentPlayer
    //   };
    //   Server.$.send(Signal.SHOWCARDPREVIEW, srvData);
    // }

    // chooseEffect() {
    //     this.effectChosen = this.node;
    //     whevent.emit(GAME_EVENTS.CARD_PREVIEW_CHOOSE_EFFECT, this.effectChosen)
    //     // CardPreview.wasEffectChosen = true;
    // }

    disableExit() {
        this.exitButton.interactable = false;
    }

    enableExit() {
        this.exitButton.interactable = true
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.opacity = 255;
        this.counterLable = this.counter.getComponentInChildren(cc.Label);
        this.extraLable = this.extraInfo.getComponentInChildren(cc.Label);
        this.extraInfo.active = false
        this.counterLable.string = ""
        this.cardSprite = this.node.getChildByName("CardPreview").getComponent(cc.Sprite)
        this.counter.active = false;
    }

    start() {
        // CardPreview.$ = this;
    }

    update(dt) {
        if (this.card != null && this.card.getComponent(Card)._counters > 0) {
            this.counter.active = true;
            this.counterLable.string = this.card.getComponent(Card)._counters.toString()
        } else {
            this.counter.active = false;
            this.counterLable.string = ""
        }
    }
}
