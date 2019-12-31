import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { BLINKING_SPEED } from "../Constants";
import Stack from "../Entites/Stack";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { StackEffectVisualRepresentation } from "../StackEffects/StackEffectVisualRepresentation/Stack Vis Interface";
import StackEffectPreview from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";

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

    previewPool: cc.NodePool = null

    currentPreviews: StackEffectPreview[] = [];

    @property(cc.Prefab)
    stackEffectPreviewPrefab: cc.Prefab = null

    @property(cc.Node)
    showStackButton: cc.Node = null;

    static $: StackEffectVisManager = null;

    // LIFE-CYCLE CALLBACKS:

    updateAvailablePreviews() {
        const i = cc.macro.MIN_ZINDEX
        let y = 0;

        for (const stackEffect of Stack._currentStack) {
            const preview = this.getPreviewByStackId(stackEffect.entityId)
            if (preview != null) {
                // preview = this.addPreview(stackEffect)
                preview.node.zIndex = i + y
                y++
            }
        }
    }

    addPreview(stackEffect: StackEffectInterface) {
        // cc.error(`add preview of ${stackEffect.constructor.name} ${stackEffect.entityId}`)
        let preview = this.getPreviewByStackId(stackEffect.entityId)
        if (preview == null) {
            const newPreview = this.previewPool.get()
            newPreview.getComponent(StackEffectPreview).setStackEffect(stackEffect)
            this.currentPreviews.push(newPreview.getComponent(StackEffectPreview))
            preview = newPreview.getComponent(StackEffectPreview)
        } else {
            return preview
        }
        preview.node.setParent(this.previewHolderLayout);

        this.updateAvailablePreviews()
        return preview

    }

    setPreviews(stackEffects: StackEffectInterface[]) {
        this.clearPreviews()
        for (const stackEffect of stackEffects) {
            this.addPreview(stackEffect)
        }
    }

    clearPreviews() {

        for (const preview of this.currentPreviews) {
            this.removePreview(preview.stackEffect)
        }
        this.currentPreviews = []
    }

    removePreview(stackEffect: StackEffectInterface) {
        //  cc.error(`remove preview of ${stackEffect.constructor.name}`)
        const preview = this.currentPreviews.find(preview => preview.stackEffect.entityId == stackEffect.entityId)
        if (preview != null) {
            this.currentPreviews.splice(this.currentPreviews.indexOf(preview), 1)
            this.previewPool.put(preview.node)
            this.updateAvailablePreviews()
        }
        if (this.currentPreviews.length == 0) { this.hidePreviews() }
        // cc.error(`current previews`)
        // cc.log(this.currentPreviews)
        // cc.log(`current stack`)
        // cc.log(Stack._currentStack)
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

            if (preview.stackEffect.entityId == stackId) { return preview }
        }

    }

    hidePreviews() {
        cc.log(`hide previews`)
        this.previewHolderLayout.active = false;
        this.showStackButton.off(cc.Node.EventType.TOUCH_START)
        this.showStackButton.getComponentInChildren(cc.Label).string = "Stack+"
        this.showStackButton.on(cc.Node.EventType.TOUCH_START, this.showPreviews.bind(this))
        this.scrollView.node.active = false
    }

    showPreviews() {
        this.scrollView.content.active = false;
        this.scrollView.content = this.contentNode
        this.scrollView.content.active = true;
        this.previewHolderLayout.active = true
        this.showStackButton.off(cc.Node.EventType.TOUCH_START)
        this.showStackButton.getComponentInChildren(cc.Label).string = "Stack-"
        this.showStackButton.on(cc.Node.EventType.TOUCH_START, this.hidePreviews.bind(this))
        this.scrollView.node.active = true
        this.scrollView.node.zIndex = 1
        const t = cc.find('Canvas')
        cc.log(t.children.map(item => ({ name: item.name, zIndex: item.zIndex })))
    }

    onLoad() {
        StackEffectVisManager.$ = this;
        this.previewHolderLayout = this.previewHolder
        this.showStackButton.getComponentInChildren(cc.Label).string = "Stack+"
        this.showStackButton.on(cc.Node.EventType.TOUCH_START, this.showPreviews.bind(this))
        this.previewPool = new cc.NodePool()
        for (let i = 0; i < 50; i++) {
            const preview = cc.instantiate(this.stackEffectPreviewPrefab);
            preview.name = "preview" + i;
            this.previewPool.put(preview)
        }

    }

    start() {

    }

    // update (dt) {}
}
