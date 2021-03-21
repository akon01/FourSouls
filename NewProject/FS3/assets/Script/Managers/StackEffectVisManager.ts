import { Component, error, instantiate, Label, log, math, Node, Prefab, ScrollView, SpriteFrame, tween, UITransform, Widget, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";

import { whevent } from "../../ServerClient/whevent";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { BLINKING_SPEED, GAME_EVENTS } from "../Constants";
import { StackEffectPreviewPool } from "../Entites/StackEffectPreviewPool";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { StackEffectPreview } from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;


@ccclass('StackEffectVisManager')
export class StackEffectVisManager extends Component {
    @property(Node)
    contentNode: Node | null = null

    @property(SpriteFrame)
    lootBaseSprite: SpriteFrame | null = null;

    @property(SpriteFrame)
    monsterBaseSprite: SpriteFrame | null = null;

    @property([SpriteFrame])
    combatDamageNumbers: SpriteFrame[] = [];

    @property(SpriteFrame)
    activeItemTag: SpriteFrame | null = null;

    @property(SpriteFrame)
    bossFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    centSign: SpriteFrame | null = null;

    @property(SpriteFrame)
    CharacterFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    costItemTag: SpriteFrame | null = null;

    @property(SpriteFrame)
    curseFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    cursedEnemyFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    cursedItemFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    damageIcon: SpriteFrame | null = null;

    @property(SpriteFrame)
    diceIcon: SpriteFrame | null = null;

    @property(SpriteFrame)
    monsterFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    eternalItemTag: SpriteFrame | null = null;

    @property(SpriteFrame)
    nonMonsterFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    heartIcon: SpriteFrame | null = null;

    @property(SpriteFrame)
    holyEnemyFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    lootFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    megaBossFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    passiveTreasureFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    passiveDiceRollTreasure: SpriteFrame | null = null;

    @property(SpriteFrame)
    extraSoulCardFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    treasureFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    trinketFrame: SpriteFrame | null = null;

    @property(SpriteFrame)
    combatDamageToBe: SpriteFrame | null = null;

    @property(SpriteFrame)
    monsterDeathSprite: SpriteFrame | null = null;

    @property(SpriteFrame)
    monsterRewardSprite: SpriteFrame | null = null;

    @property(SpriteFrame)
    startTurnLootSprite: SpriteFrame | null = null;

    @property(SpriteFrame)
    happeningBaseSprite: SpriteFrame | null = null;

    @property(SpriteFrame)
    diceRollBaseSprite: SpriteFrame | null = null;

    @property(Node)
    previewHolder: Node | null = null;

    previewHolderLayout: Node | null = null

    @property(ScrollView)
    scrollView: ScrollView | null = null

    previewPool: StackEffectPreviewPool | null = null

    currentPreviews: StackEffectPreview[] = [];

    @property(Prefab)
    basicStackEffectPreviewPrefab: Prefab | null = null

    @property(Prefab)
    playerActionPreviewPrefab: Prefab | null = null

    @property(Prefab)
    monsterActionPreviewPrefab: Prefab | null = null

    @property(Prefab)
    bossActionPreviewPrefab: Prefab | null = null

    @property(Prefab)
    megaBossActionPreviewPrefab: Prefab | null = null

    @property(Node)
    showStackButton: Node | null = null;

    @property([SpriteFrame])
    stackIcons: SpriteFrame[] = []

    isOpen: boolean = false;





    // LIFE-CYCLE CALLBACKS:



    updateAvailablePreviews() {
        const i = 0
        let y = 0;

        for (const stackEffect of WrapperProvider.stackWrapper.out._currentStack) {
            const preview = this.getPreviewByStackId(stackEffect.entityId)
            if (preview != null) {
                if (preview.node.parent == null) {
                    preview.node.parent = this.previewHolderLayout
                }
                if (preview.node.active == false) {
                    preview.node.active = true
                }
                // preview = this.addPreview(stackEffect)
                const trans = preview.node.getComponent(UITransform)!
                // trans.priority = i + y
                preview.node.setSiblingIndex(i + y)
                ///preview.node.zIndex = i + y
                y++
            }
        }
    }

    updatePreviewByStackId(entityId: number, text: string) {
        const preview = this.currentPreviews.find(prev => prev.stackEffect!.entityId == entityId)
        if (preview) {
            preview.updateInfo(text, true)
        }

    }

    addPreview(stackEffect: StackEffectInterface, sendToServer: boolean) {
        let preview = this.getPreviewByStackId(stackEffect.entityId)
        if (preview == null) {
            const newPreview = this.previewPool!.getByStackEffect(stackEffect)!
            newPreview.getComponent(StackEffectPreview)!.setStackEffect(stackEffect)
            this.currentPreviews.push(newPreview.getComponent(StackEffectPreview)!)
            preview = newPreview.getComponent(StackEffectPreview)!
            preview.hideStackIcon()

        }
        preview.node.setPosition(math.v3(0, 0))
        preview.node.parent = this.previewHolderLayout;
        preview.node.active = true
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.ADD_SE_VIS_PREV, { stackEffect: stackEffect.convertToServerStackEffect() })
        }
        this.updateAvailablePreviews()

        return preview

    }

    removePreview(stackEffectId: number, sendToServer: boolean) {
        const preview = this.getPreviewByStackId(stackEffectId)
        if (preview != null) {
            this.currentPreviews.splice(this.currentPreviews.indexOf(preview), 1)
            preview.node.setParent(null);
            this.previewPool!.putByStackEffectPreview(preview)
            this.updateAvailablePreviews()
        } else {
            error(`remove preview failed, no preview with stack effect id ${stackEffectId} found`)
            log(this.currentPreviews)
        }
        if (this.currentPreviews.length == 0) { this.hidePreviews() }
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.REMOVE_SE_VIS_PREV, { stackEffectId: stackEffectId })
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
            log(`removing preview of ${preview.stackEffect!._lable}`)
            this.removePreview(preview.stackEffect!.entityId, false)
        }
        this.currentPreviews = []
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.CLEAR_SE_VIS)
        }
    }



    makeRequiredForDataCollector(stackPreview: StackEffectPreview, dataCollector: DataCollector) {
        ///TODO-NEW - cant figure out opacity blink.
        stackPreview._blinkingTween = tween(stackPreview.node).
            sequence(tween(stackPreview.node).to(BLINKING_SPEED, { scale: math.v3(0.5, 0.5) }), tween(stackPreview.node).to(BLINKING_SPEED, { scale: math.v3(1, 1) }))
            .repeatForever().start()
        // stackPreview.node.runAction(
        //     cc
        //         .sequence(fadeTo(BLINKING_SPEED, 50), fadeTo(BLINKING_SPEED, 255))
        //         .repeatForever()
        // );
        stackPreview.node.once(Node.EventType.TOUCH_START, () => {
            dataCollector.cardChosen = stackPreview.node;
            dataCollector.setIsEffectChosen(true);
            this.hidePreviews();
        }, this)
    }

    makeNotRequiredForDataCollector(stackPreview: StackEffectPreview) {
        stackPreview._blinkingTween?.stop()
        tween(stackPreview.node).to(BLINKING_SPEED, { scale: math.v3(1, 1) }).start()
        stackPreview.node.off(Node.EventType.TOUCH_START)
    }

    getPreviewByStackId(stackId: number) {

        for (const preview of this.currentPreviews) {

            if (preview.stackEffect!.entityId == stackId) { return preview }
        }

    }

    hidePreviews() {
        this.isOpen = false;
        this.previewHolderLayout!.active = false;
        this.showStackButton!.off(Node.EventType.TOUCH_START)
        this.showStackButton!.getComponentInChildren(Label)!.string = "Stack+"
        this.showStackButton!.on(Node.EventType.TOUCH_START, this.showPreviews.bind(this))
        this.scrollView!.node.active = false
    }

    showPreviews() {
        if (WrapperProvider.cardPreviewManagerWrapper.out.isOpen) {
            WrapperProvider.cardPreviewManagerWrapper.out.hidePreviewManager()
        }
        this.isOpen = true
        this.scrollView!.content!.active = false;
        this.scrollView!.content! = this.contentNode!
        this.scrollView!.content!.active = true;
        this.previewHolderLayout!.active = true
        this.showStackButton!.off(Node.EventType.TOUCH_START)
        this.showStackButton!.getComponentInChildren(Label)!.string = "Stack-"
        this.showStackButton!.on(Node.EventType.TOUCH_START, this.hidePreviews.bind(this))
        this.scrollView!.node.active = true
        const scrollViewTrans = this.scrollView!.node.getComponent(UITransform)!;
        scrollViewTrans.priority = 1
        // scrollViewTrans.node.setSiblingIndex(1)
        if (this.currentPreviews.length > 0) {
            const previewWidth = this.currentPreviews[0].node.getComponent(UITransform)!.width
            const screenWidth = WrapperProvider.CanvasNode!.getComponent(UITransform)!.width

            const contentNodeTrans = (this.contentNode!.getComponent(UITransform)!);
            if ((previewWidth + 10) * this.currentPreviews.length > screenWidth) {
                contentNodeTrans.width = (previewWidth + 10) * this.currentPreviews.length
            } else {
                contentNodeTrans.width = screenWidth;
            }
        }
        const widget = this.contentNode!.getComponent(Widget)!
        widget.top = 0;
        widget.left = 0;
        widget.updateAlignment()
        whevent.emit(GAME_EVENTS.PREVIEW_MANAGER_OPEN)
    }

    onLoad() {
        WrapperProvider.stackEffectVisManagerWrapper.out = this;
        this.previewHolderLayout = this.previewHolder
        this.showStackButton!.getComponentInChildren(Label)!.string = "Stack+"
        this.showStackButton!.on(Node.EventType.TOUCH_START, this.showPreviews.bind(this))
        this.previewPool = new StackEffectPreviewPool()
        const prefabArr = [this.basicStackEffectPreviewPrefab, this.playerActionPreviewPrefab, this.bossActionPreviewPrefab, this.megaBossActionPreviewPrefab, this.monsterActionPreviewPrefab]
        prefabArr.forEach(prefab => {
            for (let i = 0; i < 15; i++) {
                const preview = instantiate(prefab!);
                preview.name = "preview" + i;
                switch (prefab!.data.name) {
                    case this.basicStackEffectPreviewPrefab!.data.name:

                        this.previewPool!.addBasic(preview)
                        break;
                    case this.playerActionPreviewPrefab!.data.name:
                        this.previewPool!.addPlayer(preview)
                        break;
                    case this.bossActionPreviewPrefab!.data.name:
                        this.previewPool!.addBoss(preview)
                        break;
                    case this.megaBossActionPreviewPrefab!.data.name:
                        this.previewPool!.addMegaBoss(preview)
                        break;
                    case this.monsterActionPreviewPrefab!.data.name:
                        this.previewPool!.addMonster(preview)
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
