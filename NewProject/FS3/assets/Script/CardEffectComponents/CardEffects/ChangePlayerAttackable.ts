import { CCInteger, Enum, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;




@ccclass('ChangePlayerAttackable')
export class ChangePlayerAttackable extends Effect {
    effectName = "ChangePlayerAttackable";

    @property
    isMakeAttackable = true

    @property({
        type: CCInteger, visible: function (this: ChangePlayerAttackable) {
            return this.isMakeAttackable
        }
    })
    rollValueToSet = 4


    /**
     *
     * @param data {target:PlayerId}
     */
    async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
        if (!data) { debugger; throw new Error("No Data"); }
        const targetPlayerCards = data.getTargets(TARGETTYPE.PLAYER) as Node[]
        if (targetPlayerCards.length == 0) {
            throw new Error(`No Target Players!`)
        }
        for (const player of targetPlayerCards) {
            this.handlePlayer(player);
        }

        if (data instanceof PassiveEffectData) { return data }
        return WrapperProvider.stackWrapper.out._currentStack
    }

    private handlePlayer(player: Node) {
        const playerComp = player.getComponent(Player)!;
        if (this.isMakeAttackable) {
            playerComp.setCanBeAttacked(true, true, 4)

        } else {
            playerComp.setCanBeAttacked(false, true, 1)
        }
    }
}