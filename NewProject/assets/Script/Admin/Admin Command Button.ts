import { ADMIN_COMMANDS, ADMIN_COMMANDS2 } from "../Constants";
import CCommandInput from "./Command Input Concrete";
import AdminConsole from "../LableScripts/Admin Console";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AdminCommandButton extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Button)
    button: cc.Button = null;

    @property({ type: cc.Enum(ADMIN_COMMANDS) })
    adminCommand: ADMIN_COMMANDS = ADMIN_COMMANDS.CARD

    @property(CCommandInput)
    input: CCommandInput = null

    @property
    text: string = "hello";

    @property
    _inputNode: cc.Node = null

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
                break;
        }
    }

    async doCommand() {
        let extra = null
        if (this.input != null) {
            extra = this.input.getCommandInput()
        }
        await AdminConsole.$.doCommand(this.adminCommand, extra)
    }

    setInput(inputNode: cc.Node) {
        this.input = inputNode.getComponent(CCommandInput)
        this._inputNode = inputNode
        this.node.children[0].addChild(inputNode)

    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //  this._inputNode = this.node.getChildByName(`input`)
        this.button.node.getComponentInChildren(cc.Label).string = this.getCommandNameByEnumNum(this.adminCommand)
    }

    start() {

    }

    // update (dt) {}
}
