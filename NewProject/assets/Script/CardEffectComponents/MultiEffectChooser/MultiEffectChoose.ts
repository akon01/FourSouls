import ChooseNumber from "../../Entites/ChooseNumber";

import Effect from "../CardEffects/Effect";
import CardPreview from "../../Entites/CardPreview";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import Card from "../../Entites/GameEntities/Card";
import DataCollector from "../DataCollector/DataCollector";

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
    cc.log(data)

    let preview = CardPreviewManager.addPreview(data.cardPlayed).node
    // if (preview == null) {
    //   preview = CardPreviewManager.cardPreviewPool.get()
    //   preview.setParent(CardPreviewManager.scrollView.content);
    //   preview.getComponent(CardPreview).card = data.cardPlayed;
    //   preview.getComponent(cc.Sprite).spriteFrame = data.cardPlayed.getComponent(Card).frontSprite;
    //   preview.active = true;
    //   preview.opacity = 255;
    // }
    // CardPreviewManager.openPreview(preview)
    let effectChosen = await preview.getComponent(CardPreview).chooseEffectFromCard(data.cardPlayed);

    return effectChosen.getComponent(Effect)
  }
}
