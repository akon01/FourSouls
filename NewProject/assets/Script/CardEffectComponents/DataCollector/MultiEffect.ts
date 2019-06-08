import ChooseNumber from "../../Entites/ChooseNumber";

import Effect from "../CardEffects/Effect";
import CardPreview from "../../Entites/CardPreview";
import DataCollector from "./DataCollector";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiEffect extends DataCollector {

    collectorName = 'MultiEffect';

    /**
     * 
     * @param data {cardPlayed}
     */
    async collectData(cardPlayed: cc.Node): Promise<Effect> {

        let cardPreview = cc.find('Canvas/CardPreview').getComponent(CardPreview);
        let effectChosen = await cardPreview.chooseEffectFromCard(cardPlayed)

        return new Promise<Effect>((resolve, reject) => {
            resolve(effectChosen.getComponent(Effect));
        })
    }

}
