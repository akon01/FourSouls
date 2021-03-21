import { Component, director, Slider, _decorator } from 'cc';
import { WrapperProvider } from '../Managers/WrapperProvider';

const { ccclass, property } = _decorator;


@ccclass('Menu')
export class Menu extends Component {
    @property
    currentMenu: string = ''

    @property(Slider)
    BGsoundSlider: Slider | null = null


    @property(Slider)
    effectSoundSlider: Slider | null = null



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
        //     const adminC = instantiate(adminConsoleWrapper._ac.adminCommandButtonPrefab)
        //     adminC.getComponent(AdminCommandButton).adminCommand = command.command
        //     if (command.input == INPUT_TYPE.NUMBER_INPUT) {
        //         adminC.getComponent(AdminCommandButton).setInput(instantiate(adminConsoleWrapper._ac.numberInput))
        //     } else if (command.input == INPUT_TYPE.TEXT_INPUT) {
        //         adminC.getComponent(AdminCommandButton).setInput(instantiate(adminConsoleWrapper._ac.textInput))
        //     }
        //     adminC.setParent(this.node)
        // })



        this.currentMenu = 'AdminMenu'
    }

    setBGSoundVolume() {
        WrapperProvider.soundManagerWrapper.out.setBGVolume(this.BGsoundSlider!.progress)
    }

    setEffectsSoundVolume() {
        WrapperProvider.soundManagerWrapper.out.setEffectsVolume(this.BGsoundSlider!.progress)
    }


    setSettingsMenu() {
    }

    quitGame() {
        WrapperProvider.serverClientWrapper.out.onClose()
        director.end()
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }


    // update (dt) {}
}
