import { ADMIN_COMMANDS, INPUT_TYPE } from "../Constants";
import AdminCommandButton from "../Admin/Admin Command Button";
import { start } from "repl";
import AdminConsole from "./Admin Console";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Menu extends cc.Component {


    @property
    currentMenu: string = ''

    setAdminMenu() {
        interface adminCommand { command: ADMIN_COMMANDS, input: INPUT_TYPE }
        const availableCommands: adminCommand[] = [
            { command: ADMIN_COMMANDS.CARD, input: INPUT_TYPE.TEXT_INPUT },
            { command: ADMIN_COMMANDS.CHARGE, input: INPUT_TYPE.NONE },
            { command: ADMIN_COMMANDS.COINS, input: INPUT_TYPE.NUMBER_INPUT },
            { command: ADMIN_COMMANDS.DICE, input: INPUT_TYPE.NUMBER_INPUT },
            { command: ADMIN_COMMANDS.DMG, input: INPUT_TYPE.NUMBER_INPUT },
            { command: ADMIN_COMMANDS.HEAL, input: INPUT_TYPE.NUMBER_INPUT },
            { command: ADMIN_COMMANDS.HP, input: INPUT_TYPE.NUMBER_INPUT },
            { command: ADMIN_COMMANDS.LOG, input: INPUT_TYPE.TEXT_INPUT },
            { command: ADMIN_COMMANDS.ROLL, input: INPUT_TYPE.NUMBER_INPUT },
            { command: ADMIN_COMMANDS.RUN, input: INPUT_TYPE.TEXT_INPUT },
            { command: ADMIN_COMMANDS.SOUL, input: INPUT_TYPE.NONE },
            { command: ADMIN_COMMANDS.STACK, input: INPUT_TYPE.NONE },
            { command: ADMIN_COMMANDS.STACKTRACE, input: INPUT_TYPE.NONE },
        ]
        availableCommands.forEach(command => {
            const adminC = cc.instantiate(AdminConsole.$.adminCommandButtonPrefab)
            adminC.getComponent(AdminCommandButton).adminCommand = command.command
            if (command.input == INPUT_TYPE.NUMBER_INPUT) {
                adminC.getComponent(AdminCommandButton).setInput(cc.instantiate(AdminConsole.$.numberInput))
            } else if (command.input == INPUT_TYPE.TEXT_INPUT) {
                adminC.getComponent(AdminCommandButton).setInput(cc.instantiate(AdminConsole.$.textInput))
            }
            adminC.setParent(this.node)
        })
        this.currentMenu = 'AdminMenu'
    }

    setSettingsMenu() {

    }

    quitGame() {
        cc.director.end()
    }
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
