import StackEffectInterface from "../StackEffectInterface";
import PlayLootCardStackEffect from "../Play Loot Card";
import ActivateItem from "../Activate Item";
import ActivatePassiveEffect from "../Activate Passive Effect";
import ServerClient from "../../../ServerClient/ServerClient";
import Signal from "../../../Misc/Signal";
import { ServerStackVisualisation } from "./Server Stack Vis";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StackEffectPreview extends cc.Component {

    @property(cc.Label)
    flavorTextLable: cc.Label = null;

    @property
    flavorText: string = '';

    @property(cc.Label)
    nameLable: cc.Label = null;

    @property
    nameText: string = '';

    @property(cc.Node)
    imageArea: cc.Node = null;

    @property
    imageSprite: cc.SpriteFrame = null;

    @property
    stackEffect: StackEffectInterface = null

    @property
    isShowExtraInfo: boolean = false;



    setStackEffect(stackEffect: StackEffectInterface) {
        this.stackEffect = stackEffect;
        let stackEffectVis = stackEffect.visualRepesentation
        if (stackEffect instanceof PlayLootCardStackEffect) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.lootToPlay.getComponent(cc.Sprite).spriteFrame
            this.hideExtraInfo()
        } else if (stackEffect instanceof ActivateItem) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.itemToActivate.getComponent(cc.Sprite).spriteFrame
            this.hideExtraInfo()
        } else if (stackEffect instanceof ActivatePassiveEffect) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.cardWithEffect.getComponent(cc.Sprite).spriteFrame
            this.hideExtraInfo()
        } else {
            this.showExtraInfo()
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffectVis.baseSprite;
            this.nameLable.string = stackEffectVis.stackEffectType.valueOf()
            if (stackEffectVis.flavorText != '') {
                this.flavorTextLable.string = stackEffectVis.flavorText;
            }
            if (stackEffectVis.extraSprite != null) {
                this.imageArea.getComponent(cc.Sprite).spriteFrame = stackEffectVis.extraSprite
            }
        }

    }

    updateInfo(sendToServer: boolean) {
        cc.log(`update info`)
        this.stackEffect.visualRepesentation.hasBeenUpdated = false;
        let stackEffectVis = this.stackEffect.visualRepesentation;
        this.node.getComponent(cc.Sprite).spriteFrame = stackEffectVis.baseSprite;
        this.nameLable.string = stackEffectVis.stackEffectType.valueOf()
        if (stackEffectVis.flavorText != '') {
            this.flavorTextLable.string = stackEffectVis.flavorText;
        }
        if (stackEffectVis.extraSprite != null) {
            this.imageArea.getComponent(cc.Sprite).spriteFrame = stackEffectVis.extraSprite
        }
        if (sendToServer) {
            let serverEffectVis = new ServerStackVisualisation(stackEffectVis)
            ServerClient.$.send(Signal.UPDATE_STACK_VIS, { stackId: this.stackEffect.entityId, stackVis: serverEffectVis })
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
        this.nameLable.node.active = true;
        this.imageArea.active = true;
        this.isShowExtraInfo = true;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }

    start() {

    }

    update(dt) {
        if (this.stackEffect.visualRepesentation.hasBeenUpdated) {
            if (this.isShowExtraInfo) {
                let stackEffectVis = this.stackEffect.visualRepesentation
                this.node.getComponent(cc.Sprite).spriteFrame = stackEffectVis.baseSprite;
                this.nameLable.string = stackEffectVis.stackEffectType.valueOf()
                if (stackEffectVis.flavorText != '123') {
                    this.flavorTextLable.string = stackEffectVis.flavorText;
                }
                if (stackEffectVis.extraSprite != null) {
                    this.imageArea.getComponent(cc.Sprite).spriteFrame = stackEffectVis.extraSprite
                }
            } else {
                if (this.stackEffect instanceof PlayLootCardStackEffect) {
                    this.node.getComponent(cc.Sprite).spriteFrame = this.stackEffect.lootToPlay.getComponent(cc.Sprite).spriteFrame
                    this.hideExtraInfo()
                } else if (this.stackEffect instanceof ActivateItem) {
                    this.node.getComponent(cc.Sprite).spriteFrame = this.stackEffect.itemToActivate.getComponent(cc.Sprite).spriteFrame
                    this.hideExtraInfo()
                } else if (this.stackEffect instanceof ActivatePassiveEffect) {
                    this.node.getComponent(cc.Sprite).spriteFrame = this.stackEffect.cardWithEffect.getComponent(cc.Sprite).spriteFrame
                }
            }
            this.updateInfo(true)
        }

    }

}