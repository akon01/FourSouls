

const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimationManager extends cc.Component {

    static $: AnimationManager = null

    @property(cc.Prefab)
    animationNode: cc.Prefab = null

    static addAnimationNode(card: cc.Node) {
        const animNode = cc.instantiate(this.$.animationNode)
        if (card.getChildByName("Mask Node").getChildByName(animNode.name) == null) {
            card.getChildByName("Mask Node").addChild(animNode)
            animNode.setPosition(0, 0)
            const widget = animNode.getComponent(cc.Widget)
            widget.target = card
            widget.isAbsoluteBottom = false
            widget.isAbsoluteTop = false
            widget.isAbsoluteLeft = false
            widget.isAbsoluteRight = true
            widget.right = -0.02
            widget.left = -0.02
            widget.top = -0.02
            widget.bottom = -0.02
            animNode.active = false;
        }
    }


    showAnimation(card: cc.Node, colorNumber: number) {
        const animation = card.getComponentInChildren(cc.Animation)
        cc.log(card)
        if (animation) {
            animation.node.active = true
            // animation.node.getComponent(cc.Widget).enabled = true
            // animation.node.getComponent(cc.Widget).isAbsoluteBottom = false
            // animation.node.getComponent(cc.Widget).isAbsoluteTop = false
            // animation.node.getComponent(cc.Widget).isAbsoluteLeft = false
            // animation.node.getComponent(cc.Widget).isAbsoluteRight = false
            let color
            switch (colorNumber) {
                case 0:
                    color = cc.Color.BLUE
                    break;
                case 1:
                    color = cc.Color.RED
                    break;
                case 2:
                    color = cc.Color.YELLOW
                    break;
                default:
                    break;
            }
            animation.node.color = color
            const state = animation.play()

        }
    }

    endAnimation(card: cc.Node) {
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
