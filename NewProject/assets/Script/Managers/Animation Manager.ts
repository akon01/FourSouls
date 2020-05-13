import ParticleManager from "./ParticleManager";


const { ccclass, property } = cc._decorator;


export enum ANIM_COLORS {
    BLUE, RED, YELLOW,
    WHITE
}

@ccclass
export default class AnimationManager extends cc.Component {

    static $: AnimationManager = null

    @property(cc.Prefab)
    animationNode: cc.Prefab = null

    static addAnimationNode(card: cc.Node) {
        const animNode = cc.instantiate(this.$.animationNode)
        if (card.getChildByName("Mask Node").getChildByName(animNode.name) == null) {
            card.getChildByName("Mask Node").addChild(animNode)
            const widget = animNode.getComponent(cc.Widget)
            widget.target = card
            widget.isAbsoluteBottom = false
            widget.isAbsoluteTop = false
            widget.isAbsoluteLeft = false
            widget.isAbsoluteRight = true
            widget.right = -0.05
            widget.left = -0.05
            widget.top = -0.05
            widget.bottom = -0.05
            widget.updateAlignment();
            animNode.setPosition(0, 0)
            animNode.active = false;
        }
    }


    showAnimation(card: cc.Node, color: ANIM_COLORS) {
        if (!card) { return }
        const animation = card.getComponentInChildren(cc.Animation)
        if (animation) {
            animation.node.active = true
            let chosenColor
            switch (color) {
                case ANIM_COLORS.BLUE:
                    chosenColor = cc.Color.BLUE
                    break;
                case ANIM_COLORS.RED:
                    chosenColor = cc.Color.RED
                    break;
                case ANIM_COLORS.YELLOW:
                    chosenColor = cc.Color.YELLOW
                    break;
                case ANIM_COLORS.WHITE:
                    chosenColor = cc.Color.WHITE
                    break;
                default:
                    break;
            }
            animation.node.color = chosenColor
            const state = animation.play()
        } else {
            throw new Error(`No Animation Component on card ${card.name}`)
        }
    }

    endAnimation(card: cc.Node) {
        if (!card) { return }

        const animation = card.getComponentInChildren(cc.Animation)
        if (animation) {
            animation.node.active = false
            animation.stop()
        }
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        AnimationManager.$ = this;
    }

    start() {

    }

    // update (dt) {}
}
