
import { _decorator, Component, Node, Layout, Prefab, NodePool, instantiate, Button, EventHandler, SystemEventType, Label } from 'cc';
import { Signal } from '../../Misc/Signal';
import { whevent } from '../../ServerClient/whevent';
import { GAME_EVENTS } from '../Constants';
import { Player } from '../Entites/GameEntities/Player';
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;

type Btn = {
    btnName: string
    btnText: string
}

@ccclass('DataCollectorButtonsManager')
export class DataCollectorButtonsManager extends Component {

    private isOpen = false

    @property(Layout)
    private layout: Layout | null = null

    private childButtons: Btn[] = []

    @property(Prefab)
    private buttonPrefab: Prefab | null = null

    private buttonPool: NodePool = new NodePool()

    private openLayout() {
        this.layout!.node.active = true
        this.isOpen = true
    }

    private closeLayout() {
        this.layout!.node.active = false
        this.isOpen = false
    }

    addButton(btnName: string, btnText: string) {
        const newBtn = this.buttonPool.get()!
        const btnComp = newBtn.getComponent(Button)!

        newBtn.name = btnName
        newBtn.getComponent(Label)!.string = btnText

        this.childButtons.push({ btnName, btnText })
        this.layout?.node.addChild(newBtn)

        newBtn.once(SystemEventType.TOUCH_END, () => {
            const otherBtns = this.node.children!
            for (const btn of otherBtns) {
                btn.off(SystemEventType.TOUCH_END)
            }
            whevent.emit(GAME_EVENTS.DATA_COLLECTOR_BUTTON_PRESSED, newBtn.name)
        }, newBtn)
    }

    removeButton(btnName: string) {
        const foundBtn = this.layout?.node.getChildByName(btnName)
        if (!foundBtn) {
            throw new Error(`No Btn with name ${btnName} found on layout`);
        }
        this.childButtons = this.childButtons.filter(b => b.btnName != btnName)
        this.layout?.node.removeChild(foundBtn)
        this.buttonPool.put(foundBtn)
    }

    clearButtons() {
        const children = this.layout?.node.children ?? []
        this.layout?.node.removeAllChildren()
        for (const child of children) {
            this.buttonPool.put(child)
        }
    }

    start() {
        for (let index = 0; index < 10; index++) {
            const newBtn = instantiate(this.buttonPrefab!)
            this.buttonPool.put(newBtn)
        }
    }

    private async openAndWaitForChoice() {
        if (this.node.children.length == 0) {
            throw new Error("Cant Open Button Data Collector, NO Buttons Added");
        }
        this.openLayout()
        const chosenButtonName = await this.waitForPlayerReaction()
        this.closeLayout()
        this.clearButtons()
        return chosenButtonName
    }

    async givePlayerChoice(player: Player, sendToServer: boolean) {
        if (sendToServer) {
            if (player.me) {
                return await this.openAndWaitForChoice()
            } else {
                const mePlayerId = WrapperProvider.playerManagerWrapper.out.mePlayer?.getComponent(Player)!.playerId;
                WrapperProvider.serverClientWrapper.out.send(Signal.CHOOSE_BUTTON_DATA_COLLECTOR, { playerId: player.playerId, originPlayerId: mePlayerId, currentBtns: this.childButtons })
                return await this.waitForOtherPlayerReaction()
            }
        } else {
            return await this.openAndWaitForChoice()
        }
    }

    private waitForOtherPlayerReaction(): Promise<string> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.DATA_COLLECTOR_BUTTON_PRESSED_OTHER_PLAYER, (btnChosenName: string) => {
                resolve(btnChosenName);
            });
        })
    }

    private waitForPlayerReaction(): Promise<string> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.DATA_COLLECTOR_BUTTON_PRESSED, (btnChosenName: string) => {
                resolve(btnChosenName);
            });
        })
    }

}
