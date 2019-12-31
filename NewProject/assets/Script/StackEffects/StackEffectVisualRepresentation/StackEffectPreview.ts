import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import ActivateItem from "../Activate Item";
import ActivatePassiveEffect from "../Activate Passive Effect";
import PlayLootCardStackEffect from "../Play Loot Card";
import StackEffectInterface from "../StackEffectInterface";
import { ServerStackVisualisation } from "./Server Stack Vis";
import ParticleManager from "../../Managers/ParticleManager";
import { PARTICLE_TYPES } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StackEffectPreview extends cc.Component {

    @property(cc.Label)
    flavorTextLable: cc.Label = null;

    @property
    flavorText: string = "";

    @property(cc.Label)
    nameLable: cc.Label = null;

    @property
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

    @property
    stackEffect: StackEffectInterface = null

    @property
    isShowExtraInfo: boolean = false;

    setStackEffect(stackEffect: StackEffectInterface) {
        this.stackEffect = stackEffect;
        const stackEffectVis = stackEffect.visualRepesentation
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
            this.nameLable.string = stackEffect.constructor.name + stackEffect.entityId
            if (stackEffectVis.flavorText != "") {
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
        const stackEffectVis = this.stackEffect.visualRepesentation;
        this.node.getComponent(cc.Sprite).spriteFrame = stackEffectVis.baseSprite;
        this.nameLable.string = this.stackEffect.constructor.name + this.stackEffect.entityId
        if (stackEffectVis.flavorText != "") {
            this.flavorTextLable.string = stackEffectVis.flavorText;
        }
        if (stackEffectVis.extraSprite != null) {
            this.imageArea.getComponent(cc.Sprite).spriteFrame = stackEffectVis.extraSprite
        }
        if (sendToServer) {
            const serverEffectVis = new ServerStackVisualisation(stackEffectVis)
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

    // showTargets() {
    //     if (this.stackEffect instanceof ActivateItem || this.stackEffect instanceof PlayLootCardStackEffect) {
    //         const effectToDo = this.stackEffect.effectToDo;
    //         if (effectToDo) {
    //             cc.log(effectToDo)
    //             const effectData = effectToDo.effectData
    //             if (effectData) {
    //                 cc.log(effectData)
    //                 const targets = effectData.effectTargets
    //                 cc.log(targets)
    //                 for (const target of targets) {
    //                     if (target.effectTargetCard) {
    //                         ParticleManager.runParticleOnce(target.effectTargetCard, PARTICLE_TYPES.ACTIVATE_EFFECT)
    //                     }

    //                 }
    //             }
    //         }
    //     }
    // }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // this.node.on(cc.Node.EventType.TOUCH_END, () => {
        //     this.showTargets()
        // }, this)
    }

    start() {

    }

    update(dt) {
        if (this.stackEffect.visualRepesentation.hasBeenUpdated) {
            if (this.isShowExtraInfo) {
                const stackEffectVis = this.stackEffect.visualRepesentation
                this.node.getComponent(cc.Sprite).spriteFrame = stackEffectVis.baseSprite;
                this.nameLable.string = this.stackEffect.constructor.name + this.stackEffect.entityId
                if (stackEffectVis.flavorText != "123") {
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