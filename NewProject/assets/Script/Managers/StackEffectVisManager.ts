import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { StackEffectVisualRepresentation } from "../StackEffects/StackEffectVisualRepresentation/Stack Vis Interface";
import StackEffectPreview from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import Stack from "../Entites/Stack";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { BLINKING_SPEED } from "../Constants";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StackEffectVisManager extends cc.Component {

    @property(cc.SpriteFrame)
    lootBaseSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    monsterBaseSprite: cc.SpriteFrame = null;

    @property([cc.SpriteFrame])
    combatDamageNumbers: cc.SpriteFrame[] = [];

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

    previewPool: cc.NodePool = null

    currentPreviews: StackEffectPreview[] = [];

    @property(cc.Prefab)
    stackEffectPreviewPrefab: cc.Prefab = null

    @property(cc.Node)
    showStackButton: cc.Node = null;

    static $: StackEffectVisManager = null;

    // LIFE-CYCLE CALLBACKS:

    updateAvailablePreviews() {
        let i = cc.macro.MIN_ZINDEX
        let y = 0;
        // for (const preview of this.currentPreviews) {
        //     if (Stack._currentStack.find(stackEffect => stackEffect.entityId == preview.stackEffect.entityId) == undefined) {
        //         cc.log(`preview of ${preview.stackEffect.stackEffectType} is no longer in current stack, remove it`)
        //         this.removePreview(preview.stackEffect)
        //         return;
        //     }
        // }

        for (const stackEffect of Stack._currentStack) {

            let preview = this.getPreviewByStackId(stackEffect.entityId)
            if (preview == null) {
                let newPreview = this.previewPool.get()
                newPreview.getComponent(StackEffectPreview).setStackEffect(stackEffect)
                this.currentPreviews.push(newPreview.getComponent(StackEffectPreview))
                preview = newPreview.getComponent(StackEffectPreview)
            }
            preview.node.parent = this.previewHolderLayout;
            preview.node.zIndex = i + y
            y++
        }
    }

    addPreview(stackEffect: StackEffectInterface) {

        let preview = this.previewPool.get()
        preview.getComponent(StackEffectPreview).setStackEffect(stackEffect)
        this.currentPreviews.push(preview.getComponent(StackEffectPreview))
        this.updateAvailablePreviews()

    }

    clearPreviews() {

        for (const preview of this.currentPreviews) {
            this.previewPool.put(preview.node)
        }
        this.currentPreviews = []
    }

    removePreview(stackEffect: StackEffectInterface) {

        let preview = this.currentPreviews.find(preview => preview.stackEffect.entityId == stackEffect.entityId)
        if (preview != null) {
            this.currentPreviews.splice(this.currentPreviews.indexOf(preview))
            this.previewPool.put(preview.node)
            this.updateAvailablePreviews()
        }
        if (this.currentPreviews.length == 0) this.hidePreviews()

    }

    makeRequiredForDataCollector(stackPreview: StackEffectPreview, dataCollector: DataCollector) {
        stackPreview.node.runAction(
            cc
                .sequence(cc.fadeTo(BLINKING_SPEED, 50), cc.fadeTo(BLINKING_SPEED, 255))
                .repeatForever()
        );
        stackPreview.node.once(cc.Node.EventType.TOUCH_START, () => {
            dataCollector.cardChosen = stackPreview.node;
            dataCollector.isEffectChosen = true;
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

            if (preview.stackEffect.entityId == stackId) return preview
        }
        cc.error('no preview was found')
    }

    hidePreviews() {
        this.previewHolderLayout.active = false;
        this.showStackButton.off(cc.Node.EventType.TOUCH_START)
        this.showStackButton.getComponentInChildren(cc.Label).string = 'Stack+'
        this.showStackButton.on(cc.Node.EventType.TOUCH_START, this.showPreviews.bind(this))
    }

    showPreviews() {
        this.previewHolderLayout.active = true
        this.showStackButton.off(cc.Node.EventType.TOUCH_START)
        this.showStackButton.getComponentInChildren(cc.Label).string = 'Stack-'
        this.showStackButton.on(cc.Node.EventType.TOUCH_START, this.hidePreviews.bind(this))
    }

    onLoad() {
        StackEffectVisManager.$ = this;
        this.previewHolderLayout = this.previewHolder.getChildByName('layout')
        this.showStackButton.getComponentInChildren(cc.Label).string = 'Stack+'
        this.showStackButton.on(cc.Node.EventType.TOUCH_START, this.showPreviews.bind(this))
        this.previewPool = new cc.NodePool()
        for (let i = 0; i < 50; i++) {
            let preview = cc.instantiate(this.stackEffectPreviewPrefab);
            preview.name = 'preview' + i;
            this.previewPool.put(preview)
        }

    }

    start() {

    }

    // update (dt) {}
}
