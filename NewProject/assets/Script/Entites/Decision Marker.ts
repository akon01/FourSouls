import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { DECISION_SHOW_TIME, GAME_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import ActionManager from "../Managers/ActionManager";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectVisManager from "../Managers/StackEffectVisManager";
import ActivateItem from "../StackEffects/Activate Item";
import ActivatePassiveEffect from "../StackEffects/Activate Passive Effect";
import AttackRoll from "../StackEffects/Attack Roll";
import CombatDamage from "../StackEffects/Combat Damage";
import DeclareAttack from "../StackEffects/Declare Attack";
import MonsterDeath from "../StackEffects/Monster Death";
import MonsterEndDeath from "../StackEffects/Monster End Death";
import MonsterRewardStackEffect from "../StackEffects/Monster Reward";
import PlayLootCardStackEffect from "../StackEffects/Play Loot Card";
import PlayerDeath from "../StackEffects/Player Death";
import PlayerDeathPenalties from "../StackEffects/Player Death Penalties";
import PurchaseItem from "../StackEffects/Purchase Item";
import RefillEmptySlot from "../StackEffects/Refill Empty Slot";
import RollDiceStackEffect from "../StackEffects/Roll DIce";
import StackEffectConcrete from "../StackEffects/StackEffectConcrete";
import StackEffectPreview from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import StartTurnLoot from "../StackEffects/Start Turn Loot";
import Card from "./GameEntities/Card";
import Player from "./GameEntities/Player";
import Store from "./GameEntities/Store";
import Stack from "./Stack";
import { whevent } from "../../ServerClient/whevent";
import CardPreview from "./Card Preview";
import { Logger } from "./Logger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DecisionMarker extends cc.Component {

    @property(cc.Graphics)
    graphicsComp: cc.Graphics = null;

    @property(cc.Node)
    canvas: cc.Node = null

    @property(CardPreview)
    cardPreview: CardPreview = null

    @property(StackEffectPreview)
    stackEffectPreview: StackEffectPreview = null

    @property({ visible: false })
    currentStackIcon: cc.SpriteFrame = null

    _decisionTimeout: any = null

    static $: DecisionMarker = null;

    // static async showDecision(start, end) {
    //     await this.$.showDecision(start, end)
    // }

    hideDecision() {
        this.cardPreview.node.active = false;
        this.stackEffectPreview.node.active = false
        StackEffectVisManager.$.previewPool.putByStackEffectPreview(this.stackEffectPreview)
        this.graphicsComp.clear()
        whevent.emit(GAME_EVENTS.HIDE_DECISION)
    }

    waitForDecisionHide() {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.HIDE_DECISION, () => {
                resolve()
            })
        })
    }

    async showEffectChosen(card: cc.Node, effectChosen: cc.Node) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            DecisionMarker.$.hideDecision()
        }
        this.cardPreview.setCard(card, true)
        this.graphicsComp.clear(true)
        const previewWidget = this.cardPreview.node.getComponent(cc.Widget);
        previewWidget.isAbsoluteLeft = false;
        previewWidget.isAlignLeft = true
        previewWidget.isAlignRight = false;
        previewWidget.left = 0.15;
        previewWidget.updateAlignment()
        this.cardPreview.node.active = true
        cc.log(effectChosen)
        const effect = this.cardPreview.addEffectToPreview(effectChosen)


        const topLeft = this.canvas.convertToNodeSpaceAR(effect.parent.convertToWorldSpaceAR(cc.v2(effect.x - effect.width / 2, effect.y + effect.height / 2)))
        const bottomLeft = this.canvas.convertToNodeSpaceAR(effect.parent.convertToWorldSpaceAR(cc.v2(effect.x - effect.width / 2, effect.y - effect.height / 2)))
        //    this.graphicsComp.moveTo(topLeft.x, topLeft.y)
        const rect = effect.getBoundingBoxToWorld()
        this.graphicsComp.rect(bottomLeft.x, bottomLeft.y, rect.width, rect.height)
        //this.graphicsComp.moveTo(0, 0)
        this.graphicsComp.fillColor == cc.Color.RED
        this.graphicsComp.stroke()
        ServerClient.$.send(Signal.SHOW_EFFECT_CHOSEN, { cardId: card.getComponent(Card)._cardId, pos: { x: bottomLeft.x, y: bottomLeft.y }, size: { w: effect.width, h: effect.height } })
        this._decisionTimeout = setTimeout(() => {
            this._decisionTimeout = null
            DecisionMarker.$.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()
        // this.graphicsComp.fillRect(topLeft.x, topLeft.y, effect.width, effect.height)
    }

    async showEffectFromServer(card: cc.Node, pos: { x: number, y: number }, size: { w: number, h: number }) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            DecisionMarker.$.hideDecision()
        }
        const previewWidget = this.cardPreview.node.getComponent(cc.Widget);
        previewWidget.isAbsoluteLeft = false;
        previewWidget.isAlignLeft = true
        previewWidget.isAlignRight = false;
        previewWidget.left = 0.15;
        previewWidget.updateAlignment()
        this.cardPreview.setCard(card, true)
        this.cardPreview.node.active = true
        this.graphicsComp.rect(pos.x, pos.y, size.w, size.h)
        this.graphicsComp.fillColor == cc.Color.RED
        this.graphicsComp.stroke()
        this._decisionTimeout = setTimeout(() => {
            this._decisionTimeout = null
            DecisionMarker.$.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()
    }

    async showDiceRoll(diceRollStack: RollDiceStackEffect | AttackRoll, sendToServer: boolean) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            DecisionMarker.$.hideDecision()
        }
        this.setCurrentStackPreview(StackEffectVisManager.$.previewPool.getByStackEffect(diceRollStack).getComponent(StackEffectPreview))
        let player: Player
        let card: cc.Node
        const playerCard = CardManager.getCardById(diceRollStack.creatorCardId, true);
        player = PlayerManager.getPlayerByCard(playerCard);
        if (diceRollStack instanceof RollDiceStackEffect) {
            if (diceRollStack.stackEffectToLock instanceof PlayLootCardStackEffect) {
                card = diceRollStack.stackEffectToLock.lootToPlay
            } else if (diceRollStack.stackEffectToLock instanceof ActivateItem) {
                card = diceRollStack.stackEffectToLock.itemToActivate
            } else if (diceRollStack.stackEffectToLock instanceof ActivatePassiveEffect) {
                card = diceRollStack.stackEffectToLock.cardWithEffect
            } else if (diceRollStack.stackEffectToLock instanceof MonsterRewardStackEffect) {
                card = diceRollStack.stackEffectToLock.monsterWithReward.node
            }
        } else if (diceRollStack instanceof AttackRoll) {
            card = diceRollStack.attackedMonster.node
        }
        cc.log(this.stackEffectPreview)
        cc.log(diceRollStack)
        this.stackEffectPreview.setStackEffect(diceRollStack)
        this.stackEffectPreview.flavorTextLable.string = ""
        const previewNode = this.stackEffectPreview.node
        this.stackEffectPreview.node.active = true
        this.movePreviewByEndCard(this.stackEffectPreview.node, card)




        const points = this.getOriginAndEndPointByPreviewAndEndCard(this.stackEffectPreview.node, card)
        this.graphicsComp.fillColor == cc.Color.BLUE
        this.graphicsComp.moveTo(points.originPoint.x, points.originPoint.y)
        this.graphicsComp.lineTo(points.endPoint.x, points.endPoint.y)
        this.graphicsComp.stroke()
        if (sendToServer) {
            ServerClient.$.send(Signal.SHOW_DICE_ROLL, { stackId: diceRollStack.entityId })
        }
        this._decisionTimeout = setTimeout(() => {
            this._decisionTimeout = null
            DecisionMarker.$.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()
    }

    getOriginAndEndPointByPreviewAndEndCard(preview: cc.Node, endCard: cc.Node) {
        let cardMiddleRightPoint: cc.Vec2
        let cardMiddleLeftPoint: cc.Vec2
        let cardTopMiddlePoint: cc.Vec2
        let cardBottomMiddlePoint: cc.Vec2
        let cardTopRightPoint: cc.Vec2
        let cardTopLeftPoint: cc.Vec2


        if (endCard.parent != null && endCard.parent != CardManager.$.onTableCardsHolder) {
            cardTopLeftPoint = this.canvas.convertToNodeSpaceAR(endCard.parent.convertToWorldSpaceAR(new cc.Vec2(endCard.x - endCard.width / 2, endCard.y + endCard.height / 2)))
            cardTopRightPoint = this.canvas.convertToNodeSpaceAR(endCard.parent.convertToWorldSpaceAR(new cc.Vec2(endCard.x + endCard.width / 2, endCard.y + endCard.height / 2)))
            cardMiddleLeftPoint = this.canvas.convertToNodeSpaceAR(endCard.parent.convertToWorldSpaceAR(new cc.Vec2(endCard.x - endCard.width / 2, 0)))
            cardMiddleRightPoint = this.canvas.convertToNodeSpaceAR(endCard.parent.convertToWorldSpaceAR(new cc.Vec2(endCard.x + endCard.width / 2, 0)))
            cardBottomMiddlePoint = this.canvas.convertToNodeSpaceAR(endCard.parent.convertToWorldSpaceAR(new cc.Vec2(endCard.x, endCard.y - endCard.height / 2)))
            cardTopMiddlePoint = this.canvas.convertToNodeSpaceAR(endCard.parent.convertToWorldSpaceAR(new cc.Vec2(endCard.x, endCard.y + endCard.height / 2)))
        } else {
            cardTopLeftPoint = new cc.Vec2(endCard.x - endCard.width / 2, endCard.y + endCard.height / 2)
            cardTopMiddlePoint = new cc.Vec2(endCard.x, endCard.y + endCard.height / 2)
            cardTopRightPoint = new cc.Vec2(endCard.x + endCard.width / 2, endCard.y + endCard.height / 2)
            cardMiddleLeftPoint = new cc.Vec2(endCard.x - endCard.width / 2, 0)
            cardMiddleRightPoint = new cc.Vec2(endCard.x + endCard.width / 2, 0)
            cardBottomMiddlePoint = new cc.Vec2(endCard.x, endCard.y - endCard.height / 2)
            cardTopMiddlePoint = new cc.Vec2(endCard.x, endCard.y + endCard.height / 2)

        }

        const previewNode = preview

        const previewLowPoint = this.canvas.convertToNodeSpaceAR(previewNode.parent.convertToWorldSpaceAR(new cc.Vec2(previewNode.x + previewNode.width / 2, previewNode.y - previewNode.height / 2)));
        const previewTopPoint = this.canvas.convertToNodeSpaceAR(previewNode.parent.convertToWorldSpaceAR(new cc.Vec2(previewNode.x + previewNode.width / 2, previewNode.y + previewNode.height / 2)));

        const startCardWR = previewNode.parent.convertToWorldSpaceAR(new cc.Vec2(previewNode.x + previewNode.width / 2, 0));
        let originPoint: cc.Vec2 = null
        let endPoint: cc.Vec2 = null

        if (cardTopRightPoint.x > 0) {
            const startCardWR = previewNode.parent.convertToWorldSpaceAR(new cc.Vec2(previewNode.x + previewNode.width / 2, 0));
            originPoint = this.canvas.convertToNodeSpaceAR(startCardWR)
            if (cardTopRightPoint.y < previewTopPoint.y && cardTopRightPoint.y > previewLowPoint.y) {
                endPoint = cardMiddleLeftPoint
            } else if (cardTopRightPoint.y > previewTopPoint.y) {
                endPoint = cardBottomMiddlePoint
            } else if (cardTopRightPoint.y < previewTopPoint.y) {
                endPoint = cardTopMiddlePoint
            } else {
                cc.log(`no endpoint found: end card top ${cardTopLeftPoint.y} start card top ${previewTopPoint.y} start card bottom ${previewLowPoint.y}`)
            }
        } else {
            const startCardWL = previewNode.parent.convertToWorldSpaceAR(new cc.Vec2(previewNode.x - previewNode.width / 2, 0));
            originPoint = this.canvas.convertToNodeSpaceAR(startCardWL)
            if (cardTopLeftPoint.y < previewTopPoint.y && cardTopLeftPoint.y > previewLowPoint.y) {
                endPoint = cardMiddleRightPoint
            } else if (cardTopLeftPoint.y > previewTopPoint.y) {
                endPoint = cardBottomMiddlePoint
            } else if (cardTopLeftPoint.y < previewLowPoint.y) {
                endPoint = cardTopMiddlePoint
            } else {
                cc.log(`no endpoint found: end card top ${cardTopLeftPoint.y} start card top ${previewTopPoint.y} start card bottom ${previewLowPoint.y}`)
            }
        }

        return { originPoint: originPoint, endPoint: endPoint }
    }

    movePreviewByEndCard(preview: cc.Node, endCard: cc.Node) {
        const previewWidget = preview.getComponent(cc.Widget);
        let endCardTopRightPoint: cc.Vec2
        if (endCard.parent != null && endCard.parent != CardManager.$.onTableCardsHolder) {
            endCardTopRightPoint = this.canvas.convertToNodeSpaceAR(endCard.parent.convertToWorldSpaceAR(new cc.Vec2(endCard.x + endCard.width / 2, endCard.y + endCard.height / 2)))
        } else {
            endCardTopRightPoint = new cc.Vec2(endCard.x + endCard.width / 2, endCard.y + endCard.height / 2)
        }


        if (endCardTopRightPoint.x > 0) {

            previewWidget.isAbsoluteLeft = false;
            previewWidget.isAlignLeft = true
            previewWidget.isAlignRight = false;
            previewWidget.left = 0.15;
        } else {

            previewWidget.isAbsoluteRight = false;
            previewWidget.isAlignLeft = false
            previewWidget.isAlignRight = true;
            previewWidget.right = 0.15;
        }
        previewWidget.updateAlignment()
        //   preview.parent = this.graphicsComp.node
    }


    changeAnimClipColor(card: cc.Node, colorNumber: number) {
        const animation = card.getComponentInChildren(cc.Animation)
        if (animation) {
            const clip = animation.getClips()[colorNumber]
            animation.defaultClip = clip
        }

    }

    setStackIcon(icon: cc.SpriteFrame, sendToServer: boolean) {
        this.currentStackIcon = icon
        // this.stackEffectPreview.setStackIcon(icon)
        // this.stackEffectPreview.showStackIcon()
        if (sendToServer) {
            ServerClient.$.send(Signal.SET_STACK_ICON, { iconIndex: StackEffectVisManager.$.stackIcons.indexOf(icon) })
        }
    }

    setCurrentStackPreview(stackEffectPreview: StackEffectPreview) {
        this.stackEffectPreview = stackEffectPreview;
        stackEffectPreview.node.parent = this.node
        this.setWidget(stackEffectPreview);
    }

    private setWidget(stackEffectPreview: StackEffectPreview) {

        const widget = stackEffectPreview.node.getComponent(cc.Widget);
        widget.isAlignTop = true;
        widget.isAbsoluteTop = false;
        widget.target = this.canvas
        widget.top = 0.2;
        widget.updateAlignment();
    }

    async showStackEffect(effectId: number, sendToServer: boolean) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            DecisionMarker.$.hideDecision()
        }
        const currentStack = Stack._currentStack
        const stackEffect = currentStack.find(stack => stack.entityId == effectId)
        if (!stackEffect) {
            Logger.error(`no stack effect to show`, { CurrentStack: Stack._currentStack, stackEffectToShowId: effectId })
            return
        }
        cc.error(`show stack effect decision marker`)
        cc.log(stackEffect._lable)
        this.setCurrentStackPreview(StackEffectVisManager.$.previewPool.getByStackEffect(stackEffect).getComponent(StackEffectPreview))
        if (this.currentStackIcon != null) {
            this.stackEffectPreview.setStackIcon(this.currentStackIcon)
            this.stackEffectPreview.showStackIcon()
        }
        const preview = this.stackEffectPreview;
        preview.setStackEffect(stackEffect)
        const endCard = this.getStackEffectEndCard(stackEffect)
        this.movePreviewByEndCard(preview.node, endCard)
        const points = this.getOriginAndEndPointByPreviewAndEndCard(preview.node, endCard)
        preview.node.active = true
        this.setWidget(preview)
        preview.node.getComponent(cc.Widget).updateAlignment();
        this.graphicsComp.moveTo(points.originPoint.x, points.originPoint.y)
        this.graphicsComp.lineTo(points.endPoint.x, points.endPoint.y)
        this.graphicsComp.fillColor == cc.Color.RED
        this.graphicsComp.stroke()
        if (sendToServer) {
            ServerClient.$.send(Signal.SHOW_STACK_EFFECT, { effectId: effectId })
        }
        this._decisionTimeout = setTimeout(() => {
            this._decisionTimeout = null
            DecisionMarker.$.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()
    }

    getStackEffectEndCard(stackEffect: StackEffectConcrete): cc.Node {
        let endCard: cc.Node
        switch (stackEffect.stackEffectType) {
            case STACK_EFFECT_TYPE.ACTIVATE_ITEM:
                endCard = (stackEffect as ActivateItem).itemToActivate
                break;
            case STACK_EFFECT_TYPE.ACTIVATE_PASSIVE_EFFECT:
                endCard = (stackEffect as ActivatePassiveEffect).cardWithEffect
                break;
            case STACK_EFFECT_TYPE.ATTACK_ROLL:
                endCard = (stackEffect as AttackRoll).attackedMonster.node
                break;
            case STACK_EFFECT_TYPE.COMBAT_DAMAGE:
                endCard = (stackEffect as CombatDamage).entityToTakeDamageCard
                break;
            case STACK_EFFECT_TYPE.DECLARE_ATTACK:
                endCard = (stackEffect as DeclareAttack).cardBeingAttacked
                break;
            case STACK_EFFECT_TYPE.MONSTER_DEATH:
                endCard = (stackEffect as MonsterDeath).monsterToDie.node
                break;
            case STACK_EFFECT_TYPE.MONSTER_END_DEATH:
                endCard = (stackEffect as MonsterEndDeath).monsterWhoDied.node
                break;
            case STACK_EFFECT_TYPE.MONSTER_REWARD:
                endCard = (stackEffect as MonsterRewardStackEffect).monsterWithReward.node
                break;
            case STACK_EFFECT_TYPE.PLAYER_DEATH:
                endCard = (stackEffect as PlayerDeath).playerToDie.character
                break;
            case STACK_EFFECT_TYPE.PLAYER_DEATH_PENALTY:
                endCard = (stackEffect as PlayerDeathPenalties).playerToPay.character
                break;
            case STACK_EFFECT_TYPE.PLAY_LOOT_CARD:
                endCard = (stackEffect as PlayLootCardStackEffect).lootToPlay
                break;
            case STACK_EFFECT_TYPE.PURCHASE_ITEM:
                endCard = (stackEffect as PurchaseItem).itemToPurchase
                break;
            case STACK_EFFECT_TYPE.REFILL_EMPTY_SLOT:
                endCard = (stackEffect as RefillEmptySlot).slotToFill
                if (!endCard) {
                    endCard = Store.$.layout.node
                }
                break;
            case STACK_EFFECT_TYPE.ROLL_DICE:
                endCard = this.getStackEffectEndCard((stackEffect as RollDiceStackEffect).stackEffectToLock)
                break;
            case STACK_EFFECT_TYPE.START_TURN_LOOT:
                endCard = (stackEffect as StartTurnLoot).turnPlayer.character
                break;
            default:
                break;
        }
        return endCard
    }

    async showDecision(startCard: cc.Node, endCard: cc.Node, sendToServer: boolean, flipEndCard?: boolean) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            DecisionMarker.$.hideDecision()
        }
        ActionManager.updateActionsForNotTurnPlayer(PlayerManager.mePlayer)
        // this.graphicsComp.lineWidth = 60
        this.cardPreview.setCard(startCard, true)
        this.cardPreview.node.active = true
        const previewWidget = this.cardPreview.node.getComponent(cc.Widget);
        const previewNode = this.cardPreview.node

        this.movePreviewByEndCard(this.cardPreview.node, endCard)

        const points = this.getOriginAndEndPointByPreviewAndEndCard(previewNode, endCard)

        this.graphicsComp.moveTo(points.originPoint.x, points.originPoint.y)
        this.graphicsComp.lineTo(points.endPoint.x, points.endPoint.y)
        this.graphicsComp.stroke()
        if (flipEndCard && endCard.getComponent(Card)._isFlipped) {
            endCard.getComponent(Card).flipCard(false)
        }
        if (sendToServer) {
            ServerClient.$.send(Signal.SHOW_DECISION, { startCardId: startCard.getComponent(Card)._cardId, endCardId: endCard.getComponent(Card)._cardId, flipEndCard: flipEndCard })
        }
        this._decisionTimeout = setTimeout(() => {
            if (flipEndCard && !endCard.getComponent(Card)._isFlipped) {
                endCard.getComponent(Card).flipCard(false)
            }
            this._decisionTimeout = null
            DecisionMarker.$.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()

    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.canvas = cc.find("/Canvas")
        DecisionMarker.$ = this
    }

    start() {

    }

    // update (dt) {}
}
