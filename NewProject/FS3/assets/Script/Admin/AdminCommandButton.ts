import { Button, Component, Enum, Label, Node, _decorator } from 'cc';
import { ADMIN_COMMANDS } from "../Constants";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { CommandInputConcrete as CCommandInput } from "./CommandInputConcrete";

const { ccclass, property } = _decorator;


@ccclass('AdminCommandButton')
export class AdminCommandButton extends Component {
    @property(Label)
    label: Label | null = null;

    @property(Button)
    button: Button | null = null;

    @property({ type: Enum(ADMIN_COMMANDS) })
    adminCommand: ADMIN_COMMANDS = ADMIN_COMMANDS.CARD

    @property(CCommandInput)
    input: CCommandInput | null = null

    @property
    text = "hello";

    @property
    _inputNode: Node | null = null


    getCommandNameByEnumNum(enumNum: number) {
        switch (enumNum) {
            case 0:
                return "Log"
            case 1:
                return "Gain Coins"
            case 2:
                return "Heal"
            case 3:
                return "Gain Max HP"
            case 4:
                return "Gain Damage"
            case 5:
                return "Set All Rolls To"
            case 6:
                return "Get A Soul Card"
            case 7:
                return "Charge All Items"
            case 8:
                return "Change Roll Bonus"
            case 9:
                return "Add A Card To Table"
            case 10:
                return "Run Personal Function"
            case 11:
                return "Print Stack Trace"
            case 12:
                return "Print Current Stack"

            default:
                return ""
                break;
        }
    }

    async doCommand() {
        let extra = null
        if (this.input != null) {
            extra = this.input.getCommandInput()
        }
        await WrapperProvider.adminConsoleWrapper.out.doCommand(this.adminCommand, extra)
    }

    setInput(inputNode: Node) {
        this.input = inputNode.getComponent(CCommandInput)
        this._inputNode = inputNode
        this.node.children[0].addChild(inputNode)

    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //  this._inputNode = this.node.getChildByName(`input`)
        this.button!.node.getComponentInChildren(Label)!.string = this.getCommandNameByEnumNum(this.adminCommand)
    }

    start() {

    }

    // update (dt) {}
}
