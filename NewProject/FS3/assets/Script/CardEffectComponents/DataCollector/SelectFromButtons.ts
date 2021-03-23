import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { EffectTarget } from "../../Managers/EffectTarget";
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

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    async collectData(data: any) {
        const buttonManager = WrapperProvider.dataCollectorButtonsManager.out;
        for (const buttonToSelectFrom of this.buttonsToSelectFrom) {
            buttonManager.addButton(buttonToSelectFrom.buttonName, buttonToSelectFrom.buttonText)
        }
        const btnSelectedName = await buttonManager.waitForPlayerReaction()
        const effectTarget = new EffectTarget(Number.parseInt(btnSelectedName))
        return effectTarget
    }
}
