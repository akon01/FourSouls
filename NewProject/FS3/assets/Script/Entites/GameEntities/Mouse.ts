import { Component, EventMouse, SystemEventType, v3, Vec2, Widget, _decorator, Node, math, tween } from 'cc';
import { Signal } from '../../../Misc/Signal';
import { TIME_TO_SHOW_PREVIEW_ON_HOVER } from '../../Constants';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { CardPreview } from '../CardPreview';
import { Card } from './Card';
import { Player } from './Player';
const { ccclass, property } = _decorator;


enum Orientation {
    UP_LEFT,
    UP_RIGHT,
    DOWN_LEFT,
    DOWN_RIGTH
}

export enum HoverSpriteType {
    default, front, back
}

const BUFFERFORMOVEMENT = 10

@ccclass('Mouse')
export class Mouse extends Component {

    player: Player | null = null;

    private Pos: Vec2 = new Vec2()

    hoverdCard: Card | null = null

    @property(CardPreview)
    private cardPreview: CardPreview | null = null

    private cardPreviewWidget: Widget | null = null

    @property(Node)
    private MouseSprite: Node | null = null

    private setOriantation(orientationToSet: Orientation) {
        if (this.cardPreviewWidget && this.MouseSprite) {
            switch (orientationToSet) {
                case Orientation.UP_LEFT:
                    this.cardPreviewWidget.isAlignTop = false
                    this.cardPreviewWidget.isAlignBottom = true
                    this.cardPreviewWidget.bottom = 1
                    this.MouseSprite.setWorldRotation(0, 0, 0, 0)
                    break;
                case Orientation.UP_RIGHT:
                    this.cardPreviewWidget.isAlignTop = false
                    this.cardPreviewWidget.isAlignBottom = true
                    this.cardPreviewWidget.bottom = 1
                    //  this.MouseSprite.setWorldRotation(0, 1, 0, 0)
                    break;
                case Orientation.DOWN_LEFT:
                    this.cardPreviewWidget.isAlignTop = true
                    this.cardPreviewWidget.isAlignBottom = false
                    this.cardPreviewWidget.top = 1
                    //  this.MouseSprite.setWorldRotation(1, 0, 0, 0)
                    break;
                case Orientation.DOWN_RIGTH:
                    this.cardPreviewWidget.isAlignTop = true
                    this.cardPreviewWidget.isAlignBottom = false
                    this.cardPreviewWidget.top = 1
                    //   this.MouseSprite.setWorldRotationFromEuler(180, 180, 0)
                    break;
                default:
                    break;
            }
            //this.cardPreviewWidget.updateAlignment()
        }
    }



    setMouseListenr() {
        WrapperProvider.CanvasNode.on(SystemEventType.MOUSE_MOVE, this.setThisPosEvent, this)
    }


    private bufferedMovements = 0

    lastPos: { x: number, y: number } = { x: 0, y: 0 }



    handleSendMovement() {
        //TODO: Currently if sending movement position is out of sync because the board is set diffrently for every player.
        //WrapperProvider.serverClientWrapper.out.send(Signal.MOUSE_CURSOR_MOVE, { pos: { x: this.Pos.x, y: this.Pos.y }, playerId: this.player?.playerId })
    }

    tweenThisPos(x: number, y: number) {
        this.lastPos.x = this.Pos.x
        this.lastPos.y = this.Pos.y
        this.Pos.x = x
        this.Pos.y = y
        this.node.setWorldPosition(v3(this.Pos.x, this.Pos.y))
        // tween(this.node).to(0.2, { worldPosition: v3(this.Pos.x, this.Pos.y) }, { easing: 'quadIn' }).start()
    }

    setThisPos(x: number, y: number) {
        this.lastPos.x = this.Pos.x
        this.lastPos.y = this.Pos.y
        this.Pos.x = x
        this.Pos.y = y
        this.node.setWorldPosition(v3(this.Pos.x, this.Pos.y))
    }

    sendPos = false

    setThisPosEvent(e: EventMouse) {
        this.sendPos = true
        this.setThisPos(e.getUILocationX(), e.getUILocationY())
        // if (this.player) {
        //     this.handleSendMovement()
        // }
    }

    private isShowingCard: Card | null = null

    showCardHover() {
        if (!this.hoverdCard) return
        // debugger
        const card = this.hoverdCard
        this.cardPreview?.setCard(card.node, false)
        this.cardPreview!.node.active = true;
        this.isShowingCard = card
    }

    hideCardHover(card: Card) {
        //   this.cardPreview?.setCard(card.node, true)
        this.cardPreview!.node.active = false;
        this.isShowingCard = null
    }

    getShowCardHoverFn(card: Card) {
        const toReturnFn = () => {
            this.showCardHover()
        }
        return toReturnFn.bind(this)
    }

    private cardFnMap = new Map()

    setCardHover(card: Card) {
        this.hoverdCard = card
        const fn = this.getShowCardHoverFn(card)
        this.cardFnMap.set(card, fn)
        this.scheduleOnce(this.showCardHover, TIME_TO_SHOW_PREVIEW_ON_HOVER)
    }

    setCardHoverLeave(card: Card) {
        if (this.hoverdCard == card) {
            this.cardFnMap.get(card)
            this.unschedule(this.cardFnMap.get(card))
            this.hoverdCard = null
        }
        if (this.isShowingCard == card) {
            this.hideCardHover(card)
        }
    }

    setCardEnterAndLeaveEvents(card: Card) {
        const mosueEventFn = (e: any) => {
            this.setCardHover(card)
        }
        const mosueEventLeaveFn = (e: any) => {
            this.setCardHoverLeave(card)
        }
        card.node.on(SystemEventType.MOUSE_ENTER, mosueEventFn, this)
        card.node.on(SystemEventType.MOUSE_LEAVE, mosueEventLeaveFn, this)
    }

    getPosition() {
        return this.Pos
    }

    start() {
        //this.setMouseListenr()
        this.cardPreviewWidget = this.cardPreview!.node.getComponent(Widget)!
        this.canvasHalfPoints.x = WrapperProvider.CanvasNode._uiProps.uiTransformComp!.width / 2
        this.canvasHalfPoints.y = WrapperProvider.CanvasNode._uiProps.uiTransformComp!.height / 2
        // [3]
    }

    private canvasHalfPoints: { x: number, y: number } = { x: 0, y: 0 }

    update(deltaTime: number) {
        let oriToSet: Orientation = this.getOrientation();
        this.setOriantation(oriToSet)
        if (this.player && this.sendPos) {
            this.sendPos = false
            this.handleSendMovement()
        }
    }

    private getOrientation() {
        const mousePos = this.getPosition();
        const isAboveHalf = this.canvasHalfPoints.y < mousePos.y;
        const isLeftHalf = this.canvasHalfPoints.x > mousePos.x;
        let oriToSet: Orientation = Orientation.DOWN_LEFT;
        if (isAboveHalf) {
            if (isLeftHalf) {
                oriToSet = Orientation.DOWN_RIGTH;
            } else {
                oriToSet = Orientation.DOWN_LEFT;
            }
        } else {
            if (isLeftHalf) {
                oriToSet = Orientation.UP_RIGHT;
            } else {
                oriToSet = Orientation.UP_LEFT;
            }
        }
        return oriToSet;
    }
}