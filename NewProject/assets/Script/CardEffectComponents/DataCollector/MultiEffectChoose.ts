import ChooseNumber from "../../Entites/ChooseNumber";

import Effect from "../CardEffects/Effect";
import CardPreview from "../../Entites/CardPreview";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiEffectChoose extends DataCollector {
  collectorName = "MultiEffectChoose";

  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: cc.Node;
    cardPlayerId: number;
  }): Promise<Effect> {
    let cardPreview = cc.find("Canvas/CardPreview").getComponent(CardPreview);
    let effectChosen = await cardPreview.chooseEffectFromCard(data.cardPlayed);

    return new Promise<Effect>((resolve, reject) => {
      resolve(effectChosen.getComponent(Effect));
    });
  }
}
