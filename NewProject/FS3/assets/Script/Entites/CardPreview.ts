import { Button, CCBoolean, CCString, Color, Component, error, EventTouch, instantiate, Label, log, math, Node, Sprite, tween, UIOpacity, UITransform, _decorator } from 'cc';
import { whevent } from "../../ServerClient/whevent";
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { GAME_EVENTS, TIME_TO_HIDE_PREVIEW } from "../Constants";
import { CardManager } from '../Managers/CardManager';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { CardEffect } from "./CardEffect";
import { Item } from "./CardTypes/Item";
import { Card } from "./GameEntities/Card";
import { Deck } from "./GameEntities/Deck";
import { Player } from "./GameEntities/Player";
import { GenericWrapper } from './GenericWrapper';
import { Pile } from "./Pile";
const { ccclass, property } = _decorator;


@ccclass('CardPreview')
export class CardPreview extends Component {


    card: Node | null = null;

    @property(Button)
    exitButton: Button | null = null;

    effectChosen: Effect | null = null;

    isSelected: boolean = false;

    @property(Label)
    counterLable: Label | null = null;

    @property(Node)
    counter: Node | null = null

    @property(Node)
    extraInfo: Node | null = null

    @property(Label)
    extraLable: Label | null = null

    @property([Node])
    effectChildren: Node[] = [];

    @property(Sprite)
    cardSprite: Sprite | null = null

    @property(Sprite)
    outerSprite: Sprite | null = null

    @property(CCBoolean)
    hasTouchProperty: boolean = false;

    @property(Node)
    effectChooseNode: Node | null = null

    @property(CCString)
    _groupUuid: string | null = null







    unuse() {
        this.node.active = true;
        this.node.getComponent(UIOpacity)!.opacity = 255;
        this.removeGroup()

    }

    reuse() {
        this.cardSprite = this.node.getChildByName("CardPreview")!.getComponent(Sprite)
    }

    setGroup(groupUuid: string) {
        this._groupUuid = groupUuid
        const color = this.outerSprite!.color;
        color.set(WrapperProvider.cardPreviewManagerWrapper.out.groups.get(groupUuid)!)
    }

    removeGroup() {
        this._groupUuid = null
        const color = this.outerSprite!.color;
        color.set(Color.WHITE)
    }

    setCard(cardToSet: Node, useFrontSprite: boolean) {
        this.card = cardToSet;
        const cardComp = cardToSet.getComponent(Card)!

        if (!this.cardSprite) { debugger; throw new Error("No Card Sprite"); }

        if (useFrontSprite) {
            if (cardToSet.getComponent(Deck) != null || cardComp.topDeckof != null) {

                this.cardSprite.spriteFrame = cardToSet.getComponent(Card)!.cardSprite!.spriteFrame;
            } else if (cardToSet.getComponent(Pile) != null) {

                this.cardSprite.spriteFrame = cardToSet.getComponent(Pile)!.pileSprite!.spriteFrame;
            } else {

                this.cardSprite.spriteFrame = cardComp.getComponent(Card)!.frontSprite;
            }
        } else {
            if (cardComp._isFlipped) {
                this.cardSprite.spriteFrame = cardComp.backSprite!
            } else {
                this.cardSprite.spriteFrame = cardComp.frontSprite!
            }
            //  this.cardSprite.spriteFrame = cardComp.node.getComponent(Sprite)!.spriteFrame;
        }
    }

    async hideCardPreview(event?: EventTouch) {
        if (event) {
            event.propagationStopped = true;;
        }
        this.node.off(Node.EventType.TOUCH_START);
        const cardNode = this.node.getChildByName(`CardPreview`)!
        for (let o = 0; o < this.effectChildren.length; o++) {
            const child = this.effectChildren[o];
            cardNode.removeChild(child);
        }
        const func = () => {
            // this.node.setSiblingIndex(0);
            this.card = null;
            this.hasTouchProperty = false
            this.cardSprite!.spriteFrame = null;
            this.node.active = false;
            whevent.emit(GAME_EVENTS.CARD_PREVIEW_HIDE_OVER)
            WrapperProvider.cardPreviewManagerWrapper.out.node.emit("previewRemoved", this.node)
        }
        //TODO-NEW Change To Fade!!
        tween(this.getComponent(UIOpacity)!)
            .to(TIME_TO_HIDE_PREVIEW, { opacity: 0 })
            .call(func)
            .start()
        //this.node.runAction(sequence(fadeTo(TIME_TO_HIDE_PREVIEW, 0), func));
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

    changeCardByName(text: string) {

        const getCard = (cardManagerWrapper: GenericWrapper<CardManager>, text: string) => {
            const allCards = new Map<string, Node>()
            cardManagerWrapper.out.GetAllCards().forEach(card => allCards.set(card.getComponent(Card)!.cardName, card))
            let availalbleAnswers = new Map<string, Node>();
            allCards.forEach((card, cardName) => {
                if (cardName.toLowerCase().startsWith(text.toLowerCase())) {
                    availalbleAnswers.set(cardName, card)
                }
            })
            console.log(`available answers`)
            console.log(availalbleAnswers)
            if (availalbleAnswers.size == 0) return null;
            if (availalbleAnswers.has(text)) {
                return availalbleAnswers.get(text)!
            }
            console.log(Array.from(availalbleAnswers.values()))
            return Array.from(availalbleAnswers.values())[0]
        }

        const card = getCard(WrapperProvider.cardManagerWrapper, text)
        if (card != null && card != undefined) {
            console.log(`change me to ${card.name}`)
            this.setCard(card, true)
        }
    }

    addEffectToPreview(effect: Effect, isDoNotAddClickEvent?: boolean) {
        console.error(`add effect to card preview`)
        const originalParent = effect.node;
        const originalY = effect.effectPosition.y;
        console.log(`effect original parent`, effect.node)

        const originalParentTrans = (originalParent.getComponent(UITransform)!);
        const parentHeight = originalParentTrans.height;
        console.log(`parent hegight : ${parentHeight}`)
        const preview = this.node.getChildByName(`CardPreview`)!
        console.log(`preview `, preview)
        const previewTrans = (preview.getComponent(UITransform)!);
        const yPositionScale = previewTrans.height / parentHeight;

        const heightScale = previewTrans.height / parentHeight;
        const widthScale = previewTrans.width / originalParentTrans.width;

        const name = effect.name + " " + preview.children.length

        const child = instantiate(this.effectChooseNode!);
        // child.getComponent(UITransform)!.priority = 1
        child.setSiblingIndex(1);
        child.name = name
        preview.addChild(child);
        const newEffect = preview.getChildByName(name)!;
        // newEffect.getComponent(Effect)!._effectCard = originalParent;
        this.effectChildren.push(newEffect);
        const newEffectTrans = (newEffect.getComponent(UITransform)!);
        console.log(`width:${newEffectTrans.width}; height:${newEffectTrans.height}; cardHeight:${previewTrans.height}; scale:${heightScale}`)

        //TODO:REMOVE /2 after changing all prefabs to right size.
        newEffectTrans.width = effect.effectPosition.width * widthScale
        //TODO:REMOVE /2 after changing all prefabs to right size.
        newEffectTrans.height = effect.effectPosition.height * heightScale;

        const newY = originalY * yPositionScale;
        //TODO:REMOVE /2 after changing all prefabs to right size.
        newEffect.setPosition(0, newY);
        console.log(`added ${newEffect.name} to preview`)
        if (isDoNotAddClickEvent == false || isDoNotAddClickEvent == undefined) {
            newEffect.once(Node.EventType.TOUCH_START, async () => {
                await this.hideCardPreview();
                console.log(`chosen ${effect.name}`)
                this.effectChosen = effect;
                whevent.emit(GAME_EVENTS.CARD_PREVIEW_CHOOSE_EFFECT, effect)
                //  CardPreview.wasEffectChosen = true;
            }, this);
        }
        return newEffect
    }

    async chooseEffectFromCard(card: Node, withPassives: boolean): Promise<Effect> {
        //  this.showCardPreview(card, false);

        WrapperProvider.cardPreviewManagerWrapper.out.openPreview(this.node)
        this.exitButton!.getComponent(Button)!.interactable = false;
        const index = WrapperProvider.cardPreviewManagerWrapper.out.previewsToChooseFrom.push(this.node) - 1
        const cardEffectComp = card.getComponent(CardEffect)!;
        const paidEffects = cardEffectComp.getPaidEffects();
        const activeEffects = cardEffectComp.getActiveEffects();
        const passiveEffects = cardEffectComp.getPassiveEffects();
        const cardEffects = [...paidEffects, ...activeEffects, ...passiveEffects]
        // let cardEffects = card.getComponent(CardEffect)!.activeEffects;
        //cardEffects = cardEffects.concat(card.getComponent(CardEffect)!.paidEffects)
        //let effects be chosen on click
        for (let i = 0; i < paidEffects.length; i++) {
            const effect = paidEffects[i];
            const preCondition = effect.getPreCondition()
            if (preCondition != null && preCondition.testCondition()) {

                this.addEffectToPreview(effect);
            } else if (preCondition == null) {

                this.addEffectToPreview(effect)
            }
        }

        for (let i = 0; i < activeEffects.length; i++) {
            const effect = activeEffects[i];
            const preCondition = effect.getPreCondition()
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
        if (withPassives) {
            for (const effect of passiveEffects) {
                this.addEffectToPreview(effect)
            }
        }

        WrapperProvider.announcementLableWrapper.out.showAnnouncement(`Player ${WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId} Is Choosing Effect From ${card.name}`, 0, true)
        const chosenEffect = await this.testForEffectChosen();
        WrapperProvider.announcementLableWrapper.out.hideAnnouncement(true)
        console.log(chosenEffect)
        // await decisionMarker._dm.showEffectChosen(card, chosenEffect)
        WrapperProvider.cardPreviewManagerWrapper.out.previewsToChooseFrom.splice(index, 1)
        //disable effects be chosen on click
        // for (let i = 0; i < cardEffects.length; i++) {
        //     const effect = cardEffects[i];
        //     effect.off(Node.EventType.TOUCH_START);
        // }
        this.exitButton!.getComponent(Button)!.interactable = true;
        return new Promise<Effect>((resolve, reject) => {
            resolve(chosenEffect);
        });
    }

    testForEffectChosen(): Promise<Effect> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.CARD_PREVIEW_CHOOSE_EFFECT, (effect: Effect) => {
                resolve(effect)
            })
        });
    }

    disableExit() {
        this.exitButton!.interactable = false;
    }

    enableExit() {
        this.exitButton!.interactable = true
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.getComponent(UIOpacity)!.opacity = 255;
        if (this.counter) {
            this.counterLable = this.counter.getComponentInChildren(Label);
        }
        if (this.extraInfo) {
            this.extraLable = this.extraInfo.getComponentInChildren(Label);
            this.extraInfo.active = false
        }
        if (this.counterLable) {
            this.counterLable.string = ""
        }
        if (this.node.getChildByName("CardPreview")) {
            this.cardSprite = this.node.getChildByName("CardPreview")!.getComponent(Sprite)
        }
        if (this.counter) {
            this.counter.active = false;
        }
    }

    update(dt: number) {
        if (this.card != null && this.card.getComponent(Card)!._counters > 0 && this.counter && this.counterLable) {
            this.counter.active = true;
            this.counterLable.string = this.card.getComponent(Card)!._counters.toString()
        } else if (this.counter && this.counterLable) {
            this.counter.active = false;
            this.counterLable.string = ""
        }
    }
}
