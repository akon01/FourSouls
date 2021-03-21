import { Component, IPoolHandlerComponent, Label, Node, Sprite, SpriteFrame, Tween, UITransform, Widget, _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { Effect } from "../../CardEffectComponents/CardEffects/Effect";
import { Card } from "../../Entites/GameEntities/Card";
import { ActivateItem } from "../ActivateItem";
import { ActivatePassiveEffect } from "../ActivatePassiveEffect";
import { PlayLootCardStackEffect } from "../PlayLootCard";
import { StackEffectInterface } from "../StackEffectInterface";
import { WrapperProvider } from '../../Managers/WrapperProvider';
const { ccclass, property } = _decorator;


@ccclass('StackEffectPreview')
export class StackEffectPreview extends Component implements IPoolHandlerComponent {



    reuse(args: any): void {
        // if (this.cardEffectMask) {
        //     this.cardEffectMask!.active = true;
        // }
    }

    @property(Label)
    flavorTextLable: Label | null = null;


    flavorText: string = "";

    @property(Label)
    nameLable: Label | null = null;

    @property(Node)
    cardEffectMask: Node | null = null


    nameText: string = "";

    @property(Node)
    imageArea: Node | null = null;

    @property
    imageSprite: SpriteFrame | null = null;

    @property(Sprite)
    templateBottom: Sprite | null = null

    @property(Node)
    bottomMaskNode: Node | null = null;

    @property(Sprite)
    topOriginSprite: Sprite | null = null;


    stackEffect: StackEffectInterface | null = null

    @property
    isShowExtraInfo: boolean = false;

    @property(Sprite)
    stackIcon: Sprite | null = null;

    setStackIcon(icon: SpriteFrame) {
        this.stackIcon!.spriteFrame = icon;
    }

    showStackIcon() {
        this.stackIcon!.node.active = true
    }

    hideStackIcon() {
        this.stackIcon!.node.active = false
    }

    unuse() {
        if (this.cardEffectMask) {
            this.cardEffectMask!.active = false;
        }
    }

    _blinkingTween: Tween<Node> | null = null

    setStackEffect(stackEffect: StackEffectInterface) {
        this.stackEffect = stackEffect;
        const stackEffectVis = stackEffect.visualRepesentation
        const nodeSprite = this.node.getComponent(Sprite)!;
        if (stackEffect instanceof PlayLootCardStackEffect) {
            nodeSprite.spriteFrame = stackEffect.lootToPlay!.getComponent(Card)!.frontSprite
            this.hideExtraInfo()
        } else if (stackEffect instanceof ActivateItem) {
            nodeSprite.spriteFrame = stackEffect.itemToActivate!.getComponent(Card)!.frontSprite
            this.hideExtraInfo()
            if (stackEffect.effectToDo != null) {
                this.addSelectedEffectHighlight(stackEffect.effectToDo)
            }
        } else if (stackEffect instanceof ActivatePassiveEffect) {
            nodeSprite.spriteFrame = stackEffect.cardWithEffect.getComponent(Card)!.frontSprite
            this.hideExtraInfo()
            if (stackEffect.effectToDo != null) {
                this.addSelectedEffectHighlight(stackEffect.effectToDo)
            }
        } else {
            this.showExtraInfo()
            nodeSprite.spriteFrame = stackEffectVis.baseSprite;
            this.nameLable!.string = stackEffect.name + stackEffect.entityId
            if (stackEffectVis.flavorText != "") {
                this.flavorTextLable!.string = stackEffect._lable;
            }
            if (stackEffectVis.extraSprite != null) {
                this.imageArea!.getComponent(Sprite)!.spriteFrame = stackEffectVis.extraSprite
            }
        }

    }

    addSelectedEffectHighlight(effect: Effect) {
        const originalParent = effect.node;
        const originalY = effect.effectPosition.y;

        const originalParentTrans = originalParent.getComponent(UITransform)!;
        const parentHeight = originalParentTrans.height;

        const preview = this.node

        const previewTrans = preview.getComponent(UITransform)!;
        const yPositionScale = previewTrans.height / parentHeight;

        const heightScale = previewTrans.height / parentHeight;
        const widthScale = previewTrans.width / originalParentTrans.width;

        const cardWithMaskTrans = this.cardEffectMask!.getComponent(UITransform)!;
        //cardNode.addChild(instantiate(effect), 1, name);
        // const newEffect = cardNode.getChildByName(name);
        //   newEffect.getComponent(Effect)._effectCard = originalParent;
        //this.effectChildren.push(newEffect);

        cardWithMaskTrans.width = effect.effectPosition.width * widthScale;

        cardWithMaskTrans.height = effect.effectPosition.height * heightScale;

        this.cardEffectMask!.getComponentInChildren(Widget)!.updateAlignment();

        const newY = originalY * yPositionScale;

        this.cardEffectMask!.setPosition(0, newY);
        this.cardEffectMask!.active = true

        // serverClientWrapper._sc.send(Signal.ADD_EFFECT_TO_PREV, { height: this.cardEffectMask.height, width: this.cardEffectMask.width, newY: newY })
    }

    addEffectFromServer(height: number, width: number, yPos: number) {
        const cardWithMaskTrans = this.cardEffectMask!.getComponent(UITransform)!;
        cardWithMaskTrans.width = width
        cardWithMaskTrans.height = height;
        this.cardEffectMask!.setPosition(0, yPos)
        this.cardEffectMask!.active = true
    }

    updateInfo(text: string, sendToServer: boolean) {
        this.flavorTextLable!.string = text;
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_STACK_VIS, { stackId: this.stackEffect!.entityId, text: text })
        }
    }

    hideExtraInfo() {
        this.flavorTextLable!.node.active = false;
        this.nameLable!.node.active = false;
        this.imageArea!.active = false;
        this.isShowExtraInfo = false;
    }

    showExtraInfo() {
        this.flavorTextLable!.node.active = true;
        // this.nameLable.node.active = true;
        this.imageArea!.active = true;
        this.isShowExtraInfo = true;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // this.node.on(Node.EventType.TOUCH_END, () => {
        //     this.showTargets()
        // }, this)


    }

    start() {

    }



}
