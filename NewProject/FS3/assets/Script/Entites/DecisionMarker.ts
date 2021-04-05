import { Animation, Color, Component, find, Graphics, log, Node, SpriteFrame, UITransform, v3, Vec3, Widget, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DECISION_SHOW_TIME, GAME_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { ActivateItem } from "../StackEffects/ActivateItem";
import { ActivatePassiveEffect } from "../StackEffects/ActivatePassiveEffect";
import { AttackRoll } from "../StackEffects/AttackRoll";
import { CombatDamage } from "../StackEffects/CombatDamage";
import { DeclareAttack } from "../StackEffects/DeclareAttack";
import { MonsterDeath } from "../StackEffects/MonsterDeath";
import { MonsterEndDeath } from "../StackEffects/MonsterEndDeath";
import { MonsterRewardStackEffect } from "../StackEffects/MonsterReward";
import { PlayerDeath } from "../StackEffects/PlayerDeath";
import { PlayerDeathPenalties } from "../StackEffects/PlayerDeathPenalties";
import { PlayLootCardStackEffect } from "../StackEffects/PlayLootCard";
import { PurchaseItem } from "../StackEffects/PurchaseItem";
import { RefillEmptySlot } from "../StackEffects/RefillEmptySlot";
import { RollDiceStackEffect } from "../StackEffects/RollDIce";
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
import { StackEffectAvaialbleTypes, StackEffectPreview } from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import { StartTurnLoot } from "../StackEffects/StartTurnLoot";
import { CardPreview } from "./CardPreview";
import { Card } from "./GameEntities/Card";

const { ccclass, property } = _decorator;


@ccclass('DecisionMarker')
export class DecisionMarker extends Component {

    @property(Graphics)
    graphicsComp: Graphics | null = null;

    @property(Node)
    canvas: Node | null = null

    @property(CardPreview)
    cardPreview: CardPreview | null = null

    @property(StackEffectPreview)
    stackEffectPreview: StackEffectPreview | null = null


    currentStackIcon: SpriteFrame | null = null

    _decisionTimeout: any | null = null











    // async showDecision(start, end) {
    //     await this.$.showDecision(start, end)
    // }

    hideDecision() {
        this.cardPreview!.node.active = false;
        this.stackEffectPreview!.node.active = false
        WrapperProvider.stackEffectVisManagerWrapper.out.previewPool!.putByStackEffectPreview(this.stackEffectPreview!)
        this.graphicsComp!.clear()
        whevent.emit(GAME_EVENTS.HIDE_DECISION)
    }

    waitForDecisionHide() {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.HIDE_DECISION, () => {
                resolve(true)
            })
        })
    }

    async showEffectChosen(card: Node, effectChosen: Effect) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }
        if (!this.cardPreview) { debugger; throw new Error("No CardPreview"); }
        if (!this.graphicsComp) { debugger; throw new Error("No Grapics Comp"); }

        this.cardPreview.setCard(card, true)
        this.graphicsComp.clear()
        const previewWidget = this.cardPreview.node.getComponent(Widget)!;
        previewWidget.isAbsoluteLeft = false;
        previewWidget.isAlignLeft = true
        previewWidget.isAlignRight = false;
        previewWidget.left = 0.15;
        previewWidget.updateAlignment()
        this.cardPreview.node.active = true
        console.log(effectChosen)
        const effect = this.cardPreview.addEffectToPreview(effectChosen, true)


        const canvasTrans = (this.canvas!.getComponent(UITransform)!);
        const effectParentTrans = effect.parent!.getComponent(UITransform)!;
        const effectTrans = (effect.getComponent(UITransform)!);
        const topLeft = canvasTrans.convertToNodeSpaceAR(effectParentTrans.convertToWorldSpaceAR(v3(effect.position.x - effectTrans.width / 2, effect.position.y + effectTrans.height / 2)))
        const bottomLeft = canvasTrans.convertToNodeSpaceAR(effectParentTrans.convertToWorldSpaceAR(v3(effect.position.x - effectTrans.width / 2, effect.position.y - effectTrans.height / 2)))
        //    this.graphicsComp.moveTo(topLeft.x, topLeft.y)
        const rect = effectTrans.getBoundingBoxToWorld()
        this.graphicsComp.rect(bottomLeft.x, bottomLeft.y, rect.width, rect.height)
        //this.graphicsComp.moveTo(0, 0)
        this.graphicsComp.fillColor == Color.RED
        this.graphicsComp.stroke()
        WrapperProvider.serverClientWrapper.out.send(Signal.SHOW_EFFECT_CHOSEN, { cardId: card.getComponent(Card)!._cardId, pos: { x: bottomLeft.x, y: bottomLeft.y }, size: { w: effectTrans.width, h: effectTrans.height } })
        this._decisionTimeout = setTimeout(() => {
            this._decisionTimeout = null
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()
        // this.graphicsComp.fillRect(topLeft.x, topLeft.y, effect.width, effect.height)
    }

    async showEffectFromServer(card: Node, pos: { x: number, y: number }, size: { w: number, h: number }) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }
        if (!this.cardPreview) { debugger; throw new Error("No CardPreview"); }
        if (!this.graphicsComp) { debugger; throw new Error("No Grapics Comp"); }


        const previewWidget = this.cardPreview.node.getComponent(Widget)!;
        previewWidget.isAbsoluteLeft = false;
        previewWidget.isAlignLeft = true
        previewWidget.isAlignRight = false;
        previewWidget.left = 0.15;
        previewWidget.updateAlignment()
        this.cardPreview.setCard(card, true)
        this.cardPreview.node.active = true
        this.graphicsComp.rect(pos.x, pos.y, size.w, size.h)
        this.graphicsComp.fillColor == Color.RED
        this.graphicsComp.stroke()
        this._decisionTimeout = setTimeout(() => {
            this._decisionTimeout = null
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()
    }

    async showDiceRoll(diceRollStack: RollDiceStackEffect | AttackRoll, sendToServer: boolean) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }
        this.setCurrentStackPreview(WrapperProvider.stackEffectVisManagerWrapper.out.previewPool!.getByStackEffect(diceRollStack)!.getComponent(StackEffectPreview)!)

        let card: Node | null = null
        const playerCard = WrapperProvider.cardManagerWrapper.out.getCardById(diceRollStack.creatorCardId, true);

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
        console.log(this.stackEffectPreview)
        console.log(diceRollStack)
        if (!this.stackEffectPreview) { debugger; throw new Error("No Stack Effect Preview"); }
        this.stackEffectPreview.setStackEffect(diceRollStack, StackEffectAvaialbleTypes.Else)
        this.stackEffectPreview.flavorTextLable!.string = ""
        const previewNode = this.stackEffectPreview.node
        this.stackEffectPreview.node.active = true
        if (!card) { debugger; throw new Error("No Card!"); }

        this.movePreviewByEndCard(this.stackEffectPreview.node, card)




        const points = this.getOriginAndEndPointByPreviewAndEndCard(this.stackEffectPreview.node, card)

        if (!this.graphicsComp) { debugger; throw new Error("No Grapics Comp"); }

        this.graphicsComp.fillColor == Color.BLUE
        this.graphicsComp.moveTo(points.originPoint!.x, points.originPoint!.y)
        this.graphicsComp.lineTo(points.endPoint!.x, points.endPoint!.y)
        this.graphicsComp.stroke()
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.SHOW_DICE_ROLL, { stackId: diceRollStack.entityId })
        }
        this._decisionTimeout = setTimeout(() => {
            this._decisionTimeout = null
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()
    }

    getOriginAndEndPointByPreviewAndEndCard(preview: Node, endCard: Node) {
        let cardMiddleRightPoint: Vec3
        let cardMiddleLeftPoint: Vec3
        let cardTopMiddlePoint: Vec3
        let cardBottomMiddlePoint: Vec3
        let cardTopRightPoint: Vec3
        let cardTopLeftPoint: Vec3


        //     const canvasTrans = (this.canvas!.getComponent(UITransform)!);
        const canvasTrans = find('RenderRoot2D')!.getComponent(UITransform)!
        const endCardParentTrans = (endCard.parent!.getComponent(UITransform)!);
        const endCardTras = endCard.getComponent(UITransform)!
        // if (endCard.parent != null && endCard.parent != WrapperProvider.cardManagerWrapper.out.onTableCardsHolder) {
        cardTopLeftPoint = canvasTrans.convertToNodeSpaceAR(endCardParentTrans.convertToWorldSpaceAR(v3(endCard.position.x - endCardTras.width / 2, endCard.position.y + endCardTras.height / 2)))
        cardTopRightPoint = canvasTrans.convertToNodeSpaceAR(endCardParentTrans.convertToWorldSpaceAR(v3(endCard.position.x + endCardTras.width / 2, endCard.position.y + endCardTras.height / 2)))
        cardMiddleLeftPoint = canvasTrans.convertToNodeSpaceAR(endCardParentTrans.convertToWorldSpaceAR(v3(endCard.position.x - endCardTras.width / 2, 0)))
        cardMiddleRightPoint = canvasTrans.convertToNodeSpaceAR(endCardParentTrans.convertToWorldSpaceAR(v3(endCard.position.x + endCardTras.width / 2, 0)))
        cardBottomMiddlePoint = canvasTrans.convertToNodeSpaceAR(endCardParentTrans.convertToWorldSpaceAR(v3(endCard.position.x, endCard.position.y - endCardTras.height / 2)))
        cardTopMiddlePoint = canvasTrans.convertToNodeSpaceAR(endCardParentTrans.convertToWorldSpaceAR(v3(endCard.position.x, endCard.position.y + endCardTras.height / 2)))
        // } else {
        //     cardTopLeftPoint = canvasTrans.convertToNodeSpaceAR(v3(endCard.position.x - endCardTras.width / 2, endCard.position.y + endCardTras.height / 2))
        //     cardTopMiddlePoint = canvasTrans.convertToNodeSpaceAR(v3(endCard.position.x, endCard.position.y + endCardTras.height / 2))
        //     cardTopRightPoint = canvasTrans.convertToNodeSpaceAR(v3(endCard.position.x + endCardTras.width / 2, endCard.position.y + endCardTras.height / 2))
        //     cardMiddleLeftPoint = canvasTrans.convertToNodeSpaceAR(v3(endCard.position.x - endCardTras.width / 2, 0))
        //     cardMiddleRightPoint = canvasTrans.convertToNodeSpaceAR(v3(endCard.position.x + endCardTras.width / 2, 0))
        //     cardBottomMiddlePoint = canvasTrans.convertToNodeSpaceAR(v3(endCard.position.x, endCard.position.y - endCardTras.height / 2))
        //     cardTopMiddlePoint = canvasTrans.convertToNodeSpaceAR(v3(endCard.position.x, endCard.position.y + endCardTras.height / 2))

        // }

        const previewNode = preview

        const previewParentTrans = (previewNode.parent!.getComponent(UITransform)!);
        const previewNodeTrans = previewNode.getComponent(UITransform)!
        const previewLowPoint = canvasTrans.convertToNodeSpaceAR(previewParentTrans.convertToWorldSpaceAR(v3(previewNode.position.x + previewNodeTrans.width / 2, previewNode.position.y - previewNodeTrans.height / 2)));
        const previewTopPoint = canvasTrans.convertToNodeSpaceAR(previewParentTrans.convertToWorldSpaceAR(v3(previewNode.position.x + previewNodeTrans.width / 2, previewNode.position.y + previewNodeTrans.height / 2)));

        // const startCardWR = previewParentTrans.convertToWorldSpaceAR(v3(previewNode.position.x + previewNodeTrans.width / 2, 0));
        let originPoint: Vec3 | null = null
        let endPoint: Vec3 | null = null

        if (cardTopRightPoint.x > canvasTrans.width / 2) {
            const startCardWR = previewParentTrans.convertToWorldSpaceAR(v3(previewNode.position.x + previewNodeTrans.width / 2, 0));
            originPoint = canvasTrans.convertToNodeSpaceAR(startCardWR)
            if (cardTopRightPoint.y < previewTopPoint.y && cardTopRightPoint.y > previewLowPoint.y) {
                endPoint = cardMiddleLeftPoint
            } else if (cardTopRightPoint.y > previewTopPoint.y) {
                endPoint = cardBottomMiddlePoint
            } else if (cardTopRightPoint.y < previewTopPoint.y) {
                endPoint = cardTopMiddlePoint
            } else {
                console.log(`no endpoint found: end card top ${cardTopLeftPoint.y} start card top ${previewTopPoint.y} start card bottom ${previewLowPoint.y}`)
            }
        } else {
            const startCardWL = previewParentTrans.convertToWorldSpaceAR(v3(previewNode.position.x - previewNodeTrans.width / 2, 0));
            originPoint = canvasTrans.convertToNodeSpaceAR(startCardWL)
            if (cardTopLeftPoint.y < previewTopPoint.y && cardTopLeftPoint.y > previewLowPoint.y) {
                endPoint = cardMiddleRightPoint
            } else if (cardTopLeftPoint.y > previewTopPoint.y) {
                endPoint = cardBottomMiddlePoint
            } else if (cardTopLeftPoint.y < previewLowPoint.y) {
                endPoint = cardTopMiddlePoint
            } else {
                console.log(`no endpoint found: end card top ${cardTopLeftPoint.y} start card top ${previewTopPoint.y} start card bottom ${previewLowPoint.y}`)
            }
        }



        return { originPoint: originPoint, endPoint: endPoint }
    }

    movePreviewByEndCard(preview: Node, endCard: Node) {
        const previewWidget = preview.getComponent(Widget)!;
        let endCardTopRightPoint: Vec3
        const canvasTrans = this.canvas!.getComponent(UITransform)!;
        const endCardParentTRans = endCard.parent!.getComponent(UITransform)!;
        const endCardTrans = (endCard.getComponent(UITransform)!);
        if (endCard.parent != null && endCard.parent != WrapperProvider.cardManagerWrapper.out.onTableCardsHolder) {
            endCardTopRightPoint = canvasTrans.convertToNodeSpaceAR(endCardParentTRans.convertToWorldSpaceAR(v3(endCard.position.x + endCardTrans.width / 2, endCard.position.y + endCardTrans.height / 2)))
        } else {
            endCardTopRightPoint = v3(endCard.position.x + endCardTrans.width / 2, endCard.position.y + endCardTrans.height / 2)
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


    changeAnimClipColor(card: Node, colorNumber: number) {
        const animation = card.getComponentInChildren(Animation)
        if (animation) {
            const clip = animation.clips[colorNumber]
            animation.defaultClip = clip
        }

    }

    setStackIcon(icon: SpriteFrame, sendToServer: boolean) {
        this.currentStackIcon = icon
        // this.stackEffectPreview.setStackIcon(icon)
        // this.stackEffectPreview.showStackIcon()
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.SET_STACK_ICON, { iconIndex: WrapperProvider.stackEffectVisManagerWrapper.out.stackIcons.indexOf(icon) })
        }
    }

    setCurrentStackPreview(stackEffectPreview: StackEffectPreview) {
        this.stackEffectPreview = stackEffectPreview;
        stackEffectPreview.node.parent = this.node
        this.setWidget(stackEffectPreview);
    }

    private setWidget(stackEffectPreview: StackEffectPreview) {

        const widget = stackEffectPreview.node.getComponent(Widget)!;
        widget.isAlignTop = true;
        widget.isAbsoluteTop = false;
        widget.target = this.canvas
        widget.top = 0.2;
        widget.updateAlignment();
    }

    async showStackEffect(effectId: number, sendToServer: boolean) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }
        const currentStack = WrapperProvider.stackWrapper.out._currentStack
        const stackEffect = currentStack.find(stack => stack.entityId == effectId)
        if (!stackEffect) {
            WrapperProvider.loggerWrapper.out.error(`no stack effect to show`, { CurrentStack: WrapperProvider.stackWrapper.out._currentStack, stackEffectToShowId: effectId })
            return
        }
        this.setCurrentStackPreview(WrapperProvider.stackEffectVisManagerWrapper.out.previewPool!.getByStackEffect(stackEffect)!.getComponent(StackEffectPreview)!)
        if (!this.stackEffectPreview) { debugger; throw new Error("No Stack Effect Preview"); }
        if (!this.graphicsComp) { debugger; throw new Error("No Graphics Comp"); }
        if (this.currentStackIcon != null) {
            this.stackEffectPreview.setStackIcon(this.currentStackIcon)
            this.stackEffectPreview.showStackIcon()
        }
        const preview = this.stackEffectPreview;
        let stackEffectType = StackEffectAvaialbleTypes.Else
        if (stackEffect instanceof PlayLootCardStackEffect) {
            stackEffectType = StackEffectAvaialbleTypes.PlayLootCardStackEffect
        } else if (stackEffect instanceof ActivateItem) {
            stackEffectType = StackEffectAvaialbleTypes.ActivateItem
        } else if (stackEffect instanceof ActivatePassiveEffect) {
            stackEffectType = StackEffectAvaialbleTypes.ActivatePassiveEffect
        }
        preview.setStackEffect(stackEffect, stackEffectType)
        const endCard = this.getStackEffectEndCard(stackEffect)
        this.movePreviewByEndCard(preview.node, endCard)
        const points = this.getOriginAndEndPointByPreviewAndEndCard(preview.node, endCard)
        preview.node.active = true
        this.setWidget(preview)
        preview.node.getComponent(Widget)!.updateAlignment();
        // this.graphicsComp.moveTo(0, 0)
        // this.graphicsComp.lineTo(100, 100)
        this.graphicsComp.moveTo(points.originPoint.x, points.originPoint.y)
        this.graphicsComp.lineTo(points.endPoint!.x, points.endPoint!.y)
        this.graphicsComp.fillColor == Color.RED
        this.graphicsComp.stroke()
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.SHOW_STACK_EFFECT, { effectId: effectId })
        }
        this._decisionTimeout = setTimeout(() => {
            this._decisionTimeout = null
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()
    }

    getStackEffectEndCard(stackEffect: StackEffectInterface): Node {
        let endCard: Node
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
                endCard = (stackEffect as PlayerDeath).playerToDie.character!
                break;
            case STACK_EFFECT_TYPE.PLAYER_DEATH_PENALTY:
                endCard = (stackEffect as PlayerDeathPenalties).playerToPay.character!
                break;
            case STACK_EFFECT_TYPE.PLAY_LOOT_CARD:
                endCard = (stackEffect as PlayLootCardStackEffect).lootToPlay
                break;
            case STACK_EFFECT_TYPE.PURCHASE_ITEM:
                endCard = (stackEffect as PurchaseItem).itemToPurchase
                break;
            case STACK_EFFECT_TYPE.REFILL_EMPTY_SLOT:
                endCard = (stackEffect as RefillEmptySlot).slotToFill!
                if (!endCard) {
                    endCard = WrapperProvider.storeWrapper.out.layout!.node
                }
                break;
            case STACK_EFFECT_TYPE.ROLL_DICE:
                endCard = this.getStackEffectEndCard((stackEffect as RollDiceStackEffect).stackEffectToLock)
                break;
            case STACK_EFFECT_TYPE.START_TURN_LOOT:
                endCard = (stackEffect as StartTurnLoot).turnPlayer.character!
                break;
            default:
                throw new Error("No End Card Found!");
                break;
        }
        return endCard
    }

    async showDecision(startCard: Node, endCard: Node, sendToServer: boolean, flipEndCard?: boolean) {
        if (this._decisionTimeout) {
            clearTimeout(this._decisionTimeout)
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }
        WrapperProvider.actionManagerWrapper.out.updateActionsForNotTurnPlayer(WrapperProvider.playerManagerWrapper.out.mePlayer!)
        // this.graphicsComp.lineWidth = 60
        if (!this.cardPreview) { debugger; throw new Error("No CardPreview"); }

        this.cardPreview.setCard(startCard, true)
        this.cardPreview.node.active = true
        const previewWidget = this.cardPreview.node.getComponent(Widget);
        const previewNode = this.cardPreview.node

        this.movePreviewByEndCard(this.cardPreview.node, endCard)

        const points = this.getOriginAndEndPointByPreviewAndEndCard(previewNode, endCard)
        if (!this.graphicsComp) { debugger; throw new Error("No Graphics Comp"); }

        this.graphicsComp.moveTo(points.originPoint.x, points.originPoint.y)
        this.graphicsComp.lineTo(points.endPoint!.x, points.endPoint!.y)
        this.graphicsComp.stroke()
        if (flipEndCard && endCard.getComponent(Card)!._isShowingBack) {
            endCard.getComponent(Card)!.flipCard(false)
        }
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.SHOW_DECISION, { startCardId: startCard.getComponent(Card)!._cardId, endCardId: endCard.getComponent(Card)!._cardId, flipEndCard: flipEndCard })
        }
        this._decisionTimeout = setTimeout(() => {
            if (flipEndCard && !endCard.getComponent(Card)!._isShowingBack) {
                endCard.getComponent(Card)!.flipCard(false)
            }
            this._decisionTimeout = null
            WrapperProvider.decisionMarkerWrapper.out.hideDecision()
        }, DECISION_SHOW_TIME * 1000);
        await this.waitForDecisionHide()

    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.canvas = WrapperProvider.CanvasNode
        WrapperProvider.decisionMarkerWrapper.out = this
    }

    start() {

    }

    // update (dt) {}
}
