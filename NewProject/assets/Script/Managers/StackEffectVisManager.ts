import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { BLINKING_SPEED, GAME_EVENTS } from "../Constants";
import Stack from "../Entites/Stack";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { StackEffectVisualRepresentation } from "../StackEffects/StackEffectVisualRepresentation/Stack Vis Interface";
import StackEffectPreview from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import CardPreviewManager from "./CardPreviewManager";
import StackEffectPreviewPool from "../Entites/Stack Effect Preview Pool";
import { whevent } from "../../ServerClient/whevent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StackEffectVisManager extends cc.Component {

    @property(cc.Node)
    contentNode: cc.Node = null

    @property(cc.SpriteFrame)
    lootBaseSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    monsterBaseSprite: cc.SpriteFrame = null;

    @property([cc.SpriteFrame])
    combatDamageNumbers: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    activeItemTag: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bossFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    centSign: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    CharacterFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    costItemTag: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    curseFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    cursedEnemyFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    cursedItemFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    damageIcon: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    diceIcon: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    monsterFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    eternalItemTag: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    nonMonsterFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    heartIcon: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    holyEnemyFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    lootFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    megaBossFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    passiveTreasureFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    passiveDiceRollTreasure: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    extraSoulCardFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    treasureFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    trinketFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    combatDamageToBe: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    monsterDeathSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    monsterRewardSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    startTurnLootSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    happeningBaseSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    diceRollBaseSprite: cc.SpriteFrame = null;

    @property(cc.Node)
    previewHolder: cc.Node = null;

    previewHolderLayout: cc.Node = null

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null

    previewPool: StackEffectPreviewPool = null

    currentPreviews: StackEffectPreview[] = [];

    @property(cc.Prefab)
    basicStackEffectPreviewPrefab: cc.Prefab = null

    @property(cc.Prefab)
    playerActionPreviewPrefab: cc.Prefab = null

    @property(cc.Prefab)
    monsterActionPreviewPrefab: cc.Prefab = null

    @property(cc.Prefab)
    bossActionPreviewPrefab: cc.Prefab = null

    @property(cc.Prefab)
    megaBossActionPreviewPrefab: cc.Prefab = null

    @property(cc.Node)
    showStackButton: cc.Node = null;

    @property([cc.SpriteFrame])
    stackIcons: cc.SpriteFrame[] = []

    isOpen: boolean = false;

    static $: StackEffectVisManager = null;

    // LIFE-CYCLE CALLBACKS:



    updateAvailablePreviews() {
        const i = cc.macro.MIN_ZINDEX
        let y = 0;

        for (const stackEffect of Stack._currentStack) {
            const preview = this.getPreviewByStackId(stackEffect.entityId)
            if (preview != null) {
                if (preview.node.parent == null) {
                    preview.node.parent = this.previewHolderLayout
                }
                if (preview.node.active == false) {
                    preview.node.active = true
                }
                // preview = this.addPreview(stackEffect)
                preview.node.zIndex = i + y
                y++
            }
        }
    }

    updatePreviewByStackId(entityId: number, text: string) {
        const preview = this.currentPreviews.find(prev => prev.stackEffect.entityId == entityId)
        if (preview) {
            preview.updateInfo(text, true)
        }

    }

    addPreview(stackEffect: StackEffectInterface, sendToServer: boolean) {
        let preview = this.getPreviewByStackId(stackEffect.entityId)
        if (preview == null) {
            const newPreview = this.previewPool.getByStackEffect(stackEffect)
            newPreview.getComponent(StackEffectPreview).setStackEffect(stackEffect)
            this.currentPreviews.push(newPreview.getComponent(StackEffectPreview))
            preview = newPreview.getComponent(StackEffectPreview)
            preview.hideStackIcon()

        }
        preview.node.x = 0
        preview.node.parent = this.previewHolderLayout;
        preview.node.active = true
        preview.node.y = 0
        if (sendToServer) {
            ServerClient.$.send(Signal.ADD_SE_VIS_PREV, { stackEffect: stackEffect.convertToServerStackEffect() })
        }
        this.updateAvailablePreviews()

        return preview

    }

    removePreview(stackEffectId: number, sendToServer: boolean) {
        const preview = this.getPreviewByStackId(stackEffectId)
        if (preview != null) {
            this.currentPreviews.splice(this.currentPreviews.indexOf(preview), 1)
            preview.node.setParent(null);
            this.previewPool.putByStackEffectPreview(preview)
            this.updateAvailablePreviews()
        } else {
            cc.error(`remove preview failed, no preview with stack effect id ${stackEffectId} found`)
            cc.log(this.currentPreviews)
        }
        if (this.currentPreviews.length == 0) { this.hidePreviews() }
        if (sendToServer) {
            ServerClient.$.send(Signal.REMOVE_SE_VIS_PREV, { stackEffectId: stackEffectId })
        }
    }

    setPreviews(stackEffects: StackEffectInterface[], sendToServer: boolean) {
        this.clearPreviews(sendToServer)
        for (const stackEffect of stackEffects) {
            this.addPreview(stackEffect, sendToServer)
        }
    }

    clearPreviews(sendToServer: boolean) {
        let currentPreviews: StackEffectPreview[] = []
        currentPreviews = currentPreviews.concat(this.currentPreviews)
        for (let i = 0; i < currentPreviews.length; i++) {
            const preview = currentPreviews[i];

            //}
            //  for (const preview of this.currentPreviews) {
            cc.log(`removing preview of ${preview.stackEffect._lable}`)
            this.removePreview(preview.stackEffect.entityId, false)
        }
        this.currentPreviews = []
        if (sendToServer) {
            ServerClient.$.send(Signal.CLEAR_SE_VIS)
        }
    }



    makeRequiredForDataCollector(stackPreview: StackEffectPreview, dataCollector: DataCollector) {
        stackPreview.node.runAction(
            cc
                .sequence(cc.fadeTo(BLINKING_SPEED, 50), cc.fadeTo(BLINKING_SPEED, 255))
                .repeatForever()
        );
        stackPreview.node.once(cc.Node.EventType.TOUCH_START, () => {
            dataCollector.cardChosen = stackPreview.node;
            dataCollector.setIsEffectChosen(true);
            this.hidePreviews();
        }, this)
    }

    makeNotRequiredForDataCollector(stackPreview: StackEffectPreview) {
        stackPreview.node.stopAllActions();
        stackPreview.node.runAction(cc.fadeTo(BLINKING_SPEED, 255));
        stackPreview.node.off(cc.Node.EventType.TOUCH_START)
    }

    getPreviewByStackId(stackId: number) {

        for (const preview of this.currentPreviews) {

            if (preview.stackEffect.entityId == stackId) { return preview }
        }

    }

    hidePreviews() {
        this.isOpen = false;
        this.previewHolderLayout.active = false;
        this.showStackButton.off(cc.Node.EventType.TOUCH_START)
        this.showStackButton.getComponentInChildren(cc.Label).string = "Stack+"
        this.showStackButton.on(cc.Node.EventType.TOUCH_START, this.showPreviews.bind(this))
        this.scrollView.node.active = false
    }

    showPreviews() {
        if (CardPreviewManager.isOpen) {
            CardPreviewManager.hidePreviewManager()
        }
        this.isOpen = true
        this.scrollView.content.active = false;
        this.scrollView.content = this.contentNode
        this.scrollView.content.active = true;
        this.previewHolderLayout.active = true
        this.showStackButton.off(cc.Node.EventType.TOUCH_START)
        this.showStackButton.getComponentInChildren(cc.Label).string = "Stack-"
        this.showStackButton.on(cc.Node.EventType.TOUCH_START, this.hidePreviews.bind(this))
        this.scrollView.node.active = true
        this.scrollView.node.zIndex = 1
        if (this.currentPreviews.length > 0) {
            const previewWidth = this.currentPreviews[0].node.width
            const screenWidth = cc.find("Canvas").width

            if ((previewWidth + 10) * this.currentPreviews.length > screenWidth) {
                this.contentNode.width = (previewWidth + 10) * this.currentPreviews.length
            } else { this.contentNode.width = screenWidth; }
        }
        const widget = this.contentNode.getComponent(cc.Widget)
        widget.top = 0;
        widget.left = 0;
        widget.updateAlignment()
        whevent.emit(GAME_EVENTS.PREVIEW_MANAGER_OPEN)
    }

    onLoad() {
        StackEffectVisManager.$ = this;
        this.previewHolderLayout = this.previewHolder
        this.showStackButton.getComponentInChildren(cc.Label).string = "Stack+"
        this.showStackButton.on(cc.Node.EventType.TOUCH_START, this.showPreviews.bind(this))
        this.previewPool = new StackEffectPreviewPool()
        const prefabArr = [this.basicStackEffectPreviewPrefab, this.playerActionPreviewPrefab, this.bossActionPreviewPrefab, this.megaBossActionPreviewPrefab, this.monsterActionPreviewPrefab]
        prefabArr.forEach(prefab => {
            for (let i = 0; i < 15; i++) {
                const preview = cc.instantiate(prefab);
                preview.name = "preview" + i;
                switch (prefab.name) {
                    case this.basicStackEffectPreviewPrefab.name:

                        this.previewPool.addBasic(preview)
                        break;
                    case this.playerActionPreviewPrefab.name:
                        this.previewPool.addPlayer(preview)
                        break;
                    case this.bossActionPreviewPrefab.name:
                        this.previewPool.addBoss(preview)
                        break;
                    case this.megaBossActionPreviewPrefab.name:
                        this.previewPool.addMegaBoss(preview)
                        break;
                    case this.monsterActionPreviewPrefab.name:
                        this.previewPool.addMonster(preview)
                        break;
                    default:
                        break;
                }

            }
        });

    }

    start() {

    }

    // update (dt) {}
}
