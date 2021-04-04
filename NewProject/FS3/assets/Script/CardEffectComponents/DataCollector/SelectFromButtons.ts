import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { Player } from '../../Entites/GameEntities/Player';
import { EffectTarget } from "../../Managers/EffectTarget";
import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;

@ccclass("ButtonSelectInfo")
class ButtonSelectInfo {
    @property
    buttonName: string = ""
    @property
    buttonText: string = ""
}

@ccclass('SelectFromButtons')
export class SelectFromButtons extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'SelectFromButtons';

    @property([ButtonSelectInfo])
    buttonsToSelectFrom: ButtonSelectInfo[] = []

    @property
    isOtherPlayerChoosing: boolean = false

    @property({
        type: DataCollector, visible: function (this: SelectFromButtons) {
            return this.isOtherPlayerChoosing
        }
    })
    otherPlayerToChooseDataCollector: DataCollector | null = null

    /**
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    async collectData(data: any) {
        const buttonManager = WrapperProvider.dataCollectorButtonsManager.out;
        for (const buttonToSelectFrom of this.buttonsToSelectFrom) {
            buttonManager.addButton(buttonToSelectFrom.buttonName, buttonToSelectFrom.buttonText)
        }
        const playerManager = WrapperProvider.playerManagerWrapper.out;
        let player = playerManager.mePlayer?.getComponent(Player)!
        if (this.isOtherPlayerChoosing) {
            player = playerManager.getPlayerByCard((await this.otherPlayerToChooseDataCollector?.collectData(data)! as EffectTarget).effectTargetCard)!
        }
        const btnSelectedName = await buttonManager.givePlayerChoice(player, true)
        const effectTarget = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(Number.parseInt(btnSelectedName))
        return effectTarget
    }
}
