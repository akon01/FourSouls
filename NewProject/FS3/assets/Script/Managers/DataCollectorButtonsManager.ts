
import { _decorator, Component, Node, Layout, Prefab, NodePool, instantiate, Button, EventHandler, SystemEventType, Label } from 'cc';
import { whevent } from '../../ServerClient/whevent';
import { GAME_EVENTS } from '../Constants';
const { ccclass, property } = _decorator;

@ccclass('DataCollectorButtonsManager')
export class DataCollectorButtonsManager extends Component {

    private isOpen: boolean = false

    @property(Layout)
    private layout: Layout | null = null

    private childButtons = []

    @property(Prefab)
    private buttonPrefab: Prefab | null = null

    private buttonPool: NodePool = new NodePool()

    openLayout() {
        this.layout!.node.active = true
        this.isOpen = true
    }

    closeLayout() {
        this.layout!.node.active = false
        this.isOpen = false
    }

    addButton(btnName: string, btntext: string) {
        const newBtn = this.buttonPool.get()!
        const btnComp = newBtn.getComponent(Button)!

        newBtn.name = btnName
        newBtn.getComponent(Label)!.string = btntext

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

    waitForPlayerReaction(): Promise<string> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.DATA_COLLECTOR_BUTTON_PRESSED, (btnChosenName: string) => {
                resolve(btnChosenName);
            });
        })
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}
