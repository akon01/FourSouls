import ChooseNumber from "../../Entites/ChooseNumber";

import Effect from "../CardEffects/Effect";
import CardPreview from "../../Entites/CardPreview";
import DataCollector from "./DataCollector";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import CardPlayer from "./ChooseAPlayer";
import Card from "../../Entites/GameEntities/Card";

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
    let preview = CardPreviewManager.getPreviewByCard(data.cardPlayed)
    if (preview == null) {
      preview = CardPreviewManager.cardPreviewPool.get()
      preview.setParent(CardPreviewManager.scrollView.content);
      preview.getComponent(CardPreview).card = data.cardPlayed;
      preview.getComponent(cc.Sprite).spriteFrame = data.cardPlayed.getComponent(Card).frontSprite;
      preview.active = true;
      preview.opacity = 255;
    }
    // CardPreviewManager.openPreview(preview)
    let effectChosen = await preview.getComponent(CardPreview).chooseEffectFromCard(data.cardPlayed);

    return new Promise<Effect>((resolve, reject) => {
      resolve(effectChosen.getComponent(Effect));
    });
  }
}
