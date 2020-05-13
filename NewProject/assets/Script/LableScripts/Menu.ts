import { ADMIN_COMMANDS, INPUT_TYPE } from "../Constants";
import AdminCommandButton from "../Admin/Admin Command Button";
import AdminConsole from "./Admin Console";
import ServerClient from "../../ServerClient/ServerClient";
import SoundManager from "../Managers/SoundManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    static $: Menu = null

    @property
    currentMenu: string = ''

    @property(cc.Slider)
    BGsoundSlider: cc.Slider = null


    @property(cc.Slider)
    effectSoundSlider: cc.Slider = null

    setAdminMenu() {
        // interface adminCommand { command: ADMIN_COMMANDS, input: INPUT_TYPE }
        // const availableCommands: adminCommand[] = [
        //   { command: ADMIN_COMMANDS.CARD, input: INPUT_TYPE.TEXT_INPUT },
        //     { command: ADMIN_COMMANDS.CHARGE, input: INPUT_TYPE.NONE },
        //     { command: ADMIN_COMMANDS.COINS, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.DICE, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.DMG, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.HEAL, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.HP, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.LOG, input: INPUT_TYPE.TEXT_INPUT },
        //     { command: ADMIN_COMMANDS.ROLL, input: INPUT_TYPE.NUMBER_INPUT },
        //     { command: ADMIN_COMMANDS.RUN, input: INPUT_TYPE.TEXT_INPUT },
        //     { command: ADMIN_COMMANDS.SOUL, input: INPUT_TYPE.NONE },
        //     { command: ADMIN_COMMANDS.STACK, input: INPUT_TYPE.NONE },
        //     { command: ADMIN_COMMANDS.STACKTRACE, input: INPUT_TYPE.NONE },
        // ]
        // availableCommands.forEach(command => {
        //     const adminC = cc.instantiate(AdminConsole.$.adminCommandButtonPrefab)
        //     adminC.getComponent(AdminCommandButton).adminCommand = command.command
        //     if (command.input == INPUT_TYPE.NUMBER_INPUT) {
        //         adminC.getComponent(AdminCommandButton).setInput(cc.instantiate(AdminConsole.$.numberInput))
        //     } else if (command.input == INPUT_TYPE.TEXT_INPUT) {
        //         adminC.getComponent(AdminCommandButton).setInput(cc.instantiate(AdminConsole.$.textInput))
        //     }
        //     adminC.setParent(this.node)
        // })



        this.currentMenu = 'AdminMenu'
    }

    setBGSoundVolume() {
        SoundManager.$.setBGVolume(this.BGsoundSlider.progress)
    }

    setEffectsSoundVolume() {
        SoundManager.$.setEffectsVolume(this.BGsoundSlider.progress)
    }


    setSettingsMenu() {
    }

    quitGame() {
        ServerClient.$.onClose()
        cc.director.end()
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Menu.$ = this;
    }

    start() {

    }

    // update (dt) {}
}
