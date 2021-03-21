import { Animation, Color, Component, instantiate, Node, Prefab, Sprite, Widget, _decorator } from 'cc';
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;

export enum ANIM_COLORS {
    BLUE, RED, YELLOW,
    WHITE
}

@ccclass('AnimationManager')
export class AnimationManager extends Component {

    @property(Prefab)
    animationNode: Prefab | null = null


    addAnimationNode(card: Node) {
        const animNode = instantiate(WrapperProvider.animationManagerWrapper.out.animationNode!)
        const cardMaskNode = card.getChildByName("Mask Node");
        if (!cardMaskNode) { debugger; throw new Error("No Card Mask Node"); }

        if (cardMaskNode.getChildByName(animNode.name) == null) {
            cardMaskNode.addChild(animNode)
            const widget = animNode.getComponent(Widget)!
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


    showAnimation(card: Node, color: ANIM_COLORS) {
        if (!card) { return }
        const animation = card.getComponentInChildren(Animation)
        if (animation) {
            animation.node.active = true
            let chosenColor
            switch (color) {
                case ANIM_COLORS.BLUE:
                    chosenColor = Color.BLUE
                    break;
                case ANIM_COLORS.RED:
                    chosenColor = Color.RED
                    break;
                case ANIM_COLORS.YELLOW:
                    chosenColor = Color.YELLOW
                    break;
                case ANIM_COLORS.WHITE:
                    chosenColor = Color.WHITE
                    break;
                default:
                    throw new Error("No Color Chosen");

                    break;
            }
            const colorComp = animation.node.getComponent(Sprite)!.color;
            //  debugger
            animation.node.getComponent(Sprite)!.color = chosenColor
            // animation.node._uiProps.opacity = 255
            //colorComp.set(chosenColor)
            const state = animation.play()
        } else {
            throw new Error(`No Animation Component on card ${card.name}`)
        }
    }

    endAnimation(card: Node) {
        if (!card) { return }

        const animation = card.getComponentInChildren(Animation)
        if (animation) {
            animation.node.active = false
            animation.stop()
        }
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }

    start() {

    }

    // update (dt) {}
}
