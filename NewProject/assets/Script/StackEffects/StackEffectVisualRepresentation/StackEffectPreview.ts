import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import Card from "../../Entites/GameEntities/Card";
import ActivateItem from "../Activate Item";
import ActivatePassiveEffect from "../Activate Passive Effect";
import PlayLootCardStackEffect from "../Play Loot Card";
import StackEffectInterface from "../StackEffectInterface";
import { ServerStackVisualisation } from "./Server Stack Vis";
import Effect from "../../CardEffectComponents/CardEffects/Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StackEffectPreview extends cc.Component {

    @property(cc.Label)
    flavorTextLable: cc.Label = null;

    @property({ visible: false })
    flavorText: string = "";

    @property(cc.Label)
    nameLable: cc.Label = null;

    @property(cc.Node)
    cardEffectMask: cc.Node = null

    @property({ visible: false })
    nameText: string = "";

    @property(cc.Node)
    imageArea: cc.Node = null;

    @property
    imageSprite: cc.SpriteFrame = null;

    @property(cc.Sprite)
    templateBottom: cc.Sprite = null

    @property(cc.Node)
    bottomMaskNode: cc.Node = null;

    @property(cc.Sprite)
    topOriginSprite: cc.Sprite = null;

    @property({ visible: false })
    stackEffect: StackEffectInterface = null

    @property
    isShowExtraInfo: boolean = false;

    @property(cc.Sprite)
    stackIcon: cc.Sprite = null;

    setStackIcon(icon: cc.SpriteFrame) {
        this.stackIcon.spriteFrame = icon;
    }

    showStackIcon() {
        this.stackIcon.node.active = true
    }
    c
    hideStackIcon() {
        this.stackIcon.node.active = false
    }


    unuse() {
        this.cardEffectMask.active = false;
    }


    setStackEffect(stackEffect: StackEffectInterface) {
        this.stackEffect = stackEffect;
        const stackEffectVis = stackEffect.visualRepesentation
        if (stackEffect instanceof PlayLootCardStackEffect) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.lootToPlay.getComponent(Card).frontSprite
            this.hideExtraInfo()
        } else if (stackEffect instanceof ActivateItem) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.itemToActivate.getComponent(Card).frontSprite
            this.hideExtraInfo()
        } else if (stackEffect instanceof ActivatePassiveEffect) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.cardWithEffect.getComponent(Card).frontSprite
            this.hideExtraInfo()
        } else {
            this.showExtraInfo()
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffectVis.baseSprite;
            this.nameLable.string = stackEffect.name + stackEffect.entityId
            if (stackEffectVis.flavorText != "") {
                this.flavorTextLable.string = stackEffect._lable;
            }
            if (stackEffectVis.extraSprite != null) {
                this.imageArea.getComponent(cc.Sprite).spriteFrame = stackEffectVis.extraSprite
            }
        }

    }

    addSelectedEffectHighlight(effect: cc.Node) {
        const originalParent = effect.parent;
        const originalY = effect.y;

        const parentHeight = originalParent.height;
        const cardNode = this.node
        const yPositionScale = cardNode.height / parentHeight;

        const heightScale = effect.height / parentHeight;
        const widthScale = cardNode.width / originalParent.width;

        const name = effect.name + " " + cardNode.childrenCount
        //cardNode.addChild(cc.instantiate(effect), 1, name);
        // const newEffect = cardNode.getChildByName(name);
        //   newEffect.getComponent(Effect)._effectCard = originalParent;
        //this.effectChildren.push(newEffect);

        this.cardEffectMask.width = cardNode.width;

        this.cardEffectMask.height = cardNode.height * heightScale;

        const newY = originalY * yPositionScale;

        this.cardEffectMask.setPosition(0, newY);
        this.cardEffectMask.active = true
        cc.log(this.cardEffectMask)
        // ServerClient.$.send(Signal.ADD_EFFECT_TO_PREV, { height: this.cardEffectMask.height, width: this.cardEffectMask.width, newY: newY })
    }

    addEffectFromServer(height: number, width: number, yPos: number) {
        this.cardEffectMask.width = width
        this.cardEffectMask.height = height;
        this.cardEffectMask.setPosition(0, yPos)
        this.cardEffectMask.active = true
    }

    updateInfo(text: string, sendToServer: boolean) {
        this.flavorTextLable.string = text;
        if (sendToServer) {
            ServerClient.$.send(Signal.UPDATE_STACK_VIS, { stackId: this.stackEffect.entityId, text: text })
        }
    }

    hideExtraInfo() {
        this.flavorTextLable.node.active = false;
        this.nameLable.node.active = false;
        this.imageArea.active = false;
        this.isShowExtraInfo = false;
    }

    showExtraInfo() {
        this.flavorTextLable.node.active = true;
        // this.nameLable.node.active = true;
        this.imageArea.active = true;
        this.isShowExtraInfo = true;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // this.node.on(cc.Node.EventType.TOUCH_END, () => {
        //     this.showTargets()
        // }, this)
    }

    start() {

    }

    update(dt) {
        // if (this.stackEffect.visualRepesentation.hasBeenUpdated) {
        //     if (this.isShowExtraInfo) {
        //         const stackEffectVis = this.stackEffect.visualRepesentation
        //         this.node.getComponent(cc.Sprite).spriteFrame = stackEffectVis.baseSprite;
        //         this.nameLable.string = this.stackEffect.constructor.name + this.stackEffect.entityId
        //         if (stackEffectVis.flavorText != "123") {
        //             this.flavorTextLable.string = stackEffectVis.flavorText;
        //         }
        //         if (stackEffectVis.extraSprite != null) {
        //             this.imageArea.getComponent(cc.Sprite).spriteFrame = stackEffectVis.extraSprite
        //         }
        //     } else {
        //         if (this.stackEffect instanceof PlayLootCardStackEffect) {
        //             this.node.getComponent(cc.Sprite).spriteFrame = this.stackEffect.lootToPlay.getComponent(cc.Sprite).spriteFrame
        //             this.hideExtraInfo()
        //         } else if (this.stackEffect instanceof ActivateItem) {
        //             this.node.getComponent(cc.Sprite).spriteFrame = this.stackEffect.itemToActivate.getComponent(cc.Sprite).spriteFrame
        //             this.hideExtraInfo()
        //         } else if (this.stackEffect instanceof ActivatePassiveEffect) {
        //             this.node.getComponent(cc.Sprite).spriteFrame = this.stackEffect.cardWithEffect.getComponent(cc.Sprite).spriteFrame
        //         }
        //     }
        //     this.updateInfo(true)
        // }

    }

}